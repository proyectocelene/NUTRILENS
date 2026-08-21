import React, { useEffect, useState } from 'react';
import { PlusCircle, Clipboard, FileCode, Wifi, WifiOff, Download, Check, Sparkles, Menu } from 'lucide-react';
import { Button } from '../common/Button';
import { JSON_BLANK_SCHEMA_TEMPLATE } from '../../db/seedData';
import { NavView } from './Navigation';
import { NavigationDrawer } from './NavigationDrawer';

interface HeaderProps {
  onOpenJsonModal: () => void;
  onOpenSchemaGuide: () => void;
  onFastPaste: () => void;
  onInstallClick?: () => void;
  canInstall?: boolean;
  currentView?: NavView;
  onViewChange?: (view: NavView) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenJsonModal,
  onOpenSchemaGuide,
  onFastPaste,
  onInstallClick,
  canInstall = false,
  currentView = 'day',
  onViewChange
}) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [copiedFormat, setCopiedFormat] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleCopyBlankFormat = () => {
    navigator.clipboard.writeText(JSON_BLANK_SCHEMA_TEMPLATE);
    setCopiedFormat(true);
    setTimeout(() => setCopiedFormat(false), 2000);
  };

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-xl border-b border-slate-200 px-3 sm:px-8 py-2.5 sm:py-3.5 transition-all shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4 min-w-0">
          {/* Menú Hamburguesa & Logo */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setIsDrawerOpen(true)}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-950 transition-colors border border-slate-200 shrink-0"
              title="Abrir menú de navegación"
            >
              <Menu size={18} />
            </button>

            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 p-0.5 shadow-md shadow-emerald-500/20 flex items-center justify-center shrink-0">
              <div className="w-full h-full bg-white rounded-[10px] sm:rounded-[14px] flex items-center justify-center">
                <span className="text-lg sm:text-xl font-black bg-gradient-to-tr from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  N
                </span>
              </div>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900 flex items-center gap-1.5 truncate">
                  NutriLens
                  <span className="text-[9px] sm:text-[10px] font-extrabold px-1.5 py-0.2 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0">
                    PWA
                  </span>
                </h1>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block truncate">
                Analizador Nutricional Inteligente & Banco de Recetas
              </p>
            </div>
          </div>

        {/* Acciones principales */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Indicador de estado Offline/Online */}
          <div
            title={isOnline ? 'Conexión activa' : 'Modo Offline (IndexedDB Activo)'}
            className={`hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
              isOnline
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-amber-50 text-amber-800 border-amber-200'
            }`}
          >
            {isOnline ? <Wifi size={13} /> : <WifiOff size={13} />}
            <span>{isOnline ? 'Online' : 'Offline'}</span>
          </div>

          {/* Botón: Ver / Copiar Formato JSON Estructurado */}
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenSchemaGuide}
            icon={<FileCode size={14} className="text-emerald-600" />}
            title="Ver y copiar la plantilla JSON que debes llenar"
            className="hidden sm:inline-flex"
          >
            <span className="hidden md:inline">Ver / Copiar</span> Formato JSON
          </Button>

          {/* Botón Rápido: Pegar JSON desde Portapapeles */}
          <Button
            variant="secondary"
            size="sm"
            onClick={onFastPaste}
            icon={<Clipboard size={14} className="text-slate-700" />}
            title="Pegar JSON directamente desde tu portapapeles"
            className="px-2.5 sm:px-3 text-xs"
          >
            <span>Pegar</span> <span className="hidden sm:inline">JSON</span>
          </Button>

          {/* Botón Maestro: Ingerir con IA / JSON */}
          <Button
            variant="primary"
            size="sm"
            onClick={onOpenJsonModal}
            icon={<Sparkles size={14} />}
            className="shadow-sm shadow-emerald-600/20 px-2.5 sm:px-3 text-xs"
          >
            <span className="hidden sm:inline">+ Ingerir con IA</span>
            <span className="sm:hidden">+ IA / Comida</span>
          </Button>
        </div>
      </div>
    </header>

    <NavigationDrawer
      isOpen={isDrawerOpen}
      onClose={() => setIsDrawerOpen(false)}
      currentView={currentView}
      onViewSelect={(v) => {
        if (onViewChange) onViewChange(v);
      }}
      onOpenAiModal={onOpenJsonModal}
    />
  </>
);
};
