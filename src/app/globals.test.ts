import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const styles = readFileSync(resolve(process.cwd(), 'src/app/globals.css'), 'utf8')

describe('camadas da seção Soluções', () => {
  it('impede que o elemento decorativo bloqueie toques nos filtros', () => {
    expect(styles).toMatch(/\.solutions::before\s*\{[^}]*pointer-events:\s*none;/)
    expect(styles).toMatch(/\.solutions \.container\s*\{[^}]*position:\s*relative;[^}]*z-index:\s*1;/)
  })
})
