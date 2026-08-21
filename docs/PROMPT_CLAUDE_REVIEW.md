# Prompt para revisão no Claude

Use este prompt para pedir uma avaliação crítica do planejamento da FortSulSC. A revisão deve propor melhorias, mas não deve implementar código.

```text
Você é um revisor técnico e de produto. Avalie o planejamento do projeto FortSulSC abaixo, considerando que:

- o site atual é WordPress/Elementor;
- existe um protótipo visual já aprovado pelo cliente;
- o padrão visual aprovado deve ser mantido;
- pequenas modernizações de design devem ser sugeridas, mas não implementadas sem aprovação;
- a primeira etapa deve focar em design/frontend;
- backend, regras de negócio, banco de dados e CRUD administrativo só podem ser planejados em alto nível, sem implementação, até aprovação do Jose;
- dados de representantes e revendas podem conter dados pessoais/comerciais e precisam de cuidado com privacidade;
- a stack proposta é Next.js + TypeScript + PostgreSQL + Prisma + Tailwind CSS + shadcn/ui + Leaflet + OpenStreetMap.

Leia os arquivos:

- docs/PLANEJAMENTO_PROJETO.md
- docs/ARCHITECTURE.md
- docs/API.md
- docs/COMPONENTS.md
- docs/DESIGN-SYSTEM.md
- docs/RULES.md
- docs/CHECKLIST.md

Sua tarefa:

1. Diga se o planejamento está coerente para o escopo do projeto.
2. Aponte riscos de produto, UX, arquitetura, segurança e manutenção.
3. Sugira melhorias no planejamento, separando:
   - mudanças obrigatórias;
   - melhorias recomendadas;
   - ideias opcionais para versões futuras.
4. Verifique se a separação entre frontend agora e backend depois está clara.
5. Verifique se o plano respeita a restrição de não criar regras de negócio sem aprovação.
6. Avalie se a stack está adequada ou se há alternativa mais simples.
7. Avalie o plano de segurança para representantes/revendas.
8. Sugira perguntas que devemos fazer ao cliente antes da fase de backend.
9. Verifique se a divisão da documentação está clara e suficiente para outro desenvolvedor/agente continuar o projeto.
10. Não altere arquivos automaticamente.

Formato esperado da resposta:

## Resumo executivo
## Pontos fortes
## Riscos encontrados
## Mudanças obrigatórias
## Melhorias recomendadas
## Ideias opcionais
## Perguntas para o cliente
## Veredito final
```
