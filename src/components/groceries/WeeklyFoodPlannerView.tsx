import React, { useState } from 'react';
import { 
  ShoppingCart, 
  Check, 
  Copy, 
  Sparkles, 
  Calendar, 
  Utensils, 
  CheckSquare, 
  Square, 
  Scale, 
  Apple, 
  Fish, 
  Wheat, 
  Pill, 
  Carrot, 
  Salad 
} from 'lucide-react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Meal, NutritionGoals } from '../../types/nutrition.types';

interface WeeklyFoodPlannerViewProps {
  allMeals: Meal[];
  goals: NutritionGoals;
}

interface GroceryItem {
  id: string;
  name: string;
  category: 'animal' | 'vegetables' | 'fruits' | 'grains' | 'fats' | 'supplements';
  weeklyAmount: string;
  estimatedUnits: string;
  checked: boolean;
}

const DEFAULT_WEEKLY_GROCERY_PLAN: GroceryItem[] = [
  // Origen Animal & Lácteos Proteicos
  { id: 'g1', name: 'Pechuga de Pollo Fresca', category: 'animal', weeklyAmount: '1.2 kg', estimatedUnits: '~7 porciones de 120g cocido', checked: false },
  { id: 'g2', name: 'Atún Dolores en Agua', category: 'animal', weeklyAmount: '7 latas', estimatedUnits: '1 lata diaria post-gym (100g drenado)', checked: false },
  { id: 'g3', name: 'Leche Alpura Pro Deslactosada', category: 'animal', weeklyAmount: '3 Litros', estimatedUnits: '~350ml por desayuno anabólico', checked: false },
  { id: 'g4', name: 'Yogur Griego Fage 0% o Chobani Zero', category: 'animal', weeklyAmount: '1.2 kg', estimatedUnits: '~170g nocturnos (caseína micelar)', checked: false },
  { id: 'g5', name: 'Huevos Enteros Frescos', category: 'animal', weeklyAmount: '1 docena', estimatedUnits: 'Para rotación o días de descanso', checked: false },

  // Granos & Cereales
  { id: 'g6', name: 'Pan Bimbo Cero Cero Multigrano', category: 'grains', weeklyAmount: '2 paquetes', estimatedUnits: '~3 rebanadas/día (2 almuerzo + 1 cena)', checked: false },
  { id: 'g7', name: 'Arroz Blanco o Jazmín', category: 'grains', weeklyAmount: '1.2 kg', estimatedUnits: '~160g cocido por almuerzo (1 taza)', checked: false },
  { id: 'g8', name: 'Avena Integral en Hojuelas', category: 'grains', weeklyAmount: '500g', estimatedUnits: '~30g nocturnos mezclados en yogur', checked: false },
  { id: 'g9', name: 'Papas o Batatas', category: 'grains', weeklyAmount: '1.0 kg', estimatedUnits: 'Alternativa saciante al arroz (Air Fryer)', checked: false },

  // Frutas
  { id: 'g10', name: 'Plátanos / Bananos', category: 'fruits', weeklyAmount: '7 unidades (~1 kg)', estimatedUnits: '1 plátano mediano diario en desayuno', checked: false },
  { id: 'g11', name: 'Manzanas o Fresas', category: 'fruits', weeklyAmount: '800g', estimatedUnits: 'Snacks ricos en fibra y antioxidantes', checked: false },

  // Verduras & Hojas Verdes
  { id: 'g12', name: 'Espinacas Frescas Baby', category: 'vegetables', weeklyAmount: '500g', estimatedUnits: 'Ensalada del almuerzo con folato y hierro', checked: false },
  { id: 'g13', name: 'Pepinos y Tomates Bola', category: 'vegetables', weeklyAmount: '1.5 kg', estimatedUnits: 'Volumen y saciedad máxima en almuerzo', checked: false },
  { id: 'g14', name: 'Limones frescos y Sal Marina', category: 'vegetables', weeklyAmount: '1 bolsa', estimatedUnits: 'Aderezo y electrolitos con agua fría', checked: false },

  // Grasas Saludables
  { id: 'g15', name: 'Aguacates Hass', category: 'fats', weeklyAmount: '3 a 4 unidades', estimatedUnits: '~35g diarios (1/4 de aguacate en almuerzo)', checked: false },
  { id: 'g16', name: 'Mantequilla de Maní Pura (100% Cacahuate)', category: 'fats', weeklyAmount: '1 frasco (350g)', estimatedUnits: '~15g diarios (1 cda sopera en cena)', checked: false },
  { id: 'g17', name: 'Almendras enteras naturales', category: 'fats', weeklyAmount: '1 bolsa (200g)', estimatedUnits: '~10g diarios (8-10 pzas en cena)', checked: false },
  { id: 'g18', name: 'Aceite de Oliva Virgen Extra', category: 'fats', weeklyAmount: '1 botella (500ml)', estimatedUnits: 'Grasas monoinsaturadas cardiosaludables', checked: false },

  // Suplementos Adonis & Micronutrientes Dérmicos
  { id: 'g19', name: "Proteína Whey Bulk Power (Vanilla S'mores)", category: 'supplements', weeklyAmount: '1 bote (~7 scoops)', estimatedUnits: '1 scoop diario (30g) en desayuno', checked: false },
  { id: 'g20', name: 'Creatina Monohidratada Creapure', category: 'supplements', weeklyAmount: '35g semanales', estimatedUnits: '5g diarios nocturnos con agua', checked: false },
  { id: 'g21', name: 'Citrato de Magnesio (400mg)', category: 'supplements', weeklyAmount: '7 tomas', estimatedUnits: '1 toma nocturna antes de dormir', checked: false },
  { id: 'g22', name: 'Vitamina C (400 - 500mg)', category: 'supplements', weeklyAmount: '7 tomas', estimatedUnits: '1 toma nocturna para síntesis colágeno', checked: false },
  { id: 'g23', name: 'Cafeína 200mg / Caffenio Enerchill sin azúcar', category: 'supplements', weeklyAmount: '6 tomas', estimatedUnits: 'Pre-entreno 12:40 PM + agua con sal marina', checked: false }
];

