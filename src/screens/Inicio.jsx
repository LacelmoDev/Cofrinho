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
  { valor: PERIODO.SEMANA, rotulo: 'Semana' },
  { valor: PERIODO.MES, rotulo: 'Mês' },
  { valor: PERIODO.TUDO, rotulo: 'Tudo' }
]

export default function Inicio({ modo, aoMensagem }) {
  const termos = Termos[modo]
  const [periodo, setPeriodo] = useState(PERIODO.MES)
  const [novo, setNovo] = useState(null) // 'gasto' | 'receita' | null
  const [detalhe, setDetalhe] = useState(null)

  const todas = useLiveQuery(() => transacoesAtivas(), [])

  const doModo = useMemo(() => (todas || []).filter((t) => t.modo === modo), [todas, modo])

  // O saldo é o que tens agora: soma de tudo, sem depender do filtro de período.
  const saldo = useMemo(() => doModo.reduce((s, t) => s + (t.tipo === 'receita' ? t.valor : -t.valor), 0), [doModo])

  const lista = useMemo(
    () => doModo.filter((t) => dentroDoPeriodo(t.data, periodo)).sort((a, b) => new Date(b.data) - new Date(a.data)),
    [doModo, periodo]
  )

  // Entradas e saídas mostram só o período escolhido
  const { entradas, saidas } = useMemo(() => {
    let e = 0, s = 0
    lista.forEach((t) => (t.tipo === 'receita' ? (e += t.valor) : (s += t.valor)))
    return { entradas: e, saidas: s }
  }, [lista])

  const rotuloPeriodo = { hoje: 'Hoje', semana: 'Esta semana', mes: 'Este mês', tudo: 'Todo o período' }[periodo]

  return (
    <div className="space-y-4 lg:grid lg:grid-cols-[22rem_minmax(0,1fr)] lg:items-start lg:gap-6 lg:space-y-0">
      <div className="space-y-4">
        <CartaoSaldo termos={termos} saldo={saldo} entradas={entradas} saidas={saidas} periodo={rotuloPeriodo} />

        <div className="grid grid-cols-2 gap-2">
          <motion.button whileTap={{ scale: 0.97 }} onClick={() => setNovo('gasto')} className="btn-primario px-3 py-2 text-sm leading-tight">
            {termos.novoGasto}
          </motion.button>
          <motion.button whileTap={{ scale: 0.97 }} onClick={() => setNovo('receita')} className="btn-secundario px-3 py-2 text-sm leading-tight">
            {termos.novaReceita}
          </motion.button>
        </div>

        <SegmentedControl rotulo="Período" opcoes={OPCOES_PERIODO} valor={periodo} aoMudar={setPeriodo} />
      </div>

      <div>
        {todas && lista.length === 0 ? (
          <EmptyState titulo="Sem registos neste período" texto="Escolhe outro período acima, ou regista um movimento com os botões." />
        ) : (
          <ul className="space-y-2">
            {lista.map((t, i) => (
              <LinhaTransacao key={t.id} t={t} indice={i} aoAbrir={setDetalhe} />
            ))}
          </ul>
        )}
      </div>

      <NovoRegistoModal tipo={novo} modo={modo} aoFechar={() => setNovo(null)} aoGuardar={aoMensagem} />
      <DetalheTransacaoModal t={detalhe} aoFechar={() => setDetalhe(null)} aoMensagem={aoMensagem} />
    </div>
  )
}
