import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ROUTES, MOCK_ROUTES } from '@/core/routes';

// Layouts
import {MainLayout} from '@/layouts/MainLayout';
import AppShell from '@/layouts/AppShell';

// Sprint 1 — vistas funcionales
import Home from '@/pages/Home';
import Dashboard from '@/pages/Dashboard';
import ProductDetail from '@/pages/ProductDetail';
import Login from '@/pages/Login';
import Onboarding from '@/pages/Onboarding';
import Profile from '@/pages/Profile';
import NotFound from '@/pages/NotFound';

// Sprint 2+ — componentes ya construidos, envueltos como mock
import Chatbot from '@/pages/Chatbot';
import Crowdsourcing from '@/pages/Crowdsourcing';
import RouteViewer from '@/pages/RouteViewer';
import History from '@/pages/History';
import MockShell from '@/pages/mocks/MockShell';

const chatSprint = MOCK_ROUTES[ROUTES.CHAT];
const colabSprint = MOCK_ROUTES[ROUTES.COLABORADOR];
const rutaSprint = MOCK_ROUTES[ROUTES.RUTA];
const histSprint = MOCK_ROUTES[ROUTES.HISTORIAL];

const router = createBrowserRouter([
  // ───────────────────────────────────────────────────────────
  // Grupo A: MainLayout (TopNav + SideBar + BottomNav)
  // Para vistas que se benefician del buscador y filtros por supermercado
  // ───────────────────────────────────────────────────────────
  {
    element: <MainLayout />,
    children: [
      // Sprint 1
      { path: ROUTES.HOME, element: <Home /> },
      { path: ROUTES.CATALOGO, element: <Dashboard /> },
      { path: '/producto/:id', element: <ProductDetail /> },

      // Sprint 2+ (con SideBar disponible)
      {
        path: ROUTES.CHAT,
        element: (
          <MockShell sprint={chatSprint}>
            <Chatbot />
          </MockShell>
        ),
      },
    ],
  },

  // ───────────────────────────────────────────────────────────
  // Grupo B: AppShell (BottomNav + página con header propio)
  // ───────────────────────────────────────────────────────────
  {
    element: <AppShell />,
    children: [
      { path: ROUTES.PERFIL, element: <Profile /> },
      {
        path: ROUTES.COLABORADOR,
        element: (
          <MockShell sprint={colabSprint}>
            <Crowdsourcing />
          </MockShell>
        ),
      },
      {
        path: ROUTES.RUTA,
        element: (
          <MockShell sprint={rutaSprint}>
            <RouteViewer />
          </MockShell>
        ),
      },
      {
        path: ROUTES.HISTORIAL,
        element: (
          <MockShell sprint={histSprint}>
            <History />
          </MockShell>
        ),
      },
    ],
  },

  // ───────────────────────────────────────────────────────────
  // Grupo C: sin layout (pantalla completa)
  // ───────────────────────────────────────────────────────────
  { path: ROUTES.LOGIN, element: <Login /> },
  { path: ROUTES.ONBOARDING, element: <Onboarding /> },

  // Catch-all
  { path: '*', element: <NotFound /> },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}