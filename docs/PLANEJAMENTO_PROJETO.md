# Planejamento do Projeto — FortSulSC

> **Nota de manutenção:** este documento registra escopo de produto e decisões
> aprovadas. Ele **não substitui** `docs/PLANO_MESTRE_FORTSULSC.md`, que continua
> sendo a fonte única de verdade para status de fase, gates e autorização de
> implementação. Cada item abaixo traz uma tag de fase indicando **quando pode
> ser implementado**, não apenas quando foi decidido.
>
> Tags usadas:
> - `[FASE 1 — ENCERRADA]` já implementado no baseline estático.
> - `[FASE 2 — AUTORIZADA]` migração Next.js em andamento, com gates próprios.
> - `[FASE DOCKER — PLANEJADA]` entre Fase 2 e Fase 3, não autorizada.
> - `[FASE 3 — PLANEJADA, NÃO AUTORIZADA]` dados, backend, auth, admin — requer
>   aprovação explícita e contrato de teste equivalente ao DEC-020 antes de
>   qualquer Model, Service, Route Handler ou Server Action.
> - `[TRANSVERSAL]` princípio válido em todas as fases, não é entregável único.
> - `[OPERACIONAL]` regra de processo de agentes — ver ressalva no fim do documento.

---

## Resolução de conflitos — categorias e contrato de teste

**Decisão do José (atualizada em 2026-09-01, consolidação da Fase 3 —
`docs/Entrevista_Cliente_Fase3_Modelo_e_Regras.md`, item B1):** as categorias
oficiais são **Fumicultura, Equipamentos, Aviário, Piscicultura, Secadores e
Acessórios** (seis categorias). "Fumageiro" foi renomeado para "Fumicultura";
"Acessórios" é categoria nova. "Biomassa" **não é** e nunca foi categoria
oficial (item B2); o alimentador é classificado como Equipamentos +
Fumicultura. Qualquer referência anterior a `biomassa | fumageiro |
equipamentos` (incluindo o contrato de teste de `SolutionFilters` do
Incremento 5, hoje já implementado com a lista antiga de cinco) está
**desatualizada** e deve ser corrigida para usar as seis categorias oficiais.

**Ação pendente para o Codex (fora do escopo desta proposta de modelagem —
aguarda tarefa própria):** reescrever `SolutionFilterId` e os dados de exemplo
do contrato de teste do Incremento 5 (`src/components/solutions/`) usando
`fumicultura | equipamentos | aviario | piscicultura | secadores | acessorios`
(ou os identificadores equivalentes definidos em `docs/RULES.md` para slugs),
mantendo a mesma estrutura de teste já aprovada (estado inicial, filtragem,
restauração via "Todos", ordem preservada, estado vazio, exclusividade do
filtro ativo). Essa migração de conteúdo/UI já implementado é uma mudança
própria — não é autorizada pela proposta de modelagem de dados da Fase 3
(`docs/Proposta_Tarefa_4_Fase3_Modelagem.md` §2) — e deve ser proposta e
revisada separadamente antes de qualquer implementação.

---

## 1. Diretriz geral do projeto `[TRANSVERSAL]`

O FortSulSC apresenta a empresa, equipamentos, produtos, representantes e
revendas, além de facilitar contato comercial e geração de leads.

Prioridades do projeto: clareza, conversão, facilidade de navegação,
apresentação profissional dos equipamentos, administração simples, segurança,
privacidade, confidencialidade, desempenho, responsividade, acessibilidade e
possibilidade de evolução futura.

## 2. Padrão visual `[TRANSVERSAL]`

Existe um protótipo visual aprovado pelo cliente. O padrão deve ser
preservado em todas as fases. Pequenas modernizações de usabilidade,
acessibilidade, responsividade ou performance podem ser sugeridas; alterações
visuais relevantes exigem aprovação explícita antes de implementação. O
executor não substitui componentes nem altera identidade visual por
preferência pessoal.

## 3. Home

### 3.1 Seção "Encontre o equipamento ideal" `[FASE 2 — AUTORIZADA]`

