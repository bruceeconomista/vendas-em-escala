import { NextResponse } from 'next/server';
import { hash } from 'bcrypt';
import { Pool } from 'pg';

// Conexão com PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Função POST para registro de usuário
export async function POST(request: Request) {
  try {
    const { email, cnpj, telefone, senha } = await request.json();

    if (!email || !cnpj || !telefone || !senha) {
      return NextResponse.json({ error: 'Todos os campos são obrigatórios.' }, { status: 400 });
    }

    // Verificar se já existe um usuário com este email ou CNPJ
    const { rows: existentes } = await pool.query(
      'SELECT id FROM tb_usuarios WHERE email = $1 OR cnpj = $2 LIMIT 1',
      [email, cnpj]
    );

    if (existentes.length > 0) {
      return NextResponse.json({ error: 'Email ou CNPJ já cadastrado.' }, { status: 409 });
    }

    // Gerar hash da senha
    const senhaHash = await hash(senha, 10);

    // Inserir novo usuário
    const insertQuery = `
      INSERT INTO tb_usuarios (email, cnpj, telefone, senha_hash)
      VALUES ($1, $2, $3, $4)
      RETURNING id, email, cnpj, telefone
    `;
    const { rows } = await pool.query(insertQuery, [email, cnpj, telefone, senhaHash]);
    const novoUsuario = rows[0];

    return NextResponse.json({ message: 'Usuário registrado com sucesso.', usuario: novoUsuario }, { status: 201 });
  } catch (error: any) {
    console.error('Erro ao registrar usuário:', error);
    return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 });
  }
}
