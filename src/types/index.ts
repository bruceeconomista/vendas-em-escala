// src/types/index.ts

export type Lead = {
  latitude: number;
  longitude: number;
  cnpj: string;
  razao_social: string;
  nome_fantasia: string | null;
  capital_social: number;
  qtde_socios: number;
  municipio: string | null;
  uf: string | null;
};
