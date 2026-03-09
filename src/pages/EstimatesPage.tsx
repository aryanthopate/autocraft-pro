import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, FileText, Send, CheckCircle, XCircle, ArrowRight, Trash2, Loader2, Search, Eye } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Estimate {
  id: string;
  customer_id: string;
  car_id: string;
  status: string;
  total_amount: number;
  gst_percentage: number;
  gst_amount: number;
  grand_total: number;
  notes: string | null;
  valid_until: string | null;
  created_at: string;
  customers?: { name: string; phone: string };
  cars?: { make: string; model: string; registration_number: string | null };
}

interface EstimateItem {
  id?: string;
  description: string;
  zone_name: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export default function EstimatesPage() {
  const { studio, profile } = useAuth();
  const { toast } = useToast();
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showDetail, setShowDetail] = useState<Estimate | null>(null);
  const [detailItems, setDetailItems] = useState<EstimateItem[]>([]);
  const [search, setSearch] = useState("");
  const [customers, setCustomers] = useState<any[]>([]);
  const [cars, setCars] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  // Form state
  const [form, setForm] = useState({
    customer_id: "",
    car_id: "",
    notes: "",
    valid_until: "",
    gst_percentage: 18,
  });
  const [items, setItems] = useState<EstimateItem[]>([
    { description: "", zone_name: "", quantity: 1, unit_price: 0, total: 0 },
  ]);

  useEffect(() => {
    if (studio?.id) {
      fetchEstimates();
      fetchCustomers();
    }
  }, [studio?.id]);

  const fetchEstimates = async () => {
    const { data } = await supabase
      .from("estimates")
      .select("*, customers(name, phone), cars(make, model, registration_number)")
      .eq("studio_id", studio!.id)
      .order("created_at", { ascending: false });
    setEstimates((data as any) || []);
    setLoading(false);
  };

  const fetchCustomers = async () => {
    const { data } = await supabase.from("customers").select("id, name, phone").eq("studio_id", studio!.id);
    setCustomers(data || []);
  };

  const fetchCarsForCustomer = async (customerId: string) => {
    const { data } = await supabase.from("cars").select("id, make, model, registration_number").eq("customer_id", customerId);
    setCars(data || []);
  };

  const addItem = () => setItems([...items, { description: "", zone_name: "", quantity: 1, unit_price: 0, total: 0 }]);
  const removeItem = (i: number) => setItems(items.filter((_, idx) => idx !== i));

  const updateItem = (i: number, field: string, value: any) => {
    const updated = [...items];
    (updated[i] as any)[field] = value;
    updated[i].total = updated[i].quantity * updated[i].unit_price;
    setItems(updated);
  };

  const subtotal = items.reduce((s, i) => s + i.total, 0);
  const gstAmount = subtotal * (form.gst_percentage / 100);
  const grandTotal = subtotal + gstAmount;

