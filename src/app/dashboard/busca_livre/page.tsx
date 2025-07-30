'use client'; // Essential for client components in Next.js App Router

import React, { useState, FormEvent, useEffect } from 'react';
import Select, { ActionMeta, MultiValue } from 'react-select';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import ResultadoTabela, { Empresa } from '@/components/ResultadoTabela'; // Imports the Empresa interface
import { Input } from '@/components/ui/input'; // Imports the Input component from shadcn/ui
import { Label } from '@/components/ui/label'; // Imports the Label component from shadcn/ui
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'; // Imports Card components from shadcn/ui
import * as XLSX from 'xlsx'; // Importa a biblioteca XLSX para a exportação real de Excel

// --- Interfaces ---
interface FreeSearchParams {
  razao_social_normalizado?: string[];
  nome_fantasia_normalizado?: string[];
  cod_cnae_termos?: string[];
  natureza_juridica_termos?: string[];
  municipio_normalizado?: string[];
  bairro_normalizado?: string[];
  ddd_termos?: string[];
  logradouro_termos?: string[];
  qualificacoes_termos?: string[];
  faixas_etarias_termos?: string[];
  uf_normalizado?: string[];
  porte_empresa_termos?: string[];
  opcao_simples?: 'S' | 'N' | '';
  opcao_mei?: 'S' | 'N' | '';
  capital_social_min_value?: number;
  capital_social_max_value?: number;
  qtde_socios_min_value?: number;
  qtde_socios_max_value?: number;
  data_inicio_atividade_apos?: string;
  data_inicio_atividade_antes?: string;
  limit_resultados?: number;
}

interface OptionType {
  value: string;
  label: string;
}

// Static options for Selects (can be loaded dynamically in the future)
const ufOptions: OptionType[] = [
  { value: 'AC', label: 'Acre' }, { value: 'AL', label: 'Alagoas' }, { value: 'AP', label: 'Amapá' },
  { value: 'AM', label: 'Amazonas' }, { value: 'BA', label: 'Bahia' }, { value: 'CE', label: 'Ceará' },
  { value: 'DF', label: 'Distrito Federal' }, { value: 'ES', label: 'Espírito Santo' },
  { value: 'GO', label: 'Goiás' }, { value: 'MA', label: 'Maranhão' }, { value: 'MT', label: 'Mato Grosso' },
  { value: 'MS', label: 'Mato Grosso do Sul' }, { value: 'MG', label: 'Minas Gerais' },
  { value: 'PA', label: 'Pará' }, { value: 'PB', label: 'Paraíba' }, { value: 'PR', label: 'Paraná' },
  { value: 'PE', label: 'Pernambuco' }, { value: 'PI', label: 'Piauí' }, { value: 'RJ', label: 'Rio de Janeiro' },
  { value: 'RN', label: 'Rio Grande do Norte' }, { value: 'RS', label: 'Rio Grande do Sul' },
  { value: 'RO', label: 'Rondônia' }, { value: 'RR', label: 'Roraima' }, { value: 'SC', label: 'Santa Catarina' },
  { value: 'SP', label: 'São Paulo' }, { value: 'SE', label: 'Sergipe' }, { value: 'TO', label: 'Tocantins' },
];

const porteEmpresaOptions: OptionType[] = [
  { value: 'MICRO EMPRESA', label: 'Micro Empresa' },
  { value: 'EMPRESA DE PEQUENO PORTE', label: 'Empresa de Pequeno Porte' },
  { value: 'DEMAIS', label: 'Demais' },
];

const opcaoSimplesMeiOptions: OptionType[] = [
  { value: 'S', label: 'Sim' },
  { value: 'N', label: 'Não' },
  { value: '', label: 'Ambos' },
];

