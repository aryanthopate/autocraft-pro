import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Plus, Search, FileText, IndianRupee, Calendar, MoreHorizontal,
  Send, CheckCircle2, Clock, AlertCircle, Loader2, Download, MessageSquare,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useWhatsAppNotification } from "@/hooks/useWhatsAppNotification";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface Invoice {
  id: string;
  invoice_number: string;
  amount: number;
  subtotal: number;
  gst_percentage: number;
  gst_amount: number;
  status: string;
  due_date: string | null;
  notes: string | null;
  created_at: string;
  customer?: { name: string; phone: string; email?: string };
  job?: { id: string; car?: { make: string; model: string; registration_number?: string } };
}

interface CompletedJob {
  id: string;
  total_price: number | null;
  customer_id: string;
  customer?: { id: string; name: string };
  car?: { make: string; model: string };
}

export default function InvoicesPage() {
  const { studio } = useAuth();
  const { toast } = useToast();
  const { sendNotification } = useWhatsAppNotification();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [completedJobs, setCompletedJobs] = useState<CompletedJob[]>([]);
  const [creating, setCreating] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState("");
  const [invoiceAmount, setInvoiceAmount] = useState("");
  const [gstPercentage, setGstPercentage] = useState("18");
  const [invoiceNotes, setInvoiceNotes] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    if (studio?.id) fetchInvoices();
  }, [studio?.id]);

  const fetchInvoices = async () => {
    if (!studio?.id) return;
    try {
      const { data, error } = await supabase
        .from("invoices")
        .select(`*, customers(name, phone, email), jobs(id, cars(make, model, registration_number))`)
        .eq("studio_id", studio.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      const mapped = (data || []).map((inv: any) => ({
        ...inv,
        customer: inv.customers,
        job: inv.jobs ? { ...inv.jobs, car: inv.jobs.cars } : null,
      }));
      setInvoices(mapped);
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Could not load invoices." });
    } finally {
      setLoading(false);
    }
  };

  const fetchCompletedJobs = async () => {
    if (!studio?.id) return;
    const { data } = await supabase
      .from("jobs")
      .select("id, total_price, customer_id, customers(id, name), cars(make, model)")
      .eq("studio_id", studio.id)
      .eq("status", "completed")
      .order("created_at", { ascending: false })
      .limit(50);
    if (data) {
      setCompletedJobs(data.map((j: any) => ({ ...j, customer: j.customers, car: j.cars })));
    }
  };

  const handleCreateInvoice = async () => {
    if (!studio?.id || !selectedJobId) return;
    setCreating(true);
    try {
      const job = completedJobs.find(j => j.id === selectedJobId);
      if (!job) throw new Error("Job not found");

      const invoiceNumber = `INV-${Date.now().toString(36).toUpperCase()}`;
      const subtotal = parseFloat(invoiceAmount) || job.total_price || 0;
      const gstPct = parseFloat(gstPercentage) || 18;
      const gstAmt = subtotal * (gstPct / 100);
      const totalAmount = subtotal + gstAmt;

      const { error } = await supabase.from("invoices").insert({
        studio_id: studio.id,
        job_id: selectedJobId,
        customer_id: job.customer_id,
        invoice_number: invoiceNumber,
        amount: totalAmount,
        subtotal,
        gst_percentage: gstPct,
        gst_amount: gstAmt,
        status: "draft",
        due_date: dueDate || null,
        notes: invoiceNotes || null,
      });

      if (error) throw error;
      toast({ title: "Invoice created!", description: `Invoice ${invoiceNumber} created.` });
      setCreateOpen(false);
      setSelectedJobId("");
      setInvoiceAmount("");
      setGstPercentage("18");
      setInvoiceNotes("");
      setDueDate("");
      fetchInvoices();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } finally {
      setCreating(false);
    }
  };

  const updateInvoiceStatus = async (invoiceId: string, status: string) => {
    try {
      const { error } = await supabase.from("invoices").update({ status }).eq("id", invoiceId);
      if (error) throw error;
      toast({ title: `Invoice marked as ${status}` });
      fetchInvoices();
    } catch {
      toast({ variant: "destructive", title: "Error" });
    }
  };

  const downloadInvoicePDF = async (invoice: Invoice) => {
    setDownloading(invoice.id);
    try {
      const { data, error } = await supabase.functions.invoke("generate-invoice-pdf", {
        body: { invoice_id: invoice.id },
      });

      if (error) throw error;

      // Open HTML in new window for printing/saving as PDF
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(data.html);
        printWindow.document.close();
        setTimeout(() => printWindow.print(), 500);
      }

      toast({ title: "Invoice PDF Ready", description: "Print dialog opened. Save as PDF from the print menu." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "PDF Error", description: error.message || "Could not generate PDF." });
    } finally {
      setDownloading(null);
    }
  };

  const sendInvoiceWhatsApp = async (invoice: Invoice) => {
    if (!invoice.customer?.phone) {
      toast({ variant: "destructive", title: "No phone number", description: "Customer has no phone number." });
      return;
    }
    await sendNotification({
      templateType: "invoice_sent",
      recipientPhone: invoice.customer.phone,
      recipientName: invoice.customer.name,
      variables: {
        invoice_number: invoice.invoice_number,
        amount: invoice.amount.toLocaleString("en-IN"),
        due_date: invoice.due_date ? new Date(invoice.due_date).toLocaleDateString("en-IN") : "N/A",
      },
      customerId: undefined,
      invoiceId: invoice.id,
    });

    // Auto-update status to sent if draft
    if (invoice.status === "draft") {
      updateInvoiceStatus(invoice.id, "sent");
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { class: string; icon: any }> = {
      draft: { class: "bg-muted text-muted-foreground", icon: FileText },
      sent: { class: "bg-blue-500/15 text-blue-500 border-blue-500/30", icon: Send },
      paid: { class: "bg-green-500/15 text-green-500 border-green-500/30", icon: CheckCircle2 },
      overdue: { class: "bg-destructive/15 text-destructive border-destructive/30", icon: AlertCircle },
      cancelled: { class: "bg-muted text-muted-foreground", icon: AlertCircle },
    };
    const variant = variants[status] || variants.draft;
    const Icon = variant.icon;
    return (
      <Badge variant="outline" className={variant.class}>
        <Icon className="h-3 w-3 mr-1" />
        {status}
      </Badge>
    );
  };

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.customer?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPending = invoices.filter(i => i.status === "sent").reduce((s, i) => s + i.amount, 0);
  const totalPaid = invoices.filter(i => i.status === "paid").reduce((s, i) => s + i.amount, 0);

  const selectedJob = completedJobs.find(j => j.id === selectedJobId);
  const previewSubtotal = parseFloat(invoiceAmount) || selectedJob?.total_price || 0;
  const previewGst = previewSubtotal * (parseFloat(gstPercentage) || 18) / 100;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold">Invoices</h1>
            <p className="text-muted-foreground mt-1">Manage billing, PDFs, and WhatsApp notifications</p>
          </div>
          <Button onClick={() => { setCreateOpen(true); fetchCompletedJobs(); }}>
            <Plus className="h-4 w-4 mr-2" /> Create Invoice
          </Button>
        </motion.div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Total Invoices</p><p className="text-2xl font-bold">{invoices.length}</p></div><FileText className="h-8 w-8 text-muted-foreground opacity-50" /></div></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Pending</p><p className="text-2xl font-bold text-amber-500">₹{totalPending.toLocaleString()}</p></div><Clock className="h-8 w-8 text-amber-500 opacity-50" /></div></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Collected</p><p className="text-2xl font-bold text-green-500">₹{totalPaid.toLocaleString()}</p></div><IndianRupee className="h-8 w-8 text-green-500 opacity-50" /></div></CardContent></Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search invoices..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="sent">Sent</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Invoice List */}
        {loading ? (
          <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : filteredInvoices.length === 0 ? (
          <Card><CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="font-semibold mb-1">No invoices yet</h3>
            <p className="text-sm text-muted-foreground">Create an invoice from a completed job</p>
          </CardContent></Card>
        ) : (
          <div className="space-y-3">
            {filteredInvoices.map((invoice, index) => (
              <motion.div key={invoice.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                <Card className="hover:border-primary/50 transition-colors">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium font-mono">{invoice.invoice_number}</p>
                            {getStatusBadge(invoice.status)}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {invoice.customer?.name}
                            {invoice.job?.car && <span className="ml-2">• {invoice.job.car.make} {invoice.job.car.model}</span>}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right mr-2">
                          <p className="font-semibold">₹{invoice.amount.toLocaleString()}</p>
                          {invoice.due_date && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Due {new Date(invoice.due_date).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        {/* Quick actions */}
                        <Button variant="ghost" size="icon" onClick={() => downloadInvoicePDF(invoice)} disabled={downloading === invoice.id} title="Download PDF">
                          {downloading === invoice.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => sendInvoiceWhatsApp(invoice)} title="Send via WhatsApp" className="text-green-600">
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => updateInvoiceStatus(invoice.id, "sent")}>Mark as Sent</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateInvoiceStatus(invoice.id, "paid")}>Mark as Paid</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateInvoiceStatus(invoice.id, "overdue")}>Mark as Overdue</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => downloadInvoicePDF(invoice)}>Download PDF</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => sendInvoiceWhatsApp(invoice)}>Send via WhatsApp</DropdownMenuItem>
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

      {/* Create Invoice Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Create Invoice</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Completed Job *</Label>
              <Select value={selectedJobId} onValueChange={v => {
                setSelectedJobId(v);
                const job = completedJobs.find(j => j.id === v);
                if (job?.total_price) setInvoiceAmount(job.total_price.toString());
              }}>
                <SelectTrigger><SelectValue placeholder="Select a completed job" /></SelectTrigger>
                <SelectContent>
                  {completedJobs.map(job => (
                    <SelectItem key={job.id} value={job.id}>
                      {job.car?.make} {job.car?.model} — {job.customer?.name}
                      {job.total_price ? ` (₹${job.total_price.toLocaleString()})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Subtotal (₹) *</Label>
                <Input type="number" value={invoiceAmount} onChange={e => setInvoiceAmount(e.target.value)} placeholder="Amount" />
              </div>
              <div className="space-y-2">
                <Label>GST %</Label>
                <Input type="number" value={gstPercentage} onChange={e => setGstPercentage(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Due Date</Label>
              <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea value={invoiceNotes} onChange={e => setInvoiceNotes(e.target.value)} placeholder="Additional notes..." rows={2} />
            </div>

            {/* Preview */}
            {selectedJobId && (
              <div className="bg-muted/50 rounded-lg p-3 space-y-1 text-sm">
                <div className="flex justify-between"><span>Subtotal</span><span>₹{previewSubtotal.toLocaleString("en-IN")}</span></div>
                <div className="flex justify-between"><span>GST ({gstPercentage}%)</span><span>₹{previewGst.toLocaleString("en-IN")}</span></div>
                <div className="flex justify-between font-bold border-t border-border pt-1 mt-1">
                  <span>Grand Total</span><span>₹{(previewSubtotal + previewGst).toLocaleString("en-IN")}</span>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => setCreateOpen(false)} className="flex-1">Cancel</Button>
              <Button onClick={handleCreateInvoice} disabled={!selectedJobId || !invoiceAmount || creating} className="flex-1">
                {creating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                Create
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
