import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

// Campo de senha com "olhinho" para mostrar/ocultar.
export default function CampoSenha(props) {
  const [ver, setVer] = useState(false)
  return (
    <div className="relative">
      <input {...props} type={ver ? 'text' : 'password'} className="campo pr-12" />
      <button
        type="button"
        onClick={() => setVer((v) => !v)}
        aria-label={ver ? 'Ocultar senha' : 'Mostrar senha'}
        aria-pressed={ver}
        className="absolute right-0 top-0 flex h-11 w-11 items-center justify-center rounded-full text-textosec dark:text-textosec-dark"
      >
        {ver ? <EyeOff size={20} /> : <Eye size={20} />}
      </button>
    </div>
  )
}
