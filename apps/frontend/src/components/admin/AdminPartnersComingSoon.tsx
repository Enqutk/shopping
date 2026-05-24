'use client';

import { adminUi } from '../../lib/admin-ui';

const PARTNERS = [
  {
    id: 'delivery',
    title: 'Register delivery partner',
    description: 'Onboard riders and couriers to fulfill LUXE orders in your area.',
    icon: 'M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0',
  },
  {
    id: 'shop',
    title: 'Register shop owner',
    description: 'List your boutique or studio on LUXE and reach new customers.',
    icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
  },
] as const;

export default function AdminPartnersComingSoon() {
  return (
    <section className="space-y-4">
      <div>
        <h2 className={adminUi.sectionTitle}>Partner onboarding</h2>
        <p className={`text-xs ${adminUi.muted} mt-1 normal-case tracking-normal`}>
          Delivery &amp; shop owner registration — launching soon.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {PARTNERS.map((p) => (
          <div key={p.id} className={`${adminUi.cardPad} relative`}>
            <span className="absolute top-4 right-4 px-2.5 py-1 rounded-full bg-femme-black/80 border border-femme-champagne/40 text-[10px] font-bold uppercase tracking-wider text-femme-champagne">
              Coming soon
            </span>

            <div className={`${adminUi.iconBox} w-11 h-11 mb-4`}>
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d={p.icon}
                />
              </svg>
            </div>

            <h3 className="font-display text-lg text-arctic-deep uppercase tracking-wide pr-24">
              {p.title}
            </h3>
            <p className={`text-sm ${adminUi.muted} mt-2 leading-relaxed normal-case tracking-normal`}>
              {p.description}
            </p>

            <button
              type="button"
              disabled
              className={`mt-5 w-full py-2.5 rounded-lg border ${adminUi.borderSubtle} bg-femme-black/40 text-arctic-light text-[10px] font-bold uppercase tracking-[0.15em] cursor-not-allowed`}
            >
              Not available yet
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
