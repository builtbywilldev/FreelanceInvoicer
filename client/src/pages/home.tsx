import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import InvoiceForm from "@/components/invoice-form";
import InvoicePreview from "@/components/invoice-preview";
import { useLocalStorage } from "@/hooks/use-storage";
import { EyeIcon, PlusIcon } from "lucide-react";
import { Invoice } from "@shared/schema";
import { formatDate, generateInvoiceNumber } from "@/lib/utils";
import { v4 as uuidv4 } from 'uuid';
import { useMobile } from "@/hooks/use-mobile";

export default function Home() {
  const { invoice, saveInvoice, clearInvoice, loading } = useLocalStorage();
  const { isMobile } = useMobile();
  
  // For preview
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);
  
  // For mobile view toggling
  const [showMobilePreview, setShowMobilePreview] = useState(false);
  
  // Initialize a default empty invoice
  const today = new Date();
  const futureDate = new Date(today);
  futureDate.setDate(today.getDate() + 15);
  
  const defaultInvoice: Invoice = {
    id: uuidv4(),
    businessName: "",
    businessEmail: "",
    businessAddress: "",
    businessPhone: "",
    clientName: "",
    clientEmail: "",
    clientAddress: "",
    clientPhone: "",
    invoiceNumber: generateInvoiceNumber(),
    invoiceDate: formatDate(today),
    dueDate: formatDate(futureDate),
    notes: "",
    lineItems: [
      {
        id: uuidv4(),
        description: "",
        quantity: 1,
        price: 0
      }
    ],
    taxRate: 8.25,
    subtotal: 0,
    tax: 0,
    total: 0,
    createdAt: today
  };

  // Initialize preview once invoice is loaded
  useEffect(() => {
    if (invoice) {
      setPreviewInvoice(invoice);
    } else {
      setPreviewInvoice(defaultInvoice);
    }
  }, [invoice]);

  const handleUpdatePreview = (updatedInvoice: Invoice) => {
    setPreviewInvoice(updatedInvoice);
  };

  const handleNewInvoice = () => {
    if (window.confirm('Are you sure you want to create a new invoice? This will clear the current form.')) {
      clearInvoice();
      const newInvoice = {
        ...defaultInvoice,
        id: uuidv4(),
        invoiceNumber: generateInvoiceNumber(),
        createdAt: new Date()
      };
      setPreviewInvoice(newInvoice);
    }
  };

  const toggleMobilePreview = () => {
    setShowMobilePreview(!showMobilePreview);
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-slate-800">Freelancer Invoice Generator</h1>
            <div className="flex space-x-2">
              <Button 
                id="preview-toggle"
                variant="outline"
                className="px-4 py-2 bg-white text-primary border border-primary rounded-md hover:bg-primary hover:text-white transition-colors lg:hidden"
                onClick={toggleMobilePreview}
              >
                <EyeIcon className="mr-1 h-4 w-4" /> Preview
              </Button>
              <Button 
                id="new-invoice"
                variant="default"
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
                onClick={handleNewInvoice}
              >
                <PlusIcon className="mr-1 h-4 w-4" /> New Invoice
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Invoice Form Section */}
          <div 
            id="invoice-form-container" 
            className={`w-full lg:w-3/5 ${isMobile && showMobilePreview ? 'hidden' : 'block'}`}
          >
            {previewInvoice && (
              <InvoiceForm 
                initialInvoice={invoice} 
                onSave={saveInvoice}
                onUpdatePreview={handleUpdatePreview}
                showMobilePreview={showMobilePreview}
                toggleMobilePreview={toggleMobilePreview}
              />
            )}
          </div>

          {/* Invoice Preview Section */}
          <div 
            id="invoice-preview-container" 
            className={`w-full lg:w-2/5 ${isMobile && !showMobilePreview ? 'hidden' : 'block'}`}
          >
            {previewInvoice && <InvoicePreview invoice={previewInvoice} />}
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-slate-200 mt-8 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-slate-500">
            © {new Date().getFullYear()} Freelancer Invoice Generator. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
