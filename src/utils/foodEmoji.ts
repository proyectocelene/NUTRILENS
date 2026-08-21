export function getSmartFoodEmoji(name: string, fallbackType?: string): string {
  if (!name) return '🍽️';
  const text = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  // Bebidas isotónicas / Suplementos / Hidratación
  if (text.includes('powerade') || text.includes('gatorade') || text.includes('electrolit') || text.includes('isotonica') || text.includes('suero')) return '🥤';
  if (text.includes('creatina') || text.includes('whey') || text.includes('proteina en polvo') || text.includes('suplemento') || text.includes('capsula') || text.includes('vitamina')) return '💊';
  if (text.includes('agua') || text.includes('mineral')) return '💧';

  // Sándwiches, Tortas y Panes
  if (text.includes('sandwich') || text.includes('emparedado') || text.includes('torta') || text.includes('bagel') || text.includes('panini')) return '🥪';
  if (text.includes('pan') || text.includes('bimbo') || text.includes('tostada') || text.includes('croissant') || text.includes('bolillo')) return '🍞';

  // Huevos y Desayunos
  if (text.includes('huevo') || text.includes('clara') || text.includes('omelet') || text.includes('revuelto') || text.includes('estrellado')) return '🍳';
  if (text.includes('avena') || text.includes('cereal') || text.includes('granola') || text.includes('porridge') || text.includes('bowl')) return '🥣';
  if (text.includes('pancake') || text.includes('hot cake') || text.includes('waffle') || text.includes('crepa')) return '🥞';

  // Carnes, Aves y Embutidos
  if (text.includes('pollo') || text.includes('pechuga') || text.includes('alita') || text.includes('muslo')) return '🍗';
  if (text.includes('carne') || text.includes('res') || text.includes('bistec') || text.includes('arrachera') || text.includes('filete') || text.includes('ribeye')) return '🥩';
  if (text.includes('hamburguesa') || text.includes('burger')) return '🍔';
  if (text.includes('pavo') || text.includes('jamon') || text.includes('salchicha') || text.includes('tocino')) return '🥓';

  // Pescados y Mariscos
  if (text.includes('atun') || text.includes('salmon') || text.includes('pescado') || text.includes('tilapia') || text.includes('sardina') || text.includes('marisco') || text.includes('camaron')) return '🐟';
  if (text.includes('sushi') || text.includes('sashimi') || text.includes('poke')) return '🍣';

  // Lácteos
  if (text.includes('leche') || text.includes('alpura') || text.includes('lala') || text.includes('licuado') || text.includes('batido') || text.includes('smoothie')) return '🥛';
  if (text.includes('queso') || text.includes('panela') || text.includes('cottage') || text.includes('parmesano') || text.includes('mozzarella')) return '🧀';
  if (text.includes('yogur') || text.includes('yogurt') || text.includes('kefir')) return '🥛';

  // Cafés e Infusiones
  if (text.includes('cafe') || text.includes('espresso') || text.includes('cappuccino') || text.includes('latte') || text.includes('americano')) return '☕';
  if (text.includes('te') || text.includes('matcha') || text.includes('infusion')) return '🍵';

  // Tacos, Comida Mexicana y Pastas
  if (text.includes('taco') || text.includes('quesadilla') || text.includes('burrito') || text.includes('fajita')) return '🌮';
  if (text.includes('arroz') || text.includes('rice')) return '🍚';
  if (text.includes('pasta') || text.includes('espagueti') || text.includes('fideo') || text.includes('macarron') || text.includes('ramen')) return '🍝';
  if (text.includes('pizza')) return '🍕';

  // Grasas, Frutos Secos y Verduras
  if (text.includes('aguacate') || text.includes('guacamole')) return '🥑';
  if (text.includes('aceite') || text.includes('oliva')) return '🫒';
  if (text.includes('nuez') || text.includes('almendra') || text.includes('cacahuate') || text.includes('mani') || text.includes('semilla')) return '🥜';
  if (text.includes('ensalada') || text.includes('lechuga') || text.includes('espinaca') || text.includes('verde')) return '🥗';
  if (text.includes('brocoli') || text.includes('coliflor') || text.includes('esparrago')) return '🥦';
  if (text.includes('zanahoria') || text.includes('calabacita') || text.includes('pepino')) return '🥕';
  if (text.includes('papa') || text.includes('patata') || text.includes('camote')) return '🥔';

  // Frutas y Postres
  if (text.includes('platano') || text.includes('banana')) return '🍌';
  if (text.includes('manzana')) return '🍎';
  if (text.includes('fresa') || text.includes('frutos rojos') || text.includes('arandano') || text.includes('berry')) return '🍓';
  if (text.includes('naranja') || text.includes('mandarina') || text.includes('citrico')) return '🍊';
  if (text.includes('chocolate') || text.includes('cacao')) return '🍫';

  // Fallback por tipo de comida
  if (fallbackType === 'breakfast') return '🍳';
  if (fallbackType === 'lunch') return '🥗';
  if (fallbackType === 'dinner') return '🍲';
  if (fallbackType === 'snack') return '🍎';

  return '🍽️';
}
