# Planejamento reformulado — FortSulSC

Data: 2026-08-21
Status: planejamento de produto, arquitetura e frontend
Escopo desta etapa: organizar direção do projeto, design e roadmap. Não implementar regras de negócio, backend ou banco sem validação do Jose.

> **Governança:** este documento é a referência de contexto e escopo. O status real de cada fase (o que já foi feito, o que está em andamento, o que está bloqueado) é controlado em `PLANO_MESTRE_FORTSULSC.md`, que deve ser lido antes de qualquer nova tarefa. A seção 7 abaixo descreve o roadmap conceitual; a tabela de status vigente está apenas no Plano Mestre, para evitar duas fontes divergentes.

## 1. Contexto do projeto

A FortSulSC possui hoje um site institucional em WordPress/Elementor. O cliente aprovou um protótipo apresentado previamente para a reestruturação visual do site. A orientação principal é manter o padrão de design aprovado, preservando a paleta alinhada ao logotipo, e apresentar apenas pequenas modernizações antes de implementar.

A proposta do novo projeto é evoluir o site atual para uma aplicação moderna, responsiva, mais fácil de manter e preparada para crescer em duas frentes:

- site público institucional e catalogável;
- painel administrativo futuro para gerenciar produtos, representantes, revendas, banners, categorias e regiões.

## 2. Resumo do que o sistema já possui hoje

Levantamento feito a partir da versão pública atual do site da FortSulSC.

### 2.1 Site público atual

O site atual já possui:

- Página inicial institucional;
- Menu principal com:
  - Início;
  - Sobre a Empresa;
  - Produtos;
  - Representantes;
  - Blog;
  - Fale Conosco;
  - botão de Solicitar Orçamento via WhatsApp.
- Seção de categorias de produtos:
  - Aviário;
  - Equipamentos;
  - Fumageiro;
  - Piscicultura;
  - Secadores;
  - Download Catálogo.
- Chamada institucional “Quem somos”;
- Bloco de produtos em destaque;
- Seção de instalação e suporte, com:
  - Instalação;
  - Suporte;
  - Assistência;
  - Pós-venda.
- Rodapé com endereço, telefone e links sociais;
- Contato principal por telefone/WhatsApp.

### 2.2 Catálogo de produtos atual

A página de produtos já oferece:

- listagem de produtos;
- filtro por categorias;
- páginas individuais de produto;
- CTA “Ver produto”;
- categorias principais já organizadas.

Exemplos de produtos já exibidos:

- Queimador de Cavaco para Estufa de Tabaco;
- Secadores de diferentes capacidades;
- Extrusora para produção de ração de peixes;
- Ventoinha;
- Grelhas;
- Motores elétricos;
- Mancais e polias.

### 2.3 Representantes e lojas parceiras

A área atual de representantes já possui:

- página dedicada de representantes;
- filtro por estado;
- representantes por região;
- telefone/WhatsApp para contato;
- indicação de região atendida.

Estados observados no filtro atual:

- Paraná;
- Rio Grande do Sul;
- Santa Catarina.

A página também prevê “Lojas Parceiras”, porém no estado atual aparece sem lojas cadastradas.

### 2.4 Conteúdo e limitações atuais

O site já cumpre a função institucional básica, mas apresenta limitações para a nova fase:

- visual com aparência mais antiga;
- hierarquia visual pouco refinada;
- catálogo com pouca força comercial;
- navegação de representantes baseada em lista, sem mapa interativo;
- blog sem conteúdo aparente no momento da análise;
- experiência mobile e de conversão pode ser melhorada;
- dependência do WordPress/Elementor para manutenção visual;
- ausência, no escopo visível, de um painel administrativo sob medida para produtos, representantes, revendas e banners.

## 3. O que vamos modificar

### 3.1 Design e experiência visual

Vamos manter o padrão aprovado no protótipo, com modernizações leves e apresentadas antes da implementação.

Modificações previstas:

- modernizar a home mantendo a identidade FortSulSC;
- preservar a paleta baseada no logotipo, com azul, laranja, branco e tons neutros;
- melhorar contraste, espaçamento e hierarquia tipográfica;
- deixar o equipamento/produto mais protagonista;
- substituir a sensação de “site montado em blocos” por uma experiência mais contínua e comercial;
- melhorar a leitura no mobile;
- criar componentes reutilizáveis para cards, botões, seções, filtros e CTAs.

Importante: alterações visuais relevantes devem ser apresentadas ao Jose antes de implementar.

### 3.2 Home

O que existe hoje:

- banners/chamadas;
- categorias de produtos;
- quem somos;
- produtos em destaque;
- suporte/assistência;
- CTA final.

O que será reformulado:

