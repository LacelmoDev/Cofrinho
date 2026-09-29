# Cofrinho AO (v2) — PWA de controlo financeiro para Angola

Controlo de gastos e receitas, metas de poupança e gestão simples de pequeno negócio, em Kwanzas (Kz). **Funciona 100% offline** depois da primeira visita. Gratuito na v1.

Stack: Vite 5 · React 18 (JSX) · Tailwind 3 · framer-motion · lucide-react · recharts · Dexie (IndexedDB) · vite-plugin-pwa.

## 1. Requisitos
- Node.js LTS
- Git
- VS Code (opcional)

## 2. Instalar e arrancar (PowerShell, Windows)

```powershell
cd .\cofrinho-ao-web
npm install
npm run dev
```

Abre `http://localhost:5173`.

Se o PowerShell disser que a execução de scripts está desactivada (`npm.ps1 cannot be loaded`), usa uma destas opções:

```powershell
# Opção A: permitir scripts só para o teu utilizador
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned

# Opção B: chamar o npm.cmd directamente
npm.cmd install
npm.cmd run dev
```

Produção local (necessário para testar a PWA e o modo offline):

```powershell
npm run build
npm run preview
```

## 3. Git desde o primeiro dia

```powershell
git init
git add .
git commit -m "chore: esqueleto do projecto"
git branch -M main
git remote add origin https://github.com/<utilizador>/cofrinho-ao-web.git
git push -u origin main
```

Commits sugeridos por fase:
- `chore: esqueleto do projecto (fase A - fundação)`
- `feat: acesso (onboarding e login)`
- `feat: núcleo financeiro (início, registos e modo negócio)`
- `feat: extras (gráficos, metas, definições, categorias e perfil)`
- `chore: acabamento (responsividade, dark mode e README)`

Faz commit a cada funcionalidade fechada, não só no fim.

## 4. Deploy gratuito (HTTPS é obrigatório para PWA)

**Vercel:** importa o repositório do GitHub. Framework: Vite. Build command: `npm run build`. Output directory: `dist`.

**Cloudflare Pages:** liga o repositório. Build command: `npm run build`. Build output directory: `dist`.

Depois de cada `git push` o site actualiza sozinho, e a PWA instalada actualiza-se na abertura seguinte (`autoUpdate`).

## 5. Instalar a PWA no Android
1. Abre o endereço do site no Chrome, com internet, e espera a app carregar por completo.
2. Usa o botão **Instalar** em Definições (aparece quando o Chrome permite), ou o menu ⋮ → **Instalar aplicação** / **Adicionar ao ecrã principal**.
3. Abre pelo ícone. Para testar o offline: liga o modo avião e abre a app.

## 6. Ícones e logótipo (a substituir)
Os ficheiros em `public/icons/` (`icon-192.png`, `icon-512.png`, `icon-maskable.png`) são **provisórios** (quadrados rosa). Substitui-os pelo logótipo final, mantendo os nomes. O porquinho usado nos ecrãs é um SVG provisório em `src/components/EmptyState.jsx` (`Porquinho`).

## 7. Segurança da senha (nota honesta)
A senha protege apenas o acesso **local**, como um PIN. É guardada como hash SHA-256 no `localStorage` deste dispositivo. Não há contas remotas nem recuperação por email: "Esqueci a senha" recria a conta local (sem apagar transacções, categorias nem metas). Autenticação remota só quando existir backend.

## 8. Decisões tomadas onde o documento não era explícito
- Onboarding: nome de utilizador com mínimo 3 caracteres e sem espaços; telefone com pelo menos 9 dígitos.
- Verificação de email simulada: o código aparece no ecrã. Se fechares o modal, gera-se um novo código.
- Início abre por defeito no filtro **Este mês**.
- Saldo negativo: valor em vermelho dentro de uma pílula branca, para ter contraste sobre o gradiente rosa.
- Categorias **padrão não se apagam** (o seed idempotente voltaria a criá-las). As criadas pelo utilizador apagam-se; os registos antigos mantêm o nome.
- Nome de categoria nova não pode repetir uma existente do mesmo tipo.
- Metas: o aviso de saldo negativo usa o saldo total do modo actual (sem filtro de período); a barra para nos 100%; apagar uma meta não apaga os gastos "Poupança" já registados.
- Gráfico: usa todos os gastos do modo actual (sem filtro de período).
- Uma transacção mantém o `modo` em que foi criada; o detalhe mostra esse modo.
- Fotos: comprimidas para JPEG, máx. 256×256 px, guardadas em `localStorage`.
- Movimento reduzido: a app respeita a preferência do sistema (`reducedMotion="user"`).
- Fontes Google (Sora/Inter) ficam em cache pelo service worker para funcionarem offline após a primeira visita.

