export type DrinkCategory = "wine" | "spirits" | "beer" | "accessories" | "gifting";

export type DrinkItem = {
  id: string;
  name: string;
  size: string;
  description: string;
  taste: string[];
  category: DrinkCategory;
  priceInCents: number;
  maxQuantity: number;
  featured?: boolean;
};

export const SERVICE_FEE_CENTS = 1000;

export const FL_ALCOHOL_DISCLAIMER =
  "Alcoholic beverages are sold and supplied by Total Wine & More, a licensed Florida beverage retailer. Evergreen Cottages acts solely as a third-party service provider facilitating order placement and delivery. By placing this order, you acknowledge that you are at least 21 years of age. A valid government-issued photo ID must be presented at the time of delivery. Prices shown reflect the retailer's current pricing plus a 10% service markup. A non-refundable service fee is added to each order to cover platform maintenance and delivery services.";

export const DELIVERY_OPTIONS = [
  { id: "asap", label: "Under 2 hours", description: "Staff orders immediately" },
  { id: "scheduled", label: "Scheduled time", description: "Pick a delivery time" },
  { id: "shipped", label: "Shipped to property", description: "Arrives by mail" },
] as const;

export const CATEGORIES: { id: DrinkCategory; label: string; description: string }[] = [
  { id: "wine", label: "Wine", description: "Red, white, rosé & sparkling" },
  { id: "spirits", label: "Spirits", description: "Tequila, vodka, whiskey & more" },
  { id: "beer", label: "Beer & Seltzers", description: "Craft, imported & hard seltzer" },
  { id: "accessories", label: "Accessories", description: "Mixers & cocktail essentials" },
  { id: "gifting", label: "Gifting", description: "Gift sets & bundles" },
];

