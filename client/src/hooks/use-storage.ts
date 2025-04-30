import { useState, useEffect } from 'react';
import { Invoice, invoiceSchema } from '@shared/schema';

const STORAGE_KEY = 'savedInvoice';

export function useLocalStorage() {
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load invoice from localStorage on first render
  useEffect(() => {
    try {
      const savedData = localStorage.getItem(STORAGE_KEY);
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        // Convert the string dates into Date objects as needed
        if (parsedData.createdAt) {
          parsedData.createdAt = new Date(parsedData.createdAt);
        } else {
          parsedData.createdAt = new Date();
        }
        
        // Validate data against schema
        const result = invoiceSchema.safeParse(parsedData);
        if (result.success) {
          setInvoice(result.data);
        } else {
          console.error("Validation failed:", result.error);
          setError("Saved invoice data is invalid. Starting with a new invoice.");
          setInvoice(null);
        }
      }
    } catch (err) {
      console.error("Error loading from localStorage:", err);
      setError("Failed to load saved invoice. Starting with a new invoice.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Save invoice to localStorage
  const saveInvoice = (invoiceData: Invoice) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(invoiceData));
      setInvoice(invoiceData);
      return true;
    } catch (err) {
      console.error("Error saving to localStorage:", err);
      setError("Failed to save invoice data.");
      return false;
    }
  };

  // Clear invoice from localStorage
  const clearInvoice = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setInvoice(null);
      return true;
    } catch (err) {
      console.error("Error clearing localStorage:", err);
      setError("Failed to clear invoice data.");
      return false;
    }
  };

  return { 
    invoice, 
    saveInvoice, 
    clearInvoice, 
    loading, 
    error 
  };
}
