import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'

// Bottom-sheet. max-h-[90dvh] + overflow-y-auto: os botões ficam sempre alcançáveis com o teclado aberto.
export default function Modal({ aberto, aoFechar, titulo, children }) {
  useEffect(() => {
    if (!aberto) return
    const aoTecla = (e) => e.key === 'Escape' && aoFechar()
    window.addEventListener('keydown', aoTecla)
    return () => window.removeEventListener('keydown', aoTecla)
  }, [aberto, aoFechar])

  return (
    <AnimatePresence>
      {aberto && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-[2px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={aoFechar}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={titulo}
            className="safe-bottom max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-cartao p-5 shadow-soft dark:bg-cartao-dark"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 320 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="break-words font-sora text-lg font-bold text-texto dark:text-texto-dark">{titulo}</h2>
              <button
                onClick={aoFechar}
                aria-label="Fechar"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-textosec hover:bg-borda dark:text-textosec-dark dark:hover:bg-borda-dark"
              >
                <X size={20} />
              </button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
