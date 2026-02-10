import { motion } from "framer-motion";
import {
  Wrench,
  Clock,
  Zap,
  Target,
  Calendar,
  User,
  Car,
  Loader2,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { JobCard } from "@/components/mechanic/JobCard";
import { JobWorkArea } from "@/components/mechanic/JobWorkArea";
import { useJobWorkbench } from "@/hooks/useJobWorkbench";
import { cn } from "@/lib/utils";

export default function MechanicDashboardPage() {
  const { profile, studio } = useAuth();

  const {
    jobs,
    selectedJob,
    zones,
    carModel3D,
    loading,
    updating,
    pendingJobs,
    activeJobs,
    reviewJobs,
    completedZoneCount,
    progressPercent,
    selectJob,
    startJob,
    completeZone,
    submitForReview,
  } = useJobWorkbench(studio?.id, profile?.id);

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
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-card via-card to-racing/5 border border-border p-6"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-racing/10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/10 blur-2xl rounded-full translate-y-1/2 -translate-x-1/2" />
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-4">
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
            {profile && (
              <div className="hidden md:flex items-center gap-3 bg-background/50 backdrop-blur rounded-xl px-4 py-2 border">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-racing/20 to-primary/20 flex items-center justify-center">
                  <User className="h-5 w-5 text-racing" />
                </div>
                <div className="text-right">
                  <p className="font-medium">{profile.full_name}</p>
                  <p className="text-xs text-muted-foreground">Mechanic</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Quick Stats */}
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
          {/* Jobs Queue */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-4"
          >
            <Card className="h-full">
              <CardHeader className="pb-3 bg-gradient-to-r from-racing/5 to-transparent">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Car className="h-5 w-5 text-racing" />
                  My Jobs
                  <Badge variant="outline" className="ml-auto">{jobs.length}</Badge>
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
                        onClick={() => selectJob(job)}
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
              accentColor="racing"
            />
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}
