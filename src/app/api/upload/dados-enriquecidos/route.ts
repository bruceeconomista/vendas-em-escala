// File: src/app/api/upload/dados-enriquecidos/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { visao_empresa_agrupada_base } from '@prisma/client';

export async function POST(req: Request) {
  try {
    const { cnpjs } = await req.json();

    if (!cnpjs || !Array.isArray(cnpjs)) {
      return NextResponse.json({ message: 'CNPJs inválidos' }, { status: 400 });
    }

    const dados: visao_empresa_agrupada_base[] = await prisma.visao_empresa_agrupada_base.findMany({
      where: {
        cnpj: { in: cnpjs },
        situacao_cadastral: 'ATIVA',
      },
    });

    // Extrair dados normalizados para multiselects
    const getUnicos = (lista: (string | null)[]) =>
      Array.from(new Set(lista.map((v) => v?.trim().toLowerCase()).filter(Boolean)));

    const ufs = getUnicos(dados.map((d) => d.uf_normalizado));
    const municipios = getUnicos(dados.map((d) => d.municipio_normalizado));
    const bairros = getUnicos(dados.map((d) => d.bairro_normalizado));
    const cnaesPrincipais = getUnicos(dados.map((d) => d.cod_cnae_principal));
    const cnaesSecundarios = getUnicos(dados.map((d) => d.cod_cnae_secundario));
    const qualificacoes = getUnicos(dados.map((d) => d.qualificacoes));
    const ddd1 = getUnicos(dados.map((d) => d.ddd1));

    return NextResponse.json({
      ufs,
      municipios,
      bairros,
      cnaesPrincipais,
      cnaesSecundarios,
      qualificacoes,
      ddd1,
    });
  } catch (error: any) {
    console.error('Erro ao carregar dados enriquecidos:', error);
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 });
  }
}
