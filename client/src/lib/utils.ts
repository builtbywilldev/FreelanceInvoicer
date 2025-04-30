import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  if (typeof date === 'string') {
    date = new Date(date);
  }
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDisplayDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
}

export function generateInvoiceNumber(): string {
  const today = new Date();
  const year = today.getFullYear().toString().substring(2);
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `INV-${year}${month}-${random}`;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
}

export function calculateTotals(
  lineItems: Array<{ quantity: number; price: number }>,
  taxRate: number = 8.25
) {
  const subtotal = lineItems.reduce((sum, item) => {
    return sum + (item.quantity * item.price);
  }, 0);
  
  // Convert percentage to decimal (e.g., 8.25% -> 0.0825)
  const taxRateDecimal = taxRate / 100;
  const tax = subtotal * taxRateDecimal;
  const total = subtotal + tax;
  
  return {
    subtotal,
    tax,
    total
  };
}
