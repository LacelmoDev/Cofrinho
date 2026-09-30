import { motion } from 'framer-motion'
import { Home, PieChart, Target, Settings } from 'lucide-react'
import { ABAS } from '../utils/constants'

export const ITENS = [
  { id: ABAS.INICIO, rotulo: 'Início', Icone: Home },
  { id: ABAS.GRAFICO, rotulo: 'Gráfico', Icone: PieChart },
  { id: ABAS.METAS, rotulo: 'Metas', Icone: Target },
  { id: ABAS.DEFINICOES, rotulo: 'Definições', Icone: Settings }
]

export default function BottomNav({ aba, aoMudar }) {
  return (
    <nav aria-label="Navegação principal" className="safe-bottom absolute inset-x-0 bottom-0 z-40 px-4 pb-3 md:hidden">
      <div className="flex items-center justify-between rounded-3xl border border-borda/70 bg-cartao/80 p-1.5 shadow-soft backdrop-blur-xl dark:border-borda-dark dark:bg-cartao-dark/80">
        {ITENS.map(({ id, rotulo, Icone }) => {
          const activo = aba === id
          return (
            <motion.button
              key={id}
              whileTap={{ scale: 0.97 }}
              onClick={() => aoMudar(id)}
              aria-current={activo ? 'page' : undefined}
              className="relative flex min-h-[48px] flex-1 flex-col items-center justify-center gap-0.5 rounded-2xl"
            >
              {activo && (
                <motion.span
                  layoutId="nav-indicador"
                  className="absolute inset-0 rounded-2xl bg-rosa-dark shadow-rosa"
                  transition={{ type: 'spring', damping: 26, stiffness: 340 }}
                />
              )}
              <Icone size={20} className={`relative z-10 ${activo ? 'text-white' : 'text-textosec dark:text-textosec-dark'}`} />
              <span className={`relative z-10 text-xs font-semibold ${activo ? 'text-white' : 'text-textosec dark:text-textosec-dark'}`}>
                {rotulo}
              </span>
            </motion.button>
          )
        })}
      </div>
    </nav>
  )
}
