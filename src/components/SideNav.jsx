import { ITENS } from './BottomNav'
import { Porquinho } from './EmptyState'

// Navegação lateral para tablets e computadores (a barra inferior é só para telemóveis)
export default function SideNav({ aba, aoMudar }) {
  return (
    <nav aria-label="Navegação principal" className="hidden w-56 shrink-0 flex-col gap-1 border-r border-borda p-4 dark:border-borda-dark md:flex">
      <div className="mb-4 flex items-center gap-2 px-2 pt-2">
        <Porquinho tamanho={36} />
        <p className="font-sora text-lg font-extrabold">
          Cofrinho <span className="text-dourado">AO</span>
        </p>
      </div>
      {ITENS.map(({ id, rotulo, Icone }) => {
        const activo = aba === id
        return (
          <button
            key={id}
            onClick={() => aoMudar(id)}
            aria-current={activo ? 'page' : undefined}
            className={`flex min-h-[44px] items-center gap-3 rounded-2xl px-3 text-left text-sm font-semibold transition-colors ${
              activo ? 'bg-rosa-dark text-white shadow-rosa' : 'text-textosec hover:bg-borda dark:text-textosec-dark dark:hover:bg-borda-dark'
            }`}
          >
            <Icone size={20} /> {rotulo}
          </button>
        )
      })}
    </nav>
  )
}
