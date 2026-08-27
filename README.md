# FortSul

Reformulação do site institucional da FortSul Equipamentos Agrícolas. A base atual inclui frontend estático; a fase e o escopo autorizados devem ser confirmados no Plano Mestre antes de qualquer mudança.

## Fonte de verdade

Consulte primeiro [docs/PLANO_MESTRE_FORTSULSC.md](docs/PLANO_MESTRE_FORTSULSC.md). Ele define a fase vigente, as regras de governança e os portões de aprovação.

## Executar localmente

Pré-requisito: Node.js 18 ou superior.

```powershell
npm run dev
```

Abra `http://127.0.0.1:4173`.

## Testar

```powershell
npm test
```

O smoke test valida as rotas públicas principais, a resposta 404 e o bloqueio de tentativas de path traversal no servidor local.

## Escopo atual

- Home responsiva, menu móvel, filtros visuais e diálogo de contato via WhatsApp.
- Página estática do Alimentador de Cavaco, Briquete e Pellets.
- Página 404, `robots.txt`, metadados e mídias locais.
- Sem integração de formulário, backend, banco de dados ou painel administrativo.

## Documentação

- [Plano Mestre](docs/PLANO_MESTRE_FORTSULSC.md) — fonte de verdade para governança e fase atual.
- [Checklist](docs/CHECKLIST.md) — cobertura e validações pendentes.
- [Design System](docs/DESIGN-SYSTEM.md) — tokens e regras visuais.
- [Componentes](docs/COMPONENTS.md) — blocos visuais atuais e mapeamento futuro.
- [Regras](docs/RULES.md) — limites técnicos e de segurança.
- [Contrato operacional de agentes](docs/FortSulSC_instrucoes_Hermes_Codex.md) — papéis, limites, delegação e processo obrigatório para agentes e subagentes.
- [Prompt de comunicação para agentes](docs/PROMPT_COMUNICACAO_AGENTES.md) — handoff consolidado do estado, decisões e regras atuais.
