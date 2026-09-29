import { useState } from 'react'
import { motion } from 'framer-motion'
import { ShieldCheck } from 'lucide-react'
import Modal from '../components/Modal'
import { Porquinho } from '../components/EmptyState'
import CampoSenha from '../components/CampoSenha'
import { emailValido } from '../utils/constants'
import { hashSenha } from '../utils/hash'
import { setPerfil, setSenhaHash, onboardingFeito } from '../db/prefs'

const VAZIO = { nomeCompleto: '', username: '', telefone: '', email: '', senha: '', confirmar: '' }

function Campo({ rotulo, erro, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-texto dark:text-texto-dark">{rotulo}</span>
      {children}
      {erro && <span className="mt-1 block break-words text-xs font-medium text-rosa-dark dark:text-rosa">{erro}</span>}
    </label>
  )
}

export default function Onboarding({ aoConcluir, aoIrParaLogin }) {
  const [f, setF] = useState(VAZIO)
  const [tocado, setTocado] = useState({})
  const [codigo, setCodigo] = useState(null) // código gerado (simulado)
  const [digitado, setDigitado] = useState('')
  const [erroCodigo, setErroCodigo] = useState('')
  const [aGuardar, setAGuardar] = useState(false)

  const mudar = (campo) => (e) => setF((s) => ({ ...s, [campo]: e.target.value }))
  const tocar = (campo) => () => setTocado((s) => ({ ...s, [campo]: true }))

  const erros = {
    nomeCompleto: f.nomeCompleto.trim().length < 3 ? 'Escreve o teu nome completo.' : '',
    username: f.username.trim().length < 3 || /\s/.test(f.username) ? 'Mínimo 3 caracteres, sem espaços.' : '',
    telefone: f.telefone.replace(/\D/g, '').length < 9 ? 'Escreve um telefone válido.' : '',
    email: !emailValido(f.email) ? 'Escreve um email válido (com @ e .).' : '',
    senha: f.senha.length < 4 ? 'A senha precisa de pelo menos 4 caracteres.' : '',
    confirmar: f.confirmar !== f.senha ? 'As senhas não coincidem.' : ''
  }
  const valido = Object.values(erros).every((e) => !e)
  const ver = (campo) => (tocado[campo] ? erros[campo] : '')

  function submeter(e) {
    e.preventDefault()
    setTocado({ nomeCompleto: true, username: true, telefone: true, email: true, senha: true, confirmar: true })
    if (!valido) return
    // FUTURO: aqui o backend (Brevo) envia o código real por email. Por agora é simulado.
    setCodigo(String(Math.floor(100000 + Math.random() * 900000)))
    setDigitado('')
    setErroCodigo('')
  }

  async function verificar() {
    if (digitado.trim() !== codigo) {
      setErroCodigo('Código incorrecto. Tenta outra vez.')
      return
    }
    setAGuardar(true)
    try {
      const hash = await hashSenha(f.senha)
      const okPerfil = setPerfil({
        nomeCompleto: f.nomeCompleto.trim(),
        username: f.username.trim(),
        telefone: f.telefone.trim(),
        email: f.email.trim()
      })
      const okSenha = setSenhaHash(hash)
      if (!okPerfil || !okSenha) throw new Error('armazenamento')
      aoConcluir()
    } catch {
      setErroCodigo('Não foi possível guardar a conta neste dispositivo. Tenta outra vez.')
    } finally {
      setAGuardar(false)
    }
  }

  return (
    <div className="safe-top safe-bottom h-full overflow-y-auto px-6 pb-8 pt-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-col items-center text-center">
          <Porquinho tamanho={84} />
          <h1 className="mt-2 font-sora text-2xl font-extrabold tracking-tight">
            Cofrinho <span className="text-dourado">AO</span>
          </h1>
          <p className="mt-1 max-w-xs break-words text-sm text-textosec dark:text-textosec-dark">
            Cria a tua conta. Os teus dados ficam guardados no teu telemóvel e funcionam sem internet.
          </p>
        </div>

        {onboardingFeito() && (
          <p className="mt-4 break-words rounded-2xl bg-dourado/15 p-3 text-xs font-medium">
            Já existe uma conta neste dispositivo. Criar outra substitui o perfil e a senha (os teus gastos, receitas e metas mantêm-se).
          </p>
        )}

        <form onSubmit={submeter} className="mt-6 space-y-3" noValidate>
          <Campo rotulo="Nome completo" erro={ver('nomeCompleto')}>
            <input className="campo" value={f.nomeCompleto} onChange={mudar('nomeCompleto')} onBlur={tocar('nomeCompleto')} autoComplete="name" />
          </Campo>
          <Campo rotulo="Nome de utilizador" erro={ver('username')}>
            <input className="campo" value={f.username} onChange={mudar('username')} onBlur={tocar('username')} autoCapitalize="none" autoComplete="username" />
          </Campo>
          <Campo rotulo="Telefone" erro={ver('telefone')}>
            <input className="campo" inputMode="tel" value={f.telefone} onChange={mudar('telefone')} onBlur={tocar('telefone')} autoComplete="tel" placeholder="9XX XXX XXX" />
          </Campo>
          <Campo rotulo="Email" erro={ver('email')}>
            <input className="campo" type="email" inputMode="email" value={f.email} onChange={mudar('email')} onBlur={tocar('email')} autoCapitalize="none" autoComplete="email" />
          </Campo>
          <Campo rotulo="Senha" erro={ver('senha')}>
            <CampoSenha value={f.senha} onChange={mudar('senha')} onBlur={tocar('senha')} autoComplete="new-password" />
          </Campo>
          <Campo rotulo="Confirmar senha" erro={ver('confirmar')}>
            <CampoSenha value={f.confirmar} onChange={mudar('confirmar')} onBlur={tocar('confirmar')} autoComplete="new-password" />
          </Campo>
          <motion.button whileTap={{ scale: 0.97 }} type="submit" className="btn-primario mt-2 w-full">
            Criar conta
          </motion.button>
          <button type="button" onClick={aoIrParaLogin} className="min-h-[44px] w-full text-sm font-semibold text-rosa">
            Já tenho conta? Entrar
          </button>
        </form>
      </motion.div>

      <Modal aberto={codigo !== null} aoFechar={() => setCodigo(null)} titulo="Verificar email">
        <div className="space-y-3">
          <div className="flex items-start gap-2 text-sm text-textosec dark:text-textosec-dark">
            <ShieldCheck size={18} className="mt-0.5 shrink-0 text-verde" />
            <p className="break-words">Enviámos um código de 6 dígitos para {f.email.trim()}.</p>
          </div>
          <div className="rounded-2xl bg-rosa-light p-3 text-center dark:bg-rosa/15">
            <p className="font-sora text-2xl font-extrabold tracking-[0.3em] text-rosa-dark dark:text-rosa">{codigo}</p>
            <p className="mt-1 text-xs text-textosec dark:text-textosec-dark">
              Modo desenvolvimento — o envio real por email (Brevo) liga quando o backend estiver configurado.
            </p>
          </div>
          <input
            className="campo text-center tracking-widest"
            inputMode="numeric"
            maxLength={6}
            placeholder="Introduz o código"
            value={digitado}
            onChange={(e) => { setDigitado(e.target.value.replace(/\D/g, '')); setErroCodigo('') }}
            aria-label="Código de verificação"
          />
          {erroCodigo && <p className="text-xs font-medium text-rosa-dark dark:text-rosa">{erroCodigo}</p>}
          <motion.button whileTap={{ scale: 0.97 }} onClick={verificar} disabled={aGuardar || digitado.length < 6} className="btn-primario w-full disabled:opacity-50">
            {aGuardar ? 'A guardar…' : 'Confirmar e entrar'}
          </motion.button>
        </div>
      </Modal>
    </div>
  )
}
