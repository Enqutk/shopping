'use client';

import { useEffect, useId, useRef, useState } from 'react';

type Props = {
  minPrice: string;
  maxPrice: string;
  onApply: (min: string, max: string) => void;
  onClear: () => void;
};

export default function BudgetFilter({ minPrice, maxPrice, onApply, onClear }: Props) {
  const [open, setOpen] = useState(false);
  const [min, setMin] = useState(minPrice);
  const [max, setMax] = useState(maxPrice);
  const panelId = useId();
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMin(minPrice);
    setMax(maxPrice);
  }, [minPrice, maxPrice]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  const active = Boolean(minPrice || maxPrice);

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    let minVal = min.trim();
    let maxVal = max.trim();
    const minN = minVal ? Number(minVal) : NaN;
    const maxN = maxVal ? Number(maxVal) : NaN;
    if (!Number.isNaN(minN) && !Number.isNaN(maxN) && minN > maxN) {
      [minVal, maxVal] = [maxVal, minVal];
      setMin(minVal);
      setMax(maxVal);
    }
    onApply(minVal, maxVal);
    setOpen(false);
  };

  const handleClear = () => {
    setMin('');
    setMax('');
    onClear();
    setOpen(false);
  };

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
        className={`text-[10px] font-bold uppercase tracking-[0.15em] px-3 py-2 rounded-full border transition-colors whitespace-nowrap ${
          active
            ? 'border-femme-champagne bg-femme-champagne/15 text-femme-champagne'
            : 'border-white/25 text-arctic-light hover:border-femme-champagne hover:text-femme-champagne'
        }`}
      >
        Filter by budget{active ? ' ·' : ''}
      </button>

      {open && (
        <div
          id={panelId}
          className="absolute right-0 top-full mt-2 z-50 w-72 arctic-card border border-femme-champagne/30 p-4 shadow-arctic"
          role="dialog"
          aria-label="Filter by budget"
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-femme-champagne mb-3">
            Price range
          </p>
          <form onSubmit={handleApply} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-arctic-light mb-1">
                  Min ($)
                </label>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  inputMode="decimal"
                  placeholder="0"
                  value={min}
                  onChange={(e) => setMin(e.target.value)}
                  className="w-full bg-white/5 border border-white/15 rounded-lg px-3 py-2 text-sm text-arctic-deep placeholder:text-arctic-light/40 focus:border-femme-champagne/50 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-arctic-light mb-1">
                  Max ($)
                </label>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  inputMode="decimal"
                  placeholder="Any"
                  value={max}
                  onChange={(e) => setMax(e.target.value)}
                  className="w-full bg-white/5 border border-white/15 rounded-lg px-3 py-2 text-sm text-arctic-deep placeholder:text-arctic-light/40 focus:border-femme-champagne/50 focus:outline-none"
                />
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <button type="submit" className="btn-primary flex-1 py-2.5 text-[10px]">
                Apply
              </button>
              {active && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="btn-ghost flex-1 py-2.5 text-[10px] !px-3"
                >
                  Clear
                </button>
              )}
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
