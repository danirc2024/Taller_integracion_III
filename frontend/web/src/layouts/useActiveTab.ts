import { useLocation } from 'react-router-dom';

export type ActiveTab = 'dashboard' | 'chat' | 'history' | 'route' | 'profile' | 'colaborador';

export function useActiveTab(): ActiveTab {
  const { pathname } = useLocation();
  if (pathname.startsWith('/chat')) return 'chat';
  if (pathname.startsWith('/history')) return 'history';
  if (pathname.startsWith('/route')) return 'route';
  if (pathname.startsWith('/colaborador')) return 'colaborador';
  if (pathname.startsWith('/profile')) return 'profile';
  return 'dashboard';
}