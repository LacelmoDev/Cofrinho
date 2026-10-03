import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2 } from 'lucide-react'

// Uso: const [toast, setToast] = useState(null); setToast('Gasto guardado')
export default function Toast({ mensagem, aoFechar, duracao = 2200 }) {
  useEffect(() => {
    if (!mensagem) return
    const t = setTimeout(aoFechar, duracao)
    return () => clearTimeout(t)
  }, [mensagem, aoFechar, duracao])

  return (
    <AnimatePresence>
      {mensagem && (
        <motion.div
          role="status"
          className="pointer-events-none fixed inset-x-0 bottom-32 z-[60] flex justify-center px-4 md:bottom-8"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
        >
          <div className="flex max-w-xs items-center gap-2 break-words rounded-2xl bg-texto px-4 py-3 text-sm font-medium text-white shadow-soft dark:bg-texto-dark dark:text-fundo-dark">
            <CheckCircle2 size={18} className="shrink-0 text-verde" />
            {mensagem}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
