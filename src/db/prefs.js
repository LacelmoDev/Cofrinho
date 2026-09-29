// Preferências em localStorage. Falhas (modo privado, quota) nunca partem a app.
const K = {
  perfil: 'cofrinho.perfil',
  senha: 'cofrinho.senhaHash',
  modo: 'cofrinho.modo',
  tema: 'cofrinho.tema',
  foto: 'cofrinho.foto'
}

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

export const getPerfil = () => ler(K.perfil)
// FUTURO: estadoAssinatura passará a vir do backend (Multicaixa Express via AppyPay/ProxyPay) na v1.1.
// Na v1 é sempre "gratuito" e nada é bloqueado.
export const setPerfil = (p) => escrever(K.perfil, { ...p, estadoAssinatura: 'gratuito' })
export const getSenhaHash = () => ler(K.senha)
export const setSenhaHash = (h) => escrever(K.senha, h)
export const onboardingFeito = () => !!getPerfil() && !!getSenhaHash()

export const getModo = () => ler(K.modo, 'pessoal')
export const setModo = (m) => escrever(K.modo, m)

export const getTema = () => ler(K.tema, false)
export const setTema = (escuro) => escrever(K.tema, !!escuro)

export const getFoto = () => ler(K.foto)
export const setFoto = (dataUrl) => escrever(K.foto, dataUrl)

// "Esqueci a senha": limpa só perfil/senha/foto. Não toca na IndexedDB.
export function limparConta() {
  remover(K.perfil)
  remover(K.senha)
  remover(K.foto)
}

export function aplicarTema(escuro) {
  document.documentElement.classList.toggle('dark', !!escuro)
  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) meta.setAttribute('content', escuro ? '#100D12' : '#EC5C82')
}
