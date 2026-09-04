# Entrevista com o cliente — Fase 3: modelo, regras e segurança

**Objetivo:** fechar as decisões de negócio necessárias para aprovar o modelo conceitual da Fase 3 — antes de criar schema, migration, banco, login ou painel.

**Base revisada:** Home atual (Início, Soluções, Representantes, Novidades e dicas e CTA WhatsApp), `docs/PLANO_MESTRE_FORTSULSC.md` e `docs/PLANEJAMENTO_PROJETO.md`. Em caso de conflito, o Plano Mestre e a decisão aprovada mais recente prevalecem.

## Como conduzir — pensado para TDAH

- Faça **uma pergunta por vez**; não mostre o próximo item antes da resposta.
- Itens com **✅** já têm uma decisão registrada: apenas confirme se ela mudou. Se não mudou, pule.
- Itens com **★** precisam de resposta antes da modelagem correspondente.
- “Decidir depois” é uma resposta válida; registre-a, mas não crie a funcionalidade dependente dela.
- Divida em até três conversas curtas: **produto e atendimento**, **parceiros e conteúdo**, **privacidade e painel**.

---

## A. Objetivo do site, menu e atendimento

### A1 ★ Ação principal

**Pergunta:** qual ação é mais importante para quem entra no site?

- [ ] Pedir orçamento pelo WhatsApp
- [x] Encontrar representante/revenda
- [ ] Conhecer produtos e detalhes técnicos
- [ ] Ler conteúdos e novidades
- [ ] Outra: `____________________________`

### A2 Menu

**Pergunta:** o menu atual deve continuar com Início, Soluções, Representantes e Novidades e dicas?

- [ ] Sim, manter exatamente assim
- [ ] Manter, mas trocar nomes: `____________________________`
- [x] Adicionar/remover uma área: `Inicio, A FortSul, Soluções, Representantes, Novidades e dicas?`
- [ ] Decidir depois

Mudar a sessão A Fortsul para ter o mesmo funcionamento da sessão soluções com cards e menu com as seguintes opções Funcionamento das abas

Ao clicar em uma aba:

O conteúdo deve mudar sem recarregar a página;
A aba selecionada deve ficar visualmente destacada;
O conteúdo da nova aba deve surgir com uma animação moderna;
Criar um efeito de sobreposição de páginas, como se uma folha do fichário estivesse sendo trazida para frente.
Sugestão de animação

Utilizar uma combinação de:

Fade suave;
Pequeno deslocamento vertical;
Efeito de profundidade;
Sobreposição entre conteúdos;
Transição entre 300ms e 600ms.

Evitar animações exageradas.

O resultado deve ser elegante, moderno e fluido.

Exemplo visual do comportamento

Quando o usuário clicar em:

MISSÃO

A página atual deve suavemente sair para trás ou desaparecer.

A nova página deve surgir por cima, simulando:

Uma nova folha sendo selecionada dentro do fichário.

A experiência deve ser sofisticada e intuitiva.

📱 Responsividade

O componente deve funcionar perfeitamente em:

Desktop;
Notebook;
Tablet;
Smartphone.
Desktop

As abas devem ficar na parte superior do fichário, conforme a referência.

Mobile

Adaptar o sistema para manter a experiência intuitiva.

Sugestão:

Abas com rolagem horizontal;
Ou reorganização inteligente das abas;
Nunca deixar o conteúdo apertado ou difícil de navegar.
📝 Conteúdo das abas
ABA 01 — FORTSUL
Título principal
Mais de 15 anos levando tecnologia, eficiência e praticidade ao homem do campo.
Texto

A FortSul SC é uma indústria especializada no desenvolvimento e fabricação de máquinas, equipamentos e soluções para o setor agrícola.

Há mais de 15 anos, trabalhamos para transformar os desafios do campo em soluções mais eficientes, produtivas e acessíveis, contribuindo diretamente para a evolução do agronegócio brasileiro.

Nossa história é construída ao lado do produtor rural, entendendo as necessidades de cada atividade e desenvolvendo equipamentos que unem tecnologia, resistência, qualidade e praticidade.

Mais do que fabricar máquinas, buscamos oferecer soluções que ajudam o produtor a otimizar seu trabalho, reduzir custos e aumentar a eficiência de suas atividades.

