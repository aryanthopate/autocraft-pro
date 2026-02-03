import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  History,
  Calendar,
  CheckCircle2,
  Clock,
  ChevronRight,
  Car,
  Wrench,
  X,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Job {
  id: string;
  status: string;
  scheduled_date: string | null;
  created_at: string;
  total_price: number | null;
  zones: {
    id: string;
    zone_name: string;
    services: string[];
    completed: boolean;
  }[];
}

interface VehicleServiceHistoryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicleId: string;
  vehicleInfo: {
    make: string;
    model: string;
    year?: number | null;
    color?: string | null;
    license_plate?: string | null;
  };
  customerName: string;
}

export function VehicleServiceHistory({
  open,
  onOpenChange,
  vehicleId,
  vehicleInfo,
  customerName,
}: VehicleServiceHistoryProps) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open && vehicleId) {
      fetchHistory();
    }
  }, [open, vehicleId]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const { data: jobsData, error: jobsError } = await supabase
        .from("jobs")
        .select("id, status, scheduled_date, created_at, total_price")
        .eq("car_id", vehicleId)
        .order("created_at", { ascending: false });

      if (jobsError) throw jobsError;

      // Fetch zones for each job
      const jobsWithZones = await Promise.all(
        (jobsData || []).map(async (job) => {
          const { data: zonesData } = await supabase
            .from("job_zones")
            .select("id, zone_name, services, completed")
            .eq("job_id", job.id);

          return {
            ...job,
            zones: (zonesData || []).map((z: any) => ({
              ...z,
              services: Array.isArray(z.services) ? z.services : [],
            })),
          };
        })
      );

      setJobs(jobsWithZones);
    } catch (error) {
      console.error("Error fetching service history:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      pending: "bg-amber-500/15 text-amber-500 border-amber-500/30",
      scheduled: "bg-blue-500/15 text-blue-500 border-blue-500/30",
      in_progress: "bg-racing/15 text-racing border-racing/30",
      awaiting_review: "bg-purple-500/15 text-purple-500 border-purple-500/30",
      completed: "bg-green-500/15 text-green-500 border-green-500/30",
      cancelled: "bg-destructive/15 text-destructive border-destructive/30",
    };
    return (
      <Badge variant="outline" className={variants[status] || ""}>
        {status.replace("_", " ")}
      </Badge>
    );
  };

  const completedJobs = jobs.filter((j) => j.status === "completed");
  const totalSpent = completedJobs.reduce((sum, j) => sum + (j.total_price || 0), 0);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            Service History
          </SheetTitle>
        </SheetHeader>

        {/* Vehicle Info */}
        <div className="mt-4 p-4 rounded-lg bg-muted/50 border">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Car className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="font-semibold">
                {vehicleInfo.make} {vehicleInfo.model}
                {vehicleInfo.year && ` (${vehicleInfo.year})`}
              </p>
              <p className="text-sm text-muted-foreground">{customerName}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 mt-3 text-sm">
            {vehicleInfo.color && (
              <div className="flex items-center gap-1">
                <div
                  className="h-3 w-3 rounded-full border"
                  style={{ backgroundColor: vehicleInfo.color.toLowerCase() }}
                />
                <span>{vehicleInfo.color}</span>
              </div>
            )}
            {vehicleInfo.license_plate && (
              <span className="font-mono bg-muted px-2 py-0.5 rounded">
                {vehicleInfo.license_plate}
              </span>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="p-3 rounded-lg bg-muted/50 text-center">
            <p className="text-2xl font-bold">{jobs.length}</p>
            <p className="text-xs text-muted-foreground">Total Jobs</p>
          </div>
          <div className="p-3 rounded-lg bg-green-500/10 text-center">
            <p className="text-2xl font-bold text-green-600">{completedJobs.length}</p>
            <p className="text-xs text-muted-foreground">Completed</p>
          </div>
          <div className="p-3 rounded-lg bg-primary/10 text-center">
            <p className="text-2xl font-bold text-primary">
              ${totalSpent.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">Total Spent</p>
          </div>
        </div>

        {/* Jobs List */}
        <ScrollArea className="h-[calc(100vh-380px)] mt-4">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-muted/50 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Wrench className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No service history</p>
              <p className="text-sm mt-1">This vehicle hasn't been serviced yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {jobs.map((job, index) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 rounded-lg border border-border hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {job.scheduled_date
                        ? new Date(job.scheduled_date).toLocaleDateString()
                        : new Date(job.created_at).toLocaleDateString()}
                    </div>
                    {getStatusBadge(job.status)}
                  </div>

                  {job.zones.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs text-muted-foreground mb-1">Services:</p>
                      <div className="flex flex-wrap gap-1">
                        {job.zones.slice(0, 3).map((zone) => (
                          <Badge key={zone.id} variant="secondary" className="text-xs">
                            {zone.zone_name.replace(/_/g, " ")}
                            {zone.completed && (
                              <CheckCircle2 className="h-3 w-3 ml-1 text-green-500" />
                            )}
                          </Badge>
                        ))}
                        {job.zones.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{job.zones.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {job.total_price && (
                    <p className="text-sm font-medium mt-2">
                      ${job.total_price.toLocaleString()}
                    </p>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
