'use client';

import Link from 'next/link';
import type { Product } from '@shopping/shared';
import { getCategoryLabel } from '@shopping/shared';
import { useCartStore } from '../store/cart.store';
import { useToastStore } from '../store/toast.store';
import TiltCard from './immersive/TiltCard';

interface ProductCardProps {
  product: Product;
  variant?: 'default' | 'featured' | 'deal';
}

function displayOriginalPrice(price: number): number {
  return Number((price / 0.83).toFixed(2));
}

export default function ProductCard({ product, variant = 'default' }: ProductCardProps) {
  const addProduct = useCartStore((s) => s.addProduct);
  const toastSuccess = useToastStore((s) => s.success);
  const isFeatured = variant === 'featured';
  const isDeal = variant === 'deal';

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock === 0) return;
    addProduct(product, 1);
    toastSuccess(`${product.name} added to cart`, '/cart');
  };

  if (isDeal) {
    const price = Number(product.price);
    const original = displayOriginalPrice(price);
    return (
      <article className="fashion-deal-card h-full">
        <Link href={`/products/${product.id}`} className="block">
          <div className="fashion-deal-card__image">
            <span className="fashion-deal-card__badge">25% off</span>
            {product.imageUrl ? (
              <img src={product.imageUrl} alt={product.name} />
            ) : (
              <span className="text-xs text-arctic-light">No image</span>
            )}
            {product.stock === 0 && (
              <span className="absolute top-3 right-3 bg-femme-slate text-white text-[9px] font-bold uppercase px-2 py-0.5">
                Sold out
              </span>
            )}
          </div>
        </Link>
        <div className="fashion-deal-card__body">
          {product.category && (
            <p className="text-[10px] uppercase tracking-wider text-arctic-light mb-1">
              {getCategoryLabel(product.category)}
            </p>
          )}
          <Link href={`/products/${product.id}`}>
            <p className="fashion-deal-card__name hover:text-femme-champagne transition-colors">
              {product.name}
            </p>
          </Link>
          <div className="fashion-deal-card__prices">
            <span className="fashion-deal-card__price">${price.toFixed(2)}</span>
            <span className="fashion-deal-card__old">${original.toFixed(2)}</span>
          </div>
          <div className="fashion-deal-card__actions">
            <Link
              href={`/products/${product.id}`}
              className="fashion-deal-card__detail"
            >
              View detail
            </Link>
            <button
              type="button"
              onClick={handleAdd}
              disabled={product.stock === 0}
              className="fashion-deal-card__quick"
            >
              Quick add
            </button>
          </div>
        </div>
      </article>
    );
  }

  return (
    <TiltCard
      maxTilt={isFeatured ? 10 : 16}
      lift={isFeatured ? 40 : 32}
      className={`h-full ${isFeatured ? 'lg:min-h-[420px]' : ''}`}
    >
      <article className="group arctic-card flex flex-col h-full">
        <Link href={`/products/${product.id}`} className="block flex-1 flex flex-col">
          <div
            className={`relative overflow-hidden bg-arctic-mist/60 ${isFeatured ? 'aspect-[4/5]' : 'aspect-[3/4]'}`}
            style={{ transform: 'translateZ(12px)' }}
          >
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-4xl text-arctic-steel/50">✦</div>
            )}
            {product.stock === 0 && (
              <span className="absolute top-3 right-3 bg-rose-400 text-white text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-full">
                Sold out
              </span>
            )}
            <button
              type="button"
              onClick={handleAdd}
              disabled={product.stock === 0}
              className="absolute bottom-3 right-3 btn-circle w-10 h-10 text-sm opacity-0 group-hover:opacity-100 disabled:hidden"
              style={{ transform: 'translateZ(20px)' }}
              aria-label={`Add ${product.name} to cart`}
            >
              +
            </button>
          </div>
          <div className="p-4 flex-1 flex flex-col" style={{ transform: 'translateZ(8px)' }}>
            <h3 className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.15em] text-arctic-deep leading-snug line-clamp-2 group-hover:text-luxe-accent transition-colors">
              {product.name}
            </h3>
            {product.category && (
              <div className="flex gap-1.5 mt-2">
                <span className="w-2 h-2 rounded-full bg-luxe-accent" title={getCategoryLabel(product.category)} />
                <span className="w-2 h-2 rounded-full bg-arctic-steel" />
                <span className="w-2 h-2 rounded-full bg-arctic-glow" />
              </div>
            )}
            <p className="mt-auto pt-3 text-sm font-semibold text-luxe-accent tracking-wide">
              ${Number(product.price).toFixed(2)}
            </p>
          </div>
        </Link>
      </article>
    </TiltCard>
  );
}
