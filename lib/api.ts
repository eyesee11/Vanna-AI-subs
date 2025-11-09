// API Client Library for Buchhaltung Dashboard

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3001";

// Debug logging
if (typeof window !== "undefined") {
  console.log("[API Client] API_BASE:", API_BASE);
  console.log(
    "[API Client] process.env.NEXT_PUBLIC_API_BASE:",
    process.env.NEXT_PUBLIC_API_BASE
  );
}

// Type Definitions

export interface StatsResponse {
  totalSpend: {
    value: number;
    change: number;
    label?: string;
  };
  totalInvoices: {
    value: number;
    change: number;
  };
  documentsUploaded: {
    value: number;
    change: number;
    label?: string;
  };
  averageInvoiceValue: {
    value: number;
    change: number;
  };
}

export interface InvoiceTrend {
  month: string;
  invoiceCount: number;
  totalSpend: number;
}

export interface VendorSpend {
  vendorName: string;
  totalSpend: number;
  invoiceCount: number;
}

export interface CategorySpend {
  category: string;
  totalSpend: number;
  percentage: number;
}

export interface CashOutflow {
  month: string;
  outflow: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  vendorName: string;
  invoiceDate: string;
  dueDate: string;
  totalAmount: number;
  status: "paid" | "pending" | "overdue";
  currency: string;
  category?: string;
}

export interface InvoicesResponse {
  invoices: Invoice[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ChatMessage {
  id: string;
  type: "user" | "assistant";
  question: string;
  sql?: string;
  results?: any[];
  error?: string;
}

export interface ChatResponse {
  question: string;
  sql: string;
  results: any[];
  error: string | null;
}

// API Functions

/**
 * Fetch dashboard statistics
 */
export async function fetchStats(): Promise<StatsResponse> {
  const url = `${API_BASE}/stats`;
  console.log("[API] Fetching:", url);
  const response = await fetch(url);
  console.log("[API] Response status:", response.status);
  if (!response.ok) {
    throw new Error(`Failed to fetch stats: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Fetch invoice trends over time
 * @param months - Number of months to fetch (default: 12)
 */
export async function fetchInvoiceTrends(
  months: number = 12
): Promise<InvoiceTrend[]> {
  const url = `${API_BASE}/invoice-trends?months=${months}`;
  console.log("[API] Fetching:", url);
  const response = await fetch(url);
  console.log("[API] Response status:", response.status);
  if (!response.ok) {
    throw new Error(`Failed to fetch invoice trends: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Fetch top 10 vendors by spend
 */
export async function fetchTopVendors(): Promise<VendorSpend[]> {
  const url = `${API_BASE}/vendors/top10`;
  console.log("[API] Fetching:", url);
  const response = await fetch(url);
  console.log("[API] Response status:", response.status);
  if (!response.ok) {
    throw new Error(`Failed to fetch top vendors: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Fetch spend by category
 */
export async function fetchCategorySpend(): Promise<CategorySpend[]> {
  const response = await fetch(`${API_BASE}/category-spend`);
  if (!response.ok) {
    throw new Error(`Failed to fetch category spend: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Fetch cash outflow over time
 * @param months - Number of months to fetch (default: 12)
 */
export async function fetchCashOutflow(
  months: number = 12
): Promise<CashOutflow[]> {
  const response = await fetch(`${API_BASE}/cash-outflow?months=${months}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch cash outflow: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Fetch invoices with pagination and filters
 * @param options - Query parameters for filtering and pagination
 */
export async function fetchInvoices(
  options: {
    page?: number;
    pageSize?: number;
    status?: string;
    vendorName?: string;
    startDate?: string;
    endDate?: string;
  } = {}
): Promise<InvoicesResponse> {
  const params = new URLSearchParams();
  if (options.page) params.append("page", options.page.toString());
  if (options.pageSize) params.append("pageSize", options.pageSize.toString());
  if (options.status) params.append("status", options.status);
  if (options.vendorName) params.append("vendorName", options.vendorName);
  if (options.startDate) params.append("startDate", options.startDate);
  if (options.endDate) params.append("endDate", options.endDate);

  const response = await fetch(`${API_BASE}/invoices?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch invoices: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Chat with data using natural language
 * @param question - Natural language question about the data
 */
export async function chatWithData(question: string): Promise<ChatResponse> {
  const response = await fetch(`${API_BASE}/chat-with-data`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query: question }),
  });

  if (!response.ok) {
    throw new Error(`Failed to chat with data: ${response.statusText}`);
  }

  return response.json();
}
