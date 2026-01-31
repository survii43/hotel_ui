import type { MenuCategory, MenuItemSummary } from '../api/types';

/** Scan API returns categoryId/itemId and nested items; we use id and MenuItemSummary shape. */
interface ScanCategory {
  categoryId?: string;
  name?: string;
  priority?: number;
  items?: ScanMenuItem[];
}

interface ScanMenuItem {
  itemId?: string;
  name?: string;
  description?: string | null;
  imageUrl?: string;
  isVeg?: boolean;
  price?: number;
  available?: boolean;
  variants?: { id: string; name: string; price?: number }[];
  addons?: { id: string; name: string; price?: number }[];
  tax?: { gstPercent?: number };
  tags?: string[];
}

interface ScanMenu {
  lastUpdated?: string;
  categories?: ScanCategory[];
}

export function normalizeScanMenu(scanMenu: ScanMenu | null | undefined): {
  categories: MenuCategory[];
  items: MenuItemSummary[];
} | null {
  if (!scanMenu?.categories?.length) return null;

  const categories: MenuCategory[] = scanMenu.categories.map((c) => ({
    id: c.categoryId ?? '',
    name: c.name ?? '',
    items: (c.items ?? []).map((i) => ({
      id: i.itemId ?? '',
      name: i.name ?? '',
      description: i.description ?? null,
      price: i.price,
      imageUrl: i.imageUrl ?? null,
      isVeg: i.isVeg,
      variants: i.variants ?? [],
      addons: i.addons ?? [],
    })),
  }));

  const items: MenuItemSummary[] = categories.flatMap((cat) => cat.items ?? []);

  return { categories, items };
}
