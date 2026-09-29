// Pequeno "barramento" para ligar a base de dados, o motor de sincronização e a interface,
// sem imports circulares.
const ouvintesMudanca = new Set()
export const avisarMudanca = () => ouvintesMudanca.forEach((f) => f())
export function aoHaverMudanca(f) {
  ouvintesMudanca.add(f)
  return () => ouvintesMudanca.delete(f)
}

let estado = { fase: 'parado', ultimoSync: null, erro: null }
const observadores = new Set()
export const getEstadoSync = () => estado
export function setEstadoSync(parcial) {
  estado = { ...estado, ...parcial }
  observadores.forEach((f) => f(estado))
}
export function observarEstadoSync(f) {
  observadores.add(f)
  return () => observadores.delete(f)
}

let aoSessaoInvalida = null
export const registarSessaoInvalida = (f) => { aoSessaoInvalida = f }
export const sessaoInvalida = () => { if (aoSessaoInvalida) aoSessaoInvalida() }
