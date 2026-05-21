'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { getCategoryLabel } from '@shopping/shared';
import ProductCard from '../../components/ProductCard';
import StoreHeader from '../../components/StoreHeader';
import StoreFooter from '../../components/store/StoreFooter';
import StoreScene from '../../components/immersive/StoreScene';
import CategoryChips from '../../components/store/CategoryChips';
import ErrorState from '../../components/ui/ErrorState';
import { ProductGridSkeleton } from '../../components/ui/Skeleton';
import { PaginatedProducts } from '@shopping/shared';
import { apiFetch } from '../../lib/api-client';

function ProductsContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [data, setData] = useState<PaginatedProducts | null>(null);
  const [search, setSearch] = useState(searchParams.get('q') ?? '');
  const category = searchParams.get('category') ?? '';
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const syncQuery = useCallback(
    (next: { category?: string; q?: string; page?: number }) => {
      const params = new URLSearchParams(searchParams.toString());
      if (next.category !== undefined) {
        if (next.category) params.set('category', next.category);
        else params.delete('category');
      }
      if (next.q !== undefined) {
        if (next.q) params.set('q', next.q);
        else params.delete('q');
      }
      if (next.page !== undefined && next.page > 1) params.set('page', String(next.page));
      else if (next.page === 1) params.delete('page');
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  useEffect(() => {
    const q = searchParams.get('q');
    if (q !== null) setSearch(q);
    const p = Number(searchParams.get('page'));
    setPage(Number.isFinite(p) && p > 0 ? p : 1);
  }, [searchParams]);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: '12',
        ...(search && { search }),
        ...(category && { category }),
      });
      const res = await apiFetch(`/products?${params}`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        const msg = (body as { message?: string }).message;
        throw new Error(typeof msg === 'string' ? msg : `Failed to load products (${res.status})`);
      }
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load products');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const debounce = setTimeout(() => void fetchProducts(), 300);
    return () => clearTimeout(debounce);
  }, [search, category, page]);

  const totalPages = data ? Math.ceil(data.total / data.limit) : 0;

  return (
    <div className="store-page">
      <StoreScene>
      <StoreHeader />

      <section className="pt-8 pb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="font-script text-femme-champagne text-2xl mb-1">New arrivals</p>
          <h1 className="section-heading">The collection</h1>
          <p className="section-sub mt-2">
            Shoes, clothes, accessories, furniture & electronics
          </p>
        </div>
      </section>

      <div className="sticky top-[4.5rem] z-40 bg-femme-black/95 backdrop-blur-md border-y border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <CategoryChips
              value={category}
              onChange={(c) => {
                setPage(1);
                syncQuery({ category: c, page: 1 });
              }}
            />
            <span className="hidden sm:inline fashion-see-all pointer-events-none">Browse all →</span>
          </div>
          <label className="fashion-search w-full max-w-md">
            <input
              type="search"
              placeholder="Search products..."
              aria-label="Search products"
              value={search}
              onChange={(e) => {
                const q = e.target.value;
                setSearch(q);
                setPage(1);
                syncQuery({ q, page: 1 });
              }}
              className="fashion-search__input w-full"
            />
          </label>
        </div>
      </div>

      <main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
        {error ? (
          <ErrorState message={error} onRetry={() => void fetchProducts()} />
        ) : loading ? (
          <ProductGridSkeleton count={12} />
        ) : data?.data.length === 0 ? (
          <div className="text-center py-24 max-w-md mx-auto">
            {data.total === 0 && !category && !search ? (
              <>
                <p className="font-script text-femme-champagne text-3xl">Coming soon</p>
                <p className="section-heading mt-4 text-xl">Catalog is empty</p>
                <p className="text-sm text-arctic-light mt-3 normal-case tracking-normal leading-relaxed">
                  No products in the database yet. Seed demo inventory or add items in admin.
                </p>
                <p className="text-xs text-arctic-light/70 mt-4 normal-case font-mono">
                  npx tsx scripts/seed-products.ts
                </p>
                <Link href="/admin/products/new" className="btn-ghost inline-block mt-8">
                  Add product in admin
                </Link>
              </>
            ) : (
              <>
                <p className="text-xl font-display uppercase tracking-widest text-white/50">No matches</p>
                <p className="text-sm text-arctic-light mt-2 normal-case">
                  {category
                    ? `Nothing in ${getCategoryLabel(category)} right now.`
                    : 'Try another category or search term.'}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearch('');
                    setPage(1);
                    syncQuery({ category: '', q: '', page: 1 });
                  }}
                  className="btn-ghost inline-block mt-8"
                >
                  View all products
                </button>
              </>
            )}
          </div>
        ) : (
          <>
            <p className="text-[10px] uppercase tracking-[0.25em] text-arctic-deep/50 mb-6">
              {data?.total} products
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {data?.data.map((product) => (
                <ProductCard key={product.id} product={product} variant="deal" />
              ))}
            </div>

            {totalPages > 1 && (
              <nav className="flex justify-center gap-2 mt-12" aria-label="Pagination">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="btn-filter disabled:opacity-40"
                >
                  Prev
                </button>
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  let p = i + 1;
                  if (totalPages > 7) {
                    if (page <= 4) p = i + 1;
                    else if (page >= totalPages - 3) p = totalPages - 6 + i;
                    else p = page - 3 + i;
                  }
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPage(p)}
                      className={p === page ? 'btn-filter-active' : 'btn-filter'}
                    >
                      {p}
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="btn-filter disabled:opacity-40"
                >
                  Next
                </button>
              </nav>
            )}
          </>
        )}
      </main>

      <StoreFooter />
      </StoreScene>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="store-page flex items-center justify-center">
          <div className="w-10 h-10 border-2 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}
