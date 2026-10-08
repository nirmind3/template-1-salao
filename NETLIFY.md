# Guia de Deploy no Netlify - Template de Salão

Este projeto foi totalmente preparado e testado para publicação no **Netlify**.

---

## 1. Arquivos de Configuração Inclusos

1. **`netlify.toml`**:
   - Configura o comando de build: `npm run build`
   - Configura o diretório de publicação: `dist`
   - Redireciona `/api/*` automaticamente para as Netlify Functions (`netlify/functions/api.ts`).
   - Redireciona `/*` para `/index.html` (SPA fallback sem erro 404 ao recarregar a página).

2. **`public/_redirects`**:
   - Garante que ao recarregar qualquer página no Netlify, o roteamento continue funcionando perfeitamente.

3. **`netlify/functions/api.ts`**:
   - Handler Serverless que atende aos endpoints da API (`/api/auth/login`, `/api/auth/verify`, `/api/auth/change-password`, `/api/data`) em ambiente serverless.

---

## 2. Como Fazer o Deploy no Netlify

### Opção A: Conectando via GitHub (Recomendado)
1. Suba o projeto para seu repositório no **GitHub**.
2. Acesse [app.netlify.com](https://app.netlify.com) e clique em **"Add new site" > "Import an existing project"**.
3. Selecione o **GitHub** e escolha o repositório do salão.
4. O Netlify detectará automaticamente as configurações do arquivo `netlify.toml`:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Functions directory**: `netlify/functions`
5. Clique em **"Deploy site"**.

### Opção B: Deploy Manual via Netlify Drop (Arrastar e Soltar)
1. Execute `npm run build` no seu terminal.
2. A pasta `dist` será gerada com os arquivos estáticos e o arquivo `_redirects`.
3. Acesse [app.netlify.com/drop](https://app.netlify.com/drop) e arraste a pasta `dist`.

---

## 3. Variáveis de Ambiente no Netlify (Opcional)

No painel do seu site no Netlify, em **Site configuration > Environment variables**, você pode definir:

- `ADMIN_INITIAL_USERNAME`: Nome do usuário administrador inicial (padrão: `admin`)
- `ADMIN_INITIAL_PASSWORD`: Senha inicial do administrador (**obrigatória**, sem valor padrão; sem ela o administrador não é criado e o painel fica inacessível). Use uma senha forte e troque-a na aba Segurança do painel após o primeiro acesso.

---

## 4. Segurança do Banco de Dados & Front-End

- **Zero tokens ou senhas no código front-end**: Nenhuma credencial está escrita no código React ou no bundle compilado.
- **Armazenamento com Hash e Salt Criptográfico**: As senhas são processadas com scrypt e salt randômico de 16 bytes.
- **Sessões Temporizadas**: O token gerado expira em 24h e é validado no servidor a cada requisição.
