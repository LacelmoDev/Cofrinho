import { useState } from 'react'
import { motion } from 'framer-motion'
import { Porquinho } from '../components/EmptyState'
import CampoSenha from '../components/CampoSenha'
import VerificarEmailModal from '../components/VerificarEmailModal'
import ResetSenhaModal from '../components/ResetSenhaModal'
import { api, nomeDispositivo } from '../api/api'
import useLento from '../utils/useLento'

export default function Login({ aoAutenticado, aoCriarConta, aviso, aoMensagem }) {
  const [ident, setIdent] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [aEntrar, setAEntrar] = useState(false)
  const [verificar, setVerificar] = useState(null) // { email }
  const [reset, setReset] = useState(false)
  const lento = useLento(aEntrar)

  async function entrar(e) {
    e.preventDefault()
    setAEntrar(true)
    setErro('')
    try {
      const dados = await api.post('/auth/login/', { identificador: ident.trim(), senha, dispositivo: nomeDispositivo() }, { auth: false, timeout: 60000 })
      aoAutenticado(dados)
    } catch (err) {
      if (err.codigo === 'email_nao_verificado' && err.dados?.email) setVerificar({ email: err.dados.email })
      else setErro(err.message)
    } finally {
      setAEntrar(false)
    }
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

        {aviso && <p role="status" className="mt-4 break-words rounded-2xl bg-dourado/15 p-3 text-center text-sm font-medium">{aviso}</p>}

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
          <motion.button whileTap={{ scale: 0.97 }} type="submit" disabled={aEntrar || !ident || !senha} className="btn-primario w-full disabled:opacity-50">
            {aEntrar ? 'A entrar…' : 'Entrar'}
          </motion.button>
          {lento && <p className="text-center text-xs text-textosec dark:text-textosec-dark">A ligar ao servidor… pode demorar até 1 minuto na primeira vez.</p>}
          <button type="button" onClick={() => setReset(true)} className="min-h-[44px] w-full text-sm font-semibold text-rosa">
            Esqueci a senha
          </button>
          <div className="border-t border-borda pt-3 text-center dark:border-borda-dark">
            <p className="text-sm text-textosec dark:text-textosec-dark">Ainda não tens conta?</p>
            <button type="button" onClick={aoCriarConta} className="btn-secundario mt-2 w-full">Criar conta</button>
          </div>
        </form>
      </motion.div>

      <VerificarEmailModal
        aberto={!!verificar}
        email={verificar?.email || ''}
        pedirAoAbrir
        aoFechar={() => setVerificar(null)}
        aoVerificado={(d) => { setVerificar(null); aoAutenticado(d) }}
      />
      <ResetSenhaModal
        aberto={reset}
        emailInicial={ident}
        aoFechar={() => setReset(false)}
        aoConcluido={() => { setReset(false); aoMensagem('Senha alterada. Entra com a nova senha.') }}
      />
    </div>
  )
}
