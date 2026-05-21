'use client';

/** Immersive retail photography background with slow motion & parallax. */

const SCENES = {
  /** Bright boutique / clothing store aisle */
  main: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&q=85&auto=format&fit=crop',
  /** Fashion shopping — depth on the right */
  accent: 'https://images.unsplash.com/photo-1483985988350-763728e3685b?w=1200&q=85&auto=format&fit=crop',
  /** Bags / checkout vibe — foreground feel */
  foreground: 'https://images.unsplash.com/photo-1555529669-2269763671c4?w=1400&q=85&auto=format&fit=crop',
} as const;

export const HERO_FEATURED_IMAGE =
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=85&auto=format&fit=crop';

interface ShoppingSceneBackgroundProps {
  className?: string;
  scrollY?: number;
}

export default function ShoppingSceneBackground({
  className = '',
  scrollY = 0,
}: ShoppingSceneBackgroundProps) {
  const parallaxMain = scrollY * 0.28;
  const parallaxAccent = scrollY * 0.15;
  const parallaxFg = scrollY * 0.4;

  return (
    <div className={`shopping-scene-bg ${className}`} aria-hidden>
      {/* Main store interior — slow zoom */}
      <div
        className="shopping-scene-bg__layer shopping-scene-bg__layer--main"
        style={{
          backgroundImage: `url(${SCENES.main})`,
          transform: `translate3d(0, ${parallaxMain}px, 0) scale(1.08)`,
        }}
      />

      {/* Right side — shopper / fashion depth */}
      <div
        className="shopping-scene-bg__layer shopping-scene-bg__layer--accent"
        style={{
          backgroundImage: `url(${SCENES.accent})`,
          transform: `translate3d(0, ${parallaxAccent}px, 0)`,
        }}
      />

      {/* Bottom — mall aisle / walking vibe */}
      <div
        className="shopping-scene-bg__layer shopping-scene-bg__layer--foreground"
        style={{
          backgroundImage: `url(${SCENES.foreground})`,
          transform: `translate3d(0, ${parallaxFg}px, 0)`,
        }}
      />

      {/* Metallic grey-blue wash — shiny brand overlay */}
      <div className="shopping-scene-bg__wash" />

      {/* Soft vignette for text contrast */}
      <div className="shopping-scene-bg__vignette" />

      {/* Light shimmer */}
      <div className="shopping-scene-bg__shimmer" />
    </div>
  );
}
