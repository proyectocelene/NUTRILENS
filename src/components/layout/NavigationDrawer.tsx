import React from 'react';
import { 
  X, 
  Calendar, 
  Target, 
  ShoppingCart, 
  BarChart2, 
  BookOpen, 
  Settings, 
  Sparkles, 
  Flame, 
  Database,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { NavView } from './Navigation';
import { Badge } from '../common/Badge';

interface NavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentView: NavView;
  onViewSelect: (view: NavView) => void;
  onOpenAiModal: () => void;
}

export const NavigationDrawer: React.FC<NavigationDrawerProps> = ({
  isOpen,
  onClose,
  currentView,
  onViewSelect,
  onOpenAiModal
}) => {
  if (!isOpen) return null;

  const handleSelect = (view: NavView) => {
    onViewSelect(view);
    onClose();
  };

  const navItems: { id: NavView; label: string; description: string; icon: any; badge?: string; badgeVariant?: 'emerald' | 'amber' | 'purple' | 'blue' }[] = [
    {
      id: 'day',
      label: 'Diario de Hoy',
      description: 'Ingesta de hoy, balance de macros y diagnóstico nutricional',
      icon: Calendar,
      badge: 'Hoy',
      badgeVariant: 'emerald'
    },
    {
      id: 'canonical',
      label: 'Banco Canónico & Etiquetas',
      description: 'Tus alimentos exactos, escáner de etiquetas e información de marcas',
      icon: Database,
      badge: 'IA Exacta',
      badgeVariant: 'emerald'
    },
    {
      id: 'recomposition',
      label: 'Plan de Recomposición & Fases',
      description: 'Medidor de progreso, metas antropométricas y cambio a Fase 2',
      icon: Target,
      badge: 'Fase 1',
      badgeVariant: 'purple'
    },
    {
      id: 'groceries',
      label: 'Plan Semanal & Supermercado',
      description: 'Grupos de alimentos (animal, verduras, frutas) y lista de compras',
      icon: ShoppingCart,
      badge: 'Súper',
      badgeVariant: 'blue'
    },
    {
      id: 'analytics',
      label: 'Estadísticas & Tendencias',
      description: 'Gráficos de evolución semanal, calorías acumuladas y promedios',
      icon: BarChart2
    },
    {
      id: 'recipes',
      label: 'Banco de Recetas & Biblioteca',
      description: 'Tus platos frecuentes para repetir ingestas con 1 toque',
      icon: BookOpen
    },
    {
      id: 'settings',
      label: 'Ajustes & Conexión Firebase',
      description: 'Configuración de Gemini AI, Firestore Cloud, metas y respaldos',
      icon: Settings
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-fadeIn"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-xs sm:max-w-sm bg-white h-full shadow-2xl z-10 flex flex-col justify-between overflow-y-auto animate-slideInLeft">
        <div>
          {/* Header del Drawer */}
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-slate-900 to-slate-800 text-white">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 flex items-center justify-center">
                <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center font-black text-emerald-400">
                  N
                </div>
              </div>
              <div>
                <h3 className="text-sm font-black tracking-tight">NutriLens PWA</h3>
                <p className="text-[10px] text-slate-400">Navegación & Herramientas</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Botón Destacado de IA */}
          <div className="p-3">
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenAiModal();
              }}
              className="w-full p-3 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white text-left shadow-md shadow-emerald-700/20 hover:brightness-105 active:scale-98 transition-all flex items-center justify-between"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-white/20">
                  <Sparkles size={18} />
                </div>
                <div>
                  <span className="text-xs font-black block">Ingerir con Asistente IA</span>
                  <span className="text-[10px] text-emerald-100 block">Texto, fotos de platos o voz</span>
                </div>
              </div>
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Lista de Navegación */}
          <div className="px-2 py-1 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.id)}
                  className={`w-full p-3 rounded-2xl text-left transition-all flex items-start justify-between gap-2 border ${
                    isActive
                      ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950 font-bold shadow-2xs'
                      : 'hover:bg-slate-50 border-transparent text-slate-700'
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className={`p-2 rounded-xl shrink-0 ${
                      isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                    }`}>
                      <Icon size={18} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold truncate block">{item.label}</span>
                        {item.badge && (
                          <Badge variant={item.badgeVariant || 'slate'} size="sm">
                            {item.badge}
                          </Badge>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">{item.description}</p>
                    </div>
                  </div>

                  <ChevronRight size={15} className={`shrink-0 mt-2 ${isActive ? 'text-emerald-700' : 'text-slate-400'}`} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer del Drawer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 text-[11px] text-slate-500 space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-slate-700">
            <ShieldCheck size={14} className="text-emerald-600" />
            <span>NutriLens PWA v1.2</span>
          </div>
          <p className="text-[10px] leading-tight text-slate-400">
            IndexedDB Offline-First + Firebase Cloud Firestore + Gemini Multimodal AI.
          </p>
        </div>
      </div>
    </div>
  );
};
