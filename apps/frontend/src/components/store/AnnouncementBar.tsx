export default function AnnouncementBar() {
  return (
    <div className="bg-luxe-ink text-white/90 text-[11px] sm:text-xs tracking-[0.2em] uppercase text-center py-2.5 px-4">
      <span className="inline-flex items-center gap-2 flex-wrap justify-center">
        <span aria-hidden="true">✦</span>
        Free shipping on orders over $100
        <span className="hidden sm:inline text-white/40">|</span>
        <span className="hidden sm:inline">New collection live now</span>
        <span aria-hidden="true">✦</span>
      </span>
    </div>
  );
}
