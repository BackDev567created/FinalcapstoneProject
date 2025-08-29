// App Constants
export const APP_CONFIG = {
  NAME: "Culing's LPG Outlet",
  VERSION: '1.0.0',
  PRIMARY_COLOR: '#4189C8',
  SECONDARY_COLOR: '#6c757d',
} as const;

// API Constants
export const API_ENDPOINTS = {
  BASE_URL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000',
  SUPABASE_URL: 'https://yfpfhjyxdesqffxebmze.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmcGZoanl4ZGVzcWZmeGVibXplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3NTcyMTYsImV4cCI6MjA2OTMzMzIxNn0.PMedmP5LeFOE4KNmMBwE-h1MUaQ7NyfCaaMu_SVpw0A',
} as const;

// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  CUSTOMER: 'customer',
} as const;

// Order Status
export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PREPARING: 'preparing',
  OUT_FOR_DELIVERY: 'out_for_delivery',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
} as const;

// Payment Methods
export const PAYMENT_METHODS = {
  COD: 'cod',
  GCASH: 'gcash',
} as const;

// Product Options
export const PRODUCT_OPTIONS = {
  SWAP: 'swap',
  NEW: 'new',
} as const;

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
  THEME: 'theme',
  CART: 'cart',
  NOTIFICATION_SETTINGS: 'notification_settings',
} as const;

// Notification Types
export const NOTIFICATION_TYPES = {
  ORDER_STATUS: 'order_status',
  STOCK_ALERT: 'stock_alert',
  CHAT_MESSAGE: 'chat_message',
  DELIVERY_UPDATE: 'delivery_update',
} as const;

// Default Admin Credentials
export const DEFAULT_ADMIN = {
  USERNAME: 'admin',
  PASSWORD: 'admin123',
} as const;

// Stock Alert Thresholds
export const STOCK_THRESHOLDS = {
  LOW_STOCK: 10,
  OUT_OF_STOCK: 0,
} as const;

// Delivery Settings
export const DELIVERY_CONFIG = {
  MAX_DELIVERY_DISTANCE: 50, // km
  DELIVERY_FEE: 50,
  FREE_DELIVERY_THRESHOLD: 1000,
} as const;

// Chat Settings
export const CHAT_CONFIG = {
  MAX_MESSAGE_LENGTH: 500,
  MESSAGE_EXPIRY_DAYS: 30,
} as const;

// Analytics Periods
export const ANALYTICS_PERIODS = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
} as const;

// File Upload Settings
export const UPLOAD_CONFIG = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  RECEIPT_FOLDER: 'receipts',
  PRODUCT_FOLDER: 'products',
} as const;

// Rate Limiting
export const RATE_LIMITS = {
  AUTH_ATTEMPTS: 5,
  WINDOW_MINUTES: 15,
  GENERAL_REQUESTS: 100,
} as const;

// Real-time Channels
export const REALTIME_CHANNELS = {
  PRODUCTS: 'products',
  ORDERS: 'orders',
  CHAT: 'chat',
  STOCK_ALERTS: 'stock_alerts',
  LOCATION_UPDATES: 'location_updates',
} as const;