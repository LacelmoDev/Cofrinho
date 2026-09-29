import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Camera } from 'lucide-react'
import Avatar from '../components/Avatar'
import { comprimirImagem } from '../utils/imagem'
import { api } from '../api/api'
import { setPerfil, setFoto } from '../db/prefs'

export default function EditarPerfil({ perfil, foto, aoVoltar, aoGuardar }) {
  const [f, setF] = useState({ nomeCompleto: perfil.nomeCompleto, username: perfil.username, telefone: perfil.telefone })
  const [novaFoto, setNovaFoto] = useState(foto)
  const [tentou, setTentou] = useState(false)
  const [erroFoto, setErroFoto] = useState('')
  const [erroServidor, setErroServidor] = useState('')
  const [aGuardar, setAGuardar] = useState(false)
  const input = useRef(null)

  const mudar = (c) => (e) => { setF((s) => ({ ...s, [c]: e.target.value })); setErroServidor('') }
  const erros = {
    nomeCompleto: f.nomeCompleto.trim().length < 3 ? 'Escreve o teu nome completo.' : '',
    username: !/^[\w.-]{3,30}$/.test(f.username.trim()) ? '3 a 30 caracteres, sem espaços.' : '',
    telefone: f.telefone.replace(/\D/g, '').length < 9 ? 'Escreve um telefone válido.' : ''
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

  async function guardar(e) {
    e.preventDefault()
    setTentou(true)
    if (!valido) return
    setAGuardar(true)
    try {
      const novo = await api.patch('/auth/eu/', {
        nomeCompleto: f.nomeCompleto.trim(), username: f.username.trim(), telefone: f.telefone.trim()
      })
      setPerfil(novo)
      if (novaFoto) setFoto(novaFoto)
      aoGuardar(novo, novaFoto)
    } catch (err) {
      setErroServidor(err.codigo === 'rede' ? 'Precisas de internet para guardar o perfil.' : err.message)
    } finally {
      setAGuardar(false)
    }
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
        <p className="text-xs text-textosec dark:text-textosec-dark">A foto fica só neste dispositivo.</p>
        {erroFoto && <p className="text-xs font-medium text-rosa-dark dark:text-rosa">{erroFoto}</p>}
      </div>

      <form onSubmit={guardar} className="space-y-3" noValidate>
        {campo('Nome completo', 'nomeCompleto', { autoComplete: 'name' })}
        {campo('Nome de utilizador', 'username', { autoCapitalize: 'none' })}
        {campo('Telefone', 'telefone', { inputMode: 'tel' })}
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Email</span>
          <input className="campo opacity-60" value={perfil.email} disabled aria-describedby="nota-email" />
          <span id="nota-email" className="mt-1 block text-xs text-textosec dark:text-textosec-dark">O email não pode ser alterado por agora.</span>
        </label>
        {erroServidor && <p role="alert" className="break-words text-sm font-medium text-rosa-dark dark:text-rosa">{erroServidor}</p>}
        <motion.button whileTap={{ scale: 0.97 }} type="submit" disabled={aGuardar} className="btn-primario w-full disabled:opacity-50">
          {aGuardar ? 'A guardar…' : 'Guardar'}
        </motion.button>
      </form>
    </motion.div>
  )
}
