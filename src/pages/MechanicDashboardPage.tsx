import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wrench,
  Clock,
  CheckCircle2,
  AlertCircle,
  Car,
  Calendar,
  User,
  Play,
  Send,
  Loader2,
  ChevronRight,
  Zap,
  Timer,
  Target,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { VehicleZoneSelector } from "@/components/mechanic/VehicleZoneSelector";
import { JobCard } from "@/components/mechanic/JobCard";
import { cn } from "@/lib/utils";

interface Job {
  id: string;
  status: string;
  scheduled_date: string | null;
  notes: string | null;
  customer?: { name: string; phone: string };
  car?: { make: string; model: string; year: number | null; color: string | null; vehicle_type?: string };
}

interface JobZone {
  id: string;
  zone_name: string;
  zone_type: string;
  services: any;
  completed: boolean;
  notes: string | null;
}

export default function MechanicDashboardPage() {
  const { profile, studio } = useAuth();
  const { toast } = useToast();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [zones, setZones] = useState<JobZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [submissionNotes, setSubmissionNotes] = useState("");

  useEffect(() => {
    if (studio?.id && profile?.id) {
      fetchJobs();
    }
  }, [studio?.id, profile?.id]);

  const fetchJobs = async () => {
    if (!studio?.id || !profile?.id) return;

    try {
      const { data, error } = await supabase
        .from("jobs")
        .select("*, customers(name, phone), cars(make, model, year, color, vehicle_type)")
        .eq("studio_id", studio.id)
        .eq("assigned_to", profile.id)
        .in("status", ["pending", "scheduled", "in_progress", "awaiting_review"])
        .order("created_at", { ascending: false });

      if (error) throw error;

      const jobsWithRelations = (data || []).map((j: any) => ({
        ...j,
        customer: j.customers,
        car: j.cars,
      }));

      setJobs(jobsWithRelations);

      // Auto-select first in-progress job
      const inProgress = jobsWithRelations.find((j: Job) => j.status === "in_progress");
      if (inProgress) {
        setSelectedJob(inProgress);
        fetchZones(inProgress.id);
      } else if (jobsWithRelations.length > 0) {
        setSelectedJob(jobsWithRelations[0]);
        fetchZones(jobsWithRelations[0].id);
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchZones = async (jobId: string) => {
    const { data, error } = await supabase
      .from("job_zones")
      .select("*")
      .eq("job_id", jobId)
      .order("created_at");

    if (!error && data) {
      setZones(data as JobZone[]);
    }
  };

  const handleStartJob = async (jobId: string) => {
    setUpdating(true);
    try {
      const { error } = await supabase
        .from("jobs")
        .update({ status: "in_progress" })
        .eq("id", jobId);

      if (error) throw error;

      toast({ title: "Job started", description: "Let's get to work!" });
      fetchJobs();
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Could not start job." });
    } finally {
      setUpdating(false);
    }
  };

  const handleCompleteZone = async (zoneId: string) => {
    setUpdating(true);
    try {
      const { error } = await supabase
        .from("job_zones")
        .update({ completed: true, completed_at: new Date().toISOString() })
        .eq("id", zoneId);

      if (error) throw error;

      // Log the work
      if (profile?.id && selectedJob?.id) {
        await supabase.from("work_logs").insert({
          job_id: selectedJob.id,
          zone_id: zoneId,
          performed_by: profile.id,
          action: "zone_completed",
        });
      }

      toast({ title: "Zone completed!", description: "Great work!" });
      if (selectedJob) fetchZones(selectedJob.id);
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Could not update zone." });
    } finally {
      setUpdating(false);
    }
  };

  const handleSubmitForReview = async () => {
    if (!selectedJob || !profile?.id) return;

    setUpdating(true);
    try {
      const { error: jobError } = await supabase
        .from("jobs")
        .update({ status: "awaiting_review" })
        .eq("id", selectedJob.id);

      if (jobError) throw jobError;

      const { error: subError } = await supabase
        .from("job_submissions")
        .insert({
          job_id: selectedJob.id,
          submitted_by: profile.id,
          notes: submissionNotes || null,
        });

      if (subError) throw subError;

      toast({
        title: "Submitted for review",
        description: "The studio owner will review your work.",
      });
      setSubmitDialogOpen(false);
      setSubmissionNotes("");
      fetchJobs();
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Could not submit job." });
    } finally {
      setUpdating(false);
    }
  };

  const activeJobs = jobs.filter((j) => j.status === "in_progress");
  const pendingJobs = jobs.filter((j) => j.status === "pending" || j.status === "scheduled");
  const reviewJobs = jobs.filter((j) => j.status === "awaiting_review");

  const completedZones = zones.filter((z) => z.completed).length;
  const progressPercent = zones.length > 0 ? (completedZones / zones.length) * 100 : 0;

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header with premium styling */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-card via-card to-racing/5 border border-border p-6"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-racing/10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative flex items-center gap-4">
            <motion.div
              className="h-14 w-14 rounded-2xl bg-gradient-to-br from-racing to-primary flex items-center justify-center shadow-lg shadow-racing/25"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
            >
              <Wrench className="h-7 w-7 text-white" />
            </motion.div>
            <div>
              <h1 className="font-display text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                Mechanic Workbench
              </h1>
              <p className="text-muted-foreground">
                {activeJobs.length > 0
                  ? `${activeJobs.length} active job${activeJobs.length > 1 ? "s" : ""} in progress`
                  : "Ready for your next assignment"}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Quick Stats Grid */}
        <div className="grid gap-4 md:grid-cols-4">
          {[
            { label: "Queue", value: pendingJobs.length, icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10" },
            { label: "Active", value: activeJobs.length, icon: Zap, color: "text-racing", bg: "bg-racing/10" },
            { label: "In Review", value: reviewJobs.length, icon: Target, color: "text-purple-500", bg: "bg-purple-500/10" },
            { label: "Today", value: jobs.filter(j => j.scheduled_date === new Date().toISOString().split("T")[0]).length, icon: Calendar, color: "text-blue-500", bg: "bg-blue-500/10" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="relative overflow-hidden group hover:border-primary/50 transition-colors">
                <div className={cn("absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity", stat.bg)} />
                <CardContent className="pt-6 relative">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="text-3xl font-bold">{stat.value}</p>
                    </div>
                    <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center", stat.bg)}>
                      <stat.icon className={cn("h-6 w-6", stat.color)} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Jobs Queue */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-4"
          >
            <Card className="h-full">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Car className="h-5 w-5 text-primary" />
                  My Jobs
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {jobs.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    <Wrench className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p className="font-medium">No jobs assigned</p>
                    <p className="text-sm mt-1">Check back soon!</p>
                  </div>
                ) : (
                  <div className="divide-y max-h-[500px] overflow-y-auto">
                    {jobs.map((job) => (
                      <JobCard
                        key={job.id}
                        job={job}
                        isSelected={selectedJob?.id === job.id}
                        onClick={() => {
                          setSelectedJob(job);
                          fetchZones(job.id);
                        }}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Active Work Area */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-8"
          >
            {selectedJob ? (
              <Card className="overflow-hidden">
                {/* Job Header */}
                <CardHeader className="bg-gradient-to-r from-racing/10 via-primary/5 to-transparent border-b">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-racing/20 to-primary/20 flex items-center justify-center">
                        <Car className="h-8 w-8 text-racing" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl">
                          {selectedJob.car?.make} {selectedJob.car?.model}
                          {selectedJob.car?.year && <span className="text-muted-foreground font-normal ml-2">({selectedJob.car.year})</span>}
                        </CardTitle>
                        <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {selectedJob.customer?.name}
                          </span>
                          {selectedJob.car?.color && (
                            <Badge variant="outline" className="text-xs">
                              {selectedJob.car.color}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "text-sm px-3 py-1",
                        selectedJob.status === "in_progress" && "bg-racing/15 text-racing border-racing/30",
                        selectedJob.status === "pending" && "bg-amber-500/15 text-amber-500 border-amber-500/30",
                        selectedJob.status === "scheduled" && "bg-blue-500/15 text-blue-500 border-blue-500/30",
                        selectedJob.status === "awaiting_review" && "bg-purple-500/15 text-purple-500 border-purple-500/30"
                      )}
                    >
                      {selectedJob.status.replace("_", " ")}
                    </Badge>
                  </div>

                  {/* Progress Bar */}
                  {zones.length > 0 && (
                    <div className="mt-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-semibold text-racing">
                          {completedZones}/{zones.length} zones
                        </span>
                      </div>
                      <Progress value={progressPercent} className="h-2" />
                    </div>
                  )}
                </CardHeader>

                <CardContent className="p-0">
                  {/* Start Button */}
                  {(selectedJob.status === "pending" || selectedJob.status === "scheduled") && (
                    <div className="p-8 text-center border-b bg-gradient-to-b from-transparent to-racing/5">
                      <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring" }}
                      >
                        <Button
                          size="lg"
                          onClick={() => handleStartJob(selectedJob.id)}
                          disabled={updating}
                          className="gap-2 bg-gradient-to-r from-racing to-primary hover:from-racing/90 hover:to-primary/90 shadow-lg shadow-racing/25"
                        >
                          {updating ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                          ) : (
                            <Play className="h-5 w-5" />
                          )}
                          Start Working
                        </Button>
                      </motion.div>
                    </div>
                  )}

                  {/* Zone Selector */}
                  {zones.length > 0 && (
                    <VehicleZoneSelector
                      zones={zones}
                      vehicleType={selectedJob.car?.vehicle_type || "sedan"}
                      onCompleteZone={handleCompleteZone}
                      disabled={selectedJob.status !== "in_progress" || updating}
                    />
                  )}

                  {zones.length === 0 && selectedJob.status === "in_progress" && (
                    <div className="p-8 text-center text-muted-foreground">
                      <AlertCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No zones configured for this job</p>
                    </div>
                  )}

                  {/* Submit Button */}
                  {selectedJob.status === "in_progress" && zones.length > 0 && (
                    <div className="p-6 bg-muted/30 border-t">
                      <Button
                        className="w-full gap-2"
                        size="lg"
                        disabled={completedZones < zones.length}
                        onClick={() => setSubmitDialogOpen(true)}
                      >
                        <Send className="h-5 w-5" />
                        Submit for Review
                      </Button>
                      {completedZones < zones.length && (
                        <p className="text-sm text-muted-foreground text-center mt-2">
                          Complete all {zones.length - completedZones} remaining zone(s)
                        </p>
                      )}
                    </div>
                  )}

                  {/* Job Notes */}
                  {selectedJob.notes && (
                    <div className="p-4 bg-amber-500/5 border-t border-amber-500/20">
                      <p className="text-sm font-medium text-amber-600 mb-1">Job Notes:</p>
                      <p className="text-sm text-muted-foreground">{selectedJob.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-20 text-center">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                  >
                    <Car className="h-20 w-20 mx-auto mb-4 text-muted-foreground/20" />
                    <h3 className="font-semibold text-xl mb-2">Select a Job</h3>
                    <p className="text-muted-foreground">
                      Choose a job from your queue to start working
                    </p>
                  </motion.div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </div>
      </div>

      {/* Submit Dialog */}
      <Dialog open={submitDialogOpen} onOpenChange={setSubmitDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Job for Review</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Completion Notes (optional)</Label>
              <Textarea
                placeholder="Any notes about the completed work, issues found, or recommendations..."
                value={submissionNotes}
                onChange={(e) => setSubmissionNotes(e.target.value)}
                rows={4}
              />
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setSubmitDialogOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitForReview}
                className="flex-1"
                disabled={updating}
              >
                {updating ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Submit
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
