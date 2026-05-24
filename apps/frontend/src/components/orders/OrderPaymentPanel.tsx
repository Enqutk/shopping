'use client';

import Link from 'next/link';
import { useState } from 'react';
import { apiFetch } from '../../lib/api-client';
import type { OrderDetail } from '@shopping/shared';
import { useToastStore } from '../../store/toast.store';

type Props = {
  orderId: number;
  totalPrice: string;
  onPaid: (order: OrderDetail) => void;
};

export default function OrderPaymentPanel({ orderId, totalPrice, onPaid }: Props) {
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [expiry, setExpiry] = useState('12/28');
  const [cvc, setCvc] = useState('123');
  const toastSuccess = useToastStore((s) => s.success);

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setPaying(true);
    try {
      const res = await apiFetch(`/orders/pay/${orderId}`, { method: 'POST' });
      if (res.status === 401) {
        setError('Your session expired. Sign in again to complete payment.');
        return;
      }
      if (res.status === 404) {
        setError('Payment service unavailable. Restart the API server and try again.');
        return;
      }
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { message?: unknown } | null;
        const msg = body?.message;
        setError(
          Array.isArray(msg) ? msg.join(', ') : msg ? String(msg) : 'Payment failed. Please try again.',
        );
        return;
      }
      const data = (await res.json()) as OrderDetail;
      toastSuccess('Payment submitted; awaiting confirmation');
      onPaid(data);
    } catch {
      setError('Payment failed. Please try again.');
    } finally {
      setPaying(false);
    }
  };

  const loginHref = `/login?returnUrl=${encodeURIComponent(`/orders/${orderId}`)}`;

  return (
    <div className="arctic-card p-5 border border-femme-champagne/25">
      <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-femme-champagne mb-1">
        Payment required
      </h2>
      <p className="text-xs text-arctic-light mb-4 normal-case">
        Complete payment to confirm your order. Demo checkout: no real card is charged.
      </p>

      <form onSubmit={handlePay} className="space-y-3">
        <div>
          <label className="block text-[10px] uppercase tracking-wider text-arctic-light mb-1">
            Card number
          </label>
          <input
            type="text"
            inputMode="numeric"
            autoComplete="cc-number"
            placeholder="4242 4242 4242 4242"
            value={cardNumber}
            onChange={(e) => setCardNumber(e.target.value)}
            className="w-full bg-white/5 border border-white/15 rounded-lg px-3 py-2 text-sm text-arctic-deep placeholder:text-arctic-light/40 focus:border-femme-champagne/50 focus:outline-none"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-arctic-light mb-1">
              Expiry
            </label>
            <input
              type="text"
              autoComplete="cc-exp"
              placeholder="MM/YY"
              value={expiry}
              onChange={(e) => setExpiry(e.target.value)}
              className="w-full bg-white/5 border border-white/15 rounded-lg px-3 py-2 text-sm text-arctic-deep focus:border-femme-champagne/50 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-arctic-light mb-1">
              CVC
            </label>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="cc-csc"
              placeholder="123"
              value={cvc}
              onChange={(e) => setCvc(e.target.value)}
              className="w-full bg-white/5 border border-white/15 rounded-lg px-3 py-2 text-sm text-arctic-deep focus:border-femme-champagne/50 focus:outline-none"
            />
          </div>
        </div>

        {error && (
          <div className="text-xs text-rose-300 space-y-2">
            <p>{error}</p>
            {error.includes('session expired') && (
              <Link href={loginHref} className="text-femme-champagne underline hover:no-underline">
                Sign in
              </Link>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={paying}
          className="w-full mt-2 py-3 rounded-lg bg-femme-champagne text-femme-black text-[11px] font-bold uppercase tracking-[0.15em] hover:bg-femme-champagne-light transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {paying && (
            <span className="w-4 h-4 border-2 border-femme-black border-t-transparent rounded-full animate-spin" />
          )}
          {paying ? 'Processing…' : `Pay $${Number(totalPrice).toFixed(2)}`}
        </button>
      </form>
    </div>
  );
}
