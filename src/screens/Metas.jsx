import { useMemo, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { motion } from 'framer-motion'
import { Plus, Trash2 } from 'lucide-react'
import { metasAtivas, transacoesAtivas, apagarMeta } from '../db/db'
import Modal from '../components/Modal'
import EmptyState from '../components/EmptyState'
import NovaMetaModal from '../components/NovaMetaModal'
import AdicionarMetaModal from '../components/AdicionarMetaModal'
import { formatarMoeda } from '../utils/constants'

export default function Metas({ modo, aoMensagem }) {
  const metas = useLiveQuery(() => metasAtivas(), [])
  const transacoes = useLiveQuery(() => transacoesAtivas(), [])
  const [nova, setNova] = useState(false)
  const [adicionar, setAdicionar] = useState(null)
  const [apagar, setApagar] = useState(null)

  // Saldo total (sem filtro de período) do modo actual
  const saldo = useMemo(
    () => (transacoes || []).filter((t) => t.modo === modo).reduce((s, t) => s + (t.tipo === 'receita' ? t.valor : -t.valor), 0),
    [transacoes, modo]
  )

  async function confirmarApagar() {
    await apagarMeta(apagar.id)
    setApagar(null)
    aoMensagem('Meta apagada')
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-sora text-xl font-bold tracking-tight">Metas de poupança</h2>
        <motion.button whileTap={{ scale: 0.97 }} onClick={() => setNova(true)} className="btn-primario flex items-center gap-1 whitespace-nowrap !px-4">
          <Plus size={18} /> Nova
        </motion.button>
      </div>

      {metas && metas.length === 0 ? (
        <EmptyState titulo="Ainda sem metas" texto="Cria uma meta e vai juntando dinheiro para ela." />
      ) : (
        <ul className="space-y-3">
          {(metas || []).map((m, i) => {
            const pct = Math.min(100, Math.round((m.valorAtual / m.valorAlvo) * 100))
            return (
              <motion.li
                key={m.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i, 8) * 0.04 }}
                className="rounded-3xl bg-cartao p-4 shadow-soft dark:bg-cartao-dark"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="min-w-0 break-words font-sora font-bold">{m.nome}</h3>
                  <button onClick={() => setApagar(m)} aria-label={`Apagar meta ${m.nome}`} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-textosec dark:text-textosec-dark">
                    <Trash2 size={18} />
                  </button>
                </div>
                <div className="mt-2 h-3 overflow-hidden rounded-full bg-borda dark:bg-borda-dark">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-dourado to-rosa"
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                  />
                </div>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <p className="min-w-0 break-words text-sm text-textosec dark:text-textosec-dark">
                    {formatarMoeda(m.valorAtual)} de {formatarMoeda(m.valorAlvo)} <span className="font-semibold text-rosa-dark dark:text-rosa">({pct}%)</span>
                  </p>
                  <motion.button whileTap={{ scale: 0.97 }} onClick={() => setAdicionar(m)} className="btn-secundario shrink-0 !px-4 text-sm">
                    Adicionar
                  </motion.button>
                </div>
              </motion.li>
            )
          })}
        </ul>
      )}

      <NovaMetaModal aberto={nova} aoFechar={() => setNova(false)} aoMensagem={aoMensagem} />
      <AdicionarMetaModal meta={adicionar} modo={modo} saldo={saldo} aoFechar={() => setAdicionar(null)} aoMensagem={aoMensagem} />

      <Modal aberto={!!apagar} aoFechar={() => setApagar(null)} titulo="Apagar meta?">
        <p className="mb-4 break-words text-sm text-textosec dark:text-textosec-dark">
          Vais apagar a meta "{apagar?.nome}". Os gastos de poupança já registados mantêm-se no histórico.
        </p>
        <div className="flex flex-wrap gap-2">
          <motion.button whileTap={{ scale: 0.97 }} onClick={confirmarApagar} className="min-h-[44px] flex-1 rounded-2xl bg-red-600 px-5 font-semibold text-white">Apagar</motion.button>
          <motion.button whileTap={{ scale: 0.97 }} onClick={() => setApagar(null)} className="btn-secundario flex-1">Cancelar</motion.button>
        </div>
      </Modal>
    </div>
  )
}
