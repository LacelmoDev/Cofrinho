import { useMemo } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { motion } from 'framer-motion'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import { transacoesAtivas } from '../db/db'
import EmptyState from '../components/EmptyState'
import { Termos, formatarMoeda } from '../utils/constants'

const PALETA = ['#EC5C82', '#F4B740', '#3FB07E', '#B98CD1', '#7EB6D9', '#E0A96D']

export default function Graficos({ modo }) {
  const termos = Termos[modo]
  const todas = useLiveQuery(() => transacoesAtivas(), [])

  const { dados, total } = useMemo(() => {
    const mapa = {}
    ;(todas || []).filter((t) => t.modo === modo && t.tipo === 'gasto').forEach((t) => {
      mapa[t.categoria] = (mapa[t.categoria] || 0) + t.valor
    })
    const dados = Object.entries(mapa).map(([nome, valor]) => ({ nome, valor })).sort((a, b) => b.valor - a.valor)
    return { dados, total: dados.reduce((s, d) => s + d.valor, 0) }
  }, [todas, modo])

  return (
    <div className="space-y-4">
      <h2 className="font-sora text-xl font-bold tracking-tight">{termos.graficoTitulo}</h2>

      {todas && dados.length === 0 ? (
        <EmptyState titulo="Sem dados para mostrar" texto={`Quando registares ${termos.gasto.toLowerCase()}s, vais vê-los aqui por categoria.`} />
      ) : (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl bg-cartao p-4 shadow-soft dark:bg-cartao-dark">
          <div className="relative">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={dados} dataKey="valor" nameKey="nome" innerRadius={64} outerRadius={94} paddingAngle={2} stroke="none">
                  {dados.map((d, i) => <Cell key={d.nome} fill={PALETA[i % PALETA.length]} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xs text-textosec dark:text-textosec-dark">Total</span>
              <span className="font-sora text-lg font-bold">{formatarMoeda(total)}</span>
            </div>
          </div>

          <ul className="mt-2 space-y-2">
            {dados.map((d, i) => (
              <li key={d.nome} className="flex items-center gap-3 text-sm">
                <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: PALETA[i % PALETA.length] }} />
                <span className="min-w-0 flex-1 truncate font-medium">{d.nome}</span>
                <span className="shrink-0 text-textosec dark:text-textosec-dark">{Math.round((d.valor / total) * 100)}%</span>
                <span className="shrink-0 font-sora font-semibold">{formatarMoeda(d.valor)}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      )}
    </div>
  )
}
