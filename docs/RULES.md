# Regras do Projeto — FortSulSC

Status: regras obrigatórias de desenvolvimento
Última revisão: 2026-08-21

> **Governança:** o status vigente de fase e as pendências que bloqueiam avanço estão em `PLANO_MESTRE_FORTSULSC.md`. Estas regras valem em todas as fases; o Plano Mestre diz qual fase está autorizada agora.

## 1. Regra principal de escopo

Não implementar backend, banco de dados, autenticação, CRUD administrativo ou regras de negócio sem aprovação explícita do Jose.

A fase atual é documentação, planejamento, design e frontend — conforme registrado em `PLANO_MESTRE_FORTSULSC.md`.

## 1.1. Fluxo obrigatório de aprovação em duas camadas

Nenhuma implementação estrutural (schema, endpoint, regra de negócio, componente com decisão de arquitetura) começa sem passar, nesta ordem, por:

1. proposta/modelagem apresentada pelo agente implementador;
2. análise e aprovação do Jose;
3. revisão técnica do Claude;
4. implementação + testes automatizados (smoke tests), somente após 2 e 3;
5. lista de testes manuais entregue ao Jose (no navegador, para o FortSulSC);
6. aprovação dupla (Jose e Claude) antes de qualquer commit ou push.

A partir da Fase 3 (modelagem e regras de negócio), toda proposta de regra de negócio nova deve vir com contrato de testes em código — não em prosa — já na etapa 1. Detalhe completo em `PLANO_MESTRE_FORTSULSC.md`, seção 4.

## 2. Convenções de código

- usar HTML semântico na fase estática;
- usar CSS organizado por seção;
- usar JavaScript apenas para interação de interface;
- manter acessibilidade básica;
- evitar dependências desnecessárias;
- não misturar regra de negócio com componente visual.

Na fase Next.js futura:

- usar TypeScript;
- preferir Server Components por padrão;
- usar `"use client"` apenas quando necessário;
- validar entradas no servidor;
- isolar acesso a dados em camada própria;
- não acessar Prisma diretamente em componentes visuais.

## 3. Nomeação de arquivos

Estado atual:

- `index.html`;
- `styles.css`;
- `script.js`.

Fase futura:

- componentes React em PascalCase;
- hooks com prefixo `use`;
- utilitários em camelCase;
- arquivos de rota seguindo App Router;
- schemas em arquivos claros por domínio.

Exemplos:

- `HeroSection.tsx`;
- `SolutionCard.tsx`;
- `RepresentativeMap.tsx`;
- `product.schema.ts`;
- `whatsapp.ts`.

## 4. Nomeação de componentes

- seções: `SomethingSection`;
- cards: `SomethingCard`;
- listas: `SomethingList`;
- filtros: `SomethingFilters`;
- layout: `SiteHeader`, `SiteFooter`, `AdminShell`;
- mapas: `RepresentativeMap`, `ResellerMap`.

## 5. Organização de pastas

Documentação fica em:

```text
docs/
```

Assets atuais ficam em:

```text
image/
```

Estrutura Next.js futura deve seguir `docs/ARCHITECTURE.md`.

## 6. Estrutura de commits

Jose conduz o fluxo Git. O agente deve sugerir comandos e explicar o que fazer, mas não executar Git sem pedido explícito.

Formato recomendado:

```text
tipo: descrição curta
```

Tipos sugeridos:

- `docs`;
- `feat`;
- `fix`;
- `style`;
- `refactor`;
- `test`;
- `chore`.

Exemplo:

```text
docs: dividir documentação do projeto FortSulSC
```

## 7. Regras de performance

- otimizar imagens antes de produção;
- evitar scripts desnecessários;
- evitar carrosséis pesados sem necessidade;
- carregar mapas interativos apenas onde forem usados;
- evitar bibliotecas grandes para interações simples;
- medir antes de otimizar agressivamente.

## 8. Regras de acessibilidade

- toda imagem relevante precisa de `alt`;
- SVG decorativo deve usar `aria-hidden="true"`;
- botões devem ter texto ou label acessível;
- foco visível deve ser preservado;
- menu mobile deve informar estado aberto/fechado;
- respeitar `prefers-reduced-motion`;
- contraste deve ser verificado em textos sobre imagens.

## 9. Regras de SEO

- cada página deve ter título único;
- cada página deve ter meta description;
- URLs devem ser legíveis;
- produtos devem ter slugs claros;
- imagens importantes devem ter alt descritivo;
- manter `robots.txt` no frontend estático e implementar sitemap na fase Next.js, se aprovado;
- considerar dados estruturados para negócio local.

## 10. Regras de segurança futura

Quando backend for aprovado:

- nunca expor segredos no frontend;
- não usar `NEXT_PUBLIC_*` para credenciais;
- separar dados públicos e privados;
- usar `select` explícito em consultas públicas;
- validar todos os inputs;
- proteger `/admin`;
- aplicar RBAC;
- adicionar MFA;
- validar uploads;
- não logar dados sensíveis;
- auditar alterações administrativas.

## 11. Boas práticas obrigatórias

- consultar o SecondBrain antes de nova tarefa;
- usar os skills aplicáveis de `addyosmani/agent-skills`, começando por `using-agent-skills`;
- usar Context7 para documentação atual de bibliotecas, frameworks, SDKs, APIs, CLIs ou serviços envolvidos;
- manter documentação sincronizada com decisões;
- preferir solução simples e sustentável;
- preservar o design aprovado;
- apresentar modernizações visuais antes de implementar;
- consultar o planejamento antes de expandir escopo;
- registrar decisões relevantes no SecondBrain quando houver entrega significativa.

## 12. O que nunca deve ser feito

- não criar regra de negócio sem aprovação;
- não criar banco sem aprovação;
- não criar CRUD sem aprovação;
- não expor dados privados de representantes;
- não publicar coordenada privada de pessoa física;
- não salvar segredos no repositório;
- não alterar padrão visual aprovado sem avisar;
- não adicionar dependência pesada sem justificativa;
- não transformar documentação em contrato implementado sem validação;
- não fazer commit ou push sem a aprovação dupla (Jose e Claude) descrita na seção 1.1.

## 12.1. Registro de segurança dos recovery codes

O Git publicado possui um único commit e não lista `recovery-codes-vercel-fortsul.txt` no histórico. Portanto, não há histórico publicado a purgar. Essa verificação usa somente nome e metadados: nenhum agente deve ler, exibir ou reutilizar conteúdo de arquivo potencialmente secreto.

A confirmação de revogação/regeneração na Vercel ainda depende do Jose. Independentemente dela, commits e push continuam proibidos sem a aprovação dupla descrita na seção 1.1.

## 13. Checklist antes de finalizar tarefa

- A alteração está dentro do escopo pedido?
- Algum documento precisa ser atualizado?
- A alteração preserva frontend/design como foco atual?
- Não houve criação de regra de negócio?
- Não houve criação de backend/banco?
- Acessibilidade básica foi mantida?
- Responsividade foi preservada?
- Nenhum segredo foi lido, exposto ou salvo?
