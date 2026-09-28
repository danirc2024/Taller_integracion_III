import type { ReactNode } from 'react';

interface MockShellProps {
  sprint: 'Sprint 2' | 'Sprint 3';
  children: ReactNode;
}

export default function MockShell({ sprint, children }: MockShellProps) {
  return (
    <div className="relative h-full flex flex-col">
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none border-b border-amber-300 bg-amber-100/95 px-3 py-1.5 text-center text-xs font-medium text-amber-900 backdrop-blur-sm relative z-0"
      >
         Vista previa · Esta funcionalidad estará disponible en el {sprint}
      </div>
      <div className="flex-1 flex flex-col">
        {children}
      </div>
    </div>
  );
}