Sugestão aprovada. Objetivo: transformar a Home também em porta de entrada
para o catálogo, priorizando descoberta de produtos, navegação simples,
conversão e acesso rápido às categorias.

**Resolução:** esta é a mesma funcionalidade já planejada no **Incremento 5
("Soluções e filtros")** — não uma seção separada. "Encontre o equipamento
ideal" é o nome/enquadramento de produto para a funcionalidade de descoberta
via `SolutionFilters` + `SolutionCard`. Não criar uma segunda seção
equivalente. Se o título visível na Home deve mudar de "Soluções" para
"Encontre o equipamento ideal", isso é um ajuste de copy dentro do próprio
Incremento 5, não um incremento novo.

## 4. Produtos

### 4.1 Quantidade inicial `[FASE 3 — PLANEJADA, NÃO AUTORIZADA]`
~10 produtos no lançamento.

### 4.2 Cadastro inicial `[FASE 3 — PLANEJADA, NÃO AUTORIZADA]`
Cadastro inicial feito por José Tavares (via painel administrativo, quando
existir; até lá, não há mecanismo de cadastro dinâmico).

### 4.3 Categorias aprovadas `[FASE 2 — AUTORIZADA para uso em filtros/UI; FASE 3 — modelagem de dados]`
**Fumicultura, Equipamentos, Aviário, Piscicultura, Secadores, Acessórios**
(seis categorias, consolidado em 2026-09-01 — ver "Resolução de conflitos"
acima). Esta é a lista oficial e vigente — substitui qualquer conjunto
anterior usado em código, testes ou documentação, incluindo a lista de cinco
categorias com "Fumageiro" usada até então. Não criar novas categorias sem
necessidade ou aprovação explícita.

## 5. Leads

### 5.1 Destino dos leads `[FASE 1 — ENCERRADA, já implementado]`
WhatsApp oficial: **(48) 3660-0818**. Já é o canal de conversão da Fase 1
atual (estático), hardcoded no HTML/JS.

### 5.2 Número não deve ficar hardcoded `[FASE 3 — PLANEJADA, NÃO AUTORIZADA]`
Decisão registrada agora, implementação depende do painel administrativo.
Até a Fase 3, o número permanece como está (hardcoded no estático/Next.js),
o que é aceitável como estado transitório, não como violação da regra.

## 6. E-mail institucional

### 6.1 Estado atual `[TRANSVERSAL]`
Não definido. Campo permanece vazio. **Não criar ou assumir** endereço
(ex.: `comercial@fortsulsc.com.br`) em nenhuma fase até aprovação explícita.

### 6.2 Configuração administrativa `[FASE 3 — PLANEJADA, NÃO AUTORIZADA]`
Campo editável no painel para e-mail institucional.

## 7. Configurações institucionais `[FASE 3 — PLANEJADA, NÃO AUTORIZADA]`
WhatsApp/telefone e e-mail institucional centralizados no painel; frontend
consome essas configurações. Princípio: dado administrativo configurável não
fica hardcoded no frontend — aplicável a partir do momento em que o painel
existir, não retroativamente à Fase 1/2.

## 8. Representantes e revendas `[TRANSVERSAL — nomenclatura; FASE 3 — implementação]`

- **Representante:** pessoa ou empresa que representa a FortSul e vende os
  equipamentos.
- **Revenda:** pessoa ou empresa que compra da FortSul para revender.

Distinção não deve ser tratada como sinônimo em nenhuma fase, em nenhuma
interface, cadastro, filtro ou marcador — mesmo antes da implementação
completa (Fase 3), qualquer menção a esses termos em Fase 2 deve já respeitar
a distinção conceitual.

## 9. Autenticação `[FASE 3 — PLANEJADA, NÃO AUTORIZADA]`

Perfis iniciais: Admin (acesso administrativo completo) e Editor (permissões
editoriais definidas de forma segura e explícita, sem privilégio
administrativo completo por padrão). Link "Login" no site redireciona ao
painel de autenticação.

## 10. Conteúdos / Artigos

