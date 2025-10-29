# Portal de Apoio às Lojas - TODO

## Funcionalidades Base
- [ ] Configurar schema da base de dados (users, lojas, pedidos, aprovacoes, notificacoes)
- [ ] Sistema de autenticação com 3 níveis (Admin, Loja, Gestor)
- [ ] Layout responsivo mobile e desktop

## Dashboard Admin
- [ ] Criar página de dashboard admin
- [ ] Gestão de lojas (criar, editar, desativar)
- [ ] Gestão de utilizadores
- [ ] Lista de pedidos pendentes de aprovação
- [ ] Aprovar/rejeitar pedidos
- [ ] Estatísticas globais (pedidos por loja, tipos mais requisitados)

## Dashboard Loja
- [ ] Criar página de dashboard loja
- [ ] Formulário de novo pedido de apoio (tipo, data, descrição)
- [ ] Calendário visual com disponibilidade do gestor
- [ ] Lista de pedidos próprios com estados
- [ ] Histórico completo de pedidos

## Dashboard Gestor
- [ ] Criar página de dashboard gestor
- [ ] Lista de pedidos aprovados pendentes de confirmação
- [ ] Aceitar/pendente/cancelar pedidos
- [ ] Calendário mensal com apoios confirmados
- [ ] Marcar dias como indisponível
- [ ] Estatísticas (dias trabalhados, lojas atendidas, tipos de serviço)
- [ ] Histórico completo de apoios

## Sistema de Pedidos
- [ ] Criar endpoints tRPC para pedidos
- [ ] Fluxo de aprovação em duas etapas (Admin → Gestor)
- [ ] Estados dos pedidos (pendente, aprovado_admin, confirmado, cancelado, rejeitado)
- [ ] Tipos de apoio (Serviço, Cobertura Férias, Outros)

## Calendário
- [ ] Componente de calendário visual
- [ ] Código de cores (verde=livre, amarelo=pendente, vermelho=ocupado)
- [ ] Detalhes ao clicar em dia ocupado
- [ ] Gestor pode marcar indisponibilidade

## Notificações WhatsApp
- [ ] Integrar Twilio WhatsApp Business API
- [ ] Notificação para Admin quando loja cria pedido
- [ ] Notificação para Gestor quando Admin aprova
- [ ] Notificação para Loja quando Gestor confirma/cancela
- [ ] Templates de mensagens WhatsApp

## Deploy e Documentação
- [ ] Preparar instruções de deploy para Netlify
- [ ] Configurar variáveis de ambiente para Neon DB
- [ ] Configurar variáveis de ambiente para Twilio
- [ ] Documentação de setup e utilização
- [ ] Criar dados de seed para testes

## Alterações de Branding
- [x] Alterar título do portal para "VOLANTEMINHO"
- [x] Atualizar todas as referências ao nome do portal

## Deploy e Configuração
- [x] Configurar repositório GitHub (volanteminho)
- [x] Preparar configuração Netlify
- [x] Configurar variáveis de ambiente Neon
- [x] Criar README com instruções
- [x] Push para GitHub

## Design e Branding
- [x] Redesenhar página de login com fundo gradiente azul/roxo
- [x] Adicionar logo ExpressGlass
- [x] Alterar título para "Apoio Minho"
- [x] Estilizar inputs e botão conforme exemplo
