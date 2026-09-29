import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { semearCategoriasPadrao } from './db/db'
import {
  aplicarTema, getTema, setTema as guardarTema, getModo, setModo as guardarModo,
  getPerfil, getFoto, onboardingFeito
} from './db/prefs'
import { ABAS, MODO, Termos } from './utils/constants'
import BottomNav from './components/BottomNav'
import Modal from './components/Modal'
import Toast from './components/Toast'
import { Porquinho } from './components/EmptyState'
import Onboarding from './screens/Onboarding'
import Login from './screens/Login'
import Inicio from './screens/Inicio'
import Graficos from './screens/Graficos'
import Metas from './screens/Metas'
import Definicoes from './screens/Definicoes'

export default function App() {
  // 'carregar' | 'onboarding' | 'login' | 'app'
  const [ecra, setEcra] = useState('carregar')
  const [aba, setAba] = useState(ABAS.INICIO)
  const [modo, setModo] = useState(MODO.PESSOAL)
  const [escuro, setEscuro] = useState(false)
  const [perfil, setPerfilEstado] = useState(null)
  const [foto, setFotoEstado] = useState(null)
  const [toast, setToast] = useState(null)
  const [confirmarSair, setConfirmarSair] = useState(false)
  const [promptInstalar, setPromptInstalar] = useState(null)

  useEffect(() => {
    let vivo = true
    async function iniciar() {
      const tema = getTema()
      setEscuro(tema)
      aplicarTema(tema) // (1) tema guardado
      await semearCategoriasPadrao() // (2) categorias padrão (idempotente)
      onboardingFeito() // (3) o Login é sempre o primeiro ecrã
      setModo(getModo()) // (4) modo guardado
      await new Promise((r) => setTimeout(r, 700))
      if (vivo) setEcra('login') // o Login vem primeiro; o cadastro fica logo abaixo
    }
    iniciar()
    return () => { vivo = false }
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

  async function instalar() {
    if (!promptInstalar) return
    promptInstalar.prompt()
    await promptInstalar.userChoice
    setPromptInstalar(null)
  }

  function entrarNoApp() {
    setModo(getModo())
    setPerfilEstado(getPerfil())
    setFotoEstado(getFoto())
    setAba(ABAS.INICIO)
    setEcra('app')
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

  function sair() {
    setConfirmarSair(false)
    setEcra('login') // não apaga dados
  }

  const termos = Termos[modo]

  return (
    <div className="flex h-[100dvh] w-full justify-center">
      <div className="relative h-full w-full max-w-md overflow-hidden bg-fundo text-texto shadow-soft transition-colors duration-300 dark:bg-fundo-dark dark:text-texto-dark">
        <>
          {ecra === 'carregar' && (
            <motion.div key="carregar" className="flex h-full flex-col items-center justify-center gap-3">
              <motion.div animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 1.2 }}>
                <Porquinho tamanho={110} />
              </motion.div>
              <p className="font-sora text-xl font-extrabold">
                Cofrinho <span className="text-dourado">AO</span>
              </p>
            </motion.div>
          )}

          {ecra === 'onboarding' && (
            <motion.div key="onboarding" className="h-full">
              <Onboarding aoConcluir={() => { entrarNoApp(); setToast('Conta criada') }} aoIrParaLogin={() => setEcra('login')} />
            </motion.div>
          )}

          {ecra === 'login' && (
            <motion.div key="login" className="h-full">
              <Login aoEntrar={entrarNoApp} aoRecriarConta={() => setEcra('onboarding')} aoCriarConta={() => setEcra('onboarding')} />
            </motion.div>
          )}

          {ecra === 'app' && (
            <motion.div key="shell" className="flex h-full flex-col" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
              <header className="safe-top flex items-center justify-between px-5 pb-2 pt-4">
                <p className="font-sora text-lg font-extrabold">
                  Cofrinho <span className="text-dourado">AO</span>
                </p>
                <span className="rounded-full bg-rosa-light px-3 py-1 text-xs font-semibold text-rosa-dark dark:bg-rosa/20 dark:text-rosa">
                  {termos.rotulo}
                </span>
              </header>

              <main className="flex-1 overflow-y-auto px-5 pb-28">
                <>
                  <motion.div key={aba} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
                    {aba === ABAS.INICIO && <Inicio modo={modo} aoMensagem={setToast} />}
                    {aba === ABAS.GRAFICO && <Graficos modo={modo} />}
                    {aba === ABAS.METAS && <Metas modo={modo} aoMensagem={setToast} />}
                    {aba === ABAS.DEFINICOES && (
                      <Definicoes
                        perfil={perfil}
                        foto={foto}
                        modo={modo}
                        escuro={escuro}
                        aoMudarModo={mudarModo}
                        aoMudarTema={mudarTema}
                        aoPerfilGuardado={(p, f) => { setPerfilEstado(p); setFotoEstado(f) }}
                        aoPedirSair={() => setConfirmarSair(true)}
                        instalar={promptInstalar ? instalar : null}
                        aoMensagem={setToast}
                      />
                    )}
                  </motion.div>
                </>
              </main>

              <BottomNav aba={aba} aoMudar={setAba} />
            </motion.div>
          )}
        </>

        <Modal aberto={confirmarSair} aoFechar={() => setConfirmarSair(false)} titulo="Sair da conta?">
          <p className="mb-4 text-sm text-textosec dark:text-textosec-dark">Os teus dados ficam guardados. Vais precisar da senha para voltar a entrar.</p>
          <div className="flex flex-wrap gap-2">
            <motion.button whileTap={{ scale: 0.97 }} onClick={sair} className="btn-primario flex-1">Sair</motion.button>
            <motion.button whileTap={{ scale: 0.97 }} onClick={() => setConfirmarSair(false)} className="btn-secundario flex-1">Cancelar</motion.button>
          </div>
        </Modal>

        <Toast mensagem={toast} aoFechar={() => setToast(null)} />
      </div>
    </div>
  )
}
