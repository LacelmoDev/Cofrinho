import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { motion } from 'framer-motion'
import { CloudOff, Download, ExternalLink, FileDown, LogOut, Moon, Pencil, Plus, RefreshCw, Trash2 } from 'lucide-react'
import { categoriasAtivas, apagarCategoria } from '../db/db'
import Avatar from '../components/Avatar'
import Modal from '../components/Modal'
import SegmentedControl from '../components/SegmentedControl'
import NovaCategoriaModal from '../components/NovaCategoriaModal'
import CampoSenha from '../components/CampoSenha'
import EditarPerfil from './EditarPerfil'
import { api } from '../api/api'
import { sincronizar } from '../sync/sync'
import { ESCOPO, MODO } from '../utils/constants'

const ETIQUETA_ESCOPO = { ambos: 'ambos', pessoal: 'pessoal', negocio: 'negócio' }

function Cartao({ children, className = '' }) {
  return <section className={`rounded-3xl bg-cartao p-4 shadow-soft dark:bg-cartao-dark ${className}`}>{children}</section>
}

export default function Definicoes({ perfil, foto, modo, escuro, aoMudarModo, aoMudarTema, aoPerfilGuardado, aoPedirSair, aoContaEliminada, instalar, aoMensagem, estadoSync, aoSincronizar }) {
  const [editando, setEditando] = useState(false)
  const [novaCat, setNovaCat] = useState(false)
  const [apagar, setApagar] = useState(null)
  const [eliminar, setEliminar] = useState(false)
  const [senhaEliminar, setSenhaEliminar] = useState('')
  const [erroEliminar, setErroEliminar] = useState('')
  const [aEliminar, setAEliminar] = useState(false)
  const [aExportar, setAExportar] = useState(false)
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

  async function exportar() {
    setAExportar(true)
    try {
      await Promise.race([sincronizar(), new Promise((r) => setTimeout(r, 8000))]) // envia primeiro o que falta
      const dados = await api.get('/auth/exportar/')
      const blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `cofrinho-ao-dados-${new Date().toISOString().slice(0, 10)}.json`
      document.body.appendChild(a)
      a.click()
      a.remove()
      setTimeout(() => URL.revokeObjectURL(url), 2000)
      aoMensagem('Dados exportados')
    } catch (e) {
      aoMensagem(e.codigo === 'rede' ? 'Precisas de internet para exportar.' : e.message)
    } finally {
      setAExportar(false)
    }
  }

  async function eliminarConta(e) {
    e.preventDefault()
    setAEliminar(true)
    setErroEliminar('')
    try {
      await api.post('/auth/eliminar-conta/', { senha: senhaEliminar })
      setEliminar(false)
      await aoContaEliminada()
    } catch (err) {
      setErroEliminar(err.codigo === 'rede' ? 'Precisas de internet para eliminar a conta.' : err.message)
    } finally {
      setAEliminar(false)
    }
  }

  const ligacao = 'flex min-h-[44px] items-center justify-between gap-2 text-sm font-medium'

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
        {estadoSync.fase === 'offline' || estadoSync.fase === 'erro' ? <CloudOff size={22} className="shrink-0 text-textosec dark:text-textosec-dark" /> : <RefreshCw size={22} className={`shrink-0 text-verde-dark dark:text-verde ${estadoSync.fase === 'a_sincronizar' ? 'animate-spin' : ''}`} />}
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
          <Download size={22} className="shrink-0 text-rosa-dark dark:text-rosa" />
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
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${c.tipo === 'receita' ? 'bg-verde-light text-verde-dark dark:text-verde dark:bg-verde/15' : 'bg-rosa-light text-rosa-dark dark:bg-rosa/15 dark:text-rosa'}`}>
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

      <Cartao>
        <h3 className="mb-2 font-sora font-bold">Privacidade e dados</h3>
        <ul className="divide-y divide-borda dark:divide-borda-dark">
          <li><a className={ligacao} href="/privacidade.html" target="_blank" rel="noopener">Política de Privacidade <ExternalLink size={16} aria-hidden="true" /></a></li>
          <li><a className={ligacao} href="/termos.html" target="_blank" rel="noopener">Termos de Uso <ExternalLink size={16} aria-hidden="true" /></a></li>
          <li><a className={ligacao} href="/armazenamento.html" target="_blank" rel="noopener">Armazenamento local (cookies) <ExternalLink size={16} aria-hidden="true" /></a></li>
        </ul>
        <div className="mt-3 flex flex-wrap gap-2">
          <motion.button whileTap={{ scale: 0.97 }} onClick={exportar} disabled={aExportar} className="btn-secundario flex flex-1 items-center justify-center gap-2 text-sm disabled:opacity-50">
            <FileDown size={16} /> {aExportar ? 'A exportar…' : 'Exportar os meus dados'}
          </motion.button>
          <motion.button whileTap={{ scale: 0.97 }} onClick={() => { setSenhaEliminar(''); setErroEliminar(''); setEliminar(true) }} className="btn-secundario flex flex-1 items-center justify-center gap-2 text-sm !text-red-700 dark:!text-red-400">
            <Trash2 size={16} /> Eliminar a minha conta
          </motion.button>
        </div>
      </Cartao>

      <motion.button whileTap={{ scale: 0.97 }} onClick={aoPedirSair} className="btn-secundario flex w-full items-center justify-center gap-2 !text-red-600">
        <LogOut size={18} /> Sair
      </motion.button>

      <p className="pb-2 text-center text-xs text-textosec dark:text-textosec-dark">
        Cofrinho AO · versão {typeof __BUILD__ !== 'undefined' ? __BUILD__ : 'dev'}
      </p>

      <Modal aberto={eliminar} aoFechar={() => !aEliminar && setEliminar(false)} titulo="Eliminar a conta?">
        <form onSubmit={eliminarConta} className="space-y-3" noValidate>
          <p className="break-words text-sm text-textosec dark:text-textosec-dark">
            Isto apaga <strong>para sempre</strong> a tua conta e todos os teus registos, no servidor e neste dispositivo. Não pode ser desfeito. Se quiseres, exporta primeiro os teus dados.
          </p>
          <label className="block">
            <span className="mb-1 block text-sm font-medium">Escreve a tua senha para confirmar</span>
            <CampoSenha value={senhaEliminar} onChange={(e) => { setSenhaEliminar(e.target.value); setErroEliminar('') }} autoComplete="current-password" />
          </label>
          {erroEliminar && <p role="alert" className="break-words text-sm font-medium text-rosa-dark dark:text-rosa">{erroEliminar}</p>}
          <div className="flex flex-wrap gap-2">
            <motion.button whileTap={{ scale: 0.97 }} type="submit" disabled={aEliminar || !senhaEliminar} className="min-h-[44px] flex-1 rounded-2xl bg-red-700 px-5 font-semibold text-white disabled:opacity-50">
              {aEliminar ? 'A eliminar…' : 'Eliminar definitivamente'}
            </motion.button>
            <motion.button whileTap={{ scale: 0.97 }} type="button" onClick={() => setEliminar(false)} disabled={aEliminar} className="btn-secundario flex-1">Cancelar</motion.button>
          </div>
        </form>
      </Modal>

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
