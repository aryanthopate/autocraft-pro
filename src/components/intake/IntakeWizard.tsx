import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Car,
  Camera,
  Wrench,
  CreditCard,
  Check,
  ChevronRight,
  ChevronLeft,
  Phone,
  Mail,
  MapPin,
  Search,
  Loader2,
  Plus,
  Mic,
  MicOff,
  Upload,
  Trash2,
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

const STEPS = [
  { id: "customer", label: "Customer", icon: User },
  { id: "vehicle", label: "Vehicle", icon: Car },
  { id: "condition", label: "Condition", icon: Camera },
  { id: "services", label: "Services", icon: Wrench },
  { id: "pricing", label: "Pricing", icon: CreditCard },
  { id: "confirm", label: "Confirm", icon: Check },
];

interface ServiceItem {
  zoneId: string;
  zoneName: string;
  service: string;
  price: number;
  notes?: string;
}

interface IntakeWizardProps {
  onComplete: (jobId: string) => void;
  onCancel: () => void;
}

export function IntakeWizard({ onComplete, onCancel }: IntakeWizardProps) {
  const { studio, profile } = useAuth();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);

  // Customer data
  const [phoneSearch, setPhoneSearch] = useState("");
  const [isExistingCustomer, setIsExistingCustomer] = useState<boolean | null>(null);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [customerData, setCustomerData] = useState({
    name: "",
    phone: "",
    email: "",
    whatsapp_number: "",
    address: "",
    gstn: "",
  });

  // Vehicle data
  const [vehicleId, setVehicleId] = useState<string | null>(null);
  const [vehicleData, setVehicleData] = useState({
    vehicle_type: "sedan" as VehicleType,
    make: "",
    model: "",
    year: "",
    color: "",
    registration_number: "",
    mileage: "",
    condition_notes: "",
  });
  const [existingVehicles, setExistingVehicles] = useState<any[]>([]);

  // Condition data (media)
  const [conditionNotes, setConditionNotes] = useState("");
  const [voiceNotes, setVoiceNotes] = useState<string[]>([]);
  const [isRecording, setIsRecording] = useState(false);

  // Services data
  const [selectedZones, setSelectedZones] = useState<string[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);

  // Transport options
  const [transport, setTransport] = useState<"none" | "pickup" | "drop" | "both">("none");
  const [scheduledDate, setScheduledDate] = useState("");

  // Search for customer by phone
  const searchCustomer = async () => {
    if (!studio?.id || phoneSearch.length < 10) return;

    setSearching(true);
    try {
      const cleanPhone = phoneSearch.replace(/\D/g, "");
      const phoneWithPrefix = cleanPhone.startsWith("91") ? `+${cleanPhone}` : `+91${cleanPhone}`;

      const { data, error } = await supabase
        .from("customers")
        .select("*, cars(*)")
        .eq("studio_id", studio.id)
        .or(`phone.eq.${phoneWithPrefix},phone.eq.${cleanPhone},phone.ilike.%${cleanPhone.slice(-10)}%`)
        .limit(1)
        .single();

      if (data) {
        setIsExistingCustomer(true);
        setCustomerId(data.id);
        setCustomerData({
          name: data.name,
          phone: data.phone,
          email: data.email || "",
          whatsapp_number: data.whatsapp_number || "",
          address: data.address || "",
          gstn: data.gstn || "",
        });
        setExistingVehicles(data.cars || []);
        toast({ title: "Customer found!", description: `Welcome back, ${data.name}` });
      } else {
        setIsExistingCustomer(false);
        setCustomerData((prev) => ({ ...prev, phone: phoneWithPrefix }));
        toast({ title: "New customer", description: "Please fill in customer details" });
      }
    } catch (error) {
      setIsExistingCustomer(false);
      const cleanPhone = phoneSearch.replace(/\D/g, "");
      const phoneWithPrefix = cleanPhone.startsWith("91") ? `+${cleanPhone}` : `+91${cleanPhone}`;
      setCustomerData((prev) => ({ ...prev, phone: phoneWithPrefix }));
    } finally {
      setSearching(false);
    }
  };

  // Handle zone selection for services
  const handleZoneClick = (zoneId: string) => {
    setSelectedZones((prev) =>
      prev.includes(zoneId) ? prev.filter((z) => z !== zoneId) : [...prev, zoneId]
    );
  };

  // Add service to a zone
  const addService = (zoneId: string, zoneName: string, service: string, price: number) => {
    setServices((prev) => [...prev, { zoneId, zoneName, service, price }]);
  };

  // Remove service
  const removeService = (index: number) => {
    setServices((prev) => prev.filter((_, i) => i !== index));
  };

  // Calculate total price
  const totalPrice = services.reduce((sum, s) => sum + s.price, 0);

  // Submit the complete intake
  const handleSubmit = async () => {
    if (!studio?.id || !profile?.id) return;

    setLoading(true);
    try {
      // 1. Create or update customer
      let finalCustomerId = customerId;
      if (!isExistingCustomer) {
        const { data: newCustomer, error: customerError } = await supabase
          .from("customers")
          .insert({
            studio_id: studio.id,
            name: customerData.name,
            phone: customerData.phone,
            email: customerData.email || null,
            whatsapp_number: customerData.whatsapp_number || null,
            address: customerData.address || null,
            gstn: customerData.gstn || null,
          })
          .select()
          .single();

        if (customerError) throw customerError;
        finalCustomerId = newCustomer.id;
      }

      // 2. Create or use existing vehicle
      let finalVehicleId = vehicleId;
      if (!vehicleId) {
        const { data: newVehicle, error: vehicleError } = await supabase
          .from("cars")
          .insert({
            studio_id: studio.id,
            customer_id: finalCustomerId!,
            vehicle_type: vehicleData.vehicle_type,
            make: vehicleData.make,
            model: vehicleData.model,
            year: vehicleData.year ? parseInt(vehicleData.year) : null,
            color: vehicleData.color || null,
            registration_number: vehicleData.registration_number || null,
            mileage: vehicleData.mileage ? parseInt(vehicleData.mileage) : null,
            condition_notes: vehicleData.condition_notes || null,
          })
          .select()
          .single();

        if (vehicleError) throw vehicleError;
        finalVehicleId = newVehicle.id;
      }

      // 3. Create job
      const { data: job, error: jobError } = await supabase
        .from("jobs")
        .insert({
          studio_id: studio.id,
          customer_id: finalCustomerId!,
          car_id: finalVehicleId!,
          transport: transport,
          scheduled_date: scheduledDate || null,
          notes: conditionNotes || null,
          total_price: totalPrice,
          status: "pending",
        })
        .select()
        .single();

      if (jobError) throw jobError;

      // 4. Create job zones with services and pricing
      if (services.length > 0) {
        const zonesMap = new Map<string, ServiceItem[]>();
        services.forEach((s) => {
          if (!zonesMap.has(s.zoneId)) {
            zonesMap.set(s.zoneId, []);
          }
          zonesMap.get(s.zoneId)!.push(s);
        });

        const zoneInserts = Array.from(zonesMap.entries()).map(([zoneId, zoneServices]) => ({
          job_id: job.id,
          zone_name: zoneServices[0].zoneName,
          zone_type: vehicleData.vehicle_type,
          services: zoneServices.map((s) => s.service),
          price: zoneServices.reduce((sum, s) => sum + s.price, 0),
          notes: zoneServices.map((s) => s.notes).filter(Boolean).join("; ") || null,
        }));

        const { error: zonesError } = await supabase.from("job_zones").insert(zoneInserts);
        if (zonesError) throw zonesError;
      }

      toast({
        title: "Job created successfully!",
        description: `Job for ${customerData.name}'s ${vehicleData.make} ${vehicleData.model} has been created.`,
      });

      onComplete(job.id);
    } catch (error: any) {
      console.error("Error creating job:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Could not create job",
      });
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: // Customer
        return customerData.name && customerData.phone;
      case 1: // Vehicle
        return vehicleData.make && vehicleData.model;
      case 2: // Condition
        return true; // Optional
      case 3: // Services
        return services.length > 0;
      case 4: // Pricing
        return true;
      case 5: // Confirm
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Progress Steps */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;

              return (
                <div key={step.id} className="flex items-center">
                  <motion.div
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                      isActive
                        ? "bg-racing text-white"
                        : isCompleted
                        ? "bg-green-500/20 text-green-500"
                        : "bg-muted text-muted-foreground"
                    }`}
                    animate={{ scale: isActive ? 1.05 : 1 }}
                  >
                    {isCompleted ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Icon className="h-4 w-4" />
                    )}
                    <span className="text-sm font-medium hidden sm:block">{step.label}</span>
                  </motion.div>
                  {index < STEPS.length - 1 && (
                    <ChevronRight className="h-4 w-4 text-muted-foreground mx-2 hidden sm:block" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Step 0: Customer */}
            {currentStep === 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-racing" />
                    Customer Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Phone Search */}
                  <div className="space-y-2">
                    <Label>Mobile Number (Search)</Label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          +91
                        </span>
                        <Input
                          placeholder="Enter 10-digit mobile number"
                          value={phoneSearch}
                          onChange={(e) => setPhoneSearch(e.target.value.replace(/\D/g, "").slice(0, 10))}
                          className="pl-12"
                          maxLength={10}
                        />
                      </div>
                      <Button onClick={searchCustomer} disabled={phoneSearch.length < 10 || searching}>
                        {searching ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Search className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    {isExistingCustomer !== null && (
                      <Badge variant={isExistingCustomer ? "default" : "secondary"}>
                        {isExistingCustomer ? "Existing Customer" : "New Customer"}
                      </Badge>
                    )}
                  </div>

                  {/* Customer Details Form */}
                  {isExistingCustomer !== null && (
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Full Name *</Label>
                        <Input
                          placeholder="Customer name"
                          value={customerData.name}
                          onChange={(e) => setCustomerData({ ...customerData, name: e.target.value })}
                          disabled={isExistingCustomer}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input
                          type="email"
                          placeholder="email@example.com"
                          value={customerData.email}
                          onChange={(e) => setCustomerData({ ...customerData, email: e.target.value })}
                          disabled={isExistingCustomer}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>WhatsApp Number</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                            +91
                          </span>
                          <Input
                            placeholder="If different from mobile"
                            value={customerData.whatsapp_number}
                            onChange={(e) =>
                              setCustomerData({
                                ...customerData,
                                whatsapp_number: e.target.value.replace(/\D/g, "").slice(0, 10),
                              })
                            }
                            className="pl-12"
                            disabled={isExistingCustomer}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>GSTN (Optional)</Label>
                        <Input
                          placeholder="GST Number"
                          value={customerData.gstn}
                          onChange={(e) => setCustomerData({ ...customerData, gstn: e.target.value.toUpperCase() })}
                          disabled={isExistingCustomer}
                        />
                      </div>
                      <div className="space-y-2 sm:col-span-2">
                        <Label>Address</Label>
                        <Textarea
                          placeholder="Full address"
                          value={customerData.address}
                          onChange={(e) => setCustomerData({ ...customerData, address: e.target.value })}
                          disabled={isExistingCustomer}
                          rows={2}
                        />
                      </div>
                    </div>
                  )}

                  {/* Existing Vehicles for returning customer */}
                  {isExistingCustomer && existingVehicles.length > 0 && (
                    <div className="space-y-2">
                      <Label>Existing Vehicles</Label>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {existingVehicles.map((v) => (
                          <Button
                            key={v.id}
                            variant={vehicleId === v.id ? "default" : "outline"}
                            className="justify-start h-auto py-3"
                            onClick={() => {
                              setVehicleId(v.id);
                              setVehicleData({
                                vehicle_type: v.vehicle_type || "sedan",
                                make: v.make,
                                model: v.model,
                                year: v.year?.toString() || "",
                                color: v.color || "",
                                registration_number: v.registration_number || "",
                                mileage: v.mileage?.toString() || "",
                                condition_notes: v.condition_notes || "",
                              });
                            }}
                          >
                            <Car className="h-4 w-4 mr-2" />
                            <div className="text-left">
                              <p className="font-medium">
                                {v.make} {v.model} {v.year && `(${v.year})`}
                              </p>
                              <p className="text-xs opacity-70">{v.registration_number || "No reg."}</p>
                            </div>
                          </Button>
                        ))}
                        <Button
                          variant="outline"
                          className="justify-start h-auto py-3 border-dashed"
                          onClick={() => {
                            setVehicleId(null);
                            setVehicleData({
                              vehicle_type: "sedan",
                              make: "",
                              model: "",
                              year: "",
                              color: "",
                              registration_number: "",
                              mileage: "",
                              condition_notes: "",
                            });
                          }}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add New Vehicle
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Step 1: Vehicle */}
            {currentStep === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Car className="h-5 w-5 text-racing" />
                    Vehicle Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Vehicle Type Selection */}
                  <div className="space-y-2">
                    <Label>Vehicle Type *</Label>
                    <div className="flex gap-4">
                      {(["sedan", "suv", "bike"] as VehicleType[]).map((type) => (
                        <Button
                          key={type}
                          variant={vehicleData.vehicle_type === type ? "default" : "outline"}
                          onClick={() => setVehicleData({ ...vehicleData, vehicle_type: type })}
                          className="flex-1 capitalize"
                        >
                          {type === "bike" ? "Motorcycle" : type.toUpperCase()}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Vehicle Preview */}
                  <div className="border rounded-xl p-4 bg-muted/30">
                    <VehicleSilhouette
                      vehicleType={vehicleData.vehicle_type}
                      interactive={false}
                      vehicleColor={vehicleData.color || "hsl(220 14% 12%)"}
                    />
                  </div>

                  {/* Vehicle Details Form */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Make *</Label>
                      <Input
                        placeholder="e.g., Honda, BMW, Toyota"
                        value={vehicleData.make}
                        onChange={(e) => setVehicleData({ ...vehicleData, make: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Model *</Label>
                      <Input
                        placeholder="e.g., City, 3 Series, Camry"
                        value={vehicleData.model}
                        onChange={(e) => setVehicleData({ ...vehicleData, model: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Year</Label>
                      <Input
                        placeholder="e.g., 2023"
                        value={vehicleData.year}
                        onChange={(e) => setVehicleData({ ...vehicleData, year: e.target.value.replace(/\D/g, "").slice(0, 4) })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Color</Label>
                      <Input
                        placeholder="e.g., Red, Black, White"
                        value={vehicleData.color}
                        onChange={(e) => setVehicleData({ ...vehicleData, color: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Registration Number</Label>
                      <Input
                        placeholder="e.g., MH01AB1234"
                        value={vehicleData.registration_number}
                        onChange={(e) => setVehicleData({ ...vehicleData, registration_number: e.target.value.toUpperCase() })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Current Mileage (km)</Label>
                      <Input
                        placeholder="e.g., 25000"
                        value={vehicleData.mileage}
                        onChange={(e) => setVehicleData({ ...vehicleData, mileage: e.target.value.replace(/\D/g, "") })}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Condition */}
            {currentStep === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Camera className="h-5 w-5 text-racing" />
                    Vehicle Condition
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Vehicle Visual with zones */}
                  <div className="border rounded-xl p-4 bg-muted/30">
                    <p className="text-sm text-muted-foreground mb-2 text-center">
                      Tap on zones to mark existing damage or issues
                    </p>
                    <VehicleSilhouette
                      vehicleType={vehicleData.vehicle_type}
                      selectedZones={selectedZones}
                      onZoneClick={handleZoneClick}
                    />
                  </div>

                  {/* Selected zones list */}
                  {selectedZones.length > 0 && (
                    <div className="space-y-2">
                      <Label>Zones with Issues</Label>
                      <div className="flex flex-wrap gap-2">
                        {selectedZones.map((zoneId) => {
                          const zone = VEHICLE_ZONES[vehicleData.vehicle_type].find((z) => z.id === zoneId);
                          return (
                            <Badge key={zoneId} variant="secondary">
                              {zone?.name}
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Condition Notes */}
                  <div className="space-y-2">
                    <Label>Condition Notes</Label>
                    <Textarea
                      placeholder="Describe any existing damage, scratches, dents, etc."
                      value={conditionNotes}
                      onChange={(e) => setConditionNotes(e.target.value)}
                      rows={4}
                    />
                  </div>

                  {/* Voice Note Recording (placeholder) */}
                  <div className="space-y-2">
                    <Label>Voice Notes</Label>
                    <div className="flex items-center gap-4">
                      <Button
                        variant={isRecording ? "destructive" : "outline"}
                        onClick={() => setIsRecording(!isRecording)}
                      >
                        {isRecording ? (
                          <>
                            <MicOff className="h-4 w-4 mr-2" />
                            Stop Recording
                          </>
                        ) : (
                          <>
                            <Mic className="h-4 w-4 mr-2" />
                            Record Voice Note
                          </>
                        )}
                      </Button>
                      <span className="text-sm text-muted-foreground">
                        {voiceNotes.length} voice note{voiceNotes.length !== 1 ? "s" : ""} recorded
                      </span>
                    </div>
                  </div>

                  {/* Photo/Video Upload (placeholder) */}
                  <div className="space-y-2">
                    <Label>Photos & Videos</Label>
                    <div className="border-2 border-dashed rounded-lg p-8 text-center">
                      <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Drag & drop or click to upload before photos/videos
                      </p>
                      <Button variant="outline" className="mt-4">
                        <Camera className="h-4 w-4 mr-2" />
                        Upload Media
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Services */}
            {currentStep === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wrench className="h-5 w-5 text-racing" />
                    Select Services
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <p className="text-sm text-muted-foreground">
                    Tap on vehicle zones to add services for each part
                  </p>

                  {/* Vehicle with selectable zones */}
                  <div className="border rounded-xl p-4 bg-muted/30">
                    <VehicleSilhouette
                      vehicleType={vehicleData.vehicle_type}
                      selectedZones={services.map((s) => s.zoneId)}
                      onZoneClick={(zoneId) => {
                        const zone = VEHICLE_ZONES[vehicleData.vehicle_type].find((z) => z.id === zoneId);
                        if (zone) {
                          // Add a default service - user can customize
                          const existingServices = services.filter((s) => s.zoneId === zoneId);
                          if (existingServices.length === 0) {
                            addService(zoneId, zone.name, "Detailing", 500);
                          }
                        }
                      }}
                    />
                  </div>

                  {/* Quick Add Services */}
                  <div className="space-y-2">
                    <Label>Quick Add Services</Label>
                    <div className="flex flex-wrap gap-2">
                      {["Full Wash", "Polish", "Ceramic Coating", "PPF", "Vinyl Wrap", "Interior Clean", "Engine Wash"].map(
                        (svc) => (
                          <Button
                            key={svc}
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              // Add to all selected zones or first zone
                              const targetZone = VEHICLE_ZONES[vehicleData.vehicle_type][0];
                              addService(targetZone.id, targetZone.name, svc, 1000);
                            }}
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            {svc}
                          </Button>
                        )
                      )}
                    </div>
                  </div>

                  {/* Services List */}
                  {services.length > 0 && (
                    <div className="space-y-2">
                      <Label>Added Services ({services.length})</Label>
                      <div className="divide-y border rounded-lg">
                        {services.map((service, index) => (
                          <div key={index} className="flex items-center justify-between p-3">
                            <div>
                              <p className="font-medium">{service.service}</p>
                              <p className="text-sm text-muted-foreground">{service.zoneName}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                value={service.price}
                                onChange={(e) => {
                                  const newServices = [...services];
                                  newServices[index].price = parseInt(e.target.value) || 0;
                                  setServices(newServices);
                                }}
                                className="w-24 text-right"
                              />
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeService(index)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Step 4: Pricing & Transport */}
            {currentStep === 4 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-racing" />
                    Pricing & Transport
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Price Summary */}
                  <div className="bg-muted/50 rounded-lg p-4">
                    <div className="space-y-2">
                      {services.map((service, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span>
                            {service.service} ({service.zoneName})
                          </span>
                          <span>₹{service.price.toLocaleString()}</span>
                        </div>
                      ))}
                      <div className="border-t pt-2 mt-2 flex justify-between font-bold text-lg">
                        <span>Total</span>
                        <span className="text-racing">₹{totalPrice.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Transport Options */}
                  <div className="space-y-2">
                    <Label>Pickup / Drop Service</Label>
                    <Select value={transport} onValueChange={(v: any) => setTransport(v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Customer will bring/pick vehicle</SelectItem>
                        <SelectItem value="pickup">Pickup only</SelectItem>
                        <SelectItem value="drop">Drop only</SelectItem>
                        <SelectItem value="both">Both pickup and drop</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Scheduled Date */}
                  <div className="space-y-2">
                    <Label>Scheduled Date</Label>
                    <Input
                      type="date"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                    />
                  </div>

                  {/* GST Info */}
                  {customerData.gstn && (
                    <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                      <p className="text-sm font-medium text-green-600">
                        GST Invoice will be generated
                      </p>
                      <p className="text-xs text-muted-foreground">GSTN: {customerData.gstn}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Step 5: Confirmation */}
            {currentStep === 5 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    Review & Confirm
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Summary Grid */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    {/* Customer Summary */}
                    <div className="border rounded-lg p-4">
                      <h3 className="font-semibold mb-2 flex items-center gap-2">
                        <User className="h-4 w-4" /> Customer
                      </h3>
                      <p className="font-medium">{customerData.name}</p>
                      <p className="text-sm text-muted-foreground">{customerData.phone}</p>
                      {customerData.email && (
                        <p className="text-sm text-muted-foreground">{customerData.email}</p>
                      )}
                    </div>

                    {/* Vehicle Summary */}
                    <div className="border rounded-lg p-4">
                      <h3 className="font-semibold mb-2 flex items-center gap-2">
                        <Car className="h-4 w-4" /> Vehicle
                      </h3>
                      <p className="font-medium">
                        {vehicleData.make} {vehicleData.model} {vehicleData.year && `(${vehicleData.year})`}
                      </p>
                      <p className="text-sm text-muted-foreground capitalize">
                        {vehicleData.vehicle_type} • {vehicleData.color || "N/A"}
                      </p>
                      {vehicleData.registration_number && (
                        <p className="text-sm text-muted-foreground">{vehicleData.registration_number}</p>
                      )}
                    </div>
                  </div>

                  {/* Services Summary */}
                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <Wrench className="h-4 w-4" /> Services ({services.length})
                    </h3>
                    <div className="space-y-1">
                      {services.map((s, i) => (
                        <div key={i} className="flex justify-between text-sm">
                          <span>
                            {s.service} - {s.zoneName}
                          </span>
                          <span>₹{s.price.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                    <div className="border-t mt-2 pt-2 flex justify-between font-bold">
                      <span>Total Amount</span>
                      <span className="text-racing">₹{totalPrice.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Transport & Schedule */}
                  <div className="flex gap-4">
                    {transport !== "none" && (
                      <Badge variant="secondary" className="capitalize">
                        {transport === "both" ? "Pickup & Drop" : transport}
                      </Badge>
                    )}
                    {scheduledDate && (
                      <Badge variant="outline">
                        Scheduled: {new Date(scheduledDate).toLocaleDateString()}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={() => {
              if (currentStep === 0) {
                onCancel();
              } else {
                setCurrentStep((prev) => prev - 1);
              }
            }}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            {currentStep === 0 ? "Cancel" : "Back"}
          </Button>

          <Button
            onClick={() => {
              if (currentStep === STEPS.length - 1) {
                handleSubmit();
              } else {
                setCurrentStep((prev) => prev + 1);
              }
            }}
            disabled={!canProceed() || loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : currentStep === STEPS.length - 1 ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Create Job
              </>
            ) : (
              <>
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
