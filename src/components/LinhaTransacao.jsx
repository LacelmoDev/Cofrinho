import { motion } from 'framer-motion'
import {
  UtensilsCrossed, Bus, Home, Gamepad2, HeartPulse, PiggyBank, Wallet, ShoppingBag,
  Truck, Users, Landmark, Wrench, Briefcase, MoreHorizontal, Tag
} from 'lucide-react'
import { formatarData, formatarMoeda } from '../utils/constants'

const ICONES = {
  'Alimentação': UtensilsCrossed, Transporte: Bus, Casa: Home, Lazer: Gamepad2, 'Saúde': HeartPulse,
  'Poupança': PiggyBank, 'Salário': Wallet, Venda: ShoppingBag, Vendas: ShoppingBag, Fornecedores: Truck,
  'Salários (equipa)': Users, Impostos: Landmark, Equipamento: Wrench, 'Serviços prestados': Briefcase,
  Outros: MoreHorizontal
}
export const iconeCategoria = (nome) => ICONES[nome] || Tag

export default function LinhaTransacao({ t, indice = 0, aoAbrir }) {
  const Icone = iconeCategoria(t.categoria)
  const receita = t.tipo === 'receita'
  return (
    <motion.li
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(indice, 8) * 0.04 }}
    >
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={() => aoAbrir(t)}
        className="flex min-h-[64px] w-full items-center gap-3 rounded-2xl bg-cartao p-3 text-left shadow-soft dark:bg-cartao-dark"
      >
        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${receita ? 'bg-verde-light text-verde dark:bg-verde/15' : 'bg-rosa-light text-rosa dark:bg-rosa/15'}`}>
          <Icone size={20} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold">{t.categoria}</span>
          <span className="block text-xs text-textosec dark:text-textosec-dark">{formatarData(t.data)}</span>
        </span>
        <span className={`shrink-0 font-sora text-sm font-bold ${receita ? 'text-verde' : 'text-rosa'}`}>
          {receita ? '+' : '-'}{formatarMoeda(t.valor)}
        </span>
      </motion.button>
    </motion.li>
  )
}
