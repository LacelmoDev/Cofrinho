import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle } from 'lucide-react'
import Modal from './Modal'
import { db, adicionarTransacao } from '../db/db'
import { CATEGORIA_POUPANCA, formatarMoeda, parseValor, VALOR_MAXIMO, MSG_VALOR_MAXIMO } from '../utils/constants'

// meta: meta seleccionada ou null. saldo: saldo total do modo actual.
export default function AdicionarMetaModal({ meta, modo, saldo, aoFechar, aoMensagem }) {
  const [valor, setValor] = useState('')
  const [erro, setErro] = useState('')

  useEffect(() => { if (meta) { setValor(''); setErro('') } }, [meta])

  const n = parseValor(valor)
  const excede = n > 0 && n > saldo

  async function guardar(e) {
    e.preventDefault()
    if (n <= 0) return setErro('Escreve um valor maior que zero.')
    if (n > VALOR_MAXIMO) return setErro(MSG_VALOR_MAXIMO)
    // Regra crítica: cria um gasto "Poupança" e actualiza a meta, tudo ou nada.
    await db.transaction('rw', db.transacoes, db.metas, async () => {
      await adicionarTransacao({
        tipo: 'gasto',
        valor: n,
        categoria: CATEGORIA_POUPANCA,
        descricao: `Poupança: ${meta.nome}`,
        modo
      })
      await db.metas.update(meta.id, { valorAtual: meta.valorAtual + n })
    })
    aoMensagem('Valor adicionado à meta')
    aoFechar()
  }

  return (
    <Modal aberto={!!meta} aoFechar={aoFechar} titulo={meta ? `Adicionar a "${meta.nome}"` : ''}>
      <form onSubmit={guardar} className="space-y-3" noValidate>
        <p className="text-sm text-textosec dark:text-textosec-dark">Saldo actual: {formatarMoeda(saldo)}</p>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Valor (Kz)</span>
          <input className="campo font-sora text-xl font-bold" inputMode="decimal" value={valor} onChange={(e) => { setValor(e.target.value); setErro('') }} placeholder="0" autoFocus />
        </label>
        {excede && (
          <p role="alert" className="flex items-start gap-2 rounded-2xl bg-red-50 p-3 text-sm font-medium text-red-600 dark:bg-red-500/15 dark:text-red-400">
            <AlertTriangle size={18} className="mt-0.5 shrink-0" /> Isto vai deixar o teu saldo negativo.
          </p>
        )}
        {erro && <p role="alert" className="text-sm font-medium text-rosa-dark dark:text-rosa">{erro}</p>}
        <motion.button whileTap={{ scale: 0.97 }} type="submit" className="btn-primario w-full">Adicionar</motion.button>
      </form>
    </Modal>
  )
}
