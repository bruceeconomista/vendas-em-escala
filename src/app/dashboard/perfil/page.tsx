'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function Perfil() {
  const { data: session } = useSession();
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [usuario, setUsuario] = useState<any>(null);
  const [empresa, setEmpresa] = useState<any>(null);

  useEffect(() => {
    async function fetchDados() {
      try {
        const res = await fetch('/api/perfil', { cache: 'no-store' });
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || 'Erro ao carregar os dados');

        setUsuario(data.usuario);
        setEmpresa(data.empresa);
      } catch (err: any) {
        setErro(err.message);
      } finally {
        setCarregando(false);
      }
    }
    fetchDados();
  }, []);

  if (carregando) return <div className="p-6">Carregando...</div>;
  if (erro) return <div className="p-6 text-red-500">Erro: {erro}</div>;

  const InfoField = ({ label, value }: { label: string; value: string }) => (
    <div className="space-y-1">
      <Label className="text-base text-gray-800 font-medium">{label}</Label>
      <Input value={value} disabled className="bg-slate-100" />
    </div>
  );

  const renderTabelaSocios = () => {
    const nomes = empresa?.nomes_socios?.split('|') || [];
    const cpfs = empresa?.cpfs_socios?.split('|') || [];
    const datas = empresa?.datas_entrada?.split('|') || [];
    const qualificacoes = empresa?.qualificacoes?.split('|') || [];
    const faixas = empresa?.faixas_etarias?.split('|') || [];

    return (
      <div className="overflow-auto rounded-lg border border-slate-200">
        <table className="w-full text-base text-gray-800">
          <thead className="bg-slate-100">
            <tr>
              <th className="text-left p-1 font-medium">Nome do Sócio</th>
              <th className="text-left p-1 font-medium">CPF/CNPJ do Sócio</th>
              <th className="text-left p-1 font-medium">Data de Entrada</th>
              <th className="text-left p-1 font-medium">Qualificação</th>
              <th className="text-left p-1 font-medium">Faixa Etária</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {nomes.map((nome: string, i: number) => (
              <tr key={i}>
                <td className="p-2 border-b">{nome}</td>
                <td className="p-2 border-b">{cpfs[i]}</td>
                <td className="p-2 border-b">{datas[i]}</td>
                <td className="p-2 border-b">{qualificacoes[i]}</td>
                <td className="p-2 border-b">{faixas[i]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-7xl mx-auto p-6 space-y-6 text-lg"> 
        {/* Perfil da Empresa */}
        <Card>
          <CardHeader>
            <CardTitle>Perfil da Empresa</CardTitle>
          </CardHeader>
          <CardContent className="text-4xl grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoField label="CNPJ" value={usuario?.cnpj || ''} />
            <InfoField label="Data de Cadastro" value={new Date(usuario?.criado_em).toLocaleDateString('pt-BR')} />
            <InfoField label="Email" value={usuario?.email || ''} />
            <InfoField label="Telefone" value={usuario?.telefone || ''} />
            <div className="md:col-span-2">
              <Label className="text-base text-slate-400">Senha</Label>
              <Input type="password" placeholder="Nova senha" className="bg-slate-100" />
            </div>
          </CardContent>
        </Card>

        {/* Dados Cadastrais da Empresa */}
        <Card>
          <CardHeader>
            <CardTitle>Dados Cadastrais da Empresa</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoField label="Razão Social" value={empresa?.razao_social_normalizado || ''} />
            <InfoField label="Nome Fantasia" value={empresa?.nome_fantasia_normalizado || ''} />
            <InfoField label="Identificador Matriz/Filial" value={empresa?.identificador_matriz_filial || ''} />
            <InfoField label="Data Início Atividade" value={empresa?.data_inicio_atividade || ''} />
            <InfoField label="Capital Social" value={empresa?.capital_social || ''} />
            <InfoField label="Código CNAE Principal" value={empresa?.cnae_fiscal || ''} />
            <InfoField label="CNAE Principal" value={empresa?.cnae_descricao || ''} />
            <InfoField label="Código CNAE Secundário" value={empresa?.cnae_fiscal_secundario || ''} />
            <InfoField label="CNAE Secundário" value={empresa?.cnae_descricao_secundario || ''} />
            <InfoField label="Porte da Empresa" value={empresa?.porte || ''} />
            <InfoField label="Natureza Jurídica" value={empresa?.natureza_juridica || ''} />
            <InfoField label="Opção Simples" value={empresa?.opcao_simples || ''} />
            <InfoField label="Opção MEI" value={empresa?.opcao_mei || ''} />
            <InfoField label="Motivo Situação Cadastral" value={empresa?.motivo || ''} />
            <InfoField label="Situação Cadastral" value={empresa?.situacao_cadastral || ''} />
            <InfoField label="Data Situação Cadastral" value={empresa?.data_situacao_cadastral || ''} />
            <InfoField label="UF" value={empresa?.uf_normalizado || ''} />
            <InfoField label="Município" value={empresa?.municipio_normalizado || ''} />
            <InfoField label="Bairro" value={empresa?.bairro_normalizado || ''} />
            <InfoField label="Logradouro" value={empresa?.logradouro || ''} />
            <InfoField label="Número" value={empresa?.numero || ''} />
            <InfoField label="Complemento" value={empresa?.complemento || ''} />
            <InfoField label="CEP" value={empresa?.cep || ''} />
            <InfoField label="Latitude" value={empresa?.latitude || ''} />
            <InfoField label="Longitude" value={empresa?.longitude || ''} />
            <InfoField label="DDD1" value={empresa?.ddd1 || ''} />
            <InfoField label="Telefone 1" value={empresa?.telefone1 || ''} />
            <InfoField label="DDD2" value={empresa?.ddd2 || ''} />
            <InfoField label="Telefone 2" value={empresa?.telefone2 || ''} />
            <InfoField label="Email da Empresa" value={empresa?.email || ''} />
          </CardContent>
        </Card>

        {/* Dados Cadastrais dos Sócios */}
        <Card>
          <CardHeader>
            <CardTitle>Dados Cadastrais dos Sócios</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <InfoField label="Quantidade de Sócios" value={empresa?.qtde_socios || ''} />
            {renderTabelaSocios()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}