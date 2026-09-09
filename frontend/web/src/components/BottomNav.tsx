import React from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Clock, Map, User, Users, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BottomNavProps {
  active: 'dashboard' | 'chat' | 'history' | 'route' | 'profile' | 'colaborador';
}

export default function BottomNav({ active }: BottomNavProps) {
  const navItems = [
    { id: 'dashboard', label: 'Inicio', icon: Home, to: '/dashboard' },
    { id: 'chat', label: 'Chat IA', icon: MessageSquare, to: '/chat' },
    { id: 'history', label: 'Listas', icon: Clock, to: '/history' },
    { id: 'route', label: 'Ruta', icon: Map, to: '/route' },
    { id: 'colaborador', label: 'Misiones', icon: Users, to: '/colaborador' },
    { id: 'profile', label: 'Perfil', icon: User, to: '/profile' }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-900 pb-safe z-50">
      <nav className="flex items-center justify-around px-2 h-16 max-w-lg mx-auto">
        {navItems.map(item => {
          const isActive = active === item.id;
          return (
            <Link 
              key={item.id} 
              to={item.to}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors",
                isActive ? "text-emerald-600 dark:text-emerald-400" : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300"
              )}
            >
              <item.icon className={cn("h-5 w-5", isActive && "fill-current/20 stroke-[2.5px]")} />
              <span className={cn("text-[10px]", isActive ? "font-bold" : "font-medium")}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
