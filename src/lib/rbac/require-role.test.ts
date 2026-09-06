import { describe, expect, it } from 'vitest'
import { ForbiddenRoleError, requireRole } from './require-role'

describe('requireRole', () => {
  it('permite ADMIN em operação restrita a ADMIN', () => {
    expect(() => requireRole('ADMIN', ['ADMIN'])).not.toThrow()
  })

  it('rejeita EDITOR em operação restrita a ADMIN', () => {
    expect(() => requireRole('EDITOR', ['ADMIN'])).toThrow(ForbiddenRoleError)
  })

  it('permite ambos os papéis quando ambos estão na lista', () => {
    expect(() => requireRole('EDITOR', ['ADMIN', 'EDITOR'])).not.toThrow()
  })
})
