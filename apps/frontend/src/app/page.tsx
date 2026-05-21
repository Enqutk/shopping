import Link from 'next/link';
import StoreHeader from '../components/StoreHeader';
import StoreFooter from '../components/store/StoreFooter';
import FeaturedProducts from '../components/store/FeaturedProducts';
import FashionHero from '../components/store/FashionHero';
import StoreScene from '../components/immersive/StoreScene';
import { CATEGORY_TILES } from '../lib/category-tiles';

const CATEGORY_BG: Record<string, string> = {
  shoes: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=400&q=80',
  clothes: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?auto=format&fit=crop&w=400&q=80',
  accessories: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=400&q=80',
  furniture: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=400&q=80',
  electronics: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80',
};

export default function HomePage() {
  return (
    <div className="store-page">
      <StoreScene>
        <StoreHeader transparent />

        <main id="main-content" className="flex-1">
          <FashionHero />

          <section className="py-12 sm:py-16 border-t border-white/5">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="fashion-section-title mb-10">Shop by collection</h2>
              <div className="flex flex-wrap justify-center gap-8 sm:gap-10 lg:gap-12">
                {CATEGORY_TILES.map((c) => (
                  <Link key={c.value} href={c.href} className="fashion-category-circle">
                    <div className="fashion-category-circle__ring">
                      <img
                        src={CATEGORY_BG[c.value] ?? c.image}
                        alt=""
                        className="fashion-category-circle__img"
                      />
                    </div>
                    <span className="fashion-category-circle__label">{c.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </section>

          <div className="femme-celebrate">
            <p className="femme-celebrate__script">Natural Beauty</p>
            <h2 className="femme-celebrate__title">Clothing Store</h2>
            <p className="section-sub mx-auto mt-4 text-center">
              Editorial essentials across every category — timeless pieces for the modern wardrobe.
            </p>
            <div className="femme-divider" />
            <Link href="/products" className="btn-ghost">
              Explore catalog
            </Link>
          </div>

          <FeaturedProducts />
        </main>

        <StoreFooter />
      </StoreScene>
    </div>
  );
}
