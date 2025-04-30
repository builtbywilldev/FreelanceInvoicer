import { pgTable, text, serial, integer, numeric, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Line item schema
export const lineItemSchema = z.object({
  id: z.string(),
  description: z.string().min(1, "Description is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  price: z.number().min(0, "Price cannot be negative"),
});

export type LineItem = z.infer<typeof lineItemSchema>;

// Invoice schema
export const invoiceSchema = z.object({
  id: z.string(),
  businessName: z.string().min(1, "Business name is required"),
  businessEmail: z.string().email().optional().or(z.literal("")),
  businessAddress: z.string().optional().or(z.literal("")),
  businessPhone: z.string().optional().or(z.literal("")),
  clientName: z.string().min(1, "Client name is required"),
  clientEmail: z.string().email().optional().or(z.literal("")),
  clientAddress: z.string().optional().or(z.literal("")),
  clientPhone: z.string().optional().or(z.literal("")),
  invoiceNumber: z.string().min(1, "Invoice number is required"),
  invoiceDate: z.string().min(1, "Invoice date is required"),
  dueDate: z.string().min(1, "Due date is required"),
  notes: z.string().optional().or(z.literal("")),
  lineItems: z.array(lineItemSchema),
  taxRate: z.number().min(0, "Tax rate cannot be negative").max(100, "Tax rate cannot exceed 100%"),
  subtotal: z.number(),
  tax: z.number(),
  total: z.number(),
  createdAt: z.date(),
});

export type Invoice = z.infer<typeof invoiceSchema>;

// Lunch Planner schema
export const dayMealSchema = z.object({
  id: z.string(),
  day: z.enum(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']),
  mainMeal: z.string().optional().or(z.literal("")),
  snack: z.string().optional().or(z.literal("")),
  drink: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
});

export type DayMeal = z.infer<typeof dayMealSchema>;

export const lunchPlanSchema = z.object({
  id: z.string(),
  name: z.string().default("Weekly Lunch Plan"),
  days: z.array(dayMealSchema),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type LunchPlan = z.infer<typeof lunchPlanSchema>;

// We don't need database tables since we're using localStorage
// but we keep the structure here for consistency

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
