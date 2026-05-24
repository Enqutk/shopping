interface StatCardProps {
  label: string;
  value: string | number;
  hint?: string;
  accent?: 'champagne' | 'emerald' | 'amber' | 'rose' | 'steel';
}

const accents = {
  champagne:
    'from-femme-champagne/15 to-femme-champagne/5 border-femme-champagne/30',
  emerald: 'from-emerald-500/15 to-emerald-600/5 border-emerald-500/30',
  amber: 'from-amber-500/15 to-amber-600/5 border-amber-500/30',
  rose: 'from-rose-500/15 to-rose-600/5 border-rose-500/30',
  steel: 'from-arctic-mist/20 to-transparent border-white/15',
};

export default function StatCard({ label, value, hint, accent = 'champagne' }: StatCardProps) {
  return (
    <div
      className={`arctic-card rounded-arctic border bg-gradient-to-br p-5 ${accents[accent]}`}
    >
      <p className={`text-[10px] font-bold uppercase tracking-[0.2em] text-femme-champagne`}>
        {label}
      </p>
      <p className="text-3xl font-display font-semibold text-arctic-deep mt-2 tabular-nums tracking-wide">
        {value}
      </p>
      {hint && <p className={`text-xs text-arctic-light mt-2 normal-case tracking-normal`}>{hint}</p>}
    </div>
  );
}
