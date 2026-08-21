import React, { useState, useEffect } from 'react';
import { Download, X, Sparkles } from 'lucide-react';
import { Button } from '../common/Button';

export const PwaInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  if (!showPrompt) return null;

  return (
    <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-white border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-200">
          <Sparkles size={20} />
        </div>
        <div>
          <h4 className="text-xs font-bold text-slate-900">Instala NutriLens como App en tu dispositivo</h4>
          <p className="text-[11px] text-slate-600">
            Acceso instantáneo con 1 toque desde tu pantalla de inicio, 100% offline y sin ocupar espacio.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
        <Button variant="primary" size="sm" onClick={handleInstall} icon={<Download size={14} />}>
          Instalar PWA
        </Button>
        <button
          onClick={() => setShowPrompt(false)}
          className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          aria-label="Cerrar"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};
