export type OrderStatus = "PENDING" | "CONFIRMED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";

export interface OrderItem {
  id?: number;
  productId?: number;
  productName?: string;
  name?: string;
  quantity: number;
  unitPrice?: number;
  price?: number;
  total?: number;
  image?: string;
}

export interface Customer {
  id?: number;
  firstName?: string;
  lastName?: string;
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
}

export interface Order {
  id: number;
  orderNumber: string;
  status: OrderStatus | string;
  paymentStatus?: string;
  paymentMethod?: string;
  subtotal?: number;
  deliveryFee?: number;
  total: number;
  currency?: string;
  createdAt?: string;
  customer?: Customer;
  items?: OrderItem[];
}

export interface Product {
  id: number;
  name: string;
  category: string;
  scent?: string;
  price: number;
  image?: string;
  stock: number;
  active: boolean;
  description?: string;
}
