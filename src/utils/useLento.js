import { useEffect, useState } from 'react'

// Fica true se a operação demorar mais de `ms` (útil quando o servidor gratuito está a acordar).
export default function useLento(ativo, ms = 4000) {
  const [lento, setLento] = useState(false)
  useEffect(() => {
    if (!ativo) { setLento(false); return }
    const t = setTimeout(() => setLento(true), ms)
    return () => clearTimeout(t)
  }, [ativo, ms])
  return lento
}
