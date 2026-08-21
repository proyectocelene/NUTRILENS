import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, RotateCcw } from 'lucide-react';

interface DateNavigatorProps {
  selectedDate: string; // YYYY-MM-DD
  onDateChange: (date: string) => void;
}

export const DateNavigator: React.FC<DateNavigatorProps> = ({ selectedDate, onDateChange }) => {
  const dateInputRef = useRef<HTMLInputElement>(null);

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const dateObj = new Date(selectedDate + 'T00:00:00');
  const isToday = selectedDate === todayStr;

  // Calcular si es ayer o mañana para badges inteligentes
  const yesterdayObj = new Date();
  yesterdayObj.setDate(today.getDate() - 1);
  const isYesterday = selectedDate === yesterdayObj.toISOString().split('T')[0];

  const tomorrowObj = new Date();
  tomorrowObj.setDate(today.getDate() + 1);
  const isTomorrow = selectedDate === tomorrowObj.toISOString().split('T')[0];

  const handlePrevDay = () => {
    const d = new Date(selectedDate + 'T00:00:00');
    d.setDate(d.getDate() - 1);
    onDateChange(d.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate + 'T00:00:00');
    d.setDate(d.getDate() + 1);
    onDateChange(d.toISOString().split('T')[0]);
  };

  const handleSetToday = () => {
    onDateChange(todayStr);
  };

  // Formateo corto para móvil y completo para pantallas grandes
  const weekdayShort = dateObj.toLocaleDateString('es-ES', { weekday: 'short' });
  const weekdayLong = dateObj.toLocaleDateString('es-ES', { weekday: 'long' });
  const dayNum = dateObj.getDate();
  const monthShort = dateObj.toLocaleDateString('es-ES', { month: 'short' });
  const monthLong = dateObj.toLocaleDateString('es-ES', { month: 'long' });
  const year = dateObj.getFullYear();

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-2 sm:p-3 shadow-xs transition-all">
      <div className="flex items-center justify-between gap-1.5 sm:gap-3">
        {/* Botón Día Anterior */}
        <button
          onClick={handlePrevDay}
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-50 hover:bg-slate-100 active:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-200 flex items-center justify-center transition-all shrink-0 active:scale-95"
          aria-label="Día anterior"
          title="Día anterior"
        >
          <ChevronLeft size={18} />
        </button>

        {/* Zona Central Interactiva: Fecha + Selector de Calendario */}
        <div className="relative flex-1 flex items-center justify-center min-w-0">
          <button
            type="button"
            onClick={() => dateInputRef.current?.showPicker ? dateInputRef.current.showPicker() : dateInputRef.current?.click()}
            className="group flex items-center justify-center gap-1.5 sm:gap-2 py-1.5 px-2 sm:px-4 rounded-xl hover:bg-slate-50 active:bg-slate-100 transition-all text-center min-w-0 max-w-full"
            title="Toca para elegir fecha en el calendario"
          >
            {/* Badge de Hoy / Ayer / Mañana */}
            {isToday ? (
              <span className="text-[10px] sm:text-[11px] font-extrabold px-1.5 sm:px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0 uppercase tracking-wide">
                Hoy
              </span>
            ) : isYesterday ? (
              <span className="text-[10px] sm:text-[11px] font-bold px-1.5 sm:px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 shrink-0 capitalize">
                Ayer
              </span>
            ) : isTomorrow ? (
              <span className="text-[10px] sm:text-[11px] font-bold px-1.5 sm:px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 border border-sky-200 shrink-0 capitalize">
                Mañana
              </span>
            ) : null}

            {/* Texto de Fecha Responsivo */}
            <div className="flex flex-col sm:flex-row items-center sm:gap-1.5 min-w-0">
              {/* Vista Móvil (Compacta y sin desbordes) */}
              <span className="sm:hidden text-xs font-bold text-slate-900 capitalize truncate">
                {weekdayShort}, {dayNum} {monthShort}
              </span>

              {/* Vista Desktop (Completa) */}
              <span className="hidden sm:inline text-sm font-bold text-slate-900 capitalize">
                {weekdayLong}, {dayNum} de {monthLong} de {year}
              </span>
            </div>

            {/* Icono de calendario decorativo que indica que es interactivo */}
            <div className="w-6 h-6 rounded-lg bg-emerald-50 group-hover:bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center justify-center shrink-0 transition-colors">
              <CalendarIcon size={12} />
            </div>
          </button>

          {/* Input date nativo invisible superpuesto para máxima compatibilidad móvil */}
          <input
            ref={dateInputRef}
            type="date"
            value={selectedDate}
            onChange={(e) => e.target.value && onDateChange(e.target.value)}
            className="absolute inset-0 opacity-0 w-full h-full cursor-pointer pointer-events-auto z-10"
            aria-label="Seleccionar fecha"
          />
        </div>

        {/* Acciones del lado derecho: Ir a Hoy (si aplica) + Botón Día Siguiente */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {!isToday && (
            <button
              onClick={handleSetToday}
              className="h-9 sm:h-10 px-2 sm:px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 active:bg-emerald-200 text-emerald-800 border border-emerald-200 text-[11px] font-bold flex items-center gap-1 transition-all active:scale-95 shadow-xs"
              title="Volver a la fecha de hoy"
            >
              <RotateCcw size={12} className="shrink-0" />
              <span className="hidden sm:inline">Hoy</span>
            </button>
          )}

          <button
            onClick={handleNextDay}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-50 hover:bg-slate-100 active:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-200 flex items-center justify-center transition-all shrink-0 active:scale-95"
            aria-label="Día siguiente"
            title="Día siguiente"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
