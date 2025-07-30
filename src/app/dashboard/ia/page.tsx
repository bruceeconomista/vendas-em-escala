'use client';

import { useEffect, useState, ChangeEvent } from 'react';
import { useForm, Controller } from 'react-hook-form';
import Select, { components } from 'react-select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import ResultadoTabela, { Empresa } from '@/components/ResultadoTabela';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import * as XLSX from 'xlsx';

interface FilterOption {
  label: string;
  value: string;
  description?: string;
}

const STOPWORDS_PT_BR = new Set([
  'a', 'ao', 'aos', 'aquela', 'aquelas', 'aquele', 'aqueles', 'aquilo', 'as', 'às', 'até',
  'com', 'como', 'da', 'das', 'de', 'do', 'dos', 'e', 'é', 'ela', 'elas', 'ele', 'eles', 'em',
  'entre', 'era', 'eram', 'essa', 'essas', 'esse', 'esses', 'esta', 'estas', 'este', 'estes',
  'estou', 'está', 'estão', 'eu', 'foi', 'fomos', 'for', 'fora', 'foram', 'fosse', 'fossem',
  'fui', 'há', 'isso', 'isto', 'já', 'lhe', 'lhes', 'mais', 'mas', 'me', 'mesmo', 'meu', 'meus',
  'minha', 'minhas', 'muito', 'na', 'nas', 'nem', 'no', 'nos', 'nós', 'nossa', 'nossas', 'nosso',
  'nossos', 'num', 'numa', 'o', 'os', 'ou', 'para', 'pela', 'pelas', 'pelo', 'pelos', 'por',
  'que', 'quem', 'se', 'sem', 'ser', 'será', 'serei', 'seremos', 'seria', 'seriam', 'somos',
  'sou', 'sua', 'suas', 'são', 'só', 'também', 'te', 'tem', 'têm', 'ter', 'terei', 'teremos',
  'teria', 'teriam', 'teu', 'teus', 'ti', 'tinha', 'tinham', 'tive', 'tivemos', 'tu', 'tua',
  'tuas', 'um', 'uma', 'você', 'vocês', 'vos', 'à', 'às', 'àquele', 'àqueles', 'àquela',
  'àquelas', 'àquilo', 'às', 'e', 'é', 'i', 'o', 'u',
  's.a', 'ltda', 'me', 'eireli', 'sa', 'com', 'ind', 'serv', 'comercio', 'industria', 'servicos',
  'ltda.', 's.a.', 'cia', 'cia.', 'filial', 'matriz', 'do', 'da', 'de', 'dos', 'das'
]);


