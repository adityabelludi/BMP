import type { Product, ProductVariant, SizeCode } from "@/types";
import { SIZE_PRICING, SIZE_WEIGHTS } from "@/lib/constants";

function buildVariants(): ProductVariant[] {
  return (Object.keys(SIZE_PRICING) as SizeCode[]).map((size) => ({
    size,
    price: SIZE_PRICING[size],
    weight_grams: SIZE_WEIGHTS[size],
  }));
}

// Brand product photography stored in /public/products.
const IMG = {
  pulihora: "/products/pulihora_powder.png",
  bisibele: "/products/bisi_bele_bath_powder.png",
  sambar: "/products/sambar_powder.png",
  holige: "/products/holige_sambar_powder.png",
  kurshani: "/products/kurshani_chutney_powder.png",
  kadle: "/products/kadle_chutney_powder.png",
  shenga: "/products/Shengha_chutney_powder.png",
  vangi: "/products/vangi_bath.png",
} as const;

// Use a reliable, theme-appropriate fallback image for all cards so a broken
// Unsplash URL never leaves a blank card.
export const FALLBACK_IMAGE =
  "https://placehold.co/800x800/FF9933/FFFFFF/png?text=BMP+Masala";

type Seed = Omit<
  Product,
  "id" | "variants" | "created_at" | "in_stock"
> & {
  variants?: ProductVariant[];
  in_stock?: boolean;
};

const seed: Seed[] = [
  {
    slug: "pulihora-powder",
    name: "Pulihora Powder",
    short_description: "Tangy tamarind rice mix, temple-style.",
    description:
      "Our Pulihora (tamarind rice) powder is a fragrant blend of roasted lentils, sesame, curry leaves and tangy tamarind — the same recipe served as prasadam in Karnataka temples. Just mix with hot rice and a spoon of ghee for an instant, soul-warming meal.",
    image_url: IMG.pulihora,
    spice_default: "Medium",
    category: "Rice Mixes",
    is_bestseller: true,
  },
  {
    slug: "bisi-bele-bath-powder",
    name: "Bisi Bele Bath Powder",
    short_description: "Karnataka's iconic hot lentil-rice spice.",
    description:
      "Bisi Bele Bath — literally 'hot lentil rice' — is Karnataka's most beloved comfort dish. Our stone-ground masala balances 12 spices, roasted dals and dagad phool for that unmistakable aroma. Cook with rice, toor dal and vegetables for a complete one-pot meal.",
    image_url: IMG.bisibele,
    spice_default: "Medium",
    category: "Rice Mixes",
    is_bestseller: true,
  },
  {
    slug: "sambar-powder",
    name: "Sambar Powder",
    short_description: "Everyday South Indian sambar, done right.",
    description:
      "A perfectly balanced sambar powder made from sun-dried red chillies, coriander, roasted dals and fenugreek. Rich, aromatic and never bitter — the backbone of everyday South Indian cooking. Works beautifully for sambar, rasam and vegetable curries.",
    image_url: IMG.sambar,
    spice_default: "Medium",
    category: "Curry Powders",
    is_bestseller: true,
  },
  {
    slug: "holige-sambar-powder",
    name: "Holige Sambar Powder",
    short_description: "Festive sweet-savoury holige accompaniment.",
    description:
      "A specialty blend crafted to pair with holige (obbattu). This nuanced sambar powder brings a gentle sweetness and depth that complements festive meals. A Karnataka festival table essential.",
    image_url: IMG.holige,
    spice_default: "Medium",
    category: "Curry Powders",
    is_bestseller: false,
  },
  {
    slug: "kurshani-chutney-powder",
    name: "Kurshani Chutney Powder",
    short_description: "Fiery red chilli chutney podi.",
    description:
      "Kurshani (red chilli) chutney powder for those who love heat with flavour. Roasted chillies, garlic and tamarind pound into a bold, punchy podi. Mix with oil or ghee and pair with idli, dosa, or hot rice.",
    image_url: IMG.kurshani,
    spice_default: "High",
    category: "Chutney Powders",
    is_bestseller: false,
  },
  {
    slug: "kadle-chutney-powder",
    name: "Kadle Chutney Powder",
    short_description: "Roasted gram (putani) chutney podi.",
    description:
      "Made from roasted Bengal gram (kadle / putani), this nutty, protein-rich chutney powder is a breakfast staple. Lightly spiced and deeply satisfying with idli, dosa and akki rotti.",
    image_url: IMG.kadle,
    spice_default: "Medium",
    category: "Chutney Powders",
    is_bestseller: true,
  },
  {
    slug: "shenga-chutney-powder",
    name: "Shenga Chutney Powder",
    short_description: "North-Karnataka groundnut chutney podi.",
    description:
      "Shenga (groundnut) chutney powder is North Karnataka's pride. Roasted peanuts, garlic and red chilli come together in a rich, earthy podi that is unbeatable with jowar rotti and a drizzle of oil.",
    image_url: IMG.shenga,
    spice_default: "Medium",
    category: "Chutney Powders",
    is_bestseller: true,
  },
  {
    slug: "vangi-bath-powder",
    name: "Vangi Bath Powder",
    short_description: "Aromatic brinjal rice masala.",
    description:
      "Vangi Bath powder transforms brinjal and rice into a fragrant, restaurant-style delight. A signature Karnataka blend of coriander, chana dal, cinnamon and coconut for warm, layered flavour in minutes.",
    image_url: IMG.vangi,
    spice_default: "Medium",
    category: "Rice Mixes",
    is_bestseller: false,
  },
];

/**
 * The full product catalog with variants attached.
 * Used both by the seed script and as an offline fallback when Supabase
 * is not configured (so the UI never renders empty during local dev).
 */
export const PRODUCTS: Product[] = seed.map((p, i) => ({
  ...p,
  id: `seed-${i + 1}`,
  in_stock: p.in_stock ?? true,
  variants: p.variants ?? buildVariants(),
}));

export function getProductBySlug(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}
