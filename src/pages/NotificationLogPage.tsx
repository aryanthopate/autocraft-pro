import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MessageSquare, Phone, Clock, Search, Loader2, CheckCircle2 } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface NotificationLog {
  id: string;
  channel: string;
  template_type: string;
  recipient_phone: string;
  recipient_name: string;
  message_body: string;
  status: string;
  created_at: string;
}

export default function NotificationLogPage() {
  const { studio } = useAuth();
  const [logs, setLogs] = useState<NotificationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [channelFilter, setChannelFilter] = useState("all");

  useEffect(() => {
    if (studio?.id) fetchLogs();
  }, [studio?.id]);

  const fetchLogs = async () => {
    const { data } = await supabase
      .from("notification_logs")
      .select("*")
      .eq("studio_id", studio!.id)
      .order("created_at", { ascending: false })
      .limit(100);
    setLogs((data as any) || []);
    setLoading(false);
  };

  const filtered = logs.filter(l => {
    const matchesSearch = l.recipient_name?.toLowerCase().includes(search.toLowerCase()) ||
      l.message_body?.toLowerCase().includes(search.toLowerCase());
    const matchesChannel = channelFilter === "all" || l.channel === channelFilter;
    return matchesSearch && matchesChannel;
  });

  const templateLabel = (t: string) => {
    const map: Record<string, string> = {
      job_started: "Job Started",
      job_completed: "Job Completed",
      invoice_sent: "Invoice Sent",
      estimate_sent: "Estimate Sent",
    };
    return map[t] || t;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <MessageSquare className="h-7 w-7 text-green-500" />
            Notification Log
          </h1>
          <p className="text-muted-foreground mt-1">Track all WhatsApp & SMS messages sent to customers</p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card><CardContent className="pt-4 pb-3 text-center">
            <p className="text-2xl font-bold">{logs.length}</p>
            <p className="text-xs text-muted-foreground">Total Sent</p>
          </CardContent></Card>
          <Card><CardContent className="pt-4 pb-3 text-center">
            <p className="text-2xl font-bold text-green-500">{logs.filter(l => l.channel === "whatsapp").length}</p>
            <p className="text-xs text-muted-foreground">WhatsApp</p>
          </CardContent></Card>
          <Card><CardContent className="pt-4 pb-3 text-center">
            <p className="text-2xl font-bold">{logs.filter(l => l.template_type === "invoice_sent").length}</p>
            <p className="text-xs text-muted-foreground">Invoice Alerts</p>
          </CardContent></Card>
          <Card><CardContent className="pt-4 pb-3 text-center">
            <p className="text-2xl font-bold">{logs.filter(l => l.template_type === "job_completed").length}</p>
            <p className="text-xs text-muted-foreground">Job Updates</p>
          </CardContent></Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search notifications..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={channelFilter} onValueChange={setChannelFilter}>
            <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Channels</SelectItem>
              <SelectItem value="whatsapp">WhatsApp</SelectItem>
              <SelectItem value="sms">SMS</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Logs */}
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : filtered.length === 0 ? (
          <Card><CardContent className="py-12 text-center">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="font-semibold mb-1">No notifications sent yet</h3>
            <p className="text-sm text-muted-foreground">Send invoices or job updates via WhatsApp to see them here</p>
          </CardContent></Card>
        ) : (
          <div className="space-y-3">
            {filtered.map((log, i) => (
              <motion.div key={log.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                <Card>
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-start gap-3">
                      <div className={`h-9 w-9 rounded-full flex items-center justify-center shrink-0 ${log.channel === "whatsapp" ? "bg-green-500/10" : "bg-blue-500/10"}`}>
                        {log.channel === "whatsapp" ? <MessageSquare className="h-4 w-4 text-green-500" /> : <Phone className="h-4 w-4 text-blue-500" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{log.recipient_name}</span>
                          <Badge variant="outline" className="text-[10px]">{templateLabel(log.template_type)}</Badge>
                          <Badge variant="outline" className="text-[10px] bg-green-500/10 text-green-600 border-green-500/30">
                            <CheckCircle2 className="h-2.5 w-2.5 mr-0.5" />
                            {log.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">{log.message_body}</p>
                        <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{log.recipient_phone}</span>
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(log.created_at).toLocaleString("en-IN")}</span>
                        </div>
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
