import { useEffect, useRef } from 'react'
import { animate, motion } from 'framer-motion'
import { AlertTriangle, ArrowDownLeft, ArrowUpRight } from 'lucide-react'
import { Porquinho } from './EmptyState'
import { formatarMoeda } from '../utils/constants'

// Número com count-up
function Numero({ valor }) {
  const ref = useRef(null)
  const atual = useRef(0)
  useEffect(() => {
    const anim = animate(atual.current, valor, {
      duration: 0.7,
      ease: 'easeOut',
      onUpdate: (v) => {
        atual.current = v
        if (ref.current) ref.current.textContent = formatarMoeda(v)
      }
    })
    return () => anim.stop()
  }, [valor])
  return <span ref={ref}>{formatarMoeda(valor)}</span>
}

export default function CartaoSaldo({ termos, saldo, entradas, saidas, periodo }) {
  const negativo = saldo < 0
  const tam = formatarMoeda(saldo).length
  const classeSaldo = tam > 17 ? 'text-xl' : tam > 14 ? 'text-2xl' : tam > 11 ? 'text-3xl' : 'text-4xl'
  const classeParcial = (v) => { const n = formatarMoeda(v).length; return n > 16 ? 'text-xs' : n > 13 ? 'text-sm' : 'text-base' }
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      aria-label={termos.saldo}
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#C2436A] to-[#9C3358] p-5 text-white shadow-rosa"
    >
      {/* Detalhes decorativos */}
      <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
      <div className="pointer-events-none absolute -bottom-12 right-10 h-32 w-32 rounded-full bg-dourado/25" />
      <Porquinho tamanho={110} className="pointer-events-none absolute -bottom-4 -right-2 opacity-15" />

      <p className="relative text-sm font-medium text-white/85">{termos.saldo}</p>
      <div className="relative mt-1 flex flex-wrap items-center gap-2">
        {negativo ? (
          <span className={`inline-flex max-w-full items-center gap-2 whitespace-nowrap rounded-2xl bg-white px-3 py-1 font-sora ${classeSaldo} font-bold tracking-tight text-red-600`}>
            <AlertTriangle size={22} aria-label="Saldo negativo" />
            <Numero valor={saldo} />
          </span>
        ) : (
          <span className={`whitespace-nowrap font-sora ${classeSaldo} font-bold tracking-tight`}>
            <Numero valor={saldo} />
          </span>
        )}
      </div>

      {periodo && <p className="relative mt-4 text-xs font-medium text-white/90">Movimentos · {periodo}</p>}
      <div className="relative mt-2 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-white/15 p-3">
          <p className="flex items-center gap-1 text-xs font-medium text-white/85">
            <ArrowDownLeft size={14} /> {termos.entradas}
          </p>
          <p className={`mt-0.5 whitespace-nowrap font-sora ${classeParcial(entradas)} font-bold`}>{formatarMoeda(entradas)}</p>
        </div>
        <div className="rounded-2xl bg-white/15 p-3">
          <p className="flex items-center gap-1 text-xs font-medium text-white/85">
            <ArrowUpRight size={14} /> {termos.saidas}
          </p>
          <p className={`mt-0.5 whitespace-nowrap font-sora ${classeParcial(saidas)} font-bold`}>{formatarMoeda(saidas)}</p>
        </div>
      </div>
    </motion.section>
  )
}
