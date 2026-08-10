import type { Product, UserWithPassword } from "@/lib/types";

export const SEED_USERS: UserWithPassword[] = [
  {
    id: "usr_admin_1",
    name: "Store Admin",
    email: "admin@tinystore.com",
    password: "admin123",
    role: "admin",
    createdAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "usr_user_1",
    name: "Demo Shopper",
    email: "user@tinystore.com",
    password: "user123",
    role: "user",
    createdAt: "2026-01-02T00:00:00.000Z",
  },
];

export const SEED_PRODUCTS: Product[] = [
  {
    id: "prd_1",
    name: "Cedar Desk Lamp",
    slug: "cedar-desk-lamp",
    description:
      "A warm, focused task lamp with a solid cedar base and linen shade. Soft ambient light for evening work without glare.",
    price: 68,
    image:
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80",
    category: "Lighting",
    stock: 24,
    createdAt: "2026-02-01T00:00:00.000Z",
    updatedAt: "2026-02-01T00:00:00.000Z",
  },
  {
    id: "prd_2",
    name: "Stoneware Mug Set",
    slug: "stoneware-mug-set",
    description:
      "Set of four handmade stoneware mugs with a speckled glaze. Comfortable handle and microwave-safe.",
    price: 42,
    image:
      "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=800&q=80",
    category: "Kitchen",
    stock: 56,
    createdAt: "2026-02-03T00:00:00.000Z",
    updatedAt: "2026-02-03T00:00:00.000Z",
  },
  {
    id: "prd_3",
    name: "Linen Throw Blanket",
    slug: "linen-throw-blanket",
    description:
      "Breathable European linen throw in soft oat. Washes beautifully and drapes naturally over a sofa or bed.",
    price: 89,
    image:
      "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=800&q=80",
    category: "Home",
    stock: 18,
    createdAt: "2026-02-05T00:00:00.000Z",
    updatedAt: "2026-02-05T00:00:00.000Z",
  },
  {
    id: "prd_4",
    name: "Walnut Cutting Board",
    slug: "walnut-cutting-board",
    description:
      "End-grain walnut board with juice groove. Food-safe oil finish; built for daily prep and serving.",
    price: 74,
    image:
      "https://images.unsplash.com/photo-1594221708779-94832f4320d1?w=800&q=80",
    category: "Kitchen",
    stock: 31,
    createdAt: "2026-02-08T00:00:00.000Z",
    updatedAt: "2026-02-08T00:00:00.000Z",
  },
  {
    id: "prd_5",
    name: "Ceramic Planter",
    slug: "ceramic-planter",
    description:
      "Matte charcoal ceramic planter with drainage hole and matching saucer. Suited for medium houseplants.",
    price: 36,
    image:
      "https://images.unsplash.com/photo-1485955900004-4fe4971b69a2?w=800&q=80",
    category: "Garden",
    stock: 40,
    createdAt: "2026-02-10T00:00:00.000Z",
    updatedAt: "2026-02-10T00:00:00.000Z",
  },
  {
    id: "prd_6",
    name: "Wool Runner Rug",
    slug: "wool-runner-rug",
    description:
      "Hand-tufted wool runner in muted olive. Dense pile that softens hallway footsteps and holds color well.",
    price: 156,
    image:
      "https://images.unsplash.com/photo-1600166898405-da9535204843?w=800&q=80",
    category: "Home",
    stock: 9,
    createdAt: "2026-02-12T00:00:00.000Z",
    updatedAt: "2026-02-12T00:00:00.000Z",
  },
];
