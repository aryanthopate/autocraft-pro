import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Building2, 
  Users, 
  Car, 
  ClipboardList, 
  Search, 
  Eye, 
  X,
  Shield,
  Plus,
  ChevronRight,
  TrendingUp,
  Calendar,
  Phone,
  Mail,
  MapPin,
  FileText
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";

interface Studio {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  gstin: string | null;
  join_key: string;
  created_at: string;
  owner_id: string;
}

interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  role: string;
  status: string;
  created_at: string;
}

interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  address: string | null;
}

interface Job {
  id: string;
  status: string;
  total_price: number | null;
  created_at: string;
  scheduled_date: string | null;
}

interface Car {
  id: string;
  make: string;
  model: string;
  year: number | null;
  color: string | null;
  registration_number: string | null;
}

export default function AdminPage() {
  const { toast } = useToast();
  const [studios, setStudios] = useState<Studio[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudio, setSelectedStudio] = useState<Studio | null>(null);
  const [studioDetails, setStudioDetails] = useState<{
    profiles: Profile[];
    customers: Customer[];
    jobs: Job[];
    cars: Car[];
  } | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    fetchStudios();
  }, []);

  const fetchStudios = async () => {
    try {
      const { data, error } = await supabase
        .from("studios")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setStudios(data || []);
    } catch (error: any) {
      console.error("Error fetching studios:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not load studios. Make sure you have admin access.",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStudioDetails = async (studioId: string) => {
    setLoadingDetails(true);
    try {
      const [profilesRes, customersRes, jobsRes, carsRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("studio_id", studioId),
        supabase.from("customers").select("*").eq("studio_id", studioId),
        supabase.from("jobs").select("*").eq("studio_id", studioId).order("created_at", { ascending: false }),
        supabase.from("cars").select("*").eq("studio_id", studioId),
      ]);

      setStudioDetails({
        profiles: (profilesRes.data || []) as Profile[],
        customers: (customersRes.data || []) as Customer[],
        jobs: (jobsRes.data || []) as unknown as Job[],
        cars: (carsRes.data || []) as Car[],
      });
    } catch (error) {
      console.error("Error fetching studio details:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not load studio details.",
      });
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleViewStudio = (studio: Studio) => {
    setSelectedStudio(studio);
    fetchStudioDetails(studio.id);
  };

  const filteredStudios = studios.filter((studio) =>
    studio.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    studio.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    studio.phone?.includes(searchQuery)
  );

  const stats = {
    totalStudios: studios.length,
    totalStaff: 0,
    totalJobs: 0,
    totalRevenue: 0,
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-racing text-white">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-display text-lg font-bold">Admin Panel</h1>
              <p className="text-xs text-muted-foreground">Platform Management</p>
            </div>
          </div>
          <Badge variant="outline" className="bg-racing/10 text-racing border-racing/30">
            Super Admin
          </Badge>
        </div>
      </header>

      <main className="container px-4 py-6 space-y-6">
        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="bg-gradient-to-br from-racing/10 to-racing/5 border-racing/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Vendors</p>
                  <p className="text-3xl font-bold">{stats.totalStudios}</p>
                </div>
                <Building2 className="h-10 w-10 text-racing/60" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Staff</p>
                  <p className="text-3xl font-bold">-</p>
                </div>
                <Users className="h-10 w-10 text-muted-foreground/40" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Jobs</p>
                  <p className="text-3xl font-bold">-</p>
                </div>
                <ClipboardList className="h-10 w-10 text-muted-foreground/40" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Platform Revenue</p>
                  <p className="text-3xl font-bold">-</p>
                </div>
                <TrendingUp className="h-10 w-10 text-muted-foreground/40" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Vendors Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Vendor Studios
                </CardTitle>
                <CardDescription>
                  Click on a vendor to view their complete data
                </CardDescription>
              </div>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Vendor
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Search */}
            <div className="relative max-w-md mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search vendors by name, email, phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Vendors Table */}
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin h-8 w-8 border-2 border-racing border-t-transparent rounded-full mx-auto mb-4" />
                <p className="text-muted-foreground">Loading vendors...</p>
              </div>
            ) : filteredStudios.length === 0 ? (
              <div className="text-center py-12">
                <Building2 className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
                <p className="font-medium">No vendors found</p>
                <p className="text-sm text-muted-foreground">
                  {searchQuery ? "Try a different search term" : "Vendors will appear here"}
                </p>
              </div>
            ) : (
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Vendor Name</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>GSTIN</TableHead>
                      <TableHead>Join Key</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudios.map((studio) => (
                      <TableRow 
                        key={studio.id} 
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleViewStudio(studio)}
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-racing/10 flex items-center justify-center">
                              <span className="font-bold text-racing">
                                {studio.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium">{studio.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {studio.address || "No address"}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {studio.email && (
                              <div className="flex items-center gap-1 text-sm">
                                <Mail className="h-3 w-3" />
                                {studio.email}
                              </div>
                            )}
                            {studio.phone && (
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Phone className="h-3 w-3" />
                                {studio.phone}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-mono text-xs">
                            {studio.gstin || "-"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-mono">
                            {studio.join_key}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {format(new Date(studio.created_at), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            View
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Studio Details Dialog */}
      <Dialog open={!!selectedStudio} onOpenChange={() => setSelectedStudio(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-racing/10 flex items-center justify-center">
                <Building2 className="h-5 w-5 text-racing" />
              </div>
              <div>
                <span>{selectedStudio?.name}</span>
                <p className="text-sm font-normal text-muted-foreground">
                  Vendor Details
                </p>
              </div>
            </DialogTitle>
          </DialogHeader>

          {loadingDetails ? (
            <div className="py-12 text-center">
              <div className="animate-spin h-8 w-8 border-2 border-racing border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-muted-foreground">Loading vendor data...</p>
            </div>
          ) : studioDetails && (
            <Tabs defaultValue="info" className="mt-4">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="info">Info</TabsTrigger>
                <TabsTrigger value="staff">
                  Staff ({studioDetails.profiles.length})
                </TabsTrigger>
                <TabsTrigger value="customers">
                  Customers ({studioDetails.customers.length})
                </TabsTrigger>
                <TabsTrigger value="vehicles">
                  Vehicles ({studioDetails.cars.length})
                </TabsTrigger>
                <TabsTrigger value="jobs">
                  Jobs ({studioDetails.jobs.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="info" className="mt-4 space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedStudio?.email || "No email"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedStudio?.phone || "No phone"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedStudio?.address || "No address"}</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span>GSTIN: {selectedStudio?.gstin || "Not provided"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>
                        Joined: {selectedStudio && format(new Date(selectedStudio.created_at), "MMMM d, yyyy")}
                      </span>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="staff" className="mt-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {studioDetails.profiles.map((profile) => (
                      <TableRow key={profile.id}>
                        <TableCell className="font-medium">{profile.full_name}</TableCell>
                        <TableCell>{profile.email}</TableCell>
                        <TableCell>
                          <Badge variant={profile.role === "owner" ? "default" : "secondary"}>
                            {profile.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={profile.status === "approved" ? "default" : "outline"}>
                            {profile.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>

              <TabsContent value="customers" className="mt-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Address</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {studioDetails.customers.map((customer) => (
                      <TableRow key={customer.id}>
                        <TableCell className="font-medium">{customer.name}</TableCell>
                        <TableCell>{customer.phone}</TableCell>
                        <TableCell>{customer.email || "-"}</TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {customer.address || "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>

              <TabsContent value="vehicles" className="mt-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Vehicle</TableHead>
                      <TableHead>Year</TableHead>
                      <TableHead>Color</TableHead>
                      <TableHead>Reg. Number</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {studioDetails.cars.map((car) => (
                      <TableRow key={car.id}>
                        <TableCell className="font-medium">
                          {car.make} {car.model}
                        </TableCell>
                        <TableCell>{car.year || "-"}</TableCell>
                        <TableCell>{car.color || "-"}</TableCell>
                        <TableCell className="font-mono uppercase">
                          {car.registration_number || "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>

              <TabsContent value="jobs" className="mt-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Status</TableHead>
                      <TableHead>Scheduled</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {studioDetails.jobs.map((job) => (
                      <TableRow key={job.id}>
                        <TableCell>
                          <Badge variant="outline">{job.status}</Badge>
                        </TableCell>
                        <TableCell>
                          {job.scheduled_date 
                            ? format(new Date(job.scheduled_date), "MMM d, yyyy")
                            : "-"
                          }
                        </TableCell>
                        <TableCell>
                          {job.total_price ? `₹${job.total_price.toLocaleString()}` : "-"}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {format(new Date(job.created_at), "MMM d, yyyy")}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
