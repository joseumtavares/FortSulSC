import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const UFS = ['PR', 'SC', 'RS'] as const
const IBGE_BASE_URL = 'https://servicodados.ibge.gov.br/api/v1/localidades'

type StateResponse = {
  id: number
  nome: string
  sigla: string
  regiao: { id: number; nome: string }
}

type MunicipalityResponse = { id: number; nome: string }

function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`IBGE ${url} retornou ${response.status}`)
  return (await response.json()) as T
}

async function importRegionSul() {
  const estados = await fetchJson<StateResponse[]>(`${IBGE_BASE_URL}/estados`)
  const estadosSul = estados.filter((estado) => (UFS as readonly string[]).includes(estado.sigla))
  if (estadosSul.length !== UFS.length) {
    throw new Error(`IBGE não retornou todas as UFs esperadas: ${UFS.join(', ')}`)
  }

  for (const estado of estadosSul) {
    const region = await prisma.region.upsert({
      where: { ibgeCode: String(estado.regiao.id) },
      update: { name: estado.regiao.nome, slug: slugify(estado.regiao.nome) },
      create: {
        ibgeCode: String(estado.regiao.id),
        name: estado.regiao.nome,
        slug: slugify(estado.regiao.nome),
      },
    })

    const state = await prisma.state.upsert({
      where: { ibgeCode: String(estado.id) },
      update: {
        name: estado.nome,
        uf: estado.sigla,
        slug: slugify(estado.nome),
        regionId: region.id,
      },
      create: {
        ibgeCode: String(estado.id),
        name: estado.nome,
        uf: estado.sigla,
        slug: slugify(estado.nome),
        regionId: region.id,
      },
    })

    const municipios = await fetchJson<MunicipalityResponse[]>(
      `${IBGE_BASE_URL}/estados/${estado.sigla}/municipios`,
    )
    for (const municipio of municipios) {
      await prisma.municipality.upsert({
        where: { ibgeCode: String(municipio.id) },
        update: { name: municipio.nome, slug: slugify(municipio.nome), stateId: state.id },
        create: {
          ibgeCode: String(municipio.id),
          name: municipio.nome,
          slug: slugify(municipio.nome),
          stateId: state.id,
        },
      })
    }
    console.log(`Importado: ${estado.nome} (${municipios.length} municípios)`)
  }
}

importRegionSul()
  .catch((error: unknown) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
