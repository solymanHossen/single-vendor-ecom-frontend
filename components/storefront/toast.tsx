import { Leaf, X } from 'lucide-react';

export function Toast({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  return (
    <div className="fixed bottom-6 right-6 z-[60] flex items-center gap-3 bg-primary text-primary-foreground px-5 py-3.5 rounded-2xl shadow-2xl border border-primary-foreground/10 transition-all">
      <Leaf className="w-5 h-5 text-primary-foreground/80" />
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onDismiss} className="ml-2 hover:opacity-75">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
