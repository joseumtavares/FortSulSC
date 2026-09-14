# API — FortSulSC

Status: documentação do contrato real, mais o padrão para novos endpoints
Escopo atual: Next.js + Prisma + PostgreSQL; painel administrativo com CRUD completo (Fase 4, encerrada) e a primeira rota pública dinâmica (Fase 5, em andamento)
Última revisão: 14/09/2026

> **Governança:** consulte `PLANO_MESTRE_FORTSULSC.md` para saber a fase vigente e o escopo aprovado antes de propor qualquer rota nova.

## 1. Estado atual

O projeto tem hoje **40 rotas reais** (`route.ts` sob `src/app/api`): 39 administrativas (`/api/admin/**`, autenticação + RBAC) e 1 pública (`/api/public/partners`). A seção 2 abaixo é o inventário real, verificado direto no código; não é planejamento.

Qualquer rota **nova** continua sujeita ao fluxo normal de aprovação (`PLANO_MESTRE_FORTSULSC.md` Parte I): proposta técnica → aprovação do Jose → revisão do Claude → implementação.

## 2. APIs ativas

Rotas administrativas (`/api/admin/**`): sessão autenticada (`next-auth`) + verificação de mesma origem + RBAC por papel (`ADMIN`/`EDITOR`), via `requireAdminRequest` (`src/lib/auth/admin-route-guard.ts`). Por padrão qualquer um dos dois papéis pode chamar a rota; ações destrutivas ou sensíveis (exclusão, configurações institucionais) exigem `ADMIN` explicitamente — marcado na coluna Auth abaixo. Falha de origem → `403`; sem sessão → `401`; papel insuficiente → `403`.

| Recurso | Rotas | Métodos | Visibilidade | Auth | Arquivo-fonte |
|---|---|---|---|---|---|
| Login (senha) | `/api/admin/login/password` | POST | Admin (pré-sessão) | Nenhuma — é o próprio ponto de entrada | `src/app/api/admin/login/password/route.ts` |
| Login (código MFA) | `/api/admin/login/code` | POST | Admin (pré-sessão) | Nenhuma — valida o código enviado por e-mail | `src/app/api/admin/login/code/route.ts` |
| Logout | `/api/admin/logout` | POST | Admin | Sessão | `src/app/api/admin/logout/route.ts` |
| Produtos | `/api/admin/products`, `.../[id]`, `.../[id]/activate`, `.../[id]/deactivate`, `.../[id]/categories`, `.../[id]/images`, `.../[id]/images/[imageId]`, `.../[id]/specifications`, `.../[id]/applications`, `.../[id]/testimonials`, `.../[id]/testimonials/[testimonialId]` | GET/POST/PATCH/DELETE/PUT conforme rota | Admin | `ADMIN`+`EDITOR` (padrão); `DELETE` do produto restrito a `ADMIN` | `src/app/api/admin/products/**` |
| Categorias | `/api/admin/categories`, `.../[id]`, `.../[id]/activate`, `.../[id]/deactivate` | GET/POST/PATCH/DELETE | Admin | `ADMIN`+`EDITOR` | `src/app/api/admin/categories/**` |
| Artigos (Novidades) | `/api/admin/articles`, `.../[id]`, `.../[id]/publish`, `.../[id]/unpublish`, `.../[id]/cover`, `.../[id]/images`, `.../[id]/images/[imageId]` | GET/POST/PATCH/DELETE | Admin | `ADMIN`+`EDITOR` | `src/app/api/admin/articles/**` |
| Banners | `/api/admin/banners`, `.../[id]`, `.../[id]/activate`, `.../[id]/deactivate`, `.../[id]/image` | GET/POST/PATCH | Admin | `ADMIN`+`EDITOR` | `src/app/api/admin/banners/**` |
| Configurações institucionais | `/api/admin/institutional-settings` | GET/PUT | Admin | `ADMIN`+`EDITOR` para `GET`; `PUT` restrito a `ADMIN` | `src/app/api/admin/institutional-settings/route.ts` |
| Parceiros (representantes/revendas) | `/api/admin/partners`, `.../[id]`, `.../[id]/activate`, `.../[id]/deactivate`, `.../[id]/commercial-areas`, `.../[id]/logo`, `.../[id]/private` | GET/POST/PATCH/DELETE/PUT | Admin | `ADMIN`+`EDITOR` (padrão); `DELETE` e dados privados (LGPD) restritos a `ADMIN` | `src/app/api/admin/partners/**` |
| Áreas comerciais / municípios | `/api/admin/commercial-areas`, `.../[id]`, `.../[id]/municipalities` | GET/POST/PATCH/DELETE/PUT | Admin | `ADMIN`+`EDITOR` | `src/app/api/admin/commercial-areas/**` |
| Mapa de representantes | `/api/public/partners` | GET | **Pública** | Nenhuma — rate limit de 30 req/min por IP, bloqueado antes de consultar o banco | `src/app/api/public/partners/route.ts` |

## 3. Cobertura vs. planejamento original

Todos os módulos antes listados como "previstos" já têm CRUD administrativo implementado: produtos, categorias, representantes, revendas, regiões (via áreas comerciais/municípios), banners, autenticação administrativa, uploads (capa de artigo, imagem de banner, logo de parceiro). O único módulo do planejamento original ainda não implementado é **contato/orçamento** — segue dependendo de aprovação específica se e quando for priorizado.

