// src/components/post-details/ErrorState.tsx
import { Button } from '@/components/ui/button';

interface ErrorStateProps {
  onNavigateBack: () => void;
}

export function ErrorState({ onNavigateBack }: ErrorStateProps) {
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-md flex items-center justify-center">
      <div className="text-center p-8 bg-slate-800 rounded-xl border border-slate-700 max-w-md">
        <h3 className="text-2xl font-bold text-slate-100 mb-2">Post não encontrado</h3>
        <p className="text-slate-400 mb-6">O post que você está procurando não existe ou foi removido.</p>
        <Button onClick={onNavigateBack} className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-[#ff3131] to-red-600 rounded-lg text-white font-medium hover:from-[#ff3131]/90 hover:to-red-600/90 transition-all">
          Voltar ao Feed
        </Button>
      </div>
    </div>
  );
}