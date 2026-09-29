export const TIPO = { GASTO: 'gasto', RECEITA: 'receita' }
export const MODO = { PESSOAL: 'pessoal', NEGOCIO: 'negocio' }
export const ESCOPO = { AMBOS: 'ambos', PESSOAL: 'pessoal', NEGOCIO: 'negocio' }
export const PERIODO = { HOJE: 'hoje', SEMANA: 'semana', MES: 'mes', TUDO: 'tudo' }
export const ABAS = { INICIO: 'inicio', GRAFICO: 'grafico', METAS: 'metas', DEFINICOES: 'definicoes' }
export const CATEGORIA_POUPANCA = 'Poupança'

// Terminologia por modo (secção 7.8)
export const Termos = {
  pessoal: {
    saldo: 'Saldo actual',
    entradas: 'Entradas',
    saidas: 'Saídas',
    gasto: 'Gasto',
    novoGasto: '+ Gasto',
    novaReceita: '+ Receita',
    graficoTitulo: 'Gastos por categoria',
    rotulo: 'Pessoal'
  },
  negocio: {
    saldo: 'Lucro actual',
    entradas: 'Faturação',
    saidas: 'Despesas',
    gasto: 'Despesa',
    novoGasto: '+ Despesa',
    novaReceita: '+ Receita do negócio',
    graficoTitulo: 'Despesas por categoria',
    rotulo: 'Negócio'
  }
}

// 12500 -> "12.500 Kz" (sem casas decimais)
export function formatarMoeda(valor) {
  const n = Math.round(Number(valor) || 0)
  const negativo = n < 0
  const texto = Math.abs(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return `${negativo ? '-' : ''}${texto} Kz`
}

// ISO -> dd/mm/aaaa
export function formatarData(iso) {
  const d = new Date(iso)
  if (isNaN(d)) return ''
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  return `${dd}/${mm}/${d.getFullYear()}`
}

// Aceita vírgula ou ponto: "1.500,50" ou "1500,5" -> número
export function parseValor(texto) {
  if (typeof texto === 'number') return texto
  const limpo = String(texto).trim().replace(/\s/g, '')
  const normal = limpo.includes(',') ? limpo.replace(/\./g, '').replace(',', '.') : limpo
  const n = parseFloat(normal)
  return isNaN(n) ? 0 : n
}

// Validação simples de email: precisa de "@" e de "." depois do "@"
export function emailValido(email) {
  const e = String(email).trim()
  const arroba = e.indexOf('@')
  return arroba > 0 && e.indexOf('.', arroba) > arroba + 1 && !e.endsWith('.') && !/\s/.test(e)
}

// Filtro de período (semana = segunda a domingo)
export function dentroDoPeriodo(iso, periodo, agora = new Date()) {
  if (periodo === PERIODO.TUDO) return true
  const d = new Date(iso)
  if (periodo === PERIODO.HOJE) return d.toDateString() === agora.toDateString()
  if (periodo === PERIODO.MES) return d.getMonth() === agora.getMonth() && d.getFullYear() === agora.getFullYear()
  if (periodo === PERIODO.SEMANA) {
    const inicio = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate())
    const diaSemana = (inicio.getDay() + 6) % 7 // segunda = 0
    inicio.setDate(inicio.getDate() - diaSemana)
    const fim = new Date(inicio)
    fim.setDate(fim.getDate() + 7)
    return d >= inicio && d < fim
  }
  return true
}

// Limite razoável para um valor introduzido (evita números que não cabem no ecrã)
export const VALOR_MAXIMO = 999999999999
export const MSG_VALOR_MAXIMO = 'Valor demasiado grande.'
