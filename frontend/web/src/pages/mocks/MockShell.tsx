import type { ReactNode } from 'react';

interface MockShellProps {
  sprint: 'Sprint 2' | 'Sprint 3';
  children: ReactNode;
}

export default function MockShell({ sprint, children }: MockShellProps) {
  return (
    <div className="relative">
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none inset-x-0 top-0 z-[9999] border-b border-amber-300 bg-amber-100/95 px-3 py-1.5 text-center text-xs font-medium text-amber-900 backdrop-blur-sm"
      >
         Vista previa · Esta funcionalidad estará disponible en el {sprint}
      </div>
      {children}
    </div>
  );
}