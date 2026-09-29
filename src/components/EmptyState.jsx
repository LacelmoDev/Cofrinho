import { motion } from 'framer-motion'

// Logótipo do porquinho (public/icons/porquinho.png).
export function Porquinho({ tamanho = 96, className = '' }) {
  return <img src="/icons/porquinho.png" width={tamanho} height={tamanho} alt="" draggable="false" className={className} />
}

export default function EmptyState({ titulo, texto }) {
  return (
    <motion.div
      className="flex flex-col items-center px-6 py-10 text-center"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Porquinho tamanho={96} />
      <h3 className="mt-3 font-sora text-base font-bold text-texto dark:text-texto-dark">{titulo}</h3>
      {texto && <p className="mt-1 max-w-xs break-words text-sm text-textosec dark:text-textosec-dark">{texto}</p>}
    </motion.div>
  )
}
