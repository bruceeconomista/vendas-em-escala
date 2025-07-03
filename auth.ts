// auth.ts
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compare } from 'bcrypt';
import { Pool } from 'pg';

// Conexão com o banco PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Defina isso no Vercel e localmente
});

// Use 'export const' para desestruturar handlers, auth, signIn, signOut
export const {
  handlers: { GET, POST },
  auth, // <-- AGORA A FUNÇÃO 'auth' SERÁ EXPORTADA
  signIn,
  signOut,
} = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Login com Email e Senha',
      credentials: {
        email: { label: 'Email ou CNPJ', type: 'text' },
        senha: { label: 'Senha', type: 'password' },
      },
      async authorize(credentials) {
        const { email, senha } = credentials as { email: string; senha: string };

        const query = `
          SELECT * FROM tb_usuarios
          WHERE email = $1 OR cnpj = $1
          LIMIT 1
        `;

        const { rows } = await pool.query(query, [email]);
        const usuario = rows[0];

        if (!usuario) return null;

        const senhaValida = await compare(senha, usuario.senha_hash);
        if (!senhaValida) return null;

        return {
          id: usuario.id,
          email: usuario.email,
          cnpj: usuario.cnpj,
          telefone: usuario.telefone,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        (token as any).id = user.id;
        (token as any).cnpj = user.cnpj;
        (token as any).telefone = user.telefone;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = (token as any).id;
        session.user.cnpj = (token as any).cnpj;
        session.user.telefone = (token as any).telefone;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
});