### 10.1 Informação pública `[FASE 3 — PLANEJADA, NÃO AUTORIZADA]`
Artigos mostram apenas data de publicação; autor não é exibido publicamente.

### 10.2 Registro interno `[FASE 3 — PLANEJADA, NÃO AUTORIZADA]`
Sistema registra internamente quem publicou, mesmo sem exibição pública.

**Confirmado pelo José — funcionalidades distintas, mantidas com nomes
próprios:**
- **"Novidades e dicas"** `[FASE 1/2]`: conteúdo estático do escopo atual,
  com exatamente três cards fixos definidos manualmente via
  `PROMPT_CODEX_SECAO_NOVIDADES_E_DICAS.md`, sem CMS, sem autor e sem data
  dinâmica. Nesta implementação, o conteúdo é de teste para validação de
  layout e permanece pendente de substituição antes do lançamento.
- **"Artigos"** `[FASE 3 — PLANEJADA, NÃO AUTORIZADA]`: CMS editorial completo
  descrito neste item 10, com autor registrado internamente, data pública e
  log de auditoria.

Não fundir as duas nem usar os nomes como sinônimos em nenhum documento ou
commit.

## 11. Log de auditoria `[FASE 3 — PLANEJADA, NÃO AUTORIZADA]`

Histórico de ações administrativas relevantes: usuário responsável, ação,
tipo de conteúdo, identificação do conteúdo, data, hora, resultado. Eventos
recomendados: publicação/edição de artigo, criação/edição de produto,
exclusão de conteúdo, alteração de categoria, alteração de telefone/e-mail,
demais alterações administrativas relevantes.

## 12. Privacidade `[TRANSVERSAL]`
Dados pessoais, contato, localização, informações comerciais e de projetos
dos clientes tratados com confidencialidade em todas as fases.

## 13. Confidencialidade de projetos e equipamentos `[TRANSVERSAL]`
Não expor desnecessariamente detalhes técnicos, projetos, informações
internas ou dados que facilitem cópia/reprodução dos equipamentos —
válido desde o conteúdo estático atual até o painel administrativo futuro.

## 14. Publicações em redes sociais `[TRANSVERSAL]`
Publicações envolvendo fotos, localização, instalações, projetos ou
equipamentos identificáveis do cliente exigem autorização prévia do cliente.

## 15. Painel administrativo `[FASE 3 — PLANEJADA, NÃO AUTORIZADA]`
Escopo inicial: produtos, categorias, artigos, representantes, revendas,
usuários, configurações institucionais, leads/contatos (quando previsto),
logs de auditoria.

## 16. Segurança `[TRANSVERSAL, com ênfase a partir da FASE 3]`
Atenção especial a autenticação, autorização, permissões, dados de clientes,
formulários, leads, configurações administrativas, logs, exclusões e
exposição de dados. Não expor informação administrativa/privada no frontend
sem necessidade — válido desde já, não só quando o painel existir.

## 17. Performance `[TRANSVERSAL]`
Otimização de imagens, formatos modernos (WebP), redução de JS e
dependências desnecessárias, carregamento eficiente, boas práticas de Core
Web Vitals. Lighthouse usado quando fizer parte dos critérios de validação
do incremento — já se aplica à Fase 1/2 (Lighthouse segue como item
rastreado no Plano Mestre, pendente de execução).

## 18. Responsividade `[TRANSVERSAL]`
Desktop, tablet, mobile — validada antes da aprovação de cada incremento
relevante, em todas as fases.

## 19. Acessibilidade `[TRANSVERSAL]`
Estrutura semântica, navegação por teclado, labels, contraste, foco, textos
alternativos, componentes acessíveis, mensagens de erro compreensíveis —
aplicável desde a Fase 1.

## 20. Itens que continuam em aberto `[TRANSVERSAL]`
E-mail institucional; demais informações institucionais; detalhes completos
das permissões do Editor; campos detalhados de produtos, representantes e
revendas; regras comerciais específicas além da distinção já definida;
demais integrações futuras. Não tratar como requisitos definidos até
aprovação.

## 21.1 Precedência entre decisão aprovada e contrato de teste existente `[TRANSVERSAL]`

