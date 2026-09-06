import type { PrismaClient, RateLimitContext, RateLimitDimension } from '@prisma/client'
import { Prisma } from '@prisma/client'

export interface RateLimitRule {
  windowMs: number
  limit: number
  /** Quando true, a tentativa que atinge o limite já é bloqueada. */
  blockAtLimit: boolean
}

interface RateLimitCheckInput {
  dimension: RateLimitDimension
  key: string
  context: RateLimitContext
  rule: RateLimitRule
}

function currentWindowStart(rule: RateLimitRule, now = Date.now()): Date {
  return new Date(Math.floor(now / rule.windowMs) * rule.windowMs)
}

export interface RateLimitCheckResult {
  allowed: boolean
  count: number
  windowStart: Date
  retryAfterMs: number
}

/**
 * Mantém explícita a diferença entre duas regras parecidas:
 * - falhas de login: a 5ª já bloqueia;
 * - cooldown de envio: a 1ª é permitida e a 2ª bloqueia.
 */
export function isRateLimitAllowed(count: number, rule: RateLimitRule): boolean {
  return rule.blockAtLimit ? count < rule.limit : count <= rule.limit
}

/** Retorna true enquanto não tiver passado uma janela completa desde o último envio. */
export function isWithinRateLimitCooldown(lastAttemptAt: Date, rule: RateLimitRule, now = new Date()): boolean {
  return now.getTime() - lastAttemptAt.getTime() < rule.windowMs
}

/**
 * Inicia um cooldown deslizante para uma chave. O lock consultivo evita que
 * duas requisições simultâneas atravessem a consulta e iniciem dois envios.
 */
export async function tryStartRateLimitCooldown(
  prisma: PrismaClient,
  { dimension, key, context, rule }: RateLimitCheckInput,
): Promise<boolean> {
  const now = new Date()
  const cutoff = new Date(now.getTime() - rule.windowMs)
  const lockKey = `${dimension}:${key}:${context}`

  return prisma.$transaction(async (tx) => {
    await tx.$executeRaw(Prisma.sql`SELECT pg_advisory_xact_lock(hashtext(${lockKey}))`)

    const latest = await tx.rateLimitCounter.findFirst({
      where: { dimension, key, context, updatedAt: { gt: cutoff } },
      orderBy: { updatedAt: 'desc' },
      select: { updatedAt: true },
    })
    if (latest && isWithinRateLimitCooldown(latest.updatedAt, rule, now)) return false

    await tx.rateLimitCounter.create({
      data: { dimension, key, context, windowStart: now, count: 1 },
    })
    return true
  })
}

/** Consulta o contador atual sem registrar uma nova tentativa. */
export async function isRateLimitBlocked(
  prisma: PrismaClient,
  { dimension, key, context, rule }: RateLimitCheckInput,
): Promise<boolean> {
  const counter = await prisma.rateLimitCounter.findUnique({
    where: {
      dimension_key_context_windowStart: {
        dimension,
        key,
        context,
        windowStart: currentWindowStart(rule),
      },
    },
    select: { count: true },
  })

  return !isRateLimitAllowed(counter?.count ?? 0, rule)
}

/**
 * Incremento atômico via `INSERT ... ON CONFLICT DO UPDATE`. Uma única
 * instrução SQL evita a corrida entre requisições concorrentes que um
 * `find` + `create`/`update` separados do Prisma Client não evitaria.
 */
export async function checkAndIncrementRateLimit(
  prisma: PrismaClient,
  { dimension, key, context, rule }: RateLimitCheckInput,
): Promise<RateLimitCheckResult> {
  const now = Date.now()
  const windowStart = currentWindowStart(rule, now)

  const rows = await prisma.$queryRaw<{ count: number }[]>(
    Prisma.sql`
      INSERT INTO rate_limit_counters (id, dimension, key, context, window_start, count, created_at, updated_at)
      VALUES (gen_random_uuid(), ${dimension}::"RateLimitDimension", ${key}, ${context}::"RateLimitContext", ${windowStart}, 1, now(), now())
      ON CONFLICT (dimension, key, context, window_start)
      DO UPDATE SET count = rate_limit_counters.count + 1, updated_at = now()
      RETURNING count
    `,
  )

  const count = Number(rows[0]?.count ?? 0)
  const windowEnd = windowStart.getTime() + rule.windowMs

  return {
    allowed: isRateLimitAllowed(count, rule),
    count,
    windowStart,
    retryAfterMs: Math.max(0, windowEnd - now),
  }
}
