import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const categories = [
  { name: 'Fumicultura', slug: 'fumicultura', order: 1 },
  { name: 'Equipamentos', slug: 'equipamentos', order: 2 },
  { name: 'Aviário', slug: 'aviario', order: 3 },
  { name: 'Piscicultura', slug: 'piscicultura', order: 4 },
  { name: 'Secadores', slug: 'secadores', order: 5 },
  { name: 'Acessórios', slug: 'acessorios', order: 6 },
]

async function seedInitialAdmin() {
  const email = process.env.ADMIN_SEED_EMAIL
  const password = process.env.ADMIN_SEED_PASSWORD
  const shouldResetPassword = process.env.ADMIN_SEED_RESET_PASSWORD === 'true'
  if (!email || !password) {
    // O serviço Docker `seed` ativa esta trava. Assim, ele nunca termina
    // "com sucesso" sem realmente criar o administrador solicitado.
    if (process.env.SEED_ADMIN_REQUIRED === 'true') {
      throw new Error('ADMIN_SEED_EMAIL e ADMIN_SEED_PASSWORD são obrigatórios para criar o administrador inicial.')
    }

    console.log('ADMIN_SEED_EMAIL/ADMIN_SEED_PASSWORD ausentes — pulando criação do AdminUser inicial.')
    return
  }

  const existing = await prisma.adminUser.findUnique({ where: { email } })
  if (existing) {
    // A redefinição exige uma escolha explícita no .env local. Isso evita
    // mudar a senha por acidente ao repetir o seed normalmente.
    if (shouldResetPassword) {
      const { hashPassword } = await import('../src/lib/auth/crypto')
      await prisma.adminUser.update({
        where: { id: existing.id },
        data: { passwordHash: await hashPassword(password) },
      })
      console.log('Senha do AdminUser inicial atualizada.')
      return
    }

    console.log(`AdminUser ${email} já existe — nada a fazer.`)
    return
  }

  const { hashPassword } = await import('../src/lib/auth/crypto')
  const passwordHash = await hashPassword(password)
  await prisma.adminUser.create({
    data: {
      email,
      name: 'Administrador inicial',
      role: 'ADMIN',
      passwordHash,
    },
  })
  console.log(`AdminUser inicial ${email} criado.`)
}

async function main() {
  await Promise.all(
    categories.map((category) =>
      prisma.category.upsert({
        where: { slug: category.slug },
        update: { name: category.name, order: category.order },
        create: category,
      }),
    ),
  )
  await seedInitialAdmin()
}

main()
  .catch((error: unknown) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
