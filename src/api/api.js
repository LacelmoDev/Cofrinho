import { getToken } from '../db/prefs'
import { sessaoInvalida } from '../sync/eventos'

// Endereço da API. Para outro servidor: variável VITE_API_URL (ex.: no ficheiro .env.local).
// Aceita o endereço com ou sem "/api" no fim (um erro comum ao configurar o .env.local).
const BASE = (import.meta.env?.VITE_API_URL || 'https://cofrinho-api-ru5z.onrender.com/api').trim().replace(/\/+$/, '')
export const API_URL = /\/api$/.test(BASE) ? BASE : `${BASE}/api`

export class ErroApi extends Error {
  constructor(mensagem, { codigo = 'erro', status = 0, dados = null } = {}) {
    super(mensagem)
    this.codigo = codigo
    this.status = status
    this.dados = dados
  }
}

export async function pedir(metodo, caminho, corpo, { auth = true, timeout = 45000 } = {}) {
  const ctrl = new AbortController()
  const temporizador = setTimeout(() => ctrl.abort(), timeout)
  const headers = { 'Content-Type': 'application/json' }
  const token = auth ? getToken() : null
  if (token) headers.Authorization = `Bearer ${token}`

  let resposta
  try {
    resposta = await fetch(`${API_URL}${caminho}`, {
      method: metodo,
      headers,
      body: corpo === undefined ? undefined : JSON.stringify(corpo),
      signal: ctrl.signal
    })
  } catch (e) {
    throw new ErroApi(
      e.name === 'AbortError'
        ? 'O servidor demorou demasiado a responder. Tenta outra vez.'
        : `Sem ligação ao servidor. Verifica a internet.${import.meta.env?.DEV ? ` (a app tentou ${API_URL} — se estás em localhost, confirma o endereço da API e o CORS)` : ''}`,
      { codigo: 'rede' }
    )
  } finally {
    clearTimeout(temporizador)
  }

  let dados = null
  let texto = ''
  if (resposta.status !== 204) {
    texto = await resposta.text().catch(() => '')
    try { dados = JSON.parse(texto) } catch { /* corpo vazio ou não-JSON (ex.: página de erro) */ }
  }
  if (!resposta.ok) {
    if (resposta.status === 401 && token) sessaoInvalida()
    if (!dados?.erro && import.meta.env?.DEV) console.error(`[API] ${metodo} ${API_URL}${caminho} -> HTTP ${resposta.status}`, texto.slice(0, 500))
    throw new ErroApi(dados?.erro || `Ocorreu um erro (código ${resposta.status}). Tenta outra vez.`, { codigo: dados?.codigo || 'erro', status: resposta.status, dados })
  }
  return dados
}

export const api = {
  get: (c, o) => pedir('GET', c, undefined, o),
  post: (c, corpo, o) => pedir('POST', c, corpo ?? {}, o),
  patch: (c, corpo, o) => pedir('PATCH', c, corpo, o)
}

// O plano gratuito do Render "adormece". Um pedido à partida acorda-o enquanto o utilizador vê o ecrã.
export const acordarServidor = () => { fetch(`${API_URL}/saude/`).catch(() => {}) }

export function nomeDispositivo() {
  const nav = typeof navigator !== 'undefined' ? navigator : {}
  const plataforma = nav.userAgentData?.platform || nav.platform || 'web'
  return `Cofrinho AO (${plataforma})`.slice(0, 100)
}
