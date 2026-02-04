import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  UserPlus, 
  Check, 
  X, 
  Search,
  MoreHorizontal,
  Mail,
  Phone,
  Clock,
  CheckCircle2,
  XCircle,
  Shield,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { StaffPermissionsDialog } from "@/components/staff/StaffPermissionsDialog";

interface StaffMember {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  role: "owner" | "staff" | "mechanic";
  status: "pending" | "approved" | "rejected";
  permissions: Record<string, boolean>;
  created_at: string;
}

export default function StaffPage() {
  const { studio } = useAuth();
  const { toast } = useToast();
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [permissionsDialogOpen, setPermissionsDialogOpen] = useState(false);
  const [selectedStaffForPermissions, setSelectedStaffForPermissions] = useState<StaffMember | null>(null);

  useEffect(() => {
    if (studio?.id) {
      fetchStaff();
    }
  }, [studio?.id]);

  const fetchStaff = async () => {
    if (!studio?.id) return;
    
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("studio_id", studio.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setStaff((data || []) as unknown as StaffMember[]);
    } catch (error) {
      console.error("Error fetching staff:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not load staff members.",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateStaffStatus = async (profileId: string, status: "approved" | "rejected") => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ status })
        .eq("id", profileId);

      if (error) throw error;

      toast({
        title: status === "approved" ? "Staff approved" : "Staff rejected",
        description: `Staff member has been ${status}.`,
      });

      fetchStaff();
    } catch (error) {
      console.error("Error updating staff:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not update staff status.",
      });
    }
  };

  const filteredStaff = staff.filter((member) =>
    member.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pendingStaff = filteredStaff.filter((m) => m.status === "pending");
  const approvedStaff = filteredStaff.filter((m) => m.status === "approved");
  const rejectedStaff = filteredStaff.filter((m) => m.status === "rejected");

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="badge-pending">Pending</Badge>;
      case "approved":
        return <Badge variant="outline" className="badge-active">Active</Badge>;
      case "rejected":
        return <Badge variant="outline" className="bg-destructive/15 text-destructive border-destructive/30">Rejected</Badge>;
      default:
        return null;
    }
  };

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
            <h1 className="font-display text-3xl font-bold">Staff Management</h1>
            <p className="text-muted-foreground mt-1">
              Manage your team members and approve new requests
            </p>
          </div>
        </motion.div>

        {/* Studio Key Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Share this key with staff to let them join your studio
                  </p>
                  <p className="font-mono text-2xl font-bold tracking-wider">
                    {studio?.join_key || "Loading..."}
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(studio?.join_key || "");
                    toast({ title: "Copied!", description: "Studio key copied to clipboard." });
                  }}
                >
                  Copy Key
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search staff..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Pending Requests */}
        {pendingStaff.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-warning" />
                  Pending Requests ({pendingStaff.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingStaff.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-border bg-card"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-warning/10 flex items-center justify-center">
                          <span className="text-sm font-medium text-warning">
                            {member.full_name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{member.full_name}</p>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {member.email}
                            </span>
                            {member.phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {member.phone}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-destructive hover:bg-destructive/10"
                          onClick={() => updateStaffStatus(member.id, "rejected")}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => updateStaffStatus(member.id, "approved")}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Active Staff */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-success" />
                Active Staff ({approvedStaff.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {approvedStaff.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <UserPlus className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No active staff members</p>
                  <p className="text-sm mt-1">
                    Share your studio key to invite team members
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {approvedStaff.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-border"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-medium text-primary">
                            {member.full_name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{member.full_name}</p>
                            <Badge variant="outline" className="text-xs capitalize">
                              {member.role}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {member.email}
                          </p>
                        </div>
                      </div>
                      {member.role !== "owner" && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedStaffForPermissions(member);
                                setPermissionsDialogOpen(true);
                              }}
                            >
                              <Shield className="h-4 w-4 mr-2" />
                              Manage Permissions
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={async () => {
                                const newRole = member.role === "mechanic" ? "staff" : "mechanic";
                                const { error } = await supabase
                                  .from("profiles")
                                  .update({ role: newRole })
                                  .eq("id", member.id);
                                if (!error) {
                                  toast({ title: "Role updated", description: `Changed to ${newRole}` });
                                  fetchStaff();
                                }
                              }}
                            >
                              Switch to {member.role === "mechanic" ? "Staff" : "Mechanic"}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => updateStaffStatus(member.id, "rejected")}
                            >
                              Remove Access
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Permissions Dialog */}
        <StaffPermissionsDialog
          open={permissionsDialogOpen}
          onOpenChange={setPermissionsDialogOpen}
          staff={selectedStaffForPermissions}
          onUpdate={fetchStaff}
        />
      </div>
    </DashboardLayout>
  );
}
