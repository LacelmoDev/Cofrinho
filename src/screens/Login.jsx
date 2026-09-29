import { useState } from 'react'
import { motion } from 'framer-motion'
import Modal from '../components/Modal'
import { Porquinho } from '../components/EmptyState'
import CampoSenha from '../components/CampoSenha'
import { hashSenha } from '../utils/hash'
import { getPerfil, getSenhaHash, limparConta } from '../db/prefs'

export default function Login({ aoEntrar, aoRecriarConta, aoCriarConta }) {
  const [ident, setIdent] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [aVerificar, setAVerificar] = useState(false)
  const [esqueci, setEsqueci] = useState(false)

  async function entrar(e) {
    e.preventDefault()
    const perfil = getPerfil()
    if (!perfil) {
      // FUTURO: com backend, aqui faz-se o login remoto (a conta funcionará em qualquer dispositivo).
      setErro('Ainda não há conta neste dispositivo. Cria uma conta abaixo.')
      return
    }
    setAVerificar(true)
    try {
      const alvo = ident.trim().toLowerCase()
      const identOk = alvo === perfil.username.toLowerCase() || alvo === perfil.email.toLowerCase()
      const hash = await hashSenha(senha)
      if (identOk && hash === getSenhaHash()) aoEntrar()
      else setErro('Utilizador/email ou senha incorrectos.')
    } catch {
      setErro('Não foi possível verificar a senha. Tenta outra vez.')
    } finally {
      setAVerificar(false)
    }
  }

  function recriar() {
    // Limpa só perfil, senha e foto. Transacções, categorias e metas (IndexedDB) ficam intactas.
    limparConta()
    setEsqueci(false)
    aoRecriarConta()
  }

  return (
    <div className="safe-top safe-bottom flex h-full flex-col overflow-y-auto px-6 py-8">
      <motion.div className="my-auto" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-col items-center text-center">
          <Porquinho tamanho={100} />
          <h1 className="mt-2 font-sora text-2xl font-extrabold tracking-tight">
            Cofrinho <span className="text-dourado">AO</span>
          </h1>
          <p className="mt-1 text-sm text-textosec dark:text-textosec-dark">Bem-vindo de volta!</p>
        </div>

        <form onSubmit={entrar} className="mt-6 space-y-3" noValidate>
          <label className="block">
            <span className="mb-1 block text-sm font-medium">Utilizador ou email</span>
            <input className="campo" value={ident} onChange={(e) => { setIdent(e.target.value); setErro('') }} autoCapitalize="none" autoComplete="username" />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium">Senha</span>
            <CampoSenha value={senha} onChange={(e) => { setSenha(e.target.value); setErro('') }} autoComplete="current-password" />
          </label>
          {erro && <p role="alert" className="break-words text-sm font-medium text-rosa-dark dark:text-rosa">{erro}</p>}
          <motion.button whileTap={{ scale: 0.97 }} type="submit" disabled={aVerificar || !ident || !senha} className="btn-primario w-full disabled:opacity-50">
            {aVerificar ? 'A entrar…' : 'Entrar'}
          </motion.button>
          <button type="button" onClick={() => setEsqueci(true)} className="min-h-[44px] w-full text-sm font-semibold text-rosa">
            Esqueci a senha
          </button>
          <div className="border-t border-borda pt-3 text-center dark:border-borda-dark">
            <p className="text-sm text-textosec dark:text-textosec-dark">Ainda não tens conta?</p>
            <button type="button" onClick={aoCriarConta} className="btn-secundario mt-2 w-full">
              Criar conta
            </button>
          </div>
        </form>
      </motion.div>

      <Modal aberto={esqueci} aoFechar={() => setEsqueci(false)} titulo="Esqueci a senha">
        <div className="space-y-4 text-sm">
          <p className="break-words text-textosec dark:text-textosec-dark">
            Como ainda não há servidor, a única forma é criar de novo a conta neste telemóvel.
          </p>
          <p className="break-words font-medium">
            Os teus gastos, receitas, categorias e metas <strong>não são apagados</strong>. Só o perfil, a senha e a foto são repostos.
          </p>
          <div className="flex flex-wrap gap-2">
            <motion.button whileTap={{ scale: 0.97 }} onClick={recriar} className="btn-primario flex-1 whitespace-nowrap">Recriar conta</motion.button>
            <motion.button whileTap={{ scale: 0.97 }} onClick={() => setEsqueci(false)} className="btn-secundario flex-1">Cancelar</motion.button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
