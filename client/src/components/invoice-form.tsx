import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, Save, Download, Mail, Eye, Edit } from "lucide-react";
import { formatDate, generateInvoiceNumber, formatCurrency, calculateTotals } from "@/lib/utils";
import { Invoice, LineItem } from "@shared/schema";
import { v4 as uuidv4 } from 'uuid';
import LineItemComponent from "./line-item";
import { useToast } from "@/hooks/use-toast";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface InvoiceFormProps {
  initialInvoice: Invoice | null;
  onSave: (invoice: Invoice) => boolean;
  onUpdatePreview: (invoice: Invoice) => void;
  showMobilePreview: boolean;
  toggleMobilePreview: () => void;
}

export default function InvoiceForm({ 
  initialInvoice, 
  onSave, 
  onUpdatePreview,
  showMobilePreview,
  toggleMobilePreview
}: InvoiceFormProps) {
  const { toast } = useToast();
  const today = new Date();
  const futureDate = new Date(today);
  futureDate.setDate(today.getDate() + 15);

  // State for the form
  const [formData, setFormData] = useState<Invoice>({
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
  });

  // Initialize with saved data if available
  useEffect(() => {
    if (initialInvoice) {
      setFormData(initialInvoice);
    }
  }, [initialInvoice]);

  // Update calculations whenever lineItems or taxRate change
  useEffect(() => {
    const { subtotal, tax, total } = calculateTotals(formData.lineItems, formData.taxRate);
    setFormData(prev => ({
      ...prev,
      subtotal,
      tax,
      total
    }));
    
    // Update preview
    onUpdatePreview({
      ...formData,
      subtotal,
      tax,
      total
    });
  }, [formData.lineItems, formData.taxRate]);

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    
    // Handle numeric inputs (like taxRate)
    if (id === 'taxRate') {
      const numValue = parseFloat(value);
      setFormData(prev => ({
        ...prev,
        [id]: isNaN(numValue) ? 0 : numValue
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [id]: value
      }));
    }
  };

  // Add a new line item
  const addLineItem = () => {
    const newItem: LineItem = {
      id: uuidv4(),
      description: "",
      quantity: 1,
      price: 0
    };
    
    setFormData(prev => ({
      ...prev,
      lineItems: [...prev.lineItems, newItem]
    }));
  };

  // Update a line item
  const updateLineItem = (id: string, field: keyof LineItem, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      lineItems: prev.lineItems.map(item => 
        item.id === id 
          ? { ...item, [field]: typeof value === 'string' && field !== 'description' ? parseFloat(value) || 0 : value } 
          : item
      )
    }));
  };

  // Remove a line item
  const removeLineItem = (id: string) => {
    setFormData(prev => ({
      ...prev,
      lineItems: prev.lineItems.filter(item => item.id !== id)
    }));
  };

  // Save the invoice
  const handleSave = () => {
    // Validate required fields
    if (!formData.businessName) {
      toast({
        title: "Missing information",
        description: "Business name is required",
        variant: "destructive"
      });
      return;
    }
    
    if (!formData.clientName) {
      toast({
        title: "Missing information",
        description: "Client name is required",
        variant: "destructive"
      });
      return;
    }
    
    // Validate line items
    if (formData.lineItems.length === 0) {
      toast({
        title: "Missing information",
        description: "At least one line item is required",
        variant: "destructive"
      });
      return;
    }
    
    for (const item of formData.lineItems) {
      if (!item.description) {
        toast({
          title: "Missing information",
          description: "All line items require a description",
          variant: "destructive"
        });
        return;
      }
    }
    
    const success = onSave(formData);
    
    if (success) {
      toast({
        title: "Success",
        description: "Invoice saved successfully",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to save invoice",
        variant: "destructive"
      });
    }
  };

  // Download PDF
  const handleDownloadPDF = async () => {
    toast({
      title: "Generating PDF",
      description: "Please wait...",
    });
    
    try {
      // Make sure preview is updated
      onUpdatePreview(formData);
      
      // Delay to ensure the preview is rendered
      setTimeout(async () => {
        const element = document.getElementById('invoice-preview');
        if (!element) {
          throw new Error('Preview element not found');
        }
        
        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          logging: false
        });
        
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4'
        });
        
        const imgData = canvas.toDataURL('image/png');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
        const imgX = (pdfWidth - imgWidth * ratio) / 2;
        
        pdf.addImage(imgData, 'PNG', imgX, 0, imgWidth * ratio, imgHeight * ratio);
        pdf.save(`Invoice-${formData.invoiceNumber}.pdf`);
        
        toast({
          title: "Success",
          description: "PDF downloaded successfully",
        });
      }, 500);
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Error",
        description: "Failed to generate PDF",
        variant: "destructive"
      });
    }
  };

  // Mock email sending
  const handleSendEmail = () => {
    if (!formData.clientEmail) {
      toast({
        title: "Missing information",
        description: "Client email is required to send invoice",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Sending email",
      description: "Please wait...",
    });
    
    // Simulate email sending with a timeout
    setTimeout(() => {
      toast({
        title: "Success",
        description: `Invoice sent to ${formData.clientEmail}`,
      });
    }, 2000);
  };

  // Create a new invoice
  const handleNewInvoice = () => {
    if (window.confirm('Are you sure you want to create a new invoice? This will clear the current form.')) {
      setFormData({
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
        invoiceDate: formatDate(new Date()),
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
        createdAt: new Date()
      });
    }
  };

  return (
    <div id="invoice-form" className="bg-white rounded-lg shadow-md p-6">
      <div className="border-b border-slate-200 pb-4 mb-6">
        <h2 className="text-xl font-semibold text-slate-800">Invoice Details</h2>
      </div>

      {/* Business Information */}
      <div className="mb-6">
        <h3 className="text-md font-medium text-slate-700 mb-3">Business Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="businessName" className="text-sm font-medium text-slate-700 mb-1">
              Business Name*
            </Label>
            <Input 
              id="businessName" 
              type="text" 
              value={formData.businessName} 
              onChange={handleChange} 
              className="w-full px-3 py-2" 
              required 
            />
          </div>
          <div>
            <Label htmlFor="businessEmail" className="text-sm font-medium text-slate-700 mb-1">
              Business Email
            </Label>
            <Input 
              id="businessEmail" 
              type="email" 
              value={formData.businessEmail} 
              onChange={handleChange} 
              className="w-full px-3 py-2"
            />
          </div>
          <div>
            <Label htmlFor="businessAddress" className="text-sm font-medium text-slate-700 mb-1">
              Business Address
            </Label>
            <Textarea 
              id="businessAddress" 
              value={formData.businessAddress} 
              onChange={handleChange} 
              className="w-full px-3 py-2" 
              rows={2}
            />
          </div>
          <div>
            <Label htmlFor="businessPhone" className="text-sm font-medium text-slate-700 mb-1">
              Business Phone
            </Label>
            <Input 
              id="businessPhone" 
              type="tel" 
              value={formData.businessPhone} 
              onChange={handleChange} 
              className="w-full px-3 py-2"
            />
          </div>
        </div>
      </div>

      {/* Client Information */}
      <div className="mb-6">
        <h3 className="text-md font-medium text-slate-700 mb-3">Client Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="clientName" className="text-sm font-medium text-slate-700 mb-1">
              Client Name*
            </Label>
            <Input 
              id="clientName" 
              type="text" 
              value={formData.clientName} 
              onChange={handleChange} 
              className="w-full px-3 py-2" 
              required
            />
          </div>
          <div>
            <Label htmlFor="clientEmail" className="text-sm font-medium text-slate-700 mb-1">
              Client Email
            </Label>
            <Input 
              id="clientEmail" 
              type="email" 
              value={formData.clientEmail} 
              onChange={handleChange} 
              className="w-full px-3 py-2"
            />
          </div>
          <div>
            <Label htmlFor="clientAddress" className="text-sm font-medium text-slate-700 mb-1">
              Client Address
            </Label>
            <Textarea 
              id="clientAddress" 
              value={formData.clientAddress} 
              onChange={handleChange} 
              className="w-full px-3 py-2" 
              rows={2}
            />
          </div>
          <div>
            <Label htmlFor="clientPhone" className="text-sm font-medium text-slate-700 mb-1">
              Client Phone
            </Label>
            <Input 
              id="clientPhone" 
              type="tel" 
              value={formData.clientPhone} 
              onChange={handleChange} 
              className="w-full px-3 py-2"
            />
          </div>
        </div>
      </div>

      {/* Invoice Details */}
      <div className="mb-6">
        <h3 className="text-md font-medium text-slate-700 mb-3">Invoice Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="invoiceNumber" className="text-sm font-medium text-slate-700 mb-1">
              Invoice Number*
            </Label>
            <Input 
              id="invoiceNumber" 
              type="text" 
              value={formData.invoiceNumber} 
              onChange={handleChange} 
              className="w-full px-3 py-2" 
              required
            />
          </div>
          <div>
            <Label htmlFor="invoiceDate" className="text-sm font-medium text-slate-700 mb-1">
              Invoice Date*
            </Label>
            <Input 
              id="invoiceDate" 
              type="date" 
              value={formData.invoiceDate} 
              onChange={handleChange} 
              className="w-full px-3 py-2" 
              required
            />
          </div>
          <div>
            <Label htmlFor="dueDate" className="text-sm font-medium text-slate-700 mb-1">
              Due Date*
            </Label>
            <Input 
              id="dueDate" 
              type="date" 
              value={formData.dueDate} 
              onChange={handleChange} 
              className="w-full px-3 py-2" 
              required
            />
          </div>
        </div>
      </div>

      {/* Line Items */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-md font-medium text-slate-700">Line Items</h3>
          <Button 
            onClick={addLineItem} 
            size="sm" 
            className="px-3 py-1 bg-primary text-white text-sm rounded-md hover:bg-primary/90 transition-colors"
          >
            <PlusCircle className="mr-1 h-4 w-4" /> Add Item
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full" id="line-items-table">
            <thead>
              <tr className="text-left text-sm font-medium text-slate-700 border-b border-slate-200">
                <th className="pb-2 w-[40%]">Description</th>
                <th className="pb-2">Quantity</th>
                <th className="pb-2">Price</th>
                <th className="pb-2">Amount</th>
                <th className="pb-2 w-10"></th>
              </tr>
            </thead>
            <tbody id="line-items-body">
              {formData.lineItems.map((item) => (
                <LineItemComponent
                  key={item.id}
                  item={item}
                  onUpdate={updateLineItem}
                  onRemove={removeLineItem}
                />
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="mt-4 flex flex-col gap-2 items-end text-sm">
          <div className="flex w-full max-w-xs justify-between">
            <span className="text-slate-600">Subtotal:</span>
            <span id="subtotal" className="font-medium">{formatCurrency(formData.subtotal)}</span>
          </div>
          <div className="flex w-full max-w-xs justify-between items-center">
            <div className="flex items-center">
              <span className="text-slate-600 mr-2">Tax Rate:</span>
              <Input
                id="taxRate"
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={formData.taxRate}
                onChange={handleChange}
                className="w-16 px-2 py-1 text-right"
              />
              <span className="ml-1 text-slate-600">%</span>
            </div>
            <span id="tax" className="font-medium">{formatCurrency(formData.tax)}</span>
          </div>
          <div className="flex w-full max-w-xs justify-between pt-2 border-t border-slate-200">
            <span className="text-slate-800 font-medium">Total:</span>
            <span id="total" className="font-semibold">{formatCurrency(formData.total)}</span>
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="mb-6">
        <Label htmlFor="notes" className="text-sm font-medium text-slate-700 mb-1">
          Notes
        </Label>
        <Textarea 
          id="notes" 
          value={formData.notes} 
          onChange={handleChange} 
          className="w-full px-3 py-2" 
          rows={3} 
          placeholder="Payment terms, thank you message, etc."
        />
      </div>

      {/* Form Actions */}
      <div className="flex flex-wrap gap-3 pt-4 border-t border-slate-200">
        <Button
          onClick={handleSave}
          className="px-4 py-2 bg-success hover:bg-success/90 text-white"
        >
          <Save className="mr-1 h-4 w-4" /> Save Invoice
        </Button>
        <Button
          onClick={handleDownloadPDF}
          className="px-4 py-2 bg-primary hover:bg-primary/90 text-white"
        >
          <Download className="mr-1 h-4 w-4" /> Download PDF
        </Button>
        <Button
          onClick={handleSendEmail}
          className="px-4 py-2 bg-accent hover:bg-accent/90 text-white"
        >
          <Mail className="mr-1 h-4 w-4" /> Send via Email
        </Button>
        <Button
          onClick={toggleMobilePreview}
          className="md:hidden px-4 py-2 border border-primary text-primary hover:bg-primary hover:text-white"
        >
          {showMobilePreview ? <Edit className="mr-1 h-4 w-4" /> : <Eye className="mr-1 h-4 w-4" />}
          {showMobilePreview ? "Edit" : "Preview"}
        </Button>
      </div>
    </div>
  );
}
