import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Trophy, Star, Clock, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface StaffPerformanceProps {
  studioId: string;
}

interface StaffStat {
  id: string;
  name: string;
  role: string;
  completedJobs: number;
  activeJobs: number;
  completedZones: number;
}

export function StaffPerformanceCard({ studioId }: StaffPerformanceProps) {
  const [staff, setStaff] = useState<StaffStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStaffPerformance();
  }, [studioId]);

  const fetchStaffPerformance = async () => {
    try {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, role")
        .eq("studio_id", studioId)
        .eq("status", "approved")
        .in("role", ["staff", "mechanic"]);

      if (!profiles) return;

      const stats: StaffStat[] = await Promise.all(
        profiles.map(async (p) => {
          const [completed, active] = await Promise.all([
            supabase.from("jobs").select("id", { count: "exact" }).eq("assigned_to", p.id).eq("status", "completed"),
            supabase.from("jobs").select("id", { count: "exact" }).eq("assigned_to", p.id).eq("status", "in_progress"),
          ]);

          const { count: zonesCount } = await supabase
            .from("work_logs")
            .select("id", { count: "exact" })
            .eq("performed_by", p.id)
            .eq("action", "zone_completed");

          return {
            id: p.id,
            name: p.full_name,
            role: p.role,
            completedJobs: completed.count || 0,
            activeJobs: active.count || 0,
            completedZones: zonesCount || 0,
          };
        })
      );

      setStaff(stats.sort((a, b) => b.completedJobs - a.completedJobs));
    } catch (err) {
      console.error("Staff perf error:", err);
    } finally {
      setLoading(false);
    }
  };

  const maxJobs = Math.max(...staff.map((s) => s.completedJobs), 1);

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardContent className="pt-6"><div className="h-40 bg-muted rounded" /></CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Trophy className="h-5 w-5 text-primary" />
          Staff Performance
        </CardTitle>
      </CardHeader>
      <CardContent>
        {staff.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">No staff members yet</p>
        ) : (
          <div className="space-y-4">
            {staff.slice(0, 5).map((member, i) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-3"
              >
                <div className={cn(
                  "h-9 w-9 rounded-xl flex items-center justify-center text-sm font-bold",
                  i === 0 ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                )}>
                  {i === 0 ? <Star className="h-4 w-4" /> : i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm truncate">{member.name}</span>
                    <Badge variant="outline" className="text-[10px] capitalize">{member.role}</Badge>
                  </div>
                  <Progress value={(member.completedJobs / maxJobs) * 100} className="h-1.5" />
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">{member.completedJobs}</p>
                  <p className="text-[10px] text-muted-foreground">jobs</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
