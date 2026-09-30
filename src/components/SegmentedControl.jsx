import { motion } from 'framer-motion'

// Chips com whitespace-nowrap e flex-wrap: nunca parte o texto letra a letra.
// Para 3+ rótulos longos, prefere <select>.
export default function SegmentedControl({ opcoes, valor, aoMudar, rotulo }) {
  return (
    <div role="radiogroup" aria-label={rotulo} className="flex flex-wrap gap-2">
      {opcoes.map((o) => {
        const activo = o.valor === valor
        return (
          <motion.button
            key={o.valor}
            type="button"
            role="radio"
            aria-checked={activo}
            whileTap={{ scale: 0.97 }}
            onClick={() => aoMudar(o.valor)}
            className={`min-h-[44px] whitespace-nowrap rounded-2xl border px-4 text-sm font-semibold transition-colors ${
              activo
                ? 'border-rosa-dark bg-rosa-dark text-white shadow-rosa'
                : 'border-borda bg-cartao text-texto dark:border-borda-dark dark:bg-cartao-dark dark:text-texto-dark'
            }`}
          >
            {o.rotulo}
          </motion.button>
        )
      })}
    </div>
  )
}
