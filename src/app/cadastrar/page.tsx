'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CadastrarUsuario() {
  const router = useRouter();

  const [form, setForm] = useState({
    email: '',
    cnpj: '',
    telefone: '',
    senha: '',
  });

  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErro('');
    setSucesso('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (!res.ok) {
      setErro(data.error || 'Erro ao cadastrar usuário.');
    } else {
      setSucesso('Usuário cadastrado com sucesso!');
      setTimeout(() => router.push('/login'), 2000); // Redireciona após sucesso
    }
  };

  return (
    <main className="min-h-screen bg-black text-black flex items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded shadow-md w-full max-w-md space-y-4"
      >
        <h1 className="text-2xl font-bold text-center mb-4">Criar Conta</h1>

        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
          className="w-full border px-4 py-2 rounded"
        />

        <input
          name="cnpj"
          type="text"
          placeholder="CNPJ"
          value={form.cnpj}
          onChange={handleChange}
          required
          className="w-full border px-4 py-2 rounded"
        />

        <input
          name="telefone"
          type="text"
          placeholder="Telefone"
          value={form.telefone}
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
        {sucesso && <p className="text-green-600 text-sm text-center">{sucesso}</p>}

        <button
          type="submit"
          className="bg-indigo-600 text-white px-4 py-2 rounded w-full hover:bg-indigo-500"
        >
          Cadastrar
        </button>
      </form>
    </main>
  );
}