export default function IAGeneratorPage() {
  const { control, handleSubmit, reset, setValue } = useForm();
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');
  const [resultados, setResultados] = useState<Empresa[]>([]);
  const [limite, setLimite] = useState(1000); // Estado para o limite de registros

  // Totalizadores
  const [totalMunicipios, setTotalMunicipios] = useState<number | null>(null);
  const [totalBairros, setTotalBairros] = useState<number | null>(null);
  const [totalNomesFantasia, setTotalNomesFantasia] = useState<number | null>(null);
  const [totalCnaesSecundarios, setTotalCnaesSecundarios] = useState<number | null>(null);
  const [totalUFs, setTotalUFs] = useState<number | null>(null);
  const [totalCnaesPrincipais, setTotalCnaesPrincipais] = useState<number | null>(null);
  const [totalPorteEmpresa, setTotalPorteEmpresa] = useState<number | null>(null);
  const [totalNaturezaJuridica, setTotalNaturezaJuridica] = useState<number | null>(null);
  const [totalOpcaoSimples, setTotalOpcaoSimples] = useState<number | null>(null);
  const [totalOpcaoMei, setTotalOpcaoMei] = useState<number | null>(null);
  const [totalDdd1, setTotalDdd1] = useState<number | null>(null);
  const [totalQtdeSocios, setTotalQtdeSocios] = useState<number | null>(null);
  const [totalNomesSocios, setTotalNomesSocios] = useState<number | null>(null);
  const [totalQualificacoes, setTotalQualificacoes] = useState<number | null>(null);
  const [totalFaixasEtarias, setTotalFaixasEtarias] = useState<number | null>(null);
  const [totalDataInicioAtividade, setTotalDataInicioAtividade] = useState<number | null>(null);
  const [totalCapitalSocial, setTotalCapitalSocial] = useState<number | null>(null);

  // Display min/max for date and capital
  const [minDataInicioAtividadeDisplay, setMinDataInicioAtividadeDisplay] = useState<string | null>(null);
  const [maxDataInicioAtividadeDisplay, setMaxDataInicioAtividadeDisplay] = useState<string | null>(null);
  const [minCapitalSocialDisplay, setMinCapitalSocialDisplay] = useState<number | null>(null);
  const [maxCapitalSocialDisplay, setMaxCapitalSocialDisplay] = useState<number | null>(null);

  // Filter inputs for date and capital
  const [filterMinDataInicioAtividade, setFilterMinDataInicioAtividade] = useState<string>('');
  const [filterMaxDataInicioAtividade, setFilterMaxDataInicioAtividade] = useState<string>('');
  const [filterMinCapitalSocial, setFilterMinCapitalSocial] = useState<number | string>('');
  const [filterMaxCapitalSocial, setFilterMaxCapitalSocial] = useState<number | string>('');

  // States to enable/disable range filters
  const [enableDataInicioAtividadeFilter, setEnableDataInicioAtividadeFilter] = useState(true);
  const [enableCapitalSocialFilter, setEnableCapitalSocialFilter] = useState(true);

  const [leadsGeradosComSucesso, setLeadsGeradosComSucesso] = useState(false);
  const [currentSearchFilters, setCurrentSearchFilters] = useState<any>({});
  const [uploadedCnpjs, setUploadedCnpjs] = useState<string[]>([]);

  const [suggestedFilters, setSuggestedFilters] = useState<Record<string, FilterOption[]>>({});
  const [selectOptions, setSelectOptions] = useState<Record<string, FilterOption[]>>({});
  const [selectedFilters, setSelectedFilters] = useState<Record<string, FilterOption[]>>({});

  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  // Definindo os campos por sessão
  const camposDadosCadastrais = ['nome_fantasia_normalizado', 'cod_cnae_principal', 'natureza_juridica'];
  const camposDadosLocalizacao = ['uf_normalizado', 'municipio_normalizado', 'bairro_normalizado', 'ddd1'];
  const camposDadosPorteTributacao = ['porte_empresa', 'opcao_simples', 'opcao_mei'];
  const camposDadosSocios = ['qtde_socios', 'qualificacoes', 'faixas_etarias'];

  // Lista consolidada de todos os campos que serão iterados para checkboxes e selects
  const todosOsCampos = [
    ...camposDadosCadastrais,
    ...camposDadosLocalizacao,
    ...camposDadosPorteTributacao,
    ...camposDadosSocios,
  ];

  const [enabledFilters, setEnabledFilters] = useState<Record<string, boolean>>(() => {
    const initialEnabled: Record<string, boolean> = {};
    todosOsCampos.forEach(campo => { initialEnabled[campo] = true; });
    return initialEnabled;
  });

  const handleFilterToggle = (campo: string) => {
    setEnabledFilters(prev => ({
      ...prev,
      [campo]: !prev[campo]
    }));
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const processNomeFantasiaForKeywords = (nomesFantasia: string[]): FilterOption[] => {
    const wordCounts: { [key: string]: number } = {};
    nomesFantasia.forEach(name => {
      const words = name.toLowerCase().split(/\s+/).filter(word => word.length > 2 && !STOPWORDS_PT_BR.has(word));
      words.forEach(word => {
        wordCounts[word] = (wordCounts[word] || 0) + 1;
      });
    });
    return Object.entries(wordCounts)
      .sort(([, countA], [, countB]) => countB - countA)
      .slice(0, 10)
      .map(([word]) => ({ label: word.toUpperCase(), value: word.toUpperCase() }));
  };

  const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setErro("Nenhum arquivo selecionado.");
      return;
    }

    setCarregando(true);
    setErro('');
    setResultados([]);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('http://localhost:8000/gerar-parametros-ia-por-arquivo/', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || 'Erro ao processar o arquivo e gerar parâmetros de IA.');
      }

      const filtros = await res.json();
      console.log("DEBUG: Filtros recebidos do backend (via file upload):", filtros);

      setTotalUFs(filtros.total_uf_encontradas);
      setTotalMunicipios(filtros.total_municipios_encontrados);
      setTotalBairros(filtros.total_bairros_encontrados);
      setTotalNomesFantasia(filtros.total_nome_fantasia_encontrados);
      setTotalCnaesPrincipais(filtros.total_cod_cnae_principal_encontrados);
      setTotalCnaesSecundarios(filtros.total_cod_cnae_secundario_encontrados);
      setTotalPorteEmpresa(filtros.total_porte_empresa_encontrados);
      setTotalNaturezaJuridica(filtros.total_natureza_juridica_encontrados);
      setTotalOpcaoSimples(filtros.total_opcao_simples_encontrados);
      setTotalOpcaoMei(filtros.total_opcao_mei_encontrados);
      setTotalDdd1(filtros.total_ddd1_encontrados);
      setTotalQtdeSocios(filtros.total_qtde_socios_encontrados);
      setTotalNomesSocios(filtros.total_nomes_socios_encontrados);
      setTotalQualificacoes(filtros.total_qualificacoes_encontrados);
      setTotalFaixasEtarias(filtros.total_faixas_etarias_encontrados);
      setTotalDataInicioAtividade(filtros.total_data_inicio_atividade_encontrados);
      setTotalCapitalSocial(filtros.total_capital_social_encontrados);

      setMinDataInicioAtividadeDisplay(filtros.min_data_inicio_atividade);
      setMaxDataInicioAtividadeDisplay(filtros.max_data_inicio_atividade);
      setMinCapitalSocialDisplay(filtros.min_capital_social);
      setMaxCapitalSocialDisplay(filtros.max_capital_social);

      setFilterMinDataInicioAtividade(filtros.min_data_inicio_atividade || '');
      setFilterMaxDataInicioAtividade(filtros.max_data_inicio_atividade || '');
      setFilterMinCapitalSocial(filtros.min_capital_social || '');
      setFilterMaxCapitalSocial(filtros.max_capital_social || '');

      const newSuggestedFilters: Record<string, FilterOption[]> = {};
      const newSelectedFilters: Record<string, FilterOption[]> = {};
      const newSelectOptions: Record<string, FilterOption[]> = {};

      todosOsCampos.forEach(campo => {
        const values = filtros[campo] || [];
        let options: FilterOption[] = [];

        if (campo === 'nome_fantasia_normalizado') {
          options = processNomeFantasiaForKeywords(values);
        } else if (campo === 'cod_cnae_principal' || campo === 'cod_cnae_secundario') {
          options = values.map((item: any) => ({
            label: String(item.label || '').trim(),
            value: String(item.value || '').trim(),
            description: String(item.description || '').trim()
          })).filter((option: FilterOption) => option.value !== '');
        } else {
          options = values.map((v: any) => ({ label: String(v), value: String(v) }));
        }
        
        newSuggestedFilters[campo] = options;
        newSelectedFilters[campo] = options;
        newSelectOptions[campo] = options;
        setValue(campo, options);
      });

      setSuggestedFilters(newSuggestedFilters);
      setSelectedFilters(newSelectedFilters);
      setSelectOptions(newSelectOptions);

      const resCnpjs = await fetch('http://localhost:8000/get-uploaded-cnpjs');
      if (resCnpjs.ok) {
        const cnpjsData = await resCnpjs.json();
        setUploadedCnpjs(cnpjsData.cnpjs || []);
      } else {
        console.warn("Could not fetch uploaded CNPJs for exclusion.");
      }

    } catch (err: any) {
      setErro(err.message);
      console.error("ERRO ao carregar filtros via arquivo:", err);
      reset({});
      setSuggestedFilters({});
      setSelectedFilters({});
      setSelectOptions({});
      setUploadedCnpjs([]);
    } finally {
      setCarregando(false);
    }
  };

  const handleRemoveTag = (campo: string, valueToRemove: string) => {
    setSelectedFilters(prev => {
      const updatedValues = prev[campo] ? prev[campo].filter(opt => opt.value !== valueToRemove) : [];
      setValue(campo, updatedValues);
      return {
        ...prev,
        [campo]: updatedValues
      };
    });
  };

  const onSubmit = async (data: any) => {
    console.log("🚀 Formulário enviado:", data);
    try {
      setErro('');
      setLeadsGeradosComSucesso(false);
      setCarregando(true);
      setResultados([]);

      const params: any = {};

      todosOsCampos.forEach(campo => {
        if (enabledFilters[campo]) {
          const selectedOpts = selectedFilters[campo];
          if (selectedOpts && selectedOpts.length > 0) {
            params[campo] = selectedOpts.map(opt => opt.value);
          }
        }
      });

      if (enableDataInicioAtividadeFilter && filterMinDataInicioAtividade && filterMaxDataInicioAtividade) {
        params.data_inicio_atividade_min = filterMinDataInicioAtividade;
        params.data_inicio_atividade_max = filterMaxDataInicioAtividade;
      }

      if (enableCapitalSocialFilter && filterMinCapitalSocial && filterMaxCapitalSocial) {
        params.capital_social_min = parseFloat(String(filterMinCapitalSocial));
        params.capital_social_max = parseFloat(String(filterMaxCapitalSocial));
      }

      console.log("DEBUG FRONTEND: Payload enviado para /gerar-leads/", {
          cliente_referencia: 'IA-PLANILHA',
          params,
          limit: limite || 1000,
          cnpjs_excluir: uploadedCnpjs
      });

      const res = await fetch('http://localhost:8000/gerar-leads/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cliente_referencia: 'IA-PLANILHA',
          params,
          limit: limite || 1000, // Usando o estado 'limite'
          cnpjs_excluir: uploadedCnpjs
        })
      });

      const json = await res.json();
      console.log("DEBUG FRONTEND: Resposta recebida de /gerar-leads/", json);

      if (!res.ok) {
        const mensagemErro = Array.isArray(json.detail)
          ? json.detail.map((d: any) => d.msg || JSON.stringify(d)).join(', ')
          : json.detail || 'Erro na resposta da IA';
        throw new Error(mensagemErro);
      }

      setResultados(json.leads || []);
      setLeadsGeradosComSucesso(true);
      setCurrentSearchFilters(params);
    } catch (err: any) {
      setErro(err.message);
    } finally {
      setCarregando(false);
    }
  };

  // Função handleViewOnMap atualizada para usar query parameters e localStorage para CNPJs
  const handleViewOnMap = () => {
    const url = new URL('/dashboard/mapa_oportunidades', window.location.origin);
    const paramsToEncode: Record<string, string | number | string[]> = {};

    // Populate paramsToEncode with all filters (EXCETO cnpjs_excluir)
    todosOsCampos.forEach(campo => {
      if (enabledFilters[campo]) {
        const selectedOpts = selectedFilters[campo];
        if (selectedOpts && selectedOpts.length > 0) {
          paramsToEncode[campo] = selectedOpts.map(opt => opt.value);
        }
      }
    });

    if (enableDataInicioAtividadeFilter && filterMinDataInicioAtividade && filterMaxDataInicioAtividade) {
      paramsToEncode.data_inicio_atividade_min = filterMinDataInicioAtividade;
      paramsToEncode.data_inicio_atividade_max = filterMaxDataInicioAtividade;
    }

    if (enableCapitalSocialFilter && filterMinCapitalSocial && filterMaxCapitalSocial) {
      paramsToEncode.capital_social_min = parseFloat(String(filterMinCapitalSocial));
      paramsToEncode.capital_social_max = parseFloat(String(filterMaxCapitalSocial));
    }

    paramsToEncode.limit_resultados = limite;

    // Construir URLSearchParams manualmente para lidar com arrays corretamente
    for (const key in paramsToEncode) {
        if (paramsToEncode.hasOwnProperty(key)) {
            const value = paramsToEncode[key];
            if (Array.isArray(value)) {
                // Para valores de array, adicione cada item com a mesma chave
                value.forEach(item => {
                    url.searchParams.append(key, String(item));
                });
            } else if (value !== null && value !== undefined) {
                // Para valores não-array, adicione diretamente
                url.searchParams.append(key, String(value));
            }
        }
    }
    
    // Armazenar cnpjs_excluir no localStorage
    localStorage.setItem('cnpjsExcluirForMap', JSON.stringify(uploadedCnpjs));

    // Navegar para a página do mapa com os filtros na URL
    router.push(url.href as any);
  };

  const handleExportCsv = (data: Empresa[], filename: string) => {
    if (!data || data.length === 0) {
      alert('Nenhum dado para exportar.');
      return;
    }
    const headers = Object.keys(data[0]);
    const csvRows = [];
    csvRows.push(headers.map(header => `"${header}"`).join(','));
    for (const row of data) {
      const values = headers.map(header => {
        const value = (row as any)[header];
        return `"${String(value || '').replace(/"/g, '""')}"`;
      });
      csvRows.push(values.join(','));
    }
    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else {
      window.open('data:text/csv;charset=utf-8,' + encodeURIComponent(csvString));
    }
  };

  const handleExportExcel = (data: Empresa[], filename: string) => {
    if (!data || data.length === 0) {
      alert('Nenhum dado para exportar.');
      return;
    }
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Empresas');
    XLSX.writeFile(workbook, filename);
  };

  // Função auxiliar para renderizar os campos de filtro
  const renderFilterFields = (fields: string[]) => {
    return fields.map((campo) => (
      <div key={campo}>
        <div className="flex items-center gap-2 mb-1">
          <input
            type="checkbox"
            id={`checkbox-${campo}`}
            checked={enabledFilters[campo]}
            onChange={() => handleFilterToggle(campo)}
            className="form-checkbox h-4 w-4 text-blue-600 transition duration-150 ease-in-out"
          />
          <label className="text-sm font-medium text-gray-800" htmlFor={`checkbox-${campo}`}>{campo.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</label>
        </div>

        {isMounted && (
          <Controller
            name={campo}
            control={control}
            render={({ field }) => (
              <>
                <Select
                  {...field}
                  isMulti
                  options={selectOptions[campo] || []}
                  value={selectedFilters[campo] || []}
                  classNamePrefix="react-select"
                  onChange={(val) => {
                      const newValues = val as FilterOption[];
                      setSelectedFilters(prev => ({ ...prev, [campo]: newValues }));
                      field.onChange(newValues);
                  }}
                  isDisabled={!enabledFilters[campo]}
                  placeholder={enabledFilters[campo] ? "Selecione ou adicione filtros..." : "Filtro desabilitado"}
                  styles={{
                    control: (base, state) => ({
                      ...base,
                      backgroundColor: 'white', // Fundo branco
                      borderColor: '#d1d5db', // Borda cinza claro
                      color: '#1f2937', // Texto cinza escuro
                      opacity: !enabledFilters[campo] ? 0.6 : 1,
                      cursor: !enabledFilters[campo] ? 'not-allowed' : 'default',
                    }),
                    singleValue: (base) => ({ ...base, color: '#1f2937' }), // Texto cinza escuro
                    multiValue: (base) => ({ ...base, backgroundColor: '#e5e7eb', color: '#1f2937' }), // Tags cinza claro
                    multiValueLabel: (base) => ({ ...base, color: '#1f2937' }), // Texto das tags cinza escuro
                    multiValueRemove: (base) => ({
                      ...base,
                      color: '#6b7280', // Ícone de remover cinza
                      ':hover': { backgroundColor: '#d1d5db', color: '#1f2937' }, // Hover mais claro
                    }),
                    menu: (base) => ({ ...base, backgroundColor: 'white' }), // Menu branco
                    option: (base, state) => ({
                      ...base,
                      backgroundColor: state.isFocused ? '#e5e7eb' : 'white', // Opção focada cinza claro
                      color: '#1f2937', // Texto da opção cinza escuro
                      ':active': { backgroundColor: '#d1d5db' }, // Opção ativa mais clara
                    }),
                    input: (base) => ({ ...base, color: '#1f2937' }), // Input digitado cinza escuro
                  }}
                  // Adicionar formatação de tooltip para CNAE
                  {...(campo === 'cod_cnae_principal' || campo === 'cod_cnae_secundario' ? {
                    formatOptionLabel: (option: FilterOption) => (
                      <div title={option.description || option.label}>
                        {option.label}
                      </div>
                    ),
                    components: {
                      MultiValueLabel: (props: any) => (
                        <div title={props.data.description || props.data.label}>
                          {props.data.label}
                        </div>
                      )
                    }
                  } : {})}
                />
                {/* Exibição de totalizadores */}
                {campo === 'uf_normalizado' && totalUFs !== null && (
                  <p className="text-xs text-gray-600 mt-1">
                    Total de UFs únicas encontradas na planilha: {totalUFs}
                  </p>
                )}
                {campo === 'municipio_normalizado' && totalMunicipios !== null && (
                  <p className="text-xs text-gray-600 mt-1">
                    Total de municípios únicos encontrados na planilha: {totalMunicipios}
                  </p>
                )}
                {campo === 'bairro_normalizado' && totalBairros !== null && (
                  <p className="text-xs text-gray-600 mt-1">
                    Total de bairros únicos encontrados na planilha: {totalBairros}
                  </p>
                )}
                {campo === 'nome_fantasia_normalizado' && totalNomesFantasia !== null && (
                  <p className="text-xs text-gray-600 mt-1">
                    Total de nomes fantasia únicos encontrados na planilha: {totalNomesFantasia}
                  </p>
                )}
                {campo === 'cod_cnae_principal' && totalCnaesPrincipais !== null && (
                  <p className="text-xs text-gray-600 mt-1">
                    Total de CNAEs principais únicos encontrados na planilha: {totalCnaesPrincipais}
                  </p>
                )}
                {campo === 'cod_cnae_secundario' && totalCnaesSecundarios !== null && (
                  <p className="text-xs text-gray-600 mt-1">
                    Total de CNAEs secundários únicos encontrados na planilha: {totalCnaesSecundarios}
                  </p>
                )}
                {campo === 'porte_empresa' && totalPorteEmpresa !== null && (
                  <p className="text-xs text-gray-600 mt-1">
                    Total de portes de empresa únicos encontrados na planilha: {totalPorteEmpresa}
                  </p>
                )}
                {campo === 'natureza_juridica' && totalNaturezaJuridica !== null && (
                  <p className="text-xs text-gray-600 mt-1">
                    Total de naturezas jurídicas únicas encontradas na planilha: {totalNaturezaJuridica}
                  </p>
                )}
                {campo === 'opcao_simples' && totalOpcaoSimples !== null && (
                  <p className="text-xs text-gray-600 mt-1">
                    Total de opções Simples únicas encontradas na planilha: {totalOpcaoSimples}
                  </p>
                )}
                {campo === 'opcao_mei' && totalOpcaoMei !== null && (
                  <p className="text-xs text-gray-600 mt-1">
                    Total de opções MEI únicas encontradas na planilha: {totalOpcaoMei}
                  </p>
                )}
                {campo === 'ddd1' && totalDdd1 !== null && (
                  <p className="text-xs text-gray-600 mt-1">
                    Total de DDDs únicos encontrados na planilha: {totalDdd1}
                  </p>
                )}
                {campo === 'qtde_socios' && totalQtdeSocios !== null && (
                  <p className="text-xs text-gray-600 mt-1">
                    Total de quantidades de sócios únicas encontradas na planilha: {totalQtdeSocios}
                  </p>
                )}
                {campo === 'nomes_socios' && totalNomesSocios !== null && (
                  <p className="text-xs text-gray-600 mt-1">
                    Total de nomes de sócios únicos encontrados na planilha: {totalNomesSocios}
                  </p>
                )}
                {campo === 'qualificacoes' && totalQualificacoes !== null && (
                  <p className="text-xs text-gray-600 mt-1">
                    Total de qualificações únicas encontradas na planilha: {totalQualificacoes}
                  </p>
                )}
                {campo === 'faixas_etarias' && totalFaixasEtarias !== null && (
                  <p className="text-xs text-gray-600 mt-1">
                    Total de faixas etárias únicas encontradas na planilha: {totalFaixasEtarias}
                  </p>
                )}
              </>
            )}
          />
        )}
      </div>
    ));
  };


  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-6xl mx-auto space-y-6 bg-gray-100 text-gray-800 p-6 rounded-lg shadow-xl">
        <h1 className="text-2xl font-bold text-gray-900">IA Generator - Gerar Leads por Planilha</h1>

        <div className="bg-white p-4 rounded mb-6 shadow-md">
          <h2 className="text-lg font-semibold mb-3 text-gray-900">1. Carregar Planilha Enriquecida</h2>
          <p className="text-sm text-gray-700 mb-2">
            Faça o upload da sua planilha (CSV ou Excel) contendo os dados enriquecidos para que a IA possa sugerir os melhores filtros.
            A planilha deve conter uma coluna 'cnpj'.
          </p>
          <Input
            type="file"
            accept=".csv, .xls, .xlsx"
            onChange={handleFileUpload}
            className="mt-2 bg-gray-50 text-gray-800 border-gray-300 file:text-blue-600 file:bg-gray-100 file:border-none"
          />
          {carregando && <p className="text-blue-600 mt-2">Processando arquivo e gerando sugestões de filtros...</p>}
          {erro && !carregando && <p className="text-red-600 mt-2">Erro: {erro}</p>}
        </div>

        {Object.keys(suggestedFilters).length > 0 && (
          <>
            <h2 className="text-lg font-semibold text-gray-900">2. Refinar Filtros Sugeridos pela IA</h2>
            
            {/* Campo de Limite de Registros */}
            <div className="bg-white p-4 rounded shadow-md">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Configurações Gerais</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="limite-registros" className="text-sm font-medium text-gray-800">Limite de Registros</label>
                  <Input
                    id="limite-registros"
                    type="number"
                    value={limite}
                    onChange={(e) => setLimite(parseInt(e.target.value) || 0)}
                    placeholder="Número máximo de leads"
                    className="mt-1 bg-gray-50 text-gray-800 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-600 mt-1">Defina o número máximo de leads a serem gerados.</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

              {/* Seção: Dados Cadastrais */}
              <div className="bg-white p-4 rounded shadow-md">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">Dados Cadastrais</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderFilterFields(camposDadosCadastrais)}
                  {/* Filtro de Data de Início de Atividade */}
                  <div className="col-span-full">
                    <div className="flex items-center gap-2 mb-2">
                      <input
                        type="checkbox"
                        id="checkbox-data_inicio_atividade"
                        checked={enableDataInicioAtividadeFilter}
                        onChange={() => setEnableDataInicioAtividadeFilter(prev => !prev)}
                        className="form-checkbox h-4 w-4 text-blue-600 transition duration-150 ease-in-out"
                      />
                      <label className="text-sm font-medium text-gray-800" htmlFor="checkbox-data_inicio_atividade">Data de Início de Atividade</label>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <div>
                        <label className="text-xs text-gray-600">Mínima Encontrada na Planilha:</label>
                        <Input
                          type="date"
                          value={minDataInicioAtividadeDisplay || ''}
                          readOnly
                          className="mt-1 bg-gray-100 text-gray-800 border-gray-300 opacity-70 cursor-not-allowed"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-600">Máxima Encontrada na Planilha:</label>
                        <Input
                          type="date"
                          value={maxDataInicioAtividadeDisplay || ''}
                          readOnly
                          className="mt-1 bg-gray-100 text-gray-800 border-gray-300 opacity-70 cursor-not-allowed"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs font-medium text-gray-800">Filtrar de (Data):</label>
                        <Input
                          type="date"
                          value={filterMinDataInicioAtividade}
                          onChange={(e) => setFilterMinDataInicioAtividade(e.target.value)}
                          disabled={!enableDataInicioAtividadeFilter}
                          className="mt-1 bg-gray-50 text-gray-800 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-800">Filtrar até (Data):</label>
                        <Input
                          type="date"
                          value={filterMaxDataInicioAtividade}
                          onChange={(e) => setFilterMaxDataInicioAtividade(e.target.value)}
                          disabled={!enableDataInicioAtividadeFilter}
                          className="mt-1 bg-gray-50 text-gray-800 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    {totalDataInicioAtividade !== null && (
                      <p className="text-xs text-gray-600 mt-1">
                        Total de datas de início de atividade únicas na planilha: {totalDataInicioAtividade}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Seção: Dados Localização */}
              <div className="bg-white p-4 rounded shadow-md">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">Dados Localização</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderFilterFields(camposDadosLocalizacao)}
                </div>
              </div>

              {/* Seção: Dados Porte e Tributação */}
              <div className="bg-white p-4 rounded shadow-md">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">Dados Porte e Tributação</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderFilterFields(camposDadosPorteTributacao)}
                  {/* Filtro de Capital Social */}
                  <div className="col-span-full">
                    <div className="flex items-center gap-2 mb-2">
                      <input
                        type="checkbox"
                        id="checkbox-capital_social"
                        checked={enableCapitalSocialFilter}
                        onChange={() => setEnableCapitalSocialFilter(prev => !prev)}
                        className="form-checkbox h-4 w-4 text-blue-600 transition duration-150 ease-in-out"
                      />
                      <label className="text-sm font-medium text-gray-800" htmlFor="checkbox-capital_social">Capital Social</label>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <div>
                        <label className="text-xs text-gray-600">Mínimo Encontrado na Planilha:</label>
                        <Input
                          type="number"
                          value={minCapitalSocialDisplay ?? ''}
                          readOnly
                          className="mt-1 bg-gray-100 text-gray-800 border-gray-300 opacity-70 cursor-not-allowed"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-600">Máximo Encontrado na Planilha:</label>
                        <Input
                          type="number"
                          value={maxCapitalSocialDisplay ?? ''}
                          readOnly
                          className="mt-1 bg-gray-100 text-gray-800 border-gray-300 opacity-70 cursor-not-allowed"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs font-medium text-gray-800">Filtrar de (Capital):</label>
                        <Input
                          type="number"
                          value={filterMinCapitalSocial}
                          onChange={(e) => setFilterMinCapitalSocial(e.target.value)}
                          disabled={!enableCapitalSocialFilter}
                          className="mt-1 bg-gray-50 text-gray-800 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-800">Filtrar até (Capital):</label>
                        <Input
                          type="number"
                          value={filterMaxCapitalSocial}
                          onChange={(e) => setFilterMaxCapitalSocial(e.target.value)}
                          disabled={!enableCapitalSocialFilter}
                          className="mt-1 bg-gray-50 text-gray-800 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    {totalCapitalSocial !== null && (
                      <p className="text-xs text-gray-600 mt-1">
                        Total de capitais sociais únicos encontrados na planilha: {totalCapitalSocial}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Seção: Dados dos Sócios */}
              <div className="bg-white p-4 rounded shadow-md">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">Dados dos Sócios</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderFilterFields(camposDadosSocios)}
                </div>
              </div>

              <div className="col-span-full text-center mt-4">
                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg"
                  disabled={carregando}
                >
                  {carregando ? 'Gerando Leads...' : 'Gerar Leads com IA'}
                </Button>
              </div>
            </form>
          </>
        )}

        {carregando && (
          <p className="text-lg text-blue-600 text-center mt-4">Carregando filtros ou gerando leads...</p>
        )}

        {!carregando && resultados.length > 0 && (
          <div className="space-y-4 mt-4">
            <h2 className="text-xl font-semibold text-gray-900">Leads Gerados com IA</h2>
            <p className="text-sm font-medium text-green-700">
              Total de leads encontrados: {resultados.length}
            </p>
            <div className="rounded-md border border-gray-200 bg-white p-4 text-gray-800 shadow-md">
              {isMounted && <ResultadoTabela data={resultados.slice(0, 10)} />}
              <p className="text-xs text-gray-600 mt-2">
                Mostrando os 10 primeiros resultados
              </p>
              <div className="flex gap-4 mt-4 justify-end">
                {isMounted && (
                  <Button
                    onClick={handleViewOnMap}
                    className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    Visualizar no Mapa
                  </Button>
                )}
                {isMounted && (
                  <Button
                    onClick={() => handleExportCsv(resultados, 'leads_gerados_ia.csv')}
                    className="px-6 py-3 bg-gray-200 text-gray-800 font-semibold rounded-lg shadow-md hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 border border-gray-400"
                  >
                    ⬇️ Exportar CSV
                  </Button>
                )}
                {isMounted && (
                  <Button
                    onClick={() => handleExportExcel(resultados, 'leads_gerados_ia.xlsx')}
                    className="px-6 py-3 bg-gray-200 text-gray-800 font-semibold rounded-lg shadow-md hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 border border-gray-400"
                  >
                    ⬇️ Exportar Excel
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {!carregando && resultados.length === 0 && leadsGeradosComSucesso && !erro && (
          <p className="text-lg text-yellow-700 text-center mt-4">Nenhum lead encontrado com os filtros aplicados.</p>
        )}

        {erro && !carregando && (
          <p className="text-red-600 text-center mt-4">Erro: {erro}</p>
        )}
      </div>
    </div>
  );
}
