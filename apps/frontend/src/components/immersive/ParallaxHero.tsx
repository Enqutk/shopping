'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState, type ReactNode } from 'react';
import TiltCard from './TiltCard';
import ShoppingSceneBackground, { HERO_FEATURED_IMAGE } from './ShoppingSceneBackground';
import { CATEGORY_TILES } from '../../lib/category-tiles';

interface ParallaxHeroProps {
  children?: ReactNode;
}

export default function ParallaxHero({ children }: ParallaxHeroProps) {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const contentShift = scrollY * 0.12;

  return (
    <section className="immersive-hero relative min-h-[92vh] flex items-end overflow-hidden">
      <ShoppingSceneBackground scrollY={scrollY} className="z-0" />

      <div
        className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-24 pt-28 sm:pt-36"
        style={{ transform: `translate3d(0, ${contentShift}px, 0)` }}
      >
        <div className="grid lg:grid-cols-2 gap-12 items-end">
          <div className="immersive-hero__copy" style={{ transform: 'translateZ(48px)' }}>
            <p className="text-luxe-accent text-xs font-bold uppercase tracking-[0.4em] mb-4">
              Collection Arctic 01™
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold uppercase tracking-[0.08em] text-arctic-deep leading-[1.1] text-balance drop-shadow-sm">
              Walk the
              <br />
              <span className="text-luxe-accent">virtual aisle</span>
            </h1>
            <p className="mt-6 text-arctic-deep/80 text-sm sm:text-base max-w-md leading-relaxed normal-case tracking-normal font-normal">
              Step inside a real boutique — browse shoes, clothes, accessories & more like you&apos;re
              there shopping.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-6">
              <Link href="/products" className="btn-primary">
                Start shopping
                <span className="w-8 h-8 rounded-full bg-white/30 flex items-center justify-center text-sm" aria-hidden="true">↗</span>
              </Link>
              <span className="text-arctic-deep/50 text-xs uppercase tracking-widest">Scroll the store</span>
            </div>
          </div>

          <TiltCard className="hidden lg:block max-w-sm ml-auto" maxTilt={10} lift={36}>
            <div className="hero-product-orbit">
              <div className="hero-product-orbit__ring" />
              <Image
                src={HERO_FEATURED_IMAGE}
                alt="Featured sneaker"
                width={400}
                height={400}
                className="hero-product-orbit__img"
                priority
              />
            </div>
            <div className="glass-panel rounded-arctic p-6 shadow-arctic-lg -mt-2">
              <p className="text-luxe-accent text-[10px] uppercase tracking-[0.3em]">Featured drop</p>
              <p className="text-2xl font-bold uppercase tracking-wide text-arctic-deep mt-2">Arctic Edition</p>
              <p className="text-arctic-deep/60 text-sm mt-2 normal-case tracking-normal">Fresh in store today</p>
              <p className="text-3xl font-semibold text-luxe-accent mt-4">From $49</p>
              <Link href="/products?category=shoes" className="mt-6 btn-circle" aria-label="Shop shoes">
                →
              </Link>
            </div>
          </TiltCard>
        </div>

        <div className="hidden lg:flex flex-wrap gap-3 mt-12 text-[10px] font-bold uppercase tracking-widest text-arctic-deep/60">
          {CATEGORY_TILES.map((c) => (
            <Link key={c.value} href={c.href} className="hover:text-luxe-accent transition-colors">
              {c.label}
            </Link>
          ))}
        </div>
      </div>
      {children}
    </section>
  );
}
