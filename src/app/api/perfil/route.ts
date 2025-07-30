// src/app/api/perfil/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json({ message: 'Não autenticado' }, { status: 401 });
    }

    // Busca o usuário logado com base no e-mail da sessão
    const usuario = await prisma.tb_usuarios.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        cnpj: true,
        email: true,
        telefone: true,
        criado_em: true,
      },
    });

    if (!usuario || !usuario.cnpj) {
      return NextResponse.json({ message: 'Usuário ou CNPJ não encontrado' }, { status: 404 });
    }

    // Busca a empresa vinculada ao CNPJ do usuário
    const empresa = await prisma.visao_empresa_agrupada_base.findUnique({
  where: { cnpj: usuario.cnpj },
  select: {
    cnpj: true,
    razao_social_normalizado: true,
    nome_fantasia_normalizado: true,
    identificador_matriz_filial: true,
    data_inicio_atividade: true,
    capital_social: true,
    cod_cnae_principal: true,
    cnae_principal_normalizado: true,
    cnae_secundario_normalizado: true,
    cnae_secundario: true,
    porte_empresa: true,
    natureza_juridica: true,
    opcao_simples: true,
    opcao_mei: true,
    motivo: true,
    situacao_cadastral: true,
    data_situacao_cadastral: true,
    uf_normalizado: true,
    municipio_normalizado: true,
    bairro_normalizado: true,
    logradouro: true,
    numero: true,
    complemento: true,
    cep: true,
    latitude: true,
    longitude: true,
    ddd1: true,
    telefone1: true,
    ddd2: true,
    telefone2: true,
    email: true,
    qtde_socios: true,
    nomes_socios: true,
    cpfs_socios: true,
    datas_entrada: true,
    qualificacoes: true,
    faixas_etarias: true,
  },
});

    return NextResponse.json({ usuario, empresa }, { status: 200 });
  } catch (error: any) {
  console.error('❌ Erro ao buscar dados do perfil:', error?.message ?? error);
  return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 });
  }
}
