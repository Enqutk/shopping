/** Shared LUXE-themed classes for the admin panel (matches storefront). */

export const adminUi = {
  spinner:
    'w-10 h-10 border-2 border-femme-champagne border-t-transparent rounded-full animate-spin',
  pageTitle:
    'font-display text-2xl sm:text-3xl font-semibold uppercase tracking-[0.12em] text-arctic-deep',
  pageSub: 'text-sm text-arctic-light mt-1 normal-case tracking-normal font-normal',
  card: 'arctic-card border border-white/10 bg-femme-surface/90 overflow-hidden',
  cardPad: 'arctic-card border border-white/10 bg-femme-surface/90 p-6',
  sectionTitle: 'text-[10px] font-bold uppercase tracking-[0.2em] text-femme-champagne',
  muted: 'text-arctic-light',
  label: 'text-[10px] uppercase tracking-wider text-arctic-light',
  body: 'text-sm text-arctic-deep',
  input: 'auth-input w-full',
  select: 'auth-input w-full py-2.5 cursor-pointer',
  textarea: 'auth-input w-full resize-y min-h-[80px]',
  tableHead: 'border-b border-white/10 text-arctic-light text-[10px] uppercase tracking-wider',
  tableRow: 'border-white/5 hover:bg-white/5 cursor-pointer transition-colors',
  link: 'text-xs font-semibold uppercase tracking-wider text-femme-champagne hover:text-femme-champagne-light transition-colors',
  btnPrimary:
    'inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-femme-champagne text-femme-black text-[11px] font-bold uppercase tracking-[0.15em] hover:bg-femme-champagne-light transition-colors disabled:opacity-50 shadow-[0_0_20px_rgba(201,169,98,0.15)]',
  btnSecondary:
    'inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg border border-white/25 text-arctic-deep text-[11px] font-bold uppercase tracking-[0.15em] hover:border-femme-champagne hover:text-femme-champagne transition-colors',
  navActive:
    'flex items-center px-4 py-3 rounded-lg bg-femme-champagne/12 text-femme-champagne border border-femme-champagne/30 transition-all',
  navInactive:
    'flex items-center px-4 py-3 rounded-lg text-arctic-light hover:text-femme-champagne hover:bg-white/5 border border-transparent transition-all',
  divide: 'divide-white/10',
  borderSubtle: 'border-white/10',
  empty: 'py-12 text-center text-arctic-light text-sm arctic-card border border-white/10 p-8',
  errorBox: 'arctic-card border border-rose-500/30 bg-rose-500/10 p-8 text-center',
  iconBox:
    'w-8 h-8 rounded-lg bg-femme-champagne/10 border border-femme-champagne/25 flex items-center justify-center shrink-0',
  orderCard:
    'arctic-card border border-white/10 p-4 sm:p-5 hover:border-femme-champagne/35 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-femme-champagne/40',
};

export function adminStatusBadge(status: string): string {
  switch (status) {
    case 'PAID':
      return 'bg-emerald-500/15 text-emerald-200 border-emerald-500/35';
    case 'AWAITING_CONFIRMATION':
      return 'bg-violet-500/15 text-violet-200 border-violet-500/35';
    case 'SHIPPED':
      return 'bg-sky-500/15 text-sky-200 border-sky-500/35';
    case 'CANCELLED':
      return 'bg-rose-500/15 text-rose-200 border-rose-500/35';
    default:
      return 'bg-amber-500/15 text-amber-200 border-amber-500/35';
  }
}