## 4. Modelo obrigatório para documentar novos endpoints

Quando uma API for aprovada e implementada, cada endpoint deverá seguir este formato:

```md
## Nome do endpoint

- URL:
- Método HTTP:
- Descrição:
- Status:
- Visibilidade:
  - Pública
  - Administrativa
- Headers necessários:
- Autenticação:
- Permissões:
- Body da requisição:
- Resposta de sucesso:
- Respostas de erro:
- Exemplo completo:
- Observações de segurança:
```

## 5. Convenções para endpoints

### 5.1 Nomenclatura

Nomes em inglês no código, URLs em plural — seguido em todas as 40 rotas reais:

- `/api/admin/products`;
- `/api/admin/categories`;
- `/api/admin/partners` (representantes e revendas, diferenciados por `type`);
- `/api/admin/banners`.

As URLs públicas expõem apenas dados públicos e estritamente necessários (ver `select` explícito em `src/lib/content/partner-public-repository.ts`).

### 5.2 Separação entre público e admin

Seguido em todas as rotas reais:

```text
/api/public/...   → sem sessão, dados já públicos por definição
/api/admin/...    → exige requireAdminRequest (sessão + RBAC + mesma origem)
```

### 5.3 Resposta padrão (formato realmente usado, verificado no código)

Sucesso — o corpo da resposta é o dado em si, **sem** envelope `data`/`meta`:

```json
[{ "id": "...", "name": "..." }]
```

Criação (`POST`) devolve só o identificador criado, com `201`:

```json
{ "id": "novo_id" }
```

Erro — objeto `error` com mensagem direta, **sem** `code` estruturado, com o `status` HTTP apropriado (`400` validação, `401` sem sessão, `403` origem inválida ou papel insuficiente, `404` não encontrado, `409` conflito, `429` rate limit, `500` erro interno):

```json
{ "error": "Mensagem segura para o usuário." }
```

> Histórico: uma versão anterior deste documento descrevia um envelope `{ data, meta }`/`{ error: { code, message } }` que nunca chegou a ser implementado. Esta seção documenta o contrato real — não houve mudança de comportamento da API para gerar esta correção, só a correção da documentação.

Não retornar stack trace, query SQL, tokens, segredos ou detalhes internos — seguido em todas as rotas (ver `catch` genérico + `logger.error` com categoria do erro, nunca a mensagem crua do provedor/banco).

### 5.4 Segurança de dados

Regras obrigatórias, já seguidas pelas rotas existentes:

- nunca retornar objeto completo do Prisma em rota pública;
- usar `select` explícito em consultas públicas;
- separar dados públicos e privados de representantes;
- nunca expor `DATABASE_URL` ou segredos em variáveis `NEXT_PUBLIC_*`;
- validar entrada com schema antes de gravar dados;
- registrar auditoria em operações administrativas sensíveis;
- não logar CPF, documentos, dados bancários, endereço privado ou telefone pessoal.

## 6. Exemplo real, seguindo o modelo da seção 4

### Listar parceiros públicos

- URL: `/api/public/partners`
- Método HTTP: `GET`
- Descrição: retorna representantes/revendas ativos para o mapa público (`RepresentativeMapPanel`).
- Status: implementado (Fase 5).
- Visibilidade: pública.
- Headers necessários: nenhum especial.
- Autenticação: não exige.
- Permissões: nenhuma (dado já público por definição).
- Body da requisição: não possui.
- Resposta de sucesso (`200`):

```json
[
  {
    "id": "partner_id",
    "type": "REPRESENTATIVE",
    "name": "Nome do parceiro",
    "description": "Atende a região sul.",
    "whatsapp": "5548999990000",
    "websiteUrl": null,
    "logoUrl": "https://.../logo.webp",
    "approximateLat": -27.6,
    "approximateLng": -48.55,
    "socialLinks": { "instagram": "https://instagram.com/..." },
    "municipalities": ["Orleans", "Tubarão"]
  }
]
```

- Respostas de erro:
  - `429`: limite de 30 requisições/minuto por IP excedido (`Retry-After` em segundos no header).
  - `500`: erro interno genérico, sem detalhe do banco.
- Observações de segurança:
  - `select` explícito (`src/lib/content/partner-public-repository.ts`) — nunca inclui `PartnerPrivate` (documento/consentimento LGPD) nem `logoKey`/timestamps internos;
  - rate limit checado antes de qualquer consulta ao banco;
  - resultado cacheado em memória por 2 minutos, sem invalidação manual nas rotas administrativas (`docs/Proposta_Fase5_Cache_Partners_Publicos.md`);
  - consulta limitada a 500 registros (`take: 500`), com log de aviso se o teto for atingido — rede de segurança, não paginação (`docs/Proposta_Fase5_Limite_Partners_Publicos.md`).

## 7. Regra final

Este arquivo documenta o contrato real das 40 rotas existentes e define o padrão (seção 4) para qualquer rota **nova**. Não autoriza, por si só, a criação de rotas, regras de negócio ou mudanças de contrato — isso continua exigindo o fluxo de aprovação do Plano Mestre.
