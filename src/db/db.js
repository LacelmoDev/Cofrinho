import Dexie from 'dexie'
import { v4 as uuid } from 'uuid'
import { CATEGORIA_POUPANCA, ESCOPO } from '../utils/constants'
import { avisarMudanca } from '../sync/eventos'

export const db = new Dexie('cofrinho-ao')

db.version(1).stores({
  transacoes: 'id, tipo, categoria, modo, data',
  categorias: 'id, tipo, escopo, nome',
  metas: 'id, nome'
})

// v2: cada registo passa a ter atualizadoEm, apagado (não se apaga de verdade) e pendente (1 = falta enviar).
db.version(2)
  .stores({
    transacoes: 'id, tipo, categoria, modo, data, pendente',
    categorias: 'id, tipo, escopo, nome, pendente',
    metas: 'id, nome, pendente'
  })
  .upgrade(async (tx) => {
    const agora = new Date().toISOString()
    const marcar = (r) => { r.atualizadoEm = agora; r.apagado = false; r.pendente = 1 }
    await tx.table('transacoes').toCollection().modify(marcar)
    await tx.table('metas').toCollection().modify(marcar)
    // As categorias padrão existem em todos os dispositivos e não se sincronizam.
    await tx.table('categorias').toCollection().modify((c) => { marcar(c); if (c.padrao) c.pendente = 0 })
  })

const agora = () => new Date().toISOString()
const EPOCA_PADRAO = '2026-01-01T00:00:00.000Z'

const PADRAO = [
  ...['Alimentação', 'Transporte', 'Casa', 'Lazer', 'Saúde', 'Outros', 'Poupança'].map((nome) => ({ nome, tipo: 'gasto', escopo: 'ambos' })),
  ...['Salário', 'Venda', 'Outros'].map((nome) => ({ nome, tipo: 'receita', escopo: 'ambos' })),
  ...['Fornecedores', 'Salários (equipa)', 'Impostos', 'Equipamento'].map((nome) => ({ nome, tipo: 'gasto', escopo: 'negocio' })),
  ...['Vendas', 'Serviços prestados'].map((nome) => ({ nome, tipo: 'receita', escopo: 'negocio' }))
]

// Idempotente: só insere o que ainda não existe (mesmo nome+tipo+escopo padrão).
export async function semearCategoriasPadrao() {
  await db.transaction('rw', db.categorias, async () => {
    const existentes = await db.categorias.toArray()
    const chave = (c) => `${c.nome}|${c.tipo}|${c.escopo}`
    const jaTem = new Set(existentes.filter((c) => c.padrao).map(chave))
    const novas = PADRAO.filter((c) => !jaTem.has(chave(c))).map((c) => ({
      id: uuid(), ...c, padrao: true, atualizadoEm: EPOCA_PADRAO, apagado: false, pendente: 0
    }))
    if (novas.length) await db.categorias.bulkAdd(novas)
  })
}

// ---------- Leitura (ignora o que foi apagado) ----------
export const transacoesAtivas = () => db.transacoes.filter((t) => !t.apagado).toArray()
export const categoriasAtivas = () => db.categorias.filter((c) => !c.apagado).toArray()
export const metasAtivas = () => db.metas.filter((m) => !m.apagado).toArray()

const alterado = () => ({ atualizadoEm: agora(), pendente: 1 })

// ---------- Transacções ----------
export async function listarTransacoes() {
  return (await transacoesAtivas()).sort((a, b) => new Date(b.data) - new Date(a.data))
}

export async function adicionarTransacao({ tipo, valor, descricao = '', categoria, modo, data }) {
  const t = {
    id: uuid(), tipo, valor: Number(valor), data: data || agora(), descricao: descricao.trim(),
    categoria, modo, apagado: false, ...alterado()
  }
  await db.transacoes.add(t)
  avisarMudanca()
  return t
}
export async function atualizarTransacao(id, campos) {
  await db.transacoes.update(id, { ...campos, ...alterado() })
  avisarMudanca()
}
export async function apagarTransacao(id) {
  await db.transacoes.update(id, { apagado: true, ...alterado() })
  avisarMudanca()
}

// ---------- Categorias ----------
// Visível se escopo === 'ambos' OU escopo === modo actual.
export async function listarCategorias(modo, tipo) {
  const todas = await categoriasAtivas()
  return todas
    .filter((c) => (c.escopo === ESCOPO.AMBOS || c.escopo === modo) && (!tipo || c.tipo === tipo))
    .sort((a, b) => a.nome.localeCompare(b.nome, 'pt'))
}
export async function adicionarCategoria({ nome, tipo, escopo }) {
  const c = { id: uuid(), nome: nome.trim(), tipo, escopo, padrao: false, apagado: false, ...alterado() }
  await db.categorias.add(c)
  avisarMudanca()
  return c
}
export async function apagarCategoria(id) {
  await db.categorias.update(id, { apagado: true, ...alterado() })
  avisarMudanca()
}

// ---------- Metas ----------
export const listarMetas = () => metasAtivas()
export async function adicionarMeta({ nome, valorAlvo, dataAlvo }) {
  const m = { id: uuid(), nome: nome.trim(), valorAlvo: Number(valorAlvo), valorAtual: 0, dataAlvo: dataAlvo || null, apagado: false, ...alterado() }
  await db.metas.add(m)
  avisarMudanca()
  return m
}
export async function atualizarMeta(id, campos) {
  await db.metas.update(id, { ...campos, ...alterado() })
  avisarMudanca()
}
export async function apagarMeta(id) {
  await db.metas.update(id, { apagado: true, ...alterado() })
  avisarMudanca()
}

// Regra crítica: adicionar a uma meta cria um gasto "Poupança" e actualiza a meta, tudo ou nada.
export async function adicionarPoupancaAMeta({ metaId, valor, modo }) {
  await db.transaction('rw', db.transacoes, db.metas, async () => {
    const meta = await db.metas.get(metaId)
    if (!meta || meta.apagado) throw new Error('Meta não encontrada.')
    await db.transacoes.add({
      id: uuid(), tipo: 'gasto', valor: Number(valor), data: agora(), descricao: `Poupança: ${meta.nome}`,
      categoria: CATEGORIA_POUPANCA, modo, apagado: false, ...alterado()
    })
    await db.metas.update(metaId, { valorAtual: meta.valorAtual + Number(valor), ...alterado() })
  })
  avisarMudanca()
}

// ---------- Sincronização ----------
export async function contarPendentes() {
  const [a, b, c] = await Promise.all([
    db.transacoes.where('pendente').equals(1).count(),
    db.categorias.where('pendente').equals(1).count(),
    db.metas.where('pendente').equals(1).count()
  ])
  return a + b + c
}

// Quando entra outra conta neste dispositivo, os dados da anterior saem.
export async function limparDadosLocais() {
  await db.transaction('rw', db.transacoes, db.categorias, db.metas, async () => {
    await Promise.all([db.transacoes.clear(), db.categorias.clear(), db.metas.clear()])
  })
  await semearCategoriasPadrao()
}
