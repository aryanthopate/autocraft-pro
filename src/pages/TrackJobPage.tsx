import { useState } from "react";
import { motion } from "framer-motion";
import { Car, Search, Phone, Hash, Loader2, CheckCircle2, Clock, Wrench, Camera, AlertCircle, ArrowLeft, MapPin, Calendar } from "lucide-react";
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

const STATUS_STEPS = [
  { key: "pending", label: "Received", icon: Clock },
  { key: "scheduled", label: "Scheduled", icon: Calendar },
  { key: "in_progress", label: "In Progress", icon: Wrench },
  { key: "awaiting_review", label: "Quality Check", icon: CheckCircle2 },
  { key: "completed", label: "Ready!", icon: CheckCircle2 },
];

const STATUS_ORDER = ["pending", "scheduled", "in_progress", "awaiting_review", "completed"];

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
      const { data: result, error: fnError } = await supabase.functions.invoke("track-job", {
        body: {
          phone: phone.replace(/\D/g, ""),
          registration_number: regNumber,
        },
      });

      if (fnError) throw fnError;

      if (result?.error) {
        setError(result.error);
        return;
      }

      setData(result);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const completedZones = data?.zones.filter(z => z.completed).length || 0;
  const totalZones = data?.zones.length || 0;
  const progressPercent = totalZones > 0 ? (completedZones / totalZones) * 100 : 0;
  const currentStatusIndex = data ? STATUS_ORDER.indexOf(data.job.status) : -1;

  const beforeMedia = data?.media.filter(m => m.stage === "before") || [];
  const afterMedia = data?.media.filter(m => m.stage === "after") || [];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex items-center gap-3">
          {data && (
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setData(null)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-primary to-racing flex items-center justify-center">
            <Car className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="font-display text-lg font-bold">DetailFlow</h1>
            <p className="text-[10px] text-muted-foreground tracking-wider uppercase">Live Vehicle Tracking</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-lg">
        {!data ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Hero */}
            <div className="text-center pt-8 pb-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary/20 to-racing/20 flex items-center justify-center mx-auto mb-4"
              >
                <MapPin className="h-10 w-10 text-primary" />
              </motion.div>
              <h2 className="font-display text-2xl font-bold">Track Your Vehicle</h2>
              <p className="text-muted-foreground mt-2 text-sm max-w-xs mx-auto">
                Enter your details below to see real-time progress of your vehicle's detailing service
              </p>
            </div>

            <Card className="border-primary/10">
              <CardContent className="pt-6 space-y-4">
                <div>
                  <Label className="flex items-center gap-2 mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <Phone className="h-3.5 w-3.5" /> Mobile Number
                  </Label>
                  <div className="flex gap-0">
                    <span className="flex items-center px-3 bg-muted rounded-l-lg border-y border-l border-border text-sm text-muted-foreground font-mono">+91</span>
                    <Input
                      placeholder="10-digit number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                      className="rounded-l-none font-mono"
                    />
                  </div>
                </div>
                <div>
                  <Label className="flex items-center gap-2 mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <Hash className="h-3.5 w-3.5" /> Vehicle Number
                  </Label>
                  <Input
                    placeholder="e.g. MH 01 AB 1234"
                    value={regNumber}
                    onChange={(e) => setRegNumber(e.target.value.toUpperCase())}
                    className="uppercase font-mono"
                  />
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-lg"
                  >
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    {error}
                  </motion.div>
                )}

                <Button className="w-full" size="lg" onClick={handleSearch} disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />}
                  Track My Vehicle
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {/* Vehicle Info */}
            <Card className="overflow-hidden">
              <div className={cn("h-1.5 bg-gradient-to-r",
                data.job.status === "completed" ? "from-green-500 to-emerald-400" : "from-primary to-racing"
              )} />
              <CardContent className="pt-5 pb-4">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs text-muted-foreground">Hello, {data.customer.name}</p>
                  {data.car.color && (
                    <div className="flex items-center gap-1.5">
                      <div className="h-3 w-3 rounded-full border border-border" style={{ backgroundColor: data.car.color.toLowerCase() }} />
                      <span className="text-xs text-muted-foreground">{data.car.color}</span>
                    </div>
                  )}
                </div>
                <p className="font-display text-xl font-bold">
                  {data.car.make} {data.car.model}
                  {data.car.year && <span className="text-muted-foreground font-normal text-base ml-1">({data.car.year})</span>}
                </p>
              </CardContent>
            </Card>

            {/* Status Pipeline */}
            <Card>
              <CardContent className="pt-5 pb-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">Status</p>
                <div className="flex items-center justify-between relative">
                  {/* Connecting line */}
                  <div className="absolute top-4 left-6 right-6 h-0.5 bg-border" />
                  <div
                    className="absolute top-4 left-6 h-0.5 bg-gradient-to-r from-primary to-racing transition-all duration-700"
                    style={{ width: `calc(${(currentStatusIndex / (STATUS_STEPS.length - 1)) * 100}% - 48px)` }}
                  />

                  {STATUS_STEPS.map((step, i) => {
                    const isActive = i <= currentStatusIndex;
                    const isCurrent = i === currentStatusIndex;
                    return (
                      <div key={step.key} className="flex flex-col items-center relative z-10">
                        <motion.div
                          initial={isCurrent ? { scale: 0.5 } : {}}
                          animate={isCurrent ? { scale: [1, 1.15, 1] } : {}}
                          transition={isCurrent ? { duration: 2, repeat: Infinity } : {}}
                          className={cn(
                            "h-8 w-8 rounded-full flex items-center justify-center border-2 transition-all",
                            isActive
                              ? "bg-primary border-primary text-white"
                              : "bg-card border-border text-muted-foreground"
                          )}
                        >
                          <step.icon className="h-3.5 w-3.5" />
                        </motion.div>
                        <span className={cn(
                          "text-[10px] mt-1.5 font-medium text-center w-14",
                          isActive ? "text-primary" : "text-muted-foreground"
                        )}>
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Progress */}
            {totalZones > 0 && (
              <Card>
                <CardContent className="pt-5 pb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Work Progress</span>
                    <span className="font-bold text-primary">{completedZones}/{totalZones} zones</span>
                  </div>
                  <Progress value={progressPercent} className="h-3" />
                  <div className="mt-3 space-y-1.5">
                    {data.zones.map((zone, i) => (
                      <div key={i} className={cn(
                        "flex items-center gap-3 p-2 rounded-lg text-sm",
                        zone.completed ? "bg-green-500/5" : "bg-muted/30"
                      )}>
                        <div className={cn(
                          "h-5 w-5 rounded-full flex items-center justify-center flex-shrink-0",
                          zone.completed ? "bg-green-500/20 text-green-500" : "bg-muted text-muted-foreground"
                        )}>
                          {zone.completed ? <CheckCircle2 className="h-3 w-3" /> : <span className="text-[10px]">{i + 1}</span>}
                        </div>
                        <span className={cn("capitalize font-medium", zone.completed && "text-green-600")}>
                          {zone.zone_name.replace(/_/g, " ")}
                        </span>
                        {zone.completed && zone.completed_at && (
                          <span className="text-[10px] text-muted-foreground ml-auto">
                            {new Date(zone.completed_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Media Gallery */}
            {data.media.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Camera className="h-4 w-4 text-primary" />
                    Photos
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {beforeMedia.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Before</p>
                      <div className="grid grid-cols-3 gap-1.5">
                        {beforeMedia.map((m, i) => (
                          <div key={i} className="relative rounded-lg overflow-hidden aspect-square bg-muted">
                            <img src={m.url} alt={m.caption || "Before"} className="w-full h-full object-cover" loading="lazy" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {afterMedia.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">After</p>
                      <div className="grid grid-cols-3 gap-1.5">
                        {afterMedia.map((m, i) => (
                          <div key={i} className="relative rounded-lg overflow-hidden aspect-square bg-muted">
                            <img src={m.url} alt={m.caption || "After"} className="w-full h-full object-cover" loading="lazy" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
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

      {/* Footer */}
      <footer className="border-t border-border mt-12 py-4 text-center">
        <p className="text-xs text-muted-foreground">Powered by <span className="font-semibold">DetailFlow</span></p>
      </footer>
    </div>
  );
}
