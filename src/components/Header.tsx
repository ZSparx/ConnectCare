import { Car, Globe2, Shield } from 'lucide-react';

type View = 'dashboard' | 'apply' | 'recruitment' | 'privacy';

type Props = {
  onNavigate?: (view: View) => void;
};

export default function Header({ onNavigate }: Props) {
  return (
    <header className="bg-slate-950/80 border-b border-white/8 backdrop-blur-sm sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-sky-500 rounded-lg flex items-center justify-center shadow-lg shadow-sky-500/30">
            <Car size={18} className="text-white" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-white font-bold text-lg tracking-tight">Connect</span>
            <span className="text-sky-400 font-bold text-lg tracking-tight">Care</span>
          </div>
          <span className="hidden sm:block ml-2 px-2 py-0.5 bg-sky-500/10 border border-sky-500/20 rounded-md text-xs font-medium text-sky-400 tracking-wide">
            CALL CENTER
          </span>
        </div>

        <div className="flex items-center gap-1">
          {onNavigate && (
            <>
              <button
                onClick={() => onNavigate('recruitment')}
                className="flex items-center gap-1.5 px-3 py-2 text-slate-400 hover:text-white text-sm font-medium transition-colors"
              >
                <Globe2 size={15} />
                <span className="hidden sm:inline">Become an Agent</span>
              </button>
              <button
                onClick={() => onNavigate('privacy')}
                className="flex items-center gap-1.5 px-3 py-2 text-slate-400 hover:text-white text-sm font-medium transition-colors"
              >
                <Shield size={15} />
                <span className="hidden sm:inline">Privacy</span>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
