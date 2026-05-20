'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import axios from 'axios';
import StoreHeader from '../../../components/StoreHeader';
import type { OrderDetail } from '@shopping/shared';
import { useRealtimeStore } from '../../../store/realtime.store';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const orderIdNum = Number(id);
  const liveStatus = useRealtimeStore((s) =>
    Number.isFinite(orderIdNum) ? s.orderStatusById[orderIdNum] : undefined,
  );
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await axios.get<OrderDetail>(`${API}/orders/${id}`, {
          withCredentials: true,
        });
        if (!cancelled) setOrder(res.data);
      } catch {
        if (!cancelled) setNotFound(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <StoreHeader />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        <Link href="/orders" className="text-sm text-gray-500 hover:text-indigo-600 mb-6 inline-block">
          ← All orders
        </Link>

        {loading ? (
          <div className="flex justify-center py-24">
            <div className="w-9 h-9 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : notFound || !order ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center">
            <p className="text-gray-900 font-semibold">Order not found</p>
            <Link href="/orders" className="text-indigo-600 text-sm mt-4 inline-block hover:underline">
              Back to order history
            </Link>
          </div>
        ) : (
          <>
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Order #{order.id}</h1>
                <p className="text-sm text-gray-500 mt-1">
                  {new Date(order.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-xs font-semibold text-gray-500 uppercase">Total</p>
                <p className="text-2xl font-bold text-indigo-600">
                  ${Number(order.totalPrice).toFixed(2)}
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  Status:{' '}
                  <span className="font-semibold">
                    {liveStatus ?? order.status}
                  </span>
                  {liveStatus && liveStatus !== order.status && (
                    <span className="ml-2 text-xs text-emerald-600 font-medium">(live)</span>
                  )}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-5 py-3 font-semibold text-gray-700">Product</th>
                    <th className="px-5 py-3 font-semibold text-gray-700 w-28">Qty</th>
                    <th className="px-5 py-3 font-semibold text-gray-700 text-right w-32">
                      Line total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {order.items.map((line) => (
                    <tr key={line.id}>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex items-center justify-center shrink-0">
                            {line.productImageUrl ? (
                              <img
                                src={line.productImageUrl}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-lg">📦</span>
                            )}
                          </div>
                          <div>
                            <Link
                              href={`/products/${line.productId}`}
                              className="font-medium text-gray-900 hover:text-indigo-600"
                            >
                              {line.productName || `Product #${line.productId}`}
                            </Link>
                            <p className="text-xs text-gray-500 mt-0.5">
                              ${Number(line.price).toFixed(2)} each
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-gray-700">{line.quantity}</td>
                      <td className="px-5 py-4 text-right font-semibold text-gray-900">
                        ${(Number(line.price) * line.quantity).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
