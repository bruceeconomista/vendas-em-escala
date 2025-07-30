// site/meu-site/src/app/dashboard/crescimento-empresas/page.tsx
'use client';

import React, { useState, FormEvent } from 'react';

// Definição dos tipos para os parâmetros da pesquisa de mercado
interface MarketResearchParams {
  n_meses_analise: number;
  filtro_uf_pesquisa?: string[];
  filtro_municipio_pesquisa?: string[];
  filtro_nome_fantasia_pesquisa?: string[];
}

interface MarketResearchResult {
  qtd_resultados: number;
  resultados: any[]; // Pode ser mais específico se souber a estrutura dos dados
}

const CrescimentoEmpresasPage: React.FC = () => {
  const [formData, setFormData] = useState<MarketResearchParams>({
    n_meses_analise: 24, // Valor padrão de 24 meses
    filtro_uf_pesquisa: [],
    filtro_municipio_pesquisa: [],
    filtro_nome_fantasia_pesquisa: [],
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<MarketResearchResult | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;

    if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: value ? parseInt(value, 10) : undefined }));
    } else if (name.startsWith('filtro_')) {
      // Para campos que são listas de strings (ex: filtro_uf_pesquisa)
      setFormData(prev => ({ ...prev, [name]: value.split(',').map(s => s.trim()).filter(s => s.length > 0) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResults(null);

    // Limpeza dos dados: remover arrays vazios ou valores nulos/undefined antes de enviar
    const cleanedFormData: MarketResearchParams = Object.entries(formData).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== null) {
            if (Array.isArray(value)) {
                if (value.length > 0) {
                    (acc as any)[key] = value;
                }
            } else if (typeof value === 'string') {
                if (value.trim() !== '') {
                    (acc as any)[key] = value;
                }
            } else if (typeof value === 'number') {
                if (!isNaN(value)) {
                    (acc as any)[key] = value;
                }
            } else {
                (acc as any)[key] = value;
            }
        }
        return acc;
    }, {} as MarketResearchParams);

    try {
      const response = await fetch('http://localhost:8000/pesquisa-mercado/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cleanedFormData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Erro ao realizar a pesquisa de mercado.');
      }

      const data: MarketResearchResult = await response.json();
      setResults(data);
    } catch (err: any) {
      setError(err.message);
      console.error('Erro na pesquisa de mercado:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Análise de Crescimento de Empresas</h1>

      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="n_meses_analise">
              Meses para Análise (últimos)
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="n_meses_analise"
              type="number"
              name="n_meses_analise"
              value={formData.n_meses_analise}
              onChange={handleChange}
              min="1"
              max="120"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="filtro_uf_pesquisa">
              Filtrar por UF (separadas por vírgula)
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="filtro_uf_pesquisa"
              type="text"
              name="filtro_uf_pesquisa"
              value={(formData.filtro_uf_pesquisa || []).join(', ')}
              onChange={handleChange}
              placeholder="Ex: SP, RJ, MG"
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="filtro_municipio_pesquisa">
              Filtrar por Município (separados por vírgula)
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="filtro_municipio_pesquisa"
              type="text"
              name="filtro_municipio_pesquisa"
              value={(formData.filtro_municipio_pesquisa || []).join(', ')}
              onChange={handleChange}
              placeholder="Ex: SÃO PAULO, CAMPINAS"
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="filtro_nome_fantasia_pesquisa">
              Filtrar por Nome Fantasia (termos, separados por vírgula)
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="filtro_nome_fantasia_pesquisa"
              type="text"
              name="filtro_nome_fantasia_pesquisa"
              value={(formData.filtro_nome_fantasia_pesquisa || []).join(', ')}
              onChange={handleChange}
              placeholder="Ex: PIZZARIA, ESCRITÓRIO"
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Gerando Análise...' : 'Gerar Análise de Crescimento'}
          </button>
        </div>
      </form>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Erro:</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}

      {results && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
          <p className="font-bold">Análise Concluída!</p>
          <p>Total de empresas encontradas nos últimos {formData.n_meses_analise} meses: {results.qtd_resultados}</p>
          {results.resultados.length > 0 && (
            <div className="mt-4 max-h-96 overflow-y-auto">
              <h3 className="text-lg font-bold mb-2">Resultados Agrupados (Primeiros 10):</h3>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {Object.keys(results.resultados[0]).map(key => (
                      <th key={key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {results.resultados.slice(0, 10).map((row, index) => (
                    <tr key={index}>
                      {Object.values(row).map((value, idx) => (
                        <td key={idx} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {String(value)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {results.resultados.length > 10 && (
                <p className="text-sm text-gray-600 mt-2">Exibindo apenas os primeiros 10 resultados de {results.qtd_resultados}.</p>
              )}
            </div>
          )}
          {results.resultados.length === 0 && (
            <p className="mt-2">Nenhum resultado encontrado com os filtros aplicados.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default CrescimentoEmpresasPage;