import { useState } from "react";
import { motion } from "framer-motion";
import { Car, Search, Phone, Hash, Loader2, CheckCircle2, Clock, Wrench, Camera, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface TrackingData {
  job: {
    id: string;
    status: string;
    notes: string | null;
    scheduled_date: string | null;
    total_price: number | null;
    created_at: string;
  };
  car: { make: string; model: string; year: number | null; color: string | null };
  customer: { name: string };
  zones: { zone_name: string; completed: boolean; completed_at: string | null }[];
  media: { url: string; stage: string; caption: string | null; created_at: string }[];
}

const STATUS_MAP: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: "Waiting to Start", color: "text-amber-500", icon: Clock },
  scheduled: { label: "Scheduled", color: "text-blue-500", icon: Clock },
  in_progress: { label: "Work In Progress", color: "text-racing", icon: Wrench },
  awaiting_review: { label: "Quality Check", color: "text-purple-500", icon: CheckCircle2 },
  completed: { label: "Completed", color: "text-green-500", icon: CheckCircle2 },
};

export default function TrackJobPage() {
  const [phone, setPhone] = useState("");
  const [regNumber, setRegNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState<TrackingData | null>(null);

  const handleSearch = async () => {
    if (!phone || !regNumber) {
      setError("Please enter both mobile number and vehicle number");
      return;
    }
    setLoading(true);
    setError("");
    setData(null);

    try {
      const formattedPhone = phone.startsWith("+91") ? phone : `+91${phone.replace(/\D/g, "")}`;
      const regClean = regNumber.replace(/\s/g, "").toUpperCase();

      // Find customer by phone
      const { data: customers } = await supabase
        .from("customers")
        .select("id, name")
        .or(`phone.eq.${formattedPhone},phone.eq.${phone.replace(/\D/g, "")}`);

      if (!customers || customers.length === 0) {
        setError("No records found for this phone number");
        setLoading(false);
        return;
      }

      const customerIds = customers.map(c => c.id);

      // Find car by registration
      const { data: cars } = await supabase
        .from("cars")
        .select("id, make, model, year, color, registration_number")
        .in("customer_id", customerIds)
        .ilike("registration_number", `%${regClean}%`);

      if (!cars || cars.length === 0) {
        setError("No vehicle found with this registration number for this customer");
        setLoading(false);
        return;
      }

      const car = cars[0];

      // Find latest job for this car
      const { data: jobs } = await supabase
        .from("jobs")
        .select("id, status, notes, scheduled_date, total_price, created_at")
        .eq("car_id", car.id)
        .order("created_at", { ascending: false })
        .limit(1);

      if (!jobs || jobs.length === 0) {
        setError("No active jobs found for this vehicle");
        setLoading(false);
        return;
      }

      const job = jobs[0];

      // Fetch zones and media
      const [zonesRes, mediaRes] = await Promise.all([
        supabase.from("job_zones").select("zone_name, completed, completed_at").eq("job_id", job.id).order("created_at"),
        supabase.from("job_media").select("url, stage, caption, created_at").eq("job_id", job.id).order("created_at", { ascending: false }).limit(20),
      ]);

      setData({
        job,
        car: { make: car.make, model: car.model, year: car.year, color: car.color },
        customer: customers[0],
        zones: zonesRes.data || [],
        media: mediaRes.data || [],
      });
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const completedZones = data?.zones.filter(z => z.completed).length || 0;
  const totalZones = data?.zones.length || 0;
  const progressPercent = totalZones > 0 ? (completedZones / totalZones) * 100 : 0;
  const statusInfo = data ? STATUS_MAP[data.job.status] || STATUS_MAP.pending : null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-racing/10 flex items-center justify-center">
            <Car className="h-5 w-5 text-racing" />
          </div>
          <div>
            <h1 className="font-display text-lg font-bold">DetailFlow</h1>
            <p className="text-xs text-muted-foreground">Track Your Vehicle</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-lg">
        {!data ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardHeader className="text-center pb-2">
                <div className="h-16 w-16 rounded-2xl bg-racing/10 flex items-center justify-center mx-auto mb-3">
                  <Search className="h-8 w-8 text-racing" />
                </div>
                <CardTitle className="text-xl">Track Your Vehicle</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Enter your mobile number and vehicle registration to see real-time progress
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="flex items-center gap-2 mb-1.5">
                    <Phone className="h-3.5 w-3.5" /> Mobile Number
                  </Label>
                  <div className="flex gap-2">
                    <span className="flex items-center px-3 bg-muted rounded-l-lg border-y border-l border-border text-sm text-muted-foreground">+91</span>
                    <Input
                      placeholder="Enter 10-digit number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                      className="rounded-l-none"
                    />
                  </div>
                </div>
                <div>
                  <Label className="flex items-center gap-2 mb-1.5">
                    <Hash className="h-3.5 w-3.5" /> Vehicle Number
                  </Label>
                  <Input
                    placeholder="e.g. MH01AB1234"
                    value={regNumber}
                    onChange={(e) => setRegNumber(e.target.value.toUpperCase())}
                  />
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    {error}
                  </div>
                )}

                <Button className="w-full bg-racing hover:bg-racing/90" onClick={handleSearch} disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />}
                  Track My Vehicle
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {/* Status Card */}
            <Card className="overflow-hidden">
              <div className={cn("h-1.5", data.job.status === "completed" ? "bg-green-500" : "bg-racing")} />
              <CardContent className="pt-5 pb-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Vehicle</p>
                    <p className="font-display text-xl font-bold">
                      {data.car.make} {data.car.model}
                      {data.car.year && <span className="text-muted-foreground font-normal text-base ml-1">({data.car.year})</span>}
                    </p>
                  </div>
                  {statusInfo && (
                    <Badge variant="outline" className={cn("text-sm px-3 py-1 gap-1.5", statusInfo.color)}>
                      <statusInfo.icon className="h-3.5 w-3.5" />
                      {statusInfo.label}
                    </Badge>
                  )}
                </div>

                {totalZones > 0 && (
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-semibold text-racing">{completedZones}/{totalZones} zones</span>
                    </div>
                    <Progress value={progressPercent} className="h-3" />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Zones checklist */}
            {data.zones.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Wrench className="h-4 w-4 text-racing" />
                    Work Zones
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1.5">
                  {data.zones.map((zone, i) => (
                    <div key={i} className={cn(
                      "flex items-center gap-3 p-2.5 rounded-lg text-sm",
                      zone.completed ? "bg-green-500/5" : "bg-muted/30"
                    )}>
                      <div className={cn(
                        "h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0",
                        zone.completed ? "bg-green-500/20 text-green-500" : "bg-muted text-muted-foreground"
                      )}>
                        {zone.completed ? <CheckCircle2 className="h-4 w-4" /> : <span className="text-xs">{i + 1}</span>}
                      </div>
                      <span className={cn("capitalize font-medium", zone.completed && "text-green-500")}>
                        {zone.zone_name.replace(/_/g, " ")}
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Media gallery */}
            {data.media.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Camera className="h-4 w-4 text-primary" />
                    Photos & Updates
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    {data.media.map((m, i) => (
                      <div key={i} className="relative rounded-lg overflow-hidden aspect-square bg-muted">
                        <img src={m.url} alt={m.caption || "Job photo"} className="w-full h-full object-cover" />
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                          <Badge className="text-[10px]">{m.stage}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Search again */}
            <Button variant="outline" className="w-full" onClick={() => setData(null)}>
              Track Another Vehicle
            </Button>
          </motion.div>
        )}
      </main>
    </div>
  );
}
