import React from 'react';
import { Settings } from 'lucide-react';
import { NutritionGoals } from '../../types/nutrition.types';
import { GoalsConfig } from './GoalsConfig';
import { BackupManager } from './BackupManager';
import { ProfileCard } from './ProfileCard';
import { AiConfigCard } from './AiConfigCard';
import { FirebaseSyncCard } from './FirebaseSyncCard';

interface SettingsViewProps {
  goals: NutritionGoals;
  onSaveGoals: (goals: Partial<NutritionGoals>) => Promise<void>;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ goals, onSaveGoals }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-xl bg-slate-100 text-slate-700 border border-slate-200">
          <Settings size={20} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900">Ajustes, Nube e Inteligencia Artificial</h2>
          <p className="text-xs text-slate-500">Conexión con Firebase, Gemini AI, metas nutricionales y respaldos</p>
        </div>
      </div>

      <ProfileCard goals={goals} />
      <AiConfigCard />
      <FirebaseSyncCard />
      <GoalsConfig goals={goals} onSaveGoals={onSaveGoals} />
      <BackupManager />
    </div>
  );
};
