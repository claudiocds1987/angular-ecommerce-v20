import { OrderDetail } from './order-detail.model';

export interface Order {
  id: number;
  preferenceId: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  userId: number | null; // null porque puede ser un usuario invitado
  customerEmail: string;
  customerName: string;
  customerPhone: string;
  shippingAddress: string;
  shippingCity: string;
  shippingZipCode: string;
  details: OrderDetail[];
}
