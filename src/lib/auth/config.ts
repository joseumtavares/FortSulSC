import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { prisma } from '@/lib/db/client'
import { requireMfaCodePepper } from './env'
import { consumePendingLoginAndCode, loadActivePendingLogin } from './pending-login'
import { verifyLoginCodeHash } from './login-code'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name: string
      email: string
      role: string
    }
  }
}

declare module '@auth/core/jwt' {
  interface JWT {
    id?: string
    role?: string
    tokenVersion?: number
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  // O Auth.js lê AUTH_SECRET quando atende a requisição. Não o validamos
  // durante a importação deste módulo: o Next.js também o importa no build,
  // enquanto o segredo só é entregue ao container em tempo de execução.
  // O docker-compose mantém AUTH_SECRET como variável obrigatória no runtime.
  // O valor deve ser true apenas quando o Host chega de um ambiente controlado
  // (Docker local ou proxy reverso configurado); a origem CSRF continua sendo
  // validada separadamente pelos endpoints próprios.
  trustHost: process.env.AUTH_TRUST_HOST === 'true',
  session: {
    strategy: 'jwt',
    // Sessão curta de propósito: o callback `jwt` revalida `active`/`role`/
    // `tokenVersion` a cada requisição (revogação imediata, ver proposta
    // §3.3), mas um maxAge curto limita a janela mesmo em caso de falha
    // não prevista nessa revalidação. Reduzido de 8h para 2h a pedido do
    // Jose (achado de segurança: sessão longa demais para um painel
    // administrativo); o logout por inatividade (15 min, `IdleLogoutWatcher`)
    // cobre o caso de esquecer a aba aberta dentro dessas 2h.
    maxAge: 60 * 60 * 2,
  },
  providers: [
    Credentials({
      credentials: {
        pendingLoginId: { label: 'pendingLoginId', type: 'text' },
        code: { label: 'code', type: 'text' },
      },
      async authorize(raw) {
        const pendingLoginId = typeof raw?.pendingLoginId === 'string' ? raw.pendingLoginId : null
        const code = typeof raw?.code === 'string' ? raw.code : null
        if (!pendingLoginId || !code) return null

        // A prova de identidade nunca vem do cliente: tudo é recarregado
        // do banco a partir do `pendingLoginId` (token opaco).
        const pending = await loadActivePendingLogin(prisma, pendingLoginId)
        if (!pending || !pending.adminUser.active) return null

        const loginCode = await prisma.adminLoginCode.findFirst({
          where: {
            adminUserId: pending.adminUserId,
            consumedAt: null,
            expiresAt: { gt: new Date() },
          },
          orderBy: { createdAt: 'desc' },
        })
        if (!loginCode) return null

        const pepper = requireMfaCodePepper()
        if (!verifyLoginCodeHash(code, pepper, loginCode.codeHash)) return null

        const consumed = await consumePendingLoginAndCode(prisma, pending.id, loginCode.id)
        if (!consumed) return null

        return {
          id: pending.adminUser.id,
          email: pending.adminUser.email,
          name: pending.adminUser.name,
          role: pending.adminUser.role,
          tokenVersion: pending.adminUser.tokenVersion,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as { role: string }).role
        token.tokenVersion = (user as { tokenVersion: number }).tokenVersion
      }

      if (!token.id) return null

      // Revalidação a cada requisição — permite revogar uma sessão já
      // emitida sem esperar a expiração natural do JWT (proposta §3.3).
      const current = await prisma.adminUser.findUnique({
        where: { id: token.id },
        select: { active: true, role: true, tokenVersion: true },
      })

      if (!current || !current.active || current.tokenVersion !== token.tokenVersion) {
        return null
      }

      token.role = current.role
      return token
    },
    session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id
        session.user.role = token.role ?? 'EDITOR'
      }
      return session
    },
  },
})
