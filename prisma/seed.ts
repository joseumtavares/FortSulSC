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
}

main()
  .catch((error: unknown) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
