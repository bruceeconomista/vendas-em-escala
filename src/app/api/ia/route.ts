import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { visao_empresa_agrupada_base } from '@prisma/client';

export async function POST(req: Request) {
  try {
    const { cnpjs, filtros } = await req.json();

    if (!cnpjs || !Array.isArray(cnpjs)) {
      return NextResponse.json({ message: 'CNPJs inválidos' }, { status: 400 });
    }

    const dadosImportados: visao_empresa_agrupada_base[] = await prisma.visao_empresa_agrupada_base.findMany({
      where: {
        cnpj: { in: cnpjs },
        situacao_cadastral: 'ATIVA',
      },
    });

    const contarFrequencia = (lista: (string | null | undefined)[]) => {
      const mapa: Record<string, number> = {};
      lista.forEach((item) => {
        const chave = item?.trim().toLowerCase() || 'não informado';
        mapa[chave] = (mapa[chave] || 0) + 1;
      });
      return Object.entries(mapa)
        .sort((a, b) => b[1] - a[1])
        .map(([valor]) => valor);
    };

    const ufsDefault = contarFrequencia(dadosImportados.map(d => d.uf_normalizado)).slice(0, 3);
    const municipiosDefault = contarFrequencia(dadosImportados.map(d => d.municipio_normalizado)).slice(0, 5);
    const cnaesDefault = contarFrequencia(dadosImportados.map(d => d.cod_cnae_principal)).slice(0, 10);

    const ufs_normalizado = filtros?.ufs_normalizado ?? ufsDefault;
    const municipios_normalizado = filtros?.municipios_normalizado ?? municipiosDefault;
    const bairros_normalizado = filtros?.bairro_normalizado ?? undefined;
    const cnaes = filtros?.cod_cnae_principal ?? cnaesDefault;
    const cnaesSec = filtros?.cod_cnae_secundario ?? undefined;
    const take = filtros?.take && Number.isInteger(filtros.take) ? filtros.take : 500;

    console.log('🎯 IA Generator - Filtros:');
    console.log({ ufs_normalizado, municipios_normalizado, bairros_normalizado, cnaes, cnaesSec, take });
    console.time('🔍 Tempo da consulta IA');

    console.log('📦 Quantos dados importados?', dadosImportados.length);
    console.log('🎯 Filtros calculados:', { ufs_normalizado, municipios_normalizado, cnaes });

    const leads = await prisma.visao_empresa_agrupada_base.findMany({
      where: {
        situacao_cadastral: 'ATIVA',
        cnpj: { notIn: cnpjs }, // ⬅️ ESSENCIAL!
        ...(ufs_normalizado?.length && { uf_normalizado: { in: ufs_normalizado } }),
        ...(municipios_normalizado?.length && { municipio_normalizado: { in: municipios_normalizado } }),
        ...(bairros_normalizado?.length && { bairro_normalizado: { in: bairros_normalizado } }),
        ...(cnaes?.length && { cod_cnae_principal: { in: cnaes } }),
        ...(cnaesSec?.length && { cod_cnae_secundario: { in: cnaesSec } }),
      },
      take,
      skip: 0, // <- adicione isto explicitamente
    });

    console.timeEnd('🔍 Tempo da consulta IA');

    return NextResponse.json({ data: leads }, { status: 200 });
  } catch (error: any) {
    console.error('❌ Erro na IA Generator:', error?.message ?? error);
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 });
  }
}
