# Arquitetura — FortSulSC

Status: arquitetura planejada, com frontend estático em andamento
Última revisão: 2026-08-21

> **Governança:** o status de execução de cada fase (concluída/parcial/bloqueada) é controlado em `PLANO_MESTRE_FORTSULSC.md`. Este documento descreve a arquitetura técnica; não deve ser usado para acompanhar andamento de fase.

## 1. Visão geral

A FortSulSC está sendo reformulada a partir de um site WordPress/Elementor para uma experiência moderna, responsiva e preparada para evoluir para uma aplicação full stack.

A arquitetura será conduzida em fases:

1. planejamento e documentação;
2. design/frontend;
3. estrutura Next.js;
4. Docker — fundação de conteinerização, antes da modelagem de banco;
5. backend, banco e regras de negócio somente após aprovação;
6. painel administrativo;
7. mapa, segurança, testes e deploy.

## 2. Estado atual da aplicação

Atualmente o projeto possui uma proposta frontend estática:

```text
FortSulSC/
├── index.html
├── styles.css
├── script.js
├── package.json
├── preview.mjs
├── README.md
├── CLAUDE.md
├── docs/
└── image/
```

> Atenção: também existe hoje na raiz do repositório o arquivo `recovery-codes-vercel-fortsul.txt`, que **não deveria estar versionado** (contém segredo real). Ver pendência de segurança em `PLANO_MESTRE_FORTSULSC.md`, seção 0.2, antes de qualquer commit.

O frontend atual contempla:

- home responsiva;
- menu mobile;
- seções institucionais;
- cards de soluções;
- filtros visuais;
- seção de representantes;
- CTA para WhatsApp;
- rodapé.

Não existe ainda:

- backend;
- banco de dados;
- autenticação;
- CRUD;
- API;
- regras de negócio.

## 3. Arquitetura futura planejada

```text
Internet
   ↓
HTTPS
   ↓
Next.js
   ↓
┌────────────────────────────┬────────────────────────────┐
│ Site público               │ Área administrativa         │
│ Home                       │ Login                       │
│ Produtos                   │ Produtos                    │
│ Representantes             │ Categorias                  │
│ Revendas                   │ Representantes              │
│ Contato                    │ Revendas                    │
│ Conteúdos                  │ Banners                     │
└────────────────────────────┴────────────────────────────┘
   ↓
Data Access Layer
   ↓
Prisma
   ↓
PostgreSQL
   ↓
Dados públicos e privados separados
```

## 4. Stack planejada

| Camada | Tecnologia | Status |
|---|---|---|
| Framework | Next.js | Planejado |
| Linguagem | TypeScript | Planejado |
| UI | Tailwind CSS + shadcn/ui | Planejado |
| Frontend | React | Planejado |
| ORM | Prisma | Planejado |
| Banco | PostgreSQL | Planejado |
| Autenticação | Auth.js | Planejado |
| Mapa | Leaflet + OpenStreetMap | Planejado |
| Storage | Cloudinary, R2 ou S3-compatible | A decidir |
| Deploy | Vercel ou equivalente | A decidir |
| Conteinerização | Docker + Docker Compose | Planejado — ver Fase Docker no Plano Mestre |

## 5. Organização de pastas futura

Estrutura desejada para a fase Next.js:

```text
src/
├── app/
│   ├── (site)/
│   │   ├── page.tsx
│   │   ├── produtos/
│   │   ├── representantes/
│   │   ├── revendas/
│   │   └── contato/
│   ├── admin/
│   │   ├── layout.tsx
│   │   ├── dashboard/
│   │   ├── produtos/
│   │   ├── categorias/
│   │   ├── representantes/
│   │   ├── revendas/
│   │   ├── banners/
│   │   └── configuracoes/
│   ├── api/
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/
│   ├── layout/
│   ├── sections/
│   ├── products/
│   ├── maps/
│   └── admin/
├── features/
│   ├── products/
│   ├── representatives/
│   ├── resellers/
│   └── banners/
├── lib/
├── schemas/
├── types/
└── config/
```

Essa estrutura ainda não deve ser implementada sem validação da próxima etapa.

## 6. Fluxo do site público

Fluxo público esperado:

```text
Usuário
   ↓
Home
   ↓
Soluções / Produtos / Representantes
   ↓
CTA
   ↓
WhatsApp ou contato aprovado
```

Objetivo do site público:

- apresentar a FortSulSC;
- comunicar soluções agrícolas;
- facilitar pedido de orçamento;
- direcionar usuário para representantes/revendas;
- manter boa performance e SEO.

## 7. Estrutura frontend

O frontend deve ser componentizado por responsabilidade visual:

- layout;
- navegação;
- seções de página;
- cards;
- botões;
- filtros;
- mapa;
- rodapé.

Regra de ouro: componente visual não deve conter regra de negócio. Quando houver backend, regras e acesso a dados devem ficar em camadas próprias.

## 8. Estrutura backend futura

Backend previsto:

- Server Actions;
- Route Handlers;
- Prisma;
- PostgreSQL;
- validação com schemas;
- camada explícita de acesso a dados.

Nada disso está implementado hoje.

## 9. Fluxo de autenticação futuro

O `/admin` deverá ser protegido:

```text
Usuário acessa /admin
   ↓
Auth.js verifica sessão
   ↓
Sistema verifica papel/permissão
   ↓
Dashboard libera apenas módulos autorizados
```

Perfis planejados:

- Admin;
- Editor;
- Comercial;
- Visualizador.

Esses perfis ainda precisam de aprovação antes de virarem regra de negócio.

## 10. Fluxo de dados futuro

Regra crítica:

```text
Site público → somente dados públicos
Admin → dados públicos + dados privados autorizados
```

Representantes devem ter separação entre dados públicos e privados:

```text
representatives
└── dados públicos

representative_private
└── dados privados
```

## 11. Comunicação entre módulos

Direção futura:

- componentes chamam funções de domínio ou loaders;
- loaders consultam camada de dados;
- camada de dados usa Prisma;
- componentes não acessam Prisma diretamente;
- módulos administrativos validam permissão antes de qualquer mutação.

## 12. Como adicionar novas páginas

Antes de adicionar uma página:

1. confirmar se ela está no escopo aprovado;
2. definir objetivo da página;
3. definir CTA principal;
4. verificar SEO;
5. reutilizar componentes existentes;
6. documentar a nova página no planejamento ou no README, se relevante.

## 13. Como adicionar novas funcionalidades

Antes de adicionar funcionalidade:

1. validar com o Jose se há regra de negócio envolvida;
2. verificar se exige backend/banco;
3. seguir o fluxo de aprovação em duas camadas (Jose aprova a proposta → Claude revisa → implementação → testes smoke → lista de testes manuais para o Jose → aprovação dupla → commit), descrito em `PLANO_MESTRE_FORTSULSC.md`, seção 4;
4. documentar impacto em `docs/API.md`, `docs/COMPONENTS.md` ou `docs/RULES.md`;
5. implementar com o menor acoplamento possível;
6. revisar acessibilidade, responsividade e segurança.

## 14. Como evitar dependências desnecessárias

Não adicionar biblioteca se:

- o CSS/HTML nativo resolve bem;
- a necessidade é pontual;
- a dependência adiciona muito peso ao bundle;
- a funcionalidade ainda não foi aprovada;
- a biblioteca exige backend antes da hora.

Dependências devem resolver problemas reais e já validados.
