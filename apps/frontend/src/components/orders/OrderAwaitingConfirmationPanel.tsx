'use client';

type Props = {
  orderId: number;
  totalPrice: string;
};

export default function OrderAwaitingConfirmationPanel({ orderId, totalPrice }: Props) {
  return (
    <div className="arctic-card p-6 border border-femme-champagne/30 text-center">
      <div className="mx-auto w-14 h-14 rounded-full bg-femme-champagne/15 border border-femme-champagne/40 flex items-center justify-center mb-4">
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-femme-champagne opacity-60" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-femme-champagne" />
        </span>
      </div>
      <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-femme-champagne mb-2">
        Payment received
      </h2>
      <p className="text-sm text-arctic-deep normal-case max-w-md mx-auto leading-relaxed">
        Thank you! We&apos;re confirming your payment of{' '}
        <span className="text-femme-champagne font-semibold">
          ${Number(totalPrice).toFixed(2)}
        </span>
        .
      </p>
      <p className="text-xs text-arctic-light mt-3 normal-case max-w-sm mx-auto">
        Please wait for a notification while your payment is verified. This usually takes a
        few minutes.
      </p>
      <p className="text-[10px] uppercase tracking-wider text-arctic-light/70 mt-5">
        Order #{orderId} · Awaiting confirmation
      </p>
    </div>
  );
}
