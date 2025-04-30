import { Invoice } from "@shared/schema";
import { formatDisplayDate, formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

interface InvoicePreviewProps {
  invoice: Invoice;
}

export default function InvoicePreview({ invoice }: InvoicePreviewProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <div id="invoice-preview" className="bg-white rounded-lg shadow-md p-8">
        <div className="border-b border-slate-200 pb-4 mb-6 flex justify-between items-start">
          <div>
            <h2 id="preview-business-name" className="text-2xl font-bold text-slate-800">
              {invoice.businessName || "Your Business Name"}
            </h2>
            <p id="preview-business-address" className="text-sm text-slate-600 mt-1">
              {invoice.businessAddress || "123 Business St, City, State ZIP"}
            </p>
            <p id="preview-business-contact" className="text-sm text-slate-600">
              <span id="preview-business-email">{invoice.businessEmail || "email@example.com"}</span>
              {invoice.businessPhone && (
                <span id="preview-business-phone" className="ml-2">{invoice.businessPhone}</span>
              )}
            </p>
          </div>
          <div className="text-right">
            <h1 className="text-xl font-bold text-primary uppercase">Invoice</h1>
            <p className="text-sm text-slate-600 mt-1">
              <span className="font-medium">#</span>{" "}
              <span id="preview-invoice-number">{invoice.invoiceNumber}</span>
            </p>
          </div>
        </div>

        <div className="mb-8 flex justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-700 uppercase mb-2">Bill To:</h3>
            <p id="preview-client-name" className="font-medium">
              {invoice.clientName || "Client Name"}
            </p>
            <p id="preview-client-address" className="text-sm text-slate-600 mt-1">
              {invoice.clientAddress || "123 Client St, City, State ZIP"}
            </p>
            <p id="preview-client-email" className="text-sm text-slate-600">
              {invoice.clientEmail || "client@example.com"}
            </p>
            {invoice.clientPhone && (
              <p id="preview-client-phone" className="text-sm text-slate-600">
                {invoice.clientPhone}
              </p>
            )}
          </div>
          <div className="text-right">
            <div className="mb-2">
              <span className="text-sm font-semibold text-slate-700">Invoice Date:</span>
              <span id="preview-invoice-date" className="text-sm ml-2">
                {formatDisplayDate(invoice.invoiceDate)}
              </span>
            </div>
            <div>
              <span className="text-sm font-semibold text-slate-700">Due Date:</span>
              <span id="preview-due-date" className="text-sm ml-2">
                {formatDisplayDate(invoice.dueDate)}
              </span>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-slate-200">
                <th className="pb-2 text-slate-700 font-semibold">Description</th>
                <th className="pb-2 text-slate-700 font-semibold text-right">Qty</th>
                <th className="pb-2 text-slate-700 font-semibold text-right">Price</th>
                <th className="pb-2 text-slate-700 font-semibold text-right">Amount</th>
              </tr>
            </thead>
            <tbody id="preview-line-items">
              {invoice.lineItems.length > 0 ? (
                invoice.lineItems.map((item) => (
                  <tr key={item.id} className="border-b border-slate-100">
                    <td className="py-3 text-slate-800">{item.description}</td>
                    <td className="py-3 text-slate-800 text-right">{item.quantity}</td>
                    <td className="py-3 text-slate-800 text-right">{formatCurrency(item.price)}</td>
                    <td className="py-3 text-slate-800 text-right">
                      {formatCurrency(item.quantity * item.price)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr className="border-b border-slate-100">
                  <td colSpan={4} className="py-3 text-center text-slate-500">
                    No items added to this invoice
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mb-8 flex justify-end">
          <div className="w-1/2">
            <div className="flex justify-between py-2">
              <span className="text-slate-600">Subtotal:</span>
              <span id="preview-subtotal" className="font-medium">
                {formatCurrency(invoice.subtotal)}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-200">
              <span className="text-slate-600">Tax (8.25%):</span>
              <span id="preview-tax" className="font-medium">
                {formatCurrency(invoice.tax)}
              </span>
            </div>
            <div className="flex justify-between py-2 text-lg">
              <span className="font-semibold">Total:</span>
              <span id="preview-total" className="font-bold">
                {formatCurrency(invoice.total)}
              </span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-slate-700 mb-2">Notes:</h3>
          <p id="preview-notes" className="text-sm text-slate-600">
            {invoice.notes || "Thank you for your business. Payment is due within 15 days."}
          </p>
        </div>

        <div className="mt-8 text-center text-sm text-slate-500 pt-4 border-t border-slate-100">
          <p>Please make payments to: {invoice.businessName || "Your Business Name"}</p>
        </div>
      </div>

      <div className="mt-4 no-print flex justify-center">
        <Button
          onClick={handlePrint}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
        >
          <Printer className="mr-1 h-4 w-4" /> Print Invoice
        </Button>
      </div>
    </>
  );
}
