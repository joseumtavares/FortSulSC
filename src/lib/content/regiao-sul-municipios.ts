import geografiaSul from '../../../prisma/data/geografia-sul.json'

export type RegiaoSulMunicipio = { name: string; uf: string }

/**
 * Lista estática dos municípios da Região Sul (PR/SC/RS), mesma fonte oficial
 * do IBGE já usada para semear o banco (`prisma/seed.ts`). Empacotada com o
 * app em vez de consultada em tempo real: é dado de referência que não muda
 * (mesmo padrão já documentado em `region-repository.ts`), então a busca por
 * cidade no mapa público reconhece qualquer município da região — mesmo um
 * que ainda não tenha nenhum representante vinculado — sem depender de uma
 * chamada de rede nem da API do IBGE em produção.
 */
export const REGIAO_SUL_MUNICIPIOS: RegiaoSulMunicipio[] = geografiaSul.states
  .flatMap((state) => state.municipalities.map((municipality) => ({ name: municipality.name, uf: state.uf })))
  .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))

export function isKnownMunicipio(query: string): boolean {
  const term = query.trim().toLowerCase()
  return REGIAO_SUL_MUNICIPIOS.some((municipio) => municipio.name.toLowerCase() === term)
}

export function searchMunicipios(query: string, limit: number): RegiaoSulMunicipio[] {
  const term = query.trim().toLowerCase()
  if (!term) return []
  return REGIAO_SUL_MUNICIPIOS.filter((municipio) => municipio.name.toLowerCase().includes(term)).slice(0, limit)
}
