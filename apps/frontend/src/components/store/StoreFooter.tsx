import Link from 'next/link';
import { PRODUCT_CATEGORIES } from '@shopping/shared';

export default function StoreFooter() {
  const shopLinks = PRODUCT_CATEGORIES.filter((c) => c.value);

  return (
    <footer className="border-t border-white/10 bg-femme-black mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="text-center mb-10">
          <p className="font-script text-femme-champagne text-3xl">LUXE</p>
          <p className="font-display text-lg uppercase tracking-[0.2em] text-white/80 mt-2">
            Natural Beauty
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 text-center sm:text-left">
          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-[0.25em] text-femme-champagne mb-4">
              Shop
            </h3>
            <ul className="space-y-2 text-xs uppercase tracking-wider text-arctic-light">
              <li>
                <Link href="/products" className="hover:text-femme-champagne transition-colors">
                  All products
                </Link>
              </li>
              {shopLinks.map((c) => (
                <li key={c.value}>
                  <Link
                    href={`/products?category=${c.value}`}
                    className="hover:text-femme-champagne transition-colors"
                  >
                    {c.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-[0.25em] text-femme-champagne mb-4">
              Account
            </h3>
            <ul className="space-y-2 text-xs uppercase tracking-wider text-arctic-light">
              <li>
                <Link href="/orders" className="hover:text-femme-champagne transition-colors">
                  Orders
                </Link>
              </li>
              <li>
                <Link href="/cart" className="hover:text-femme-champagne transition-colors">
                  Cart
                </Link>
              </li>
              <li>
                <Link href="/profile" className="hover:text-femme-champagne transition-colors">
                  Profile
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-[0.25em] text-femme-champagne mb-4">
              Company
            </h3>
            <ul className="space-y-2 text-xs uppercase tracking-wider text-arctic-light mb-6">
              <li>
                <Link href="/about" className="hover:text-femme-champagne transition-colors">
                  About us
                </Link>
              </li>
            </ul>
            <h3 className="text-[10px] font-bold uppercase tracking-[0.25em] text-femme-champagne mb-4">
              Connect
            </h3>
            <p className="text-xs text-arctic-light normal-case tracking-normal">
              Instagram · Pinterest · Newsletter
            </p>
          </div>
        </div>
        <p className="text-[10px] uppercase tracking-widest text-arctic-light/60 mt-12 text-center">
          © {new Date().getFullYear()} LUXE — Premium fashion &amp; lifestyle
        </p>
      </div>
    </footer>
  );
}
