# Política de Abstrações e Integrações Externas — FortSulSC

Status: regra arquitetural oficial e preventiva
Última revisão: 2026-09-04
Escopo: frontend, backend, infraestrutura e integrações futuras

> Esta política define critérios para uso de abstrações e fronteiras arquiteturais no FortSulSC. Ela não autoriza backend, banco, autenticação, serviços externos ou qualquer funcionalidade não aprovada no Plano Mestre.

> **Exemplos conceituais, não prescrições de implementação:** qualquer diagrama, nome de contrato ou estrutura citada neste documento ilustra uma direção possível. Não constitui backlog, escopo aprovado nem instrução para criar interfaces, repositories, adapters, providers, factories ou pastas.

## 1. Princípio

O FortSulSC deve utilizar abstrações quando elas reduzirem acoplamento relevante, isolarem infraestrutura ou serviços externos, aumentarem testabilidade ou permitirem substituição futura de tecnologia com impacto controlado.

Abstrações não devem ser criadas apenas por antecipação ou para adicionar camadas sem benefício concreto.

> Abstrair fronteiras de volatilidade, não abstrair tudo.

## 2. Dependências externas são fronteiras arquiteturais

Toda nova dependência de infraestrutura ou serviço externo deve ser avaliada antes da implementação. Isso inclui, por exemplo, persistência, autenticação, armazenamento de arquivos, e-mail, APIs de terceiros, analytics, logging, filas, mapas, busca, pagamentos e recursos específicos de hospedagem ou cloud.

O domínio e as regras de negócio não devem depender diretamente de SDKs, APIs ou tipos específicos desses fornecedores quando houver benefício real em manter a fronteira desacoplada.

## 3. Quando utilizar uma abstração

Criar uma abstração quando uma ou mais condições forem verdadeiras:

1. a tecnologia ou fornecedor pode ser substituído sem alterar a regra de negócio;
2. o SDK externo começaria a se espalhar por diferentes partes da aplicação;
3. a dependência dificulta testes sem conexão com infraestrutura externa;
4. a integração possui credenciais, configuração ou comportamento específico de ambiente;
5. diferentes implementações podem existir entre desenvolvimento, teste e produção;
6. a integração pertence claramente à infraestrutura e não ao domínio;
7. a troca da tecnologia exigiria modificar múltiplos módulos não relacionados;
8. o fornecedor expõe tipos ou conceitos técnicos que não deveriam contaminar o domínio.

## 4. Quando não criar abstração

Não criar interface, provider, repository, factory ou adapter apenas porque existe uma biblioteca externa, ela talvez seja trocada, há uma chamada simples e isolada, ou a camada adicional apenas replica a API do fornecedor.

Preferir a solução mais simples até existir motivo arquitetural concreto. A abstração precisa melhorar desacoplamento, testes, segurança ou manutenção de forma demonstrável.

## 5. Direção das dependências

A lógica da aplicação não deve depender da implementação tecnológica. Quando uma fronteira for justificada e aprovada, a direção conceitual desejada é:

```text
Domain / Application
        ↓
Port / Contract
        ↑
Infrastructure Adapter
        ↓
External SDK / Provider
```

O contrato pertence à aplicação ou ao domínio; a implementação pertence à infraestrutura. Contratos devem expressar necessidades do domínio, e não apenas renomear métodos de um SDK.

Por exemplo, um contrato de acesso a dados deve falar a linguagem do produto
(como buscar por um identificador de domínio ou persistir uma entidade), não
replicar operações e nomes específicos do cliente de persistência. O mesmo
critério vale para qualquer fornecedor. Os nomes citados são exemplos
conceituais, não uma lista de interfaces a criar.

## 6. Configuração e ambientes

O acesso a variáveis de ambiente deve ser centralizado quando a integração for aprovada. O uso localizado em infraestrutura existente pode ser apropriado; o objetivo é evitar `process.env` espalhado por componentes, regras de negócio e módulos de domínio.

A direção conceitual desejada é:

```text
process.env
    ↓
config/env validado e tipado
    ↓
aplicação e infraestrutura
```

Configurações devem ser lidas em ponto controlado, validadas no início quando aplicável, ter tipos claros, separar dados públicos de privados e nunca expor segredos ao frontend.

Nomes específicos de fornecedor devem permanecer na infraestrutura quando isso reduzir acoplamento. Esta diretriz não autoriza criar carregadores, validadores ou fábricas de configuração antecipadamente.

## 7. Hospedagem e provedores cloud

Arquivos de infraestrutura podem usar recursos específicos da plataforma. Regras de negócio e domínio, porém, não devem depender do provedor de hospedagem. Uma eventual troca de ambiente deve afetar prioritariamente configuração, infraestrutura e adaptadores.

