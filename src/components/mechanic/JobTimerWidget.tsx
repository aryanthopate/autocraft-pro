import { motion } from "framer-motion";
import { Play, Pause, RotateCcw, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useJobTimer } from "@/hooks/useJobTimer";

interface JobTimerWidgetProps {
  jobId: string | null;
  isJobActive: boolean;
  className?: string;
}

export function JobTimerWidget({ jobId, isJobActive, className }: JobTimerWidgetProps) {
  const { formatted, isRunning, start, pause, reset } = useJobTimer(jobId);

  if (!jobId || !isJobActive) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "flex items-center gap-3 p-3 rounded-xl border bg-card",
        isRunning && "border-racing/40 bg-racing/5",
        className
      )}
    >
      <div className={cn(
        "h-10 w-10 rounded-xl flex items-center justify-center",
        isRunning ? "bg-racing/20" : "bg-muted"
      )}>
        <Timer className={cn("h-5 w-5", isRunning ? "text-racing" : "text-muted-foreground")} />
      </div>
      
      <div className="flex-1">
        <p className="text-xs text-muted-foreground">Time Elapsed</p>
        <p className={cn(
          "font-mono text-lg font-bold tracking-wider",
          isRunning && "text-racing"
        )}>
          {formatted}
        </p>
      </div>

      <div className="flex gap-1.5">
        {isRunning ? (
          <Button
            size="sm"
            variant="outline"
            onClick={pause}
            className="h-8 w-8 p-0 border-racing/30 text-racing hover:bg-racing/10"
          >
            <Pause className="h-3.5 w-3.5" />
          </Button>
        ) : (
          <Button
            size="sm"
            onClick={start}
            className="h-8 w-8 p-0 bg-racing hover:bg-racing/90"
          >
            <Play className="h-3.5 w-3.5" />
          </Button>
        )}
        <Button
          size="sm"
          variant="ghost"
          onClick={reset}
          className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </Button>
      </div>
    </motion.div>
  );
}
