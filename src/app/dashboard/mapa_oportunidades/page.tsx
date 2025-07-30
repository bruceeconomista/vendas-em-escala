'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Empresa } from '@/components/ResultadoTabela'; // Importa a interface Empresa

// Importa o componente MapaLeads dinamicamente para garantir que o Leaflet só seja carregado no cliente
const MapaLeads = dynamic(() => import('@/components/MapaLeads'), { ssr: false });

export default function MapaOportunidadesPage() {
  const searchParams = useSearchParams();
  const [leads, setLeads] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeads = async () => {
      setLoading(true);
      setError(null);
      
      const filtersToSend: any = {};

      // 1. Tentar extrair cnpjs_excluir do localStorage (para a IA Page)
      const cnpjsExcluirString = localStorage.getItem('cnpjsExcluirForMap');
      if (cnpjsExcluirString) {
        try {
          filtersToSend.cnpjs_excluir = JSON.parse(cnpjsExcluirString);
          // Limpar o localStorage após ler para evitar persistência indesejada
          localStorage.removeItem('cnpjsExcluirForMap');
        } catch (e) {
          console.error("Erro ao parsear cnpjsExcluirForMap do localStorage", e);
          filtersToSend.cnpjs_excluir = []; // Garante que seja um array vazio em caso de erro
        }
      } else {
        filtersToSend.cnpjs_excluir = []; // <--- ADICIONADO: Garante que cnpjs_excluir seja um array vazio se não estiver no localStorage
      }

      // 2. Extrair os demais filtros da URL (para ambas as páginas)
      const arrayParams = [
        'nome_fantasia_normalizado', 'cod_cnae_principal', 'natureza_juridica',
        'uf_normalizado', 'municipio_normalizado', 'bairro_normalizado', 'ddd1',
        'porte_empresa', 'opcao_simples', 'opcao_mei',
        'qtde_socios', 'qualificacoes', 'faixas_etarias'
        // Adicione aqui outros parâmetros que podem ser arrays e vêm da URL
      ];

      arrayParams.forEach(param => {
        const values = searchParams.getAll(param); // Usa getAll para pegar todos os valores de um parâmetro repetido
        if (values.length > 0) {
          // Se os valores vêm separados por vírgula na URL (como no seu caso da Busca Livre)
          // então precisamos fazer o split e trim.
          // Se eles já vêm como múltiplos parâmetros (ex: ?uf=SP&uf=RJ), getAll já retorna o array.
          // A sua URL da Busca Livre indica que eles vêm como uma única string separada por vírgula.
          // Então, mantemos o split(',')
          filtersToSend[param] = values.flatMap(value => value.split(',').map(s => s.trim()).filter(s => s.length > 0));
        }
      });

      // Campos de faixa (min/max) e outros valores únicos
      const dataInicioMin = searchParams.get('data_inicio_atividade_min');
      const dataInicioMax = searchParams.get('data_inicio_atividade_max');
      if (dataInicioMin) filtersToSend.data_inicio_atividade_min = dataInicioMin;
      if (dataInicioMax) filtersToSend.data_inicio_atividade_max = dataInicioMax;

      const capitalMin = searchParams.get('capital_social_min');
      const capitalMax = searchParams.get('capital_social_max');
      if (capitalMin) filtersToSend.capital_social_min = parseFloat(capitalMin);
      if (capitalMax) filtersToSend.capital_social_max = parseFloat(capitalMax);

      const limitResultados = searchParams.get('limit_resultados');
      if (limitResultados) filtersToSend.limit_resultados = parseInt(limitResultados, 10);

      // Adicione aqui outros parâmetros específicos da Busca Livre que vêm na URL e não são arrays
      // Exemplo:
      // const termoBuscaLivre = searchParams.get('termo_busca_livre');
      // if (termoBuscaLivre) filtersToSend.termo_busca_livre = termoBuscaLivre;
      // const algumOutroCampo = searchParams.get('algum_outro_campo');
      // if (algumOutroCampo) filtersToSend.algum_outro_campo = algumOutroCampo;


      console.log("Filtros combinados para a requisição do mapa:", filtersToSend);

      // 3. Fazer a requisição POST para o backend
      try {
        const response = await fetch('http://localhost:8000/mapa-leads/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(filtersToSend),
        });

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`Erro na API: ${errText}`);
        }
        const data: Empresa[] = await response.json();

        const validLeads = data.filter(d => typeof d.latitude === 'number' && typeof d.longitude === 'number');
        setLeads(validLeads);

      } catch (err: any) {
        console.error("Erro ao buscar dados do mapa:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();
  }, [searchParams]); // Dependência de searchParams para re-executar a busca quando os filtros mudam

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-6xl mx-auto space-y-6 bg-gray-100 text-gray-800 p-6 rounded-lg shadow-xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">📍 Mapa de Oportunidades</h1>

        {loading ? (
          <p className="text-blue-600 text-center">Carregando dados do mapa...</p>
        ) : error ? (
          <div className="text-red-600 text-center">Erro: {error}</div>
        ) : leads.length === 0 ? (
          <p className="text-yellow-700 text-center">Nenhum lead encontrado para exibir no mapa com os filtros aplicados.</p>
        ) : (
          <MapaLeads leads={leads} />
        )}
      </div>
    </div>
  );
}
