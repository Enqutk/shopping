'use client';

import { ORDER_DELIVERY_ESTIMATE } from '@shopping/shared';

export default function OrderDeliveryEstimatePanel() {
  return (
    <div className="arctic-card p-5 border border-emerald-500/30 bg-emerald-500/5">
      <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-300 mb-2">
        Payment confirmed
      </h2>
      <p className="text-sm text-arctic-deep normal-case leading-relaxed">{ORDER_DELIVERY_ESTIMATE}</p>
      <p className="text-xs text-arctic-light mt-2 normal-case">
        We&apos;ll notify you when your order ships.
      </p>
    </div>
  );
}
