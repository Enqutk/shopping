interface StatCardProps {
  label: string;
  value: string | number;
  hint?: string;
  accent?: 'indigo' | 'emerald' | 'amber' | 'rose' | 'cyan';
}

const accents = {
  indigo: 'from-indigo-500/20 to-indigo-600/5 border-indigo-500/30 text-indigo-300',
  emerald: 'from-emerald-500/20 to-emerald-600/5 border-emerald-500/30 text-emerald-300',
  amber: 'from-amber-500/20 to-amber-600/5 border-amber-500/30 text-amber-300',
  rose: 'from-rose-500/20 to-rose-600/5 border-rose-500/30 text-rose-300',
  cyan: 'from-cyan-500/20 to-cyan-600/5 border-cyan-500/30 text-cyan-300',
};

export default function StatCard({ label, value, hint, accent = 'indigo' }: StatCardProps) {
  return (
    <div
      className={`rounded-2xl border bg-gradient-to-br p-5 ${accents[accent]}`}
    >
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</p>
      <p className="text-3xl font-extrabold text-white mt-2 tabular-nums">{value}</p>
      {hint && <p className="text-xs text-slate-500 mt-2">{hint}</p>}
    </div>
  );
}
