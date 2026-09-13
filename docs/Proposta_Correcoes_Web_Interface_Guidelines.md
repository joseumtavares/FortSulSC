# Proposta — Correções pendentes do Web Interface Guidelines

Status: aguardando aprovação do Jose (padrões 1 e 2 já implementados, ver Plano Mestre 12/09/2026).
Fonte dos achados: `docs/Web_Interface_Guidelines_Achados_12-09-2026.md`, skill `web-design-guidelines` (`.claude/skills/web-design-guidelines/`).

## 1. Já corrigido (não faz parte desta proposta)

- **Mensagens de erro genéricas sem próximo passo** — 32 ocorrências em `src/components/admin/*.tsx` corrigidas, todas passaram a terminar com "Tente novamente em instantes." Ver `docs/RULES.md` §8.1.
- **Imagem sem `width`/`height` explícito** — 13 ocorrências corrigidas em `src/components/admin/*`, `src/components/content/*`, `src/components/sections/BannerStripView.tsx`, `src/components/solutions/*`, `src/components/representatives/RepresentativeMapPanel.tsx` e `src/app/admin/(dashboard)/banners/page.tsx`. Ver `docs/RULES.md` §7.

## 2. Fatias propostas para os achados restantes

Cada fatia é pequena e independente — pode ser aprovada e implementada separadamente, na ordem que o Jose preferir.

### Fatia A — Falta `&nbsp;` entre número e unidade

**Onde:** `ArticleCoverUploadForm`, `ArticleGallery`, `BannerForm`, `BannerImageForm`, `PartnerLogoForm`, `ProductImagesForm` — todos com o texto "até 5 MB".

**Correção:** trocar o espaço comum por `&nbsp;` ("até 5&nbsp;MB"), para o número nunca quebrar linha separado da unidade. Mudança de texto pura, sem risco.

### Fatia B — Estado de filtro/aba não refletido na URL

**Onde:** `AboutTabs.tsx` (aba ativa da seção "A FortSul"), `SolutionsGrid.tsx` (filtro de categoria de produtos), `PartnersTable.tsx` (filtro Todos/Representantes/Revendas no admin).

**Correção:** sincronizar o estado com a URL via `useSearchParams`/`router.replace` (ou lib como `nuqs`, ainda não usada no projeto — decisão a confirmar). Permite compartilhar/voltar para um filtro específico.

**Observação:** essa é a fatia com maior superfície de mudança (mexe em navegação, que `CLAUDE.md` §7 trata como decisão estrutural) — recomendo tratá-la como proposta técnica própria antes de implementar, mesmo que pequena.

### Fatia C — Aviso de alterações não salvas ao navegar

**Onde:** `ArticleTextForm`, `BannerForm`, `CategoryForm`, `CommercialAreaForm`, `InstitutionalSettingsForm`, `PartnerForm` (inclui dados privados/LGPD), `ProductForm`.

**Correção:** `beforeunload` (fecha aba/recarrega) já é simples de adicionar; guarda de navegação interna (sair para outra tela do admin sem salvar) exige interceptar `router.push`/cliques em `<Link>`, mais trabalho. Proponho começar só com `beforeunload` nesta fatia.

### Fatia D — Texto de usuário sem tratamento de conteúdo longo

**Onde:** `articles/page.tsx`, `banners/page.tsx`, `categories/page.tsx`, `commercial-areas/page.tsx`, `products/page.tsx` (nome/título nas tabelas do admin).

**Correção:** `className="truncate"` (ou `line-clamp-1`) na célula/cabeçalho da tabela, com `title={nome}` para o texto completo aparecer no hover. Mudança pequena, mesma linha de cada arquivo.

### Fatia E — Achados pontuais (agrupados por serem todos triviais)

- `articles/page.tsx` — adicionar `scope="col"` nos cabeçalhos e trocar a coluna principal para `<th scope="row">`, igualando às outras tabelas do admin.
- `AdminSidebar.tsx:85` — trocar `transition-[width]` por uma alternativa em `transform`/`opacity`, ou aceitar o custo (é uma barra lateral pequena, animação de largura já é comum e barata nesse caso — avaliar se vale a mudança).
- `HeroSection.tsx:13` — remover a prop `preload` inválida e adicionar `priority` (imagem do hero está acima da dobra).
- `RepresentativeMapPanel.tsx` — envolver a mensagem de status de geolocalização e o erro de carregamento em uma região `aria-live="polite"`.
- `CharCounter.tsx:5` — adicionar `font-variant-numeric: tabular-nums` para o contador não "pular" de largura.
- `ProductForm.tsx:39` — trocar aspas retas por curvas no texto padrão do botão "Saiba mais".
- `CodeStepForm.tsx:58`, `PasswordStepForm.tsx:84` — trocar `'Verificando...'`/`'Entrando...'` por reticências reais (`…`).
- `CodeStepForm.tsx:36`, `PasswordStepForm.tsx:44` — `spellCheck={false}` nos campos de código/e-mail.
- `CommercialAreaMunicipalitiesForm.tsx:113`, `PartnerForm.tsx:165` — trocar o placeholder de instrução por um exemplo terminado em `…`.

## 3. O que NÃO está nesta proposta

- Nenhuma correção aqui muda regra de negócio, schema ou fluxo de aprovação — são todos ajustes de UI/copy/acessibilidade em componentes já aprovados.
- A Fatia B (URL state) é a única com alguma decisão de arquitetura (usar ou não uma lib como `nuqs`) — as demais são edições diretas.

## 4. Como prosseguir

Aguardando o Jose escolher: implementar tudo de uma vez, escolher fatias específicas, ou aprovar a ordem A → E acima.
