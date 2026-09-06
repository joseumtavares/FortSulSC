import { prisma } from '../src/lib/db/client'

const ONE_DAY_MS = 24 * 60 * 60 * 1000
const ONE_YEAR_MS = 365 * ONE_DAY_MS

// Retenção curta para estado de MFA (consumido/expirado): reduz o tempo em
// que código/estado pendente ficam armazenados, mantendo margem para
// investigar um incidente recente. Retenção de 1 ano para o histórico de
// tentativas e contadores, conforme decisão da Fase 3.
async function purgeSecurityData() {
  const now = Date.now()
  const shortRetentionCutoff = new Date(now - ONE_DAY_MS)
  const longRetentionCutoff = new Date(now - ONE_YEAR_MS)

  const [expiredCodes, expiredPendingLogins, oldAttempts, oldCounters] = await prisma.$transaction([
    prisma.adminLoginCode.deleteMany({
      where: {
        OR: [{ consumedAt: { lt: shortRetentionCutoff } }, { expiresAt: { lt: shortRetentionCutoff } }],
      },
    }),
    prisma.pendingLogin.deleteMany({
      where: {
        OR: [{ consumedAt: { lt: shortRetentionCutoff } }, { expiresAt: { lt: shortRetentionCutoff } }],
      },
    }),
    prisma.loginAttempt.deleteMany({ where: { createdAt: { lt: longRetentionCutoff } } }),
    prisma.rateLimitCounter.deleteMany({ where: { windowStart: { lt: longRetentionCutoff } } }),
  ])

  console.log(
    `Expurgo de segurança: ${expiredCodes.count} códigos, ${expiredPendingLogins.count} logins pendentes, ` +
      `${oldAttempts.count} tentativas, ${oldCounters.count} contadores de rate limit removidos.`,
  )
}

purgeSecurityData()
  .catch((error) => {
    console.error('Falha no expurgo de segurança:', error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
