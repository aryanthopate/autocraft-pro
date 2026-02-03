import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  User,
  Car,
  Wrench,
  Phone,
  Search,
  Loader2,
  Plus,
  X,
  IndianRupee,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { VehicleSilhouette, VehicleType, VEHICLE_ZONES } from "@/components/vehicles/VehicleSilhouette";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface ServiceItem {
  zoneId: string;
  zoneName: string;
  service: string;
  price: number;
}

interface QuickJobFormProps {
  onComplete: (jobId: string) => void;
  onCancel: () => void;
}

const SERVICE_PRESETS = [
  { name: "Wash & Clean", price: 500 },
  { name: "Polish", price: 1500 },
  { name: "Ceramic Coating", price: 8000 },
  { name: "Paint Protection Film", price: 15000 },
  { name: "Scratch Removal", price: 2000 },
  { name: "Dent Repair", price: 3000 },
  { name: "Interior Detailing", price: 2500 },
  { name: "Full Detailing", price: 5000 },
];

export function QuickJobForm({ onComplete, onCancel }: QuickJobFormProps) {
  const { studio, profile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);

  // Customer
  const [phoneSearch, setPhoneSearch] = useState("");
  const [isExisting, setIsExisting] = useState<boolean | null>(null);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");

  // Vehicle
  const [vehicleType, setVehicleType] = useState<VehicleType>("sedan");
  const [vehicleId, setVehicleId] = useState<string | null>(null);
  const [existingVehicles, setExistingVehicles] = useState<any[]>([]);
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [regNumber, setRegNumber] = useState("");
  const [color, setColor] = useState("");
  const [notes, setNotes] = useState("");

  // Services
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [customService, setCustomService] = useState("");
  const [customPrice, setCustomPrice] = useState("");

  const searchCustomer = async () => {
    if (!studio?.id || phoneSearch.length < 10) return;
    setSearching(true);
    try {
      const clean = phoneSearch.replace(/\D/g, "");
      const phone = clean.startsWith("91") ? `+${clean}` : `+91${clean}`;

      const { data } = await supabase
        .from("customers")
        .select("*, cars(*)")
        .eq("studio_id", studio.id)
        .or(`phone.eq.${phone},phone.ilike.%${clean.slice(-10)}%`)
        .limit(1)
        .single();

      if (data) {
        setIsExisting(true);
        setCustomerId(data.id);
        setName(data.name);
        setEmail(data.email || "");
        setWhatsapp(data.whatsapp_number || "");
        setExistingVehicles(data.cars || []);
        toast({ title: "Customer found!", description: `Welcome back, ${data.name}` });
      } else {
        setIsExisting(false);
        toast({ title: "New customer", description: "Enter details below" });
      }
    } catch {
      setIsExisting(false);
    } finally {
      setSearching(false);
    }
  };

  const selectExistingVehicle = (v: any) => {
    setVehicleId(v.id);
    setMake(v.make);
    setModel(v.model);
    setVehicleType(v.vehicle_type || "sedan");
    setRegNumber(v.registration_number || "");
    setColor(v.color || "");
  };

  const addService = (service: string, price: number) => {
    if (!selectedZone) return;
    const zones = VEHICLE_ZONES[vehicleType];
    const zone = zones.find((z) => z.id === selectedZone);
    if (!zone) return;
    setServices((prev) => [...prev, { zoneId: selectedZone, zoneName: zone.name, service, price }]);
    setCustomService("");
    setCustomPrice("");
  };

  const removeService = (index: number) => {
    setServices((prev) => prev.filter((_, i) => i !== index));
  };

  const totalPrice = services.reduce((sum, s) => sum + s.price, 0);

  const handleSubmit = async () => {
    if (!studio?.id || !profile?.id) return;
    if (!name || phoneSearch.length < 10 || !make || !model) {
      toast({ variant: "destructive", title: "Fill required fields", description: "Name, phone, make & model are required" });
      return;
    }

    setLoading(true);
    try {
      const phone = phoneSearch.startsWith("91") ? `+${phoneSearch}` : `+91${phoneSearch}`;

      // Customer
      let cid = customerId;
      if (!isExisting) {
        const { data: c, error } = await supabase
          .from("customers")
          .insert({ studio_id: studio.id, name, phone, email: email || null, whatsapp_number: whatsapp || null })
          .select()
          .single();
        if (error) throw error;
        cid = c.id;
      }

      // Vehicle
      let vid = vehicleId;
      if (!vehicleId) {
        const { data: v, error } = await supabase
          .from("cars")
          .insert({
            studio_id: studio.id,
            customer_id: cid!,
            vehicle_type: vehicleType,
            make,
            model,
            registration_number: regNumber || null,
            color: color || null,
            condition_notes: notes || null,
          })
          .select()
          .single();
        if (error) throw error;
        vid = v.id;
      }

      // Job
      const { data: job, error: jobErr } = await supabase
        .from("jobs")
        .insert({
          studio_id: studio.id,
          customer_id: cid!,
          car_id: vid!,
          total_price: totalPrice,
          notes: notes || null,
          status: "pending",
        })
        .select()
        .single();
      if (jobErr) throw jobErr;

      // Zones
      if (services.length > 0) {
        const zonesMap = new Map<string, ServiceItem[]>();
        services.forEach((s) => {
          if (!zonesMap.has(s.zoneId)) zonesMap.set(s.zoneId, []);
          zonesMap.get(s.zoneId)!.push(s);
        });

        const inserts = Array.from(zonesMap.entries()).map(([zoneId, zs]) => ({
          job_id: job.id,
          zone_name: zs[0].zoneName,
          zone_type: vehicleType,
          services: zs.map((s) => s.service),
          price: zs.reduce((sum, s) => sum + s.price, 0),
        }));

        await supabase.from("job_zones").insert(inserts);
      }

      toast({ title: "Job created!", description: `${make} ${model} for ${name}` });
      onComplete(job.id);
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    } finally {
      setLoading(false);
    }
  };

  const zones = VEHICLE_ZONES[vehicleType];

  return (
    <div className="space-y-6">
      {/* Customer Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="h-5 w-5 text-primary" />
            Customer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">+91</span>
              <Input
                placeholder="10-digit mobile"
                value={phoneSearch}
                onChange={(e) => setPhoneSearch(e.target.value.replace(/\D/g, "").slice(0, 10))}
                className="pl-12"
              />
            </div>
            <Button onClick={searchCustomer} disabled={phoneSearch.length < 10 || searching} size="icon">
              {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            </Button>
          </div>

          {isExisting !== null && (
            <Badge variant={isExisting ? "default" : "secondary"}>
              {isExisting ? "Existing Customer" : "New Customer"}
            </Badge>
          )}

          {isExisting !== null && (
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label className="text-xs">Name *</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} disabled={isExisting} />
              </div>
              <div>
                <Label className="text-xs">Email</Label>
                <Input value={email} onChange={(e) => setEmail(e.target.value)} disabled={isExisting} />
              </div>
              <div>
                <Label className="text-xs">WhatsApp</Label>
                <Input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value.replace(/\D/g, "").slice(0, 10))} disabled={isExisting} />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Vehicle Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Car className="h-5 w-5 text-primary" />
            Vehicle
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Existing vehicles */}
          {existingVehicles.length > 0 && (
            <div className="space-y-2">
              <Label className="text-xs">Existing Vehicles</Label>
              <div className="flex flex-wrap gap-2">
                {existingVehicles.map((v) => (
                  <Button
                    key={v.id}
                    variant={vehicleId === v.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => selectExistingVehicle(v)}
                  >
                    {v.make} {v.model}
                  </Button>
                ))}
                <Button variant="outline" size="sm" onClick={() => setVehicleId(null)}>
                  <Plus className="h-3 w-3 mr-1" /> New
                </Button>
              </div>
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <Label className="text-xs">Type</Label>
              <Select value={vehicleType} onValueChange={(v) => setVehicleType(v as VehicleType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="sedan">Sedan</SelectItem>
                  <SelectItem value="suv">SUV</SelectItem>
                  <SelectItem value="bike">Bike</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Make *</Label>
              <Input placeholder="e.g. Honda" value={make} onChange={(e) => setMake(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">Model *</Label>
              <Input placeholder="e.g. City" value={model} onChange={(e) => setModel(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">Reg Number</Label>
              <Input placeholder="MH01AB1234" value={regNumber} onChange={(e) => setRegNumber(e.target.value.toUpperCase())} />
            </div>
            <div>
              <Label className="text-xs">Color</Label>
              <Input placeholder="e.g. White" value={color} onChange={(e) => setColor(e.target.value)} />
            </div>
          </div>

          <div>
            <Label className="text-xs">Condition Notes</Label>
            <Textarea placeholder="Any scratches, dents, existing damage..." value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
          </div>
        </CardContent>
      </Card>

      {/* Services Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Wrench className="h-5 w-5 text-primary" />
            Services
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Vehicle Visual */}
          <div className="flex justify-center py-4 bg-muted/30 rounded-lg">
            <VehicleSilhouette
              vehicleType={vehicleType}
              selectedZones={selectedZone ? [selectedZone] : []}
              completedZones={services.map((s) => s.zoneId)}
              onZoneClick={(z) => setSelectedZone(selectedZone === z ? null : z)}
            />
          </div>

          {/* Zone selector */}
          <div className="flex flex-wrap gap-2">
            {zones.map((z) => (
              <Button
                key={z.id}
                variant={selectedZone === z.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedZone(selectedZone === z.id ? null : z.id)}
              >
                {z.name}
              </Button>
            ))}
          </div>

          {/* Add service to selected zone */}
          {selectedZone && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 border rounded-lg bg-muted/20">
              <p className="font-medium mb-3">Add service to: {zones.find((z) => z.id === selectedZone)?.name}</p>
              <div className="flex flex-wrap gap-2 mb-3">
                {SERVICE_PRESETS.map((p) => (
                  <Button key={p.name} variant="outline" size="sm" onClick={() => addService(p.name, p.price)}>
                    {p.name} (₹{p.price})
                  </Button>
                ))}
              </div>
              <div className="flex gap-2">
                <Input placeholder="Custom service" value={customService} onChange={(e) => setCustomService(e.target.value)} />
                <Input placeholder="Price" type="number" className="w-24" value={customPrice} onChange={(e) => setCustomPrice(e.target.value)} />
                <Button
                  size="sm"
                  disabled={!customService || !customPrice}
                  onClick={() => addService(customService, parseInt(customPrice) || 0)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Services list */}
          {services.length > 0 && (
            <div className="space-y-2">
              <Label className="text-xs">Added Services</Label>
              {services.map((s, i) => (
                <div key={i} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                  <div>
                    <span className="font-medium">{s.service}</span>
                    <span className="text-xs text-muted-foreground ml-2">({s.zoneName})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">₹{s.price}</span>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeService(i)}>
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Total & Actions */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-lg font-medium">Total</span>
            <span className="text-2xl font-bold flex items-center">
              <IndianRupee className="h-5 w-5" />
              {totalPrice.toLocaleString()}
            </span>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onCancel} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading} className="flex-1">
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Create Job
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
