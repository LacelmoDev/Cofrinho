import { useMemo, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { motion } from 'framer-motion'
import { transacoesAtivas } from '../db/db'
import CartaoSaldo from '../components/CartaoSaldo'
import LinhaTransacao from '../components/LinhaTransacao'
import NovoRegistoModal from '../components/NovoRegistoModal'
import DetalheTransacaoModal from '../components/DetalheTransacaoModal'
import SegmentedControl from '../components/SegmentedControl'
import EmptyState from '../components/EmptyState'
import { PERIODO, Termos, dentroDoPeriodo } from '../utils/constants'

const OPCOES_PERIODO = [
  { valor: PERIODO.HOJE, rotulo: 'Hoje' },
  { valor: PERIODO.SEMANA, rotulo: 'Esta semana' },
  { valor: PERIODO.MES, rotulo: 'Este mês' },
  { valor: PERIODO.TUDO, rotulo: 'Tudo' }
]

export default function Inicio({ modo, aoMensagem }) {
  const termos = Termos[modo]
  const [periodo, setPeriodo] = useState(PERIODO.MES)
  const [novo, setNovo] = useState(null) // 'gasto' | 'receita' | null
  const [detalhe, setDetalhe] = useState(null)

  const todas = useLiveQuery(() => transacoesAtivas(), [])

  const lista = useMemo(
    () =>
      (todas || [])
        .filter((t) => t.modo === modo && dentroDoPeriodo(t.data, periodo))
        .sort((a, b) => new Date(b.data) - new Date(a.data)),
    [todas, modo, periodo]
  )

  const { entradas, saidas } = useMemo(() => {
    let e = 0, s = 0
    lista.forEach((t) => (t.tipo === 'receita' ? (e += t.valor) : (s += t.valor)))
    return { entradas: e, saidas: s }
  }, [lista])

  return (
    <div className="space-y-4">
      <CartaoSaldo termos={termos} saldo={entradas - saidas} entradas={entradas} saidas={saidas} />

      <div className="grid grid-cols-2 gap-2">
        <motion.button whileTap={{ scale: 0.97 }} onClick={() => setNovo('gasto')} className="btn-primario px-3 py-2 text-sm leading-tight">
          {termos.novoGasto}
        </motion.button>
        <motion.button whileTap={{ scale: 0.97 }} onClick={() => setNovo('receita')} className="btn-secundario px-3 py-2 text-sm leading-tight">
          {termos.novaReceita}
        </motion.button>
      </div>

      <SegmentedControl rotulo="Período" opcoes={OPCOES_PERIODO} valor={periodo} aoMudar={setPeriodo} />

      {todas && lista.length === 0 ? (
        <EmptyState titulo="Ainda sem registos" texto="Regista o teu primeiro movimento neste período com os botões acima." />
      ) : (
        <ul className="space-y-2">
          {lista.map((t, i) => (
            <LinhaTransacao key={t.id} t={t} indice={i} aoAbrir={setDetalhe} />
          ))}
        </ul>
      )}

      <NovoRegistoModal tipo={novo} modo={modo} aoFechar={() => setNovo(null)} aoGuardar={aoMensagem} />
      <DetalheTransacaoModal t={detalhe} aoFechar={() => setDetalhe(null)} aoMensagem={aoMensagem} />
    </div>
  )
}
