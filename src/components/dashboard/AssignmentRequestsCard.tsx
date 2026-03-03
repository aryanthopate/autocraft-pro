import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { UserCheck, Check, X, Loader2, Wrench, Car } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface AssignmentRequestRow {
  id: string;
  job_id: string;
  status: string;
  created_at: string;
  requester: { id: string; full_name: string } | null;
  job: {
    id: string;
    car: { make: string; model: string; year: number | null } | null;
    customer: { name: string } | null;
  } | null;
}

export function AssignmentRequestsCard() {
  const { studio, profile } = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState<AssignmentRequestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [denyDialogId, setDenyDialogId] = useState<string | null>(null);
  const [denyReason, setDenyReason] = useState("");

  useEffect(() => {
    if (studio?.id) fetchRequests();
  }, [studio?.id]);

  const fetchRequests = async () => {
    if (!studio?.id) return;

    const { data } = await supabase
      .from("job_assignment_requests" as any)
      .select(`
        id, job_id, status, created_at,
        profiles!job_assignment_requests_requested_by_fkey(id, full_name),
        jobs!job_assignment_requests_job_id_fkey(id, cars(make, model, year), customers(name))
      `)
      .eq("studio_id", studio.id)
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    const mapped = (data || []).map((r: any) => ({
      ...r,
      requester: r.profiles,
      job: r.jobs ? { ...r.jobs, car: r.jobs.cars, customer: r.jobs.customers } : null,
    }));

    setRequests(mapped);
    setLoading(false);
  };

  const handleApprove = async (requestId: string, jobId: string, requesterId: string) => {
    if (!profile?.id || !studio?.id) return;
    setProcessing(requestId);

    try {
      // Approve request
      await supabase
        .from("job_assignment_requests" as any)
        .update({ status: "approved", reviewed_by: profile.id, reviewed_at: new Date().toISOString() } as any)
        .eq("id", requestId);

      // Assign job to mechanic
      await supabase
        .from("jobs")
        .update({ assigned_to: requesterId })
        .eq("id", jobId);

      // Deny other pending requests for same job
      await supabase
        .from("job_assignment_requests")
        .update({ status: "denied", reviewed_by: profile.id, reviewed_at: new Date().toISOString(), denial_reason: "Another mechanic was assigned" })
        .eq("job_id", jobId)
        .eq("status", "pending")
        .neq("id", requestId);

      // Notify mechanic
      await supabase.from("notifications").insert({
        studio_id: studio.id,
        recipient_id: requesterId,
        type: "assignment_approved",
        title: "Job Assigned to You",
        message: "Your job assignment request has been approved. You can start working!",
        data: { job_id: jobId },
      } as any);

      toast({ title: "Approved!", description: "Mechanic has been assigned to the job." });
      fetchRequests();
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Could not process request" });
    } finally {
      setProcessing(null);
    }
  };

  const handleDeny = async () => {
    if (!denyDialogId || !profile?.id || !studio?.id) return;
    setProcessing(denyDialogId);

    try {
      const req = requests.find(r => r.id === denyDialogId);

      await supabase
        .from("job_assignment_requests" as any)
        .update({ status: "denied", reviewed_by: profile.id, reviewed_at: new Date().toISOString(), denial_reason: denyReason || null } as any)
        .eq("id", denyDialogId);

      if (req?.requester?.id) {
        await supabase.from("notifications" as any).insert({
          studio_id: studio.id,
          recipient_id: req.requester.id,
          type: "assignment_denied",
          title: "Job Request Denied",
          message: denyReason || "Your assignment request was not approved.",
          data: { job_id: req.job_id },
        } as any);
      }

      toast({ title: "Request denied" });
      setDenyDialogId(null);
      setDenyReason("");
      fetchRequests();
    } catch {
      toast({ variant: "destructive", title: "Error" });
    } finally {
      setProcessing(null);
    }
  };

  if (loading || requests.length === 0) return null;

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="border-racing/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <UserCheck className="h-5 w-5 text-racing" />
              Assignment Requests
              <Badge variant="outline" className="ml-auto bg-racing/10 text-racing border-racing/30">
                {requests.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {requests.map((req) => (
              <div key={req.id} className="p-3 rounded-xl border border-border bg-card hover:border-racing/20 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-full bg-racing/10 flex items-center justify-center flex-shrink-0">
                    <Wrench className="h-5 w-5 text-racing" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold">{req.requester?.full_name}</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Car className="h-3 w-3" />
                      {req.job?.car?.make} {req.job?.car?.model} • {req.job?.customer?.name}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 text-destructive border-destructive/30 hover:bg-destructive/10"
                      onClick={() => setDenyDialogId(req.id)}
                      disabled={processing === req.id}
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      className="h-8 bg-racing hover:bg-racing/90"
                      onClick={() => handleApprove(req.id, req.job_id, req.requester!.id)}
                      disabled={processing === req.id}
                    >
                      {processing === req.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5 mr-1" />}
                      Approve
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      <Dialog open={!!denyDialogId} onOpenChange={() => { setDenyDialogId(null); setDenyReason(""); }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Deny Request</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Reason (optional)"
              value={denyReason}
              onChange={(e) => setDenyReason(e.target.value)}
            />
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setDenyDialogId(null)}>Cancel</Button>
              <Button variant="destructive" onClick={handleDeny} disabled={!!processing}>
                Deny
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
