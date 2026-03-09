import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, Search, Car, Clock, CheckCircle, Loader2, ArrowLeft, MapPin, FileText, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";

interface CustomerData {
  customer: { name: string; phone: string; email: string | null };
  vehicles: Array<{ id: string; make: string; model: string; registration_number: string | null; color: string | null; vehicle_type: string | null }>;
  jobs: Array<{
    id: string; status: string; created_at: string; total_price: number | null; notes: string | null;
    scheduled_date: string | null; estimated_completion: string | null;
    car: { make: string; model: string; registration_number: string | null };
    zones: Array<{ zone_name: string; completed: boolean; services: any }>;
  }>;
}

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: "Pending", color: "bg-warning/15 text-warning-foreground", icon: Clock },
  scheduled: { label: "Scheduled", color: "bg-primary/15 text-primary", icon: Clock },
  in_progress: { label: "In Progress", color: "bg-accent/15 text-accent", icon: Loader2 },
  awaiting_review: { label: "Awaiting Review", color: "bg-warning/15 text-warning-foreground", icon: Clock },
  completed: { label: "Completed", color: "bg-success/15 text-success", icon: CheckCircle },
  cancelled: { label: "Cancelled", color: "bg-destructive/15 text-destructive", icon: Clock },
};

export default function CustomerPortalPage() {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<CustomerData | null>(null);
  const [error, setError] = useState("");

  const lookup = async () => {
    if (phone.length < 10) { setError("Enter a valid phone number"); return; }
    setLoading(true); setError(""); setData(null);

    try {
      const cleanPhone = phone.replace(/\D/g, "").slice(-10);
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const res = await fetch(`https://${projectId}.supabase.co/functions/v1/track-job`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: cleanPhone, registration_number: "__portal_lookup__" }),
      });

      if (!res.ok) {
        // Fallback: try to find with just phone
        const res2 = await fetch(`https://${projectId}.supabase.co/functions/v1/customer-portal`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: cleanPhone }),
        });
        if (!res2.ok) throw new Error("No customer found");
        const result = await res2.json();
        setData(result);
        return;
      }

      const result = await res.json();
      // Transform track-job response to portal format
      setData({
        customer: { name: result.customer?.name || "Customer", phone: cleanPhone, email: null },
        vehicles: result.vehicle ? [result.vehicle] : [],
        jobs: result.jobs || [],
      });
    } catch {
      setError("No customer found with this phone number. Please check and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Car className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-display text-lg font-bold">DetailFlow</span>
          </Link>
          <Badge variant="outline" className="text-xs">Customer Portal</Badge>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {!data ? (
            <motion.div key="search" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="max-w-md mx-auto space-y-6">
              <div className="text-center space-y-2">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Phone className="h-7 w-7 text-primary" />
                </div>
                <h1 className="text-3xl font-bold">Customer Portal</h1>
                <p className="text-muted-foreground">View your vehicles, service history, and track active jobs</p>
              </div>

              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Phone Number</label>
                    <div className="flex gap-2">
                      <span className="flex items-center px-3 bg-muted rounded-md text-sm">+91</span>
                      <Input
                        placeholder="Enter your phone number"
                        value={phone}
                        onChange={e => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                        onKeyDown={e => e.key === "Enter" && lookup()}
                        maxLength={10}
                      />
                    </div>
                  </div>
                  {error && <p className="text-sm text-destructive">{error}</p>}
                  <Button className="w-full" onClick={lookup} disabled={loading}>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />}
                    Look Up My Account
                  </Button>
                </CardContent>
              </Card>

              <p className="text-center text-xs text-muted-foreground">
                Also track a specific job at <Link to="/track" className="text-primary underline">/track</Link>
              </p>
            </motion.div>
          ) : (
            <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <Button variant="ghost" size="sm" onClick={() => setData(null)}>
                <ArrowLeft className="h-4 w-4 mr-1" /> Back
              </Button>

              {/* Customer header */}
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="pt-6 flex items-center gap-4">
                  <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-xl font-bold text-primary">{data.customer.name.charAt(0)}</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{data.customer.name}</h2>
                    <p className="text-sm text-muted-foreground">+91 {data.customer.phone}</p>
                  </div>
                </CardContent>
              </Card>

              <Tabs defaultValue="jobs">
                <TabsList className="w-full">
                  <TabsTrigger value="jobs" className="flex-1">Active Jobs</TabsTrigger>
                  <TabsTrigger value="vehicles" className="flex-1">My Vehicles</TabsTrigger>
                  <TabsTrigger value="history" className="flex-1">History</TabsTrigger>
                </TabsList>

                <TabsContent value="jobs" className="space-y-4 mt-4">
                  {data.jobs.filter(j => j.status !== "completed" && j.status !== "cancelled").length === 0 ? (
                    <Card><CardContent className="py-8 text-center text-muted-foreground">No active jobs right now</CardContent></Card>
                  ) : data.jobs.filter(j => j.status !== "completed" && j.status !== "cancelled").map(job => {
                    const sc = statusConfig[job.status] || statusConfig.pending;
                    const completedZones = job.zones?.filter(z => z.completed).length || 0;
                    const totalZones = job.zones?.length || 0;
                    const progress = totalZones > 0 ? (completedZones / totalZones) * 100 : 0;
                    return (
                      <Card key={job.id}>
                        <CardContent className="pt-6 space-y-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-semibold">{job.car.make} {job.car.model}</p>
                              {job.car.registration_number && <p className="text-xs text-muted-foreground font-mono">{job.car.registration_number}</p>}
                            </div>
                            <Badge className={`${sc.color}`}>{sc.label}</Badge>
                          </div>
                          {totalZones > 0 && (
                            <div>
                              <div className="flex justify-between text-xs mb-1">
                                <span className="text-muted-foreground">Progress</span>
                                <span className="font-medium">{completedZones}/{totalZones} zones</span>
                              </div>
                              <div className="h-2 bg-muted rounded-full overflow-hidden">
                                <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progress}%` }} />
                              </div>
                            </div>
                          )}
                          {job.zones && job.zones.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                              {job.zones.map((z, i) => (
                                <Badge key={i} variant={z.completed ? "default" : "outline"} className="text-xs">
                                  {z.completed && <CheckCircle className="h-3 w-3 mr-1" />}{z.zone_name}
                                </Badge>
                              ))}
                            </div>
                          )}
                          {job.total_price && <p className="text-sm font-medium">Total: ₹{job.total_price.toLocaleString("en-IN")}</p>}
                        </CardContent>
                      </Card>
                    );
                  })}
                </TabsContent>

                <TabsContent value="vehicles" className="space-y-4 mt-4">
                  {data.vehicles.length === 0 ? (
                    <Card><CardContent className="py-8 text-center text-muted-foreground">No vehicles registered</CardContent></Card>
                  ) : data.vehicles.map(v => (
                    <Card key={v.id}>
                      <CardContent className="pt-6 flex items-center gap-4">
                        <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                          <Car className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-semibold">{v.make} {v.model}</p>
                          <div className="flex gap-2 mt-0.5">
                            {v.registration_number && <Badge variant="outline" className="text-xs font-mono">{v.registration_number}</Badge>}
                            {v.color && <Badge variant="secondary" className="text-xs">{v.color}</Badge>}
                            {v.vehicle_type && <Badge variant="secondary" className="text-xs capitalize">{v.vehicle_type}</Badge>}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>

                <TabsContent value="history" className="space-y-4 mt-4">
                  {data.jobs.filter(j => j.status === "completed").length === 0 ? (
                    <Card><CardContent className="py-8 text-center text-muted-foreground">No completed jobs yet</CardContent></Card>
                  ) : data.jobs.filter(j => j.status === "completed").map(job => (
                    <Card key={job.id}>
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold">{job.car.make} {job.car.model}</p>
                            <p className="text-xs text-muted-foreground">{new Date(job.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>
                          </div>
                          <div className="text-right">
                            <Badge className="bg-success/15 text-success">Completed</Badge>
                            {job.total_price && <p className="text-sm font-medium mt-1">₹{job.total_price.toLocaleString("en-IN")}</p>}
                          </div>
                        </div>
                        {job.zones && job.zones.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-3">
                            {job.zones.map((z, i) => <Badge key={i} variant="secondary" className="text-xs">{z.zone_name}</Badge>)}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>
              </Tabs>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
