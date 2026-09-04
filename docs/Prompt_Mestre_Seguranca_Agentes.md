# Prompt Mestre de Segurança para Agentes de Desenvolvimento

## Objetivo

Este documento define as regras obrigatórias de segurança que **todo
agente de IA responsável por desenvolver, revisar ou modificar código**
deve seguir em **todos os projetos**.

> **Estas regras são mandatórias e têm prioridade sobre decisões de
> implementação.**

------------------------------------------------------------------------

## Instruções obrigatórias ao iniciar qualquer tarefa

### Projetos novos

Antes de escrever qualquer código:

1.  Considere este documento como política oficial de segurança.
2.  Implemente todas as regras descritas aqui desde a primeira linha de
    código.
3.  Nunca ignore uma regra por conveniência ou velocidade de
    desenvolvimento.

### Projetos já existentes

Antes de continuar qualquer desenvolvimento:

1.  Faça uma **revisão completa de segurança** do código existente.
2.  Identifique violações de qualquer regra deste documento.
3.  Corrija todas as vulnerabilidades encontradas.
4.  Somente depois continue implementando novas funcionalidades.

------------------------------------------------------------------------

# Second Brain (Memória Permanente)

Estas regras devem permanecer registradas no **Second Brain** do
projeto.

## Procedimento obrigatório

-   Verifique se já existe um registro sobre **Segurança** no Second
    Brain.
-   **Se existir:** complemente o registro com quaisquer regras ausentes
    deste documento.
-   **Se não existir:** crie um novo registro chamado **Segurança**.
-   Toda nova regra de segurança criada futuramente deve ser adicionada
    neste mesmo registro.
-   O registro deve ser tratado como documentação viva e obrigatória.

------------------------------------------------------------------------

# Checklist obrigatório de Segurança

## 1. Gestão de Secrets

-   Nunca colocar secrets no frontend ou no repositório.
-   API Keys privadas, senhas, tokens e Service Role Keys devem
    permanecer no backend ou Secret Manager.
-   Se um segredo for exposto, **rotacione imediatamente**. Nunca apenas
    remova do código.

------------------------------------------------------------------------

## 2. Revisão de Vulnerabilidades

Antes de qualquer deploy revisar o código procurando:

-   SQL Injection
-   XSS
-   IDOR
-   Falhas de autenticação
-   Exposição de dados
-   Validações inexistentes
-   Secrets expostos

Nenhum deploy deve ocorrer sem essa revisão.

------------------------------------------------------------------------

## 3. Autorização

-   Nunca confiar no frontend como mecanismo de segurança.
-   Botões ocultos, rotas escondidas ou verificações em React **não são
    autorização**.
-   Toda operação sensível deve ser validada novamente no backend.

### Nunca aceitar do frontend como prova de autorização

-   user_id
-   organization_id
-   tenant
-   qualquer identificador de propriedade de dados

Sempre derivar essas informações do usuário autenticado no servidor.

------------------------------------------------------------------------

## 4. Banco de Dados

### Princípio do menor privilégio

Cada perfil deve possuir apenas as permissões necessárias:

-   Anônimo
-   Autenticado
-   Backend
-   Administrador

### Supabase/Postgres

-   Utilizar RLS com política **deny-by-default**.
-   Auditar todas as RPCs e Functions.
-   Nunca deixar funções privilegiadas públicas sem necessidade.
-   Não expor schemas ou tabelas desnecessárias pela API.

### Multi-tenant

Implementar isolamento total entre clientes.

**Cliente A jamais pode acessar dados do Cliente B.**

------------------------------------------------------------------------

## 5. Testes de Segurança

Testar obrigatoriamente:

-   acesso anônimo às APIs;
-   leitura de tabelas privadas sem sessão;
-   autenticação;
-   permissões;
-   RLS;
-   WebSockets e canais Realtime.

Nenhum dado privado deve ser retornado sem autorização.

