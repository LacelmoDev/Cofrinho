import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Camera } from 'lucide-react'
import Avatar from '../components/Avatar'
import { emailValido } from '../utils/constants'
import { comprimirImagem } from '../utils/imagem'
import { setPerfil, setFoto } from '../db/prefs'

export default function EditarPerfil({ perfil, foto, aoVoltar, aoGuardar }) {
  const [f, setF] = useState({ nomeCompleto: perfil.nomeCompleto, username: perfil.username, telefone: perfil.telefone, email: perfil.email })
  const [novaFoto, setNovaFoto] = useState(foto)
  const [tentou, setTentou] = useState(false)
  const [erroFoto, setErroFoto] = useState('')
  const input = useRef(null)

  const mudar = (c) => (e) => setF((s) => ({ ...s, [c]: e.target.value }))
  const erros = {
    nomeCompleto: f.nomeCompleto.trim().length < 3 ? 'Escreve o teu nome completo.' : '',
    username: f.username.trim().length < 3 || /\s/.test(f.username) ? 'Mínimo 3 caracteres, sem espaços.' : '',
    telefone: f.telefone.replace(/\D/g, '').length < 9 ? 'Escreve um telefone válido.' : '',
    email: !emailValido(f.email) ? 'Escreve um email válido (com @ e .).' : ''
  }
  const valido = Object.values(erros).every((e) => !e)

  async function escolherFoto(e) {
    const ficheiro = e.target.files?.[0]
    if (!ficheiro) return
    try {
      setNovaFoto(await comprimirImagem(ficheiro, 256))
      setErroFoto('')
    } catch {
      setErroFoto('Não consegui abrir essa imagem.')
    }
    e.target.value = ''
  }

  function guardar(e) {
    e.preventDefault()
    setTentou(true)
    if (!valido) return
    const novo = { nomeCompleto: f.nomeCompleto.trim(), username: f.username.trim(), telefone: f.telefone.trim(), email: f.email.trim() }
    setPerfil(novo)
    if (novaFoto) setFoto(novaFoto)
    aoGuardar({ ...novo, estadoAssinatura: 'gratuito' }, novaFoto)
  }

  const campo = (rotulo, chave, extra = {}) => (
    <label className="block">
      <span className="mb-1 block text-sm font-medium">{rotulo}</span>
      <input className="campo" value={f[chave]} onChange={mudar(chave)} {...extra} />
      {tentou && erros[chave] && <span className="mt-1 block text-xs font-medium text-rosa-dark dark:text-rosa">{erros[chave]}</span>}
    </label>
  )

  return (
    <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
      <div className="flex items-center gap-2">
        <button onClick={aoVoltar} aria-label="Voltar" className="flex h-11 w-11 items-center justify-center rounded-full">
          <ArrowLeft size={22} />
        </button>
        <h2 className="font-sora text-xl font-bold tracking-tight">Editar perfil</h2>
      </div>

      <div className="flex flex-col items-center gap-1">
        <Avatar foto={novaFoto} nome={f.nomeCompleto} tamanho={96} aoClicar={() => input.current?.click()}>
          <span className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-full bg-dourado text-texto shadow-dourado">
            <Camera size={18} />
          </span>
        </Avatar>
        <input ref={input} type="file" accept="image/*" onChange={escolherFoto} className="hidden" aria-label="Escolher foto" />
        {erroFoto && <p className="text-xs font-medium text-rosa-dark dark:text-rosa">{erroFoto}</p>}
      </div>

      <form onSubmit={guardar} className="space-y-3" noValidate>
        {campo('Nome completo', 'nomeCompleto', { autoComplete: 'name' })}
        {campo('Nome de utilizador', 'username', { autoCapitalize: 'none' })}
        {campo('Telefone', 'telefone', { inputMode: 'tel' })}
        {campo('Email', 'email', { type: 'email', inputMode: 'email', autoCapitalize: 'none' })}
        <motion.button whileTap={{ scale: 0.97 }} type="submit" className="btn-primario w-full">Guardar</motion.button>
      </form>
    </motion.div>
  )
}
