'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';

export default function LoginPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    email: '',
    senha: '',
  });

  const [erro, setErro] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErro('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await signIn('credentials', {
      redirect: false,
      email: form.email,
      senha: form.senha,
    });

    if (res?.error) {
      setErro('Credenciais inválidas. Verifique seu email ou senha.');
    } else {
      router.push('/'); // Redireciona para a home após login
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 text-black flex items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded shadow-md w-full max-w-md space-y-4"
      >
        <h1 className="text-2xl font-bold text-center mb-4">Login</h1>

        <input
          name="email"
          type="text"
          placeholder="Email ou CNPJ"
          value={form.email}
          onChange={handleChange}
          required
          className="w-full border px-4 py-2 rounded"
        />

        <input
          name="senha"
          type="password"
          placeholder="Senha"
          value={form.senha}
          onChange={handleChange}
          required
          className="w-full border px-4 py-2 rounded"
        />

        {erro && <p className="text-red-600 text-sm text-center">{erro}</p>}

        <button
          type="submit"
          className="bg-indigo-600 text-white px-4 py-2 rounded w-full hover:bg-indigo-500"
        >
          Entrar
        </button>

        <p className="text-sm text-center text-gray-600">
          Ainda não tem conta?{' '}
          <a href="/cadastrar" className="text-indigo-600 hover:underline">
            Criar nova conta
          </a>
        </p>
      </form>
    </main>
  );
}
