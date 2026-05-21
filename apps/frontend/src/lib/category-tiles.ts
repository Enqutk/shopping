import { PRODUCT_CATEGORIES } from '@shopping/shared';

export const CATEGORY_TILES = PRODUCT_CATEGORIES.filter((c) => c.value).map((cat) => {
  const images: Record<string, string> = {
    shoes: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=500&fit=crop',
    clothes: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=500&h=500&fit=crop',
    accessories: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500&fit=crop',
    furniture: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500&h=500&fit=crop',
    electronics: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop',
  };
  return {
    ...cat,
    href: `/products?category=${cat.value}`,
    image: images[cat.value] ?? images.clothes,
  };
});
