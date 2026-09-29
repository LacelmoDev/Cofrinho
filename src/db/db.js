import Dexie from 'dexie'
import { v4 as uuid } from 'uuid'
import { ESCOPO } from '../utils/constants'

export const db = new Dexie('cofrinho-ao')

db.version(1).stores({
  transacoes: 'id, tipo, categoria, modo, data',
  categorias: 'id, tipo, escopo, nome',
  metas: 'id, nome'
})

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
    const novas = PADRAO.filter((c) => !jaTem.has(chave(c))).map((c) => ({ id: uuid(), ...c, padrao: true }))
    if (novas.length) await db.categorias.bulkAdd(novas)
  })
}

// ---------- Transacções ----------
export const listarTransacoes = () => db.transacoes.orderBy('data').reverse().toArray()

export async function adicionarTransacao({ tipo, valor, descricao = '', categoria, modo, data }) {
  const t = { id: uuid(), tipo, valor: Number(valor), data: data || new Date().toISOString(), descricao: descricao.trim(), categoria, modo }
  await db.transacoes.add(t)
  return t
}
export const atualizarTransacao = (id, campos) => db.transacoes.update(id, campos)
export const apagarTransacao = (id) => db.transacoes.delete(id)

// ---------- Categorias ----------
// Visível se escopo === 'ambos' OU escopo === modo actual.
export async function listarCategorias(modo, tipo) {
  const todas = await db.categorias.toArray()
  return todas
    .filter((c) => (c.escopo === ESCOPO.AMBOS || c.escopo === modo) && (!tipo || c.tipo === tipo))
    .sort((a, b) => a.nome.localeCompare(b.nome, 'pt'))
}
export async function adicionarCategoria({ nome, tipo, escopo }) {
  const c = { id: uuid(), nome: nome.trim(), tipo, escopo, padrao: false }
  await db.categorias.add(c)
  return c
}
export const apagarCategoria = (id) => db.categorias.delete(id)

// ---------- Metas ----------
export const listarMetas = () => db.metas.toArray()
export async function adicionarMeta({ nome, valorAlvo, dataAlvo }) {
  const m = { id: uuid(), nome: nome.trim(), valorAlvo: Number(valorAlvo), valorAtual: 0, dataAlvo: dataAlvo || null }
  await db.metas.add(m)
  return m
}
export const atualizarMeta = (id, campos) => db.metas.update(id, campos)
export const apagarMeta = (id) => db.metas.delete(id)
