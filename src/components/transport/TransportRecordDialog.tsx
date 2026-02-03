import { useState } from "react";
import { Loader2, Truck, Camera, AlertTriangle, Check } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface TransportRecordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobId: string;
  type: "pickup" | "dropoff";
  carInfo: { make: string; model: string; color?: string | null };
  customerName: string;
  profileId: string;
  onSuccess: () => void;
}

export function TransportRecordDialog({
  open,
  onOpenChange,
  jobId,
  type,
  carInfo,
  customerName,
  profileId,
  onSuccess,
}: TransportRecordDialogProps) {
  const { toast } = useToast();
  const [conditionNotes, setConditionNotes] = useState("");
  const [existingDamage, setExistingDamage] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    setSaving(true);

    try {
      const { error } = await supabase.from("transport_records").insert({
        job_id: jobId,
        type: type,
        condition_notes: conditionNotes || null,
        existing_damage: existingDamage || null,
        recorded_by: profileId,
      });

      if (error) throw error;

      toast({
        title: type === "pickup" ? "Pickup recorded" : "Drop-off recorded",
        description: "Transport record has been saved successfully.",
      });

      setConditionNotes("");
      setExistingDamage("");
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving transport record:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not save transport record.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-primary" />
            {type === "pickup" ? "Vehicle Pickup" : "Vehicle Drop-off"}
          </DialogTitle>
        </DialogHeader>

        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">
                  {carInfo.make} {carInfo.model}
                </p>
                <p className="text-sm text-muted-foreground">{customerName}</p>
              </div>
              {carInfo.color && (
                <div className="flex items-center gap-2">
                  <div
                    className="h-4 w-4 rounded-full border"
                    style={{ backgroundColor: carInfo.color.toLowerCase() }}
                  />
                  <span className="text-sm">{carInfo.color}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="condition">Vehicle Condition Notes</Label>
            <Textarea
              id="condition"
              placeholder="Describe the current condition of the vehicle (cleanliness, visible issues, etc.)"
              value={conditionNotes}
              onChange={(e) => setConditionNotes(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="damage" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Existing Damage (if any)
            </Label>
            <Textarea
              id="damage"
              placeholder="Document any pre-existing damage: scratches, dents, chips, etc."
              value={existingDamage}
              onChange={(e) => setExistingDamage(e.target.value)}
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              Important: Document all existing damage before starting work to avoid disputes.
            </p>
          </div>

          <div className="p-4 rounded-lg border border-dashed border-muted-foreground/30 text-center">
            <Camera className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Photo upload coming soon
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Take photos of the vehicle condition
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Recording...
              </>
            ) : (
              <>
                <Check className="h-4 w-4 mr-2" />
                Confirm {type === "pickup" ? "Pickup" : "Drop-off"}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
