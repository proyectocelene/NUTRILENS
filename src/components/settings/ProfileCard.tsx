import React, { useState } from 'react';
import { Dumbbell, Check, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { NutritionGoals } from '../../types/nutrition.types';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { dbService } from '../../db/dbService';
import { parseMealJson } from '../../services/jsonParser';
import { SAMPLE_JSON_TEMPLATES } from '../../db/seedData';

interface ProfileCardProps {
  goals: NutritionGoals;
  onRefreshDate?: () => void;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({ goals, onRefreshDate }) => {
  const [loadedMenuSuccess, setLoadedMenuSuccess] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const profile = goals.profile;

  const handleLoadFullDayMenu = async () => {
    setIsImporting(true);
    try {
      const templates = [
        SAMPLE_JSON_TEMPLATES[0], // Desayuno Post-Entreno
        SAMPLE_JSON_TEMPLATES[1], // Almuerzo
        SAMPLE_JSON_TEMPLATES[2]  // Cena
      ];

      for (const tmpl of templates) {
        const parsed = parseMealJson(tmpl.json);
        if (parsed.success && parsed.meal) {
          await dbService.addMeal(parsed.meal, true);
        }
      }

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.7 },
        colors: ['#059669', '#0284C7', '#D97706']
      });

      setLoadedMenuSuccess(true);
      setTimeout(() => setLoadedMenuSuccess(false), 3000);

      if (onRefreshDate) {
        onRefreshDate();
      }
    } catch (err) {
      console.error('Error cargando menú del plan:', err);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50/70 via-white to-teal-50/30 relative overflow-hidden shadow-xs">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="space-y-2">
          <div className="flex items-start sm:items-center gap-2.5 min-w-0">
            <div className="p-2.5 rounded-2xl bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0">
              <Dumbbell size={22} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-0.5">
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900 truncate">Plan de Recomposición</h3>
                <Badge variant="emerald" size="sm">Fase 1: Base</Badge>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-600 truncate">
                1.74 m • 26 años • BMR: 1,702 kcal • Déficit ~500 kcal
              </p>
            </div>
          </div>

          {/* Grid de Medidas Clave */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
            <div className="p-2 sm:p-2.5 rounded-xl bg-white border border-slate-200 shadow-xs min-w-0">
              <span className="text-[10px] text-slate-500 block font-medium truncate">Peso Actual / Meta</span>
              <span className="text-[11px] sm:text-xs font-bold text-slate-900 font-mono block truncate">
                {profile?.currentWeightKg || 78.35}kg <span className="text-emerald-700">→ {profile?.targetWeightKg || 71.0}kg</span>
              </span>
            </div>

            <div className="p-2 sm:p-2.5 rounded-xl bg-white border border-slate-200 shadow-xs min-w-0">
              <span className="text-[10px] text-slate-500 block font-medium truncate">% Grasa / Visceral</span>
              <span className="text-[11px] sm:text-xs font-bold text-amber-800 font-mono block truncate">
                {profile?.bodyFatPct || 24.4}% <span className="text-slate-500 font-normal">| Niv {profile?.visceralFatLevel || 11.5}</span>
              </span>
            </div>

            <div className="p-2 sm:p-2.5 rounded-xl bg-white border border-slate-200 shadow-xs min-w-0">
              <span className="text-[10px] text-slate-500 block font-medium truncate">Cintura Ombligo</span>
              <span className="text-[11px] sm:text-xs font-bold text-slate-900 font-mono block truncate">
                {profile?.currentWaistInches || 38.5}" <span className="text-emerald-700">→ {profile?.targetWaistInches || 32.0}"</span>
              </span>
            </div>

            <div className="p-2 sm:p-2.5 rounded-xl bg-white border border-slate-200 shadow-xs min-w-0">
              <span className="text-[10px] text-slate-500 block font-medium truncate">Agua & Creatina</span>
              <span className="text-[11px] sm:text-xs font-bold text-sky-700 font-mono block truncate">
                {goals.waterLiters || 3.5}L <span className="text-purple-700 font-normal">+ 5g Creatina</span>
              </span>
            </div>
          </div>
        </div>

        {/* Acción Rápida: Cargar el Menú Estructurado de 3 Comidas */}
        <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end gap-1.5 shrink-0 pt-2 lg:pt-0">
          <Button
            variant="primary"
            size="sm"
            onClick={handleLoadFullDayMenu}
            disabled={isImporting}
            icon={loadedMenuSuccess ? <Check size={15} /> : <Sparkles size={15} />}
            className="w-full sm:w-auto shadow-sm text-xs py-2 px-3"
          >
            {loadedMenuSuccess ? '¡3 Comidas Cargadas!' : 'Cargar Menú 3 Comidas (2,200 kcal)'}
          </Button>

          <span className="text-[10px] text-slate-500 text-center lg:text-right">
            175g P • 245g C • 58g F
          </span>
        </div>
      </div>
    </Card>
  );
};
