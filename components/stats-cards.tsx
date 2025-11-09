"use client";

import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { fetchStats, type StatsResponse } from "@/lib/api";

interface StatCard {
  title: string;
  value: string;
  change: string;
  subtitle: string;
  trend: "up" | "down";
  badge?: string;
}

export function StatsCards() {
  const [stats, setStats] = useState<StatCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadStats() {
      try {
        setLoading(true);
        const data = await fetchStats();

        const statsData: StatCard[] = [
          {
            title: "Total Spend",
            value: `€ ${data.totalSpend.value.toLocaleString("de-DE", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`,
            change: `${
              data.totalSpend.change >= 0 ? "+" : ""
            }${data.totalSpend.change.toFixed(1)}%`,
            subtitle: "from last year",
            trend: data.totalSpend.change >= 0 ? "up" : "down",
            badge: data.totalSpend.label || "(YTD)",
          },
          {
            title: "Total Invoices Processed",
            value: data.totalInvoices.value.toString(),
            change: `${
              data.totalInvoices.change >= 0 ? "+" : ""
            }${data.totalInvoices.change.toFixed(1)}%`,
            subtitle: "from last month",
            trend: data.totalInvoices.change >= 0 ? "up" : "down",
          },
          {
            title: "Documents Uploaded",
            value: data.documentsUploaded.value.toString(),
            change: `${
              data.documentsUploaded.change >= 0 ? "+" : ""
            }${data.documentsUploaded.change.toFixed(1)}%`,
            subtitle:
              data.documentsUploaded.change >= 0
                ? "more than last month"
                : "less than last month",
            trend: data.documentsUploaded.change >= 0 ? "up" : "down",
            badge: data.documentsUploaded.label || "This Month",
          },
          {
            title: "Average Invoice Value",
            value: `€ ${data.averageInvoiceValue.value.toLocaleString("de-DE", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`,
            change: `${
              data.averageInvoiceValue.change >= 0 ? "+" : ""
            }${data.averageInvoiceValue.change.toFixed(1)}%`,
            subtitle: "from last month",
            trend: data.averageInvoiceValue.change >= 0 ? "up" : "down",
          },
        ];

        setStats(statsData);
        setError(null);
      } catch (err) {
        console.error("Failed to load stats:", err);
        setError(err instanceof Error ? err.message : "Failed to load stats");
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="border-gray-200">
            <CardContent className="p-6 flex items-center justify-center h-[140px]">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid grid-cols-4 gap-6">
        <Card className="col-span-4 border-red-200 bg-red-50">
          <CardContent className="p-6">
            <p className="text-sm text-red-600">Error loading stats: {error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <Card key={index} className="border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="text-sm text-gray-600">{stat.title}</div>
              {stat.badge && (
                <span className="text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-medium">
                  {stat.badge}
                </span>
              )}
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-2">
              {stat.value}
            </div>
            <div className="flex items-center gap-2">
              <div
                className={`flex items-center gap-1 text-sm font-medium ${
                  stat.trend === "up" ? "text-green-600" : "text-red-600"
                }`}
              >
                {stat.trend === "up" ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                {stat.change}
              </div>
              <span className="text-sm text-gray-500">{stat.subtitle}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