Frase de destaque

FortSul: tecnologia e força para quem move o campo.

ABA 02 — NOSSA HISTÓRIA
Título
Uma história construída com trabalho, inovação e compromisso com o campo.
Texto

A FortSul SC nasceu com o propósito de desenvolver equipamentos capazes de facilitar o trabalho no campo e acompanhar a evolução do agronegócio brasileiro.

Localizada às margens da SC-108, na cidade de Orleans, Santa Catarina, a empresa consolidou sua trajetória através do desenvolvimento de produtos de alta qualidade, tecnologia e excelente custo-benefício.

Ao longo dos anos, ampliamos nossa atuação e conquistamos espaço no mercado agrícola, levando nossas soluções para diferentes regiões do Brasil, com forte presença especialmente na Região Sul.

Nossa evolução é resultado da busca constante por inovação, melhoria de processos e, principalmente, da confiança construída junto aos nossos clientes, parceiros e fornecedores.

Hoje, seguimos olhando para o futuro, investindo em tecnologia e desenvolvendo equipamentos preparados para atender às novas demandas do campo.

Frase de destaque

Nossa história começou no Sul do Brasil e continua crescendo ao lado do agronegócio brasileiro.

ABA 03 — MISSÃO
Título
Nossa Missão
Texto principal

Desenvolver e fornecer máquinas e equipamentos agrícolas que atendam às necessidades do produtor rural com qualidade, eficiência, tecnologia e confiabilidade.

Buscamos superar as expectativas dos nossos clientes por meio de soluções que proporcionem maior produtividade, praticidade e segurança para as atividades realizadas no campo.

Nosso compromisso é transformar conhecimento, experiência e inovação em equipamentos que contribuam para um agronegócio cada vez mais forte e eficiente.

Destaque visual sugerido

Qualidade + Tecnologia + Eficiência + Confiança

ABA 04 — VISÃO
Título
Nossa Visão
Texto

Ser reconhecida como uma empresa de referência no desenvolvimento de máquinas e equipamentos para o setor agrícola, destacando-se pela qualidade dos produtos, inovação e excelência no relacionamento com os clientes.

Nossa visão é contribuir para um agronegócio mais eficiente, moderno e sustentável, oferecendo soluções capazes de reduzir custos, otimizar processos e melhorar o desempenho das atividades agrícolas.

Queremos continuar crescendo junto com nossos clientes, acompanhando as transformações do mercado e investindo constantemente em novas tecnologias.

Frase de destaque

Evoluir constantemente para ajudar o campo a produzir cada vez melhor.

ABA 05 — VALORES
Título
Nossos Valores

O conteúdo desta aba deve ser apresentado de maneira mais visual, utilizando pequenos blocos, ícones discretos ou uma composição moderna dentro da página do fichário.

Valores
Ética e Transparência

Construímos relações baseadas na confiança, honestidade e responsabilidade.

Trabalho em Equipe

Acreditamos que grandes resultados são construídos através da colaboração entre pessoas.

Respeito

Valorizamos as pessoas, as diferenças e todos aqueles que fazem parte da nossa história.

Inovação

Buscamos constantemente novas tecnologias e soluções para acompanhar a evolução do agronegócio.

Relacionamento

Mantemos relações sólidas e duradouras com clientes, fornecedores e parceiros.

Qualidade

Trabalhamos para garantir excelência em cada processo, produto e serviço oferecido.

Desenvolvimento Sustentável

Buscamos crescer de forma responsável, contribuindo para um futuro mais eficiente e sustentável.

ABA 06 — SUSTENTABILIDADE
Título
Tecnologia para produzir hoje e construir o futuro.
Texto

Acreditamos que inovação e desenvolvimento devem caminhar junto com a responsabilidade.

Por isso, buscamos desenvolver equipamentos que contribuam para uma operação agrícola mais eficiente, reduzindo desperdícios, otimizando processos e aproveitando melhor os recursos disponíveis.

Nosso compromisso com o desenvolvimento sustentável está presente na busca constante por:

Maior eficiência operacional;
Melhor aproveitamento dos recursos;
Redução de desperdícios;
Equipamentos mais duráveis;
Soluções que contribuam para a produtividade do campo.
Frase de destaque

