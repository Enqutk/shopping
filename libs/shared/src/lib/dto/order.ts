export type OrderStatus = 'PENDING' | 'PAID' | 'SHIPPED' | 'CANCELLED';

export interface CheckoutItemInput {
  productId: number;
  quantity: number;
}

export interface OrderSummary {
  id: number;
  totalPrice: string;
  status: OrderStatus;
  createdAt: string;
  itemCount: number;
}

export interface OrderItemLine {
  id: number;
  productId: number;
  quantity: number;
  price: string;
  productName: string | null;
  productImageUrl: string | null;
}

export interface OrderDetail {
  id: number;
  totalPrice: string;
  status: OrderStatus;
  createdAt: string;
  items: OrderItemLine[];
}
