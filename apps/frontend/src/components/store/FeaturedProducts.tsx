'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import type { Product } from '@shopping/shared';
import { PRODUCT_CATEGORIES } from '@shopping/shared';
import ProductCard from '../ProductCard';
import { ProductGridSkeleton } from '../ui/Skeleton';
import { apiFetch } from '../../lib/api-client';

interface FeaturedProductsProps {
  title?: string;
  subtitle?: string;
  limit?: number;
}

const FILTER_PILLS = PRODUCT_CATEGORIES.filter((c) => c.value).map((c) => c.label);

export default function FeaturedProducts({
  title = "Today's featured deals",
  subtitle = 'Editorial picks — limited seasonal offers',
  limit = 8,
}: FeaturedProductsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch(`/products?limit=${limit}&page=1`);
      if (!res.ok) {
        setError(`Could not load products (${res.status})`);
        setProducts([]);
        return;
      }
      const json = await res.json();
      setProducts(json.data ?? []);
    } catch {
      setError(
        'Store API is not reachable. Start the API in another terminal: npx nx serve api --configuration=development',
      );
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <section className="py-14 sm:py-20 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="font-script text-femme-champagne text-3xl text-center sm:text-left mb-1">Just for you</p>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-4">
          <div>
            <h2 className="fashion-section-title sm:text-left">{title}</h2>
            <p className="section-sub sm:text-left">{subtitle}</p>
          </div>
          <Link href="/products" className="fashion-see-all">
            See all deals →
          </Link>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {FILTER_PILLS.map((tag) => (
            <Link key={tag} href="/products" className="fashion-pill hover:border-fashion-accent/50 transition-colors">
              {tag}
            </Link>
          ))}
        </div>

        {loading ? (
          <ProductGridSkeleton count={8} />
        ) : error ? (
          <div className="arctic-card p-8 text-center max-w-lg mx-auto">
            <p className="text-sm text-arctic-deep/80 normal-case tracking-normal font-normal leading-relaxed">
              {error}
            </p>
            <button type="button" onClick={() => void load()} className="btn-primary mt-6">
              Retry
            </button>
          </div>
        ) : products.length === 0 ? (
          <p className="text-arctic-deep/50 text-sm">No products yet — add some in admin.</p>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} variant="deal" />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
