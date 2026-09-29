import { useState } from 'react'
import { motion } from 'framer-motion'
import VerificarEmailModal from '../components/VerificarEmailModal'
import { Porquinho } from '../components/EmptyState'
import CampoSenha from '../components/CampoSenha'
import { emailValido } from '../utils/constants'
import { api } from '../api/api'
import useLento from '../utils/useLento'

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
  const [verificar, setVerificar] = useState(null) // { email, codigoDev, emailEnviado }
  const [aEnviar, setAEnviar] = useState(false)
  const [erroServidor, setErroServidor] = useState('')
  const lento = useLento(aEnviar)

  const mudar = (campo) => (e) => { setF((s) => ({ ...s, [campo]: e.target.value })); setErroServidor('') }
  const tocar = (campo) => () => setTocado((s) => ({ ...s, [campo]: true }))

  const erros = {
    nomeCompleto: f.nomeCompleto.trim().length < 3 ? 'Escreve o teu nome completo.' : '',
    username: !/^[\w.-]{3,30}$/.test(f.username.trim()) ? '3 a 30 caracteres (letras, números, ponto, hífen ou _), sem espaços.' : '',
    telefone: f.telefone.replace(/\D/g, '').length < 9 ? 'Escreve um telefone válido.' : '',
    email: !emailValido(f.email) ? 'Escreve um email válido (com @ e .).' : '',
    senha: f.senha.length < 6 ? 'A senha precisa de pelo menos 6 caracteres.' : '',
    confirmar: f.confirmar !== f.senha ? 'As senhas não coincidem.' : ''
  }
  const valido = Object.values(erros).every((e) => !e)
  const ver = (campo) => (tocado[campo] ? erros[campo] : '')

  async function submeter(e) {
    e.preventDefault()
    setTocado({ nomeCompleto: true, username: true, telefone: true, email: true, senha: true, confirmar: true })
    if (!valido) return
    setAEnviar(true)
    setErroServidor('')
    try {
      const r = await api.post('/auth/registar/', {
        nomeCompleto: f.nomeCompleto.trim(), username: f.username.trim(), telefone: f.telefone.trim(),
        email: f.email.trim(), senha: f.senha
      }, { auth: false, timeout: 60000 })
      setVerificar({ email: r.email, codigoDev: r.codigoDev || null, emailEnviado: r.emailEnviado })
    } catch (err) {
      setErroServidor(err.codigo === 'email_existente' ? 'Este email já tem conta. Toca em "Já tenho conta? Entrar".' : err.message)
    } finally {
      setAEnviar(false)
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
            Cria a tua conta. Os teus dados ficam no telemóvel, funcionam sem internet e sincronizam quando houver ligação.
          </p>
        </div>

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
          {erroServidor && <p role="alert" className="break-words text-sm font-medium text-rosa-dark dark:text-rosa">{erroServidor}</p>}
          <motion.button whileTap={{ scale: 0.97 }} type="submit" disabled={aEnviar} className="btn-primario mt-2 w-full disabled:opacity-50">
            {aEnviar ? 'A criar conta…' : 'Criar conta'}
          </motion.button>
          {lento && <p className="text-center text-xs text-textosec dark:text-textosec-dark">A ligar ao servidor… pode demorar até 1 minuto na primeira vez.</p>}
          <button type="button" onClick={aoIrParaLogin} className="min-h-[44px] w-full text-sm font-semibold text-rosa">
            Já tenho conta? Entrar
          </button>
        </form>
      </motion.div>

      <VerificarEmailModal
        aberto={!!verificar}
        email={verificar?.email || ''}
        codigoDev={verificar?.codigoDev}
        emailEnviado={verificar?.emailEnviado ?? true}
        aoFechar={() => setVerificar(null)}
        aoVerificado={(d) => { setVerificar(null); aoConcluir(d) }}
      />
    </div>
  )
}
