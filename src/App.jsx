import { useCallback, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { CloudOff, RefreshCw } from 'lucide-react'
import { limparDadosLocais, semearCategoriasPadrao } from './db/db'
import {
  aplicarTema, getTema, setTema as guardarTema, getModo, setModo as guardarModo,
  getPerfil, setPerfil, getFoto, limparFoto, getToken, setToken, limparSessao, limparLegado,
  getDonoDados, setDonoDados, setUltimoSync
} from './db/prefs'
import { api, acordarServidor } from './api/api'
import { sincronizar } from './sync/sync'
import { aoHaverMudanca, getEstadoSync, observarEstadoSync, registarSessaoInvalida } from './sync/eventos'
import { ABAS, MODO, Termos } from './utils/constants'
import BottomNav from './components/BottomNav'
import SideNav from './components/SideNav'
import Modal from './components/Modal'
import Toast from './components/Toast'
import { Porquinho } from './components/EmptyState'
import Onboarding from './screens/Onboarding'
import Login from './screens/Login'
import Inicio from './screens/Inicio'
import Graficos from './screens/Graficos'
import Metas from './screens/Metas'
import Definicoes from './screens/Definicoes'

const espera = (ms) => new Promise((r) => setTimeout(r, ms))

export default function App() {
  // 'carregar' | 'onboarding' | 'login' | 'app'
  const [ecra, setEcra] = useState('carregar')
  const [aba, setAba] = useState(ABAS.INICIO)
  const [modo, setModo] = useState(MODO.PESSOAL)
  const [escuro, setEscuro] = useState(false)
  const [perfil, setPerfilEstado] = useState(null)
  const [foto, setFotoEstado] = useState(null)
  const [toast, setToast] = useState(null)
  const [avisoLogin, setAvisoLogin] = useState('')
  const [confirmarSair, setConfirmarSair] = useState(false)
  const [aSair, setASair] = useState(false)
  const [promptInstalar, setPromptInstalar] = useState(null)
  const [estadoSync, setEstadoSync] = useState(getEstadoSync())

  useEffect(() => observarEstadoSync(setEstadoSync), [])

  // Arranque: tema, categorias, e sessão guardada (o login persiste neste dispositivo)
  useEffect(() => {
    let vivo = true
    async function iniciar() {
      const tema = getTema()
      setEscuro(tema)
      aplicarTema(tema) // (1) tema guardado
      limparLegado()
      await semearCategoriasPadrao() // (2) categorias padrão (idempotente)
      setModo(getModo()) // (4) modo guardado
      if (navigator.onLine) acordarServidor() // o servidor gratuito adormece: acorda-o já
      const comSessao = !!getToken() // (3) com sessão entra logo; sem sessão vai ao Login
      if (comSessao) {
        setPerfilEstado(getPerfil())
        setFotoEstado(getFoto())
      }
      await espera(700)
      if (vivo) setEcra(comSessao ? 'app' : 'login')
    }
    iniciar()
    return () => { vivo = false }
  }, [])

  // Se o servidor disser que a sessão já não vale, volta ao Login
  useEffect(() => {
    registarSessaoInvalida(() => {
      limparSessao()
      setPerfilEstado(null)
      setAvisoLogin('A tua sessão terminou. Entra outra vez.')
      setEcra('login')
    })
  }, [])

  // PWA: guarda o evento de instalação para o botão em Definições
  useEffect(() => {
    const aoPrompt = (e) => { e.preventDefault(); setPromptInstalar(e) }
    const aoInstalar = () => setPromptInstalar(null)
    window.addEventListener('beforeinstallprompt', aoPrompt)
    window.addEventListener('appinstalled', aoInstalar)
    return () => {
      window.removeEventListener('beforeinstallprompt', aoPrompt)
      window.removeEventListener('appinstalled', aoInstalar)
    }
  }, [])

  // Dentro da app: actualiza o perfil e mantém os dados sincronizados
  const sincronizarJa = useCallback(() => { sincronizar() }, [])
  useEffect(() => {
    if (ecra !== 'app') return
    api.get('/auth/eu/').then((p) => { setPerfil(p); setPerfilEstado(p) }).catch(() => {})
    sincronizarJa()

    let temporizador
    const aposMudanca = () => { clearTimeout(temporizador); temporizador = setTimeout(sincronizarJa, 2500) }
    const semMudancas = aoHaverMudanca(aposMudanca)
    const aoVoltar = () => { if (!document.hidden) sincronizarJa() }
    const intervalo = setInterval(() => { if (!document.hidden) sincronizarJa() }, 60000)
    window.addEventListener('online', sincronizarJa)
    document.addEventListener('visibilitychange', aoVoltar)
    return () => {
      clearTimeout(temporizador)
      clearInterval(intervalo)
      semMudancas()
      window.removeEventListener('online', sincronizarJa)
      document.removeEventListener('visibilitychange', aoVoltar)
    }
  }, [ecra, sincronizarJa])

  async function instalar() {
    if (!promptInstalar) return
    promptInstalar.prompt()
    await promptInstalar.userChoice
    setPromptInstalar(null)
  }

  // Login ou registo concluído no servidor
  async function aoAutenticar({ token, perfil: p }) {
    const email = p.email.toLowerCase()
    const dono = getDonoDados()
    if (dono && dono !== email) {
      // Outra conta usava este dispositivo: os dados dela não podem passar para esta
      await limparDadosLocais()
      setUltimoSync(null)
      limparFoto()
    }
    setDonoDados(email) // sem dono anterior: os dados já existentes passam a ser desta conta
    setToken(token)
    setPerfil(p)
    setPerfilEstado(p)
    setFotoEstado(dono && dono !== email ? null : getFoto())
    setModo(getModo())
    setAba(ABAS.INICIO)
    setAvisoLogin('')
    setEcra('app')
  }

  // Conta eliminada no servidor: apaga tudo o que ficou neste dispositivo
  async function contaEliminada() {
    await limparDadosLocais()
    limparSessao()
    limparFoto()
    setDonoDados(null)
    setUltimoSync(null)
    setPerfilEstado(null)
    setFotoEstado(null)
    setAvisoLogin('A tua conta e os teus dados foram eliminados.')
    setEcra('login')
  }

  function mudarModo(novo) {
    setModo(novo)
    guardarModo(novo)
  }

  function mudarTema(v) {
    setEscuro(v)
    guardarTema(v)
    aplicarTema(v)
  }

  async function sair() {
    setASair(true)
    // Antes de sair, tenta enviar o que ainda falta (no máximo 8 s)
    await Promise.race([sincronizar(), espera(8000)]).catch(() => {})
    await api.post('/auth/logout/').catch(() => {}) // termina só a sessão deste dispositivo
    limparSessao()
    setPerfilEstado(null)
    setConfirmarSair(false)
    setASair(false)
    setAvisoLogin('')
    setEcra('login')
  }

  const termos = Termos[modo]

  return (
    <div className="flex h-[100dvh] w-full justify-center md:items-center">
      <div className="relative h-full w-full max-w-md overflow-hidden md:h-[calc(100%-2rem)] md:max-w-5xl md:rounded-3xl md:border md:border-borda dark:md:border-borda-dark bg-fundo text-texto shadow-soft transition-colors duration-300 dark:bg-fundo-dark dark:text-texto-dark">
        {ecra === 'carregar' && (
          <div className="flex h-full flex-col items-center justify-center gap-3">
            <motion.div animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 1.2 }}>
              <Porquinho tamanho={110} />
            </motion.div>
            <p className="font-sora text-xl font-extrabold">
              Cofrinho <span className="text-dourado">AO</span>
            </p>
          </div>
        )}

        {ecra === 'onboarding' && (
          <div className="h-full">
            <Onboarding aoConcluir={(d) => { aoAutenticar(d); setToast('Conta criada') }} aoIrParaLogin={() => setEcra('login')} />
          </div>
        )}

        {ecra === 'login' && (
          <div className="h-full">
            <Login aoAutenticado={aoAutenticar} aoCriarConta={() => setEcra('onboarding')} aviso={avisoLogin} aoMensagem={setToast} />
          </div>
        )}

        {ecra === 'app' && (
          <motion.div className="flex h-full" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <a href="#conteudo" className="sr-only z-[70] rounded-xl bg-cartao px-4 py-2 font-semibold text-texto focus:not-sr-only focus:absolute focus:left-3 focus:top-3 dark:bg-cartao-dark dark:text-texto-dark">
              Saltar para o conteúdo
            </a>
            <SideNav aba={aba} aoMudar={setAba} />
            <div className="relative flex min-w-0 flex-1 flex-col">
              <header className="safe-top flex items-center justify-between px-5 pb-2 pt-4 md:justify-end md:px-8">
                <p className="font-sora text-lg font-extrabold md:hidden">
                  Cofrinho <span className="text-dourado">AO</span>
                </p>
                <div className="flex items-center gap-2">
                  {estadoSync.fase === 'a_sincronizar' && <RefreshCw size={16} className="animate-spin text-textosec dark:text-textosec-dark" aria-label="A sincronizar" />}
                  {(estadoSync.fase === 'offline' || estadoSync.fase === 'erro') && <CloudOff size={16} className="text-textosec dark:text-textosec-dark" aria-label="Sem sincronização" />}
                  <span className="rounded-full bg-rosa-light px-3 py-1 text-xs font-semibold text-rosa-dark dark:bg-rosa/20 dark:text-rosa">
                    {termos.rotulo}
                  </span>
                </div>
              </header>

              <main id="conteudo" tabIndex={-1} className="flex-1 overflow-y-auto px-5 pb-28 outline-none md:px-8 md:pb-8">
                <motion.div key={aba} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
                  {aba === ABAS.INICIO && <Inicio modo={modo} aoMensagem={setToast} />}
                  {aba === ABAS.GRAFICO && <Graficos modo={modo} />}
                  {aba === ABAS.METAS && <Metas modo={modo} aoMensagem={setToast} />}
                  {aba === ABAS.DEFINICOES && perfil && (
                    <Definicoes
                      perfil={perfil}
                      foto={foto}
                      modo={modo}
                      escuro={escuro}
                      aoMudarModo={mudarModo}
                      aoMudarTema={mudarTema}
                      aoPerfilGuardado={(p, f) => { setPerfilEstado(p); setFotoEstado(f) }}
                      aoPedirSair={() => setConfirmarSair(true)}
                      aoContaEliminada={contaEliminada}
                      instalar={promptInstalar ? instalar : null}
                      aoMensagem={setToast}
                      estadoSync={estadoSync}
                      aoSincronizar={sincronizarJa}
                    />
                  )}
                </motion.div>
              </main>

              <BottomNav aba={aba} aoMudar={setAba} />
            </div>
          </motion.div>
        )}

        <Modal aberto={confirmarSair} aoFechar={() => !aSair && setConfirmarSair(false)} titulo="Sair da conta?">
          <p className="mb-4 text-sm text-textosec dark:text-textosec-dark">Vamos enviar o que falta e terminar a sessão neste dispositivo. Os teus dados continuam guardados na tua conta.</p>
          <div className="flex flex-wrap gap-2">
            <motion.button whileTap={{ scale: 0.97 }} onClick={sair} disabled={aSair} className="btn-primario flex-1 disabled:opacity-50">{aSair ? 'A sair…' : 'Sair'}</motion.button>
            <motion.button whileTap={{ scale: 0.97 }} onClick={() => setConfirmarSair(false)} disabled={aSair} className="btn-secundario flex-1">Cancelar</motion.button>
          </div>
        </Modal>

        <Toast mensagem={toast} aoFechar={() => setToast(null)} />
      </div>
    </div>
  )
}