  const saveEstimate = async () => {
    if (!form.customer_id || !form.car_id || items.length === 0) {
      toast({ variant: "destructive", title: "Missing fields", description: "Select customer, vehicle, and add at least one item." });
      return;
    }
    setSaving(true);
    try {
      const { data: est, error } = await supabase.from("estimates").insert({
        studio_id: studio!.id,
        customer_id: form.customer_id,
        car_id: form.car_id,
        notes: form.notes || null,
        valid_until: form.valid_until || null,
        gst_percentage: form.gst_percentage,
        total_amount: subtotal,
        gst_amount: gstAmount,
        grand_total: grandTotal,
        created_by: profile?.id,
        status: "draft",
      }).select().single();

      if (error) throw error;

      const itemsToInsert = items.filter(i => i.description).map(i => ({
        estimate_id: est.id,
        description: i.description,
        zone_name: i.zone_name || null,
        quantity: i.quantity,
        unit_price: i.unit_price,
        total: i.total,
      }));

      if (itemsToInsert.length > 0) {
        await supabase.from("estimate_items").insert(itemsToInsert);
      }

      // Log activity
      await supabase.from("activity_logs").insert({
        studio_id: studio!.id,
        user_id: profile?.id,
        user_name: profile?.full_name,
        action: "created",
        entity_type: "estimate",
        entity_id: est.id,
        details: { grand_total: grandTotal },
      });

      toast({ title: "Estimate created" });
      setShowCreate(false);
      setForm({ customer_id: "", car_id: "", notes: "", valid_until: "", gst_percentage: 18 });
      setItems([{ description: "", zone_name: "", quantity: 1, unit_price: 0, total: 0 }]);
      fetchEstimates();
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: e.message });
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("estimates").update({ status }).eq("id", id);
    await supabase.from("activity_logs").insert({
      studio_id: studio!.id, user_id: profile?.id, user_name: profile?.full_name,
      action: status === "sent" ? "sent" : status === "approved" ? "approved" : "rejected",
      entity_type: "estimate", entity_id: id,
    });
    toast({ title: `Estimate ${status}` });
    fetchEstimates();
  };

  const convertToJob = async (est: Estimate) => {
    try {
      const { data: job, error } = await supabase.from("jobs").insert({
        studio_id: studio!.id,
        customer_id: est.customer_id,
        car_id: est.car_id,
        total_price: est.grand_total,
        notes: `Converted from estimate. ${est.notes || ""}`,
        status: "pending",
        transport: "none",
      }).select().single();

      if (error) throw error;

      await supabase.from("estimates").update({ status: "converted", converted_job_id: job.id }).eq("id", est.id);

      await supabase.from("activity_logs").insert({
        studio_id: studio!.id, user_id: profile?.id, user_name: profile?.full_name,
        action: "converted_to_job", entity_type: "estimate", entity_id: est.id,
        details: { job_id: job.id },
      });

      toast({ title: "Estimate converted to job!" });
      fetchEstimates();
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: e.message });
    }
  };

  const viewDetail = async (est: Estimate) => {
    setShowDetail(est);
    const { data } = await supabase.from("estimate_items").select("*").eq("estimate_id", est.id);
    setDetailItems((data as any) || []);
  };

  const statusColor = (s: string) => {
    switch (s) {
      case "draft": return "secondary";
      case "sent": return "default";
      case "approved": return "default";
      case "rejected": return "destructive";
      case "converted": return "default";
      default: return "secondary";
    }
  };

  const filtered = estimates.filter(e =>
    (e.customers?.name || "").toLowerCase().includes(search.toLowerCase()) ||
    (e.cars?.make || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Estimates</h1>
            <p className="text-muted-foreground mt-1">Create and manage quotations for customers</p>
          </div>
          <Button onClick={() => setShowCreate(true)}>
            <Plus className="h-4 w-4 mr-2" /> New Estimate
          </Button>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total", value: estimates.length, color: "text-foreground" },
            { label: "Draft", value: estimates.filter(e => e.status === "draft").length, color: "text-muted-foreground" },
            { label: "Sent", value: estimates.filter(e => e.status === "sent").length, color: "text-primary" },
            { label: "Approved", value: estimates.filter(e => e.status === "approved").length, color: "text-success" },
          ].map(s => (
            <Card key={s.label}>
              <CardContent className="pt-4 pb-3 text-center">
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search estimates..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-8"><Loader2 className="h-5 w-5 animate-spin mx-auto" /></TableCell></TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No estimates yet</TableCell></TableRow>
                ) : filtered.map(est => (
                  <TableRow key={est.id}>
                    <TableCell className="font-medium">{est.customers?.name}</TableCell>
                    <TableCell>{est.cars?.make} {est.cars?.model}</TableCell>
                    <TableCell>₹{est.grand_total?.toLocaleString("en-IN")}</TableCell>
                    <TableCell><Badge variant={statusColor(est.status)} className="capitalize">{est.status}</Badge></TableCell>
                    <TableCell className="text-muted-foreground text-sm">{new Date(est.created_at).toLocaleDateString("en-IN")}</TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button size="sm" variant="ghost" onClick={() => viewDetail(est)}><Eye className="h-4 w-4" /></Button>
                      {est.status === "draft" && <Button size="sm" variant="ghost" onClick={() => updateStatus(est.id, "sent")}><Send className="h-4 w-4" /></Button>}
                      {est.status === "sent" && (
                        <>
                          <Button size="sm" variant="ghost" className="text-success" onClick={() => updateStatus(est.id, "approved")}><CheckCircle className="h-4 w-4" /></Button>
                          <Button size="sm" variant="ghost" className="text-destructive" onClick={() => updateStatus(est.id, "rejected")}><XCircle className="h-4 w-4" /></Button>
                        </>
                      )}
                      {est.status === "approved" && <Button size="sm" variant="outline" onClick={() => convertToJob(est)}><ArrowRight className="h-4 w-4 mr-1" />Convert</Button>}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Create Dialog */}
        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Estimate</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Customer</Label>
                  <Select value={form.customer_id} onValueChange={v => { setForm({...form, customer_id: v, car_id: ""}); fetchCarsForCustomer(v); }}>
                    <SelectTrigger><SelectValue placeholder="Select customer" /></SelectTrigger>
                    <SelectContent>{customers.map(c => <SelectItem key={c.id} value={c.id}>{c.name} - {c.phone}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Vehicle</Label>
                  <Select value={form.car_id} onValueChange={v => setForm({...form, car_id: v})}>
                    <SelectTrigger><SelectValue placeholder="Select vehicle" /></SelectTrigger>
                    <SelectContent>{cars.map(c => <SelectItem key={c.id} value={c.id}>{c.make} {c.model} {c.registration_number ? `(${c.registration_number})` : ""}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>GST %</Label>
                  <Input type="number" value={form.gst_percentage} onChange={e => setForm({...form, gst_percentage: Number(e.target.value)})} />
                </div>
                <div className="space-y-2">
                  <Label>Valid Until</Label>
                  <Input type="date" value={form.valid_until} onChange={e => setForm({...form, valid_until: e.target.value})} />
                </div>
              </div>

              {/* Line items */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-base font-semibold">Line Items</Label>
                  <Button size="sm" variant="outline" onClick={addItem}><Plus className="h-3 w-3 mr-1" /> Add</Button>
                </div>
                <div className="space-y-2">
                  {items.map((item, i) => (
                    <div key={i} className="grid grid-cols-12 gap-2 items-end">
                      <div className="col-span-4">
                        <Input placeholder="Service description" value={item.description} onChange={e => updateItem(i, "description", e.target.value)} />
                      </div>
                      <div className="col-span-2">
                        <Input placeholder="Zone" value={item.zone_name} onChange={e => updateItem(i, "zone_name", e.target.value)} />
                      </div>
                      <div className="col-span-2">
                        <Input type="number" placeholder="Qty" value={item.quantity} onChange={e => updateItem(i, "quantity", Number(e.target.value))} />
                      </div>
                      <div className="col-span-2">
                        <Input type="number" placeholder="Price" value={item.unit_price} onChange={e => updateItem(i, "unit_price", Number(e.target.value))} />
                      </div>
                      <div className="col-span-1 text-sm font-medium text-right">₹{item.total}</div>
                      <div className="col-span-1">
                        {items.length > 1 && <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => removeItem(i)}><Trash2 className="h-3 w-3" /></Button>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="bg-muted/50 rounded-lg p-4 space-y-1 text-sm">
                <div className="flex justify-between"><span>Subtotal</span><span>₹{subtotal.toLocaleString("en-IN")}</span></div>
                <div className="flex justify-between"><span>GST ({form.gst_percentage}%)</span><span>₹{gstAmount.toLocaleString("en-IN")}</span></div>
                <div className="flex justify-between font-bold text-base border-t border-border pt-1 mt-1"><span>Grand Total</span><span>₹{grandTotal.toLocaleString("en-IN")}</span></div>
              </div>

              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} placeholder="Additional notes..." />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
              <Button onClick={saveEstimate} disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />} Create Estimate
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Detail Dialog */}
        <Dialog open={!!showDetail} onOpenChange={() => setShowDetail(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Estimate Details</DialogTitle>
            </DialogHeader>
            {showDetail && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-muted-foreground">Customer:</span> <span className="font-medium">{showDetail.customers?.name}</span></div>
                  <div><span className="text-muted-foreground">Vehicle:</span> <span className="font-medium">{showDetail.cars?.make} {showDetail.cars?.model}</span></div>
                  <div><span className="text-muted-foreground">Status:</span> <Badge variant={statusColor(showDetail.status)} className="capitalize ml-1">{showDetail.status}</Badge></div>
                  <div><span className="text-muted-foreground">Date:</span> <span className="font-medium">{new Date(showDetail.created_at).toLocaleDateString("en-IN")}</span></div>
                </div>
                <div className="space-y-1">
                  {detailItems.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm py-1 border-b border-border last:border-0">
                      <span>{item.description} {item.zone_name && <span className="text-muted-foreground">({item.zone_name})</span>} × {item.quantity}</span>
                      <span className="font-medium">₹{item.total.toLocaleString("en-IN")}</span>
                    </div>
                  ))}
                </div>
                <div className="bg-muted/50 rounded-lg p-3 text-sm space-y-1">
                  <div className="flex justify-between"><span>Subtotal</span><span>₹{showDetail.total_amount?.toLocaleString("en-IN")}</span></div>
                  <div className="flex justify-between"><span>GST ({showDetail.gst_percentage}%)</span><span>₹{showDetail.gst_amount?.toLocaleString("en-IN")}</span></div>
                  <div className="flex justify-between font-bold text-base border-t pt-1 mt-1"><span>Grand Total</span><span>₹{showDetail.grand_total?.toLocaleString("en-IN")}</span></div>
                </div>
                {showDetail.notes && <p className="text-sm text-muted-foreground">{showDetail.notes}</p>}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
