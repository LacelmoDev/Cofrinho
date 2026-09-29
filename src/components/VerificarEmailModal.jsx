import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ShieldCheck } from 'lucide-react'
import Modal from './Modal'
import { api, nomeDispositivo } from '../api/api'
import useLento from '../utils/useLento'

// Confirmação do email com o código de 6 dígitos enviado pelo servidor.
export default function VerificarEmailModal({ aberto, email, codigoDev, emailEnviado = true, pedirAoAbrir = false, aoFechar, aoVerificado }) {
  const [codigo, setCodigo] = useState('')
  const [erro, setErro] = useState('')
  const [info, setInfo] = useState('')
  const [dev, setDev] = useState(null)
  const [aVerificar, setAVerificar] = useState(false)
  const [espera, setEspera] = useState(0)
  const lento = useLento(aVerificar)

  async function reenviar(silencioso = false) {
    setErro('')
    try {
      const r = await api.post('/auth/reenviar-codigo/', { email }, { auth: false })
      setDev(r.codigoDev || null)
      setEspera(60)
      setInfo(r.emailEnviado ? 'Enviámos um novo código para o teu email.' : 'Não foi possível enviar o email. Tenta outra vez daqui a pouco.')
    } catch (e) {
      if (silencioso) setInfo('Já enviámos um código há pouco. Verifica o teu email.')
      else setErro(e.message)
    }
  }

  useEffect(() => {
    if (!aberto) return
    setCodigo(''); setErro(''); setDev(codigoDev || null); setEspera(60)
    setInfo(emailEnviado ? '' : 'Não foi possível enviar o email. Toca em "Reenviar código".')
    if (pedirAoAbrir) reenviar(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aberto])

  useEffect(() => {
    if (espera <= 0) return
    const t = setTimeout(() => setEspera((e) => e - 1), 1000)
    return () => clearTimeout(t)
  }, [espera])

  async function verificar() {
    setErro('')
    setAVerificar(true)
    try {
      const dados = await api.post('/auth/verificar-email/', { email, codigo, dispositivo: nomeDispositivo() }, { auth: false, timeout: 60000 })
      aoVerificado(dados)
    } catch (e) {
      setErro(e.message)
    } finally {
      setAVerificar(false)
    }
  }

  return (
    <Modal aberto={aberto} aoFechar={aoFechar} titulo="Verificar email">
      <div className="space-y-3">
        <div className="flex items-start gap-2 text-sm text-textosec dark:text-textosec-dark">
          <ShieldCheck size={18} className="mt-0.5 shrink-0 text-verde" />
          <p className="break-words">Introduz o código de 6 dígitos enviado para {email}. Vê também a pasta de spam.</p>
        </div>
        {dev && (
          <p className="break-words rounded-2xl bg-dourado/15 p-3 text-center text-xs">
            Modo desenvolvimento — código: <strong className="font-sora text-base tracking-widest">{dev}</strong>
          </p>
        )}
        <input
          className="campo text-center tracking-widest"
          inputMode="numeric"
          maxLength={6}
          placeholder="Código"
          value={codigo}
          onChange={(e) => { setCodigo(e.target.value.replace(/\D/g, '')); setErro('') }}
          aria-label="Código de verificação"
        />
        {info && <p className="text-xs text-textosec dark:text-textosec-dark">{info}</p>}
        {erro && <p role="alert" className="break-words text-xs font-medium text-rosa-dark dark:text-rosa">{erro}</p>}
        <motion.button whileTap={{ scale: 0.97 }} onClick={verificar} disabled={aVerificar || codigo.length < 6} className="btn-primario w-full disabled:opacity-50">
          {aVerificar ? 'A verificar…' : 'Confirmar e entrar'}
        </motion.button>
        {lento && <p className="text-center text-xs text-textosec dark:text-textosec-dark">A ligar ao servidor… pode demorar até 1 minuto na primeira vez.</p>}
        <button type="button" onClick={() => reenviar(false)} disabled={espera > 0} className="min-h-[44px] w-full text-sm font-semibold text-rosa disabled:opacity-50">
          {espera > 0 ? `Reenviar código (${espera}s)` : 'Reenviar código'}
        </button>
      </div>
    </Modal>
  )
}
