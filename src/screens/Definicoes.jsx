import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { motion } from 'framer-motion'
import { CloudOff, Download, LogOut, Moon, Pencil, Plus, RefreshCw, Trash2 } from 'lucide-react'
import { categoriasAtivas, apagarCategoria } from '../db/db'
import Avatar from '../components/Avatar'
import Modal from '../components/Modal'
import SegmentedControl from '../components/SegmentedControl'
import NovaCategoriaModal from '../components/NovaCategoriaModal'
import EditarPerfil from './EditarPerfil'
import { ESCOPO, MODO } from '../utils/constants'

const ETIQUETA_ESCOPO = { ambos: 'ambos', pessoal: 'pessoal', negocio: 'negócio' }

function Cartao({ children, className = '' }) {
  return <section className={`rounded-3xl bg-cartao p-4 shadow-soft dark:bg-cartao-dark ${className}`}>{children}</section>
}

export default function Definicoes({ perfil, foto, modo, escuro, aoMudarModo, aoMudarTema, aoPerfilGuardado, aoPedirSair, instalar, aoMensagem, estadoSync, aoSincronizar }) {
  const [editando, setEditando] = useState(false)
  const [novaCat, setNovaCat] = useState(false)
  const [apagar, setApagar] = useState(null)
  const categorias = useLiveQuery(() => categoriasAtivas(), [])

  if (editando) {
    return (
      <EditarPerfil
        perfil={perfil}
        foto={foto}
        aoVoltar={() => setEditando(false)}
        aoGuardar={(p, f) => { aoPerfilGuardado(p, f); setEditando(false); aoMensagem('Perfil actualizado') }}
      />
    )
  }

  // Visível se escopo === 'ambos' ou escopo === modo actual
  const visiveis = (categorias || [])
    .filter((c) => c.escopo === ESCOPO.AMBOS || c.escopo === modo)
    .sort((a, b) => a.tipo.localeCompare(b.tipo) || a.nome.localeCompare(b.nome, 'pt'))

  async function confirmarApagar() {
    await apagarCategoria(apagar.id) // registos antigos mantêm o nome
    setApagar(null)
    aoMensagem('Categoria apagada')
  }

  return (
    <div className="space-y-4">
      <h2 className="font-sora text-xl font-bold tracking-tight">Definições</h2>

      <Cartao className="flex items-center gap-3">
        <Avatar foto={foto} nome={perfil?.nomeCompleto} tamanho={56} />
        <div className="min-w-0 flex-1">
          <p className="truncate font-sora font-bold">{perfil?.nomeCompleto}</p>
          <p className="truncate text-sm text-textosec dark:text-textosec-dark">@{perfil?.username}</p>
          <p className="truncate text-xs text-textosec dark:text-textosec-dark">{perfil?.email}</p>
        </div>
        <motion.button whileTap={{ scale: 0.97 }} onClick={() => setEditando(true)} aria-label="Editar perfil" className="btn-secundario flex shrink-0 items-center gap-1 !px-3 text-sm">
          <Pencil size={16} /> Editar
        </motion.button>
      </Cartao>

      <Cartao className="space-y-4">
        <div className="flex min-h-[44px] items-center justify-between gap-3">
          <span className="flex items-center gap-2 font-medium"><Moon size={18} /> Modo escuro</span>
          <button
            role="switch"
            aria-checked={escuro}
            aria-label="Modo escuro"
            onClick={() => aoMudarTema(!escuro)}
            className={`relative h-8 w-14 shrink-0 rounded-full transition-colors ${escuro ? 'bg-rosa' : 'bg-borda dark:bg-borda-dark'}`}
          >
            <motion.span layout transition={{ type: 'spring', damping: 24, stiffness: 400 }} className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow ${escuro ? 'right-1' : 'left-1'}`} />
          </button>
        </div>
        <div>
          <p className="mb-2 text-sm font-medium">Modo da conta</p>
          <SegmentedControl
            rotulo="Modo da conta"
            opcoes={[{ valor: MODO.PESSOAL, rotulo: 'Pessoal' }, { valor: MODO.NEGOCIO, rotulo: 'Negócio' }]}
            valor={modo}
            aoMudar={aoMudarModo}
          />
        </div>
      </Cartao>

      <Cartao className="flex items-center gap-3">
        {estadoSync.fase === 'offline' || estadoSync.fase === 'erro' ? <CloudOff size={22} className="shrink-0 text-textosec dark:text-textosec-dark" /> : <RefreshCw size={22} className={`shrink-0 text-verde ${estadoSync.fase === 'a_sincronizar' ? 'animate-spin' : ''}`} />}
        <div className="min-w-0 flex-1">
          <p className="font-medium">Sincronização</p>
          <p className="break-words text-xs text-textosec dark:text-textosec-dark">
            {estadoSync.fase === 'a_sincronizar' && 'A sincronizar…'}
            {estadoSync.fase === 'offline' && 'Sem ligação. Os dados ficam no telemóvel e sincronizam quando voltares a ter internet.'}
            {estadoSync.fase === 'erro' && `Não foi possível sincronizar: ${estadoSync.erro}`}
            {estadoSync.fase === 'ok' && `Tudo sincronizado às ${new Date(estadoSync.ultimoSync).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}.`}
            {estadoSync.fase === 'parado' && 'Ainda por sincronizar.'}
          </p>
        </div>
        <motion.button whileTap={{ scale: 0.97 }} onClick={aoSincronizar} disabled={estadoSync.fase === 'a_sincronizar'} className="btn-secundario shrink-0 !px-3 text-sm disabled:opacity-50">Agora</motion.button>
      </Cartao>

      {instalar && (
        <Cartao className="flex items-center gap-3">
          <Download size={22} className="shrink-0 text-rosa" />
          <p className="min-w-0 flex-1 break-words text-sm">Instala o Cofrinho AO no telemóvel e usa-o sem internet.</p>
          <motion.button whileTap={{ scale: 0.97 }} onClick={instalar} className="btn-primario shrink-0 !px-4 text-sm">Instalar</motion.button>
        </Cartao>
      )}

      <Cartao>
        <div className="mb-3 flex items-center justify-between gap-2">
          <h3 className="font-sora font-bold">Categorias</h3>
          <motion.button whileTap={{ scale: 0.97 }} onClick={() => setNovaCat(true)} className="btn-secundario flex items-center gap-1 !px-3 text-sm">
            <Plus size={16} /> Nova
          </motion.button>
        </div>
        <ul className="divide-y divide-borda dark:divide-borda-dark">
          {visiveis.map((c) => (
            <li key={c.id} className="flex min-h-[48px] items-center gap-2 py-2">
              <div className="min-w-0 flex-1">
                <p className="break-words text-sm font-medium">{c.nome}</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${c.tipo === 'receita' ? 'bg-verde-light text-verde dark:bg-verde/15' : 'bg-rosa-light text-rosa-dark dark:bg-rosa/15 dark:text-rosa'}`}>
                    {c.tipo === 'receita' ? 'receita' : 'gasto'}
                  </span>
                  <span className="rounded-full bg-borda px-2 py-0.5 text-xs font-semibold text-textosec dark:bg-borda-dark dark:text-textosec-dark">
                    {c.padrao ? 'padrão' : ETIQUETA_ESCOPO[c.escopo]}
                  </span>
                </div>
              </div>
              {/* Categorias padrão não se apagam: o arranque voltaria a criá-las (seed idempotente) */}
              {!c.padrao && (
                <button onClick={() => setApagar(c)} aria-label={`Apagar categoria ${c.nome}`} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-textosec dark:text-textosec-dark">
                  <Trash2 size={18} />
                </button>
              )}
            </li>
          ))}
        </ul>
      </Cartao>

      <motion.button whileTap={{ scale: 0.97 }} onClick={aoPedirSair} className="btn-secundario flex w-full items-center justify-center gap-2 !text-red-600">
        <LogOut size={18} /> Sair
      </motion.button>

      <p className="pb-2 text-center text-xs text-textosec dark:text-textosec-dark">
        Cofrinho AO · versão {typeof __BUILD__ !== 'undefined' ? __BUILD__ : 'dev'}
      </p>

      <NovaCategoriaModal aberto={novaCat} aoFechar={() => setNovaCat(false)} aoMensagem={aoMensagem} />
      <Modal aberto={!!apagar} aoFechar={() => setApagar(null)} titulo="Apagar categoria?">
        <p className="mb-4 break-words text-sm text-textosec dark:text-textosec-dark">
          Vais apagar "{apagar?.nome}". Os registos antigos mantêm o nome desta categoria.
        </p>
        <div className="flex flex-wrap gap-2">
          <motion.button whileTap={{ scale: 0.97 }} onClick={confirmarApagar} className="min-h-[44px] flex-1 rounded-2xl bg-red-600 px-5 font-semibold text-white">Apagar</motion.button>
          <motion.button whileTap={{ scale: 0.97 }} onClick={() => setApagar(null)} className="btn-secundario flex-1">Cancelar</motion.button>
        </div>
      </Modal>
    </div>
  )
}