------------------------------------------------------------------------

## 6. Sessões e Autenticação

-   Confirmar e-mail antes de operações sensíveis.
-   Utilizar MFA/2FA para administradores.
-   Preferir Cookies HttpOnly + Secure + SameSite quando possível.
-   Evitar tokens sensíveis acessíveis pelo JavaScript.
-   Forçar HTTPS em produção.

------------------------------------------------------------------------

## 7. Proteção contra abuso

Implementar Rate Limiting em:

-   Login
-   Cadastro
-   Recuperação de senha
-   OTP
-   Envio de e-mails
-   Endpoints caros
-   APIs de IA

O Rate Limit deve considerar múltiplas dimensões:

-   IP
-   Conta/E-mail
-   Dispositivo
-   Contexto

Quando necessário utilizar:

-   Cloudflare Turnstile
-   hCaptcha

------------------------------------------------------------------------

## 8. Segurança da Aplicação

-   Configurar Content Security Policy corretamente.
-   Evitar CSP excessivamente permissiva.
-   Proteger WebSockets com autenticação e autorização.
-   Criptografar dados sensíveis em trânsito.
-   Quando necessário, criptografar também em repouso.
-   Para dados críticos, considerar criptografia em nível de campo.

------------------------------------------------------------------------

## 9. Infraestrutura

Se houver VPS ou servidor próprio:

-   Fechar portas não utilizadas.
-   Restringir SSH.
-   Preferir autenticação por chaves.
-   Limitar acesso administrativo.
-   Manter dependências atualizadas.
-   Monitorar vulnerabilidades conhecidas.

------------------------------------------------------------------------

## 10. Backup e Observabilidade

### Backups

-   Criar backups automáticos.
-   Testar regularmente a restauração.
-   Backup não testado não é estratégia de recuperação.

### Logs

Registrar eventos importantes:

-   Login
-   Logout
-   Alterações administrativas
-   Falhas de autenticação
-   Operações críticas

Nunca registrar:

-   Senhas
-   Tokens
-   Secrets

### Monitoramento

Configurar alertas para detectar indisponibilidade antes dos clientes.

------------------------------------------------------------------------

## 11. Qualidade antes do Deploy

Validar obrigatoriamente em **Staging**:

-   Migrations
-   RLS
-   Permissões
-   Autenticação
-   Fluxos críticos

Nunca realizar testes destrutivos em produção.

Também testar:

-   Celular físico
-   Internet lenta
-   Fluxos completos de e-mail

Os e-mails de cadastro, confirmação, login mágico, cobrança e
recuperação de senha devem funcionar corretamente e evitar spam.

------------------------------------------------------------------------

## 12. SEO, Analytics e Compartilhamento

Quando aplicável ao produto:

### Analytics

Configurar eventos úteis e mensuráveis.

### SEO

Implementar:

-   sitemap.xml
-   robots.txt
-   Search Console

### Compartilhamento

Configurar Open Graph para:

-   WhatsApp
-   LinkedIn
-   Facebook
-   Outras redes

------------------------------------------------------------------------

## 13. LGPD

Todo projeto deve possuir:

-   Termos de Uso
-   Política de Privacidade
-   Tratamento de dados compatível com a LGPD

------------------------------------------------------------------------

## 14. Documentação para IA

Quando fizer sentido, incluir **llms.txt** como documentação destinada a
agentes de IA.

Importante:

-   Não substitui SEO.
-   Não substitui documentação técnica.
-   É um complemento para agentes inteligentes.

------------------------------------------------------------------------

# Critério de Aprovação

Nenhuma tarefa será considerada concluída enquanto existir qualquer
violação destas regras.

O agente deve sempre:

1.  Revisar.
2.  Corrigir.
3.  Validar.
4.  Documentar no Second Brain.
5.  Somente então finalizar a implementação.

**Estas regras são permanentes e obrigatórias para todos os projetos
presentes e futuros.**
