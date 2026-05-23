'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import StoreHeader from '../../components/StoreHeader';
import StoreFooter from '../../components/store/StoreFooter';
import StoreScene from '../../components/immersive/StoreScene';
import { cartLineId, useCartStore } from '../../store/cart.store';

function formatItemCount(count: number): string {
  if (count === 0) return 'Empty';
  return `${count} ${count === 1 ? 'item' : 'items'}`;
}

export default function CartPage() {
  const { items, setQuantity, removeLine } = useCartStore();

  const itemCount = useMemo(
    () => items.reduce((n, i) => n + i.quantity, 0),
    [items],
  );

  const subtotal = useMemo(
    () => items.reduce((sum, line) => sum + Number(line.price) * line.quantity, 0),
    [items],
  );

  return (
    <div className="store-page">
      <StoreScene>
        <StoreHeader />
        <main
          id="main-content"
          className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8 w-full flex-1"
        >
          <div className="flex items-baseline justify-between gap-4 mb-6 border-b border-white/10 pb-4">
            <div>
              <h1 className="text-lg font-display uppercase tracking-[0.12em] text-arctic-deep">
                Cart
              </h1>
              <p className="text-xs text-arctic-light mt-0.5 normal-case tracking-normal">
                {formatItemCount(itemCount)}
              </p>
            </div>
            <Link
              href="/products"
              className="text-[10px] uppercase tracking-wider text-arctic-light hover:text-femme-champagne"
            >
              Continue shopping
            </Link>
          </div>

          {items.length === 0 ? (
            <p className="text-sm text-arctic-light py-8">
              Nothing here yet.{' '}
              <Link href="/products" className="text-femme-champagne hover:underline">
                Shop
              </Link>
            </p>
          ) : (
            <div className="grid sm:grid-cols-[1fr_200px] gap-8 sm:gap-10 items-start">
              <ul className="divide-y divide-white/10">
                {items.map((line) => {
                  const opts = { color: line.color, size: line.size };
                  const lineTotal = Number(line.price) * line.quantity;

                  return (
                    <li
                      key={cartLineId(line)}
                      className="flex gap-3 py-4 first:pt-0"
                    >
                      <Link
                        href={`/products/${line.productId}`}
                        className="w-20 h-20 sm:w-[5.5rem] sm:h-[5.5rem] shrink-0 overflow-hidden bg-white/5 border border-white/10"
                      >
                        {line.imageUrl ? (
                          <img
                            src={line.imageUrl}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : null}
                      </Link>

                      <div className="flex-1 min-w-0 grid grid-cols-[1fr_auto] gap-x-3 gap-y-1">
                        <Link
                          href={`/products/${line.productId}`}
                          className="text-sm text-arctic-deep hover:text-femme-champagne line-clamp-2 col-span-2 sm:col-span-1"
                        >
                          {line.name}
                        </Link>
                        <p className="text-sm text-femme-champagne text-right sm:row-span-2 sm:self-start">
                          ${lineTotal.toFixed(2)}
                        </p>

                        {(line.color || line.size) && (
                          <p className="text-[11px] text-arctic-light/80 col-span-2 sm:col-span-1 normal-case">
                            {[line.color, line.size].filter(Boolean).join(' · ')}
                          </p>
                        )}

                        <div className="col-span-2 sm:col-span-1 flex items-center gap-3 mt-1">
                          <div className="inline-flex items-center text-xs border border-white/15 rounded">
                            <button
                              type="button"
                              onClick={() =>
                                setQuantity(line.productId, line.quantity - 1, opts)
                              }
                              className="w-6 h-6 text-arctic-light hover:text-femme-champagne"
                              aria-label="Decrease"
                            >
                              −
                            </button>
                            <span className="w-7 text-center text-arctic-deep tabular-nums">
                              {line.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                setQuantity(line.productId, line.quantity + 1, opts)
                              }
                              disabled={line.quantity >= line.stock}
                              className="w-6 h-6 text-arctic-light hover:text-femme-champagne disabled:opacity-30"
                              aria-label="Increase"
                            >
                              +
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeLine(line.productId, opts)}
                            className="text-[10px] uppercase tracking-wider text-arctic-light/60 hover:text-arctic-deep"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>

              <aside className="sm:sticky sm:top-20 text-sm border-t sm:border-t-0 sm:border-l border-white/10 pt-6 sm:pt-0 sm:pl-8">
                <div className="flex justify-between text-arctic-light mb-1">
                  <span>Subtotal</span>
                  <span className="text-arctic-deep tabular-nums">
                    ${subtotal.toFixed(2)}
                  </span>
                </div>
                <p className="text-[11px] text-arctic-light/60 mb-4 normal-case">
                  Shipping at checkout
                </p>
                <Link
                  href="/checkout"
                  className="block w-full text-center text-[10px] font-bold uppercase tracking-[0.15em] py-2 bg-femme-champagne text-femme-black hover:bg-femme-champagne-light transition-colors"
                >
                  Checkout
                </Link>
              </aside>
            </div>
          )}
        </main>
        <StoreFooter />
      </StoreScene>
    </div>
  );
}
