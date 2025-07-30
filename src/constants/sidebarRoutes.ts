// site/meu-site/src/constants/sidebarRoutes.ts
import { LucideIcon, User, Upload, Brain, Search, TrendingUp } from 'lucide-react'; // Adicione Search e TrendingUp aqui
import type { Route } from 'next';

interface SidebarRoute {
  label: string;
  href: Route;
  icon: LucideIcon;
}

export const sidebarRoutes: SidebarRoute[] = [

  
  {
    label: 'Perfil',
    href: '/dashboard/perfil',
    icon: User,
  },

  {
    label: 'Busca Livre',
    href: '/dashboard/busca_livre', // O caminho que definimos para a página de busca livre
    icon: Search, // Ícone de lupa para busca
  },

  {
    label: 'Upload de CNPJs',
    href: '/dashboard/upload',
    icon: Upload,
  },
  
  {
    label: 'IA Generator',
    href: '/dashboard/ia',
    icon: Brain,
  },
  // NOVOS ITENS ADICIONADOS AQUI

  {
    label: 'Pesquisa de Mercado',
    href: '/dashboard/crescimento_empresas', // O caminho que definimos para a página de crescimento
    icon: TrendingUp, // Ícone de tendência para crescimento
  },
  // FIM DOS NOVOS ITENS
];