import { describe, expect, it } from 'vitest'
import { getDatabaseConfig } from './config'

describe('configuração de banco de dados', () => {
  it('usa PostgreSQL local por padrão quando DATABASE_URL existe', () => {
    expect(
      getDatabaseConfig({
        DATABASE_URL: 'postgresql://app:secret@db:5432/fortsul_dev',
      }),
    ).toEqual({
      provider: 'postgresql',
      platform: 'local',
      runtimeUrl: 'postgresql://app:secret@db:5432/fortsul_dev',
      migrationUrl: 'postgresql://app:secret@db:5432/fortsul_dev',
    })
  })

  it('separa URL agrupada de runtime e URL direta de migrations no Supabase', () => {
    expect(
      getDatabaseConfig({
        DATABASE_PROVIDER: 'postgresql',
        DATABASE_PLATFORM: 'supabase',
        DATABASE_URL: 'postgresql://pooler.example/app?pgbouncer=true',
        DATABASE_URL_MIGRATE: 'postgresql://direct.example/postgres?sslmode=require',
      }),
    ).toMatchObject({
      provider: 'postgresql',
      platform: 'supabase',
      runtimeUrl: 'postgresql://pooler.example/app?pgbouncer=true',
      migrationUrl: 'postgresql://direct.example/postgres?sslmode=require',
    })
  })

  it('não aceita provedor diferente de PostgreSQL', () => {
    expect(() =>
      getDatabaseConfig({
        DATABASE_PROVIDER: 'mysql',
        DATABASE_URL: 'mysql://user:password@db:3306/app',
      }),
    ).toThrow('DATABASE_PROVIDER')
  })

  it('exige URL de migrations para Supabase', () => {
    expect(() =>
      getDatabaseConfig({
        DATABASE_PLATFORM: 'supabase',
        DATABASE_URL: 'postgresql://pooler.example/app',
      }),
    ).toThrow('DATABASE_URL_MIGRATE')
  })
})
