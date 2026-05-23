'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import StoreHeader from '../../../components/StoreHeader';
import StoreFooter from '../../../components/store/StoreFooter';
import StoreScene from '../../../components/immersive/StoreScene';
import ProductViewer3D from '../../../components/immersive/ProductViewer3D';
import type { Product } from '@shopping/shared';
import { findColorOption, getCategoryLabel, getProductOptions } from '@shopping/shared';
import { useCartStore } from '../../../store/cart.store';
import { useToastStore } from '../../../store/toast.store';
import { apiFetch } from '../../../lib/api-client';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const addProduct = useCartStore((s) => s.addProduct);
  const toastSuccess = useToastStore((s) => s.success);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [color, setColor] = useState('');
  const [size, setSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [tab, setTab] = useState<'description' | 'reviews'>('description');

  const options = useMemo(
    () => (product ? getProductOptions(product.category, product.id) : null),
    [product],
  );

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await apiFetch(`/products/${id}`);
        if (res.status === 404) {
          setNotFound(true);
          return;
        }
        const data = await res.json();
        setProduct(data);
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    void fetchProduct();
  }, [id]);

  useEffect(() => {
    if (!options) return;
    setColor(options.defaultColor);
    if (options.showSize && options.defaultSize) {
      setSize(options.defaultSize);
    } else {
      setSize('');
    }
    setQuantity(1);
  }, [options, product?.id]);

  const selectedColor = options ? findColorOption(options.colors, color) : undefined;

  const cartOptions = useMemo(
    () => ({
      color: color || undefined,
      size: options?.showSize && size ? size : undefined,
    }),
    [color, size, options?.showSize],
  );

  const addToCart = (redirectToCart = false) => {
    if (!product || product.stock === 0) return;
    addProduct(product, quantity, cartOptions);
    toastSuccess('Added to cart', '/cart');
    if (redirectToCart) router.push('/cart');
  };

  if (loading) {
    return (
      <div className="store-page">
        <StoreScene>
          <StoreHeader />
          <div className="flex flex-1 items-center justify-center">
            <div className="w-10 h-10 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </div>
        </StoreScene>
      </div>
    );
  }

  if (notFound || !product || !options) {
    return (
      <div className="store-page">
        <StoreScene>
          <StoreHeader />
          <div className="flex flex-1 flex-col items-center justify-center px-4">
            <h2 className="section-heading">Not found</h2>
            <Link
              href="/products"
              className="mt-4 text-sm uppercase tracking-widest text-luxe-accent hover:underline"
            >
              ← Back to catalog
            </Link>
          </div>
          <StoreFooter />
        </StoreScene>
      </div>
    );
  }

  return (
    <div className="store-page">
      <StoreScene>
        <StoreHeader />
        <main
          id="main-content"
          className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1"
        >
          <Link
            href="/products"
            className="text-xs uppercase tracking-widest text-arctic-deep/50 hover:text-luxe-accent mb-8 inline-block"
          >
            ← Catalog
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-start">
            <div
              className="rounded-2xl transition-shadow duration-300"
              style={{
                boxShadow: selectedColor
                  ? `0 0 0 2px ${selectedColor.hex}40, 0 24px 48px rgba(0,0,0,0.35)`
                  : undefined,
              }}
            >
              <ProductViewer3D imageUrl={product.imageUrl} name={product.name} />
            </div>

            <div
              className="flex flex-col lg:sticky lg:top-28"
              style={{ transform: 'translateZ(32px)' }}
            >
              {product.category && (
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-luxe-accent">
                  {getCategoryLabel(product.category)}
                </span>
              )}
              <h1 className="text-3xl sm:text-4xl font-bold uppercase tracking-wide text-arctic-deep mt-2 leading-tight">
                {product.name}
              </h1>
              <div className="flex items-center gap-3 mt-3">
                <span className="text-amber-500 text-sm font-medium">★ 4.8</span>
                <span className="text-arctic-deep/20">|</span>
                <span className="text-xs text-arctic-deep/60 uppercase tracking-wider">
                  {product.stock > 0 ? `${product.stock} in stock` : 'Sold out'}
                </span>
              </div>

              <p className="text-4xl font-bold text-luxe-accent mt-6 drop-shadow-sm">
                ${Number(product.price).toFixed(2)}
              </p>

              <div className="mt-8">
                <p className="text-xs font-bold uppercase tracking-widest text-arctic-deep/60 mb-3">
                  Color — {color}
                </p>
                <div className="flex flex-wrap gap-3" role="group" aria-label="Select color">
                  {options.colors.map((c) => (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => setColor(c.name)}
                      title={c.name}
                      aria-label={c.name}
                      aria-pressed={color === c.name}
                      className={`w-10 h-10 rounded-full border-2 transition-all ${
                        color === c.name
                          ? 'border-femme-champagne scale-110'
                          : 'border-white/20 hover:border-white/50'
                      }`}
                      style={{ backgroundColor: c.hex }}
                    />
                  ))}
                </div>
              </div>

              {options.showSize && options.sizes.length > 0 && (
                <div className="mt-8">
                  <p className="text-xs font-bold uppercase tracking-widest text-arctic-deep/60 mb-3">
                    Size
                  </p>
                  <div className="flex flex-wrap gap-2" role="group" aria-label="Select size">
                    {options.sizes.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSize(s)}
                        className={`min-w-[2.75rem] h-11 px-3 rounded-xl text-sm font-semibold transition-colors ${
                          size === s
                            ? 'bg-femme-champagne text-femme-black border-femme-champagne'
                            : 'border border-white/30 text-arctic-light hover:border-femme-champagne bg-transparent'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-8">
                <p className="text-xs font-bold uppercase tracking-widest text-arctic-deep/60 mb-3">
                  Quantity
                </p>
                <div className="inline-flex items-center rounded-xl border border-white/30">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-11 h-11 text-lg text-arctic-light hover:text-femme-champagne"
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <span className="w-12 text-center text-sm font-semibold text-white">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setQuantity((q) => Math.min(product.stock, q + 1))
                    }
                    disabled={quantity >= product.stock}
                    className="w-11 h-11 text-lg text-arctic-light hover:text-femme-champagne disabled:opacity-40"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="mt-8 flex gap-2">
                {(['description', 'reviews'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTab(t)}
                    className={`px-5 py-2 rounded-full text-sm font-medium capitalize transition-colors ${
                      tab === t
                        ? 'bg-femme-champagne text-femme-black border-femme-champagne'
                        : 'btn-filter'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <p className="mt-4 text-arctic-deep/70 leading-relaxed text-sm normal-case tracking-normal font-normal">
                {tab === 'description'
                  ? product.description ||
                    'Premium quality piece from our curated collection. Crafted for comfort and style.'
                  : 'Reviews coming soon — be the first to share your experience.'}
              </p>

              {(color || size) && (
                <p className="mt-6 text-xs text-arctic-light normal-case tracking-normal">
                  Selected:{' '}
                  {[color, size].filter(Boolean).join(' · ')}
                </p>
              )}

              <div className="mt-10 flex gap-3">
                <button
                  type="button"
                  disabled={product.stock === 0}
                  onClick={() => addToCart(false)}
                  className="w-14 h-14 rounded-2xl border border-white/30 flex items-center justify-center text-white hover:border-femme-champagne transition-colors disabled:opacity-40 bg-transparent"
                  aria-label="Add to cart"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z"
                    />
                  </svg>
                </button>
                <button
                  type="button"
                  disabled={product.stock === 0}
                  onClick={() => addToCart(true)}
                  className="flex-1 btn-primary py-4"
                >
                  {product.stock === 0 ? 'Out of stock' : 'Buy now'}
                </button>
              </div>
            </div>
          </div>
        </main>
        <StoreFooter />
      </StoreScene>
    </div>
  );
}
