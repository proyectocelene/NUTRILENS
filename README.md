# 🥗 NutriLens PWA - Progressive Web App de Nutrición Inteligente

NutriLens es una aplicación web progresiva (**PWA**) offline-first diseñada para ingerir datos nutricionales (JSON flexible o texto estructurado), organizarlos visualmente, calcular macros, micronutrientes, comparar contra metas diarias y generar análisis estadísticos inteligentes.

---

## ✨ Características Principales

1. **Ingesta Inteligente de JSON (Parser Flexible)**:
   - Pega formatos JSON con alimentos, macros y micronutrientes.
   - Detección tolerante de nombres en español e inglés (`calories`/`calorias`, `protein`/`proteina`, etc.).
   - Soporte para bloques directos de ingredientes o comidas completas.
   - Plantillas predefinidas listas para probar con 1 clic.

2. **Visualización y Diagnóstico en Tiempo Real**:
   - Medidor de balance calórico diario (consumido vs meta vs restante).
   - Gráfico interactivo circular de distribución de macronutrientes (P / C / G).
   - **Diagnóstico inteligente "¿Qué me falta hoy?"**: Detecta micronutrientes deficitarios y sugiere alimentos reales ricos en ellos para cubrirlos.
   - Puntuación de calidad nutricional (0 a 100).
   - Desglose alimento por alimento con badges expandibles de micronutrientes.

3. **Historial & Libro de Recetas**:
   - Navegación ágil por fechas (Día anterior, Día siguiente, Hoy, Selector de calendario).
   - Guarda recetas reutilizables y regístralas en cualquier día con 1 toque.
   - Borrado y copia rápida del JSON original.

4. **Análisis Estadístico Inteligente**:
   - Tendencias a 7, 14 y 30 días de macros y calorías.
   - Tasa de cumplimiento de metas y consistencia.
   - Mapa de calor de carencias recurrentes.
   - Consejos e insights automáticos basados en tus hábitos.

5. **Persistencia Garantizada con IndexedDB (Dexie.js)**:
   - Todos los datos se guardan de forma local en tu dispositivo y **nunca se borran**.
   - Descarga y restauración de copias de seguridad en archivos `.json`.

6. **PWA Instalable y Offline-First**:
   - Service worker con caché local.
   - Funciona sin internet en cualquier teléfono móvil (iOS/Android) o navegador de escritorio.

---

## 🚀 Cómo Iniciar el Proyecto

```bash
# Iniciar servidor de desarrollo
npm run dev

# Compilar para producción
npm run build

# Previsualizar build de producción
npm run preview
```

---

## 📋 Ejemplos de Formato JSON

```json
{
  "name": "Bowl de Pollo, Quinoa y Aguacate",
  "mealType": "lunch",
  "date": "2026-08-20",
  "time": "13:30",
  "foods": [
    {
      "name": "Pechuga de Pollo a la Plancha",
      "amount": "200g",
      "calories": 330,
      "protein": 62,
      "carbs": 0,
      "fat": 7.2,
      "fiber": 0,
      "nutrients": {
        "iron_mg": 2.1,
        "potassium_mg": 512,
        "zinc_mg": 2.0
      }
    },
    {
      "name": "Quinoa Cocida",
      "amount": "150g",
      "calories": 180,
      "protein": 6.5,
      "carbs": 32,
      "fat": 2.9,
      "fiber": 4.2,
      "nutrients": {
        "magnesium_mg": 95,
        "iron_mg": 2.2
      }
    }
  ]
}
```