Não criar abstração artificial para toda a plataforma de hospedagem: abstrair apenas capacidades utilizadas pela aplicação quando o desacoplamento trouxer benefício concreto.

Arquivos como `vercel.json`, `Dockerfile` e `docker-compose.yaml` podem usar
recursos próprios de infraestrutura. O limite é impedir que detalhes de runtime
ou hospedagem controlem regras de negócio.

## 8. Persistência, autenticação, storage e observabilidade

Tecnologias de persistência devem ser tratadas como detalhes de infraestrutura. Componentes visuais, páginas e regras de negócio não devem acessar diretamente o cliente de persistência; tipos gerados não devem contaminar desnecessariamente contratos de domínio ou apresentação.

Storage, autenticação, logging e outros provedores externos devem ser avaliados pela mesma política. Autenticação identifica sessão; autorização pertence às regras aprovadas da aplicação. Logs devem usar a abstração de logging aprovada pelo projeto e nunca conter segredos ou dados sensíveis desnecessários.

As capacidades, interfaces e implementações concretas desses limites somente serão definidas quando a fase correspondente estiver autorizada.

## 9. Fronteiras prioritárias quando autorizadas

Quando estas áreas forem aprovadas para implementação, elas são fortes
candidatas a uma fronteira explícita e devem receber avaliação arquitetural
específica antes de o SDK se espalhar pela aplicação:

| Área | Implementação inicial possível | A aplicação deve conhecer |
|---|---|---|
| Banco | Prisma/PostgreSQL | contrato de persistência orientado ao domínio |
| Storage e uploads | object storage compatível | capacidade de armazenamento ou upload |
| Autenticação | mecanismo de sessão | serviço ou porta de autenticação |
| E-mail | provedor de e-mail | capacidade de envio de mensagens |
| Logging | console, runtime ou serviço externo | logger aprovado pelo projeto |
| Analytics | serviço de analytics | capacidade de analytics |
| Serviços externos | SDK ou API de terceiro | contrato da aplicação |
| Filas e eventos | provedor eventual | capacidade de fila ou eventos |
| Configuração de ambiente | host, container ou runtime | configuração validada da aplicação |

Essa tabela não aprova fornecedores, tipos, nomes, interfaces ou implementações.
Ela somente identifica limites que exigirão proposta e aprovação específicas.

## 10. Composition root e testabilidade

Quando houver uma fronteira aprovada, a escolha da implementação concreta deve ocorrer em área controlada de composição ou configuração. A aplicação recebe as dependências necessárias sem conhecer detalhes de inicialização do fornecedor.

Abstrações devem permitir testar regras de aplicação sem serviços externos quando isso fizer sentido. Testes de domínio validam regras de negócio; testes de adapters validam a integração com a infraestrutura. Não deslocar regras de negócio para testes de integração apenas porque a infraestrutura está disponível.

## 11. Relação com ESLint e quality gates

A documentação define a arquitetura. ESLint deve automatizar apenas fronteiras objetivas e estáveis, como impedir acesso direto ao cliente de dados em camadas de apresentação ou chamadas diretas a `console` fora do logger autorizado.

Novas restrições ESLint, exceções ou `eslint-disable` para fronteiras arquiteturais exigem proposta, justificativa explícita e revisão separadas. Elas só devem ser avaliadas depois de uma implementação real validar a fronteira; ESLint protege uma arquitetura aprovada, não a inventa. Esta política não cria novas regras automaticamente.

## 12. Checklist para nova biblioteca, serviço ou provedor

Antes de integrar uma dependência externa, responder:

1. Qual problema real ela resolve?
2. Em qual camada ela pertence?
3. Ela faz parte do domínio ou é infraestrutura?
4. O SDK ficará restrito a poucos arquivos?
5. Seria difícil testar a aplicação sem esse serviço?
6. Existe probabilidade razoável de troca de fornecedor?
7. Seus tipos vazariam para o domínio?
8. É necessário criar uma porta ou adapter agora?
9. A solução simples evita complexidade preventiva?
10. Como configuração e segredos serão isolados?
11. Qual quality gate poderia proteger essa fronteira?
12. A implementação está autorizada pela fase vigente?

## 13. Regra de aprovação e objetivo de longo prazo

Identificar uma boa candidata a abstração não autoriza sua implementação. Repositories, adapters, providers, factories, interfaces de infraestrutura ou novas estruturas de pastas que constituam decisão arquitetural devem seguir os gates de proposta, aprovação e revisão definidos no [Plano Mestre](PLANO_MESTRE_FORTSULSC.md).

O objetivo é permitir evolução tecnológica controlada: quando tecnicamente razoável, uma troca de fornecedor deve ficar concentrada na infraestrutura, sem exigir reescrever regras de negócio ou componentes. Esse objetivo nunca justifica abstrações prematuras.
