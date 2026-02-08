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
  Zap,
  Target,
  TrendingUp,
  FileText,
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
import { Job3DViewer } from "@/components/mechanic/Job3DViewer";
import { EnhancedZoneSelector } from "@/components/mechanic/EnhancedZoneSelector";
import { WorkLogsPanel } from "@/components/mechanic/WorkLogsPanel";
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

interface CarModel3D {
  id: string;
  make: string;
  model: string;
  model_url: string;
  default_color: string | null;
}

export default function StaffDashboardPage() {
  const { profile, studio } = useAuth();
  const { toast } = useToast();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [zones, setZones] = useState<JobZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState("assigned");
  const [workTab, setWorkTab] = useState("zones");
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [submissionNotes, setSubmissionNotes] = useState("");
  const [carModel3D, setCarModel3D] = useState<CarModel3D | null>(null);

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
        fetchCarModel3D(inProgress.car?.make, inProgress.car?.model);
      } else if (jobsWithRelations.length > 0) {
        setSelectedJob(jobsWithRelations[0]);
        fetchZones(jobsWithRelations[0].id);
        fetchCarModel3D(jobsWithRelations[0].car?.make, jobsWithRelations[0].car?.model);
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

  const fetchCarModel3D = async (make?: string, model?: string) => {
    if (!make || !model) {
      setCarModel3D(null);
      return;
    }

    const { data } = await supabase
      .from("car_models_3d")
      .select("*")
      .eq("is_active", true)
      .ilike("make", make)
      .ilike("model", `%${model}%`)
      .limit(1)
      .maybeSingle();

    setCarModel3D(data as CarModel3D | null);
  };

  const handleStartJob = async (jobId: string) => {
    setUpdating(true);
    try {
      const { error } = await supabase
        .from("jobs")
        .update({ status: "in_progress" })
        .eq("id", jobId);

      if (error) throw error;

      // Log job start
      if (profile?.id) {
        await supabase.from("work_logs").insert({
          job_id: jobId,
          performed_by: profile.id,
          action: "job_started",
        });
      }

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

      // Log the work
      if (profile?.id && selectedJob?.id) {
        await supabase.from("work_logs").insert({
          job_id: selectedJob.id,
          zone_id: zoneId,
          performed_by: profile.id,
          action: "zone_completed",
        });
      }

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

      // Log submission
      await supabase.from("work_logs").insert({
        job_id: selectedJob.id,
        performed_by: profile.id,
        action: "job_submitted",
        notes: submissionNotes || null,
      });

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
        {/* Header with premium styling */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-card via-card to-primary/5 border border-border p-6"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-racing/10 blur-2xl rounded-full translate-y-1/2 -translate-x-1/2" />
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.div
                className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-racing flex items-center justify-center shadow-lg shadow-primary/25"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
              >
                <ClipboardList className="h-7 w-7 text-white" />
              </motion.div>
              <div>
                <h1 className="font-display text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                  Staff Dashboard
                </h1>
                <p className="text-muted-foreground">
                  {activeJobs.length > 0
                    ? `${activeJobs.length} job${activeJobs.length > 1 ? "s" : ""} in progress`
                    : "No active jobs"}
                </p>
              </div>
            </div>
            {profile && (
              <div className="hidden md:flex items-center gap-3 bg-background/50 backdrop-blur rounded-xl px-4 py-2 border">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-racing/20 flex items-center justify-center">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div className="text-right">
                  <p className="font-medium">{profile.full_name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{profile.role}</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          {[
            { label: "Pending", value: pendingJobs.length, icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10" },
            { label: "In Progress", value: activeJobs.length, icon: Zap, color: "text-racing", bg: "bg-racing/10" },
            { label: "Awaiting Review", value: reviewJobs.length, icon: Target, color: "text-purple-500", bg: "bg-purple-500/10" },
            { label: "Today's Schedule", value: jobs.filter(j => j.scheduled_date === new Date().toISOString().split("T")[0]).length, icon: Calendar, color: "text-blue-500", bg: "bg-blue-500/10" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="relative overflow-hidden group hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/5">
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
          {/* Jobs List */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-4"
          >
            <Card className="h-full">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
                <CardTitle className="flex items-center gap-2">
                  <ClipboardList className="h-5 w-5 text-primary" />
                  Assigned Jobs
                  <Badge variant="outline" className="ml-auto">
                    {jobs.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="w-full rounded-none border-b bg-transparent p-0">
                    <TabsTrigger
                      value="assigned"
                      className="flex-1 rounded-none py-3 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary"
                    >
                      Active ({pendingJobs.length + activeJobs.length})
                    </TabsTrigger>
                    <TabsTrigger
                      value="review"
                      className="flex-1 rounded-none py-3 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary"
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
                      <div className="divide-y max-h-[400px] overflow-y-auto">
                        {[...activeJobs, ...pendingJobs].map((job) => (
                          <motion.button
                            key={job.id}
                            onClick={() => {
                              setSelectedJob(job);
                              fetchZones(job.id);
                              fetchCarModel3D(job.car?.make, job.car?.model);
                            }}
                            className={cn(
                              "w-full p-4 text-left transition-all",
                              selectedJob?.id === job.id 
                                ? "bg-primary/5 border-l-2 border-l-primary" 
                                : "hover:bg-muted/50 border-l-2 border-l-transparent"
                            )}
                            whileHover={{ x: 4 }}
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
                          </motion.button>
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
                      <div className="divide-y max-h-[400px] overflow-y-auto">
                        {reviewJobs.map((job) => (
                          <motion.button
                            key={job.id}
                            onClick={() => {
                              setSelectedJob(job);
                              fetchZones(job.id);
                              fetchCarModel3D(job.car?.make, job.car?.model);
                            }}
                            className={cn(
                              "w-full p-4 text-left transition-all",
                              selectedJob?.id === job.id 
                                ? "bg-purple-500/5 border-l-2 border-l-purple-500" 
                                : "hover:bg-muted/50 border-l-2 border-l-transparent"
                            )}
                            whileHover={{ x: 4 }}
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
                          </motion.button>
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
            className="lg:col-span-8"
          >
            {selectedJob ? (
              <div className="space-y-6">
                {/* 3D Vehicle Viewer */}
                <Card className="overflow-hidden">
                  <Job3DViewer
                    modelUrl={carModel3D?.model_url || null}
                    carColor={selectedJob.car?.color || carModel3D?.default_color}
                    vehicleInfo={selectedJob.car ? {
                      make: selectedJob.car.make,
                      model: selectedJob.car.model,
                      year: selectedJob.car.year,
                      vehicleType: selectedJob.car.vehicle_type
                    } : undefined}
                    completedZones={zones.filter(z => z.completed).map(z => 
                      z.zone_name.toLowerCase().replace(/\s+/g, "_")
                    )}
                    totalZones={zones.length}
                  />
                </Card>

                {/* Work Area Card */}
                <Card className="overflow-hidden">
                  <CardHeader className="pb-4 bg-gradient-to-r from-primary/5 via-racing/5 to-transparent border-b">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/20 to-racing/20 flex items-center justify-center">
                          <Car className="h-7 w-7 text-primary" />
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
                              <Badge variant="outline" className="text-xs">
                                {selectedJob.car.color}
                              </Badge>
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
                          <span className="font-medium text-primary">
                            {completedZones}/{zones.length} zones complete
                          </span>
                        </div>
                        <div className="relative">
                          <Progress value={progressPercent} className="h-3" />
                          {progressPercent > 0 && (
                            <motion.div
                              className="absolute inset-y-0 left-0 flex items-center justify-end pr-2"
                              style={{ width: `${progressPercent}%` }}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                            >
                              <span className="text-[10px] font-bold text-white">
                                {Math.round(progressPercent)}%
                              </span>
                            </motion.div>
                          )}
                        </div>
                      </div>
                    )}
                  </CardHeader>

                  <CardContent className="p-0">
                    {/* Start/Resume Button */}
                    {(selectedJob.status === "pending" || selectedJob.status === "scheduled") && (
                      <div className="p-8 text-center border-b bg-gradient-to-b from-transparent to-primary/5">
                        <motion.div
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ type: "spring" }}
                        >
                          <Button
                            size="lg"
                            onClick={() => handleStartJob(selectedJob.id)}
                            disabled={updating}
                            className="gap-2 bg-gradient-to-r from-primary to-racing hover:from-primary/90 hover:to-racing/90 shadow-lg shadow-primary/25"
                          >
                            {updating ? (
                              <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                              <Play className="h-5 w-5" />
                            )}
                            Start Working on This Job
                          </Button>
                        </motion.div>
                      </div>
                    )}

                    {/* Tabs for In-Progress Jobs */}
                    {selectedJob.status === "in_progress" && (
                      <Tabs value={workTab} onValueChange={setWorkTab} className="w-full">
                        <TabsList className="w-full rounded-none border-b bg-transparent p-0">
                          <TabsTrigger
                            value="zones"
                            className="flex-1 rounded-none py-3 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary"
                          >
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Work Zones
                          </TabsTrigger>
                          <TabsTrigger
                            value="activity"
                            className="flex-1 rounded-none py-3 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary"
                          >
                            <TrendingUp className="h-4 w-4 mr-2" />
                            Activity
                          </TabsTrigger>
                        </TabsList>

                        <TabsContent value="zones" className="m-0">
                          {zones.length > 0 ? (
                            <EnhancedZoneSelector
                              zones={zones}
                              vehicleType={selectedJob.car?.vehicle_type || "sedan"}
                              onCompleteZone={handleCompleteZone}
                              disabled={updating}
                              isWorking={true}
                            />
                          ) : (
                            <div className="p-8 text-center text-muted-foreground">
                              <AlertCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                              <p>No zones configured for this job</p>
                            </div>
                          )}
                        </TabsContent>

                        <TabsContent value="activity" className="m-0 p-4">
                          <WorkLogsPanel jobId={selectedJob.id} />
                        </TabsContent>
                      </Tabs>
                    )}

                    {/* Non-in-progress zone display */}
                    {selectedJob.status !== "in_progress" && zones.length > 0 && (
                      <EnhancedZoneSelector
                        zones={zones}
                        vehicleType={selectedJob.car?.vehicle_type || "sedan"}
                        onCompleteZone={handleCompleteZone}
                        disabled={true}
                        isWorking={false}
                      />
                    )}

                    {/* Submit Button */}
                    {selectedJob.status === "in_progress" && zones.length > 0 && (
                      <div className="p-6 bg-gradient-to-r from-muted/30 to-transparent border-t">
                        <Button
                          className="w-full gap-2 bg-gradient-to-r from-primary to-racing"
                          size="lg"
                          disabled={completedZones < zones.length}
                          onClick={() => setSubmitDialogOpen(true)}
                        >
                          <Send className="h-5 w-5" />
                          Submit for Owner Review
                        </Button>
                        {completedZones < zones.length && (
                          <p className="text-sm text-muted-foreground text-center mt-2">
                            Complete all zones before submitting
                          </p>
                        )}
                      </div>
                    )}

                    {/* Job Notes */}
                    {selectedJob.notes && (
                      <div className="p-4 bg-amber-500/5 border-t border-amber-500/20">
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="h-4 w-4 text-amber-600" />
                          <p className="text-sm font-medium text-amber-600">Job Notes</p>
                        </div>
                        <p className="text-sm text-muted-foreground">{selectedJob.notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="py-16 text-center">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                  >
                    <Car className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
                    <h3 className="font-semibold mb-1">No job selected</h3>
                    <p className="text-sm text-muted-foreground">
                      Select a job from the list to view details
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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="h-5 w-5 text-primary" />
              Submit Job for Review
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 rounded-lg bg-muted/50 border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Completion Status</span>
                <Badge className="bg-accent/80 text-accent-foreground">
                  {completedZones}/{zones.length} zones
                </Badge>
              </div>
              <Progress value={progressPercent} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <Label>Completion Notes (optional)</Label>
              <Textarea
                placeholder="Any notes about the completed work, issues found, or recommendations..."
                value={submissionNotes}
                onChange={(e) => setSubmissionNotes(e.target.value)}
                rows={4}
                className="resize-none"
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
                className="flex-1 bg-gradient-to-r from-primary to-racing"
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