Desenvolver o presente com responsabilidade para fortalecer o futuro do agronegócio.

🎯 Direção de Design

A aparência geral deve transmitir:

Tecnologia;
Indústria;
Agronegócio;
Inovação;
Tradição;
Confiança.

Evitar um design infantil ou excessivamente colorido.

As cores das abas podem fazer referência ao fichário da imagem, porém de forma mais sofisticada e integrada à identidade visual da FortSul.

✨ Efeitos visuais recomendados

Adicionar efeitos sutis:

Ao passar o mouse sobre uma aba
Pequena elevação;
Sombra suave;
Transição de cor ou luminosidade;
Cursor indicando interação.
Aba ativa

A aba selecionada deve:

Ficar visualmente à frente das demais;
Parecer conectada à página ativa;
Possuir maior destaque visual;
Utilizar a cor institucional principal da FortSul quando possível.
Conteúdo

Ao trocar de aba:

Animação suave;
Efeito de página sobrepondo a anterior;
Sem piscadas ou carregamentos bruscos.
🏗️ Sugestão adicional de estrutura visual

Dentro da página principal do fichário, criar uma composição semelhante a:

TOPO

Pequeno selo ou identificação da seção;
Título da aba.

CENTRO

Texto principal;
Destaques;
Elementos gráficos discretos.

RODAPÉ

Frase institucional ou detalhe visual relacionado à FortSul.
⚠️ Instrução importante para o desenvolvimento

Não criar apenas um sistema comum de tabs.

O objetivo é que visualmente o componente realmente transmita a sensação de um fichário corporativo moderno, utilizando:

Profundidade;
Camadas;
Sobreposição;
Abas físicas;
Transições entre páginas.

A interação deve ser moderna, premium e agradável, mantendo sempre a identidade visual já existente no site da FortSul.

### A3 ✅ Orçamento

**Resposta registrada:** nesta fase, orçamento é **somente por WhatsApp**, sem formulário próprio. O número oficial atual é `(48) 3660-0818`.

- [x] Continua válido
- [ ] Mudou para: `____________________________`

### A4 Mensagem de WhatsApp

**Pergunta:** ao clicar em “Solicitar orçamento”, qual mensagem deve abrir?

- [ ] Mensagem genérica
- [x] Mensagem vim do site e gostaria de mais informações, quando clicar no botão whatsapp ou falar com a empresa quando for na seção dos revendedores tambem vamos ter um whatsapp de cada representante ou revendedor aqui a mensagem vai ser: vim do site da FortSul e gostaria de mais informações
- [ ] Mensagem em branco
- [ ] Decidir depois

### A5 Leads sem formulário

**Pergunta:** nesta primeira fase, devemos apenas abrir o WhatsApp, sem salvar no site dados ou histórico do visitante?

- [ ] Sim, só abrir o WhatsApp; não registrar lead no site
- [x] Registrar apenas que houve interesse, sem dados pessoais
- [ ] Criar formulário e guardar leads (escopo futuro)
- [ ] Decidir depois

---

## B. Soluções, produtos e categorias

### B1 ✅ Categorias oficiais

**Resposta consolidada:** as categorias são **Fumicultura, Equipamentos, Aviário, Piscicultura, Secadores e Acessórios**.

- [] Continua válido
- [x] Continua válida

### B2 ✅ “Biomassa”

**Resposta consolidada:** “Biomassa” não é categoria. Referências antigas devem ser corrigidas para a lista atual de seis categorias; não criar categoria nova sem aprovação explícita.

- [x] Continua válido
- [ ] Mudou para: `____________________________`

### B3 ★ Produto em mais de uma categoria

**Pergunta:** um produto pode aparecer em mais de uma categoria? Hoje o alimentador aparece em Equipamentos e Fumicultura.

- [x] Sim, pode aparecer em várias categorias
- [ ] Não, cada produto deve ter só uma categoria
- [ ] Depende do produto; explique: `____________________________`

### B4 ★ Página própria de produto

**Pergunta:** todo produto cadastrado precisa ter página própria?

