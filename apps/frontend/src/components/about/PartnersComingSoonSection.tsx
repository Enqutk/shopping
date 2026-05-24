const ROLES = [
  {
    title: 'Delivery partners',
    tagline: 'Hard workers on the road',
    body: 'Riders who show up rain or shine: we see you. Partner registration opens soon.',
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
      />
    ),
  },
  {
    title: 'Shop owners',
    tagline: 'Makers & curators',
    body: 'Boutiques, studios, and local brands: bring your collection to LUXE. Applications opening soon.',
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
      />
    ),
  },
] as const;

export default function PartnersComingSoonSection() {
  return (
    <section className="relative py-16 sm:py-24 overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        aria-hidden
        style={{
          background:
            'radial-gradient(ellipse 80% 50% at 50% 100%, rgba(212, 175, 106, 0.12), transparent 70%)',
        }}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-12">
          <p className="font-script text-femme-champagne text-4xl sm:text-5xl mb-2">Coming soon</p>
          <h2 className="section-heading text-2xl sm:text-3xl text-arctic-deep">
            We&apos;ll collaborate with you
          </h2>
          <p className="text-sm sm:text-base text-arctic-light mt-4 max-w-xl mx-auto normal-case tracking-normal leading-relaxed">
            To every hardworking delivery partner and ambitious shop owner:{' '}
            <span className="text-femme-champagne">watch for us</span>. We&apos;re building something
            worth the wait, and we want you on the journey.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-6 sm:gap-8">
          {ROLES.map((role) => (
            <article
              key={role.title}
              className="arctic-card group relative p-6 sm:p-8 border border-femme-champagne/20 hover:border-femme-champagne/40 transition-colors"
            >
              <div className="absolute -top-px left-6 right-6 h-px bg-gradient-to-r from-transparent via-femme-champagne/50 to-transparent" />

              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-femme-champagne/10 border border-femme-champagne/30 text-[10px] font-bold uppercase tracking-[0.2em] text-femme-champagne mb-5">
                <span className="w-1.5 h-1.5 rounded-full bg-femme-champagne animate-pulse" />
                Coming soon
              </span>

              <div className="w-12 h-12 rounded-full border border-white/15 bg-white/5 flex items-center justify-center mb-4 text-femme-champagne group-hover:scale-105 transition-transform">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {role.icon}
                </svg>
              </div>

              <p className="text-[10px] uppercase tracking-[0.25em] text-arctic-light mb-1">
                {role.tagline}
              </p>
              <h3 className="font-display text-xl text-arctic-deep">{role.title}</h3>
              <p className="text-sm text-arctic-light mt-3 normal-case leading-relaxed">
                {role.body}
              </p>
            </article>
          ))}
        </div>

        <p className="text-center text-xs uppercase tracking-[0.3em] text-femme-champagne/70 mt-12">
          Stay tuned · LUXE partners program
        </p>
      </div>
    </section>
  );
}
