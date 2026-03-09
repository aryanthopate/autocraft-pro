import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Package, AlertTriangle, ArrowDown, ArrowUp, Search, Loader2, Trash2, Edit } from "lucide-react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const CATEGORIES = ["PPF Film", "Ceramic Coating", "Vinyl Wrap", "Polish & Compound", "Adhesive & Tape", "Tools", "Accessories", "General"];

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  sku: string | null;
  quantity: number;
  unit: string;
  min_stock_level: number;
  cost_per_unit: number;
  supplier: string | null;
  notes: string | null;
}

interface InventoryTransaction {
  id: string;
  item_id: string;
  type: string;
  quantity: number;
  notes: string | null;
  created_at: string;
  performed_by: string | null;
  inventory_items?: { name: string };
  profiles?: { full_name: string };
}

export default function InventoryPage() {
  const { studio, profile } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [showStock, setShowStock] = useState<InventoryItem | null>(null);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [stockType, setStockType] = useState<"in" | "out">("in");
  const [stockQty, setStockQty] = useState(0);
  const [stockNotes, setStockNotes] = useState("");

  const [form, setForm] = useState({
    name: "", category: "General", sku: "", quantity: 0, unit: "pcs",
    min_stock_level: 5, cost_per_unit: 0, supplier: "", notes: "",
  });

  useEffect(() => {
    if (studio?.id) { fetchItems(); fetchTransactions(); }
  }, [studio?.id]);

  const fetchItems = async () => {
    const { data } = await supabase.from("inventory_items").select("*").eq("studio_id", studio!.id).order("name");
    setItems((data as any) || []);
    setLoading(false);
  };

  const fetchTransactions = async () => {
    const { data } = await supabase
      .from("inventory_transactions")
      .select("*, inventory_items(name), profiles(full_name)")
      .eq("studio_id", studio!.id)
      .order("created_at", { ascending: false })
      .limit(50);
    setTransactions((data as any) || []);
  };

  const saveItem = async () => {
    if (!form.name) { toast({ variant: "destructive", title: "Name required" }); return; }
    setSaving(true);
    try {
      await supabase.from("inventory_items").insert({
        studio_id: studio!.id, name: form.name, category: form.category,
        sku: form.sku || null, quantity: form.quantity, unit: form.unit,
        min_stock_level: form.min_stock_level, cost_per_unit: form.cost_per_unit,
        supplier: form.supplier || null, notes: form.notes || null,
      });

      await supabase.from("activity_logs").insert({
        studio_id: studio!.id, user_id: profile?.id, user_name: profile?.full_name,
        action: "added", entity_type: "inventory", details: { name: form.name },
      });

      toast({ title: "Item added" });
      setShowAdd(false);
      setForm({ name: "", category: "General", sku: "", quantity: 0, unit: "pcs", min_stock_level: 5, cost_per_unit: 0, supplier: "", notes: "" });
      fetchItems();
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: e.message });
    } finally { setSaving(false); }
  };

  const adjustStock = async () => {
    if (!showStock || stockQty <= 0) return;
    setSaving(true);
    try {
      const newQty = stockType === "in" ? showStock.quantity + stockQty : showStock.quantity - stockQty;

      await supabase.from("inventory_items").update({ quantity: Math.max(0, newQty) }).eq("id", showStock.id);

      await supabase.from("inventory_transactions").insert({
        item_id: showStock.id, studio_id: studio!.id, type: stockType === "in" ? "stock_in" : "stock_out",
        quantity: stockQty, notes: stockNotes || null, performed_by: profile?.id,
      });

      await supabase.from("activity_logs").insert({
        studio_id: studio!.id, user_id: profile?.id, user_name: profile?.full_name,
        action: stockType === "in" ? "stock_added" : "stock_removed",
        entity_type: "inventory", entity_id: showStock.id,
        details: { name: showStock.name, quantity: stockQty },
      });

      toast({ title: `Stock ${stockType === "in" ? "added" : "removed"}` });
      setShowStock(null); setStockQty(0); setStockNotes("");
      fetchItems(); fetchTransactions();
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: e.message });
    } finally { setSaving(false); }
  };

  const lowStock = items.filter(i => i.quantity <= i.min_stock_level);
  const totalValue = items.reduce((s, i) => s + i.quantity * i.cost_per_unit, 0);
  const filtered = items.filter(i => i.name.toLowerCase().includes(search.toLowerCase()) || i.category.toLowerCase().includes(search.toLowerCase()));

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Inventory</h1>
            <p className="text-muted-foreground mt-1">Track materials, supplies, and stock levels</p>
          </div>
          <Button onClick={() => setShowAdd(true)}><Plus className="h-4 w-4 mr-2" /> Add Item</Button>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card><CardContent className="pt-4 pb-3 text-center"><p className="text-2xl font-bold">{items.length}</p><p className="text-xs text-muted-foreground">Total Items</p></CardContent></Card>
          <Card><CardContent className="pt-4 pb-3 text-center"><p className="text-2xl font-bold text-destructive">{lowStock.length}</p><p className="text-xs text-muted-foreground">Low Stock</p></CardContent></Card>
          <Card><CardContent className="pt-4 pb-3 text-center"><p className="text-2xl font-bold">₹{totalValue.toLocaleString("en-IN")}</p><p className="text-xs text-muted-foreground">Total Value</p></CardContent></Card>
          <Card><CardContent className="pt-4 pb-3 text-center"><p className="text-2xl font-bold">{new Set(items.map(i => i.category)).size}</p><p className="text-xs text-muted-foreground">Categories</p></CardContent></Card>
        </div>

        {/* Low Stock Alert */}
        {lowStock.length > 0 && (
          <Card className="border-destructive/30 bg-destructive/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-4 w-4" /> Low Stock Alert
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {lowStock.map(i => (
                  <Badge key={i.id} variant="destructive" className="cursor-pointer" onClick={() => { setShowStock(i); setStockType("in"); }}>
                    {i.name} ({i.quantity} {i.unit})
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="items">
          <TabsList>
            <TabsTrigger value="items">Items</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
          </TabsList>

          <TabsContent value="items" className="space-y-4">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search items..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Unit Cost</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow><TableCell colSpan={6} className="text-center py-8"><Loader2 className="h-5 w-5 animate-spin mx-auto" /></TableCell></TableRow>
                    ) : filtered.length === 0 ? (
                      <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No items yet</TableCell></TableRow>
                    ) : filtered.map(item => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.name} {item.sku && <span className="text-xs text-muted-foreground ml-1">({item.sku})</span>}</TableCell>
                        <TableCell><Badge variant="secondary">{item.category}</Badge></TableCell>
                        <TableCell>
                          <span className={item.quantity <= item.min_stock_level ? "text-destructive font-bold" : ""}>
                            {item.quantity} {item.unit}
                          </span>
                          {item.quantity <= item.min_stock_level && <AlertTriangle className="h-3 w-3 text-destructive inline ml-1" />}
                        </TableCell>
                        <TableCell>₹{item.cost_per_unit}</TableCell>
                        <TableCell>₹{(item.quantity * item.cost_per_unit).toLocaleString("en-IN")}</TableCell>
                        <TableCell className="text-right space-x-1">
                          <Button size="sm" variant="ghost" onClick={() => { setShowStock(item); setStockType("in"); }}><ArrowDown className="h-4 w-4 text-success" /></Button>
                          <Button size="sm" variant="ghost" onClick={() => { setShowStock(item); setStockType("out"); }}><ArrowUp className="h-4 w-4 text-destructive" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>By</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.length === 0 ? (
                      <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No transactions yet</TableCell></TableRow>
                    ) : transactions.map(t => (
                      <TableRow key={t.id}>
                        <TableCell className="font-medium">{t.inventory_items?.name}</TableCell>
                        <TableCell>
                          <Badge variant={t.type === "stock_in" ? "default" : "destructive"} className="capitalize">
                            {t.type === "stock_in" ? "In" : "Out"}
                          </Badge>
                        </TableCell>
                        <TableCell>{t.quantity}</TableCell>
                        <TableCell className="text-muted-foreground">{t.profiles?.full_name || "System"}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">{new Date(t.created_at).toLocaleDateString("en-IN")}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{t.notes || "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Add Item Dialog */}
        <Dialog open={showAdd} onOpenChange={setShowAdd}>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Inventory Item</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div className="space-y-2"><Label>Name *</Label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. XPEL Ultimate PPF 60-inch" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={form.category} onValueChange={v => setForm({...form, category: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label>SKU</Label><Input value={form.sku} onChange={e => setForm({...form, sku: e.target.value})} placeholder="SKU code" /></div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2"><Label>Initial Qty</Label><Input type="number" value={form.quantity} onChange={e => setForm({...form, quantity: Number(e.target.value)})} /></div>
                <div className="space-y-2"><Label>Unit</Label>
                  <Select value={form.unit} onValueChange={v => setForm({...form, unit: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["pcs", "rolls", "liters", "ml", "sqft", "meters", "kg", "grams", "bottles", "sheets"].map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label>Min Stock</Label><Input type="number" value={form.min_stock_level} onChange={e => setForm({...form, min_stock_level: Number(e.target.value)})} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2"><Label>Cost/Unit (₹)</Label><Input type="number" value={form.cost_per_unit} onChange={e => setForm({...form, cost_per_unit: Number(e.target.value)})} /></div>
                <div className="space-y-2"><Label>Supplier</Label><Input value={form.supplier} onChange={e => setForm({...form, supplier: e.target.value})} /></div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
              <Button onClick={saveItem} disabled={saving}>{saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />} Add Item</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Stock Adjust Dialog */}
        <Dialog open={!!showStock} onOpenChange={() => setShowStock(null)}>
          <DialogContent>
            <DialogHeader><DialogTitle>{stockType === "in" ? "Add Stock" : "Remove Stock"} — {showStock?.name}</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Current: <span className="font-bold text-foreground">{showStock?.quantity} {showStock?.unit}</span></p>
              <div className="flex gap-2">
                <Button size="sm" variant={stockType === "in" ? "default" : "outline"} onClick={() => setStockType("in")}><ArrowDown className="h-3 w-3 mr-1" /> Stock In</Button>
                <Button size="sm" variant={stockType === "out" ? "destructive" : "outline"} onClick={() => setStockType("out")}><ArrowUp className="h-3 w-3 mr-1" /> Stock Out</Button>
              </div>
              <div className="space-y-2"><Label>Quantity</Label><Input type="number" value={stockQty} onChange={e => setStockQty(Number(e.target.value))} min={1} /></div>
              <div className="space-y-2"><Label>Notes</Label><Input value={stockNotes} onChange={e => setStockNotes(e.target.value)} placeholder="Reason..." /></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowStock(null)}>Cancel</Button>
              <Button onClick={adjustStock} disabled={saving} variant={stockType === "out" ? "destructive" : "default"}>
                {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />} {stockType === "in" ? "Add" : "Remove"} Stock
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