- [ ] Sim, todos precisam de página
- [x] Não, alguns podem ser apenas cartão + Descrição curta
- [ ] Primeiro cartão + WhatsApp; página depois
- [ ] Decidir depois

### B5 ✅ Conteúdo mínimo da página de produto

**Resposta registrada:** a página detalhada já aprovada como referência contém imagens, aplicações, benefícios, especificações e CTA para WhatsApp.

**Pergunta restante:** qual conteúdo adicional deve existir?

- [ ] Nenhum nesta fase
- [x] Link para download do Catálogo em PDF
- [ ] Vídeo
- [ ] Outro: `____________________________`

### B6 ★ Dados técnicos públicos

**Pergunta:** quem aprova o que pode aparecer publicamente na ficha técnica, evitando expor detalhes que facilitem copiar um equipamento?

- [ ] Somente administrador
- [x] Administrador e editor
- [ ] O responsável técnico, antes da publicação
- [ ] Decidir depois

### B7 Catálogo, não e-commerce

**Pergunta:** confirme o limite comercial do site no lançamento.

- [x] Catálogo + WhatsApp; sem preço, carrinho, estoque, pagamento ou compra online
- [ ] Mostrar preço, mas sem compra online
- [ ] Incluir algum recurso de venda: `____________________________`
- [ ] Decidir depois

### B8 Publicação de produtos

**Pergunta:** quem pode publicar ou retirar um produto do site?

- [x] Somente administrador
- [ ] Editor prepara; administrador aprova
- [ ] Editor publica diretamente
- [ ] Decidir depois

### B9 ✅ Categorias novas

**Resposta registrada:** criar ou publicar uma categoria nova exige aprovação explícita do José.

- [x] Continua válido
- [ ] Mudou para: `____________________________`

### B10 URL e página antiga

**Pergunta:** quando uma página de produto mudar de endereço, o que deve acontecer com o link antigo?

- [x] Redirecionar automaticamente para a nova página
- [ ] Manter o link antigo enquanto for necessário
- [ ] Pode deixar de funcionar
- [ ] Decidir depois

---

## C. Fotos, arquivos e materiais

### C1 Upload de imagens

**Pergunta:** quem pode enviar fotos de produtos, banners e artigos?

- [ ] Somente administrador
- [x] Administrador e editor
- [ ] Parceiros podem enviar, mas alguém da FortSul aprova
- [ ] Decidir depois

### C2 ✅ Autorização de uso

**Resposta registrada:** fotos, localização, instalações, projetos ou equipamentos identificáveis de clientes/parceiros só podem ser publicados com autorização prévia.

- [x] Continua válido
- [ ] Mudou para: `____________________________`

### C3 ★ Limites de upload

**Pergunta:** quais arquivos o painel poderá aceitar?

- [x] Somente imagens, svg, JPG, PNG e WebP
- [ ] Imagens e PDFs
- [ ] Também vídeos
- [ ] Decidir depois

### C4 ★ Publicação de arquivo

**Pergunta:** uma imagem ou arquivo enviado deve aparecer imediatamente no site?

- [ ] Não; sempre precisa de revisão antes de publicar
- [x] Administrador pode publicar imediatamente
- [x] Editor pode publicar imediatamente
- [ ] Decidir depois

---

## D. Representantes e revendas

### D1 ✅ Papéis diferentes

**Resposta registrada:** representante vende em nome da FortSul; revenda compra da FortSul para revender. São cadastros e termos diferentes.

- [x] Continua válido, mas ambos estarão na mesma sessão
- [ ] Mudou para: `____________________________`

### D2 ✅ Dados públicos

**Resposta registrada:** o público pode ver somente dados aprovados: nome, contato comercial/WhatsApp, região e localização aproximada; na página pública, também redes sociais, link e logotipo quando existirem. Endereço residencial, documento, telefone pessoal e coordenadas exatas não são públicos.

- [x] Continua válido
- [ ] Ajustar: `____________________________`

### D3 ✅ Consentimento

**Resposta registrada:** representantes e revendas já deram consentimento para publicar nome, WhatsApp e localização aproximada. O sistema deve registrar esse consentimento antes de publicar.

- [x] Continua válido
- [ ] Ajustar: `____________________________`

### D4 ★ Revogação

