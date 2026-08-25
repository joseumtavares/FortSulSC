# Prompt para revisão no Claude — incremento atual da Fase 1

Use este prompt para revisar a implementação local, a documentação e a governança atualizadas. A revisão não deve alterar código nem autorizar avanço de fase por conta própria.

```text
Você é um revisor técnico e de produto. Revise o incremento atual da Fase 1 — frontend estático — do projeto FortSulSC, considerando que:

- o site atual é WordPress/Elementor;
- existe um protótipo visual já aprovado pelo cliente;
- o padrão visual aprovado deve ser mantido;
- pequenas modernizações de design devem ser sugeridas, mas não implementadas sem aprovação;
- a Fase 1 é a única fase autorizada; Fase 2/Next.js, Docker, backend, banco, Prisma, autenticação, CRUD, admin, endpoints e regras de negócio continuam proibidos;
- backend, regras de negócio, banco de dados e CRUD administrativo só podem ser planejados em alto nível, sem implementação, até aprovação do Jose;
- dados de representantes e revendas podem conter dados pessoais/comerciais e precisam de cuidado com privacidade;
- a stack futura é apenas direção arquitetural, não autorização de implementação;
- o Jose concluiu os testes manuais locais, incluindo a 404 em rota profunda (evidência visual anexada à solicitação do Codex);
- `npm test`, `node --check script.js`, `node --check preview.mjs` e `git diff --check` passaram;
- os relatórios Lighthouse locais registram performance 29 e acessibilidade 96 para home e produto; a meta de performance ≥ 90 e o teste cross-browser permanecem pendentes.

Antes de revisar, siga obrigatoriamente:

1. consultar o SecondBrain;
2. usar os skills relevantes de `addyosmani/agent-skills`, começando por `using-agent-skills`;
3. usar Context7 para documentação de qualquer biblioteca, runtime, CLI ou serviço usado na análise;
4. não abrir ou imprimir arquivos secretos, recovery codes, `.env`, tokens, credenciais, chaves, senhas ou connection strings;
5. não fazer commit, push, reset, restore, clean, rebase, merge nem excluir arquivos locais.

Leia integralmente, nesta ordem:

- docs/PLANO_MESTRE_FORTSULSC.md
- docs/PLANEJAMENTO_PROJETO.md
- docs/RULES.md
- docs/CHECKLIST.md
- docs/DESIGN-SYSTEM.md
- docs/ARCHITECTURE.md
- docs/API.md
- docs/COMPONENTS.md
- README.md
- CLAUDE.md

Depois, compare com:

- index.html
- produto-alimentador.html
- 404.html
- styles.css
- script.js
- preview.mjs
- package.json
- test-preview.mjs
- robots.txt

Sua tarefa:

1. Verifique se o `preview.mjs` bloqueia traversal simples, codificado, absoluto, sibling-prefix e por symlink sem expor caminhos internos.
2. Verifique se a 404 profunda carrega CSS, favicon, imagem e script pela raiz e mantém HTTP 404.
3. Confirme se os links `tel:` correspondem ao número visível e são discáveis.
4. Confirme se a especificação de `WhatsAppDialog` corresponde a `script.js`: diálogo modal, foco inicial, focus trap, Esc, overlay e retorno ao acionador.
5. Verifique se README e documentos refletem apenas comandos e resultados reais.
6. Aponte riscos de produto, UX, arquitetura, segurança e manutenção, separando:
   - mudanças obrigatórias;
   - melhorias recomendadas;
   - ideias opcionais para versões futuras.
7. Verifique se a documentação mantém a Fase 1 como parcial e não marca Lighthouse/cross-browser como concluídos.
8. Dê um veredito sobre este incremento: `APROVADO`, `APROVADO COM PENDÊNCIAS` ou `REPROVADO`.
9. Mesmo se aprovado, declare explicitamente que a Fase 2 não está autorizada até aprovação formal do Jose e resolução dos portões vigentes. Sugira apenas a próxima implementação dentro da Fase 1.
10. Não altere arquivos automaticamente.

Formato esperado da resposta:

## Resumo executivo
## Skills e fontes consultados
## Pontos fortes
## Riscos encontrados
## Mudanças obrigatórias
## Melhorias recomendadas
## Ideias opcionais
## Pendências para a Fase 1
## Próxima implementação permitida
## Veredito final
```
