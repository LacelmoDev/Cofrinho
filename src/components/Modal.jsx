import { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'

const FOCAVEIS = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

// Cartão flutuante junto ao fundo no telemóvel, janela centrada em tablets/PC.
// max-h + overflow-y-auto: os botões ficam sempre alcançáveis com o teclado aberto.
export default function Modal({ aberto, aoFechar, titulo, children }) {
  const caixa = useRef(null)
  const fechar = useRef(aoFechar)
  fechar.current = aoFechar

  useEffect(() => {
    if (!aberto) return
    const anterior = document.activeElement
    const t = setTimeout(() => {
      const el = caixa.current
      if (!el) return
      const campo = el.querySelector('input:not([disabled]), textarea:not([disabled]), select:not([disabled])')
      ;(campo || el).focus()
    }, 60)
    const aoTecla = (e) => {
      if (e.key === 'Escape') return fechar.current()
      if (e.key !== 'Tab' || !caixa.current) return
      const lista = caixa.current.querySelectorAll(FOCAVEIS)
      if (!lista.length) return
      const primeiro = lista[0]
      const ultimo = lista[lista.length - 1]
      if (e.shiftKey && (document.activeElement === primeiro || document.activeElement === caixa.current)) {
        e.preventDefault(); ultimo.focus()
      } else if (!e.shiftKey && document.activeElement === ultimo) {
        e.preventDefault(); primeiro.focus()
      }
    }
    window.addEventListener('keydown', aoTecla)
    return () => {
      clearTimeout(t)
      window.removeEventListener('keydown', aoTecla)
      if (anterior && anterior.focus) anterior.focus()
    }
  }, [aberto])

  return (
    <AnimatePresence>
      {aberto && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-3 pb-[max(env(safe-area-inset-bottom),1rem)] backdrop-blur-[2px] md:items-center md:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={aoFechar}
        >
          <motion.div
            ref={caixa}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-label={titulo}
            className="max-h-[88dvh] w-full max-w-md overflow-y-auto rounded-3xl bg-cartao p-5 shadow-soft outline-none dark:bg-cartao-dark"
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
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
