import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Modal from './Modal'
import { adicionarCategoria, categoriasAtivas } from '../db/db'

export default function NovaCategoriaModal({ aberto, aoFechar, aoMensagem }) {
  const [nome, setNome] = useState('')
  const [tipo, setTipo] = useState('gasto')
  const [escopo, setEscopo] = useState('ambos')
  const [erro, setErro] = useState('')

  useEffect(() => { if (aberto) { setNome(''); setTipo('gasto'); setEscopo('ambos'); setErro('') } }, [aberto])

  async function guardar(e) {
    e.preventDefault()
    const n = nome.trim()
    if (n.length < 2) return setErro('Dá um nome à categoria.')
    const existentes = await categoriasAtivas()
    if (existentes.some((c) => c.tipo === tipo && c.nome.toLowerCase() === n.toLowerCase())) {
      return setErro('Já existe uma categoria com esse nome e tipo.')
    }
    await adicionarCategoria({ nome: n, tipo, escopo })
    aoMensagem('Categoria criada')
    aoFechar()
  }

  return (
    <Modal aberto={aberto} aoFechar={aoFechar} titulo="Nova categoria">
      <form onSubmit={guardar} className="space-y-3" noValidate>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Nome</span>
          <input className="campo" value={nome} onChange={(e) => { setNome(e.target.value); setErro('') }} maxLength={30} autoFocus />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Tipo</span>
          <select className="campo" value={tipo} onChange={(e) => setTipo(e.target.value)}>
            <option value="gasto">Gasto</option>
            <option value="receita">Receita</option>
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Onde aparece</span>
          <select className="campo" value={escopo} onChange={(e) => setEscopo(e.target.value)}>
            <option value="ambos">Ambos</option>
            <option value="pessoal">Só Pessoal</option>
            <option value="negocio">Só Negócio</option>
          </select>
        </label>
        {erro && <p role="alert" className="text-sm font-medium text-rosa-dark dark:text-rosa">{erro}</p>}
        <motion.button whileTap={{ scale: 0.97 }} type="submit" className="btn-primario w-full">Criar categoria</motion.button>
      </form>
    </Modal>
  )
}
