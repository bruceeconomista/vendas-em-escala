// src/app/api/upload/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { parse } from 'csv-parse/sync'
import xlsx from 'xlsx'

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const rawText = formData.get('text') as string | null

    let cnpjs: string[] = []

    if (file) {
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      if (file.name.endsWith('.csv')) {
        const content = buffer.toString('utf-8')
        const records = parse(content, {
          delimiter: ';',
          skip_empty_lines: true
        })
        cnpjs = records.flat().map((c: string) => c.trim())
      } else if (file.name.endsWith('.xlsx')) {
        const workbook = xlsx.read(buffer)
        const sheet = workbook.Sheets[workbook.SheetNames[0]]
        const data = xlsx.utils.sheet_to_json(sheet, { header: 1 }) as string[][]
        cnpjs = data.flat().map((c: string) => c.trim())
      } else {
        return NextResponse.json({ message: 'Formato de arquivo não suportado' }, { status: 400 })
      }
    } else if (rawText) {
      cnpjs = rawText
        .split(';')
        .map((c) => c.trim())
        .filter((c) => c.length > 10)
    } else {
      return NextResponse.json({ message: 'Nenhum dado recebido' }, { status: 400 })
    }

    // Remover duplicados e normalizar CNPJs
    const cnpjsUnicos = Array.from(new Set(cnpjs))

    if (cnpjsUnicos.length === 0) {
      return NextResponse.json({ message: 'Nenhum CNPJ válido encontrado' }, { status: 400 })
    }

    // Buscar dados no banco
    const resultados = await prisma.visao_empresa_agrupada_base.findMany({
      where: {
        cnpj: { in: cnpjsUnicos }
      }
    })

    return NextResponse.json({ data: resultados }, { status: 200 })
  } catch (error: any) {
    console.error('Erro no upload:', error)
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}