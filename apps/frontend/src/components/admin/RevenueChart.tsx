'use client';

interface DayPoint {
  date: string;
  revenue: string;
}

export default function RevenueChart({ data }: { data: DayPoint[] }) {
  const points = data.length > 0 ? data : [];
  const max = Math.max(...points.map((d) => Number(d.revenue)), 1);

  if (points.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-slate-500 text-sm">
        No revenue in the last 7 days
      </div>
    );
  }

  return (
    <div className="h-48 flex items-end gap-2 pt-4">
      {points.map((d) => {
        const pct = Math.max(8, (Number(d.revenue) / max) * 100);
        const label = new Date(d.date + 'T12:00:00').toLocaleDateString(undefined, {
          weekday: 'short',
        });
        return (
          <div key={d.date} className="flex-1 flex flex-col items-center gap-2 min-w-0">
            <span className="text-[10px] text-slate-500 tabular-nums">
              ${Number(d.revenue).toFixed(0)}
            </span>
            <div
              className="w-full rounded-t-lg bg-gradient-to-t from-indigo-600 to-indigo-400 transition-all"
              style={{ height: `${pct}%` }}
              title={`${d.date}: $${Number(d.revenue).toFixed(2)}`}
            />
            <span className="text-[10px] text-slate-400 truncate w-full text-center">{label}</span>
          </div>
        );
      })}
    </div>
  );
}
