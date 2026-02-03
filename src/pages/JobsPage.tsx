import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Plus, 
  Search, 
  ClipboardList, 
  Calendar,
  MoreHorizontal,
  Car,
  User,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Badge } from "@/components/ui/badge";

interface Job {
  id: string;
  status: string;
  transport: string;
  scheduled_date: string | null;
  total_price: number | null;
  notes: string | null;
  customer_view_token: string;
  created_at: string;
  customer?: {
    name: string;
    phone: string;
  };
  car?: {
    make: string;
    model: string;
    year: number | null;
    color: string | null;
  };
}

interface Customer {
  id: string;
  name: string;
  phone: string;
}

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number | null;
  customer_id: string;
}

export default function JobsPage() {
  const navigate = useNavigate();
  const { studio, profile } = useAuth();
  const { toast } = useToast();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    customer_id: "",
    car_id: "",
    transport: "none",
    scheduled_date: "",
    notes: "",
  });

  useEffect(() => {
    if (studio?.id) {
      fetchData();
    }
  }, [studio?.id]);

  const fetchData = async () => {
    if (!studio?.id) return;

    try {
      const [jobsRes, customersRes, vehiclesRes] = await Promise.all([
        supabase
          .from("jobs")
          .select("*, customers(name, phone), cars(make, model, year, color)")
          .eq("studio_id", studio.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("customers")
          .select("id, name, phone")
          .eq("studio_id", studio.id)
          .order("name"),
        supabase
          .from("cars")
          .select("id, make, model, year, customer_id")
          .eq("studio_id", studio.id),
      ]);

      if (jobsRes.error) throw jobsRes.error;
      if (customersRes.error) throw customersRes.error;
      if (vehiclesRes.error) throw vehiclesRes.error;

      const jobsWithRelations = (jobsRes.data || []).map((j: any) => ({
        ...j,
        customer: j.customers,
        car: j.cars,
      }));

      setJobs(jobsWithRelations);
      setCustomers(customersRes.data || []);
      setVehicles(vehiclesRes.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not load jobs.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!studio?.id) return;

    try {
      const { error } = await supabase.from("jobs").insert({
        studio_id: studio.id,
        customer_id: formData.customer_id,
        car_id: formData.car_id,
        transport: formData.transport as any,
        scheduled_date: formData.scheduled_date || null,
        notes: formData.notes || null,
        status: "pending" as any,
      } as any);

      if (error) throw error;

      toast({
        title: "Job created",
        description: "New job has been created successfully.",
      });

      setFormData({
        customer_id: "",
        car_id: "",
        transport: "none",
        scheduled_date: "",
        notes: "",
      });
      setIsDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error("Error creating job:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not create job.",
      });
    }
  };

  const customerVehicles = vehicles.filter(
    (v) => v.customer_id === formData.customer_id
  );

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { class: string; icon: any }> = {
      pending: { class: "badge-pending", icon: Clock },
      scheduled: { class: "bg-blue-500/15 text-blue-500 border-blue-500/30", icon: Calendar },
      in_progress: { class: "badge-active", icon: AlertCircle },
      awaiting_review: { class: "bg-purple-500/15 text-purple-500 border-purple-500/30", icon: Clock },
      completed: { class: "badge-completed", icon: CheckCircle2 },
      cancelled: { class: "bg-destructive/15 text-destructive border-destructive/30", icon: AlertCircle },
    };
    const variant = variants[status] || variants.pending;
    const Icon = variant.icon;
    return (
      <Badge variant="outline" className={variant.class}>
        <Icon className="h-3 w-3 mr-1" />
        {status.replace("_", " ")}
      </Badge>
    );
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.customer?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.car?.make.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.car?.model.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || job.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
            <h1 className="font-display text-3xl font-bold">Jobs</h1>
            <p className="text-muted-foreground mt-1">
              Manage detailing jobs and work orders
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => navigate("/dashboard/jobs/new")}>
                <Plus className="h-4 w-4 mr-2" />
                Create Job
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Create New Job</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Customer *</Label>
                  <Select
                    value={formData.customer_id}
                    onValueChange={(value) =>
                      setFormData({ ...formData, customer_id: value, car_id: "" })
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

                <div className="space-y-2">
                  <Label>Vehicle *</Label>
                  <Select
                    value={formData.car_id}
                    onValueChange={(value) =>
                      setFormData({ ...formData, car_id: value })
                    }
                    disabled={!formData.customer_id}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a vehicle" />
                    </SelectTrigger>
                    <SelectContent>
                      {customerVehicles.map((vehicle) => (
                        <SelectItem key={vehicle.id} value={vehicle.id}>
                          {vehicle.make} {vehicle.model}{" "}
                          {vehicle.year && `(${vehicle.year})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formData.customer_id && customerVehicles.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      This customer has no vehicles. Add one first.
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Pickup/Drop</Label>
                    <Select
                      value={formData.transport}
                      onValueChange={(value) =>
                        setFormData({ ...formData, transport: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="pickup">Pickup Only</SelectItem>
                        <SelectItem value="drop">Drop Only</SelectItem>
                        <SelectItem value="both">Both</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Scheduled Date</Label>
                    <Input
                      type="date"
                      value={formData.scheduled_date}
                      onChange={(e) =>
                        setFormData({ ...formData, scheduled_date: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Textarea
                    placeholder="Additional notes about this job..."
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    rows={3}
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={!formData.car_id}>
                    Create Job
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </motion.div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search jobs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="awaiting_review">Awaiting Review</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Jobs List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="pt-6">
                  <div className="h-20 bg-muted rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredJobs.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <ClipboardList className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="font-semibold mb-1">No jobs yet</h3>
              <p className="text-sm text-muted-foreground">
                {vehicles.length === 0
                  ? "Add customers and vehicles first"
                  : "Create your first job to get started"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredJobs.map((job, index) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card className="hover:border-primary/50 transition-colors">
                  <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Car className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium">
                              {job.car?.make} {job.car?.model}
                              {job.car?.year && ` (${job.car.year})`}
                            </p>
                            {getStatusBadge(job.status)}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {job.customer?.name}
                            </span>
                            {job.scheduled_date && (
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(job.scheduled_date).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => navigate(`/dashboard/jobs/${job.id}`)}
                        >
                          View Details
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Edit Job</DropdownMenuItem>
                            <DropdownMenuItem>Add Zones</DropdownMenuItem>
                            <DropdownMenuItem>Upload Media</DropdownMenuItem>
                            <DropdownMenuItem>Generate Invoice</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
