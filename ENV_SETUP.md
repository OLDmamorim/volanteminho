# Configuração de Variáveis de Ambiente

## Netlify Environment Variables

Aceder a **Site settings → Environment variables** no Netlify e adicionar:

### Base de Dados (Neon)

```
DATABASE_URL=postgresql://neondb_owner:SENHA@ep-...neon.tech/neondb?sslmode=require
```

**Como obter:**
1. Aceder a [Neon Console](https://console.neon.tech)
2. Selecionar projeto
3. Copiar "Connection string" da dashboard

### JWT Secret

```
JWT_SECRET=gerar-string-aleatoria-segura-aqui
```

**Como gerar:**
```bash
openssl rand -base64 32
```

### Twilio WhatsApp

```
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
```

**Como obter:**
1. Aceder a [Twilio Console](https://console.twilio.com)
2. Dashboard → Account Info
3. Copiar Account SID e Auth Token
4. Para sandbox: usar `whatsapp:+14155238886`
5. Para produção: usar número WhatsApp Business aprovado

### URL do Portal

```
VITE_APP_URL=https://volanteminho.netlify.app
```

**Nota:** Atualizar após deploy com URL real do Netlify

### Branding

```
VITE_APP_TITLE=VOLANTEMINHO
VITE_APP_LOGO=https://url-do-logo.com/logo.png
```

## Variáveis Opcionais (OAuth Manus)

Se quiser usar autenticação OAuth do Manus (opcional):

```
VITE_APP_ID=your-app-id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im
OWNER_OPEN_ID=your-owner-openid
OWNER_NAME=Your Name
```

## Resumo de Todas as Variáveis

| Variável | Obrigatória | Descrição |
|----------|-------------|-----------|
| DATABASE_URL | ✅ | Connection string Neon PostgreSQL |
| JWT_SECRET | ✅ | Chave secreta para JWT |
| TWILIO_ACCOUNT_SID | ✅ | Twilio Account SID |
| TWILIO_AUTH_TOKEN | ✅ | Twilio Auth Token |
| TWILIO_WHATSAPP_NUMBER | ✅ | Número WhatsApp Twilio |
| VITE_APP_URL | ✅ | URL do portal (para notificações) |
| VITE_APP_TITLE | ❌ | Título do portal (default: VOLANTEMINHO) |
| VITE_APP_LOGO | ❌ | URL do logo |

## Testar Configuração

Após configurar todas as variáveis no Netlify:

1. Fazer novo deploy
2. Aceder ao portal
3. Criar utilizador de teste
4. Testar login
5. Criar pedido de teste
6. Verificar se notificações WhatsApp funcionam