- hero mais forte, com mensagem clara de valor;
- CTA principal para orçamento;
- CTA secundário para catálogo/produtos;
- categorias com melhor presença visual;
- seção institucional com prova de confiança;
- destaque de soluções por segmento;
- seção de suporte mais objetiva;
- chamada para representantes/revendas;
- rodapé mais organizado.

### 3.3 Produtos

O que existe hoje:

- catálogo com categorias e páginas de produto;
- filtros por categoria;
- produto com CTA.

O que será modificado:

- cards de produto mais modernos;
- filtros mais claros e responsivos;
- páginas de produto com melhor estrutura comercial;
- espaço para imagens, aplicações, benefícios, especificações e CTA;
- base preparada para futuramente ser alimentada pelo painel administrativo.

Sem implementar agora:

- regras de cadastro;
- regras de publicação;
- modelagem final do banco;
- CRUD administrativo.

Essas decisões dependem de validação posterior.

### 3.4 Representantes

O que existe hoje:

- lista de representantes;
- filtro por estado;
- telefone/WhatsApp;
- descrição de região atendida.

O que será modificado:

- experiência com mapa interativo;
- filtros por estado, cidade, região ou categoria, se aprovado;
- cards laterais/listagem integrada ao mapa;
- botão direto para WhatsApp;
- distinção entre localização pública aproximada e dados privados;
- design mais limpo para facilitar contato comercial.

Cuidados de segurança:

- não expor dados privados de representantes;
- evitar coordenadas exatas de residência ou dados pessoais sensíveis;
- usar somente dados explicitamente marcados como públicos.

### 3.5 Revendas / Lojas parceiras

O que existe hoje:

- link para lojas parceiras;
- no estado atual, sem lojas cadastradas publicamente.

O que será modificado:

- criar área dedicada de revendas, se o cliente confirmar essa necessidade;
- permitir mapa/lista de revendas;
- diferenciar revenda comercial pública de representante pessoa física;
- preparar futura gestão via painel administrativo.

### 3.6 Blog

O que existe hoje:

- menu de Blog;
- seção de blog na home;
- mensagem indicando ausência de dados na versão analisada.

O que será decidido:

- manter blog como notícias/novidades;
- transformar em “Conteúdos” ou “Dicas técnicas”;
- remover do menu inicial até existir estratégia editorial.

Essa decisão deve ser validada com o cliente antes de implementação definitiva.

### 3.7 Contato

O que existe hoje:

- telefone;
- WhatsApp;
- página Fale Conosco;
- endereço no rodapé.

O que será modificado:

- CTAs mais claros ao longo do site;
- WhatsApp como canal principal de conversão;
- possível formulário de contato em fase futura;
- dados de contato mais visíveis no mobile.

Sem implementar agora:

- envio de formulário;
- automações;
- regras de orçamento;
- integração com CRM.

## 4. Stack proposta

Stack recomendada para a fase full stack futura:

- Next.js;
- React;
- TypeScript;
- Tailwind CSS;
- shadcn/ui;
- PostgreSQL;
- Prisma ORM;
- Auth.js;
- Leaflet;
- OpenStreetMap;
- Cloudinary, Cloudflare R2 ou storage S3-compatible;
- Vercel ou ambiente equivalente para deploy;
- Docker e Docker Compose, para desenvolvimento local containerizado (aplicação + PostgreSQL) antes da modelagem de banco começar.

Essa stack permite manter site público e dashboard administrativo em uma única aplicação, com boa performance, SEO, custo controlado e baixa complexidade operacional.

## 5. Arquitetura planejada

```text
Internet
   ↓
HTTPS
   ↓
Next.js
   ↓
┌────────────────────────┬────────────────────────┐
│ Site público           │ Área administrativa     │
│ Home                   │ Login                   │
│ Produtos               │ Produtos                │
│ Representantes         │ Categorias              │
│ Revendas               │ Representantes          │
│ Contato                │ Revendas                │
│ Conteúdos              │ Banners                 │
└────────────────────────┴────────────────────────┘
   ↓
Data Access Layer
   ↓
Prisma
   ↓
PostgreSQL
   ↓
Dados públicos + dados privados separados
```

## 6. Segurança e privacidade

A regra central será separar claramente dados públicos e privados.

Exemplo:

```text
representatives
├── display_name
├── city
├── state
├── public_whatsapp
├── latitude_public
├── longitude_public
└── active

representative_private
├── representative_id
├── email
├── private_phone
├── document
├── address
└── internal_notes
```

Diretrizes:

- o site público nunca deve consultar dados privados;
- rotas públicas devem usar `select` explícito no Prisma;
- variáveis sensíveis nunca devem usar prefixo `NEXT_PUBLIC_`;
- uploads devem validar tipo, extensão e tamanho;
- área administrativa deve ter autenticação, MFA e RBAC;
- alterações sensíveis devem gerar auditoria;
- logs não devem registrar dados pessoais desnecessários.

## 7. Roadmap por fases

