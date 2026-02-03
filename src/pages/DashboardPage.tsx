import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  ClipboardList, 
  Users, 
  Car, 
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Zap,
  Target,
  Gauge,
  Play,
  Send,
  Loader2,
  Calendar,
  User,
  Camera,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnimatedCarSilhouette } from "@/components/car/AnimatedCarSilhouette";
import { SpeedometerWidget } from "@/components/car/SpeedometerWidget";
import { RacingStatsCard } from "@/components/car/RacingStatsCard";

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
}

export default function DashboardPage() {
  const { profile, studio, isOwner } = useAuth();
  const { toast } = useToast();
  const [selectedCarZones, setSelectedCarZones] = useState<string[]>([]);
  
  // Staff-specific state
  const [staffJobs, setStaffJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [zones, setZones] = useState<JobZone[]>([]);
  const [loading, setLoading] = useState(!isOwner);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!isOwner && studio?.id && profile?.id) {
      fetchStaffJobs();
    }
  }, [isOwner, studio?.id, profile?.id]);

  const fetchStaffJobs = async () => {
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

      setStaffJobs(jobsWithRelations);

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
    const { data } = await supabase
      .from("job_zones")
      .select("*")
      .eq("job_id", jobId)
      .order("created_at");

    if (data) setZones(data as JobZone[]);
  };

  const handleStartJob = async () => {
    if (!selectedJob) return;
    setUpdating(true);
    
    try {
      const { error } = await supabase
        .from("jobs")
        .update({ status: "in_progress" })
        .eq("id", selectedJob.id);

      if (error) throw error;
      toast({ title: "Job started!" });
      fetchStaffJobs();
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
        });

      if (subError) throw subError;

      toast({ title: "Submitted for review!" });
      fetchStaffJobs();
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Could not submit job." });
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-amber-500/15 text-amber-500 border-amber-500/30";
      case "scheduled": return "bg-blue-500/15 text-blue-500 border-blue-500/30";
      case "in_progress": return "bg-racing/15 text-racing border-racing/30";
      case "awaiting_review": return "bg-purple-500/15 text-purple-500 border-purple-500/30";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const handleZoneClick = (zoneId: string) => {
    setSelectedCarZones((prev) =>
      prev.includes(zoneId)
        ? prev.filter((id) => id !== zoneId)
        : [...prev, zoneId]
    );
  };

  const stats = [
    {
      name: "Active Jobs",
      value: "0",
      icon: ClipboardList,
      subtitle: "Start creating jobs",
      accentColor: "racing" as const,
    },
    {
      name: "Customers",
      value: "0",
      icon: Users,
      subtitle: "Add your first customer",
      accentColor: "primary" as const,
    },
    {
      name: "Vehicles",
      value: "0",
      icon: Car,
      subtitle: "Register vehicles",
      accentColor: "success" as const,
    },
    {
      name: "Completed",
      value: "0",
      icon: CheckCircle2,
      subtitle: "This month",
      accentColor: "warning" as const,
    },
  ];

  const completedZones = zones.filter((z) => z.completed).length;
  const progressPercent = zones.length > 0 ? (completedZones / zones.length) * 100 : 0;
  const canSubmit = zones.length > 0 && completedZones === zones.length;

  // Staff Dashboard View
  if (!isOwner) {
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
          {/* Staff Header */}
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
                {staffJobs.length > 0
                  ? `${staffJobs.length} assigned job${staffJobs.length > 1 ? "s" : ""}`
                  : "No jobs assigned yet"}
              </p>
            </div>
          </motion.div>

          {staffJobs.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <ClipboardList className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
                <h3 className="font-semibold text-lg mb-2">No Jobs Assigned</h3>
                <p className="text-muted-foreground">
                  Your studio owner will assign jobs to you. Check back soon!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Jobs List */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ClipboardList className="h-5 w-5 text-primary" />
                    My Jobs
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y max-h-[500px] overflow-y-auto">
                    {staffJobs.map((job) => (
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
                        <p className="text-sm text-muted-foreground">{job.customer?.name}</p>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Selected Job Details */}
              <div className="lg:col-span-2">
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
                            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                              <User className="h-3 w-3" />
                              {selectedJob.customer?.name}
                            </div>
                          </div>
                        </div>
                        <Badge variant="outline" className={getStatusColor(selectedJob.status)}>
                          {selectedJob.status.replace("_", " ")}
                        </Badge>
                      </div>

                      {zones.length > 0 && (
                        <div className="mt-4">
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-medium">{completedZones}/{zones.length} zones</span>
                          </div>
                          <Progress value={progressPercent} className="h-2" />
                        </div>
                      )}
                    </CardHeader>

                    <CardContent className="p-0">
                      {(selectedJob.status === "pending" || selectedJob.status === "scheduled") && (
                        <div className="p-6 text-center border-b">
                          <Button size="lg" onClick={handleStartJob} disabled={updating} className="gap-2">
                            {updating ? <Loader2 className="h-5 w-5 animate-spin" /> : <Play className="h-5 w-5" />}
                            Start Working
                          </Button>
                        </div>
                      )}

                      {zones.length > 0 ? (
                        <div className="divide-y">
                          {zones.map((zone) => (
                            <div
                              key={zone.id}
                              className={`p-4 flex items-center justify-between ${zone.completed ? "bg-green-500/5" : ""}`}
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
                                    {zone.zone_name.replace(/_/g, " ")}
                                  </p>
                                  <p className="text-xs text-muted-foreground capitalize">
                                    {zone.zone_type} • {Array.isArray(zone.services) ? zone.services.length : 0} services
                                  </p>
                                </div>
                              </div>
                              <Button variant="ghost" size="sm" disabled={selectedJob.status !== "in_progress"}>
                                <Camera className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-8 text-center text-muted-foreground">
                          <AlertCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                          <p>No zones configured</p>
                        </div>
                      )}

                      {selectedJob.status === "in_progress" && (
                        <div className="p-6 bg-muted/30 border-t">
                          <Button
                            className="w-full gap-2"
                            size="lg"
                            disabled={!canSubmit || updating}
                            onClick={handleSubmitForReview}
                          >
                            {updating ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                            Submit for Review
                          </Button>
                          {!canSubmit && zones.length > 0 && (
                            <p className="text-sm text-muted-foreground text-center mt-2">
                              Complete all zones first
                            </p>
                          )}
                        </div>
                      )}

                      {selectedJob.notes && (
                        <div className="p-4 bg-amber-500/5 border-t border-amber-500/20">
                          <p className="text-sm font-medium text-amber-600 mb-1">Notes:</p>
                          <p className="text-sm text-muted-foreground">{selectedJob.notes}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="py-16 text-center">
                      <Car className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
                      <p className="text-muted-foreground">Select a job to view details</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    );
  }

  // Owner Dashboard View
  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome header with racing accent */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          <div className="flex items-center gap-4">
            <motion.div
              className="h-12 w-1.5 bg-gradient-to-b from-racing to-primary rounded-full"
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            />
            <div>
              <h1 className="font-display text-3xl font-bold">
                Welcome back,{" "}
                <span className="text-gradient-primary">
                  {profile?.full_name?.split(" ")[0] || "there"}
                </span>
              </h1>
              <p className="text-muted-foreground mt-1">
                Here's what's happening at {studio?.name || "your studio"} today.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Stats grid with racing cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <RacingStatsCard
              key={stat.name}
              title={stat.name}
              value={stat.value}
              subtitle={stat.subtitle}
              icon={stat.icon}
              accentColor={stat.accentColor}
              delay={index * 0.1}
            />
          ))}
        </div>

        {/* Main content grid */}
        <div className="grid gap-6 lg:grid-cols-5">
          {/* Car Visualization - spans 3 columns */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="lg:col-span-3"
          >
            <Card className="border-border/50 overflow-hidden">
              <CardHeader className="border-b border-border/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-racing/10 flex items-center justify-center">
                      <Target className="h-4 w-4 text-racing" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Car Zone Selector</CardTitle>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Click zones to configure services
                      </p>
                    </div>
                  </div>
                  {selectedCarZones.length > 0 && (
                    <motion.button
                      className="text-xs text-racing hover:text-racing-glow transition-colors"
                      onClick={() => setSelectedCarZones([])}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      Clear selection
                    </motion.button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <AnimatedCarSilhouette
                  selectedZones={selectedCarZones}
                  onZoneClick={handleZoneClick}
                  interactive={true}
                />
                
                {/* Zone legend */}
                <div className="mt-4 flex flex-wrap gap-2 justify-center">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="h-3 w-3 rounded border border-muted-foreground/30" />
                    <span>Available</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="h-3 w-3 rounded border border-racing bg-racing/20" />
                    <span>Selected</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Performance widgets - spans 2 columns */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="lg:col-span-2 space-y-4"
          >
            {/* Speedometer cards */}
            <Card className="border-border/50">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Gauge className="h-4 w-4 text-primary" />
                  </div>
                  <CardTitle className="text-lg">Performance</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-around py-4">
                  <SpeedometerWidget
                    value={0}
                    max={100}
                    label="Jobs"
                    sublabel="This Week"
                  />
                  <SpeedometerWidget
                    value={0}
                    max={100}
                    label="Done"
                    sublabel="Completion Rate"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Quick actions */}
            <Card className="border-border/50">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-racing/10 flex items-center justify-center">
                    <Zap className="h-4 w-4 text-racing" />
                  </div>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  { label: "New Job", icon: ClipboardList, href: "/dashboard/jobs" },
                  { label: "Add Customer", icon: Users, href: "/dashboard/customers" },
                  { label: "Register Vehicle", icon: Car, href: "/dashboard/vehicles" },
                ].map((action, i) => (
                  <motion.a
                    key={action.label}
                    href={action.href}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors group"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + i * 0.1 }}
                    whileHover={{ x: 4 }}
                  >
                    <div className="h-8 w-8 rounded-lg bg-card flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                      <action.icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <span className="text-sm font-medium">{action.label}</span>
                  </motion.a>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Bottom section */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Pending items for owner */}
          {isOwner && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
            >
              <Card className="border-warning/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-warning" />
                    Pending Actions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No pending items</p>
                    <p className="text-sm mt-1">
                      Staff requests and job approvals will appear here
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Recent jobs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Recent Jobs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <ClipboardList className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No jobs yet</p>
                  <p className="text-sm mt-1">
                    Create your first job to get started
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Getting started for new studios */}
          {isOwner && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.9 }}
              className="lg:col-span-2"
            >
              <Card className="border-racing/20 bg-gradient-to-br from-racing/5 to-primary/5 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-racing/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl" />
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <motion.div
                      initial={{ rotate: 0 }}
                      animate={{ rotate: 360 }}
                      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    >
                      <Zap className="h-5 w-5 text-racing" />
                    </motion.div>
                    Getting Started
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative">
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { step: 1, title: "Add customers", desc: "Register your first customers" },
                      { step: 2, title: "Register vehicles", desc: "Add vehicles to customers" },
                      { step: 3, title: "Create a job", desc: "Start your first detailing job" },
                      { step: 4, title: "Invite staff", desc: "Share your studio key" },
                    ].map((item, i) => (
                      <motion.div
                        key={item.step}
                        className="flex items-start gap-3"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1 + i * 0.1 }}
                      >
                        <div className="h-8 w-8 rounded-full bg-racing/20 flex items-center justify-center text-racing font-bold text-sm border border-racing/30">
                          {item.step}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{item.title}</p>
                          <p className="text-xs text-muted-foreground">{item.desc}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
