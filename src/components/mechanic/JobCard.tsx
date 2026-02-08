import { motion } from "framer-motion";
import { ChevronRight, Clock, Play, AlertCircle, CheckCircle2, Car, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

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
        return { color: "text-amber-500", bg: "bg-amber-500/15", border: "border-amber-500/30", icon: Clock, label: "Pending" };
      case "scheduled":
        return { color: "text-blue-500", bg: "bg-blue-500/15", border: "border-blue-500/30", icon: Calendar, label: "Scheduled" };
      case "in_progress":
        return { color: "text-racing", bg: "bg-racing/15", border: "border-racing/30", icon: Play, label: "In Progress" };
      case "awaiting_review":
        return { color: "text-purple-500", bg: "bg-purple-500/15", border: "border-purple-500/30", icon: AlertCircle, label: "Review" };
      case "completed":
        return { color: "text-accent", bg: "bg-accent/15", border: "border-accent/30", icon: CheckCircle2, label: "Done" };
      default:
        return { color: "text-muted-foreground", bg: "bg-muted", border: "border-muted", icon: Clock, label: status };
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
          ? "bg-gradient-to-r from-racing/10 via-racing/5 to-transparent border-l-2 border-l-racing" 
          : "hover:bg-muted/50 border-l-2 border-l-transparent"
      )}
      whileHover={{ x: 4 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-start gap-3">
        {/* Vehicle Icon */}
        <div className={cn(
          "h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors",
          isSelected ? "bg-racing/20" : "bg-muted group-hover:bg-racing/10"
        )}>
          <Car className={cn(
            "h-5 w-5 transition-colors",
            isSelected ? "text-racing" : "text-muted-foreground group-hover:text-racing"
          )} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="font-semibold truncate">
              {job.car?.make} {job.car?.model}
            </span>
            {job.car?.year && (
              <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                '{String(job.car.year).slice(-2)}
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground truncate">
            {job.customer?.name}
          </p>
          {job.scheduled_date && (
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {format(new Date(job.scheduled_date), "MMM d")}
            </p>
          )}
        </div>
        
        {/* Status & Arrow */}
        <div className="flex flex-col items-end gap-2">
          <Badge 
            variant="outline" 
            className={cn("text-xs gap-1 px-2", config.bg, config.color, config.border)}
          >
            <StatusIcon className="h-3 w-3" />
            {config.label}
          </Badge>
          <ChevronRight className={cn(
            "h-4 w-4 text-muted-foreground transition-all",
            isSelected && "text-racing translate-x-1"
          )} />
        </div>
      </div>

      {/* Active indicator pulse */}
      {job.status === "in_progress" && (
        <motion.div
          className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 rounded-r bg-racing"
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
    </motion.button>
  );
}
