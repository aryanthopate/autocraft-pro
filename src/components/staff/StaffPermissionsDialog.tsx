import { useState, useEffect } from "react";
import { Loader2, Shield, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

interface StaffMember {
  id: string;
  full_name: string;
  email: string;
  permissions: Record<string, boolean>;
}

interface StaffPermissionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staff: StaffMember | null;
  onUpdate: () => void;
}

const AVAILABLE_PERMISSIONS = [
  { key: "jobs_view", label: "View Jobs", description: "Can view all jobs in the studio" },
  { key: "jobs_create", label: "Create Jobs", description: "Can create new jobs" },
  { key: "jobs_edit", label: "Edit Jobs", description: "Can modify job details and zones" },
  { key: "customers_view", label: "View Customers", description: "Can view customer information" },
  { key: "customers_create", label: "Create Customers", description: "Can add new customers" },
  { key: "customers_edit", label: "Edit Customers", description: "Can modify customer details" },
  { key: "vehicles_view", label: "View Vehicles", description: "Can view vehicle information" },
  { key: "vehicles_create", label: "Create Vehicles", description: "Can register new vehicles" },
  { key: "vehicles_edit", label: "Edit Vehicles", description: "Can modify vehicle details" },
  { key: "transport_pickup", label: "Pickup Vehicles", description: "Can handle vehicle pickups" },
  { key: "transport_drop", label: "Drop Vehicles", description: "Can handle vehicle drop-offs" },
  { key: "media_upload", label: "Upload Media", description: "Can upload photos/videos for jobs" },
];

export function StaffPermissionsDialog({
  open,
  onOpenChange,
  staff,
  onUpdate,
}: StaffPermissionsDialogProps) {
  const { toast } = useToast();
  const [permissions, setPermissions] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (staff) {
      setPermissions(staff.permissions || {});
    }
  }, [staff]);

  const handleToggle = (key: string) => {
    setPermissions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = async () => {
    if (!staff) return;
    setSaving(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ permissions })
        .eq("id", staff.id);

      if (error) throw error;

      toast({
        title: "Permissions updated",
        description: `${staff.full_name}'s permissions have been saved.`,
      });
      onUpdate();
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving permissions:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not save permissions.",
      });
    } finally {
      setSaving(false);
    }
  };

  const enabledCount = Object.values(permissions).filter(Boolean).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Staff Permissions
          </DialogTitle>
          {staff && (
            <div className="flex items-center gap-2 mt-2">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-sm font-medium text-primary">
                  {staff.full_name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="font-medium text-sm">{staff.full_name}</p>
                <p className="text-xs text-muted-foreground">{staff.email}</p>
              </div>
              <Badge variant="outline" className="ml-auto">
                {enabledCount} permissions
              </Badge>
            </div>
          )}
        </DialogHeader>

        <div className="space-y-4 py-4">
          {AVAILABLE_PERMISSIONS.map((perm) => (
            <div
              key={perm.key}
              className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
            >
              <div className="space-y-0.5">
                <Label htmlFor={perm.key} className="font-medium cursor-pointer">
                  {perm.label}
                </Label>
                <p className="text-xs text-muted-foreground">{perm.description}</p>
              </div>
              <Switch
                id={perm.key}
                checked={permissions[perm.key] || false}
                onCheckedChange={() => handleToggle(perm.key)}
              />
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Check className="h-4 w-4 mr-2" />
                Save Permissions
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
