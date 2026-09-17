export const FOOD_EMOJI_PALETTE = [
  // Frutas & Verduras
  '🍎', '🍏', '🍌', '🍓', '🫐', '🍊', '🍋', '🥑', '🥝', '🍇', '🍉', '🍍', '🍑', '🍒',
  '🥦', '🥬', '🥗', '🥕', '🥒', '🍅', '🧄', '🧅', '🥔', '🍠', '🌽', '🫒', '🍄',
  // Proteínas, Carnes & Pescados
  '🥩', '🍗', '🍖', '🥓', '🍔', '🌭', '🥪', '🌮', '🌯',
  '🐟', '🍣', '🍤', '🦐', '🦀', '🦞', '🥚', '🍳',
  // Lácteos & Granos
  '🥛', '🧀', '🧈', '🍞', '🥖', '🥯', '🥨', '🥞', '🧇', '🥣', '🍚', '🍙', '🍝', '🍜', '🍕',
  // Frutos Secos & Grasas
  '🥜', '🌰', '🥥', '🍯',
  // Bebidas & Suplementos
  '☕', '🍵', '🥤', '🧃', '🧉', '💧', '💊', '⚡', '🍫'
];

export function getSmartFoodEmoji(name: string, fallbackType?: string): string {
  if (!name || typeof name !== 'string') return '🍽️';
  
  // Normalizar: minúsculas, sin acentos
  const text = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

  // Función auxiliar de palabra completa o subfrase
  const hasWord = (word: string) => {
    const regex = new RegExp(`(^|[^a-z0-9])${word}([^a-z0-9]|$)`, 'i');
    return regex.test(text);
  };

  const hasAnyWord = (words: string[]) => words.some(w => hasWord(w));

  // 1. Suplementos, Vitaminas e Hidratación
  if (hasAnyWord(['creatina', 'creatine', 'whey', 'proteina en polvo', 'suplemento', 'capsula', 'pastilla', 'bcaa', 'glutamina', 'colageno'])) return '💊';
  if (hasAnyWord(['gatorade', 'powerade', 'electrolit', 'isotonica', 'suero', 'pre-entreno', 'preentreno', 'preworkout'])) return '⚡';
  if (hasAnyWord(['agua', 'water', 'mineral', 'h2o'])) return '💧';

  // 2. Frutas (PRIORIDAD ALTA antes de cualquier coincidencia de carne o verdura)
  if (hasAnyWord(['manzana', 'apple', 'golden', 'gala', 'fuji', 'red delicious'])) return '🍎';
  if (hasAnyWord(['fresa', 'fresas', 'strawberry', 'frutos rojos', 'arandano', 'arandanos', 'blueberry', 'frambuesa', 'zarzamora', 'berry', 'berries'])) return '🍓';
  if (hasAnyWord(['platano', 'banana', 'banano', 'guineo'])) return '🍌';
  if (hasAnyWord(['naranja', 'mandarina', 'toronja', 'citrico', 'orange'])) return '🍊';
  if (hasAnyWord(['limon', 'lima', 'lemon', 'lime'])) return '🍋';
  if (hasAnyWord(['kiwi'])) return '🥝';
  if (hasAnyWord(['uvas', 'uva', 'grape', 'pasas'])) return '🍇';
  if (hasAnyWord(['sandia', 'watermelon'])) return '🍉';
  if (hasAnyWord(['pina', 'anana', 'pineapple'])) return '🍍';
  if (hasAnyWord(['mango', 'papaya', 'melon', 'durazno', 'melocoton', 'ciruela', 'pera'])) return '🍑';

  // 3. Verduras y Ensaladas
  if (hasAnyWord(['aguacate', 'palta', 'avocado', 'guacamole'])) return '🥑';
  if (hasAnyWord(['tomate', 'jitomate', 'tomato', 'cherrys', 'cherry'])) return '🍅';
  if (hasAnyWord(['brocoli', 'broccoli', 'coliflor', 'esparrago', 'esparragos'])) return '🥦';
  if (hasAnyWord(['ensalada', 'salad', 'lechuga', 'espinaca', 'espinacas', 'kale', 'rucula', 'acelga'])) return '🥗';
  if (hasAnyWord(['zanahoria', 'zanahorias', 'carrot', 'calabacita', 'calabacin', 'zucchini', 'pepino', 'cucumber'])) return '🥕';
  if (hasAnyWord(['papa', 'patata', 'patatas', 'papas', 'camote', 'boniato', 'sweet potato'])) return '🥔';
  if (hasAnyWord(['cebolla', 'onion', 'pimiento', 'chile', 'jalapeno', 'morron', 'garlic', 'ajo'])) return '🧅';
  if (hasAnyWord(['champiñon', 'champinon', 'champiñones', 'hongo', 'seta', 'mushroom'])) return '🍄';
  if (hasAnyWord(['aceituna', 'aceitunas', 'oliva', 'olivas', 'aceite de oliva'])) return '🫒';

  // 4. Frutos Secos, Semillas y Grasas
  if (hasAnyWord(['almendra', 'almendras', 'almond', 'nuez', 'nueces', 'cacahuate', 'cacahuates', 'mani', 'peanut', 'mantequilla de mani', 'peanut butter', 'anacardo', 'pistacho', 'avellana', 'chia', 'lino', 'sesamo', 'semilla', 'semillas'])) return '🥜';
  if (hasAnyWord(['aceite', 'mantequilla', 'ghee'])) return '🧈';

  // 5. Huevos y Desayunos
  if (hasAnyWord(['huevo', 'huevos', 'egg', 'eggs', 'clara', 'claras', 'omelet', 'omelette', 'revuelto', 'estrellado', 'poche'])) return '🍳';
  if (hasAnyWord(['avena', 'oats', 'oatmeal', 'cereal', 'granola', 'porridge', 'musli', 'quinoa', 'chia pudding'])) return '🥣';
  if (hasAnyWord(['pancake', 'pancakes', 'hotcake', 'hotcakes', 'waffle', 'waffles', 'crepa', 'crepe'])) return '🥞';

  // 6. Cafés e Infusiones (Usando palabra exacta para no colisionar con 'tomate', 'aceite', etc.)
  if (hasAnyWord(['cafe', 'coffee', 'espresso', 'cappuccino', 'latte', 'americano', 'macchiato', 'moka', 'cold brew'])) return '☕';
  if (hasAnyWord(['te', 'tea', 'matcha', 'infusion', 'manzanilla', 'chai', 'yerba mate', 'mate'])) return '🍵';

  // 7. Carnes, Aves y Embutidos (Con límites de palabra estrictos para evitar 'fresca' o 'aderezo')
  if (hasAnyWord(['pollo', 'chicken', 'pechuga', 'alita', 'alitas', 'muslo', 'pavo', 'turkey'])) return '🍗';
  if (hasAnyWord(['res', 'carne', 'carne de res', 'beef', 'steak', 'bistec', 'bife', 'arrachera', 'filete', 'ribeye', 'sirloin', 'picaña', 'vacio', 'ternera', 'costilla', 'cordero'])) return '🥩';
  if (hasAnyWord(['hamburguesa', 'burger', 'cheeseburger'])) return '🍔';
  if (hasAnyWord(['jamon', 'ham', 'tocino', 'bacon', 'salchicha', 'chorizo', 'pepperoni', 'lomo'])) return '🥓';

  // 8. Pescados y Mariscos
  if (hasAnyWord(['atun', 'tuna', 'salmon', 'pescado', 'fish', 'tilapia', 'merluza', 'bacalao', 'sardina', 'sardinas', 'marisco', 'camaron', 'camarones', 'shrimp', 'pulpo', 'calamar'])) return '🐟';
  if (hasAnyWord(['sushi', 'sashimi', 'poke', 'nigiri', 'maki', 'roll'])) return '🍣';

  // 9. Lácteos y Quesos
  if (hasAnyWord(['leche', 'milk', 'alpura', 'lala', 'licuado', 'batido', 'smoothie', 'shake'])) return '🥛';
  if (hasAnyWord(['queso', 'cheese', 'panela', 'cottage', 'parmesano', 'mozzarella', 'fresco', 'oaxaca', 'gouda', 'cheddar'])) return '🧀';
  if (hasAnyWord(['yogur', 'yogurt', 'yoghurt', 'kefir', 'fage', 'chobani', 'griego'])) return '🥛';

  // 10. Panadería, Granos, Pastas y Comidas
  if (hasAnyWord(['sandwich', 'sandwiches', 'emparedado', 'torta', 'panini', 'bagel', 'wrap'])) return '🥪';
  if (hasAnyWord(['pan', 'bread', 'bimbo', 'tostada', 'tostadas', 'croissant', 'bolillo', 'telera', 'baguette', 'pita'])) return '🍞';
  if (hasAnyWord(['taco', 'tacos', 'quesadilla', 'quesadillas', 'burrito', 'burritos', 'fajita', 'fajitas', 'enchilada', 'flauta'])) return '🌮';
  if (hasAnyWord(['arroz', 'rice', 'risotto', 'paella'])) return '🍚';
  if (hasAnyWord(['pasta', 'espagueti', 'spaghetti', 'fideo', 'macarron', 'lasana', 'lasagna', 'ramen', 'noodles', 'tallarines'])) return '🍝';
  if (hasAnyWord(['pizza'])) return '🍕';
  if (hasAnyWord(['chocolate', 'cacao', 'brownie', 'dulce', 'galleta', 'cookie'])) return '🍫';

  // Fallbacks por tipo de comida
  if (fallbackType === 'breakfast') return '🍳';
  if (fallbackType === 'lunch') return '🥗';
  if (fallbackType === 'dinner') return '🍲';
  if (fallbackType === 'snack') return '🍎';

  return '🍽️';
}
