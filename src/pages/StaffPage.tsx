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
  Shield,
  Wrench,
  Users,
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { StaffPermissionsDialog } from "@/components/staff/StaffPermissionsDialog";
import { cn } from "@/lib/utils";

interface StaffMember {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  role: "owner" | "staff" | "mechanic" | "admin";
  status: "pending" | "approved" | "rejected";
  permissions: Record<string, boolean>;
  created_at: string;
}

const ROLE_OPTIONS = [
  { value: "staff", label: "Staff", icon: Users, description: "General studio operations & management" },
  { value: "mechanic", label: "Mechanic", icon: Wrench, description: "Detailing & hands-on work" },
] as const;

export default function StaffPage() {
  const { studio } = useAuth();
  const { toast } = useToast();
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [permissionsDialogOpen, setPermissionsDialogOpen] = useState(false);
  const [selectedStaffForPermissions, setSelectedStaffForPermissions] = useState<StaffMember | null>(null);
  // Track selected role for each pending member
  const [pendingRoles, setPendingRoles] = useState<Record<string, string>>({});

  useEffect(() => {
    if (studio?.id) fetchStaff();
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
      toast({ variant: "destructive", title: "Error", description: "Could not load staff members." });
    } finally {
      setLoading(false);
    }
  };

  const approveWithRole = async (profileId: string, role: string) => {
    // Validate role against DB enum
    const validRole = (role === "staff" || role === "mechanic") ? role : "staff";
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ status: "approved", role: validRole as "staff" | "mechanic" })
        .eq("id", profileId);

      if (error) throw error;

      toast({
        title: "Staff approved!",
        description: `Approved as ${validRole}. They can now access the dashboard.`,
      });
      fetchStaff();
    } catch (error) {
      console.error("Error approving staff:", error);
      toast({ variant: "destructive", title: "Error", description: "Could not approve staff." });
    }
  };

  const rejectStaff = async (profileId: string) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ status: "rejected" })
        .eq("id", profileId);

      if (error) throw error;
      toast({ title: "Staff rejected" });
      fetchStaff();
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Could not reject staff." });
    }
  };

  const changeRole = async (profileId: string, newRole: string) => {
    const validRole = (newRole === "staff" || newRole === "mechanic") ? newRole : "staff";
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ role: validRole as "staff" | "mechanic" })
        .eq("id", profileId);

      if (error) throw error;
      toast({ title: "Role updated", description: `Changed to ${validRole}` });
      fetchStaff();
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Could not update role." });
    }
  };

  const filteredStaff = staff.filter((member) =>
    member.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pendingStaff = filteredStaff.filter((m) => m.status === "pending");
  const approvedStaff = filteredStaff.filter((m) => m.status === "approved");

  const getRoleBadgeStyle = (role: string) => {
    switch (role) {
      case "owner": return "bg-primary/15 text-primary border-primary/30";
      case "manager": return "bg-blue-500/15 text-blue-500 border-blue-500/30";
      case "mechanic": return "bg-racing/15 text-racing border-racing/30";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 className="font-display text-3xl font-bold">Staff Management</h1>
            <p className="text-muted-foreground mt-1">Manage team members, assign roles, and control permissions</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {approvedStaff.length} active
            </Badge>
            {pendingStaff.length > 0 && (
              <Badge variant="outline" className="bg-warning/15 text-warning border-warning/30 text-xs">
                {pendingStaff.length} pending
              </Badge>
            )}
          </div>
        </motion.div>

        {/* Studio Key Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Share this key with staff to let them join your studio</p>
                  <p className="font-mono text-2xl font-bold tracking-wider">{studio?.join_key || "Loading..."}</p>
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

        {/* Pending Requests — with Role Assignment */}
        {pendingStaff.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="border-warning/30">
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
                      className="p-4 rounded-xl border border-border bg-card hover:border-primary/20 transition-colors"
                    >
                      <div className="flex items-start gap-4">
                        {/* Avatar */}
                        <div className="h-12 w-12 rounded-full bg-warning/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-lg font-bold text-warning">
                            {member.full_name.charAt(0).toUpperCase()}
                          </span>
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-lg">{member.full_name}</p>
                          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mt-1">
                            <span className="flex items-center gap-1">
                              <Mail className="h-3.5 w-3.5" />
                              {member.email}
                            </span>
                            {member.phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="h-3.5 w-3.5" />
                                {member.phone}
                              </span>
                            )}
                          </div>

                          {/* Role selector + actions */}
                          <div className="flex flex-wrap items-center gap-3 mt-4">
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground">Assign as:</span>
                              <Select
                                value={pendingRoles[member.id] || "staff"}
                                onValueChange={(v) => setPendingRoles(prev => ({ ...prev, [member.id]: v }))}
                              >
                                <SelectTrigger className="w-[160px] h-9">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {ROLE_OPTIONS.map((role) => (
                                    <SelectItem key={role.value} value={role.value}>
                                      <div className="flex items-center gap-2">
                                        <role.icon className="h-4 w-4" />
                                        <span>{role.label}</span>
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="flex items-center gap-2 ml-auto">
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-destructive hover:bg-destructive/10 border-destructive/30"
                                onClick={() => rejectStaff(member.id)}
                              >
                                <X className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => approveWithRole(member.id, pendingRoles[member.id] || "staff")}
                              >
                                <Check className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Active Staff */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                Active Staff ({approvedStaff.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {approvedStaff.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <UserPlus className="h-16 w-16 mx-auto mb-4 opacity-30" />
                  <p className="font-medium text-lg">No active staff members</p>
                  <p className="text-sm mt-1">Share your studio key to invite team members</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {approvedStaff.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-4 rounded-xl border border-border hover:border-primary/20 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-11 w-11 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-bold text-primary">
                            {member.full_name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold">{member.full_name}</p>
                            <Badge variant="outline" className={cn("text-xs capitalize", getRoleBadgeStyle(member.role))}>
                              {member.role}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{member.email}</p>
                        </div>
                      </div>
                      {member.role !== "owner" && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-52">
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedStaffForPermissions(member);
                                setPermissionsDialogOpen(true);
                              }}
                            >
                              <Shield className="h-4 w-4 mr-2" />
                              Manage Permissions
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {ROLE_OPTIONS.filter(r => r.value !== member.role).map((role) => (
                              <DropdownMenuItem
                                key={role.value}
                                onClick={() => changeRole(member.id, role.value)}
                              >
                                <role.icon className="h-4 w-4 mr-2" />
                                Switch to {role.label}
                              </DropdownMenuItem>
                            ))}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => rejectStaff(member.id)}
                            >
                              <X className="h-4 w-4 mr-2" />
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
