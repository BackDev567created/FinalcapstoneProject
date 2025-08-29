import { pgTable, text, integer, boolean, timestamp, uuid, decimal, jsonb, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users table (extends Supabase auth.users)
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  full_name: text('full_name').notNull(),
  phone: text('phone'),
  address: text('address'),
  role: text('role').notNull().default('customer'), // 'admin' or 'customer'
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  emailIdx: index('users_email_idx').on(table.email),
  roleIdx: index('users_role_idx').on(table.role),
}));

// Admins table (for default admin login)
export const admins = pgTable('admins', {
  id: uuid('id').primaryKey().defaultRandom(),
  username: text('username').notNull().unique(),
  password_hash: text('password_hash').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// Products table
export const products = pgTable('products', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  description: text('description'),
  weight: text('weight').notNull(), // e.g., "11kg", "22kg", "50kg"
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  image_url: text('image_url'),
  option: text('option').notNull(), // 'swap' or 'new'
  stock_quantity: integer('stock_quantity').notNull().default(0),
  is_active: boolean('is_active').notNull().default(true),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  nameIdx: index('products_name_idx').on(table.name),
  optionIdx: index('products_option_idx').on(table.option),
  activeIdx: index('products_active_idx').on(table.is_active),
}));

// Orders table
export const orders = pgTable('orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  total_amount: decimal('total_amount', { precision: 10, scale: 2 }).notNull(),
  payment_method: text('payment_method').notNull(), // 'cod' or 'gcash'
  status: text('status').notNull().default('pending'), // 'pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'
  delivery_address: text('delivery_address').notNull(),
  delivery_date: timestamp('delivery_date'),
  notes: text('notes'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  userIdx: index('orders_user_idx').on(table.user_id),
  statusIdx: index('orders_status_idx').on(table.status),
  createdAtIdx: index('orders_created_at_idx').on(table.created_at),
}));

// Order items table
export const orderItems = pgTable('order_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  order_id: uuid('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  product_id: uuid('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  quantity: integer('quantity').notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  option: text('option').notNull(), // 'swap' or 'new'
}, (table) => ({
  orderIdx: index('order_items_order_idx').on(table.order_id),
  productIdx: index('order_items_product_idx').on(table.product_id),
}));

// Chat messages table
export const chatMessages = pgTable('chat_messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  order_id: uuid('order_id').references(() => orders.id, { onDelete: 'cascade' }),
  sender_id: uuid('sender_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  receiver_id: uuid('receiver_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  message: text('message').notNull(),
  is_read: boolean('is_read').notNull().default(false),
  created_at: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  orderIdx: index('chat_messages_order_idx').on(table.order_id),
  senderIdx: index('chat_messages_sender_idx').on(table.sender_id),
  receiverIdx: index('chat_messages_receiver_idx').on(table.receiver_id),
  createdAtIdx: index('chat_messages_created_at_idx').on(table.created_at),
}));

// Receipts table
export const receipts = pgTable('receipts', {
  id: uuid('id').primaryKey().defaultRandom(),
  order_id: uuid('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  receipt_url: text('receipt_url').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  orderIdx: index('receipts_order_idx').on(table.order_id),
}));

// Location tracking table
export const locations = pgTable('locations', {
  id: uuid('id').primaryKey().defaultRandom(),
  order_id: uuid('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  latitude: decimal('latitude', { precision: 10, scale: 8 }).notNull(),
  longitude: decimal('longitude', { precision: 11, scale: 8 }).notNull(),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
}, (table) => ({
  orderIdx: index('locations_order_idx').on(table.order_id),
  timestampIdx: index('locations_timestamp_idx').on(table.timestamp),
}));

// Stock alerts table
export const stockAlerts = pgTable('stock_alerts', {
  id: uuid('id').primaryKey().defaultRandom(),
  product_id: uuid('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  product_name: text('product_name').notNull(),
  current_stock: integer('current_stock').notNull(),
  threshold: integer('threshold').notNull(),
  alert_type: text('alert_type').notNull(), // 'low_stock' or 'out_of_stock'
  is_resolved: boolean('is_resolved').notNull().default(false),
  created_at: timestamp('created_at').defaultNow().notNull(),
  resolved_at: timestamp('resolved_at'),
}, (table) => ({
  productIdx: index('stock_alerts_product_idx').on(table.product_id),
  typeIdx: index('stock_alerts_type_idx').on(table.alert_type),
  resolvedIdx: index('stock_alerts_resolved_idx').on(table.is_resolved),
}));

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  orders: many(orders),
  sentMessages: many(chatMessages, { relationName: 'sender' }),
  receivedMessages: many(chatMessages, { relationName: 'receiver' }),
}));

export const productsRelations = relations(products, ({ many }) => ({
  orderItems: many(orderItems),
  stockAlerts: many(stockAlerts),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.user_id],
    references: [users.id],
  }),
  items: many(orderItems),
  messages: many(chatMessages),
  receipts: many(receipts),
  locations: many(locations),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.order_id],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.product_id],
    references: [products.id],
  }),
}));

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  order: one(orders, {
    fields: [chatMessages.order_id],
    references: [orders.id],
  }),
  sender: one(users, {
    fields: [chatMessages.sender_id],
    references: [users.id],
    relationName: 'sender',
  }),
  receiver: one(users, {
    fields: [chatMessages.receiver_id],
    references: [users.id],
    relationName: 'receiver',
  }),
}));

export const receiptsRelations = relations(receipts, ({ one }) => ({
  order: one(orders, {
    fields: [receipts.order_id],
    references: [orders.id],
  }),
}));

export const locationsRelations = relations(locations, ({ one }) => ({
  order: one(orders, {
    fields: [locations.order_id],
    references: [orders.id],
  }),
}));

export const stockAlertsRelations = relations(stockAlerts, ({ one }) => ({
  product: one(products, {
    fields: [stockAlerts.product_id],
    references: [products.id],
  }),
}));