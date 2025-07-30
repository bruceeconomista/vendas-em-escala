'use client';

import { useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { UploadCloud, Loader2 } from 'lucide-react';
import ResultadoTabela from '@/components/ResultadoTabela';
import ResumoGraficos from '@/components/ResumoGraficos';
import { useRouter } from 'next/navigation'; // Importa useRouter

export default function UploadPage() {
  const { data: session } = useSession();
  const [file, setFile] = useState<File | null>(null);
  const [textCNPJs, setTextCNPJs] = useState('');
  const [status, setStatus] = useState('');
  const [resultados, setResultados] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter(); // Inicializa useRouter

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setStatus('');
    }
  };

  const handleSubmit = async () => {
    setStatus('Enviando...');

    const formData = new FormData();
    if (file) formData.append('file', file);
    if (textCNPJs) formData.append('text', textCNPJs);

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();

    if (res.ok) {
      setStatus('Upload concluído!'); // String com 'o'
      setResultados(data.data || []);

      // Enviar CNPJs para a FastAPI (este passo já está correto)
      const cnpjs = (data.data || []).map((e: any) =>
        e.cnpj.replace(/\D/g, '')
      );

      try {
        const resp = await fetch('http://localhost:8000/upload-cnpjs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cnpjs }),
        });

        const rjson = await resp.json();
        if (!resp.ok) throw new Error(rjson.message || rjson.detail);
        console.log('✅ CNPJs enviados à IA FastAPI com sucesso');
      } catch (err: any) {
        console.error('❌ Falha ao enviar CNPJs para IA:', err.message);
        setStatus(`Erro ao enviar para IA: ${err.message}`); // Atualiza status para o usuário
      }
    } else {
      setStatus(`Erro: ${data.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Upload de CNPJs</h1>

        {/* Upload Form */}
        <Card>
          <CardHeader>
            <CardTitle>Enviar Lista de CNPJs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm text-white">Arquivo (.csv ou .xlsx)</Label>
              <div className="flex items-center gap-4">
                <input
                  id="upload-arquivo"
                  type="file"
                  accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                  onChange={handleFileUpload}
                  ref={fileInputRef}
                  className="hidden"
                />
                <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                  📁 Escolher Arquivo
                </Button>
                {file && <span className="text-sm text-white truncate">{file.name}</span>}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Ou cole os CNPJs aqui (separados por ponto e vírgula)</Label>
              <Textarea
                placeholder="00.000.000/0001-00; 11.111.111/1111-11; ..."
                rows={4}
                value={textCNPJs}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setTextCNPJs(e.target.value)}
                className="text-black"
              />
            </div>

            <Button onClick={handleSubmit} className="flex items-center gap-2">
              <UploadCloud className="w-4 h-4" /> Enviar CNPJs
            </Button>

            {status && (
              <p
                className={`text-sm mt-2 flex items-center gap-2 ${
                  // CORRIGIDO: Usando 'concluído' para a verificação
                  status.includes('concluído') ? 'text-green-400' : 'text-red-400'
                }`}
              >
                {status === 'Enviando...' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                    Enviando...
                  </>
                ) : (
                  <>
                    {/* CORRIGIDO: Usando 'concluído' para a verificação do ícone */}
                    {status.includes('concluído') ? '✅' : '❌'} {status}
                  </>
                )}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Resultados */}
        {resultados.length > 0 && (
          <>
            <Separator className="my-6" />

            <Card>
              <CardHeader>
                <CardTitle>Tabela de Empresas Encontradas</CardTitle>
              </CardHeader>
              <CardContent>
                <ResultadoTabela data={resultados} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Análise Gráfica</CardTitle>
              </CardHeader>
              <CardContent>
                <ResumoGraficos data={resultados} />
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button
                onClick={() => {
                  router.push('/dashboard/ia');
                }}
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
              >
                🚀 IA Generator
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
