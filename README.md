# VOLANTEMINHO - Portal de Apoio às Lojas

Sistema de gestão de pedidos de apoio com aprovação em duas etapas, notificações WhatsApp e calendário de disponibilidade.

## 🚀 Funcionalidades

- **3 Níveis de Utilizadores:**
  - **Admin:** Gere lojas, utilizadores e aprova pedidos
  - **Loja:** Cria pedidos de apoio e consulta histórico
  - **Gestor:** Confirma pedidos aprovados e gere disponibilidade

- **Sistema de Pedidos:**
  - Tipos: Serviço, Cobertura Férias, Outros
  - Fluxo de aprovação em 2 etapas (Admin → Gestor)
  - Estados: Pendente, Aprovado, Confirmado, Cancelado, Rejeitado

- **Notificações WhatsApp:**
  - Notificação para Admin quando loja cria pedido
  - Notificação para Gestor quando Admin aprova
  - Notificação para Loja quando Gestor confirma/cancela

- **Calendário:**
  - Vista mensal com disponibilidade
  - Código de cores (verde=livre, amarelo=pendente, vermelho=ocupado)
  - Gestor pode marcar dias indisponíveis

- **Estatísticas:**
  - Dashboard com métricas globais
  - Pedidos por tipo e por loja
  - Taxa de aprovação

## 📦 Stack Tecnológica

- **Frontend:** React 19 + TypeScript + Tailwind CSS + shadcn/ui
- **Backend:** Node.js + Express + tRPC
- **Base de Dados:** PostgreSQL (Neon)
- **Autenticação:** JWT + bcrypt
- **Notificações:** Twilio WhatsApp Business API
- **Deploy:** Netlify + Neon

## 🔧 Configuração Local

### Pré-requisitos

- Node.js 22+
- pnpm
- Conta Neon (PostgreSQL)
- Conta Twilio (WhatsApp)

### Instalação

```bash
# Clonar repositório
git clone https://github.com/OLDmamorim/volanteminho.git
cd volanteminho

# Instalar dependências
pnpm install

# Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com as suas credenciais

# Aplicar migrações da base de dados
pnpm db:push

# Iniciar servidor de desenvolvimento
pnpm dev
```

### Variáveis de Ambiente

Criar ficheiro `.env` na raiz do projeto:

```env
# Base de Dados Neon
DATABASE_URL=postgresql://user:password@host/database?sslmode=require

# JWT Secret (gerar com: openssl rand -base64 32)
JWT_SECRET=your-secret-key-here

# Twilio WhatsApp
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886

# URL do Portal (para notificações)
VITE_APP_URL=https://volanteminho.netlify.app

# Título e Logo
VITE_APP_TITLE=VOLANTEMINHO
VITE_APP_LOGO=https://your-logo-url.com/logo.png
```

## 🌐 Deploy no Netlify

### 1. Conectar Repositório

