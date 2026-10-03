# Cofrinho AO — transformar a PWA num APK

**Importante:** não consegui gerar o APK aqui, porque é preciso o Android SDK/JDK e uma chave de assinatura que tem de ser tua. Este kit deixa tudo preparado e explica como o gerar em poucos minutos. Não testei estes passos num telemóvel.

## O que é
O APK é uma "casca" Android (uma *Trusted Web Activity*) que abre o teu site em ecrã inteiro, sem a barra do navegador. **O conteúdo continua a ser o da web:** quando actualizas o site na Vercel, a app Android actualiza-se sozinha. Só precisas de um APK novo para mudar o ícone, o nome ou a versão.

Só para Android. No iPhone continua a ser a PWA (Safari → Partilhar → Adicionar ao ecrã principal).

## Caminho A — PWABuilder (o mais rápido, sem instalar nada)
1. Faz primeiro o deploy do front com o `vite.config.js` e as capturas deste pacote (o manifesto passa a ter `id`, `scope`, categorias e screenshots).
2. Abre **pwabuilder.com**, cola `https://cofrinho-iota.vercel.app` e carrega em **Start**. Vê se a PWA passa (manifesto + service worker).
3. **Package for stores → Android**. Preenche:
   - **Package ID:** `ao.livsolution.cofrinho` (único e não se muda depois de publicares na Play Store)
   - **App name:** Cofrinho AO · **Version:** 1.0.0 · **Version code:** 1
   - **Signing key:** *Create new* (o PWABuilder gera uma chave para ti)
4. Descarrega o `.zip`. Dentro vêm o **APK**, o **AAB** (para a Play Store), o ficheiro da **chave de assinatura (`.keystore`)** com a sua palavra-passe, e as instruções.
5. **Guarda a chave e a palavra-passe em segurança (cópia fora do PC).** Se a perderes, não consegues actualizar a app na Play Store.

## Passo obrigatório — Digital Asset Links
Sem isto, a app abre com a barra do Chrome por cima, em vez de ecrã inteiro.
1. Descobre o **SHA-256** da chave (o zip do PWABuilder traz-o; ou: `keytool -list -v -keystore signing.keystore`).
2. Copia `assetlinks.template.json` para `cofrinho-ao-web/public/.well-known/assetlinks.json` e troca o fingerprint (formato `AA:BB:CC:…`).
3. Faz deploy e abre `https://cofrinho-iota.vercel.app/.well-known/assetlinks.json`: tem de mostrar o JSON.

(O `vite.config.js` deste pacote já impede que o service worker tape esse endereço.)

## Caminho B — Bubblewrap (linha de comandos)
```powershell
npm i -g @bubblewrap/cli
bubblewrap init --manifest https://cofrinho-iota.vercel.app/manifest.webmanifest
bubblewrap build
```
Na primeira vez, o Bubblewrap pede para descarregar o JDK e o Android SDK (alguns GB). Com a tua rede lenta, o Caminho A é mais prático.

## Distribuir o APK no teu site (sem Play Store)
1. Põe o ficheiro em `cofrinho-landing/downloads/cofrinho-ao-v1.0.0.apk`.
2. No `index.html` da landing: `apkUrl: "downloads/cofrinho-ao-v1.0.0.apk"` e `apkInfo: "v1.0.0 · X MB"`.
3. Faz deploy. O botão "Baixar APK" passa a funcionar.

O que os utilizadores vão ver: o Android pede para **permitir instalações dessa origem**, e o Google Play Protect pode avisar que a app é de um programador desconhecido. É normal em APKs fora da loja, e a landing já avisa disso. Testa tu primeiro, num telemóvel Android, antes de divulgares.

## Play Store (não é para segunda-feira)
- Conta de programador Google: pagamento único (cerca de 25 USD).
- Para a loja usa o **AAB**, não o APK.
- Precisas do link da Política de Privacidade (já tens), do formulário de **Segurança dos dados** (declara o que recolhes: nome, email e os registos financeiros que o utilizador escreve) e das declarações para apps de finanças.
- Contas pessoais novas costumam ter de fazer um **teste fechado** com testadores durante cerca de duas semanas antes de poderem publicar. Confirma as regras actuais na Play Console, que mudam.
- A Play Store tem regras próprias para pagamentos dentro da app; confirma-as antes de cobrares algo.