**Pergunta:** se um parceiro retirar a autorização de divulgação, em quanto tempo seu perfil deve sair do site?

- [ ] Imediatamente
- [x] Em até 24 horas
- [ ] Em até 7 dias
- [ ] Decidir depois

### D5 ✅ Encontrar parceiro

**Resposta registrada:** o botão “Encontrar representante” levará a uma página com mapa à esquerda e dados do parceiro selecionado à direita.

- [x] Continua válido
- [ ] Ajustar: `____________________________`

### D6 Sem atendimento na região

**Pergunta:** se não houver parceiro na região escolhida, qual deve ser a próxima ação?

- [x] Oferecer WhatsApp da FortSul
- [ ] Mostrar parceiros de regiões próximas
- [ ] Mostrar apenas a mensagem “em breve”
- [ ] Decidir depois

### D7 Dados privados mínimos

**Pergunta:** quais dados privados são realmente necessários para administrar cada parceiro?

- [ ] Apenas contato interno e observações
- [ ] Também endereço comercial
- [x] Também documento, quando necessário
- [ ] Outro: `____________________________`

### D8 Acesso a dados privados

**Pergunta:** quem pode consultar os dados privados dos parceiros?

- [x] Somente administrador
- [ ] Administrador e um responsável comercial definido
- [ ] Editor também pode consultar
- [ ] Decidir depois

---

## E. Novidades, dicas e artigos

### E1 ✅ Dois tipos de conteúdo

**Resposta registrada:** “Novidades e dicas” continua como seção estática da Home. “Artigos” é uma área editorial/CMS separada; não fundir os dois.

- [x] Continua válido
- [ ] Ajustar: `____________________________`

### E2 Publicação de artigos

**Pergunta:** quem pode publicar um artigo?

- [ ] Somente administrador
- [x] Editor escreve; administrador aprova
- [ ] Editor publica diretamente
- [ ] Decidir depois

### E3 ✅ Autor público

**Resposta registrada:** artigos exibem data de publicação, mas não o nome do autor. O sistema registra internamente quem publicou.

- [x] Continua válido
- [ ] Ajustar: `____________________________`

### E4 Conteúdo inicial

**Pergunta:** o que deve entrar primeiro em Artigos?

- [x] Dicas de uso e manutenção
- [ ] Novidades de produtos
- [ ] Casos de clientes autorizados
- [ ] Notícias institucionais
- [ ] Decidir depois

---

## F. Banners e dados institucionais

### F1 Banner na Home

**Pergunta:** você quer trocar um banner sem alterar código?

- [x] Sim, com imagem, texto e link
- [ ] Sim, somente imagem e link
- [ ] Não nesta fase
- [ ] Decidir depois

### F2 Agendamento

**Pergunta:** um banner precisa de data para começar e terminar de aparecer?

- [x] Sim
- [ ] Não; ligar/desligar manualmente basta
- [ ] Decidir depois

### F3 ✅ Dados institucionais configuráveis

**Resposta registrada:** WhatsApp, telefone, redes sociais, CNPJ, Endereço e e-mail institucional devem ser centralizados e editáveis pelo painel. O e-mail institucional contato@fortsulsc.com.br .

**Pergunta restante:** quem pode alterar esses dados?

- [ ] Somente administrador
- [x] Administrador e editor
- [ ] Decidir depois

---

## G. Painel interno, segurança e histórico

### G1 ✅ Perfis internos

**Resposta registrada:** os perfis iniciais são **Admin** e **Editor**. Representantes e revendas não recebem acesso ao painel nesta fase.

- [x] Continua válido
- [ ] Ajustar: `____________________________`

### G2 ★ Permissões do Editor

**Pergunta:** o Editor pode alterar o quê?

- [ ] Só artigos
- [ ] Artigos, produtos e imagens
- [ ] Também parceiros
- [x] Tudo, exceto usuários, dados privados e configurações sensíveis
- [ ] Decidir depois

### G3 Gestão de contas

**Pergunta:** quem cria, bloqueia ou desativa contas de Admin e Editor?

- [x] Somente administrador
- [ ] Administrador com confirmação de outra pessoa
- [ ] Serviço externo de login controla isso
- [ ] Decidir depois

### G4 Exclusões

