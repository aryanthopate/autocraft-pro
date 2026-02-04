import { motion } from "framer-motion";
import { ChevronRight, Clock, Play, AlertCircle, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Job {
  id: string;
  status: string;
  scheduled_date: string | null;
  notes: string | null;
  customer?: { name: string; phone: string };
  car?: { make: string; model: string; year: number | null; color: string | null };
}

interface JobCardProps {
  job: Job;
  isSelected: boolean;
  onClick: () => void;
}

export function JobCard({ job, isSelected, onClick }: JobCardProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "pending":
        return { color: "text-amber-500", bg: "bg-amber-500/15", border: "border-amber-500/30", icon: Clock };
      case "scheduled":
        return { color: "text-blue-500", bg: "bg-blue-500/15", border: "border-blue-500/30", icon: Clock };
      case "in_progress":
        return { color: "text-racing", bg: "bg-racing/15", border: "border-racing/30", icon: Play };
      case "awaiting_review":
        return { color: "text-purple-500", bg: "bg-purple-500/15", border: "border-purple-500/30", icon: AlertCircle };
      case "completed":
        return { color: "text-green-500", bg: "bg-green-500/15", border: "border-green-500/30", icon: CheckCircle2 };
      default:
        return { color: "text-muted-foreground", bg: "bg-muted", border: "border-muted", icon: Clock };
    }
  };

  const config = getStatusConfig(job.status);
  const StatusIcon = config.icon;

  return (
    <motion.button
      onClick={onClick}
      className={cn(
        "w-full p-4 text-left transition-all relative group",
        isSelected 
          ? "bg-gradient-to-r from-racing/10 to-transparent border-l-2 border-l-racing" 
          : "hover:bg-muted/50 border-l-2 border-l-transparent"
      )}
      whileHover={{ x: 4 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold truncate">
              {job.car?.make} {job.car?.model}
            </span>
            {job.car?.year && (
              <span className="text-xs text-muted-foreground">'{String(job.car.year).slice(-2)}</span>
            )}
          </div>
          <p className="text-sm text-muted-foreground truncate">
            {job.customer?.name}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge 
            variant="outline" 
            className={cn("text-xs gap-1", config.bg, config.color, config.border)}
          >
            <StatusIcon className="h-3 w-3" />
            {job.status.replace("_", " ")}
          </Badge>
          <ChevronRight className={cn(
            "h-4 w-4 text-muted-foreground transition-transform",
            isSelected && "text-racing rotate-90"
          )} />
        </div>
      </div>

      {/* Active indicator */}
      {job.status === "in_progress" && (
        <motion.div
          className="absolute right-2 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-racing"
          animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
    </motion.button>
  );
}
