import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  AlertCircle,
  Car,
  Calendar,
  User,
  Play,
  Send,
  Loader2,
  Camera,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AnimatedCarSilhouette } from "@/components/car/AnimatedCarSilhouette";

interface Job {
  id: string;
  status: string;
  scheduled_date: string | null;
  notes: string | null;
  customer?: { name: string; phone: string };
  car?: { make: string; model: string; year: number | null; color: string | null };
}

interface JobZone {
  id: string;
  zone_name: string;
  zone_type: string;
  services: any;
  completed: boolean;
  notes: string | null;
}

export default function StaffDashboardPage() {
  const { profile, studio, isOwner } = useAuth();
  const { toast } = useToast();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [zones, setZones] = useState<JobZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState("assigned");
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
        .select("*, customers(name, phone), cars(make, model, year, color)")
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

      toast({ title: "Job started", description: "You can now work on this job." });
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

      toast({ title: "Zone completed!" });
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
      // Update job status
      const { error: jobError } = await supabase
        .from("jobs")
        .update({ status: "awaiting_review" })
        .eq("id", selectedJob.id);

      if (jobError) throw jobError;

      // Create submission record
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

  const pendingJobs = jobs.filter((j) => j.status === "pending" || j.status === "scheduled");
  const activeJobs = jobs.filter((j) => j.status === "in_progress");
  const reviewJobs = jobs.filter((j) => j.status === "awaiting_review");

  const completedZones = zones.filter((z) => z.completed).length;
  const progressPercent = zones.length > 0 ? (completedZones / zones.length) * 100 : 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-amber-500/15 text-amber-500 border-amber-500/30";
      case "scheduled":
        return "bg-blue-500/15 text-blue-500 border-blue-500/30";
      case "in_progress":
        return "bg-racing/15 text-racing border-racing/30";
      case "awaiting_review":
        return "bg-purple-500/15 text-purple-500 border-purple-500/30";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

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
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4"
        >
          <motion.div
            className="h-12 w-1.5 bg-gradient-to-b from-racing to-primary rounded-full"
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
          />
          <div>
            <h1 className="font-display text-3xl font-bold">My Jobs</h1>
            <p className="text-muted-foreground">
              {activeJobs.length > 0
                ? `${activeJobs.length} job${activeJobs.length > 1 ? "s" : ""} in progress`
                : "No active jobs"}
            </p>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          {[
            { label: "Pending", value: pendingJobs.length, icon: Clock, color: "text-amber-500" },
            { label: "In Progress", value: activeJobs.length, icon: Play, color: "text-racing" },
            { label: "Awaiting Review", value: reviewJobs.length, icon: AlertCircle, color: "text-purple-500" },
            { label: "Today's Schedule", value: jobs.filter(j => j.scheduled_date === new Date().toISOString().split("T")[0]).length, icon: Calendar, color: "text-blue-500" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                    </div>
                    <stat.icon className={`h-8 w-8 ${stat.color} opacity-80`} />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Jobs List */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardList className="h-5 w-5 text-primary" />
                  Assigned Jobs
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="w-full rounded-none border-b bg-transparent p-0">
                    <TabsTrigger
                      value="assigned"
                      className="flex-1 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
                    >
                      Active ({pendingJobs.length + activeJobs.length})
                    </TabsTrigger>
                    <TabsTrigger
                      value="review"
                      className="flex-1 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
                    >
                      In Review ({reviewJobs.length})
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="assigned" className="m-0">
                    {[...activeJobs, ...pendingJobs].length === 0 ? (
                      <div className="p-8 text-center text-muted-foreground">
                        <ClipboardList className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>No assigned jobs</p>
                      </div>
                    ) : (
                      <div className="divide-y">
                        {[...activeJobs, ...pendingJobs].map((job) => (
                          <button
                            key={job.id}
                            onClick={() => {
                              setSelectedJob(job);
                              fetchZones(job.id);
                            }}
                            className={`w-full p-4 text-left hover:bg-muted/50 transition-colors ${
                              selectedJob?.id === job.id ? "bg-muted/50" : ""
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium">
                                {job.car?.make} {job.car?.model}
                              </span>
                              <Badge variant="outline" className={getStatusColor(job.status)}>
                                {job.status.replace("_", " ")}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {job.customer?.name}
                            </p>
                          </button>
                        ))}
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="review" className="m-0">
                    {reviewJobs.length === 0 ? (
                      <div className="p-8 text-center text-muted-foreground">
                        <CheckCircle2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>No jobs awaiting review</p>
                      </div>
                    ) : (
                      <div className="divide-y">
                        {reviewJobs.map((job) => (
                          <button
                            key={job.id}
                            onClick={() => {
                              setSelectedJob(job);
                              fetchZones(job.id);
                            }}
                            className={`w-full p-4 text-left hover:bg-muted/50 transition-colors ${
                              selectedJob?.id === job.id ? "bg-muted/50" : ""
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium">
                                {job.car?.make} {job.car?.model}
                              </span>
                              <Badge variant="outline" className={getStatusColor(job.status)}>
                                Awaiting Review
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {job.customer?.name}
                            </p>
                          </button>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </motion.div>

          {/* Job Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2"
          >
            {selectedJob ? (
              <Card>
                <CardHeader className="pb-4 bg-gradient-to-r from-racing/5 to-primary/5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 rounded-xl bg-racing/10 flex items-center justify-center">
                        <Car className="h-7 w-7 text-racing" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">
                          {selectedJob.car?.make} {selectedJob.car?.model}
                          {selectedJob.car?.year && ` (${selectedJob.car.year})`}
                        </CardTitle>
                        <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {selectedJob.customer?.name}
                          </span>
                          {selectedJob.car?.color && (
                            <span>{selectedJob.car.color}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline" className={getStatusColor(selectedJob.status)}>
                      {selectedJob.status.replace("_", " ")}
                    </Badge>
                  </div>

                  {/* Progress */}
                  {zones.length > 0 && (
                    <div className="mt-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">
                          {completedZones}/{zones.length} zones complete
                        </span>
                      </div>
                      <Progress value={progressPercent} className="h-2" />
                    </div>
                  )}
                </CardHeader>

                <CardContent className="p-0">
                  {/* Start/Resume Button */}
                  {(selectedJob.status === "pending" || selectedJob.status === "scheduled") && (
                    <div className="p-6 text-center border-b">
                      <Button
                        size="lg"
                        onClick={() => handleStartJob(selectedJob.id)}
                        disabled={updating}
                        className="gap-2"
                      >
                        {updating ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <Play className="h-5 w-5" />
                        )}
                        Start Working on This Job
                      </Button>
                    </div>
                  )}

                  {/* Zones Checklist */}
                  {zones.length > 0 ? (
                    <div className="divide-y">
                      {zones.map((zone, i) => (
                        <motion.div
                          key={zone.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className={`p-4 flex items-center justify-between ${
                            zone.completed ? "bg-green-500/5" : ""
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => !zone.completed && handleCompleteZone(zone.id)}
                              disabled={selectedJob.status !== "in_progress" || zone.completed || updating}
                              className={`h-6 w-6 rounded-full flex items-center justify-center transition-colors ${
                                zone.completed
                                  ? "bg-green-500 text-white"
                                  : selectedJob.status === "in_progress"
                                  ? "border-2 border-muted-foreground/30 hover:border-green-500"
                                  : "border-2 border-muted-foreground/20"
                              }`}
                            >
                              {zone.completed && <CheckCircle2 className="h-4 w-4" />}
                            </button>
                            <div>
                              <p className={`font-medium ${zone.completed ? "line-through text-muted-foreground" : ""}`}>
                                {zone.zone_name}
                              </p>
                              <p className="text-xs text-muted-foreground capitalize">
                                {zone.zone_type} • {Array.isArray(zone.services) ? zone.services.length : 0} services
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={selectedJob.status !== "in_progress"}
                          >
                            <Camera className="h-4 w-4 mr-1" />
                            Media
                          </Button>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-muted-foreground">
                      <AlertCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No zones configured for this job</p>
                    </div>
                  )}

                  {/* Submit Button */}
                  {selectedJob.status === "in_progress" && (
                    <div className="p-6 bg-muted/30 border-t">
                      <Button
                        className="w-full gap-2"
                        size="lg"
                        disabled={completedZones < zones.length || zones.length === 0}
                        onClick={() => setSubmitDialogOpen(true)}
                      >
                        <Send className="h-5 w-5" />
                        Submit for Owner Review
                      </Button>
                      {zones.length > 0 && completedZones < zones.length && (
                        <p className="text-sm text-muted-foreground text-center mt-2">
                          Complete all zones before submitting
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
                <CardContent className="py-16 text-center">
                  <Car className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
                  <h3 className="font-semibold mb-1">No job selected</h3>
                  <p className="text-sm text-muted-foreground">
                    Select a job from the list to view details
                  </p>
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
