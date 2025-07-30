// src/lib/authOptions.ts
import type { NextAuthOptions, Session, User } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from './prisma';
import bcrypt from 'bcrypt';
import type { JWT } from 'next-auth/jwt';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        senha: { label: 'Senha', type: 'password' },
      },
      async authorize(credentials) {
        console.log('🚀 Iniciando authorize');

        if (!credentials?.email || !credentials?.senha) {
          console.log('❌ Faltam credenciais');
          return null;
        }

        console.log('📥 Email recebido:', credentials.email);

        const user = await prisma.tb_usuarios.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          console.log('❌ Usuário não encontrado no banco');
          return null;
        }

        console.log('✅ Usuário encontrado:', user.email);
        console.log('🔐 Hash no banco:', user.senha_hash);

        const senhaConfere = await bcrypt.compare(credentials.senha, user.senha_hash);
        console.log('🧪 Resultado do bcrypt.compare:', senhaConfere);

        if (!senhaConfere) {
          console.log('❌ Senha incorreta');
          return null;
        }

        console.log('✅ Login bem-sucedido');

        return {
          id: String(user.id),
          email: user.email,
          name: user.cnpj,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: User }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (token?.id && session.user) {
        (session.user as any).id = token.id;
      }
      return session;
    },
  },
  secret: process.env.AUTH_SECRET,
};
