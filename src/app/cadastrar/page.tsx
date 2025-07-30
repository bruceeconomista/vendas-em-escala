// src/app/cadastrar/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Cleave from 'cleave.js/react';
import 'cleave.js/dist/addons/cleave-phone.br';

export default function Cadastrar() {
  const [form, setForm] = useState({ email: '', cnpj: '', telefone: '', senha: '' });
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [carregando, setCarregando] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Função para formatar o telefone dinamicamente
  const formatTelefone = (value: string) => {
    // Remove todos os caracteres não numéricos
    const numbers = value.replace(/\D/g, '');

    if (numbers.length === 0) return '';

    // Adiciona zero no DDD se necessário (para exibição)
    let processedNumbers = numbers;

    if (numbers.length >= 2 && !numbers.startsWith('0')) {
      const ddd = numbers.substring(0, 2);

      const dddValidos = [
        '11', '12', '13', '14', '15', '16', '17', '18', '19', // SP
        '21', '22', '24', // RJ/ES
        '27', '28', // ES
        '31', '32', '33', '34', '35', '37', '38', // MG
        '41', '42', '43', '44', '45', '46', // PR
        '47', '48', '49', // SC
        '51', '53', '54', '55', // RS
        '61', // DF
        '62', '64', // GO
        '63', // TO
        '65', '66', // MT
        '67', // MS
        '68', // AC
        '69', // RO
        '71', '73', '74', '75', '77', // BA
        '79', // SE
        '81', '87', // PE
        '82', // AL
        '83', // PB
        '84', // RN
        '85', '88', // CE
        '86', '89', // PI
        '91', '93', '94', // PA
        '92', '97', // AM
        '95', // RR
        '96', // AP
        '98', '99' // MA
      ];

      if (dddValidos.includes(ddd)) {
        processedNumbers = '0' + numbers;
      }
    }

    // Aplicar formatação baseada no comprimento
    if (processedNumbers.length <= 3) {
      return `(${processedNumbers}`;
    } else if (processedNumbers.length <= 7) {
      const ddd = processedNumbers.substring(0, 3);
      const numero = processedNumbers.substring(3);
      return `(${ddd}) ${numero}`;
    } else if (processedNumbers.length === 11) {
      const ddd = processedNumbers.substring(0, 3);
      const numero1 = processedNumbers.substring(3, 7);
      const numero2 = processedNumbers.substring(7);
      return `(${ddd}) ${numero1}-${numero2}`;
    } else if (processedNumbers.length === 12) {
      const ddd = processedNumbers.substring(0, 3);
      const numero1 = processedNumbers.substring(3, 8);
      const numero2 = processedNumbers.substring(8);
      return `(${ddd}) ${numero1}-${numero2}`;
    } else {
      const ddd = processedNumbers.substring(0, 3);
      const resto = processedNumbers.substring(3);

      if (resto.length <= 4) {
        return `(${ddd}) ${resto}`;
      } else if (resto.length <= 8 && resto.startsWith('9')) {
        return `(${ddd}) ${resto}`;
      } else if (resto.length > 8 && resto.startsWith('9')) {
        const numero1 = resto.substring(0, 5);
        const numero2 = resto.substring(5, 9);
        return `(${ddd}) ${numero1}-${numero2}`;
      } else {
        const numero1 = resto.substring(0, 4);
        const numero2 = resto.substring(4, 8);
        return `(${ddd}) ${numero1}-${numero2}`;
      }
    }
  };

  const handleTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const formattedValue = formatTelefone(rawValue);

    setForm({ ...form, telefone: formattedValue });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setSucesso('');

    const cnpjLimpo = form.cnpj.replace(/\D/g, '');
    let telefoneLimpo = form.telefone.replace(/\D/g, ''); // Garante que é let para ser reatribuído

    if (!form.email || !cnpjLimpo || !telefoneLimpo || !form.senha) {
      setErro('Preencha todos os campos');
      return;
    }
    if (!/^\d{14}$/.test(cnpjLimpo)) {
      setErro('CNPJ deve conter 14 dígitos numéricos');
      return;
    }

    // --- CORREÇÃO AQUI ---
    // Remove o '0' inicial do DDD se presente, para o envio ao banco de dados
    if (telefoneLimpo.startsWith('0') && telefoneLimpo.length >= 3) {
      telefoneLimpo = telefoneLimpo.substring(1); // Remove o primeiro caractere ('0')
    }

    // Validação para telefone: deve ter 10 ou 11 dígitos numéricos
    // (DD + 8 dígitos para fixo ou DD + 9 dígitos para celular)
    if (!/^\d{10}$|^\d{11}$/.test(telefoneLimpo)) {
      setErro('Telefone inválido. Digite um número válido com DDD (10 ou 11 dígitos)');
      return;
    }
    // --- FIM DA CORREÇÃO ---

    setCarregando(true);
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email,
          cnpj: cnpjLimpo,
          telefone: telefoneLimpo, // Envia o telefone já "limpo" e sem o "0" inicial
          senha: form.senha,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErro(data.error || 'Erro ao cadastrar');
      } else {
        setSucesso('Cadastro realizado com sucesso!');
        setForm({ email: '', cnpj: '', telefone: '', senha: '' });
        setTimeout(() => router.push('/login'), 1500);
      }
    } catch (err) {
      setErro('Erro de rede ao cadastrar');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-slate-800 p-8 rounded-xl shadow space-y-4 text-white">
        <h1 className="text-2xl font-bold text-center">Cadastro</h1>

        {erro && <p className="text-red-400 text-sm text-center">{erro}</p>}
        {sucesso && <p className="text-green-400 text-sm text-center">{sucesso}</p>}

        <input
          type="email"
          name="email"
          placeholder="Email empresarial"
          value={form.email}
          onChange={handleChange}
          className="w-full px-4 py-2 rounded bg-slate-700 text-white outline-none"
        />

        <Cleave
          options={{ delimiters: ['.', '.', '/', '-'], blocks: [2, 3, 3, 4, 2], numericOnly: true }}
          name="cnpj"
          placeholder="CNPJ (ex: 12.345.678/0001-90)"
          value={form.cnpj}
          onChange={handleChange}
          className="w-full px-4 py-2 rounded bg-slate-700 text-white outline-none"
        />

        <input
          type="text"
          name="telefone"
          placeholder="Telefone com DDD (ex: (011) 3232-3232 ou (011) 93232-3232)"
          value={form.telefone}
          onChange={handleTelefoneChange}
          className="w-full px-4 py-2 rounded bg-slate-700 text-white outline-none"
          maxLength={16}
        />

        <input
          type="password"
          name="senha"
          placeholder="Senha"
          value={form.senha}
          onChange={handleChange}
          className="w-full px-4 py-2 rounded bg-slate-700 text-white outline-none"
        />

        <button
          type="submit"
          disabled={carregando}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2 rounded transition"
        >
          {carregando ? 'Cadastrando...' : 'Cadastrar'}
        </button>
      </form>
    </main>
  );
}