**Pergunta:** quando um produto, artigo ou parceiro for removido, o que deve acontecer?

- [x] Desativar/ocultar e manter histórico
- [ ] Excluir definitivamente
- [ ] Pedir confirmação e decidir caso a caso
- [ ] Decidir depois

### G5 ✅ Auditoria

**Resposta registrada:** deve ficar registrado quem criou, editou, publicou ou removeu produtos, artigos, parceiros e configurações importantes. Logs nunca devem guardar documentos, endereço privado ou telefone pessoal em texto livre.

- [x] Continua válido
- [ ] Ajustar: `____________________________`

### G6 Acesso ao histórico

**Pergunta:** quem pode consultar o histórico de auditoria?

- [ ] Somente administrador
- [ ] Administrador e responsável comercial
- [x] Editor também pode consultar
- [ ] Decidir depois

### G7 ★ Proteção do login

**Pergunta:** a confirmação por segundo fator (MFA) deve ser obrigatória para o painel?

- [x] Sim, para todos os usuários internos o sistema de veficicação deve ser por email cadastrado do usuario, o sistema deve gerar um codigo e enviar para o email e o usuario insere o codigo recebido
- [ ] Só para administradores
- [ ] Não nesta fase
- [ ] Decidir depois

### G8 ★ Abuso e tentativas indevidas

**Pergunta:** quando houver muitas tentativas de login, spam ou coleta automática de parceiros, qual resposta prefere?

- [x] Bloquear temporariamente e avisar o administrador , bloquear IP apos 5 tentativas e manter historico
- [ ] Bloquear temporariamente, sem aviso
- [ ] Apenas registrar no histórico
- [ ] Decidir depois

---

## H. Privacidade, LGPD e continuidade

### H1 ✅ Dados que nunca são públicos

**Resposta registrada:** documento, telefone pessoal, credenciais, tokens, senhas nunca podem aparecer em rotas públicas, logs ou telas comuns do painel.

- [x] Continua válido
- [ ] Ajustar: `____________________________`

### H2 ★ Retenção e exclusão de dados

**Pergunta:** após desativar um parceiro, apagar uma conta ou receber pedido de exclusão, por quanto tempo os dados pessoais devem ser guardados?

- [ ] Excluir imediatamente, exceto o que a lei obrigar
- [ ] Manter por 30 dias para recuperação
- [x] Manter por 1 ano para histórico administrativo
- [ ] Definir com orientação jurídica antes de implementar

### H3 Política de privacidade

**Pergunta:** a política de privacidade já redigida deve entrar sa sessão A fortsul como outra aba antes do lançamento de recursos com dados pessoais?

- [x] Sim, antes de publicar parceiros ou formulário 
- [ ] Sim, antes do lançamento completo
- [ ] Não nesta fase
- [ ] Decidir depois

### H4 Backups

**Pergunta:** qual é a prioridade para recuperar dados caso haja erro ou perda?

- [ ] Backup diário; recuperação importante
- [x] Backup semanal basta
- [ ] Definir com a infraestrutura de produção
- [ ] Decidir depois

---

## I. Métricas, navegador e lançamento

### I1 Analytics e cookies

**Pergunta:** o site poderá usar uma ferramenta de métricas para saber quais páginas e CTAs funcionam melhor?

- [x] Sim, somente métricas anônimas/essenciais
- [ ] Sim, com banner de consentimento de cookies
- [ ] Não nesta fase
- [ ] Decidir depois

### I2 ★ Como medir sucesso

**Pergunta:** qual resultado mostra que o lançamento deu certo?

- [x] Mais conversas qualificadas no WhatsApp
- [ ] Mais pessoas encontrando um parceiro
- [ ] Time conseguindo atualizar conteúdo sem programador
- [ ] Outro: `____________________________`

### I3 ✅ Banco local

**Resposta registrada:** o PostgreSQL local continua sem porta exposta no computador; uso e migrations ocorrem pela rede interna do Docker.

- [x] Continua válido
- [ ] Reavaliar essa decisão técnica

### I4 Dados reais no lançamento

**Resposta registrada:** o lançamento prevê cerca de dez produtos; o cadastro inicial será feito por José Tavares.

