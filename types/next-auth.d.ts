import NextAuth from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: number;
      email: string;
      cnpj: string;
      telefone: string;
    };
  }

  interface User {
    id: number;
    email: string;
    cnpj: string;
    telefone: string;
  }

  interface JWT {
    id: number;
    email: string;
    cnpj: string;
    telefone: string;
  }
}
