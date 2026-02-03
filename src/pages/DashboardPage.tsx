import { useState } from "react";
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
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnimatedCarSilhouette } from "@/components/car/AnimatedCarSilhouette";
import { SpeedometerWidget } from "@/components/car/SpeedometerWidget";
import { RacingStatsCard } from "@/components/car/RacingStatsCard";

export default function DashboardPage() {
  const { profile, studio, isOwner } = useAuth();
  const [selectedCarZones, setSelectedCarZones] = useState<string[]>([]);

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