**Pergunta restante:** além de categorias e produtos, o que deve estar pronto no primeiro lançamento?

- [x] Catálogo de produtos
- [x] Também representantes/revendas
- [ ] Também artigos e banners
- [ ] Decidir depois

---

## Fechamento para quem conduz

Este bloco não cria decisões novas: ele resume a entrevista em linguagem de negócio para conferir se o modelo e o escopo foram entendidos corretamente. Use uma frase curta por campo.

| Campo | Para que serve | Exemplo coerente com as respostas atuais |
|---|---|---|
| **Objetivo principal** | Define qual resultado o site deve priorizar quando houver conflito entre recursos. | `Permitir que o visitante encontre um representante ou revenda e inicie atendimento pelo WhatsApp.` |
| **Público principal** | Define para quem as páginas, textos e CTAs são escritos. Não é quem administra o painel. | `Produtores rurais e empresas do agronegócio que procuram equipamentos e atendimento regional.` |
| **Primeira funcionalidade a entregar** | Define a prioridade percebida pelo cliente; não precisa ser a primeira tarefa técnica. | `Página de representantes e revendas por região, com dados públicos e WhatsApp do parceiro selecionado.` |
| **Dados públicos aprovados** | Vira a lista máxima de campos que podem aparecer em página, mapa e API pública. | `Nome, tipo (representante ou revenda), região, WhatsApp comercial, redes sociais, link, logotipo e localização aproximada.` |
| **Dados privados necessários** | Limita os dados guardados internamente ao mínimo necessário; nunca vão para o site público. | `Documento somente quando necessário e registro do consentimento de publicação. Outros dados só entram se houver necessidade administrativa comprovada.` |
| **Quem administra o site** | Define a primeira conta administrativa e a responsabilidade final sobre acessos. | `José Tavares como Admin; futuros Editores são criados, bloqueados e removidos pelo Admin.` |
| **Decisões adiadas** | Registra o que foi conscientemente deixado para depois, evitando que entre no projeto por acidente. | `Vídeos em páginas de produto, formulário próprio de orçamento, venda online e qualquer função não marcada nesta entrevista.` |
| **Itens fora do escopo** | Declara o que não será construído neste ciclo, mesmo que seja tecnicamente possível. | `Carrinho, preço, estoque, pagamento e compra online; formulário de orçamento; acesso de representantes/revendas ao painel.` |

### Resumo preenchido — sugestão para confirmar

- **Objetivo principal:** `Permitir que o visitante encontre um representante ou revenda e inicie atendimento pelo WhatsApp.`
- **Público principal:** `Produtores rurais e empresas do agronegócio que procuram equipamentos e atendimento regional com foco na fumicultura.`
- **Primeira funcionalidade a entregar:** `Página de representantes e revendas por região, com dados públicos e WhatsApp do parceiro selecionado.`
- **Dados públicos aprovados:** `Nome, tipo, logotipo, breve descrição da história da empresa parceira, regiões de atendimento, WhatsApp comercial, redes sociais, link, logotipo e localização aproximada.`
- **Dados privados necessários:** `Documento quando necessário e registro do consentimento de publicação; nenhum dado além do necessário para a administração.`
- **Quem administra o site:** `José Tavares (Admin).`
- **Decisões adiadas:** `Vídeos, formulário próprio de orçamento e recursos de venda online.`
- **Itens fora do escopo:** `Carrinho, preços, estoque, pagamento, compra online e acesso de parceiros ao painel.`

| Grupo de respostas | Modelo ou regra que elas definem |
|---|---|
| A e B | fluxo comercial, `Category`, `Product`, página detalhada e URLs |
| C | imagens, arquivos, autorização e publicação |
| D | `Region`, `Representative`, `Reseller`, dados públicos/privados e consentimento |
| E | `Article` e fluxo editorial |
| F | `Banner` e `InstitutionalSettings` |
| G | `AdminUser`, permissões, autenticação e `AuditLog` |
| H | minimização de dados, retenção, privacidade e backup |
| I | métricas, critérios de sucesso e dados iniciais |

> Não criar schema, migration ou dados reais enquanto as perguntas ★ que afetam a respectiva fatia não estiverem respondidas e o resumo final não for confirmado pelo cliente.