export default function FreeSearchPage() {
  const router = useRouter();

  // --- States for filters ---
  const [razaoSocial, setRazaoSocial] = useState<string>('');
  const [nomeFantasia, setNomeFantasia] = useState<string>('');
  const [dataInicioAtividadeDe, setDataInicioAtividadeDe] = useState<string>('');
  const [dataInicioAtividadeAte, setDataInicioAtividadeAte] = useState<string>('');
  
  const [ufs, setUfs] = useState<MultiValue<OptionType>>([]);
  const [municipios, setMunicipios] = useState<string>('');
  const [bairros, setBairros] = useState<string>('');
  const [ddds, setDdds] = useState<string>('');

  const [porteEmpresa, setPorteEmpresa] = useState<OptionType | null>(null);
  const [capitalSocialMin, setCapitalSocialMin] = useState<string>('');
  const [capitalSocialMax, setCapitalSocialMax] = useState<string>('');
  const [opcaoSimples, setOpcaoSimples] = useState<OptionType | null>(null);
  const [opcaoMei, setOpcaoMei] = useState<OptionType | null>(null);
  const [cnaesPrincipal, setCnaesPrincipal] = useState<string>('');
  const [naturezaJuridica, setNaturezaJuridica] = useState<string>('');

  const [qualificacaoSocio, setQualificacaoSocio] = useState<string>('');
  const [faixaEtariaSocio, setFaixaEtariaSocio] = useState<string>('');
  const [qtdeSociosMin, setQtdeSociosMin] = useState<string>('');
  const [qtdeSociosMax, setQtdeSociosMax] = useState<string>('');

  const [limiteResultados, setLimiteResultados] = useState<string>('1000'); // Default 1000

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<{ qtd_resultados: number; leads: Empresa[] } | null>(null);

  // Displays only the first 10 leads in the preview
  const leadsToDisplay = results?.leads ? results.leads.slice(0, 10) : [];

  // --- Helper Functions ---
  const handleMultiSelectChange = (
    selectedOptions: MultiValue<OptionType>,
    actionMeta: ActionMeta<OptionType>,
    setter: React.Dispatch<React.SetStateAction<MultiValue<OptionType>>>
  ) => {
    setter(selectedOptions);
  };

  const parseStringToArray = (value: string): string[] => {
    return value.split(',').map(s => s.trim()).filter(s => s.length > 0);
  };

  // --- Form Submission ---
  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setResults(null);

    const params: FreeSearchParams = {};

    // Registration Data
    if (razaoSocial) params.razao_social_normalizado = parseStringToArray(razaoSocial);
    if (nomeFantasia) params.nome_fantasia_normalizado = parseStringToArray(nomeFantasia);
    if (dataInicioAtividadeDe) params.data_inicio_atividade_apos = dataInicioAtividadeDe;
    if (dataInicioAtividadeAte) params.data_inicio_atividade_antes = dataInicioAtividadeAte;

    // Location Data
    if (ufs.length > 0) params.uf_normalizado = ufs.map(uf => uf.value);
    if (municipios) params.municipio_normalizado = parseStringToArray(municipios);
    if (bairros) params.bairro_normalizado = parseStringToArray(bairros);
    if (ddds) params.ddd_termos = parseStringToArray(ddds);

    // Taxation and Size Data
    if (porteEmpresa) params.porte_empresa_termos = [porteEmpresa.value];
    if (capitalSocialMin) params.capital_social_min_value = parseFloat(capitalSocialMin);
    if (capitalSocialMax) params.capital_social_max_value = parseFloat(capitalSocialMax);
    if (opcaoSimples) params.opcao_simples = opcaoSimples.value as 'S' | 'N' | '';
    if (opcaoMei) params.opcao_mei = opcaoMei.value as 'S' | 'N' | '';
    if (cnaesPrincipal) params.cod_cnae_termos = parseStringToArray(cnaesPrincipal);
    if (naturezaJuridica) params.natureza_juridica_termos = parseStringToArray(naturezaJuridica);

    // Partner Data
    if (qualificacaoSocio) params.qualificacoes_termos = parseStringToArray(qualificacaoSocio);
    if (faixaEtariaSocio) params.faixas_etarias_termos = parseStringToArray(faixaEtariaSocio);
    if (qtdeSociosMin) params.qtde_socios_min_value = parseInt(qtdeSociosMin, 10);
    if (qtdeSociosMax) params.qtde_socios_max_value = parseInt(qtdeSociosMax, 10);

    // Result Limit
    params.limit_resultados = parseInt(limiteResultados, 10);

    try {
      const response = await fetch('http://localhost:8000/gerar-leads/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cliente_referencia: 'Busca Livre Frontend', // Can be dynamic if needed
          params: params,
          limit: params.limit_resultados, // Backend expects the limit here too
          cnpjs_excluir: [], // Add CNPJs to exclude if any
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error fetching leads');
      }

      const data = await response.json();
      setResults(data); // Backend now returns { qtd_resultados, leads }

    } catch (err: any) {
      console.error('Search error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoToMap = () => {
    // Creates a URL object to build the URL safely
    // CORRECTED: Using 'mapa_oportunidades' with an underscore
    const url = new URL('/dashboard/mapa_oportunidades', window.location.origin);

    // Helper function to append to URLSearchParams if value exists and is not empty
    const appendQueryParam = (key: string, value: string | string[] | number | null | undefined) => {
      if (value !== null && value !== undefined) {
        if (Array.isArray(value)) {
          if (value.length > 0) {
            url.searchParams.append(key, value.join(',')); // Converts array to comma-separated string
          }
        } else if (typeof value === 'string' && value.trim() !== '') {
          url.searchParams.append(key, value);
        } else if (typeof value === 'number') {
          url.searchParams.append(key, value.toString());
        }
      }
    };

    // Registration Data
    appendQueryParam('razao_social_normalizado', razaoSocial);
    appendQueryParam('nome_fantasia_normalizado', nomeFantasia);
    appendQueryParam('data_inicio_atividade_apos', dataInicioAtividadeDe);
    appendQueryParam('data_inicio_atividade_antes', dataInicioAtividadeAte);
    
    // Location Data
    if (ufs.length > 0) appendQueryParam('uf_normalizado', ufs.map(uf => uf.value)); // Passes the array to the helper function
    appendQueryParam('municipio_normalizado', municipios);
    appendQueryParam('bairro_normalizado', bairros);
    appendQueryParam('ddd_termos', ddds);

    // Taxation and Size Data
    if (porteEmpresa) appendQueryParam('porte_empresa_termos', porteEmpresa.value);
    appendQueryParam('capital_social_min_value', capitalSocialMin);
    appendQueryParam('capital_social_max_value', capitalSocialMax);
    if (opcaoSimples) appendQueryParam('opcao_simples', opcaoSimples.value);
    if (opcaoMei) appendQueryParam('opcao_mei', opcaoMei.value);
    appendQueryParam('cod_cnae_termos', cnaesPrincipal);
    appendQueryParam('natureza_juridica_termos', naturezaJuridica); // Maintained _termos for consistency with the interface

    // Partner Data
    appendQueryParam('qualificacoes_termos', qualificacaoSocio);
    appendQueryParam('faixas_etarias_termos', faixaEtariaSocio); 
    appendQueryParam('qtde_socios_min_value', qtdeSociosMin);
    appendQueryParam('qtde_socios_max_value', qtdeSociosMax);

    // limitResults always has a default value
    appendQueryParam('limit_resultados', limiteResultados);

    // Now, use router.push with the complete URL string generated by the URL object
    router.push(url.href as any); // Added 'as any' to force type compatibility
  };

  // Function to export data to CSV
  const handleExportCsv = (data: Empresa[], filename: string) => {
    if (!data || data.length === 0) {
      alert('No data to export.');
      return;
    }

    // Get headers dynamically from the keys of the first object or define a default
    const headers = Object.keys(data[0]);
    const csvRows = [];

    // Add headers
    csvRows.push(headers.map(header => `"${header}"`).join(','));

    // Add data rows
    for (const row of data) {
      const values = headers.map(header => {
        const value = (row as any)[header];
        // Treat null/undefined values and ensure double quotes are escaped
        return `"${String(value || '').replace(/"/g, '""')}"`;
      });
      csvRows.push(values.join(','));
    }

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) { // Feature detection for download attribute
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url); // Clean up URL object
    } else {
      // Fallback for browsers that don't support the download attribute
      window.open('data:text/csv;charset=utf-8,' + encodeURIComponent(csvString));
    }
  };

  // Function to export data to XLSX using SheetJS (replicated from ResultadoTabela)
  const handleExportExcel = (data: Empresa[], filename: string) => {
    if (!data || data.length === 0) {
      alert('No data to export.');
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Empresas');
    XLSX.writeFile(workbook, filename);
  };


  return (
    <div className="min-h-screen bg-slate-900 p-8"> {/* Dark blue background */}
      <h1 className="text-4xl font-extrabold text-white mb-8 text-center"> {/* White text */}
        🔎 Busca Livre de Empresas
      </h1>

      <form onSubmit={handleSubmit} className="space-y-8 max-w-6xl mx-auto">
        {/* Registration Data Section */}
        <Card className="bg-white shadow-lg rounded-lg">
          <CardHeader className="border-b pb-4">
            <CardTitle className="text-2xl font-bold text-gray-800">Dados Cadastrais</CardTitle>
          </CardHeader>
          <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <Label htmlFor="razaoSocial" className="text-gray-700 font-semibold mb-2 block">Razão Social (termos, vírgula)</Label>
              <Input
                id="razaoSocial"
                type="text"
                placeholder="Ex: EMPRESAS S.A, COMÉRCIO"
                value={razaoSocial}
                onChange={(e) => setRazaoSocial(e.target.value)}
                className="border border-gray-300 rounded-md p-2 w-full focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <Label htmlFor="nomeFantasia" className="text-gray-700 font-semibold mb-2 block">Nome Fantasia (termos, vírgula)</Label>
              <Input
                id="nomeFantasia"
                type="text"
                placeholder="Ex: LOJAS, PADARIA"
                value={nomeFantasia}
                onChange={(e) => setNomeFantasia(e.target.value)}
                className="border border-gray-300 rounded-md p-2 w-full focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <Label htmlFor="dataInicioAtividadeDe" className="text-gray-700 font-semibold mb-2 block">Data Início Atividade De</Label>
              <Input
                id="dataInicioAtividadeDe"
                type="date"
                value={dataInicioAtividadeDe}
                onChange={(e) => setDataInicioAtividadeDe(e.target.value)}
                className="border border-gray-300 rounded-md p-2 w-full focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <Label htmlFor="dataInicioAtividadeAte" className="text-gray-700 font-semibold mb-2 block">Data Início Atividade Até</Label>
              <Input
                id="dataInicioAtividadeAte"
                type="date"
                value={dataInicioAtividadeAte}
                onChange={(e) => setDataInicioAtividadeAte(e.target.value)}
                className="border border-gray-300 rounded-md p-2 w-full focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </CardContent>
        </Card>

        {/* Location Data Section */}
        <Card className="bg-white shadow-lg rounded-lg">
          <CardHeader className="border-b pb-4">
            <CardTitle className="text-2xl font-bold text-gray-800">Dados de Localização</CardTitle>
          </CardHeader>
          <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <Label htmlFor="ufs" className="text-gray-700 font-semibold mb-2 block">UF(s)</Label>
              <Select
                id="ufs"
                options={ufOptions}
                isMulti
                value={ufs}
                onChange={(selectedOptions, actionMeta) => handleMultiSelectChange(selectedOptions, actionMeta, setUfs)}
                placeholder="Selecione..."
                className="react-select-container"
                classNamePrefix="react-select"
                styles={{
                  control: (base) => ({ ...base, borderColor: '#d1d5db', '&:hover': { borderColor: '#9ca3af' }, boxShadow: 'none' }),
                  menu: (base) => ({ ...base, zIndex: 9999 }), // Ensures the menu is above other elements
                }}
              />
            </div>
            <div>
              <Label htmlFor="municipios" className="text-gray-700 font-semibold mb-2 block">Município(s) (termos, vírgula)</Label>
              <Input
                id="municipios"
                type="text"
                placeholder="Ex: SÃO PAULO, RIO DE JANEIRO"
                value={municipios}
                onChange={(e) => setMunicipios(e.target.value)}
                className="border border-gray-300 rounded-md p-2 w-full focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <Label htmlFor="bairros" className="text-gray-700 font-semibold mb-2 block">Bairro(s) (termos, vírgula)</Label>
              <Input
                id="bairros"
                type="text"
                placeholder="Ex: CENTRO, JARDINS"
                value={bairros}
                onChange={(e) => setBairros(e.target.value)}
                className="border border-gray-300 rounded-md p-2 w-full focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <Label htmlFor="ddds" className="text-gray-700 font-semibold mb-2 block">DDD(s) (termos, vírgula)</Label>
              <Input
                id="ddds"
                type="text"
                placeholder="Ex: 11, 21, 31"
                value={ddds}
                onChange={(e) => setDdds(e.target.value)}
                className="border border-gray-300 rounded-md p-2 w-full focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </CardContent>
        </Card>

        {/* Taxation and Size Data Section */}
        <Card className="bg-white shadow-lg rounded-lg">
          <CardHeader className="border-b pb-4">
            <CardTitle className="text-2xl font-bold text-gray-800">Dados de Tributação e Porte</CardTitle>
          </CardHeader>
          <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <Label htmlFor="porteEmpresa" className="text-gray-700 font-semibold mb-2 block">Porte da Empresa</Label>
              <Select
                id="porteEmpresa"
                options={porteEmpresaOptions}
                value={porteEmpresa}
                onChange={(selectedOption) => setPorteEmpresa(selectedOption as OptionType)}
                placeholder="Selecione..."
                className="react-select-container"
                classNamePrefix="react-select"
                styles={{
                  control: (base) => ({ ...base, borderColor: '#d1d5db', '&:hover': { borderColor: '#9ca3af' }, boxShadow: 'none' }),
                  menu: (base) => ({ ...base, zIndex: 9999 }),
                }}
              />
            </div>
            <div>
              <Label htmlFor="capitalSocialMin" className="text-gray-700 font-semibold mb-2 block">Capital Social Mín.</Label>
              <Input
                id="capitalSocialMin"
                type="number"
                placeholder="Ex: 1000.00"
                value={capitalSocialMin}
                onChange={(e) => setCapitalSocialMin(e.target.value)}
                className="border border-gray-300 rounded-md p-2 w-full focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <Label htmlFor="capitalSocialMax" className="text-gray-700 font-semibold mb-2 block">Capital Social Máx.</Label>
              <Input
                id="capitalSocialMax"
                type="number"
                placeholder="Ex: 100000.00"
                value={capitalSocialMax}
                onChange={(e) => setCapitalSocialMax(e.target.value)}
                className="border border-gray-300 rounded-md p-2 w-full focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <Label htmlFor="opcaoSimples" className="text-gray-700 font-semibold mb-2 block">Opção Simples</Label>
              <Select
                id="opcaoSimples"
                options={opcaoSimplesMeiOptions}
                value={opcaoSimples}
                onChange={(selectedOption) => setOpcaoSimples(selectedOption as OptionType)}
                placeholder="Selecione..."
                className="react-select-container"
                classNamePrefix="react-select"
                styles={{
                  control: (base) => ({ ...base, borderColor: '#d1d5db', '&:hover': { borderColor: '#9ca3af' }, boxShadow: 'none' }),
                  menu: (base) => ({ ...base, zIndex: 9999 }),
                }}
              />
            </div>
            <div>
              <Label htmlFor="opcaoMei" className="text-gray-700 font-semibold mb-2 block">Opção MEI</Label>
              <Select
                id="opcaoMei"
                options={opcaoSimplesMeiOptions}
                value={opcaoMei}
                onChange={(selectedOption) => setOpcaoMei(selectedOption as OptionType)}
                placeholder="Selecione..."
                className="react-select-container"
                classNamePrefix="react-select"
                styles={{
                  control: (base) => ({ ...base, borderColor: '#d1d5db', '&:hover': { borderColor: '#9ca3af' }, boxShadow: 'none' }),
                  menu: (base) => ({ ...base, zIndex: 9999 }),
                }}
              />
            </div>
            <div>
              <Label htmlFor="cnaesPrincipal" className="text-gray-700 font-semibold mb-2 block">CNAE(s) Principal (códigos, vírgula)</Label>
              <Input
                id="cnaesPrincipal"
                type="text"
                placeholder="Ex: 4711302, 5612101"
                value={cnaesPrincipal}
                onChange={(e) => setCnaesPrincipal(e.target.value)}
                className="border border-gray-300 rounded-md p-2 w-full focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <Label htmlFor="naturezaJuridica" className="text-gray-700 font-semibold mb-2 block">Natureza Jurídica (termos, vírgula)</Label>
              <Input
                id="naturezaJuridica"
                type="text"
                placeholder="Ex: SA, LTDA"
                value={naturezaJuridica}
                onChange={(e) => setNaturezaJuridica(e.target.value)}
                className="border border-gray-300 rounded-md p-2 w-full focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </CardContent>
        </Card>

        {/* Partner Data Section */}
        <Card className="bg-white shadow-lg rounded-lg">
          <CardHeader className="border-b pb-4">
            <CardTitle className="text-2xl font-bold text-gray-800">Dados dos Sócios</CardTitle>
          </CardHeader>
          <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <Label htmlFor="qualificacaoSocio" className="text-gray-700 font-semibold mb-2 block">Qualificação Sócio (termos, vírgula)</Label>
              <Input
                id="qualificacaoSocio"
                type="text"
                placeholder="Ex: SÓCIO-ADMINISTRADOR"
                value={qualificacaoSocio}
                onChange={(e) => setQualificacaoSocio(e.target.value)}
                className="border border-gray-300 rounded-md p-2 w-full focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <Label htmlFor="faixaEtariaSocio" className="text-gray-700 font-semibold mb-2 block">Faixa Etária Sócio (termos, vírgula)</Label>
              <Input
                id="faixaEtariaSocio"
                type="text"
                placeholder="Ex: 25-35, 45-55"
                value={faixaEtariaSocio}
                onChange={(e) => setFaixaEtariaSocio(e.target.value)}
                className="border border-gray-300 rounded-md p-2 w-full focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <Label htmlFor="qtdeSociosMin" className="text-gray-700 font-semibold mb-2 block">Qtde Sócios Mín.</Label>
              <Input
                id="qtdeSociosMin"
                type="number"
                placeholder="Ex: 1"
                value={qtdeSociosMin}
                onChange={(e) => setQtdeSociosMin(e.target.value)}
                className="border border-gray-300 rounded-md p-2 w-full focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <Label htmlFor="qtdeSociosMax" className="text-gray-700 font-semibold mb-2 block">Qtde Sócios Máx.</Label>
              <Input
                id="qtdeSociosMax"
                type="number"
                placeholder="Ex: 5"
                value={qtdeSociosMax}
                onChange={(e) => setQtdeSociosMax(e.target.value)}
                className="border border-gray-300 rounded-md p-2 w-full focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </CardContent>
        </Card>

        {/* Result Options and Buttons Section */}
        <Card className="bg-white shadow-lg rounded-lg">
          <CardHeader className="border-b pb-4">
            <CardTitle className="text-2xl font-bold text-gray-800">Opções de Resultados</CardTitle>
          </CardHeader>
          <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="limiteResultados" className="text-gray-700 font-semibold mb-2 block">Limite de Resultados</Label>
              <Input
                id="limiteResultados"
                type="number"
                placeholder="Default: 1000"
                value={limiteResultados}
                onChange={(e) => setLimiteResultados(e.target.value)}
                className="border border-gray-300 rounded-md p-2 w-full focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex flex-col md:flex-row gap-4 md:col-span-2 mt-auto">
              <Button
                type="submit"
                className="px-8 py-4 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 w-full md:w-auto"
                disabled={loading}
              >
                {loading ? 'Loading...' : '🚀 Generate Leads'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md relative max-w-6xl mx-auto mt-8" role="alert">
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}

      {/* Displays results only if 'results' and 'leadsToDisplay' have data */}
      {results && (
        <div className="space-y-4 mt-8 max-w-6xl mx-auto">
          <p className="text-2xl font-bold text-white">Leads Generated!</p>
          
          <div className="flex justify-between items-center mb-4">
            <p className="text-lg font-medium text-green-700">Total leads found: {results.qtd_resultados}</p>
          </div>

          {leadsToDisplay.length > 0 && (
            <>
              <ResultadoTabela data={leadsToDisplay} />
              <p className="text-sm text-gray-200 mt-2">
                Showing the first 10 results in the preview. Use the export buttons below to see all.
              </p>

              <div className="flex gap-4 mt-4 justify-end"> {/* Aligned to the right */}
                <Button
                  onClick={handleGoToMap}
                  className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  disabled={!results || results.qtd_resultados === 0}
                >
                  📊 Mapa de Oportunidades
                </Button>
                {/* Export buttons next to Map of Opportunities, with discreet style */}
                <Button
                  onClick={() => handleExportCsv(results.leads, 'leads_exportados.csv')}
                  className="px-6 py-3 bg-white text-gray-800 font-semibold rounded-lg shadow-md hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
                  disabled={!results || results.qtd_resultados === 0}
                >
                  ⬇️ Exportar CSV
                </Button>
                <Button
                  onClick={() => handleExportExcel(results.leads, 'leads_exportados.xlsx')}
                  className="px-6 py-3 bg-white text-gray-800 font-semibold rounded-lg shadow-md hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
                  disabled={!results || results.qtd_resultados === 0}
                >
                  ⬇️ Exportar Excel
                </Button>
              </div>
            </>
          )}
          {leadsToDisplay.length === 0 && (
            <p className="mt-2 text-yellow-300">No leads found with the applied filters.</p>
          )}
        </div>
      )}
    </div>
  );
}
