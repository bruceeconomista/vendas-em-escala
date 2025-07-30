// src/components/ResumoGraficos.tsx
'use client';

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  LabelList,
  PieChart,
  Pie,
} from 'recharts';

interface Empresa {
  uf_normalizado?: string;
  municipio_normalizado?: string;
  bairro_normalizado?: string;
  capital_social?: string;
  porte_empresa?: string;
  opcao_simples?: string;
  opcao_mei?: string;
  qtde_socios?: string;
  cod_cnae_principal?: string;
  cnae_principal_normalizado?: string;
  cod_cnae_secundario?: string;
  cnae_secundario_normalizado?: string;
}

export default function ResumoGraficos({ data }: { data: Empresa[] }) {
  const [limite, setLimite] = useState(10);

  const agruparPorCampoComOutros = (campo: keyof Empresa) => {
    const contagem: Record<string, number> = {};
    data.forEach((item) => {
      const chave = item[campo]?.trim() || 'Não informado';
      contagem[chave] = (contagem[chave] || 0) + 1;
    });
    const ordenado = Object.entries(contagem)
      .sort((a, b) => b[1] - a[1])
      .map(([nome, valor]) => ({ nome, valor }));

    const principais = ordenado.slice(0, limite);
    const outros = ordenado.slice(limite);
    const somaOutros = outros.reduce((acc, item) => acc + item.valor, 0);
    if (somaOutros > 0) {
      principais.push({ nome: 'Outros', valor: somaOutros });
    }
    return principais;
  };

  const dadosUF = agruparPorCampoComOutros('uf_normalizado');
  const dadosMunicipio = agruparPorCampoComOutros('municipio_normalizado');
  const dadosBairro = agruparPorCampoComOutros('bairro_normalizado');

  const renderGraficoBarra = (dados: { nome: string; valor: number }[], titulo: string) => (
    <div className="bg-white rounded p-4">
      <h4 className="text-md font-semibold text-black mb-2">{titulo}</h4>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={dados} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="nome" className="text-xs" interval={0} angle={-30} dy={10} height={60} />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="valor" fill="#4f46e5">
            <LabelList dataKey="valor" position="top" className="text-xs" />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );

  return (
    <Tabs defaultValue="localizacao" className="w-full">
      <TabsList className="flex flex-wrap overflow-auto">
        <TabsTrigger value="localizacao">Localização</TabsTrigger>
        <TabsTrigger value="tamanho">Tamanho das Empresas</TabsTrigger>
        <TabsTrigger value="tributacao">Tributação</TabsTrigger>
        <TabsTrigger value="socios">Qtde de Sócios</TabsTrigger>
        <TabsTrigger value="cnaes">CNAEs</TabsTrigger>
      </TabsList>

      {/* Localização */}
      <TabsContent value="localizacao" className="space-y-4 pt-4">
        <h3 className="text-lg font-semibold text-white">Localização</h3>
        <p className="text-sm text-slate-300">Número de itens a exibir antes de agrupar em "Outros": {limite}</p>
        <input
          type="range"
          min={5}
          max={30}
          value={limite}
          onChange={(e) => setLimite(Number(e.target.value))}
          className="w-full"
        />

        <div className="space-y-4">
          {renderGraficoBarra(dadosUF, 'Empresas por UF')}
          {renderGraficoBarra(dadosMunicipio, 'Empresas por Município')}
          {renderGraficoBarra(dadosBairro, 'Empresas por Bairro')}
        </div>
      </TabsContent>

      {/* Tamanho das Empresas */}
      <TabsContent value="tamanho" className="space-y-4 pt-4">
        <h3 className="text-lg font-semibold text-white">Tamanho das Empresas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded p-4">
            <h4 className="text-md font-semibold text-black mb-2">Capital Social (faixas)</h4>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={(() => {
                const faixas = {
                  'Até 10k': 0,
                  '10k-50k': 0,
                  '50k-200k': 0,
                  '200k-1mi': 0,
                  'Acima de 1mi': 0,
                  'Não informado': 0,
                };
                data.forEach((e) => {
                  const valor = parseFloat(e.capital_social || '0');
                  if (!e.capital_social) faixas['Não informado']++;
                  else if (valor <= 10000) faixas['Até 10k']++;
                  else if (valor <= 50000) faixas['10k-50k']++;
                  else if (valor <= 200000) faixas['50k-200k']++;
                  else if (valor <= 1000000) faixas['200k-1mi']++;
                  else faixas['Acima de 1mi']++;
                });
                return Object.entries(faixas).map(([nome, valor]) => ({ nome, valor }));
              })()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="nome" className="text-xs" interval={0} angle={-30} dy={10} height={60} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="valor" fill="#10b981">
                  <LabelList dataKey="valor" position="top" className="text-xs" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded p-4">
            <h4 className="text-md font-semibold text-black mb-2">Porte da Empresa</h4>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={(() => {
                const contagem: Record<string, number> = {};
                data.forEach((e) => {
                  const chave = e.porte_empresa?.trim() || 'Não informado';
                  contagem[chave] = (contagem[chave] || 0) + 1;
                });
                return Object.entries(contagem).map(([nome, valor]) => ({ nome, valor }));
              })()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="nome" className="text-xs" interval={0} angle={-30} dy={10} height={60} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="valor" fill="#6366f1">
                  <LabelList dataKey="valor" position="top" className="text-xs" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </TabsContent>

      {/* Tributação */}
      <TabsContent value="tributacao" className="space-y-4 pt-4">
        <h3 className="text-lg font-semibold text-white">Tributação</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded p-4">
            <h4 className="text-md font-semibold text-black mb-2">Opção Simples</h4>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  dataKey="valor"
                  nameKey="nome"
                  data={(() => {
                    const contagem: Record<string, number> = {};
                    data.forEach((e) => {
                      const chave = e.opcao_simples?.trim() || 'Não informado';
                      contagem[chave] = (contagem[chave] || 0) + 1;
                    });
                    const total = Object.values(contagem).reduce((a, b) => a + b, 0);
                    return Object.entries(contagem).map(([nome, valor], i) => ({ 
                      nome, 
                      valor,
                      fill: ['#22c55e', '#f59e0b', '#e5e7eb'][i % 3],
                      percent: ((valor / total) * 100).toFixed(1) + '%',
                    }));
                  })()}
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label={({ name, percent }) => `${name} (${percent})`}
                >
                  <LabelList dataKey="valor" position="outside" className="text-xs" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded p-4">
            <h4 className="text-md font-semibold text-black mb-2">Opção MEI</h4>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  dataKey="valor"
                  nameKey="nome"
                  data={(() => {
                    const contagem: Record<string, number> = {};
                    data.forEach((e) => {
                      const chave = e.opcao_mei?.trim() || 'Não informado';
                      contagem[chave] = (contagem[chave] || 0) + 1;
                    });
                    const total = Object.values(contagem).reduce((a, b) => a + b, 0);
                    return Object.entries(contagem).map(([nome, valor], i) => ({
                      nome,
                      valor,
                      fill: ['#06b6d4', '#ec4899', '#d1d5db'][i % 3],
                      percent: ((valor / total) * 100).toFixed(1) + '%',
                    }));
                  })()}
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label={({ name, percent }) => `${name} (${percent})`}
                >
                  <LabelList dataKey="valor" position="outside" className="text-xs" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </TabsContent>

      {/* Quantidade de Sócios */}
      <TabsContent value="socios" className="space-y-4 pt-4">
        <h3 className="text-lg font-semibold text-white">Quantidade de Sócios</h3>
        <div className="bg-white rounded p-4">
          <h4 className="text-md font-semibold text-black mb-2">Frequência de Quantidade de Sócios</h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart
              data={(() => {
                const contagem: Record<string, number> = {};
                data.forEach((e) => {
                  const chave = e.qtde_socios?.toString().trim() || 'Não informado';
                  contagem[chave] = (contagem[chave] || 0) + 1;
                });
                return Object.entries(contagem)
                  .map(([nome, valor]) => ({ nome, valor }))
                  .sort((a, b) => parseInt(a.nome) - parseInt(b.nome));
              })()}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="nome" className="text-xs" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="valor" fill="#f97316">
                <LabelList dataKey="valor" position="top" className="text-xs" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </TabsContent>

      {/* CNAEs */}
      <TabsContent value="cnaes" className="space-y-4 pt-4">
        <h3 className="text-lg font-semibold text-white">CNAEs</h3>
        <p className="text-sm text-slate-300">Número de CNAEs a exibir antes de agrupar em "Outros": {limite}</p>
        <input
          type="range"
          min={5}
          max={30}
          value={limite}
          onChange={(e) => setLimite(Number(e.target.value))}
          className="w-full"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* CNAE Principal */}
          <div className="bg-white rounded p-4">
            <h4 className="text-md font-semibold text-black mb-2">CNAE Principal</h4>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                layout="vertical"
                data={(() => {
                  const contagem: Record<string, { count: number; descricao: string }> = {};
                  data.forEach((e) => {
                    const cod = e.cod_cnae_principal?.trim() || 'Não informado';
                    const desc = e.cnae_principal_normalizado?.trim() || '';
                    if (!contagem[cod]) {
                      contagem[cod] = { count: 0, descricao: desc };
                    }
                    contagem[cod].count++;
                  });
                  const ordenado = Object.entries(contagem)
                    .sort((a, b) => b[1].count - a[1].count)
                    .map(([nome, { count, descricao }]) => ({ nome, valor: count, descricao }));
                  const principais = ordenado.slice(0, limite);
                  const outros = ordenado.slice(limite);
                  const somaOutros = outros.reduce((acc, item) => acc + item.valor, 0);
                  if (somaOutros > 0) {
                    principais.push({ nome: 'Outros', valor: somaOutros, descricao: 'Demais CNAEs agrupados' });
                  }
                  return principais;
                })()}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" allowDecimals={false} />
                <YAxis type="category" dataKey="nome" className="text-xs" />
                <Tooltip formatter={(value, name, props) => [value, props.payload.descricao]} />
                <Bar dataKey="valor" fill="#3b82f6">
                  <LabelList dataKey="valor" position="right" className="text-xs" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* CNAE Secundário */}
          <div className="bg-white rounded p-4">
            <h4 className="text-md font-semibold text-black mb-2">CNAE Secundário</h4>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                layout="vertical"
                data={(() => {
                  const contagem: Record<string, { count: number; descricao: string }> = {};
                  data.forEach((e) => {
                    const cod = e.cod_cnae_secundario?.trim() || 'Não informado';
                    const desc = e.cnae_secundario_normalizado?.trim() || '';
                    if (!contagem[cod]) {
                      contagem[cod] = { count: 0, descricao: desc };
                    }
                    contagem[cod].count++;
                  });
                  const ordenado = Object.entries(contagem)
                    .sort((a, b) => b[1].count - a[1].count)
                    .map(([nome, { count, descricao }]) => ({ nome, valor: count, descricao }));
                  const principais = ordenado.slice(0, limite);
                  const outros = ordenado.slice(limite);
                  const somaOutros = outros.reduce((acc, item) => acc + item.valor, 0);
                  if (somaOutros > 0) {
                    principais.push({ nome: 'Outros', valor: somaOutros, descricao: 'Demais CNAEs agrupados' });
                  }
                  return principais;
                })()}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" allowDecimals={false} />
                <YAxis type="category" dataKey="nome" className="text-xs" />
                <Tooltip formatter={(value, name, props) => [value, props.payload.descricao]} />
                <Bar dataKey="valor" fill="#8b5cf6">
                  <LabelList dataKey="valor" position="right" className="text-xs" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
}

