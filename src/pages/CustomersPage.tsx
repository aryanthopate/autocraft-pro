import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, Search, Phone, Mail, MoreHorizontal, Car, MapPin, Edit2, Trash2 } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CustomerDetailDialog } from "@/components/customers/CustomerDetailDialog";

interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  address: string | null;
  notes: string | null;
  created_at: string;
  car_count?: number;
}

export default function CustomersPage() {
  const navigate = useNavigate();
  const { studio, isOwner } = useAuth();
  const { toast } = useToast();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState({
    name: "", phone: "", email: "", address: "", notes: "",
  });

  useEffect(() => {
    if (studio?.id) fetchCustomers();
  }, [studio?.id]);

  const fetchCustomers = async () => {
    if (!studio?.id) return;
    try {
      const { data, error } = await supabase
        .from("customers")
        .select("*, cars(count)")
        .eq("studio_id", studio.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      const customersWithCount = (data || []).map((c: any) => ({
        ...c,
        car_count: c.cars?.[0]?.count || 0,
      }));
      setCustomers(customersWithCount);
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Could not load customers." });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studio?.id) return;
    try {
      const { error } = await supabase.from("customers").insert({
        studio_id: studio.id,
        name: formData.name,
        phone: formData.phone,
        email: formData.email || null,
        address: formData.address || null,
        notes: formData.notes || null,
      });
      if (error) {
        if (error.code === "23505") {
          toast({ variant: "destructive", title: "Customer exists", description: "A customer with this phone number already exists." });
          return;
        }
        throw error;
      }
      toast({ title: "Customer created", description: "New customer has been added." });
      setFormData({ name: "", phone: "", email: "", address: "", notes: "" });
      setIsDialogOpen(false);
      fetchCustomers();
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Could not create customer." });
    }
  };

  const handleDelete = async (id: string) => {
    if (!isOwner) return;
    try {
      const { error } = await supabase.from("customers").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Customer deleted" });
      fetchCustomers();
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Could not delete customer. They may have linked vehicles or jobs." });
    }
  };

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery) ||
      c.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold">Customers</h1>
            <p className="text-muted-foreground mt-1">
              {customers.length} registered customer{customers.length !== 1 ? "s" : ""}
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />Add Customer</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add New Customer</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone *</Label>
                  <Input id="phone" type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input id="address" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
                </div>
                <div className="flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                  <Button type="submit">Create Customer</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </motion.div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by name, phone, or email..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
        </div>

        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse"><CardContent className="pt-6"><div className="h-20 bg-muted rounded" /></CardContent></Card>
            ))}
          </div>
        ) : filteredCustomers.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Phone className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
              <h3 className="font-semibold mb-1">{searchQuery ? "No results" : "No customers yet"}</h3>
              <p className="text-sm text-muted-foreground">{searchQuery ? "Try a different search" : "Add your first customer to get started"}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredCustomers.map((customer, index) => (
              <motion.div key={customer.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: index * 0.03 }}>
                <Card className="hover:border-primary/40 transition-colors cursor-pointer group"
                  onClick={() => { setSelectedCustomer(customer); setDetailOpen(true); }}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-bold text-primary">{customer.name.charAt(0).toUpperCase()}</span>
                        </div>
                        <div>
                          <p className="font-semibold">{customer.name}</p>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Car className="h-3 w-3" />
                            <span>{customer.car_count} vehicle{customer.car_count !== 1 ? "s" : ""}</span>
                          </div>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setSelectedCustomer(customer); setDetailOpen(true); }}>
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigate("/dashboard/vehicles"); }}>
                            Add Vehicle
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigate("/dashboard/jobs/new"); }}>
                            Create Job
                          </DropdownMenuItem>
                          {isOwner && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive" onClick={(e) => { e.stopPropagation(); handleDelete(customer.id); }}>
                                <Trash2 className="h-4 w-4 mr-2" />Delete
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="mt-3 space-y-1.5">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-3.5 w-3.5" /><span className="font-mono text-xs">{customer.phone}</span>
                      </div>
                      {customer.email && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Mail className="h-3.5 w-3.5" /><span className="truncate text-xs">{customer.email}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {selectedCustomer && studio?.id && (
          <CustomerDetailDialog
            open={detailOpen}
            onOpenChange={setDetailOpen}
            customerId={selectedCustomer.id}
            customerName={selectedCustomer.name}
            studioId={studio.id}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