1. Aceder a [Netlify](https://app.netlify.com)
2. Clicar em "Add new site" → "Import an existing project"
3. Escolher "GitHub" e selecionar o repositório `volanteminho`

### 2. Configurar Build Settings

- **Build command:** `pnpm install && pnpm build`
- **Publish directory:** `client/dist`
- **Functions directory:** `netlify/functions`

### 3. Configurar Variáveis de Ambiente

No Netlify, ir a **Site settings → Environment variables** e adicionar:

```
DATABASE_URL=postgresql://...
JWT_SECRET=...
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_WHATSAPP_NUMBER=...
VITE_APP_URL=https://volanteminho.netlify.app
VITE_APP_TITLE=VOLANTEMINHO
```

### 4. Deploy

Clicar em "Deploy site". O Netlify irá:
- Instalar dependências
- Compilar frontend e backend
- Fazer deploy automático

## 🗄️ Base de Dados Neon

### Criar Base de Dados

1. Aceder a [Neon Console](https://console.neon.tech)
2. Criar novo projeto: `volanteminho`
3. Copiar connection string
4. Adicionar ao `.env` e Netlify

### Aplicar Schema

```bash
# Local
pnpm db:push

# Produção (após deploy)
# As migrações são aplicadas automaticamente no primeiro acesso
```

## 📱 Configurar WhatsApp (Twilio)

### 1. Criar Conta Twilio

1. Aceder a [Twilio Console](https://console.twilio.com)
2. Criar conta e verificar número de telefone

### 2. Configurar WhatsApp Sandbox (Teste)

1. Ir a **Messaging → Try it out → Send a WhatsApp message**
2. Seguir instruções para conectar WhatsApp ao sandbox
3. Copiar credenciais:
   - Account SID
   - Auth Token
   - WhatsApp Number (sandbox)

### 3. WhatsApp Business API (Produção)

Para produção, precisa de:
1. Aplicar para [WhatsApp Business API](https://www.twilio.com/whatsapp)
2. Verificar negócio com Meta
3. Obter número WhatsApp Business aprovado

## 👥 Criar Utilizadores Iniciais

### Via Código (Recomendado)

Criar script `scripts/seed.ts`:

```typescript
import bcrypt from 'bcryptjs';
import { createUser, createLoja } from '../server/db';

async function seed() {
  // Criar Admin
  await createUser({
    username: 'admin',
    password: await bcrypt.hash('admin123', 10),
    name: 'Administrador',
    role: 'admin',
    whatsapp: '+351912345678',
    openId: 'local_admin_' + Date.now(),
  });

  // Criar Gestor (Hugo Silva)
  await createUser({
    username: 'hugo',
    password: await bcrypt.hash('hugo123', 10),
    name: 'Hugo Silva',
    role: 'gestor',
    whatsapp: '+351987654321',
    openId: 'local_hugo_' + Date.now(),
  });

  // Criar Loja
  const lojaResult = await createLoja({
    nome: 'Loja Barcelos',
    codigo: 'BCL001',
    contacto: '253 123 456',
    active: true,
  });

  // Criar Utilizador Loja
  await createUser({
    username: 'barcelos',
    password: await bcrypt.hash('Barcelos2025', 10),
    name: 'Loja Barcelos',
    role: 'loja',
    lojaId: lojaResult.insertId,
    whatsapp: '+351911111111',
    openId: 'local_barcelos_' + Date.now(),
  });

  console.log('✅ Dados iniciais criados!');
}

seed();
```

Executar:
```bash
pnpm tsx scripts/seed.ts
```

## 🔐 Credenciais de Acesso (Exemplo)

| Utilizador | Username | Password | Tipo |
|------------|----------|----------|------|
| Admin | admin | admin123 | Administrador |
| Gestor | hugo | hugo123 | Gestor (Hugo Silva) |
| Loja | barcelos | Barcelos2025 | Loja |

**⚠️ IMPORTANTE:** Alterar passwords em produção!

## 📊 Estrutura da Base de Dados

### Tabelas

- `users` - Utilizadores do sistema
- `lojas` - Lojas registadas
- `pedidos` - Pedidos de apoio
- `aprovacoes` - Workflow de aprovações
- `notificacoes` - Histórico de notificações WhatsApp
- `indisponibilidades` - Dias indisponíveis do gestor

## 🛠️ Scripts Disponíveis

```bash
# Desenvolvimento
pnpm dev              # Iniciar servidor dev

# Base de Dados
pnpm db:push          # Aplicar schema à BD
pnpm db:studio        # Abrir Drizzle Studio

# Build
pnpm build            # Compilar para produção
pnpm preview          # Preview da build

# Testes
pnpm type-check       # Verificar tipos TypeScript
```

## 📝 Fluxo de Trabalho

### 1. Loja Cria Pedido
- Acede ao portal
- Clica em "Novo Pedido"
- Preenche tipo, data, descrição
- Submete pedido

### 2. Admin Recebe Notificação
- Recebe WhatsApp com detalhes
- Acede ao portal
- Aprova ou rejeita pedido

### 3. Gestor Recebe Notificação (se aprovado)
- Recebe WhatsApp
- Acede ao portal
- Confirma ou cancela pedido

### 4. Loja Recebe Confirmação
- Recebe WhatsApp com estado final
- Consulta calendário e histórico

## 🐛 Troubleshooting

### Erro de Conexão à Base de Dados

```
Error: connect ECONNREFUSED
```

**Solução:** Verificar `DATABASE_URL` no `.env` e garantir que Neon está acessível.

### Notificações WhatsApp Não Enviam

```
Error: Authentication Error
```

**Solução:** Verificar credenciais Twilio no `.env`.

### Build Falha no Netlify

```
Error: Cannot find module 'bcryptjs'
```

**Solução:** Garantir que `bcryptjs` está em `dependencies` (não `devDependencies`).

## 📞 Suporte

Para questões ou problemas, contactar o administrador do sistema.

## 📄 Licença

Propriedade privada. Todos os direitos reservados.
