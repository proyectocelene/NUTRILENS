import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { MessageSquareHeart, Check, Sparkles, AlertCircle, Save, Flame, Droplets, Zap, ShieldCheck, Bell } from 'lucide-react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { db } from '../../db';
import { dbService } from '../../db/dbService';
import { DbDailyLog, ReflectionReasonTag } from '../../types/db.types';
import { awardXp, unlockAchievement } from '../../services/gamificationService';

interface DailyReflectionCardProps {
  date: string;
  isGoalsMet?: boolean;
}

const REASON_TAGS: { id: ReflectionReasonTag; label: string; emoji: string }[] = [
  { id: 'perfect_day', label: 'Día Perfecto al 100%', emoji: '🌟' },
  { id: 'time_busy', label: 'Falta de tiempo / Trabajo', emoji: '⏳' },
  { id: 'social_event', label: 'Comida fuera / Social', emoji: '🍕' },
  { id: 'intense_workout', label: 'Entreno intenso (hambre extra)', emoji: '🏋️' },
  { id: 'low_appetite', label: 'Poco apetito / Sin hambre', emoji: '📉' },
  { id: 'cravings', label: 'Antojo dulce o salado', emoji: '🍫' },
  { id: 'forgot_supplements', label: 'Olvidé suplementos', emoji: '💊' },
  { id: 'eating_out', label: 'Comí en restaurante', emoji: '🍱' },
  { id: 'other', label: 'Otro motivo', emoji: '📝' }
];

export const DailyReflectionCard: React.FC<DailyReflectionCardProps> = ({ date, isGoalsMet }) => {
  const dailyLog = useLiveQuery(async () => {
    return await dbService.getDailyLog(date);
  }, [date]);

  const [selectedTags, setSelectedTags] = useState<ReflectionReasonTag[]>(['perfect_day']);
  const [reflectionNotes, setReflectionNotes] = useState('');
  const [creatineTaken, setCreatineTaken] = useState(false);
  const [waterMl, setWaterMl] = useState(2500);
  const [isSaved, setIsSaved] = useState(false);

  const isFilledToday = !!(dailyLog?.reasonTag || dailyLog?.reflectionNotes);

  useEffect(() => {
    if (dailyLog) {
      if (dailyLog.reasonTag) {
        // Soporte para tags separados por coma o únicos
        const tags = dailyLog.reasonTag.split(',') as ReflectionReasonTag[];
        setSelectedTags(tags);
      } else {
        setSelectedTags(['perfect_day']);
      }
      setReflectionNotes(dailyLog.reflectionNotes || dailyLog.notes || '');
      setCreatineTaken(!!dailyLog.creatineTaken);
      setWaterMl(dailyLog.waterMl || 2500);
    } else {
      setSelectedTags(['perfect_day']);
      setReflectionNotes('');
      setCreatineTaken(false);
      setWaterMl(2500);
    }
    setIsSaved(false);
  }, [dailyLog, date]);

  const handleToggleTag = (tagId: ReflectionReasonTag) => {
    if (selectedTags.includes(tagId)) {
      if (selectedTags.length > 1) {
        setSelectedTags(selectedTags.filter(t => t !== tagId));
      }
    } else {
      if (tagId === 'perfect_day') {
        setSelectedTags(['perfect_day']);
      } else {
        setSelectedTags([...selectedTags.filter(t => t !== 'perfect_day'), tagId]);
      }
    }
  };

  const handleSaveReflection = async () => {
    const combinedTag = selectedTags.join(',') as ReflectionReasonTag;
    const updatedLog: DbDailyLog = {
      id: dailyLog?.id || `log_${date}`,
      date,
      reasonTag: combinedTag,
      reflectionNotes,
      creatineTaken,
      waterMl,
      completedGoals: isGoalsMet
    };

    await dbService.updateDailyLog(updatedLog);

    awardXp(30, 'Reflexión Diaria de Hábitos');
    unlockAchievement('biofeedback_master');
    if (creatineTaken) {
      unlockAchievement('creatine_habit');
    }

    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <Card className={`border transition-all shadow-xs ${
      isFilledToday ? 'border-slate-200 bg-white' : 'border-purple-300 bg-gradient-to-br from-purple-50/40 via-white to-indigo-50/20 ring-2 ring-purple-500/10'
    }`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-purple-50 text-purple-700 border border-purple-200">
            <MessageSquareHeart size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-bold text-slate-900">Diario de Hábitos & Motivos del Día</h3>
              <Badge variant={isFilledToday ? 'purple' : 'amber'} size="sm">
                {isFilledToday ? '+30 XP Ganados' : '🔔 Completa tu día (+30 XP)'}
              </Badge>
            </div>
            <p className="text-xs text-slate-500">
              {isFilledToday 
                ? 'Reflexión registrada. Puedes actualizarla cuando quieras.' 
                : 'Registra cómo fue tu adherencia hoy para detectar patrones y optimizar tus resultados.'}
            </p>
          </div>
        </div>

        {/* Check de Creatina */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <label className="flex items-center gap-1 text-xs font-semibold text-purple-900 bg-purple-50 hover:bg-purple-100 px-2.5 py-1 rounded-xl border border-purple-200 cursor-pointer transition-colors select-none">
            <input
              type="checkbox"
              checked={creatineTaken}
              onChange={(e) => setCreatineTaken(e.target.checked)}
              className="w-3.5 h-3.5 rounded text-purple-600 focus:ring-purple-500"
            />
            <Zap size={13} className="text-purple-600" />
            <span>Creatina 5g</span>
          </label>
        </div>
      </div>

      <div className="space-y-3 pt-1">
        {/* Selector Múltiple de Motivos */}
        <div>
          <span className="text-[11px] font-bold text-slate-700 block mb-1.5">
            ¿Cómo describirías el cumplimiento de tus macros hoy? <span className="text-slate-400 font-normal">(Selección múltiple)</span>
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
            {REASON_TAGS.map((tag) => {
              const isSelected = selectedTags.includes(tag.id);
              return (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => handleToggleTag(tag.id)}
                  className={`py-1.5 px-2 rounded-xl text-xs flex items-center justify-start sm:justify-center gap-1.5 transition-all border text-left ${
                    isSelected
                      ? 'bg-purple-100 text-purple-950 font-bold border-purple-400 shadow-2xs'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200'
                  }`}
                >
                  <span>{tag.emoji}</span>
                  <span className="truncate">{tag.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Notas y Plan para Mañana */}
        <div>
          <label className="text-[11px] font-bold text-slate-700 block mb-1">
            Reflexión personal / Ajustes para mañana:
          </label>
          <textarea
            value={reflectionNotes}
            onChange={(e) => setReflectionNotes(e.target.value)}
            rows={2}
            placeholder="Ej: 'Hoy me costó llegar a la proteína porque almorcé fuera, mañana prepararé pechuga extra'..."
            className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl p-2.5 focus:outline-none focus:border-purple-500 font-medium leading-relaxed"
          />
        </div>

        {/* Guardar */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <span className="text-[11px] text-slate-500">
            {isFilledToday ? 'Última reflexión guardada' : '⚠️ Aún sin registrar para hoy'}
          </span>

          <div className="flex items-center gap-2">
            {isSaved && (
              <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                <Check size={14} /> ¡Guardado con éxito!
              </span>
            )}
            <Button
              variant="primary"
              size="sm"
              onClick={handleSaveReflection}
              icon={<Save size={14} />}
              className="text-xs"
            >
              Guardar Reflexión Diaria
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};
