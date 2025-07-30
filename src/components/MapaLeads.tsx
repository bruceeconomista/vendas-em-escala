// components/MapaLeads.tsx
'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
// A linha 'import 'leaflet/dist/leaflet.css';' foi removida daqui e deve estar em src/app/globals.css

// Importa a interface Empresa de ResultadoTabela para garantir consistência de tipos
import { Empresa } from '@/components/ResultadoTabela'; 

// Corrigir problema de ícones padrão do Leaflet
// Isso é necessário porque o Webpack do Next.js pode não carregar as imagens de ícone padrão do Leaflet corretamente.
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
});

type Props = {
  leads: Empresa[]; // Agora usa a interface Empresa
};

export default function MapaLeads({ leads }: Props) {
  // Garantir que 'center' seja sempre uma tupla [number, number]
  // Se leads estiver vazio ou as coordenadas não forem válidas, usa um valor padrão.
  const center: [number, number] =
    leads.length > 0 && typeof leads[0].latitude === 'number' && typeof leads[0].longitude === 'number'
      ? [leads[0].latitude, leads[0].longitude]
      : [-23.55052, -46.63331]; // Coordenadas padrão para São Paulo, por exemplo.

  return (
    <MapContainer center={center} zoom={6} scrollWheelZoom style={{ height: '600px', width: '100%' }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {leads.map((lead, i) => (
        // Verificar se latitude e longitude são números válidos antes de criar o Marker
        typeof lead.latitude === 'number' && typeof lead.longitude === 'number' && (
          <Marker key={i} position={[lead.latitude, lead.longitude]}>
            <Popup>
              {/* Conteúdo do popup com as informações solicitadas */}
              {/* Exibe a Razão Social */}
              <b>Razão Social: {lead.razao_social_normalizado || 'Empresa sem nome'}</b>
              <br/>
              {/* Exibe o Nome Fantasia Normalizado se disponível */}
              {lead.nome_fantasia_normalizado && (
                <>
                  <b>Nome Fantasia: {lead.nome_fantasia_normalizado}</b>
                  <br/>
                </>
              )}
              {/* Usando municipio_normalizado e uf_normalizado para consistência */}
              Cidade/UF: {lead.municipio_normalizado || 'N/A'}/{lead.uf_normalizado || 'N/A'}<br/>
              Capital: R$ {lead.capital_social?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || 'N/A'}<br/>
              Sócios: {lead.qtde_socios || 'N/A'}
            </Popup>
          </Marker>
        )
      ))}
    </MapContainer>
  );
}
