import { Ride } from './ride';

// Invoice and Billing Types

export type InvoiceStatus = 'unpaid' | 'paid' | 'cancelled';

export interface Invoice {
  id: string;
  rideId: string;
  waitingFee: string;
  subTotal: string;
  tax: string;
  total: string;
  status: InvoiceStatus;
  invoiceDate: Date;
  dueDate: Date;
  pdfUrl?: string | null;
  sentViaApp: boolean;
  appSentAt?: Date | null;
  remindersSent: number;
  lastReminderMessage?: string | null;
}

export interface InvoiceWithRide extends Invoice {
  ride: Ride;
}

export interface CreateInvoiceInput {
  rideId: string;
  waitingFee?: string;
  subTotal: string;
  tax?: string;
  total: string;
  dueDate?: Date;
}

export interface UpdateInvoiceInput {
  status?: InvoiceStatus;
  pdfUrl?: string;
  sentViaApp?: boolean;
  appSentAt?: Date;
}

export interface SendInvoiceInput {
  invoiceId: string;
  recipientEmail: string;
  message?: string;
}

export interface SendReminderInput {
  invoiceId: string;
  message: string;
}

export interface InvoiceFilters {
  status?: InvoiceStatus;
  rideId?: string;
  startDate?: Date;
  endDate?: Date;
  overdue?: boolean;
}

export interface InvoiceSummary {
  totalInvoices: number;
  totalAmount: string;
  paidAmount: string;
  unpaidAmount: string;
  overdueAmount: string;
}

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unitPrice: string;
  total: string;
}

export interface GenerateInvoicePDFInput {
  invoice: InvoiceWithRide;
  lineItems: InvoiceLineItem[];
  companyInfo: {
    name: string;
    address: string;
    phone: string;
    email: string;
  };
}
