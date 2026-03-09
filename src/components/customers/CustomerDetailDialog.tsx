import { useState, useEffect } from "react";
import { Phone, Mail, MapPin, Car, ClipboardList, Calendar, Loader2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface CustomerDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerId: string;
  customerName: string;
  studioId: string;
}

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number | null;
  color: string | null;
  registration_number: string | null;
  vehicle_type: string | null;
}

interface Job {
  id: string;
  status: string;
  created_at: string;
  total_price: number | null;
  car?: { make: string; model: string };
}

export function CustomerDetailDialog({ open, onOpenChange, customerId, customerName, studioId }: CustomerDetailDialogProps) {
  const [loading, setLoading] = useState(true);
  const [customer, setCustomer] = useState<any>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);

  useEffect(() => {
    if (open && customerId) fetchDetails();
  }, [open, customerId]);

  const fetchDetails = async () => {
    setLoading(true);
    try {
      const [custRes, vehRes, jobsRes] = await Promise.all([
        supabase.from("customers").select("*").eq("id", customerId).single(),
        supabase.from("cars").select("*").eq("customer_id", customerId).order("created_at", { ascending: false }),
        supabase.from("jobs").select("*, cars(make, model)").eq("customer_id", customerId).order("created_at", { ascending: false }).limit(20),
      ]);

      if (custRes.data) setCustomer(custRes.data);
      setVehicles(vehRes.data || []);
      setJobs((jobsRes.data || []).map((j: any) => ({ ...j, car: j.cars })));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-amber-500/15 text-amber-500";
      case "in_progress": return "bg-racing/15 text-racing";
      case "completed": return "bg-green-500/15 text-green-500";
      case "awaiting_review": return "bg-purple-500/15 text-purple-500";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const totalSpent = jobs.filter(j => j.status === "completed").reduce((sum, j) => sum + (j.total_price || 0), 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{customerName}</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Contact Info */}
            {customer && (
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-mono">{customer.phone}</span>
                </div>
                {customer.email && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm truncate">{customer.email}</span>
                  </div>
                )}
                {customer.address && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 col-span-2">
                    <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm">{customer.address}</span>
                  </div>
                )}
              </div>
            )}

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 rounded-lg bg-primary/5 border border-primary/10">
                <p className="text-2xl font-bold text-primary">{vehicles.length}</p>
                <p className="text-xs text-muted-foreground">Vehicles</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-racing/5 border border-racing/10">
                <p className="text-2xl font-bold text-racing">{jobs.length}</p>
                <p className="text-xs text-muted-foreground">Jobs</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-success/5 border border-success/10">
                <p className="text-2xl font-bold text-success">₹{totalSpent.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Total Spent</p>
              </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="vehicles">
              <TabsList className="w-full">
                <TabsTrigger value="vehicles" className="flex-1">
                  <Car className="h-3.5 w-3.5 mr-1.5" />
                  Vehicles ({vehicles.length})
                </TabsTrigger>
                <TabsTrigger value="jobs" className="flex-1">
                  <ClipboardList className="h-3.5 w-3.5 mr-1.5" />
                  Jobs ({jobs.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="vehicles" className="mt-3 space-y-2">
                {vehicles.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">No vehicles registered</p>
                ) : (
                  vehicles.map((v) => (
                    <div key={v.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Car className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{v.make} {v.model} {v.year && `(${v.year})`}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            {v.registration_number && <span className="font-mono">{v.registration_number}</span>}
                            {v.color && (
                              <span className="flex items-center gap-1">
                                <div className="h-2.5 w-2.5 rounded-full border" style={{ backgroundColor: v.color.toLowerCase() }} />
                                {v.color}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      {v.vehicle_type && (
                        <Badge variant="outline" className="text-[10px] capitalize">{v.vehicle_type}</Badge>
                      )}
                    </div>
                  ))
                )}
              </TabsContent>

              <TabsContent value="jobs" className="mt-3 space-y-2">
                {jobs.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">No jobs yet</p>
                ) : (
                  jobs.map((j) => (
                    <a key={j.id} href={`/dashboard/jobs/${j.id}`}
                      className="flex items-center justify-between p-3 rounded-lg border hover:border-primary/30 transition-colors"
                    >
                      <div>
                        <p className="font-medium text-sm">{j.car?.make} {j.car?.model}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(j.created_at).toLocaleDateString()}
                          {j.total_price ? ` • ₹${j.total_price.toLocaleString()}` : ""}
                        </p>
                      </div>
                      <Badge variant="outline" className={cn("text-[10px] capitalize", getStatusColor(j.status))}>
                        {j.status.replace("_", " ")}
                      </Badge>
                    </a>
                  ))
                )}
              </TabsContent>
            </Tabs>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
