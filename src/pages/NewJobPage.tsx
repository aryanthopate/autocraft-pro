import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Phone,
  User,
  Car,
  Sparkles,
  Check,
  Loader2,
  Search,
  Percent,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { VehicleConfigurator, VehicleType } from "@/components/vehicle-config";
import { Car3DViewer, Hotspot3D } from "@/components/vehicle-config/Car3DViewer";
import { ServiceSelector } from "@/components/vehicle-config/ServiceSelector";
import { VehicleDropdowns } from "@/components/vehicle/VehicleDropdowns";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { getColorHex } from "@/data/vehicleData";

type Step = "customer" | "vehicle" | "services" | "review";

interface CustomerData {
  id?: string;
  name: string;
  phone: string;
  email: string;
  whatsapp_number: string;
  isNew: boolean;
}

interface VehicleData {
  id?: string;
  make: string;
  model: string;
  year: string;
  color: string;
  registration_number: string;
  vehicle_type: VehicleType;
}

interface SelectedZone {
  id: string;
  name: string;
  services: string[];
  price: number;
}

interface StudioSettings {
  gstin: string | null;
}

const STEPS: { id: Step; label: string; icon: React.ElementType }[] = [
  { id: "customer", label: "Customer", icon: User },
  { id: "vehicle", label: "Vehicle", icon: Car },
  { id: "services", label: "Services", icon: Sparkles },
  { id: "review", label: "Review", icon: Check },
];

// Helper function to convert color names to hex values
const getCarColorHex = (color: string | undefined): string => {
  if (!color) return "#FF6600"; // Default orange (BMW M3 GTS color)
  
  const colorMap: Record<string, string> = {
    "white": "#ffffff",
    "pearl white": "#f5f5f5",
    "black": "#1a1a1a",
    "silver": "#c0c0c0",
    "grey": "#808080",
    "gray": "#808080",
    "red": "#dc2626",
    "blue": "#2563eb",
    "navy": "#1e3a5f",
    "green": "#16a34a",
    "orange": "#FF6600",
    "yellow": "#eab308",
    "brown": "#78350f",
    "beige": "#d4c4a8",
    "maroon": "#7f1d1d",
    "gold": "#b8860b",
    "champagne": "#f7e7ce",
  };
  
  const lowerColor = color.toLowerCase();
  return colorMap[lowerColor] || "#FF6600";
};

