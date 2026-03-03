import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Car, Clock, HandMetal, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface UnassignedJob {
  id: string;
  status: string;
  scheduled_date: string | null;
  notes: string | null;
  total_price: number | null;
  customer: { name: string; phone: string } | null;
  car: { make: string; model: string; year: number | null; color: string | null } | null;
}

interface AssignmentRequest {
  id: string;
  job_id: string;
  status: string;
  denial_reason: string | null;
  created_at: string;
}

export function MechanicJobQueue() {
  const { studio, profile } = useAuth();
  const { toast } = useToast();
  const [unassignedJobs, setUnassignedJobs] = useState<UnassignedJob[]>([]);
  const [myRequests, setMyRequests] = useState<AssignmentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState<string | null>(null);

  useEffect(() => {
    if (studio?.id && profile?.id) fetchData();
  }, [studio?.id, profile?.id]);

  const fetchData = async () => {
    if (!studio?.id || !profile?.id) return;

    try {
      const [jobsRes, requestsRes] = await Promise.all([
        supabase
          .from("jobs")
          .select("id, status, scheduled_date, notes, total_price, customers(name, phone), cars(make, model, year, color)")
          .eq("studio_id", studio.id)
          .is("assigned_to", null)
          .in("status", ["pending", "scheduled"])
          .order("created_at", { ascending: false }),
        supabase
          .from("job_assignment_requests" as any)
          .select("id, job_id, status, denial_reason, created_at")
          .eq("requested_by", profile.id)
          .eq("studio_id", studio.id)
          .order("created_at", { ascending: false }),
      ]);

      const mapped = (jobsRes.data || []).map((j: any) => ({
        ...j,
        customer: j.customers,
        car: j.cars,
      }));

      setUnassignedJobs(mapped);
      setMyRequests((requestsRes.data || []) as unknown as AssignmentRequest[]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const requestAssignment = async (jobId: string) => {
    if (!studio?.id || !profile?.id) return;
    setRequesting(jobId);

    try {
      // Create assignment request
      const { error } = await supabase.from("job_assignment_requests" as any).insert({
        job_id: jobId,
        requested_by: profile.id,
        studio_id: studio.id,
      } as any);

      if (error) throw error;

      // Notify owner
      const { data: ownerProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("studio_id", studio.id)
        .eq("role", "owner")
        .limit(1)
        .maybeSingle();

      if (ownerProfile) {
        const job = unassignedJobs.find(j => j.id === jobId);
        await supabase.from("notifications" as any).insert({
          studio_id: studio.id,
          recipient_id: ownerProfile.id,
          type: "assignment_request",
          title: "Job Assignment Request",
          message: `${profile.full_name} wants to work on ${job?.car?.make} ${job?.car?.model}`,
          data: { job_id: jobId, requester_id: profile.id },
        } as any);
      }

      toast({ title: "Request sent!", description: "Waiting for owner approval" });
      fetchData();
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Could not send request" });
    } finally {
      setRequesting(null);
    }
  };

  const getRequestStatus = (jobId: string) => {
    return myRequests.find(r => r.job_id === jobId);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="bg-gradient-to-r from-amber-500/5 to-transparent">
        <CardTitle className="flex items-center gap-2 text-lg">
          <HandMetal className="h-5 w-5 text-amber-500" />
          Available Jobs
          <Badge variant="outline" className="ml-auto">{unassignedJobs.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {unassignedJobs.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <Car className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No unassigned jobs</p>
            <p className="text-sm mt-1">Check back later for new jobs</p>
          </div>
        ) : (
          <div className="divide-y">
            {unassignedJobs.map((job, i) => {
              const request = getRequestStatus(job.id);
              return (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-4 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                      <Car className="h-5 w-5 text-amber-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold">
                        {job.car?.make} {job.car?.model}
                        {job.car?.year && <span className="text-muted-foreground font-normal text-sm ml-1">'{String(job.car.year).slice(-2)}</span>}
                      </p>
                      <p className="text-sm text-muted-foreground">{job.customer?.name}</p>
                      {job.scheduled_date && (
                        <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(job.scheduled_date).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {!request ? (
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-racing/30 text-racing hover:bg-racing/10"
                          onClick={() => requestAssignment(job.id)}
                          disabled={requesting === job.id}
                        >
                          {requesting === job.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            "Pick Up"
                          )}
                        </Button>
                      ) : request.status === "pending" ? (
                        <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/30 text-xs">
                          <Clock className="h-3 w-3 mr-1" />
                          Awaiting Approval
                        </Badge>
                      ) : request.status === "approved" ? (
                        <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/30 text-xs">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Approved
                        </Badge>
                      ) : (
                        <div>
                          <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30 text-xs">
                            <XCircle className="h-3 w-3 mr-1" />
                            Denied
                          </Badge>
                          {request.denial_reason && (
                            <p className="text-[10px] text-muted-foreground mt-1 max-w-[140px] truncate">
                              {request.denial_reason}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