## 9. Fora do âmbito da v1 (pontos `// FUTURO:` no código)
Backend Django, login remoto, envio real de email (Brevo), SMS, sincronização/backup na nuvem, Multicaixa/Google Play Billing, exportação de relatórios, múltiplas carteiras, integração bancária.
- Verificação de email: `src/screens/Onboarding.jsx`
- `estadoAssinatura` (sempre `"gratuito"`, sem bloqueios): `src/db/prefs.js`

## 10. Roteiro futuro
1. Backend Django + PostgreSQL (Neon) com autenticação remota e sincronização/backup.
2. Envio real de email de verificação com Brevo.
3. v1.1: assinatura via Multicaixa Express (facilitador tipo AppyPay/ProxyPay), quando existir registo legal do negócio.
4. Exportação de relatórios (PDF/CSV).
5. Empacotar para a Play Store com Bubblewrap.

## 11. Checklist de aceitação (testar à mão)
- [ ] `npm install && npm run dev` sem erros nem warnings relevantes
- [ ] Cadastro → verificação simulada → entra no app
- [ ] Fechar/reabrir → pede login; "Esqueci a senha" recria a conta sem perder dados
- [ ] Registar gasto/receita; ver, editar e apagar
- [ ] Filtro de período altera lista e saldo
- [ ] Saldo negativo aparece a vermelho com aviso
- [ ] Meta: adicionar valor desconta do saldo via transacção "Poupança"
- [ ] Modo Negócio muda categorias, "Lucro actual" e terminologia
- [ ] Criar e apagar categorias; escopo respeitado nos selects
- [ ] Gráfico donut correcto por modo
- [ ] Modo escuro persistente e sem elementos ilegíveis
- [ ] Foto de perfil funciona e persiste
- [ ] Nenhum overflow a 360×640, nem com teclado aberto
- [ ] `npm run build` + `npm run preview`: instalável e funciona offline
- [ ] Lighthouse PWA verde (com os ícones finais)

## 12. Backend e sincronização (v2 com conta)

- A app fala com a API Django (`cofrinho-ao-api`). O endereço está em `src/api/api.js` e pode ser mudado com a variável `VITE_API_URL` (ex.: ficheiro `.env.local` com `VITE_API_URL=http://192.168.x.x:8000/api` para testar com o backend no PC).
- **Sessão persistente:** depois de entrar, o token fica no dispositivo e a app abre logo (90 dias sem uso). "Sair" termina só a sessão deste dispositivo.
- **Offline primeiro:** tudo é guardado no telemóvel (IndexedDB). O motor `src/sync/sync.js` envia o que mudou e recebe o que mudou nos outros dispositivos: ao entrar, ao voltar à app, quando volta a haver rede, 2,5 s depois de cada alteração e de minuto a minuto.
- Registos apagados não desaparecem de imediato: ficam marcados como `apagado` para o apagar chegar aos outros dispositivos. Em conflitos, a última alteração ganha.
- As categorias padrão existem em cada dispositivo e não se sincronizam; só as categorias criadas pelo utilizador.
- Se outra conta entrar num dispositivo com dados de uma conta diferente, os dados locais da anterior são removidos (já estão no servidor se sincronizaram). Por isso o "Sair" tenta sincronizar primeiro.
- A foto de perfil fica só no dispositivo. O email não se altera por agora.
- O servidor gratuito do Render adormece: o primeiro pedido pode demorar até 1 minuto. A app acorda-o ao abrir e avisa quando está a demorar.
- Senha mínima: 6 caracteres. "Esqueci a senha" agora usa um código enviado por email.
