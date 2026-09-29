import { db } from '../db/db'
import { api } from '../api/api'
import { getToken, getUltimoSync, setUltimoSync } from '../db/prefs'
import { getEstadoSync, setEstadoSync } from './eventos'

const TAM_LOTE = 500
const COLECOES = [
  ['categorias', db.categorias],
  ['transacoes', db.transacoes],
  ['metas', db.metas]
]

const tempo = (iso) => Date.parse(iso)
const semPendente = ({ pendente, ...resto }) => resto // eslint-disable-line no-unused-vars

async function lerPendentes() {
  const lote = {}
  let temMais = false
  for (const [nome, tabela] of COLECOES) {
    let regs = await tabela.where('pendente').equals(1).toArray()
    if (nome === 'categorias') regs = regs.filter((c) => !c.padrao) // as padrão não se sincronizam
    if (regs.length > TAM_LOTE) temMais = true
    lote[nome] = regs.slice(0, TAM_LOTE)
  }
  return { lote, temMais }
}

// Regra: a alteração mais recente ganha. Uma alteração local ainda por enviar, e mais recente, mantém-se.
async function aplicarRecebido(tabela, rec) {
  const local = await tabela.get(rec.id)
  if (local && local.pendente === 1 && tempo(local.atualizadoEm) >= tempo(rec.atualizadoEm)) return
  await tabela.put({ ...rec, pendente: 0 })
}

async function umaRonda() {
  if (!getToken()) return { ok: false, motivo: 'sem_sessao' }
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    setEstadoSync({ fase: 'offline' })
    return { ok: false, motivo: 'offline' }
  }
  setEstadoSync({ fase: 'a_sincronizar', erro: null })
  try {
    for (let i = 0; i < 50; i++) {
      const { lote, temMais } = await lerPendentes()
      const corpo = {
        desde: getUltimoSync(),
        categorias: lote.categorias.map(semPendente),
        transacoes: lote.transacoes.map(semPendente),
        metas: lote.metas.map(semPendente)
      }
      const resp = await api.post('/sync/', corpo, { timeout: 60000 })

      await db.transaction('rw', db.categorias, db.transacoes, db.metas, async () => {
        for (const [nome, tabela] of COLECOES) {
          for (const rec of resp[nome] || []) await aplicarRecebido(tabela, rec)
        }
        // Dá por enviado tudo o que seguiu, se não foi alterado entretanto.
        for (const [nome, tabela] of COLECOES) {
          for (const enviado of lote[nome]) {
            const local = await tabela.get(enviado.id)
            if (local && local.pendente === 1 && tempo(local.atualizadoEm) === tempo(enviado.atualizadoEm)) {
              await tabela.update(enviado.id, { pendente: 0 })
            }
          }
        }
      })
      const rej = resp.rejeitados || {}
      if (Object.values(rej).some((l) => l.length)) console.warn('Registos rejeitados pelo servidor:', rej)

      setUltimoSync(resp.servidorAgora)
      if (!temMais) break
    }
    setEstadoSync({ fase: 'ok', ultimoSync: new Date().toISOString(), erro: null })
    return { ok: true }
  } catch (e) {
    setEstadoSync({ fase: e.codigo === 'rede' ? 'offline' : 'erro', erro: e.message })
    return { ok: false, erro: e }
  }
}

// Uma sincronização de cada vez. Se pedirem outra durante uma, repete no fim.
let emCurso = null
let repetir = false
export function sincronizar() {
  if (emCurso) {
    repetir = true
    return emCurso
  }
  emCurso = (async () => {
    try {
      let r = await umaRonda()
      while (repetir && r.ok) {
        repetir = false
        r = await umaRonda()
      }
      return r
    } finally {
      emCurso = null
      repetir = false
    }
  })()
  return emCurso
}

export { getEstadoSync }
