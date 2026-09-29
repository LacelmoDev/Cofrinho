import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Modal from './Modal'
import CampoSenha from './CampoSenha'
import { api } from '../api/api'
import { emailValido } from '../utils/constants'
import useLento from '../utils/useLento'

// Recuperar a senha por email: 1) pedir o código  2) código + nova senha
export default function ResetSenhaModal({ aberto, aoFechar, aoConcluido, emailInicial = '' }) {
  const [passo, setPasso] = useState(1)
  const [email, setEmail] = useState('')
  const [codigo, setCodigo] = useState('')
  const [novaSenha, setNovaSenha] = useState('')
  const [dev, setDev] = useState(null)
  const [erro, setErro] = useState('')
  const [aEnviar, setAEnviar] = useState(false)
  const lento = useLento(aEnviar)

  useEffect(() => {
    if (!aberto) return
    setPasso(1); setEmail(emailInicial.includes('@') ? emailInicial : ''); setCodigo(''); setNovaSenha(''); setDev(null); setErro('')
  }, [aberto, emailInicial])

  async function pedir(e) {
    e.preventDefault()
    if (!emailValido(email)) return setErro('Escreve um email válido.')
    setAEnviar(true); setErro('')
    try {
      const r = await api.post('/auth/senha/pedir/', { email: email.trim() }, { auth: false, timeout: 60000 })
      setDev(r.codigoDev || null)
      setPasso(2)
    } catch (err) {
      setErro(err.message)
    } finally {
      setAEnviar(false)
    }
  }

  async function confirmar(e) {
    e.preventDefault()
    if (codigo.length < 6) return setErro('Escreve o código de 6 dígitos.')
    if (novaSenha.length < 6) return setErro('A senha precisa de pelo menos 6 caracteres.')
    setAEnviar(true); setErro('')
    try {
      await api.post('/auth/senha/confirmar/', { email: email.trim(), codigo, novaSenha }, { auth: false, timeout: 60000 })
      aoConcluido()
    } catch (err) {
      setErro(err.message)
    } finally {
      setAEnviar(false)
    }
  }

  return (
    <Modal aberto={aberto} aoFechar={aoFechar} titulo="Recuperar senha">
      {passo === 1 ? (
        <form onSubmit={pedir} className="space-y-3" noValidate>
          <p className="break-words text-sm text-textosec dark:text-textosec-dark">Escreve o email da tua conta. Vamos enviar-te um código para definires uma nova senha.</p>
          <input className="campo" type="email" inputMode="email" autoCapitalize="none" value={email} onChange={(e) => { setEmail(e.target.value); setErro('') }} aria-label="Email" placeholder="o.teu@email.com" />
          {erro && <p role="alert" className="break-words text-xs font-medium text-rosa-dark dark:text-rosa">{erro}</p>}
          <motion.button whileTap={{ scale: 0.97 }} type="submit" disabled={aEnviar} className="btn-primario w-full disabled:opacity-50">{aEnviar ? 'A enviar…' : 'Enviar código'}</motion.button>
          {lento && <p className="text-center text-xs text-textosec dark:text-textosec-dark">A ligar ao servidor… pode demorar até 1 minuto.</p>}
        </form>
      ) : (
        <form onSubmit={confirmar} className="space-y-3" noValidate>
          <p className="break-words text-sm text-textosec dark:text-textosec-dark">Se existir uma conta com {email}, enviámos um código. Vê também o spam.</p>
          {dev && <p className="rounded-2xl bg-dourado/15 p-3 text-center text-xs">Modo desenvolvimento — código: <strong className="font-sora text-base tracking-widest">{dev}</strong></p>}
          <input className="campo text-center tracking-widest" inputMode="numeric" maxLength={6} placeholder="Código" value={codigo} onChange={(e) => { setCodigo(e.target.value.replace(/\D/g, '')); setErro('') }} aria-label="Código" />
          <label className="block">
            <span className="mb-1 block text-sm font-medium">Nova senha</span>
            <CampoSenha value={novaSenha} onChange={(e) => { setNovaSenha(e.target.value); setErro('') }} autoComplete="new-password" />
          </label>
          {erro && <p role="alert" className="break-words text-xs font-medium text-rosa-dark dark:text-rosa">{erro}</p>}
          <motion.button whileTap={{ scale: 0.97 }} type="submit" disabled={aEnviar} className="btn-primario w-full disabled:opacity-50">{aEnviar ? 'A guardar…' : 'Guardar nova senha'}</motion.button>
        </form>
      )}
    </Modal>
  )
}
