import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Activity, Filter, Search, Loader2 } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ActivityLog {
  id: string;
  user_name: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  details: any;
  created_at: string;
}

const entityIcons: Record<string, string> = {
  job: "🔧", customer: "👤", vehicle: "🚗", estimate: "📄", inventory: "📦",
  invoice: "💰", staff: "👥", submission: "✅", zone: "📍",
};

const actionColors: Record<string, string> = {
  created: "bg-success/15 text-success",
  updated: "bg-primary/15 text-primary",
  deleted: "bg-destructive/15 text-destructive",
  sent: "bg-primary/15 text-primary",
  approved: "bg-success/15 text-success",
  rejected: "bg-destructive/15 text-destructive",
  converted_to_job: "bg-accent/15 text-accent",
  stock_added: "bg-success/15 text-success",
  stock_removed: "bg-warning/15 text-warning-foreground",
  assigned: "bg-primary/15 text-primary",
  completed: "bg-success/15 text-success",
};

export default function ActivityLogPage() {
  const { studio } = useAuth();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  useEffect(() => {
    if (studio?.id) fetchLogs();
  }, [studio?.id]);

  useEffect(() => {
    if (!studio?.id) return;
    const channel = supabase
      .channel("activity-logs")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "activity_logs", filter: `studio_id=eq.${studio.id}` },
        (payload) => setLogs(prev => [payload.new as ActivityLog, ...prev])
      ).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [studio?.id]);

  const fetchLogs = async () => {
    const { data } = await supabase
      .from("activity_logs")
      .select("*")
      .eq("studio_id", studio!.id)
      .order("created_at", { ascending: false })
      .limit(200);
    setLogs((data as any) || []);
    setLoading(false);
  };

  const filtered = logs.filter(l => {
    if (typeFilter !== "all" && l.entity_type !== typeFilter) return false;
    if (search && !(l.user_name || "").toLowerCase().includes(search.toLowerCase()) && !l.action.toLowerCase().includes(search.toLowerCase()) && !l.entity_type.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const entityTypes = [...new Set(logs.map(l => l.entity_type))];

  const formatTime = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Activity className="h-7 w-7 text-primary" /> Activity Log
          </h1>
          <p className="text-muted-foreground mt-1">Full audit trail of all actions in your studio</p>
        </motion.div>

        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search activity..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[160px]"><Filter className="h-4 w-4 mr-2" /><SelectValue placeholder="All types" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              {entityTypes.map(t => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : filtered.length === 0 ? (
          <Card><CardContent className="py-12 text-center text-muted-foreground">No activity recorded yet. Actions like creating jobs, managing inventory, and sending estimates will appear here.</CardContent></Card>
        ) : (
          <div className="space-y-1">
            {filtered.map((log, i) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.02 }}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group"
              >
                <div className="text-lg mt-0.5">{entityIcons[log.entity_type] || "📋"}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">
                    <span className="font-medium">{log.user_name || "System"}</span>
                    {" "}
                    <Badge className={`${actionColors[log.action] || "bg-muted text-muted-foreground"} text-[10px] px-1.5 py-0`}>
                      {log.action.replace(/_/g, " ")}
                    </Badge>
                    {" "}
                    <span className="text-muted-foreground">{log.entity_type}</span>
                    {log.details && Object.keys(log.details).length > 0 && (
                      <span className="text-xs text-muted-foreground ml-1">
                        ({Object.entries(log.details).map(([k, v]) => `${k}: ${v}`).join(", ")})
                      </span>
                    )}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">{formatTime(log.created_at)}</span>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
