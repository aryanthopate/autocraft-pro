import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Clock, 
  CheckCircle2, 
  Camera, 
  MessageSquare, 
  User,
  Calendar,
  ChevronDown,
  Activity
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface WorkLog {
  id: string;
  action: string;
  notes: string | null;
  created_at: string;
  zone_id: string | null;
  performer?: { full_name: string } | null;
  zone?: { zone_name: string } | null;
}

interface WorkLogsPanelProps {
  jobId: string;
  className?: string;
}

const ACTION_CONFIG: Record<string, { icon: typeof Clock; color: string; label: string }> = {
  zone_completed: { icon: CheckCircle2, color: "text-green-500", label: "Zone Completed" },
  photo_uploaded: { icon: Camera, color: "text-blue-500", label: "Photo Added" },
  note_added: { icon: MessageSquare, color: "text-purple-500", label: "Note Added" },
  job_started: { icon: Activity, color: "text-racing", label: "Job Started" },
  job_submitted: { icon: CheckCircle2, color: "text-amber-500", label: "Submitted for Review" },
};

export function WorkLogsPanel({ jobId, className }: WorkLogsPanelProps) {
  const [logs, setLogs] = useState<WorkLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, [jobId]);

  const fetchLogs = async () => {
    try {
      const { data, error } = await supabase
        .from("work_logs")
        .select(`
          *,
          performer:profiles!work_logs_performed_by_fkey(full_name),
          zone:job_zones!work_logs_zone_id_fkey(zone_name)
        `)
        .eq("job_id", jobId)
        .order("created_at", { ascending: false })
        .limit(20);

      if (!error && data) {
        setLogs(data as WorkLog[]);
      }
    } catch (error) {
      console.error("Error fetching logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const getActionConfig = (action: string) => {
    return ACTION_CONFIG[action] || { icon: Clock, color: "text-muted-foreground", label: action };
  };

  if (loading) {
    return (
      <div className={cn("animate-pulse bg-muted/50 rounded-lg h-32", className)} />
    );
  }

  return (
    <div className={cn("border rounded-xl overflow-hidden", className)}>
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 bg-muted/30 hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Activity className="h-4 w-4 text-primary" />
          </div>
          <div className="text-left">
            <h4 className="font-medium">Activity Log</h4>
            <p className="text-xs text-muted-foreground">{logs.length} actions recorded</p>
          </div>
        </div>
        <motion.div
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="h-5 w-5 text-muted-foreground" />
        </motion.div>
      </button>

      {/* Logs List */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <ScrollArea className="max-h-[250px]">
              {logs.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground">
                  <Clock className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No activity yet</p>
                </div>
              ) : (
                <div className="divide-y">
                  {logs.map((log, index) => {
                    const config = getActionConfig(log.action);
                    const Icon = config.icon;
                    
                    return (
                      <motion.div
                        key={log.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="p-3 hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex gap-3">
                          <div className={cn(
                            "h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0",
                            "bg-muted"
                          )}>
                            <Icon className={cn("h-4 w-4", config.color)} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-medium text-sm">{config.label}</span>
                              {log.zone?.zone_name && (
                                <Badge variant="outline" className="text-xs">
                                  {log.zone.zone_name}
                                </Badge>
                              )}
                            </div>
                            {log.notes && (
                              <p className="text-sm text-muted-foreground mt-0.5 truncate">
                                {log.notes}
                              </p>
                            )}
                            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                              {log.performer?.full_name && (
                                <span className="flex items-center gap-1">
                                  <User className="h-3 w-3" />
                                  {log.performer.full_name}
                                </span>
                              )}
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
