"use client";

import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { StatsCards } from "./stats-cards";
import { InvoiceVolumeChart } from "./invoice-volume-chart";
import { SpendByVendorChart } from "./spend-by-vendor-chart";
import { SpendByCategoryChart } from "./spend-by-category-chart";
import { CashOutflowChart } from "./cash-outflow-chart";
import { InvoicesByVendorTable } from "./invoices-by-vendor-table";

export default function DashboardPage() {
  return (
    <div className="flex h-screen bg-[#F8F9FA]">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <StatsCards />
          <div className="grid grid-cols-2 gap-6 mt-6">
            <InvoiceVolumeChart />
            <SpendByVendorChart />
          </div>
          <div className="grid grid-cols-3 gap-6 mt-6">
            <SpendByCategoryChart />
            <CashOutflowChart />
            <InvoicesByVendorTable />
          </div>
        </main>
      </div>
    </div>
  );
}
