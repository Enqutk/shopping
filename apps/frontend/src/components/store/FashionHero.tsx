import Link from 'next/link';

export default function FashionHero() {
  return (
    <section className="fashion-hero-wrap max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-32 pb-8">
      <div className="fashion-hero">
        <div className="fashion-hero__slides" aria-hidden="true">
          <div className="fashion-hero__slide fashion-hero__slide--1" />
          <div className="fashion-hero__slide fashion-hero__slide--2" />
          <div className="fashion-hero__slide fashion-hero__slide--3" />
        </div>

        <div className="fashion-hero__panel">
          <p className="font-script text-femme-champagne text-3xl sm:text-4xl lg:text-5xl leading-none mb-2">
            Celebrate Your Beauty!
          </p>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-semibold uppercase tracking-[0.08em] text-white leading-tight">
            Seasonal Sale
          </h1>
          <p className="fashion-hero__subtitle">
            Curated shoes, clothes, accessories &amp; more: editorial picks for every aisle.
          </p>
          <Link href="/products" className="btn-ghost mt-6">
            Shop now
          </Link>
        </div>

        <div className="fashion-hero__dots" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      </div>
    </section>
  );
}
