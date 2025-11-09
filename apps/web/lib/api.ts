// API Client for Backend Endpoints
// Base URL from environment variable
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3001";

// Types for API responses
export interface StatsResponse {
  totalSpend: number;
  totalSpendChange: number;
  totalInvoices: number;
  totalInvoicesChange: number;
  documentsUploaded: number;
  documentsUploadedChange: number;
  averageInvoiceValue: number;
  averageInvoiceValueChange: number;
}

export interface InvoiceTrend {
  month: string;
  count: number;
  total: number;
}

export interface VendorSpend {
  name: string;
  amount: number;
}

export interface CategorySpend {
  category: string;
  amount: number;
}

export interface CashOutflow {
  date: string;
  amount: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  vendor: {
    name: string;
  };
  customer?: {
    name: string;
  } | null;
  invoiceDate: string;
  dueDate?: string | null;
  totalAmount: number;
  status: string;
  currency: string;
}

export interface InvoicesResponse {
  invoices: Invoice[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ChatResponse {
  question: string;
  sql: string;
  results: any[];
  error: string | null;
}

// API Functions

/**
 * Fetch overview statistics for dashboard cards
 */
export async function fetchStats(): Promise<StatsResponse> {
  const response = await fetch(`${API_BASE}/stats`);
  if (!response.ok) {
    throw new Error("Failed to fetch stats");
  }
  return response.json();
}

/**
 * Fetch invoice trends (monthly count and total)
 */
export async function fetchInvoiceTrends(): Promise<InvoiceTrend[]> {
  const response = await fetch(`${API_BASE}/invoice-trends`);
  if (!response.ok) {
    throw new Error("Failed to fetch invoice trends");
  }
  return response.json();
}

/**
 * Fetch top 10 vendors by spend
 */
export async function fetchTopVendors(): Promise<VendorSpend[]> {
  const response = await fetch(`${API_BASE}/vendors/top10`);
  if (!response.ok) {
    throw new Error("Failed to fetch top vendors");
  }
  return response.json();
}

/**
 * Fetch spend by category
 */
export async function fetchCategorySpend(): Promise<CategorySpend[]> {
  const response = await fetch(`${API_BASE}/category-spend`);
  if (!response.ok) {
    throw new Error("Failed to fetch category spend");
  }
  return response.json();
}

/**
 * Fetch cash outflow forecast
 */
export async function fetchCashOutflow(): Promise<CashOutflow[]> {
  const response = await fetch(`${API_BASE}/cash-outflow`);
  if (!response.ok) {
    throw new Error("Failed to fetch cash outflow");
  }
  return response.json();
}

/**
 * Fetch invoices with pagination and filters
 */
export async function fetchInvoices(params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  sortBy?: string;
}): Promise<InvoicesResponse> {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.limit) queryParams.append("limit", params.limit.toString());
  if (params?.search) queryParams.append("search", params.search);
  if (params?.status) queryParams.append("status", params.status);
  if (params?.sortBy) queryParams.append("sortBy", params.sortBy);

  const url = `${API_BASE}/invoices${
    queryParams.toString() ? `?${queryParams.toString()}` : ""
  }`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Failed to fetch invoices");
  }
  return response.json();
}

/**
 * Send natural language query to Vanna AI
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
    throw new Error("Failed to chat with data");
  }
  return response.json();
}
