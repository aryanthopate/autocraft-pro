import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, MessageSquare, ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface RejectionFeedbackProps {
  jobId: string;
}

interface Rejection {
  id: string;
  issues_found: string;
  created_at: string;
  approved_at: string | null;
}

export function RejectionFeedback({ jobId }: RejectionFeedbackProps) {
  const [rejections, setRejections] = useState<Rejection[]>([]);
  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    fetchRejections();
  }, [jobId]);

  const fetchRejections = async () => {
    const { data } = await supabase
      .from("job_submissions")
      .select("id, issues_found, created_at, approved_at")
      .eq("job_id", jobId)
      .eq("approved", false)
      .not("issues_found", "is", null)
      .order("created_at", { ascending: false })
      .limit(3);

    if (data) setRejections(data as Rejection[]);
  };

  if (rejections.length === 0) return null;

  const latest = rejections[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="border border-amber-500/30 bg-amber-500/5 rounded-lg overflow-hidden"
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-amber-500/10 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
          </div>
          <div className="text-left">
            <p className="font-semibold text-amber-600 text-sm">Feedback from Owner</p>
            <p className="text-xs text-muted-foreground">
              Job was sent back for corrections
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-amber-500/15 text-amber-600 border-amber-500/30 text-xs">
            {rejections.length} note{rejections.length > 1 ? "s" : ""}
          </Badge>
          {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-2">
          {rejections.map((r, i) => (
            <div
              key={r.id}
              className={cn(
                "p-3 rounded-lg border",
                i === 0
                  ? "bg-amber-500/10 border-amber-500/20"
                  : "bg-muted/30 border-border opacity-70"
              )}
            >
              <div className="flex items-start gap-2">
                <MessageSquare className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm">{r.issues_found}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(r.approved_at || r.created_at).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
