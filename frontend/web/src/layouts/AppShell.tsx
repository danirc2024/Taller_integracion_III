import { Outlet, useLocation } from 'react-router-dom';
import BottomNav from '@/components/BottomNav';

type ActiveTab = 'dashboard' | 'chat' | 'history' | 'route' | 'profile' | 'colaborador';

function deriveActive(pathname: string): ActiveTab {
  if (pathname.startsWith('/chat')) return 'chat';
  if (pathname.startsWith('/history')) return 'history';
  if (pathname.startsWith('/route')) return 'route';
  if (pathname.startsWith('/colaborador')) return 'colaborador';
  if (pathname.startsWith('/profile')) return 'profile';
  return 'dashboard';
}

export default function AppShell() {
  const { pathname } = useLocation();
  return (
    <>
      <Outlet />
      <BottomNav active={deriveActive(pathname)} />
    </>
  );
}