import { NextResponse } from 'next/server';
import { hash } from 'bcrypt';
import { Pool } from 'pg';

// Conexão com PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Função para formatar CNPJ com máscara
function formatarCNPJ(cnpj: string): string {
  return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
}

// Função para formatar telefone com máscara
function formatarTelefone(telefone: string): string {
  return telefone.replace(/^(\d{2})(\d{4,5})(\d{4})$/, "($1) $2-$3");
}

// Função POST para registro de usuário
export async function POST(request: Request) {
  try {
    const { email, cnpj, telefone, senha } = await request.json();

    if (!email || !cnpj || !telefone || !senha) {
      return NextResponse.json({ error: 'Todos os campos são obrigatórios.' }, { status: 400 });
    }

    // Sanitiza: remove qualquer caractere não numérico
    const cnpjNumeros = cnpj.trim().replace(/\D/g, '');
    const telefoneNumeros = telefone.trim().replace(/\D/g, '');

    // Validação simples de tamanho dos dados (sem usar lib externa)
    if (!/^\d{14}$/.test(cnpjNumeros)) {
      return NextResponse.json({ error: 'CNPJ inválido. Envie apenas os números (14 dígitos).' }, { status: 400 });
    }

    if (!/^\d{10,11}$/.test(telefoneNumeros)) {
      return NextResponse.json({ error: 'Telefone inválido. Envie apenas os números com DDD.' }, { status: 400 });
    }

    // Formata para salvar com máscara
    const cnpjFormatado = formatarCNPJ(cnpjNumeros);
    const telefoneFormatado = formatarTelefone(telefoneNumeros);

    // Verifica se já existe um usuário com este email ou CNPJ
    const { rows: existentes } = await pool.query(
      'SELECT id FROM tb_usuarios WHERE email = $1 OR cnpj = $2 LIMIT 1',
      [email, cnpjFormatado]
    );

    if (existentes.length > 0) {
      return NextResponse.json({ error: 'Email ou CNPJ já cadastrado.' }, { status: 409 });
    }

    // Gera o hash da senha
    const senhaHash = await hash(senha, 12);

    // Insere o novo usuário
    const insertQuery = `
      INSERT INTO tb_usuarios (email, cnpj, telefone, senha_hash)
      VALUES ($1, $2, $3, $4)
      RETURNING id, email, cnpj, telefone
    `;
    const { rows } = await pool.query(insertQuery, [email, cnpjFormatado, telefoneFormatado, senhaHash]);
    const novoUsuario = rows[0];

    return NextResponse.json({ message: 'Usuário registrado com sucesso.', usuario: novoUsuario }, { status: 201 });
  } catch (error: any) {
    console.error('Erro ao registrar usuário:', error);
    return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 });
  }
}
