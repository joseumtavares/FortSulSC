import { PrismaClient } from '@prisma/client'
import { getDatabaseConfig } from './config'

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

const databaseConfig = getDatabaseConfig()

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasourceUrl: databaseConfig.runtimeUrl,
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
