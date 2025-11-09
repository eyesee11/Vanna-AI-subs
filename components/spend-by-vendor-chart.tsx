"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { useEffect, useState } from "react";
import { fetchTopVendors, type VendorSpend } from "@/lib/api";
import { Loader2 } from "lucide-react";

export function SpendByVendorChart() {
  const [data, setData] = useState<VendorSpend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const vendors = await fetchTopVendors();
        setData(vendors);
        setError(null);
      } catch (err) {
        console.error("Failed to load vendor spend:", err);
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // Get the top vendor for highlight
  const topVendor = data.length > 0 ? data[0] : null;

  return (
    <Card className="border-gray-200">
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-semibold text-gray-900">
          Spend by Vendor (Top 10)
        </CardTitle>
        <CardDescription className="text-sm text-gray-500">
          Vendor spend with cumulative percentage distribution.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-[300px] flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : error ? (
          <div className="h-[300px] flex items-center justify-center">
            <p className="text-sm text-red-600">Error: {error}</p>
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data} layout="vertical">
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#E5E7EB"
                  horizontal={true}
                  vertical={false}
                />
                <XAxis
                  type="number"
                  tick={{ fontSize: 12, fill: "#6B7280" }}
                  axisLine={{ stroke: "#E5E7EB" }}
                  tickFormatter={(value) => `€${value / 1000}k`}
                />
                <YAxis
                  type="category"
                  dataKey="vendorName"
                  tick={{ fontSize: 12, fill: "#6B7280" }}
                  axisLine={{ stroke: "#E5E7EB" }}
                  width={100}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #E5E7EB",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                  formatter={(value: any) => [
                    `€${value.toLocaleString("de-DE", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}`,
                    "Vendor Spend",
                  ]}
                  cursor={{ fill: "#F3F4F6" }}
                />
                <Bar dataKey="totalSpend" radius={[0, 4, 4, 0]}>
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={index === 0 ? "#312E81" : "#A5B4FC"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            {topVendor && (
              <div className="mt-4 p-4 bg-indigo-50 rounded-lg border border-indigo-100">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-indigo-900">
                      {topVendor.vendorName}
                    </div>
                    <div className="text-xs text-indigo-600 mt-0.5">
                      Top Vendor Spend ({topVendor.invoiceCount} invoices)
                    </div>
                  </div>
                  <div className="text-xl font-bold text-indigo-900">
                    €{" "}
                    {topVendor.totalSpend.toLocaleString("de-DE", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