> O status vigente de cada fase (concluída, parcial, bloqueada) está em `PLANO_MESTRE_FORTSULSC.md`, seção 0.2. As descrições abaixo são o escopo conceitual de cada fase e não devem ser editadas para registrar andamento — isso é papel do Plano Mestre.

### Fase 0 — Planejamento e validação

Objetivo:

- consolidar escopo;
- mapear o que existe hoje;
- definir o que será mantido, removido e melhorado;
- enviar planejamento para avaliação externa/Claude;
- validar mudanças de design antes de implementar.

Entregáveis:

- este planejamento;
- prompt de revisão para Claude;
- lista de ajustes sugeridos;
- decisão final sobre alterações visuais.

### Fase 1 — Design/frontend aprovado

Objetivo:

- transformar o protótipo aprovado em frontend moderno e responsivo.

Entregáveis:

- home responsiva;
- componentes visuais base;
- páginas estáticas principais;
- estados mobile/tablet/desktop;
- revisão visual antes de qualquer backend.

Não inclui:

- banco;
- autenticação;
- CRUD;
- regras de negócio.

### Fase 2 — Estrutura Next.js

Objetivo:

- migrar o frontend aprovado para base Next.js + TypeScript.

Entregáveis:

- estrutura de rotas;
- layout global;
- componentes reutilizáveis;
- organização inicial do projeto.

### Fase Docker — Fundação de conteinerização

Objetivo:

- rodar o projeto em container antes da modelagem de banco começar, para que schema e migrations já nasçam testáveis em ambiente isolado.

Entregáveis:

- `Dockerfile` da aplicação Next.js;
- `docker-compose.yaml` com aplicação e PostgreSQL local;
- `.env.example` sem valores reais;
- documentação de como subir o ambiente localmente.

### Fase 3 — Modelagem e regras de negócio

Objetivo:

- definir banco, entidades, permissões e regras.

Importante:

- esta fase só começa depois de consulta e aprovação do Jose.

Possíveis entidades:

- Product;
- Category;
- Representative;
- RepresentativePrivate;
- RepresentativeCategory;
- Reseller;
- Region;
- Banner;
- AdminUser;
- AuditLog.

### Fase 4 — Painel administrativo

Objetivo:

- criar dashboard próprio para gestão interna.

Módulos previstos:

- produtos;
- categorias;
- representantes;
- categorias de representantes;
- revendas;
- regiões;
- banners;
- configurações.

### Fase 5 — Mapa e dados públicos

Objetivo:

- implementar mapa interativo com Leaflet e OpenStreetMap.

Entregáveis:

- marcadores;
- filtros;
- popups;
- integração com WhatsApp;
- proteção de dados privados.

### Fase 6 — Segurança, testes e deploy

Objetivo:

- endurecer a aplicação para produção.

Entregáveis:

- validação de dados;
- RBAC;
- rate limiting;
- logs seguros;
- backups;
- deploy;
- revisão final.

## 8. Pontos que precisam de decisão antes da implementação

- O blog será mantido, removido ou reposicionado como conteúdo técnico?
- Revendas terão página pública própria?
- Representantes aparecerão em mapa com localização aproximada ou apenas por região?
- Quais dados serão públicos para representantes?
- Produtos terão especificações técnicas detalhadas?
- O orçamento será apenas por WhatsApp ou também por formulário?
- O painel administrativo será entregue na primeira versão ou em fase posterior?
- Upload de imagens usará Cloudinary, R2 ou outro storage?
- O cliente terá múltiplos perfis de usuário no admin?

## 9. Restrições explícitas

- Não criar regras de negócio sem consultar o Jose.
- Não implementar banco de dados sem validação prévia.
- Não criar CRUD administrativo antes de validar escopo.
- Não alterar o padrão aprovado do protótipo sem apresentar as mudanças.
- Não expor dados privados de representantes ou revendas.
- Não armazenar segredos no repositório.
- Não pular o fluxo de aprovação em duas camadas (Jose + revisão do Claude) descrito em `PLANO_MESTRE_FORTSULSC.md`, seção 4, antes de implementar ou fazer commit.

**Pendência de segurança registrada no Plano Mestre:** o arquivo `recovery-codes-vercel-fortsul.txt` já foi removido do repositório pelo Jose; falta confirmar se ele chegou a ser commitado (e precisa de purga de histórico) e se os códigos foram revogados na Vercel — ver `PLANO_MESTRE_FORTSULSC.md`, seção 0.2.

## 10. Fontes consultadas

- Site atual: https://fortsulsc.com.br/
- Produtos: https://fortsulsc.com.br/produtos/
- Representantes: https://fortsulsc.com.br/representantes/
- Instruções anexas do Jose: `C:\Users\Jose Tavares\.codex\attachments\cd40e9b2-db48-4d3e-b117-1d89b7ee13ad\pasted-text.txt`
