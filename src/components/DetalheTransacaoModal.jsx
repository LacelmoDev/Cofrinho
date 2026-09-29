import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Modal from './Modal'
import { listarCategorias, atualizarTransacao, apagarTransacao } from '../db/db'
import { formatarData, formatarMoeda, parseValor, Termos, VALOR_MAXIMO, MSG_VALOR_MAXIMO } from '../utils/constants'

function Linha({ rotulo, children }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-borda py-2.5 last:border-0 dark:border-borda-dark">
      <span className="shrink-0 text-sm text-textosec dark:text-textosec-dark">{rotulo}</span>
      <span className="min-w-0 break-words text-right text-sm font-medium">{children}</span>
    </div>
  )
}

// t: transacção seleccionada ou null
export default function DetalheTransacaoModal({ t, aoFechar, aoMensagem }) {
  const [editar, setEditar] = useState(false)
  const [apagar, setApagar] = useState(false)
  const [valor, setValor] = useState('')
  const [categoria, setCategoria] = useState('')
  const [descricao, setDescricao] = useState('')
  const [categorias, setCategorias] = useState([])
  const [erro, setErro] = useState('')

  useEffect(() => {
    if (!t) return
    let vivo = true
    setEditar(false); setApagar(false); setErro('')
    setValor(String(t.valor).replace('.', ',')); setCategoria(t.categoria); setDescricao(t.descricao || '')
    listarCategorias(t.modo, t.tipo).then((l) => vivo && setCategorias(l))
    return () => { vivo = false }
  }, [t])

  if (!t) return <Modal aberto={false} aoFechar={aoFechar} titulo="" />

  // Se a categoria original já foi apagada, mantém-na na lista para o select continuar válido
  const opcoes = categorias.some((c) => c.nome === t.categoria) ? categorias : [{ id: 'atual', nome: t.categoria }, ...categorias]
  const receita = t.tipo === 'receita'
  const termos = Termos[t.modo] || Termos.pessoal

  async function guardar(e) {
    e.preventDefault()
    const n = parseValor(valor)
    if (n <= 0) return setErro('Escreve um valor maior que zero.')
    if (n > VALOR_MAXIMO) return setErro(MSG_VALOR_MAXIMO)
    await atualizarTransacao(t.id, { valor: n, categoria, descricao: descricao.trim() })
    aoMensagem('Alterações guardadas')
    aoFechar()
  }
  async function confirmarApagar() {
    await apagarTransacao(t.id)
    aoMensagem('Registo apagado')
    aoFechar()
  }

  return (
    <Modal aberto={!!t} aoFechar={aoFechar} titulo={apagar ? 'Apagar registo?' : editar ? 'Editar registo' : 'Detalhe'}>
      {apagar ? (
        <div className="space-y-4">
          <p className="break-words text-sm text-textosec dark:text-textosec-dark">
            Vais apagar {formatarMoeda(t.valor)} de "{t.categoria}". Esta acção não pode ser desfeita.
          </p>
          <div className="flex flex-wrap gap-2">
            <motion.button whileTap={{ scale: 0.97 }} onClick={confirmarApagar} className="min-h-[44px] flex-1 rounded-2xl bg-red-600 px-5 font-semibold text-white">Apagar</motion.button>
            <motion.button whileTap={{ scale: 0.97 }} onClick={() => setApagar(false)} className="btn-secundario flex-1">Cancelar</motion.button>
          </div>
        </div>
      ) : editar ? (
        <form onSubmit={guardar} className="space-y-3" noValidate>
          <label className="block">
            <span className="mb-1 block text-sm font-medium">Valor (Kz)</span>
            <input className="campo font-sora text-xl font-bold" inputMode="decimal" value={valor} onChange={(e) => { setValor(e.target.value); setErro('') }} />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium">Categoria</span>
            <select className="campo" value={categoria} onChange={(e) => setCategoria(e.target.value)}>
              {opcoes.map((c) => <option key={c.id} value={c.nome}>{c.nome}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium">Descrição</span>
            <textarea className="campo min-h-[76px] break-words py-2" value={descricao} onChange={(e) => setDescricao(e.target.value)} maxLength={200} />
          </label>
          {erro && <p role="alert" className="text-sm font-medium text-rosa-dark dark:text-rosa">{erro}</p>}
          <div className="flex flex-wrap gap-2">
            <motion.button whileTap={{ scale: 0.97 }} type="submit" className="btn-primario flex-1">Guardar</motion.button>
            <motion.button whileTap={{ scale: 0.97 }} type="button" onClick={() => setEditar(false)} className="btn-secundario flex-1">Cancelar</motion.button>
          </div>
        </form>
      ) : (
        <div>
          <p className={`mb-2 font-sora text-3xl font-bold tracking-tight ${receita ? 'text-verde' : 'text-rosa'}`}>
            {receita ? '+' : '-'}{formatarMoeda(t.valor)}
          </p>
          <Linha rotulo="Tipo">{receita ? 'Receita' : termos.gasto}</Linha>
          <Linha rotulo="Categoria">{t.categoria}</Linha>
          <Linha rotulo="Data">{formatarData(t.data)}</Linha>
          <Linha rotulo="Modo">{Termos[t.modo]?.rotulo || t.modo}</Linha>
          <Linha rotulo="Descrição">{t.descricao || '—'}</Linha>
          <div className="mt-4 flex flex-wrap gap-2">
            <motion.button whileTap={{ scale: 0.97 }} onClick={() => setEditar(true)} className="btn-primario flex-1">Editar</motion.button>
            <motion.button whileTap={{ scale: 0.97 }} onClick={() => setApagar(true)} className="btn-secundario flex-1 !text-red-600">Apagar</motion.button>
            <motion.button whileTap={{ scale: 0.97 }} onClick={aoFechar} className="btn-secundario w-full">Fechar</motion.button>
          </div>
        </div>
      )}
    </Modal>
  )
}
