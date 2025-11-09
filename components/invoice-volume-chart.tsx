"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  ComposedChart,
  Rectangle,
} from "recharts";
import { useEffect, useState } from "react";
import { fetchInvoiceTrends, type InvoiceTrend } from "@/lib/api";
import { Loader2 } from "lucide-react";

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 min-w-[200px]">
        <div className="font-semibold text-gray-900 mb-3">{data.month}</div>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Invoice count:</span>
            <span className="text-sm font-semibold text-indigo-600 ml-8">
              {data.invoiceCount}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Total Spend:</span>
            <span className="text-sm font-semibold text-indigo-600 ml-8">
              €{" "}
              {data.totalSpend.toLocaleString("de-DE", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

const CustomCursor = (props: any) => {
  const { x, y, width, height, stroke } = props;
  return (
    <Rectangle
      fill="rgba(79, 70, 229, 0.08)"
      stroke="none"
      x={x - 15}
      y={y}
      width={30}
      height={height}
    />
  );
};

export function InvoiceVolumeChart() {
  const [data, setData] = useState<InvoiceTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const trends = await fetchInvoiceTrends(12);
        setData(trends);
        setError(null);
      } catch (err) {
        console.error("Failed to load invoice trends:", err);
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // Calculate max value for Y-axis domain
  const maxInvoices = Math.max(...data.map((d) => d.invoiceCount), 0);
  const yAxisMax = Math.ceil((maxInvoices * 1.2) / 10) * 10; // Round up to nearest 10

  return (
    <Card className="border-gray-200">
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-semibold text-gray-900">
          Invoice Volume + Value Trend
        </CardTitle>
        <CardDescription className="text-sm text-gray-500">
          Invoice count and total spend over 12 months.
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
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={data}>
              <defs>
                <linearGradient id="colorInvoices" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#4F46E5" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#9CA3AF" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#9CA3AF" stopOpacity={0.01} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="0"
                stroke="#F3F4F6"
                vertical={false}
              />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12, fill: "#6B7280" }}
                axisLine={false}
                tickLine={false}
                dy={10}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "#6B7280" }}
                axisLine={false}
                tickLine={false}
                dx={-10}
                domain={[0, yAxisMax || 80]}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={<CustomCursor />}
                position={{ y: 80 }}
              />
              <Area
                type="monotone"
                dataKey="invoiceCount"
                fill="url(#colorInvoices)"
                stroke="none"
              />
              <Area
                type="monotone"
                dataKey="totalSpend"
                fill="url(#colorSpend)"
                stroke="none"
              />
              <Line
                type="monotone"
                dataKey="invoiceCount"
                stroke="#312E81"
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 5, fill: "#312E81" }}
              />
              <Line
                type="monotone"
                dataKey="totalSpend"
                stroke="#9CA3AF"
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 5, fill: "#9CA3AF" }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
