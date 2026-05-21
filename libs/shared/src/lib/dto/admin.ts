import type { OrderStatus } from './order.js';

export interface AdminStatsTotals {
  products: number;
  orders: number;
  revenue: string;
  customers: number;
  lowStock: number;
}

export interface AdminStats {
  totals: AdminStatsTotals;
  ordersByStatus: Record<OrderStatus, number>;
  revenueByDay: { date: string; revenue: string }[];
  recentOrders: AdminOrderSummary[];
}

export interface AdminOrderSummary {
  id: number;
  userId: number;
  userName?: string | null;
  userEmail?: string | null;
  totalPrice: string;
  status: OrderStatus;
  createdAt: string;
  itemCount: number;
}

export interface PaginatedAdminOrders {
  data: AdminOrderSummary[];
  total: number;
  page: number;
  limit: number;
}
