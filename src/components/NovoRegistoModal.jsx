import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Modal from './Modal'
import { listarCategorias, adicionarTransacao } from '../db/db'
import { parseValor, Termos, VALOR_MAXIMO, MSG_VALOR_MAXIMO } from '../utils/constants'

// tipo: 'gasto' | 'receita' | null (fechado)
export default function NovoRegistoModal({ tipo, modo, aoFechar, aoGuardar }) {
  const [valor, setValor] = useState('')
  const [categoria, setCategoria] = useState('')
  const [descricao, setDescricao] = useState('')
  const [categorias, setCategorias] = useState([])
  const [erro, setErro] = useState('')
  const termos = Termos[modo]

  useEffect(() => {
    if (!tipo) return
    let vivo = true
    setValor(''); setDescricao(''); setErro('')
    listarCategorias(modo, tipo).then((lista) => {
      if (!vivo) return
      setCategorias(lista)
      setCategoria(lista[0]?.nome || '') // garante que o value é sempre válido
    })
    return () => { vivo = false }
  }, [tipo, modo])

  async function guardar(e) {
    e.preventDefault()
    const n = parseValor(valor)
    if (n <= 0) return setErro('Escreve um valor maior que zero.')
    if (n > VALOR_MAXIMO) return setErro(MSG_VALOR_MAXIMO)
    if (!categoria) return setErro('Escolhe uma categoria.')
    await adicionarTransacao({ tipo, valor: n, categoria, descricao, modo })
    aoGuardar(tipo === 'gasto' ? `${termos.gasto} guardado` : 'Receita guardada')
    aoFechar()
  }

  const titulo = tipo === 'gasto' ? `Novo ${termos.gasto.toLowerCase()}` : modo === 'negocio' ? 'Nova receita do negócio' : 'Nova receita'

  return (
    <Modal aberto={!!tipo} aoFechar={aoFechar} titulo={titulo}>
      <form onSubmit={guardar} className="space-y-3" noValidate>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Valor (Kz)</span>
          <input
            className="campo font-sora text-xl font-bold"
            inputMode="decimal"
            placeholder="0"
            value={valor}
            onChange={(e) => { setValor(e.target.value); setErro('') }}
            autoFocus
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Categoria</span>
          <select className="campo" value={categoria} onChange={(e) => setCategoria(e.target.value)}>
            {categorias.map((c) => (
              <option key={c.id} value={c.nome}>{c.nome}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Descrição (opcional)</span>
          <textarea className="campo min-h-[76px] break-words py-2" value={descricao} onChange={(e) => setDescricao(e.target.value)} maxLength={200} />
        </label>
        {erro && <p role="alert" className="text-sm font-medium text-rosa-dark dark:text-rosa">{erro}</p>}
        <motion.button whileTap={{ scale: 0.97 }} type="submit" className="btn-primario w-full">Guardar</motion.button>
      </form>
    </Modal>
  )
}
