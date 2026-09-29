// Preferências em localStorage. Falhas (modo privado, quota) nunca partem a app.
const K = {
  perfil: 'cofrinho.perfil',
  modo: 'cofrinho.modo',
  tema: 'cofrinho.tema',
  foto: 'cofrinho.foto',
  token: 'cofrinho.token',
  dono: 'cofrinho.donoDados',
  ultimoSync: 'cofrinho.ultimoSync'
}
const LEGADO = ['cofrinho.senhaHash'] // da versão sem servidor

function ler(chave, padrao = null) {
  try {
    const v = localStorage.getItem(chave)
    return v === null ? padrao : JSON.parse(v)
  } catch {
    return padrao
  }
}
function escrever(chave, valor) {
  try {
    localStorage.setItem(chave, JSON.stringify(valor))
    return true
  } catch {
    return false
  }
}
function remover(chave) {
  try { localStorage.removeItem(chave) } catch { /* ignora */ }
}

// ---- Sessão (persistente: o token fica no dispositivo) ----
export const getToken = () => ler(K.token)
export const setToken = (t) => escrever(K.token, t)
export const temSessao = () => !!getToken()
export const getPerfil = () => ler(K.perfil)
export const setPerfil = (p) => escrever(K.perfil, p)
// Termina a sessão neste dispositivo. Os dados financeiros ficam guardados.
export function limparSessao() {
  remover(K.token)
  remover(K.perfil)
}
export const limparLegado = () => LEGADO.forEach(remover)

// A quem pertencem os dados guardados neste dispositivo (email da conta)
export const getDonoDados = () => ler(K.dono)
export const setDonoDados = (email) => escrever(K.dono, email)

// Marca da última sincronização (devolvida pelo servidor)
export const getUltimoSync = () => ler(K.ultimoSync)
export const setUltimoSync = (v) => (v ? escrever(K.ultimoSync, v) : remover(K.ultimoSync))

export const getModo = () => ler(K.modo, 'pessoal')
export const setModo = (m) => escrever(K.modo, m)

export const getTema = () => ler(K.tema, false)
export const setTema = (escuro) => escrever(K.tema, !!escuro)

// A foto fica só neste dispositivo
export const getFoto = () => ler(K.foto)
export const setFoto = (dataUrl) => escrever(K.foto, dataUrl)
export const limparFoto = () => remover(K.foto)

export function aplicarTema(escuro) {
  document.documentElement.classList.toggle('dark', !!escuro)
  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) meta.setAttribute('content', escuro ? '#100D12' : '#EC5C82')
}
