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
  Send,
  Loader2,
  User,
  Check,
  X,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnimatedCarSilhouette } from "@/components/car/AnimatedCarSilhouette";
import { SpeedometerWidget } from "@/components/car/SpeedometerWidget";
import { RacingStatsCard } from "@/components/car/RacingStatsCard";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { StaffPerformanceCard } from "@/components/dashboard/StaffPerformanceCard";
import { JobCard } from "@/components/mechanic/JobCard";
import { JobWorkArea } from "@/components/mechanic/JobWorkArea";
import { useJobWorkbench } from "@/hooks/useJobWorkbench";
import { cn } from "@/lib/utils";

// ─── Types ───────────────────────────────────────────────────────────────────

interface DashboardStats {
  activeJobs: number;
  customers: number;
  vehicles: number;
  completedThisMonth: number;
  pendingStaff: number;
  jobsThisWeek: number;
  completionRate: number;
}

interface PendingStaffMember {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  created_at: string;
}

interface RecentJob {
  id: string;
  status: string;
  created_at: string;
  customer?: { name: string };
  car?: { make: string; model: string };
}

// ─── Staff Dashboard (uses unified workbench) ────────────────────────────────

function StaffDashboardView() {
  const { profile, studio } = useAuth();
  const {
    jobs, selectedJob, zones, carModel3D, loading, updating,
    pendingJobs, activeJobs, reviewJobs,
    completedZoneCount, progressPercent,
    selectJob, startJob, completeZone, submitForReview,
  } = useJobWorkbench(studio?.id, profile?.id);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-card via-card to-primary/5 border border-border p-6"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2" />
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
              <h1 className="font-display text-3xl font-bold">My Jobs</h1>
              <p className="text-muted-foreground">
                {activeJobs.length > 0
                  ? `${activeJobs.length} job${activeJobs.length > 1 ? "s" : ""} in progress`
                  : "No active jobs — check back soon!"}
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
      <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
        {[
          { label: "Queue", value: pendingJobs.length, icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10" },
          { label: "Active", value: activeJobs.length, icon: Zap, color: "text-racing", bg: "bg-racing/10" },
          { label: "In Review", value: reviewJobs.length, icon: Target, color: "text-purple-500", bg: "bg-purple-500/10" },
          { label: "Total", value: jobs.length, icon: ClipboardList, color: "text-primary", bg: "bg-primary/10" },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="relative overflow-hidden group hover:border-primary/50 transition-all">
              <CardContent className="pt-5 pb-4 px-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold mt-0.5">{stat.value}</p>
                  </div>
                  <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center", stat.bg)}>
                    <stat.icon className={cn("h-5 w-5", stat.color)} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Content */}
      {jobs.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <ClipboardList className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
            <h3 className="font-semibold text-lg mb-2">No Jobs Assigned</h3>
            <p className="text-muted-foreground">Your studio owner will assign jobs to you. Check back soon!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Jobs List */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-4">
            <Card className="h-full">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <ClipboardList className="h-5 w-5 text-primary" />
                  Assigned Jobs
                  <Badge variant="outline" className="ml-auto">{jobs.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y max-h-[500px] overflow-y-auto">
                  {jobs.map((job) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      isSelected={selectedJob?.id === job.id}
                      onClick={() => selectJob(job)}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Work Area */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-8">
            <JobWorkArea
              selectedJob={selectedJob}
              zones={zones}
              carModel3D={carModel3D}
              updating={updating}
              completedZoneCount={completedZoneCount}
              progressPercent={progressPercent}
              profileId={profile?.id}
              onStartJob={startJob}
              onCompleteZone={completeZone}
              onSubmitForReview={submitForReview}
              accentColor="primary"
            />
          </motion.div>
        </div>
      )}
    </div>
  );
}

// ─── Owner Dashboard ─────────────────────────────────────────────────────────

function OwnerDashboardView() {
  const { profile, studio } = useAuth();
  const { toast } = useToast();
  const [selectedCarZones, setSelectedCarZones] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    activeJobs: 0, customers: 0, vehicles: 0, completedThisMonth: 0,
    pendingStaff: 0, jobsThisWeek: 0, completionRate: 0,
  });
  const [pendingStaffList, setPendingStaffList] = useState<PendingStaffMember[]>([]);
  const [recentJobs, setRecentJobs] = useState<RecentJob[]>([]);
  const [awaitingReviewJobs, setAwaitingReviewJobs] = useState<RecentJob[]>([]);

  useEffect(() => {
    if (studio?.id) fetchOwnerStats();
  }, [studio?.id]);

  const fetchOwnerStats = async () => {
    if (!studio?.id) return;
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay())).toISOString();

      const [jobsRes, customersRes, carsRes, pendingStaffRes, recentJobsRes, awaitingRes] = await Promise.all([
        supabase.from("jobs").select("id, status, created_at", { count: "exact" }).eq("studio_id", studio.id),
        supabase.from("customers").select("id", { count: "exact" }).eq("studio_id", studio.id),
        supabase.from("cars").select("id", { count: "exact" }).eq("studio_id", studio.id),
        supabase.from("profiles").select("id, full_name, email, phone, created_at").eq("studio_id", studio.id).eq("status", "pending"),
        supabase.from("jobs").select("id, status, created_at, customers(name), cars(make, model)").eq("studio_id", studio.id).order("created_at", { ascending: false }).limit(5),
        supabase.from("jobs").select("id, status, created_at, customers(name), cars(make, model)").eq("studio_id", studio.id).eq("status", "awaiting_review"),
      ]);

      const allJobs = jobsRes.data || [];
      const activeJobs = allJobs.filter(j => ["pending", "scheduled", "in_progress", "awaiting_review"].includes(j.status)).length;
      const completedThisMonth = allJobs.filter(j => j.status === "completed" && j.created_at >= startOfMonth).length;
      const jobsThisWeek = allJobs.filter(j => j.created_at >= startOfWeek).length;
      const totalCompleted = allJobs.filter(j => j.status === "completed").length;
      const completionRate = allJobs.length > 0 ? Math.round((totalCompleted / allJobs.length) * 100) : 0;

      setStats({ activeJobs, customers: customersRes.count || 0, vehicles: carsRes.count || 0, completedThisMonth, pendingStaff: (pendingStaffRes.data || []).length, jobsThisWeek, completionRate });
      setPendingStaffList((pendingStaffRes.data || []) as PendingStaffMember[]);
      setRecentJobs((recentJobsRes.data || []).map((j: any) => ({ ...j, customer: j.customers, car: j.cars })));
      setAwaitingReviewJobs((awaitingRes.data || []).map((j: any) => ({ ...j, customer: j.customers, car: j.cars })));
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-amber-500/15 text-amber-500 border-amber-500/30";
      case "in_progress": return "bg-racing/15 text-racing border-racing/30";
      case "awaiting_review": return "bg-purple-500/15 text-purple-500 border-purple-500/30";
      case "completed": return "bg-green-500/15 text-green-500 border-green-500/30";
      default: return "bg-muted text-muted-foreground";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const statsCards = [
    { name: "Active Jobs", value: stats.activeJobs.toString(), icon: ClipboardList, subtitle: stats.activeJobs > 0 ? "In progress" : "Start creating jobs", accentColor: "racing" as const },
    { name: "Customers", value: stats.customers.toString(), icon: Users, subtitle: stats.customers > 0 ? "Total registered" : "Add your first customer", accentColor: "primary" as const },
    { name: "Vehicles", value: stats.vehicles.toString(), icon: Car, subtitle: stats.vehicles > 0 ? "Total registered" : "Register vehicles", accentColor: "success" as const },
    { name: "Completed", value: stats.completedThisMonth.toString(), icon: CheckCircle2, subtitle: "This month", accentColor: "warning" as const },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-4">
          <motion.div className="h-12 w-1.5 bg-gradient-to-b from-racing to-primary rounded-full" initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ duration: 0.5, delay: 0.2 }} />
          <div>
            <h1 className="font-display text-3xl font-bold">
              Welcome back,{" "}
              <span className="text-gradient-primary">{profile?.full_name?.split(" ")[0] || "there"}</span>
            </h1>
            <p className="text-muted-foreground mt-1">Here's what's happening at {studio?.name || "your studio"} today.</p>
          </div>
        </div>
      </motion.div>

      {/* Stats grid */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat, index) => (
          <RacingStatsCard key={stat.name} title={stat.name} value={stat.value} subtitle={stat.subtitle} icon={stat.icon} accentColor={stat.accentColor} delay={index * 0.1} />
        ))}
      </div>

      {/* Revenue & Performance */}
      <div className="grid gap-6 lg:grid-cols-2">
        {studio?.id && <RevenueChart studioId={studio.id} />}
        {studio?.id && <StaffPerformanceCard studioId={studio.id} />}
      </div>

      {/* Action Items & Recent Jobs */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pending Actions */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="border-warning/20 h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-warning" />
                Pending Actions
                {(pendingStaffList.length + awaitingReviewJobs.length) > 0 && (
                  <Badge variant="outline" className="ml-auto bg-warning/15 text-warning border-warning/30">
                    {pendingStaffList.length + awaitingReviewJobs.length}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pendingStaffList.length === 0 && awaitingReviewJobs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle2 className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p className="font-medium">All caught up!</p>
                  <p className="text-sm mt-1">No pending items right now</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[350px] overflow-y-auto">
                  {awaitingReviewJobs.map((job) => (
                    <a key={job.id} href={`/dashboard/jobs/${job.id}`}
                      className="flex items-center justify-between p-3 rounded-lg border border-purple-500/20 bg-purple-500/5 hover:bg-purple-500/10 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-purple-500/10 flex items-center justify-center">
                          <Send className="h-4 w-4 text-purple-500" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{job.car?.make} {job.car?.model}</p>
                          <p className="text-xs text-muted-foreground">{job.customer?.name} • Awaiting review</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-purple-500/15 text-purple-500 border-purple-500/30 text-xs">Review</Badge>
                    </a>
                  ))}

                  {pendingStaffList.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-3 rounded-lg border border-warning/20 bg-warning/5">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-warning/10 flex items-center justify-center">
                          <span className="text-sm font-medium text-warning">{member.full_name.charAt(0).toUpperCase()}</span>
                        </div>
                        <div>
                          <p className="font-medium text-sm">{member.full_name}</p>
                          <p className="text-xs text-muted-foreground">{member.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                          onClick={async () => { await supabase.from("profiles").update({ status: "rejected" }).eq("id", member.id); fetchOwnerStats(); toast({ title: "Staff rejected" }); }}>
                          <X className="h-4 w-4" />
                        </Button>
                        <Button size="sm" className="h-8"
                          onClick={async () => { await supabase.from("profiles").update({ status: "approved" }).eq("id", member.id); fetchOwnerStats(); toast({ title: "Staff approved!" }); }}>
                          <Check className="h-4 w-4 mr-1" /> Approve
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Jobs */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card className="border-primary/20 h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Recent Jobs
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentJobs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <ClipboardList className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p className="font-medium">No jobs yet</p>
                  <p className="text-sm mt-1">Create your first job to get started</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {recentJobs.map((job) => (
                    <a key={job.id} href={`/dashboard/jobs/${job.id}`}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Car className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{job.car?.make} {job.car?.model}</p>
                          <p className="text-xs text-muted-foreground">{job.customer?.name}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className={cn("text-xs capitalize", getStatusColor(job.status))}>
                        {job.status.replace("_", " ")}
                      </Badge>
                    </a>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Performance + Quick Actions */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Car Zone Selector */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="lg:col-span-3">
          <Card className="overflow-hidden">
            <CardHeader className="border-b border-border/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-racing/10 flex items-center justify-center">
                    <Target className="h-4 w-4 text-racing" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Car Zone Selector</CardTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">Click zones to configure services</p>
                  </div>
                </div>
                {selectedCarZones.length > 0 && (
                  <button className="text-xs text-racing hover:text-racing/80 transition-colors" onClick={() => setSelectedCarZones([])}>
                    Clear selection
                  </button>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <AnimatedCarSilhouette
                selectedZones={selectedCarZones}
                onZoneClick={(zoneId) => setSelectedCarZones(prev => prev.includes(zoneId) ? prev.filter(id => id !== zoneId) : [...prev, zoneId])}
                interactive={true}
              />
            </CardContent>
          </Card>
        </motion.div>

        {/* Performance + Quick Actions */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="lg:col-span-2 space-y-4">
          <Card>
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
                <SpeedometerWidget value={stats.jobsThisWeek} max={Math.max(10, stats.jobsThisWeek + 5)} label="Jobs" sublabel="This Week" />
                <SpeedometerWidget value={stats.completionRate} max={100} label="Done" sublabel="Completion Rate" />
              </div>
            </CardContent>
          </Card>

          <Card>
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
                <motion.a key={action.label} href={action.href}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors group"
                  initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.8 + i * 0.1 }}
                  whileHover={{ x: 4 }}>
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
    </div>
  );
}

// ─── Main Dashboard Page ─────────────────────────────────────────────────────

export default function DashboardPage() {
  const { isOwner } = useAuth();

  return (
    <DashboardLayout>
      {isOwner ? <OwnerDashboardView /> : <StaffDashboardView />}
    </DashboardLayout>
  );
}
