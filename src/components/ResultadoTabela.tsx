'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import * as XLSX from 'xlsx';

// Adicionado 'export' à interface Empresa
export interface Empresa {
  cnpj: string;
  razao_social_normalizado?: string;
  nome_fantasia_normalizado?: string;
  identificador_matriz_filial?: string;
  data_inicio_atividade?: string;
  capital_social?: number; // ALTERADO: Agora é number
  cod_cnae_principal?: string;
  cnae_principal?: string;
  cod_cnae_secundario?: string;
  cnae_secundario?: string;
  porte_empresa?: string;
  natureza_juridica?: string;
  opcao_simples?: string;
  opcao_mei?: string;
  situacao_cadastral?: string;
  data_situacao_cadastral?: string;
  motivo?: string;
  uf_normalizado?: string;
  municipio_normalizado?: string;
  bairro_normalizado?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  cep?: string;
  ddd1?: string;
  telefone1?: string;
  ddd2?: string;
  telefone2?: string;
  email?: string;
  qtde_socios?: number; // ALTERADO: Agora é number
  nomes_socios?: string;
  cpfs_socios?: string;
  datas_entrada?: string;
  qualificacoes?: string;
  faixas_etarias?: string;
  latitude?: number; // NOVO: Adicionado latitude
  longitude?: number; // NOVO: Adicionado longitude
}

// Define as colunas da tabela com seus cabeçalhos e as chaves correspondentes nos dados da Empresa
const COLUMNS = [
  { header: 'CNPJ', accessor: 'cnpj' },
  { header: 'Razão Social', accessor: 'razao_social_normalizado' },
  { header: 'Nome Fantasia', accessor: 'nome_fantasia_normalizado' },
  { header: 'Matriz/Filial', accessor: 'identificador_matriz_filial' },
  { header: 'Início', accessor: 'data_inicio_atividade' },
  { header: 'Capital', accessor: 'capital_social' },
  { header: 'Cód. CNAE P', accessor: 'cod_cnae_principal' },
  { header: 'CNAE Principal', accessor: 'cnae_principal' },
  { header: 'Cód. CNAE S', accessor: 'cod_cnae_secundario' },
  { header: 'CNAE Secundário', accessor: 'cnae_secundario' },
  { header: 'Porte', accessor: 'porte_empresa' },
  { header: 'Natureza Jurídica', accessor: 'natureza_juridica' },
  { header: 'Simples', accessor: 'opcao_simples' },
  { header: 'MEI', accessor: 'opcao_mei' },
  { header: 'Situação', accessor: 'situacao_cadastral' },
  { header: 'Data Situação', accessor: 'data_situacao_cadastral' },
  { header: 'Motivo', accessor: 'motivo' },
  { header: 'UF', accessor: 'uf_normalizado' },
  { header: 'Município', accessor: 'municipio_normalizado' },
  { header: 'Bairro', accessor: 'bairro_normalizado' },
  { header: 'Logradouro', accessor: 'logradouro' },
  { header: 'Número', accessor: 'numero' },
  { header: 'Complemento', accessor: 'complemento' },
  { header: 'CEP', accessor: 'cep' },
  { header: 'DDD1', accessor: 'ddd1' },
  { header: 'Telefone 1', accessor: 'telefone1' },
  { header: 'DDD2', accessor: 'ddd2' },
  { header: 'Telefone 2', accessor: 'telefone2' },
  { header: 'Email', accessor: 'email' },
  { header: 'Qtde. Sócios', accessor: 'qtde_socios' },
  { header: 'Nomes dos Sócios', accessor: 'nomes_socios' },
  { header: 'CPFs dos Sócios', accessor: 'cpfs_socios' },
  { header: 'Datas de Entrada', accessor: 'datas_entrada' },
  { header: 'Qualificações', accessor: 'qualificacoes' },
  { header: 'Faixas Etárias', accessor: 'faixas_etarias' },
];

export default function ResultadoTabela({ data }: { data: Empresa[] }) {
  const [pagina] = useState(0); // Mantido para compatibilidade, mas não usado para paginação visível
  const porPagina = 10;
  const paginaDados = data.slice(pagina * porPagina, (pagina + 1) * porPagina);

  const exportarParaExcelOuCSV = (formato: 'xlsx' | 'csv') => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Empresas');
    XLSX.writeFile(workbook, `empresas_enriquecidas.${formato}`);
  };

  // A função renderCell foi removida para que a key possa ser aplicada diretamente no TableCell.

  return (
    <div className="space-y-4 bg-white text-black p-4 rounded-md shadow-md">
      <div className="flex justify-between items-center mb-4">
        <p className="text-gray-700">Total de registros: <strong>{data.length}</strong></p>
        <div className="flex gap-2">
          {/* Ajustado o estilo dos botões para serem visíveis no fundo branco */}
          <Button
            variant="outline"
            onClick={() => exportarParaExcelOuCSV('csv')}
            className="bg-white text-gray-800 hover:bg-gray-100 border border-gray-800" // Fundo branco, texto cinza escuro, borda cinza escuro
          >
            <Download className="w-4 h-4 mr-2" /> Exportar CSV
          </Button>
          <Button
            variant="outline"
            onClick={() => exportarParaExcelOuCSV('xlsx')}
            className="bg-white text-gray-800 hover:bg-gray-100 border border-gray-800" // Fundo branco, texto cinza escuro, borda cinza escuro
          >
            <Download className="w-4 h-4 mr-2" /> Exportar Excel
          </Button>
        </div>
      </div>

      <div className="overflow-auto border border-gray-200 rounded-md">
        <Table className="min-w-full divide-y divide-gray-200">
          <TableHeader className="bg-gray-50">
            <TableRow className="h-10">
              {COLUMNS.map((col, index) => (
                <TableHead key={index} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody className="bg-white divide-y divide-gray-200">
            {paginaDados.map((e) => (
              <TableRow key={e.cnpj} className="h-10 hover:bg-gray-50">
                {COLUMNS.map((col) => {
                  const cellValue = e[col.accessor as keyof Empresa];
                  let displayValue: string | number | undefined = cellValue;

                  // Formata capital_social e qtde_socios para exibição na tabela, se forem números
                  if (col.accessor === 'capital_social' && typeof cellValue === 'number') {
                    displayValue = cellValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
                  } else if (col.accessor === 'qtde_socios' && typeof cellValue === 'number') {
                    displayValue = cellValue.toString(); // Ou formatar como desejar
                  } else if (displayValue !== undefined && displayValue !== null) {
                    displayValue = displayValue.toString(); // Converte outros valores para string
                  } else {
                    displayValue = ''; // Garante que é uma string vazia se for undefined/null
                  }
                  
                  return (
                    <TableCell key={col.accessor} className="h-10 truncate overflow-hidden whitespace-nowrap align-middle text-sm border-b border-gray-200 px-4 py-2">
                      {displayValue}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
