import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { BookOpen, Plus, Trash2, CalendarPlus, Search, Copy, Check, Sparkles, FileCode } from 'lucide-react';
import { db } from '../../db';
import { dbService } from '../../db/dbService';
import { DbRecipe } from '../../types/db.types';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';

interface RecipeBookProps {
  onLogRecipeAsMeal: (recipe: DbRecipe) => void;
  onOpenJsonModal: () => void;
  onOpenSchemaGuide: () => void;
}

export const RecipeBook: React.FC<RecipeBookProps> = ({
  onLogRecipeAsMeal,
  onOpenJsonModal,
  onOpenSchemaGuide
}) => {
  const recipes = useLiveQuery(async () => {
    return await db.recipes.orderBy('createdAt').reverse().toArray();
  }, []) || [];

  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredRecipes = recipes.filter(r =>
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteRecipe = async (id?: string) => {
    if (id) {
      await dbService.deleteRecipe(id);
    }
  };

  const handleCopyRecipeJson = (recipe: DbRecipe) => {
    const jsonToCopy = {
      name: recipe.name,
      mealType: recipe.category || 'lunch',
      foods: recipe.foods
    };
    navigator.clipboard.writeText(JSON.stringify(jsonToCopy, null, 2));
    if (recipe.id) {
      setCopiedId(recipe.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header y Buscador */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <BookOpen size={20} className="text-emerald-700" />
            <span>Banco de Recetario Inteligente</span>
          </h2>
          <p className="text-xs text-slate-500">
            Se construye y enriquece automáticamente con cada comida que ingieres o puedes registrar recetas nuevas
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar en el banco de recetas..."
              className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-emerald-500 font-medium"
            />
          </div>

          <div className="grid grid-cols-2 sm:flex sm:items-center gap-2">
            <Button variant="outline" size="sm" onClick={onOpenSchemaGuide} icon={<FileCode size={14} />} className="text-xs">
              Formato JSON
            </Button>

            <Button variant="emerald" size="sm" onClick={onOpenJsonModal} icon={<Plus size={14} />} className="text-xs">
              Nueva Receta
            </Button>
          </div>
        </div>
      </div>

      {recipes.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white border border-dashed border-slate-300 text-center space-y-3 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto border border-emerald-100">
            <BookOpen size={28} />
          </div>
          <div>
            <h4 className="text-base font-bold text-slate-900">Tu Banco de Recetas se enriquecerá automáticamente</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
              Cada vez que pegas e ingieres un JSON de comida, NutriLens extrae sus ingredientes y nutrientes para alimentar tu banco de recetas.
            </p>
          </div>
          <div className="flex items-center justify-center gap-2 pt-2">
            <Button variant="primary" size="sm" onClick={onOpenJsonModal} icon={<Plus size={14} />}>
              Ingerir Primera Comida
            </Button>
            <Button variant="outline" size="sm" onClick={onOpenSchemaGuide} icon={<FileCode size={14} />}>
              Copiar Formato JSON
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRecipes.map((recipe) => (
            <Card
              key={recipe.id}
              className="border-slate-200 bg-white hover:border-slate-300 transition-all flex flex-col justify-between shadow-xs"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <Badge variant="emerald" size="sm">
                    {recipe.category || 'Receta'}
                  </Badge>
                  <span className="text-xs font-mono font-bold text-amber-800">
                    {recipe.totalCalories} kcal
                  </span>
                </div>

                <h4 className="text-sm font-bold text-slate-900 mb-1">{recipe.name}</h4>
                <p className="text-[11px] text-slate-500 mb-3 font-medium">
                  {recipe.foods.length} ingredientes •{' '}
                  <span className="text-emerald-700 font-bold">{recipe.totalProtein}g P</span> •{' '}
                  <span className="text-sky-700 font-bold">{recipe.totalCarbs}g C</span> •{' '}
                  <span className="text-amber-700 font-bold">{recipe.totalFat}g G</span>
                </p>

                {/* Mini lista de alimentos */}
                <div className="space-y-1 mb-4">
                  {recipe.foods.slice(0, 3).map((f, i) => (
                    <div key={i} className="text-[11px] text-slate-700 flex items-center justify-between">
                      <span className="truncate pr-2">• {f.name}</span>
                      <span className="text-slate-400 font-mono shrink-0">{f.calories} kcal</span>
                    </div>
                  ))}
                  {recipe.foods.length > 3 && (
                    <span className="text-[10px] text-slate-400 italic block">
                      +{recipe.foods.length - 3} alimentos más...
                    </span>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleCopyRecipeJson(recipe)}
                    className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                    title="Copiar JSON de esta receta"
                  >
                    {copiedId === recipe.id ? <Check size={14} className="text-emerald-700" /> : <Copy size={14} />}
                  </button>
                  <button
                    onClick={() => handleDeleteRecipe(recipe.id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition-colors"
                    title="Eliminar receta"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => onLogRecipeAsMeal(recipe)}
                  icon={<CalendarPlus size={14} />}
                >
                  Registrar Hoy
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
