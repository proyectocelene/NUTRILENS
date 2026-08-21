import React, { useState, useEffect } from 'react';
import { Flame, Trophy, Award, Zap, ChevronRight, X, Sparkles, Star, CheckCircle2 } from 'lucide-react';
import { 
  getGamificationState, 
  calculateLevelInfo, 
  INITIAL_ACHIEVEMENTS 
} from '../../services/gamificationService';
import { GamificationState } from '../../types/db.types';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';

export const GamificationBar: React.FC = () => {
  const [gameState, setGameState] = useState<GamificationState>(getGamificationState());
  const [isAchievementsModalOpen, setIsAchievementsModalOpen] = useState(false);

  useEffect(() => {
    const handleStorage = () => {
      setGameState(getGamificationState());
    };
    window.addEventListener('storage', handleStorage);
    const interval = setInterval(handleStorage, 3000);
    return () => {
      window.removeEventListener('storage', handleStorage);
      clearInterval(interval);
    };
  }, []);

  const levelInfo = calculateLevelInfo(gameState.totalXp);
  const unlockedCount = gameState.unlockedAchievementIds.length;

  return (
    <>
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white rounded-2xl p-3 sm:p-3.5 shadow-md shadow-emerald-700/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-4">
        {/* Nivel y Título */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-xl shrink-0 border border-white/20">
            {levelInfo.icon}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-black tracking-wide text-emerald-100 uppercase">
                Nivel {levelInfo.level}
              </span>
              <span className="text-xs font-bold text-white truncate">
                {levelInfo.title}
              </span>
            </div>

            {/* Barra de progreso de XP */}
            <div className="flex items-center gap-2 mt-1">
              <div className="flex-1 h-2 rounded-full bg-black/20 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-amber-300 to-amber-400 rounded-full transition-all duration-500" 
                  style={{ width: `${levelInfo.progressPercent}%` }}
                />
              </div>
              <span className="text-[10px] font-mono font-bold text-emerald-100 shrink-0">
                {gameState.totalXp} XP {levelInfo.xpToNext > 0 ? `(${levelInfo.xpToNext} para Nivel ${levelInfo.level + 1})` : ''}
              </span>
            </div>
          </div>
        </div>

        {/* Racha y Logros */}
        <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/15">
          {/* Racha de Fuego */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 text-xs font-bold">
            <Flame size={16} className="text-amber-300 animate-pulse" />
            <span>Racha: <strong className="text-amber-200">{gameState.currentStreak} días</strong></span>
          </div>

          {/* Botón de Logros */}
          <button
            type="button"
            onClick={() => setIsAchievementsModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-extrabold shadow-sm transition-all active:scale-95"
          >
            <Trophy size={14} className="text-amber-950" />
            <span>Logros ({unlockedCount}/{INITIAL_ACHIEVEMENTS.length})</span>
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Modal de Logros e Insignias */}
      <Modal
        isOpen={isAchievementsModalOpen}
        onClose={() => setIsAchievementsModalOpen(false)}
        maxWidth="lg"
        title={
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-amber-100 text-amber-800">
              <Trophy size={18} />
            </div>
            <span>Sala de Trofeos & Logros Desbloqueados</span>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 flex items-center justify-between gap-3 text-xs">
            <div>
              <span className="font-bold text-amber-950 block">¡Gana puntos XP completando tus hábitos!</span>
              <p className="text-[11px] text-amber-900 mt-0.5">
                Registra comidas (+25 XP), completa biofeedback (+15 XP), toma tu creatina y cumple tus macros diarios para subir de nivel.
              </p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-2xl font-black text-amber-900 font-mono block">{gameState.totalXp}</span>
              <span className="text-[10px] font-bold text-amber-700 uppercase">XP Total</span>
            </div>
          </div>

          {/* Grid de Logros */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[60vh] overflow-y-auto pr-1">
            {INITIAL_ACHIEVEMENTS.map((ach) => {
              const isUnlocked = gameState.unlockedAchievementIds.includes(ach.id);

              return (
                <div
                  key={ach.id}
                  className={`p-3 rounded-2xl border transition-all flex items-start gap-3 ${
                    isUnlocked
                      ? 'bg-white border-emerald-200 shadow-xs'
                      : 'bg-slate-50 border-slate-200 opacity-60'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xl shrink-0 ${
                    isUnlocked ? 'bg-emerald-50 border border-emerald-200 shadow-2xs' : 'bg-slate-200 grayscale'
                  }`}>
                    {ach.icon}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="text-xs font-bold text-slate-900 truncate">{ach.title}</h4>
                      <Badge variant={isUnlocked ? 'emerald' : 'slate'} size="sm">
                        +{ach.xpReward} XP
                      </Badge>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-tight">{ach.description}</p>
                    {isUnlocked && (
                      <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1 mt-1">
                        <CheckCircle2 size={11} /> Desbloqueado
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Modal>
    </>
  );
};