export const WeeklyFoodPlannerView: React.FC<WeeklyFoodPlannerViewProps> = ({
  allMeals,
  goals
}) => {
  const [groceryList, setGroceryList] = useState<GroceryItem[]>(() => {
    try {
      const saved = localStorage.getItem('nutrilens_grocery_list_v2');
      return saved ? JSON.parse(saved) : DEFAULT_WEEKLY_GROCERY_PLAN;
    } catch {
      return DEFAULT_WEEKLY_GROCERY_PLAN;
    }
  });

  const [copied, setCopied] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'animal' | 'grains' | 'fruits' | 'vegetables' | 'fats' | 'supplements'>('all');

  const toggleItem = (id: string) => {
    const updated = groceryList.map(item => 
      item.id === id ? { ...item, checked: !item.checked } : item
    );
    setGroceryList(updated);
    localStorage.setItem('nutrilens_grocery_list_v2', JSON.stringify(updated));
  };

  const handleResetList = () => {
    setGroceryList(DEFAULT_WEEKLY_GROCERY_PLAN);
    localStorage.setItem('nutrilens_grocery_list_v2', JSON.stringify(DEFAULT_WEEKLY_GROCERY_PLAN));
  };

  const handleCopyShoppingList = () => {
    let text = `🛒 LISTA DE COMPRAS SEMANALES NUTRILENS (Protocolo Adonis 1,950 kcal)\n\n`;
    const categories = [
      { id: 'animal', label: '🥩 Origen Animal & Lácteos Proteicos' },
      { id: 'grains', label: '🌾 Granos, Cereales & Tubérculos' },
      { id: 'vegetables', label: '🥦 Verduras, Vegetales & Electrolitos' },
      { id: 'fruits', label: '🍎 Frutas Frescas' },
      { id: 'fats', label: '🥑 Grasas Saludables' },
      { id: 'supplements', label: '💊 Suplementación Adonis & Dérmicos' }
    ];

    categories.forEach(cat => {
      const items = groceryList.filter(i => i.category === cat.id);
      if (items.length > 0) {
        text += `${cat.label}:\n`;
        items.forEach(it => {
          text += `  ${it.checked ? '✅' : '▫️'} ${it.name} - ${it.weeklyAmount} (${it.estimatedUnits})\n`;
        });
        text += `\n`;
      }
    });

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const filteredItems = selectedFilter === 'all' 
    ? groceryList 
    : groceryList.filter(i => i.category === selectedFilter);

  const completedCount = groceryList.filter(i => i.checked).length;
  const progressPct = Math.round((completedCount / groceryList.length) * 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-2xl bg-blue-100 text-blue-800 border border-blue-200">
            <ShoppingCart size={22} />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              Plan Semanal & Lista del Supermercado Inteligente
              <Badge variant="blue" size="sm">7 Días</Badge>
            </h2>
            <p className="text-xs text-slate-500">
              Calculada para cubrir tus 1,950 kcal diarias, 170g de proteína, 10,000 pasos y el 100% de micronutrientes
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyShoppingList}
            icon={copied ? <Check size={14} /> : <Copy size={14} />}
            className="text-xs"
          >
            {copied ? '¡Copiado a WhatsApp!' : 'Copiar Lista'}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleResetList}
            className="text-xs"
          >
            Reiniciar
          </Button>
        </div>
      </div>

      {/* Progreso de Compras */}
      <Card className="border-blue-200 bg-gradient-to-br from-blue-50/70 via-white to-sky-50/30 p-4 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-800">Progreso de Compras del Súper</span>
          <span className="text-xs font-black text-blue-800 font-mono">{completedCount} de {groceryList.length} Comprados ({progressPct}%)</span>
        </div>

        <div className="w-full h-3 rounded-full bg-slate-200 overflow-hidden mb-2">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-teal-500 rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        <p className="text-[11px] text-slate-600">
          💡 <strong>Tip de compra:</strong> Comprar en las cantidades exactas garantiza cumplir tus macros sin desperdiciar comida y manteniendo los costos controlados.
        </p>
      </Card>

      {/* Filtros por Categoría */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
        {[
          { id: 'all', label: 'Todos', emoji: '🛒' },
          { id: 'animal', label: 'Origen Animal', emoji: '🥩' },
          { id: 'grains', label: 'Granos & Tubérculos', emoji: '🌾' },
          { id: 'vegetables', label: 'Verduras', emoji: '🥦' },
          { id: 'fruits', label: 'Frutas', emoji: '🍎' },
          { id: 'fats', label: 'Grasas Saludables', emoji: '🥑' },
          { id: 'supplements', label: 'Suplementos', emoji: '💊' }
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setSelectedFilter(f.id as any)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium shrink-0 flex items-center gap-1.5 transition-all border ${
              selectedFilter === f.id
                ? 'bg-blue-100 text-blue-950 font-bold border-blue-300 shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200'
            }`}
          >
            <span>{f.emoji}</span>
            <span>{f.label}</span>
          </button>
        ))}
      </div>

      {/* Lista de Alimentos para Comprar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            onClick={() => toggleItem(item.id)}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
              item.checked
                ? 'bg-emerald-50/70 border-emerald-300 opacity-70'
                : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
            }`}
          >
            <div className="mt-0.5 text-emerald-700">
              {item.checked ? <CheckSquare size={18} /> : <Square size={18} className="text-slate-400" />}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-1">
                <span className={`text-xs font-bold ${item.checked ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                  {item.name}
                </span>
                <span className="text-xs font-mono font-bold text-blue-800 shrink-0">
                  {item.weeklyAmount}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">{item.estimatedUnits}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
