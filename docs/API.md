# API — FortSulSC

Status: documentação preventiva
Escopo atual: frontend estático, sem APIs implementadas
Última revisão: 2026-08-21

> **Governança:** consulte `PLANO_MESTRE_FORTSULSC.md` para saber se a Fase 3 (modelagem e regras de negócio) já foi aprovada antes de tratar qualquer conteúdo deste arquivo como implementável.

## 1. Estado atual

O projeto FortSulSC, neste momento, não possui backend, banco de dados, autenticação, rotas de API ou Server Actions implementadas.

Arquivos atuais relacionados à experiência pública:

- `index.html`;
- `styles.css`;
- `script.js`;
- assets em `image/`.

Qualquer API descrita neste documento como futura é apenas uma referência de organização. A criação de endpoints, contratos, regras de negócio, banco de dados ou CRUD administrativo depende de aprovação explícita do Jose.

## 2. APIs ativas

Nenhuma API ativa no momento.

| URL | Método | Status | Observação |
|---|---:|---|---|
| — | — | Não implementado | O projeto ainda está na etapa de design/frontend. |

## 3. Módulos de API previstos para fase futura

Os módulos abaixo aparecem no planejamento, mas ainda não representam contrato final:

- produtos;
- categorias;
- representantes;
- revendas;
- regiões;
- banners;
- autenticação administrativa;
- uploads;
- contato/orçamento, se aprovado.

## 4. Modelo obrigatório para documentar novos endpoints

Quando uma API for aprovada e implementada, cada endpoint deverá seguir este formato:

```md
## Nome do endpoint

- URL:
- Método HTTP:
- Descrição:
- Status:
- Visibilidade:
  - Pública
  - Administrativa
- Headers necessários:
- Autenticação:
- Permissões:
- Body da requisição:
- Resposta de sucesso:
- Respostas de erro:
- Exemplo completo:
- Observações de segurança:
```

## 5. Convenções futuras para endpoints

### 5.1 Nomenclatura

Usar nomes em inglês no código e URLs em plural:

- `/api/products`;
- `/api/categories`;
- `/api/representatives`;
- `/api/resellers`;
- `/api/banners`.

As URLs públicas devem expor apenas dados públicos e estritamente necessários.

### 5.2 Separação entre público e admin

Rotas públicas futuras:

```text
/api/public/...
```

Rotas administrativas futuras:

```text
/api/admin/...
```

Rotas administrativas devem exigir autenticação e autorização por papel.

### 5.3 Resposta padrão

Formato recomendado:

```json
{
  "data": {},
  "meta": {}
}
```

Formato recomendado para erro:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Mensagem segura para o usuário."
  }
}
```

Não retornar stack trace, query SQL, tokens, segredos ou detalhes internos.

### 5.4 Segurança de dados

Regras obrigatórias para a fase backend:

- nunca retornar objeto completo do Prisma em rota pública;
- usar `select` explícito em consultas públicas;
- separar dados públicos e privados de representantes;
- nunca expor `DATABASE_URL` ou segredos em variáveis `NEXT_PUBLIC_*`;
- validar entrada com schema antes de gravar dados;
- registrar auditoria em operações administrativas sensíveis;
- não logar CPF, documentos, dados bancários, endereço privado ou telefone pessoal.

## 6. Exemplo de documentação futura

Exemplo ilustrativo, não implementado.

### Listar produtos públicos

- URL: `/api/public/products`
- Método HTTP: `GET`
- Descrição: retorna produtos ativos para o site público.
- Status: planejado, não implementado.
- Visibilidade: pública.
- Headers necessários: nenhum especial.
- Autenticação: não exige.
- Body da requisição: não possui.
- Resposta de sucesso:

```json
{
  "data": [
    {
      "id": "product_id",
      "name": "Nome público do produto",
      "slug": "slug-do-produto",
      "category": "Categoria",
      "imageUrl": "https://..."
    }
  ]
}
```

- Respostas de erro:
  - `500`: erro interno genérico.
- Observações de segurança:
  - retornar somente campos públicos aprovados.

## 7. Regra final

Este arquivo não autoriza implementação de APIs. Ele define apenas o padrão de documentação a ser usado quando a fase backend for aprovada.