export default function NewJobPage() {
  const navigate = useNavigate();
  const { studio, profile } = useAuth();
  const { toast } = useToast();

  const [currentStep, setCurrentStep] = useState<Step>("customer");
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);

  // Customer state
  const [phoneSearch, setPhoneSearch] = useState("");
  const [customer, setCustomer] = useState<CustomerData>({
    name: "",
    phone: "",
    email: "",
    whatsapp_number: "",
    isNew: true,
  });
  const [existingVehicles, setExistingVehicles] = useState<any[]>([]);

  // Vehicle state
  const [vehicle, setVehicle] = useState<VehicleData>({
    make: "",
    model: "",
    year: "",
    color: "",
    registration_number: "",
    vehicle_type: "sedan",
  });

  // Services state
  const [selectedZones, setSelectedZones] = useState<SelectedZone[]>([]);
  const [activeHotspot, setActiveHotspot] = useState<Hotspot3D | null>(null);
  const [notes, setNotes] = useState("");
  const [use3DViewer, setUse3DViewer] = useState(true);
  
  // GST state (only enabled if studio has GSTIN)
  const [gstPercent, setGstPercent] = useState<number>(0);
  const studioHasGstin = Boolean(studio?.gstin);

  const handlePhoneSearch = async () => {
    if (phoneSearch.length < 10) {
      toast({ variant: "destructive", title: "Enter a valid 10-digit phone number" });
      return;
    }

    setSearching(true);
    const formattedPhone = phoneSearch.startsWith("+91") ? phoneSearch : `+91${phoneSearch}`;

    try {
      const { data: customers, error } = await supabase
        .from("customers")
        .select("*, cars(*)")
        .eq("studio_id", studio?.id)
        .or(`phone.eq.${formattedPhone},phone.eq.${phoneSearch}`);

      if (error) throw error;

      if (customers && customers.length > 0) {
        const existingCustomer = customers[0];
        setCustomer({
          id: existingCustomer.id,
          name: existingCustomer.name,
          phone: existingCustomer.phone,
          email: existingCustomer.email || "",
          whatsapp_number: existingCustomer.whatsapp_number || "",
          isNew: false,
        });
        setExistingVehicles(existingCustomer.cars || []);
        toast({ title: "Customer found!", description: `Welcome back, ${existingCustomer.name}` });
      } else {
        setCustomer({
          name: "",
          phone: formattedPhone,
          email: "",
          whatsapp_number: formattedPhone,
          isNew: true,
        });
        setExistingVehicles([]);
        toast({ title: "New customer", description: "Enter customer details" });
      }
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Search failed" });
    } finally {
      setSearching(false);
    }
  };

  const selectExistingVehicle = (v: any) => {
    setVehicle({
      id: v.id,
      make: v.make,
      model: v.model,
      year: v.year?.toString() || "",
      color: v.color || "",
      registration_number: v.registration_number || "",
      vehicle_type: (v.vehicle_type as VehicleType) || "sedan",
    });
    setCurrentStep("services");
  };

  const canProceed = () => {
    switch (currentStep) {
      case "customer":
        return customer.name && customer.phone;
      case "vehicle":
        return vehicle.make && vehicle.model && vehicle.vehicle_type;
      case "services":
        return selectedZones.length > 0;
      case "review":
        return true;
      default:
        return false;
    }
  };

  const nextStep = () => {
    const steps: Step[] = ["customer", "vehicle", "services", "review"];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  const prevStep = () => {
    const steps: Step[] = ["customer", "vehicle", "services", "review"];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  const handleSubmit = async () => {
    if (!studio?.id) return;
    setLoading(true);

    try {
      // 1. Create or use existing customer
      let customerId = customer.id;
      if (customer.isNew) {
        const { data: newCustomer, error: custError } = await supabase
          .from("customers")
          .insert({
            studio_id: studio.id,
            name: customer.name,
            phone: customer.phone,
            email: customer.email || null,
            whatsapp_number: customer.whatsapp_number || null,
          })
          .select()
          .single();

        if (custError) throw custError;
        customerId = newCustomer.id;
      }

      // 2. Create or use existing vehicle
      let carId = vehicle.id;
      if (!carId) {
        const { data: newCar, error: carError } = await supabase
          .from("cars")
          .insert({
            studio_id: studio.id,
            customer_id: customerId!,
            make: vehicle.make,
            model: vehicle.model,
            year: vehicle.year ? parseInt(vehicle.year) : null,
            color: vehicle.color || null,
            registration_number: vehicle.registration_number || null,
            vehicle_type: vehicle.vehicle_type,
          })
          .select()
          .single();

        if (carError) throw carError;
        carId = newCar.id;
      }

      // 3. Create job
      const totalPrice = selectedZones.reduce((sum, z) => sum + z.price, 0);
      const { data: newJob, error: jobError } = await supabase
        .from("jobs")
        .insert({
          studio_id: studio.id,
          customer_id: customerId!,
          car_id: carId,
          status: "pending",
          notes: notes || null,
          total_price: totalPrice,
          assigned_to: profile?.id || null,
        })
        .select()
        .single();

      if (jobError) throw jobError;

      // 4. Create job zones
      const zonesData = selectedZones.map((z) => ({
        job_id: newJob.id,
        zone_name: z.name,
        zone_type: z.id.includes("wheel") ? "wheels" : "exterior",
        services: z.services,
        price: z.price,
      }));

      const { error: zonesError } = await supabase.from("job_zones").insert(zonesData);
      if (zonesError) throw zonesError;

      toast({ title: "Job created!", description: "New job has been added successfully" });
      navigate("/dashboard/jobs");
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Error", description: "Failed to create job" });
    } finally {
      setLoading(false);
    }
  };

  const subtotalPrice = selectedZones.reduce((sum, z) => sum + z.price, 0);
  const gstAmount = studioHasGstin && gstPercent > 0 ? Math.round(subtotalPrice * gstPercent / 100) : 0;
  const totalPrice = subtotalPrice + gstAmount;

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard/jobs")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="font-display text-2xl font-bold">Create New Job</h1>
            <p className="text-muted-foreground">Add a new detailing job</p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between">
          {STEPS.map((step, index) => {
            const isActive = step.id === currentStep;
            const isPast = STEPS.findIndex((s) => s.id === currentStep) > index;
            return (
              <div key={step.id} className="flex items-center flex-1">
                <motion.button
                  onClick={() => isPast && setCurrentStep(step.id)}
                  disabled={!isPast && !isActive}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg transition-all",
                    isActive && "bg-racing text-white",
                    isPast && "text-green-500 hover:bg-green-500/10",
                    !isActive && !isPast && "text-muted-foreground"
                  )}
                >
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all",
                      isActive && "bg-white text-racing border-white",
                      isPast && "bg-green-500 text-white border-green-500",
                      !isActive && !isPast && "border-muted-foreground/30"
                    )}
                  >
                    {isPast ? <Check className="h-4 w-4" /> : <step.icon className="h-4 w-4" />}
                  </div>
                  <span className="hidden sm:inline font-medium">{step.label}</span>
                </motion.button>
                {index < STEPS.length - 1 && (
                  <div
                    className={cn(
                      "flex-1 h-0.5 mx-2",
                      isPast ? "bg-green-500" : "bg-border"
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Step Content */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {currentStep === "customer" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5 text-racing" />
                  Customer Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Phone Search */}
                <div className="flex gap-3">
                  <div className="flex-1">
                    <Label>Mobile Number</Label>
                    <div className="flex gap-2 mt-1.5">
                      <span className="flex items-center px-3 bg-muted rounded-l-lg border-y border-l border-border text-muted-foreground">
                        +91
                      </span>
                      <Input
                        placeholder="Enter 10-digit number"
                        value={phoneSearch}
                        onChange={(e) => setPhoneSearch(e.target.value.replace(/\D/g, "").slice(0, 10))}
                        className="rounded-l-none"
                      />
                    </div>
                  </div>
                  <div className="flex items-end">
                    <Button onClick={handlePhoneSearch} disabled={searching}>
                      {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                      <span className="ml-2">Search</span>
                    </Button>
                  </div>
                </div>

                {customer.phone && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <Badge variant={customer.isNew ? "default" : "secondary"}>
                        {customer.isNew ? "New Customer" : "Existing Customer"}
                      </Badge>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <Label>Full Name *</Label>
                        <Input
                          value={customer.name}
                          onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                          placeholder="Customer name"
                        />
                      </div>
                      <div>
                        <Label>Email</Label>
                        <Input
                          type="email"
                          value={customer.email}
                          onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                          placeholder="email@example.com"
                        />
                      </div>
                      <div>
                        <Label>WhatsApp Number</Label>
                        <Input
                          value={customer.whatsapp_number}
                          onChange={(e) => setCustomer({ ...customer, whatsapp_number: e.target.value })}
                          placeholder="+91XXXXXXXXXX"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          )}

          {currentStep === "vehicle" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Car className="h-5 w-5 text-racing" />
                  Vehicle Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Existing vehicles */}
                {existingVehicles.length > 0 && (
                  <div className="space-y-3">
                    <Label>Select Existing Vehicle</Label>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {existingVehicles.map((v) => (
                        <motion.button
                          key={v.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => selectExistingVehicle(v)}
                          className="p-4 rounded-xl border border-border bg-card hover:border-racing transition-all text-left"
                        >
                          <div className="font-medium">
                            {v.make} {v.model}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {v.year && `${v.year} • `}
                            {v.registration_number || "No reg. number"}
                          </div>
                        </motion.button>
                      ))}
                    </div>
                    <div className="relative my-4">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-border" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-2 text-muted-foreground">or add new</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Vehicle details with integrated type selector */}
                <VehicleDropdowns
                  showVehicleType={true}
                  vehicleType={vehicle.vehicle_type as any}
                  make={vehicle.make}
                  model={vehicle.model}
                  year={vehicle.year}
                  color={vehicle.color}
                  registrationNumber={vehicle.registration_number}
                  onVehicleTypeChange={(type) => setVehicle({ ...vehicle, vehicle_type: type as VehicleType })}
                  onMakeChange={(newMake) => {
                    console.log("Parent onMakeChange:", newMake);
                    setVehicle(prev => ({ ...prev, make: newMake, model: "", year: "", color: "" }));
                  }}
                  onModelChange={(newModel) => {
                    console.log("Parent onModelChange:", newModel);
                    setVehicle(prev => ({ ...prev, model: newModel, year: "", color: "" }));
                  }}
                  onYearChange={(newYear) => setVehicle(prev => ({ ...prev, year: newYear }))}
                  onColorChange={(newColor) => setVehicle(prev => ({ ...prev, color: newColor }))}
                  onRegistrationChange={(reg) => setVehicle(prev => ({ ...prev, registration_number: reg }))}
                />
              </CardContent>
            </Card>
          )}

          {currentStep === "services" && (
            <div className="space-y-6">
              {/* 3D Mode Toggle */}
              <div className="flex items-center justify-end gap-2">
                <span className="text-sm text-muted-foreground">View Mode:</span>
                <div className="flex bg-muted rounded-lg p-1">
                  <button
                    onClick={() => setUse3DViewer(true)}
                    className={cn(
                      "px-3 py-1.5 rounded-md text-sm font-medium transition-all",
                      use3DViewer ? "bg-racing text-white" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    3D Model
                  </button>
                  <button
                    onClick={() => setUse3DViewer(false)}
                    className={cn(
                      "px-3 py-1.5 rounded-md text-sm font-medium transition-all",
                      !use3DViewer ? "bg-racing text-white" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    2D View
                  </button>
                </div>
              </div>

              <Card className="overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-racing/10 to-primary/10">
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-racing" />
                    {use3DViewer ? "Premium 3D Configurator" : "Configure Services"}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {use3DViewer 
                      ? `${vehicle.make} ${vehicle.model} - ${vehicle.color || "Orange"} • Rotate and click hotspots`
                      : "Rotate the vehicle and tap on zones to add services"
                    }
                  </p>
                </CardHeader>
                <CardContent className="p-6">
                  {use3DViewer ? (
                    <Car3DViewer
                      carColor={getCarColorHex(vehicle.color)}
                      selectedZones={selectedZones}
                      onHotspotClick={(hotspot) => setActiveHotspot(hotspot)}
                      vehicleMake={vehicle.make}
                      vehicleModel={vehicle.model}
                      vehicleCategory={vehicle.vehicle_type}
                      onZoneRemove={(zoneId) => setSelectedZones(selectedZones.filter(z => z.id !== zoneId))}
                    />
                  ) : (
                    <VehicleConfigurator
                      vehicleType={vehicle.vehicle_type}
                      selectedZones={selectedZones}
                      onZonesChange={setSelectedZones}
                    />
                  )}
                </CardContent>
              </Card>

              {/* Service Selector for 3D viewer */}
              {use3DViewer && activeHotspot && (
                <ServiceSelector
                  open={!!activeHotspot}
                  onClose={() => setActiveHotspot(null)}
                  hotspot={{
                    id: activeHotspot.id,
                    name: activeHotspot.name,
                    zone_type: activeHotspot.zone_type,
                    x: 0,
                    y: 0,
                  }}
                  existingServices={selectedZones.find(z => z.id === activeHotspot.id)?.services || []}
                  existingPrice={selectedZones.find(z => z.id === activeHotspot.id)?.price || 0}
                  onSave={(services, price) => {
                    const existingIndex = selectedZones.findIndex(z => z.id === activeHotspot.id);
                    if (existingIndex >= 0) {
                      const updated = [...selectedZones];
                      updated[existingIndex] = { ...updated[existingIndex], services, price };
                      setSelectedZones(updated);
                    } else {
                      setSelectedZones([...selectedZones, {
                        id: activeHotspot.id,
                        name: activeHotspot.name,
                        services,
                        price,
                      }]);
                    }
                    setActiveHotspot(null);
                  }}
                />
              )}

              {/* GST Percentage (only if studio has GSTIN) */}
              {studioHasGstin && (
                <Card className="border-green-500/20 bg-green-500/5">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <Percent className="h-5 w-5 text-green-600" />
                      <div className="flex-1">
                        <Label>GST Percentage</Label>
                        <p className="text-xs text-muted-foreground">Your studio has GSTIN registered</p>
                      </div>
                      <div className="w-24">
                        <Input
                          type="number"
                          value={gstPercent}
                          onChange={(e) => setGstPercent(Math.min(28, Math.max(0, parseInt(e.target.value) || 0)))}
                          placeholder="18"
                          min={0}
                          max={28}
                          className="text-center"
                        />
                      </div>
                      <span className="text-muted-foreground">%</span>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Notes */}
              <Card>
                <CardContent className="pt-6">
                  <Label>Job Notes (Optional)</Label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any special instructions or notes..."
                    className="mt-1.5"
                  />
                </CardContent>
              </Card>
            </div>
          )}

          {currentStep === "review" && (
            <div className="space-y-4">
              {/* Customer Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Customer</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Name:</span>{" "}
                      <span className="font-medium">{customer.name}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Phone:</span>{" "}
                      <span className="font-medium">{customer.phone}</span>
                    </div>
                    {customer.email && (
                      <div>
                        <span className="text-muted-foreground">Email:</span>{" "}
                        <span className="font-medium">{customer.email}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Vehicle Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Vehicle</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Vehicle:</span>{" "}
                      <span className="font-medium">
                        {vehicle.make} {vehicle.model} {vehicle.year && `(${vehicle.year})`}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Type:</span>{" "}
                      <span className="font-medium capitalize">{vehicle.vehicle_type}</span>
                    </div>
                    {vehicle.color && (
                      <div>
                        <span className="text-muted-foreground">Color:</span>{" "}
                        <span className="font-medium">{vehicle.color}</span>
                      </div>
                    )}
                    {vehicle.registration_number && (
                      <div>
                        <span className="text-muted-foreground">Reg. No:</span>{" "}
                        <span className="font-medium">{vehicle.registration_number}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Services Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Services</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {selectedZones.map((zone) => (
                      <div key={zone.id} className="flex justify-between items-start p-3 rounded-lg bg-muted/50">
                        <div>
                          <p className="font-medium">{zone.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {zone.services.join(", ")}
                          </p>
                        </div>
                        <span className="font-medium text-racing">₹{zone.price.toLocaleString()}</span>
                      </div>
                    ))}
                    <div className="space-y-2 pt-4 border-t">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span className="font-medium">₹{subtotalPrice.toLocaleString()}</span>
                      </div>
                      {gstAmount > 0 && (
                        <div className="flex justify-between items-center text-green-600">
                          <span>GST ({gstPercent}%)</span>
                          <span className="font-medium">₹{gstAmount.toLocaleString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center pt-2 border-t">
                        <span className="text-lg font-semibold">Total</span>
                        <span className="text-2xl font-bold text-racing">₹{totalPrice.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {notes && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{notes}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </motion.div>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-4">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === "customer"}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>

          {currentStep === "review" ? (
            <Button onClick={handleSubmit} disabled={loading} className="gap-2 bg-racing hover:bg-racing/90">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              Create Job
            </Button>
          ) : (
            <Button onClick={nextStep} disabled={!canProceed()} className="gap-2">
              Next
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