export const CATALOG: DrinkItem[] = [
  // ── Wine ──
  {
    id: "wine-meiomi-pinot-noir",
    name: "Meiomi Pinot Noir",
    size: "750ml",
    taste: ["Cherry", "Berry", "Vanilla"],
    description: "Crafted from California's top winegrowing regions, French oak-aged for unique structure and depth.",
    category: "wine",
    priceInCents: 1540,

    maxQuantity: 6,
    featured: true,
  },
  {
    id: "wine-la-marca-prosecco",
    name: "La Marca Prosecco",
    size: "750ml",
    taste: ["Apple", "Floral", "Peach"],
    description: "Fresh sparkling wine with vibrant bouquet of apple, white peach and honeysuckle. Soft, harmonious fruity notes with pleasant acidity.",
    category: "wine",
    priceInCents: 1480,
    maxQuantity: 6,
  },
  {
    id: "wine-kim-crawford-sauvignon-blanc",
    name: "Kim Crawford Sauvignon Blanc",
    size: "750ml",
    taste: ["Citrus", "Pineapple"],
    description: "Bouquet of citrus and tropical fruits with herbaceous notes. Brimming with pineapple and stone fruit, fresh and zesty finish.",
    category: "wine",
    priceInCents: 1210,
    maxQuantity: 6,
  },
  {
    id: "wine-josh-cellars-cabernet",
    name: "Josh Cellars Cabernet Sauvignon",
    size: "750ml",
    taste: ["Black Cherry", "Plum", "Vanilla"],
    description: "Aromas of ripe black currant and smoke. Flavors of dark cherry and ripe plum with vanilla and cocoa. Balanced, long finish.",
    category: "wine",
    priceInCents: 1320,
    maxQuantity: 6,
  },
  {
    id: "wine-whispering-angel-rose",
    name: "Whispering Angel Rosé",
    size: "750ml",
    taste: ["Strawberry", "Peach", "Berry"],
    description: "Full of mouthwatering flavor with lovely texture. Light fruit flavors with a clean finish from Cotes de Provence, France.",
    category: "wine",
    priceInCents: 1870,
    maxQuantity: 6,
    featured: true,
  },

  // ── Spirits ──
  {
    id: "spirits-casamigos-blanco",
    name: "Casamigos Blanco Tequila",
    size: "750ml",
    taste: ["Citrus", "Vanilla", "Sweet Agave"],
    description: "Crystal-clear 100% Blue Weber agave tequila. Slow roasted for crisp notes of citrus, vanilla, and sweet agave. Perfect neat, on rocks, or in cocktails.",
    category: "spirits",
    priceInCents: 3410,
    maxQuantity: 4,
    featured: true,
  },
  {
    id: "spirits-titos-vodka",
    name: "Tito's Handmade Vodka",
    size: "750ml",
    taste: ["Crisp", "Clean", "Sweet", "Pepper"],
    description: "Made in taste-tested batches. Notes of cinnamon, white pepper, lemon peel followed by black cherry, vanilla, and an impeccably clean finish.",
    category: "spirits",
    priceInCents: 1650,
    maxQuantity: 4,
    featured: true,
  },
  {
    id: "spirits-woodford-reserve",
    name: "Woodford Reserve Bourbon",
    size: "750ml",
    taste: ["Rich", "Rye", "Toast", "Oak"],
    description: "Over 200 detectable flavor notes. Rich dried fruit aromas with a smooth, satisfying finish. Perfect for crafting cocktails.",
    category: "spirits",
    priceInCents: 3080,
    maxQuantity: 4,
  },
  {
    id: "spirits-bacardi-rum",
    name: "Bacardi Superior Rum",
    size: "750ml",
    taste: ["Light", "Vanilla", "Apricot", "Coconut"],
    description: "Clear, light and smooth with silky finish and nutty flavors. Double-filtered through charcoal. Extremely mixable.",
    category: "spirits",
    priceInCents: 1430,
    maxQuantity: 4,
  },
  {
    id: "spirits-hendricks-gin",
    name: "Hendrick's Gin",
    size: "750ml",
    taste: ["Crisp", "Floral", "Cucumber", "Rose"],
    description: "Oddly infused with rose and cucumber. Platinum at LA Spirit Awards, Silver at SF World Spirits Awards.",
    category: "spirits",
    priceInCents: 3630,
    maxQuantity: 4,
  },

  // ── Beer & Seltzers ──
  {
    id: "beer-corona-extra",
    name: "Corona Extra",
    size: "24-12oz Cans",
    taste: ["Crisp", "Clean", "Balanced"],
    description: "Even-keeled cerveza with fruity-honey aromas and a touch of malt. Great beach drink or barbecue beverage.",
    category: "beer",
    priceInCents: 2860,
    maxQuantity: 4,
    featured: true,
  },
  {
    id: "beer-modelo-especial",
    name: "Modelo Especial",
    size: "24-12oz Cans",
    taste: ["Clean", "Balanced", "Cereal"],
    description: "Rich, full-flavored pilsner with smooth notes of orange blossom honey. Light-hop character.",
    category: "beer",
    priceInCents: 2860,
    maxQuantity: 4,
  },
  {
    id: "beer-white-claw-variety",
    name: "White Claw Variety Pack #1",
    size: "12pk-12oz Cans",
    taste: ["Hard Seltzer"],
    description: "Black Cherry, Pineapple, Raspberry, and Natural Lime. 100 calories, 5% ABV, 2g carbs per can.",
    category: "beer",
    priceInCents: 1920,
    maxQuantity: 4,
  },
  {
    id: "beer-high-noon-variety",
    name: "High Noon Variety Pack",
    size: "12pk-12oz Cans",
    taste: ["Vodka Seltzer", "Real Fruit"],
    description: "Made from vodka, sparkling water, and real fruit juice. Watermelon, Black Cherry, Grapefruit, Pineapple. 4.5% ABV.",
    category: "beer",
    priceInCents: 2640,
    maxQuantity: 4,
  },
  {
    id: "beer-stella-artois",
    name: "Stella Artois",
    size: "12pk-12oz Cans",
    taste: ["Crisp", "Balanced", "Biscuity"],
    description: "Floral aroma, well-balanced malt sweetness, crisp hop bitterness, and soft dry finish. Pairs well with food.",
    category: "beer",
    priceInCents: 1760,
    maxQuantity: 4,
  },

  // ── Accessories (Cocktail Mixers & Essentials) ──
  {
    id: "acc-tres-agaves-margarita",
    name: "Tres Agaves Margarita Mix",
    size: "1L",
    taste: [],
    description: "Organic agave nectar, lime juice, filtered water, and Vitamin C. Perfect with Casamigos.",
    category: "accessories",
    priceInCents: 1100,
    maxQuantity: 4,
    featured: true,
  },
  {
    id: "acc-fever-tree-tonic",
    name: "Fever Tree Tonic Water",
    size: "8pk-5oz",
    taste: [],
    description: "Premium tonic with finest quinine and Mexican bitter orange. Subtle citrus taste. Pairs with Hendrick's.",
    category: "accessories",
    priceInCents: 880,
    maxQuantity: 4,
  },
  {
    id: "acc-fever-tree-ginger-beer",
    name: "Fever Tree Ginger Beer",
    size: "8pk-5oz",
    taste: [],
    description: "Brewed 24 hours with three signature gingers. Crisp and refreshing. Perfect for Moscow Mules with Tito's.",
    category: "accessories",
    priceInCents: 880,
    maxQuantity: 4,
  },
  {
    id: "acc-luxardo-cherries",
    name: "Luxardo Maraschino Cherries",
    size: "14.1oz",
    taste: [],
    description: "Dense, chewy marasca cherries preserved in the fruit's famed liqueur. Essential for Old Fashioneds with Woodford.",
    category: "accessories",
    priceInCents: 2750,
    maxQuantity: 4,
    featured: true,
  },
  {
    id: "acc-angostura-bitters",
    name: "Angostura Bitters",
    size: "4oz",
    taste: [],
    description: "Adds complexity and intensifies flavor. Perfect palate cleanser. A must for cocktails and Old Fashioneds.",
    category: "accessories",
    priceInCents: 1430,
    maxQuantity: 4,
  },

  // ── Gifting ──
  {
    id: "gift-borrasca-wine-box",
    name: "Borrasca Special Edition Wine Gift Box",
    size: "2x 750ml",
    taste: ["Apple", "Citrus", "Floral"],
    description: "Brut and Rosé sparkling wines from Spain. Fruit forward, aromatic, and easy drinking with fine bubbles.",
    category: "gifting",
    priceInCents: 2200,
    maxQuantity: 3,
  },
  {
    id: "gift-ed-edmundo-set",
    name: "Ed Edmundo Gift Set",
    size: "2x 750ml",
    taste: ["Dark Berry", "Black Currant"],
    description: "Argentinean Cabernet and Red Blend. Big, bold flavor profile, sure to please red wine lovers.",
    category: "gifting",
    priceInCents: 2310,
    maxQuantity: 3,
    featured: true,
  },
  {
    id: "gift-caliveda-pinot-pack",
    name: "Caliveda Pinot Noir Gift Pack",
    size: "2x 750ml",
    taste: ["Dark Berry", "Vanilla", "Cherry"],
    description: "Bold aromas of cherry compote and blackberry jam. Flawlessly balanced with velvety finish.",
    category: "gifting",
    priceInCents: 3850,
    maxQuantity: 3,
  },
  {
    id: "gift-louis-bouillot-glasses",
    name: "Louis Bouillot Brut Giftset w/ 2 Glasses",
    size: "750ml + glasses",
    taste: ["Apple", "Pear"],
    description: "Elegant sparkling from Burgundy aged 12 months on lees. Toasty, clean, perfect alternative to Champagne.",
    category: "gifting",
    priceInCents: 4400,
    maxQuantity: 3,
    featured: true,
  },
  {
    id: "gift-wolcott-bourbon-trio",
    name: "Wolcott Cask Collection Bourbon Trio",
    size: "3x 375ml",
    taste: ["Intense", "Oak", "Rye", "Fruit"],
    description: "Three bourbon expressions: easy-drinking, Bottled in Bond, and Rickhouse Reserve. Great for bourbon lovers.",
    category: "gifting",
    priceInCents: 6600,
    maxQuantity: 3,
  },
];

export const getItemById = (id: string): DrinkItem | undefined =>
  CATALOG.find((item) => item.id === id);

export const getItemsByCategory = (category: DrinkCategory): DrinkItem[] =>
  CATALOG.filter((item) => item.category === category);
