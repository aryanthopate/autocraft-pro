import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, Search, Car, Calendar, MoreHorizontal, User, History, ClipboardList } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { VehicleServiceHistory } from "@/components/vehicles/VehicleServiceHistory";

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number | null;
  color: string | null;
  license_plate: string | null;
  customer_id: string;
  customer?: {
    name: string;
    phone: string;
  };
  created_at: string;
}

interface Customer {
  id: string;
  name: string;
  phone: string;
}

export default function VehiclesPage() {
  const navigate = useNavigate();
  const { studio } = useAuth();
  const { toast } = useToast();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [formData, setFormData] = useState({
    customer_id: "",
    make: "",
    model: "",
    year: "",
    color: "",
    license_plate: "",
  });

  useEffect(() => {
    if (studio?.id) {
      fetchData();
    }
  }, [studio?.id]);

  const fetchData = async () => {
    if (!studio?.id) return;

    try {
      const [vehiclesRes, customersRes] = await Promise.all([
        supabase
          .from("cars")
          .select("*, customers(name, phone)")
          .eq("studio_id", studio.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("customers")
          .select("id, name, phone")
          .eq("studio_id", studio.id)
          .order("name"),
      ]);

      if (vehiclesRes.error) throw vehiclesRes.error;
      if (customersRes.error) throw customersRes.error;

      const vehiclesWithCustomer = (vehiclesRes.data || []).map((v: any) => ({
        ...v,
        customer: v.customers,
      }));

      setVehicles(vehiclesWithCustomer);
      setCustomers(customersRes.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not load vehicles.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!studio?.id) return;

    try {
      const { error } = await supabase.from("cars").insert({
        studio_id: studio.id,
        customer_id: formData.customer_id,
        make: formData.make,
        model: formData.model,
        year: formData.year ? parseInt(formData.year) : null,
        color: formData.color || null,
        license_plate: formData.license_plate?.toUpperCase() || null,
        registration_number: formData.license_plate?.toUpperCase() || null,
      });

      if (error) throw error;

      toast({
        title: "Vehicle added",
        description: "New vehicle has been registered successfully.",
      });

      setFormData({
        customer_id: "",
        make: "",
        model: "",
        year: "",
        color: "",
        license_plate: "",
      });
      setIsDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error("Error creating vehicle:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not add vehicle.",
      });
    }
  };

  const filteredVehicles = vehicles.filter(
    (vehicle) =>
      vehicle.make.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.license_plate?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.customer?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 className="font-display text-3xl font-bold">Vehicles</h1>
            <p className="text-muted-foreground mt-1">
              Manage registered vehicles
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button disabled={customers.length === 0}>
                <Plus className="h-4 w-4 mr-2" />
                Add Vehicle
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Vehicle</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Customer *</Label>
                  <Select
                    value={formData.customer_id}
                    onValueChange={(value) =>
                      setFormData({ ...formData, customer_id: value })
                    }
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.name} ({customer.phone})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="make">Make *</Label>
                    <Input
                      id="make"
                      placeholder="Toyota"
                      value={formData.make}
                      onChange={(e) =>
                        setFormData({ ...formData, make: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="model">Model *</Label>
                    <Input
                      id="model"
                      placeholder="Camry"
                      value={formData.model}
                      onChange={(e) =>
                        setFormData({ ...formData, model: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="year">Year</Label>
                    <Input
                      id="year"
                      type="number"
                      placeholder="2023"
                      value={formData.year}
                      onChange={(e) =>
                        setFormData({ ...formData, year: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="color">Color</Label>
                    <Input
                      id="color"
                      placeholder="Black"
                      value={formData.color}
                      onChange={(e) =>
                        setFormData({ ...formData, color: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="license_plate">Registration Number</Label>
                  <Input
                    id="license_plate"
                    placeholder="MH 01 AB 1234"
                    value={formData.license_plate}
                    onChange={(e) =>
                      setFormData({ ...formData, license_plate: e.target.value.toUpperCase() })
                    }
                    className="uppercase font-mono"
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter vehicle registration number
                  </p>
                </div>
                <div className="flex justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Add Vehicle</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </motion.div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search vehicles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Vehicles Grid */}
        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="pt-6">
                  <div className="h-24 bg-muted rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredVehicles.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <Car className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="font-semibold mb-1">No vehicles yet</h3>
              <p className="text-sm text-muted-foreground">
                {customers.length === 0
                  ? "Add a customer first, then add their vehicles"
                  : "Add your first vehicle to get started"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredVehicles.map((vehicle, index) => (
              <motion.div
                key={vehicle.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card className="hover:border-primary/50 transition-colors">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Car className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">
                            {vehicle.make} {vehicle.model}
                          </p>
                          {vehicle.year && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              <span>{vehicle.year}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedVehicle(vehicle);
                              setHistoryOpen(true);
                            }}
                          >
                            <History className="h-4 w-4 mr-2" />
                            View History
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => navigate(`/dashboard/jobs?car=${vehicle.id}`)}
                          >
                            <ClipboardList className="h-4 w-4 mr-2" />
                            Create Job
                          </DropdownMenuItem>
                          <DropdownMenuItem>Edit Vehicle</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="mt-4 space-y-2">
                      {vehicle.color && (
                        <div className="flex items-center gap-2">
                          <div
                            className="h-4 w-4 rounded-full border border-border"
                            style={{
                              backgroundColor: vehicle.color.toLowerCase(),
                            }}
                          />
                          <span className="text-sm text-muted-foreground">
                            {vehicle.color}
                          </span>
                        </div>
                      )}
                      {vehicle.license_plate && (
                        <p className="text-sm font-mono bg-muted px-2 py-1 rounded inline-block uppercase">
                          {vehicle.license_plate}
                        </p>
                      )}
                      {vehicle.customer && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2 border-t border-border">
                          <User className="h-4 w-4" />
                          <span>{vehicle.customer.name}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Service History Sheet */}
        {selectedVehicle && (
          <VehicleServiceHistory
            open={historyOpen}
            onOpenChange={setHistoryOpen}
            vehicleId={selectedVehicle.id}
            vehicleInfo={{
              make: selectedVehicle.make,
              model: selectedVehicle.model,
              year: selectedVehicle.year,
              color: selectedVehicle.color,
              license_plate: selectedVehicle.license_plate,
            }}
            customerName={selectedVehicle.customer?.name || "Unknown"}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
