import { motion } from "framer-motion";
import { 
  ClipboardList, 
  Users, 
  Car, 
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
  const { profile, studio, isOwner } = useAuth();

  const stats = [
    {
      name: "Active Jobs",
      value: "0",
      icon: ClipboardList,
      change: "Start creating jobs",
      changeType: "neutral" as const,
    },
    {
      name: "Customers",
      value: "0",
      icon: Users,
      change: "Add your first customer",
      changeType: "neutral" as const,
    },
    {
      name: "Vehicles",
      value: "0",
      icon: Car,
      change: "Register vehicles",
      changeType: "neutral" as const,
    },
    {
      name: "Completed This Month",
      value: "0",
      icon: CheckCircle2,
      change: "Complete jobs to see stats",
      changeType: "neutral" as const,
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="font-display text-3xl font-bold">
            Welcome back, {profile?.full_name?.split(" ")[0] || "there"}
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's what's happening at {studio?.name || "your studio"} today.
          </p>
        </motion.div>

        {/* Stats grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.name}
                  </CardTitle>
                  <stat.icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stat.change}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Quick actions / Recent activity */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Pending items for owner */}
          {isOwner && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Card>
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
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Card>
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
              transition={{ duration: 0.5, delay: 0.6 }}
              className="lg:col-span-2"
            >
              <Card className="border-primary/20 bg-primary/5">
                <CardHeader>
                  <CardTitle>Getting Started</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                        1
                      </div>
                      <div>
                        <p className="font-medium text-sm">Add customers</p>
                        <p className="text-xs text-muted-foreground">
                          Register your first customers
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                        2
                      </div>
                      <div>
                        <p className="font-medium text-sm">Register vehicles</p>
                        <p className="text-xs text-muted-foreground">
                          Add vehicles to customers
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                        3
                      </div>
                      <div>
                        <p className="font-medium text-sm">Create a job</p>
                        <p className="text-xs text-muted-foreground">
                          Start your first detailing job
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                        4
                      </div>
                      <div>
                        <p className="font-medium text-sm">Invite staff</p>
                        <p className="text-xs text-muted-foreground">
                          Share your studio key
                        </p>
                      </div>
                    </div>
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
