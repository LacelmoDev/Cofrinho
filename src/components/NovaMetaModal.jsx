import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Modal from './Modal'
import { adicionarMeta } from '../db/db'
import { parseValor, VALOR_MAXIMO, MSG_VALOR_MAXIMO } from '../utils/constants'

export default function NovaMetaModal({ aberto, aoFechar, aoMensagem }) {
  const [nome, setNome] = useState('')
  const [alvo, setAlvo] = useState('')
  const [erro, setErro] = useState('')

  useEffect(() => { if (aberto) { setNome(''); setAlvo(''); setErro('') } }, [aberto])

  async function guardar(e) {
    e.preventDefault()
    const v = parseValor(alvo)
    if (nome.trim().length < 2) return setErro('Dá um nome à meta.')
    if (v <= 0) return setErro('Escreve um valor-alvo maior que zero.')
    if (v > VALOR_MAXIMO) return setErro(MSG_VALOR_MAXIMO)
    await adicionarMeta({ nome, valorAlvo: v })
    aoMensagem('Meta criada')
    aoFechar()
  }

  return (
    <Modal aberto={aberto} aoFechar={aoFechar} titulo="Nova meta">
      <form onSubmit={guardar} className="space-y-3" noValidate>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Nome da meta</span>
          <input className="campo" value={nome} onChange={(e) => { setNome(e.target.value); setErro('') }} maxLength={40} placeholder="Ex.: Telemóvel novo" autoFocus />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Valor-alvo (Kz)</span>
          <input className="campo font-sora text-lg font-bold" inputMode="decimal" value={alvo} onChange={(e) => { setAlvo(e.target.value); setErro('') }} placeholder="0" />
        </label>
        {erro && <p role="alert" className="text-sm font-medium text-rosa-dark dark:text-rosa">{erro}</p>}
        <motion.button whileTap={{ scale: 0.97 }} type="submit" className="btn-primario w-full">Criar meta</motion.button>
      </form>
    </Modal>
  )
}
