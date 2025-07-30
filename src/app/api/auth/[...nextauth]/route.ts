// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth';
import { authOptions } from '@/lib/authOptions'; // ou '@/auth' se você preferir

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