Quando houver conflito entre um contrato de teste já escrito e uma decisão
posterior explicitamente aprovada pelo José, **prevalece a decisão aprovada
mais recente**, e o teste deve ser atualizado para refletir o requisito
vigente antes de qualquer implementação prosseguir.

Um contrato de teste não aprovado como decisão de produto não tem status de
decisão — ele é a especificação executável de uma decisão, e deve seguir a
decisão, não o contrário. Um teste desatualizado nunca deve funcionar como
uma "decisão oculta" que reintroduz um requisito já superado. Sempre que o
Claude ou o Codex encontrarem essa divergência, o teste correspondente deve
ser sinalizado explicitamente como **desatualizado** e corrigido antes do
ciclo RED–GREEN, nunca implementado como estava.

## 22. Princípio geral `[TRANSVERSAL]`
Desenvolvimento incremental: cada incremento é planejado, delimitado,
implementado, testado, revisado e aprovado. Objetivo: aplicação consistente
com as decisões do cliente, com rastreabilidade e controle de escopo.

---

## 23. Decisões explicitamente aprovadas — tabela de referência `[TRANSVERSAL]`

| Item | Decisão | Fase de implementação |
|---|---|---|
| WhatsApp dos leads | (48) 3660-0818 | Fase 1 (já ativo) |
| E-mail institucional | Inicialmente vazio | — |
| E-mail editável | Sim | Fase 3 |
| Telefone editável | Sim | Fase 3 |
| Produtos no lançamento | ~10 | Fase 3 |
| Cadastro inicial | José Tavares | Fase 3 |
| Categorias | Fumicultura, Equipamentos, Aviário, Piscicultura, Secadores, Acessórios (atualizado 2026-09-01) | Fase 2 (UI/filtros, migração pendente) / Fase 3 (dados) |
| "Encontre o equipamento ideal" | Aprovado — é o Incremento 5 (Soluções e filtros), não uma seção nova | Fase 2 |
| "Novidades e dicas" vs. "Artigos" | Distintos — estático (Fase 1/2) vs. CMS editorial (Fase 3) | Fase 1/2 e Fase 3, respectivamente |
| Representante | Representa a FortSul e vende equipamentos | Nomenclatura transversal / dados Fase 3 |
| Revenda | Compra da FortSul para revender | Nomenclatura transversal / dados Fase 3 |
| Login / Admin / Editor | Sim | Fase 3 |
| Artigos — autor público | Não | Fase 3 |
| Artigos — data pública | Sim | Fase 3 |
| Registro interno do publicador | Sim | Fase 3 |
| Log de auditoria | Sim | Fase 3 |
| Privacidade dos clientes | Obrigatória | Transversal |
| Localização dos clientes | Confidencial | Transversal |
| Publicação em redes sociais | Somente com autorização quando aplicável | Transversal |
| Confidencialidade de equipamentos/projetos | Obrigatória | Transversal |

---

## Nota sobre conteúdo operacional não incluído aqui

O documento original também continha seções sobre: skills obrigatórias,
Context7, configuração de modelo/orquestração do Hermes e Codex, papéis dos
agentes, fluxo oficial de desenvolvimento, estados oficiais de incremento,
regra de não expansão de escopo e critérios de aprovação.

Esse conteúdo é **regra de processo de agentes**, não escopo de produto — já
existe sobreposição parcial com `docs/RULES.md` e com o
`PROMPT_COMUNICACAO_AGENTES.md` (em revisão). Não fundi esse conteúdo aqui
para não criar uma terceira cópia da mesma regra em três arquivos diferentes,
o que violaria o princípio de fonte única já adotado no projeto para status
de fase.

**Decisão pendente sua:** esse conteúdo operacional deveria residir só em
`docs/RULES.md`, só no `PROMPT_COMUNICACAO_AGENTES.md`, ou você prefere
mantê-lo duplicado propositalmente por serem lidos em momentos diferentes do
fluxo? Recomendo escolher um dono único; posso preparar a consolidação assim
que você decidir.
