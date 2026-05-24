import { pgTable, serial, text, varchar, timestamp, pgEnum, integer, boolean, numeric, jsonb } from 'drizzle-orm/pg-core';

export type ProductColorJson = { name: string; hex: string };
import { relations } from 'drizzle-orm';

export const roleEnum = pgEnum('role', ['USER', 'ADMIN']);

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 256 }).notNull(),
  email: varchar('email', { length: 256 }).notNull().unique(),
  password: text('password'),
  avatar: text('avatar'),
  role: roleEnum('role').default('USER').notNull(),
  provider: varchar('provider', { length: 50 }).default('local').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const refreshTokens = pgTable('refresh_tokens', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  tokenHash: text('token_hash').notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  revoked: boolean('revoked').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 256 }).notNull(),
  description: text('description'),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  imageUrl: text('image_url'),
  stock: integer('stock').default(0).notNull(),
  category: varchar('category', { length: 100 }),
  availableColors: jsonb('available_colors').$type<ProductColorJson[] | null>(),
  availableSizes: jsonb('available_sizes').$type<string[] | null>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const orderStatusEnum = pgEnum('order_status', [
  'PENDING',
  'AWAITING_CONFIRMATION',
  'PAID',
  'SHIPPED',
  'CANCELLED',
]);

export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  totalPrice: numeric('total_price', { precision: 12, scale: 2 }).notNull(),
  status: orderStatusEnum('status').default('PENDING').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const orderItems = pgTable('order_items', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id')
    .references(() => orders.id, { onDelete: 'cascade' })
    .notNull(),
  productId: integer('product_id')
    .references(() => products.id, { onDelete: 'restrict' })
    .notNull(),
  quantity: integer('quantity').notNull(),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  color: varchar('color', { length: 64 }),
  size: varchar('size', { length: 32 }),
});

export const orderStatusEvents = pgTable('order_status_events', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id')
    .references(() => orders.id, { onDelete: 'cascade' })
    .notNull(),
  status: orderStatusEnum('status').notNull(),
  message: text('message').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  refreshTokens: many(refreshTokens),
  orders: many(orders),
}));

export const refreshTokensRelations = relations(refreshTokens, ({ one }) => ({
  user: one(users, {
    fields: [refreshTokens.userId],
    references: [users.id],
  }),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  items: many(orderItems),
  statusEvents: many(orderStatusEvents),
}));

export const orderStatusEventsRelations = relations(orderStatusEvents, ({ one }) => ({
  order: one(orders, {
    fields: [orderStatusEvents.orderId],
    references: [orders.id],
  }),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));

export const productsRelations = relations(products, ({ many }) => ({
  orderItems: many(orderItems),
}));
