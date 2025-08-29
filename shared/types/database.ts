// Database Types and Interfaces
export interface User {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  address?: string;
  role: 'admin' | 'customer';
  created_at: Date;
  updated_at: Date;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  weight: string;
  price: number;
  image_url?: string;
  option: 'swap' | 'new';
  stock_quantity: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Order {
  id: string;
  user_id: string;
  total_amount: number;
  payment_method: 'cod' | 'gcash';
  status: 'pending' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';
  delivery_address: string;
  delivery_date?: Date;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  option: 'swap' | 'new';
}

export interface ChatMessage {
  id: string;
  order_id?: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  is_read: boolean;
  created_at: Date;
}

export interface Receipt {
  id: string;
  order_id: string;
  receipt_url: string;
  created_at: Date;
}

export interface Location {
  id: string;
  order_id: string;
  latitude: number;
  longitude: number;
  timestamp: Date;
}

// Admin specific types
export interface Admin {
  id: string;
  username: string;
  password_hash: string;
  created_at: Date;
}

export interface SalesAnalytics {
  total_sales: number;
  total_orders: number;
  total_customers: number;
  period: 'daily' | 'weekly' | 'monthly';
  date: Date;
}

export interface StockAlert {
  product_id: string;
  product_name: string;
  current_stock: number;
  threshold: number;
  alert_type: 'low_stock' | 'out_of_stock';
  created_at: Date;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Form types
export interface LoginForm {
  email: string;
  password: string;
}

export interface SignupForm {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
  address?: string;
}

export interface ProductForm {
  name: string;
  description?: string;
  weight: string;
  price: number;
  option: 'swap' | 'new';
  stock_quantity: number;
  image?: string;
}

export interface OrderForm {
  items: Array<{
    product_id: string;
    quantity: number;
    option: 'swap' | 'new';
  }>;
  payment_method: 'cod' | 'gcash';
  delivery_address: string;
  delivery_date?: Date;
  notes?: string;
}

// Real-time event types
export interface RealtimeEvent {
  type: 'product_update' | 'order_status' | 'chat_message' | 'stock_alert' | 'location_update';
  payload: any;
}

// Notification types
export interface PushNotification {
  title: string;
  body: string;
  data?: any;
}