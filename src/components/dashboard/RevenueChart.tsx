import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BarChart3, TrendingUp, ArrowUp, ArrowDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

interface RevenueChartProps {
  studioId: string;
}

interface MonthData {
  month: string;
  revenue: number;
  jobs: number;
}

export function RevenueChart({ studioId }: RevenueChartProps) {
  const [monthlyData, setMonthlyData] = useState<MonthData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRevenueData();
  }, [studioId]);

  const fetchRevenueData = async () => {
    try {
      const now = new Date();
      const months: MonthData[] = [];

      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const startOfMonth = date.toISOString();
        const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString();

        const { data } = await supabase
          .from("jobs")
          .select("id, total_price, status")
          .eq("studio_id", studioId)
          .gte("created_at", startOfMonth)
          .lte("created_at", endOfMonth);

        const revenue = (data || [])
          .filter((j) => j.status === "completed")
          .reduce((sum, j) => sum + (j.total_price || 0), 0);

        months.push({
          month: date.toLocaleString("default", { month: "short" }),
          revenue,
          jobs: (data || []).length,
        });
      }

      setMonthlyData(months);
    } catch (err) {
      console.error("Revenue fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const maxRevenue = Math.max(...monthlyData.map((m) => m.revenue), 1);
  const currentRevenue = monthlyData[monthlyData.length - 1]?.revenue || 0;
  const previousRevenue = monthlyData[monthlyData.length - 2]?.revenue || 0;
  const revenueChange = previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0;

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardContent className="pt-6">
          <div className="h-48 bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <BarChart3 className="h-5 w-5 text-primary" />
            Revenue Overview
          </CardTitle>
          <div className="flex items-center gap-1.5">
            {revenueChange !== 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`flex items-center gap-1 text-sm font-medium ${
                  revenueChange > 0 ? "text-green-500" : "text-red-500"
                }`}
              >
                {revenueChange > 0 ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />}
                {Math.abs(revenueChange).toFixed(0)}%
              </motion.div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-end gap-2 h-40">
          {monthlyData.map((month, i) => (
            <motion.div
              key={month.month}
              className="flex-1 flex flex-col items-center gap-1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <span className="text-xs text-muted-foreground font-medium">
                {month.jobs > 0 ? month.jobs : ""}
              </span>
              <div className="w-full relative">
                <motion.div
                  className={`w-full rounded-t-lg ${
                    i === monthlyData.length - 1
                      ? "bg-gradient-to-t from-primary to-primary/70"
                      : "bg-primary/20 hover:bg-primary/30"
                  } transition-colors`}
                  initial={{ height: 0 }}
                  animate={{ height: Math.max((month.revenue / maxRevenue) * 120, 4) }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                />
              </div>
              <span className="text-[10px] text-muted-foreground">{month.month}</span>
            </motion.div>
          ))}
        </div>
        <div className="mt-4 pt-3 border-t flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">This Month Revenue</p>
            <p className="text-xl font-bold">₹{currentRevenue.toLocaleString()}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Total Jobs</p>
            <p className="text-xl font-bold">{monthlyData.reduce((s, m) => s + m.jobs, 0)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
