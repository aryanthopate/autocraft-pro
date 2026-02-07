import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { HotspotData } from "./VehicleHotspot";

interface ServiceSelectorProps {
  open: boolean;
  onClose: () => void;
  hotspot: HotspotData | null;
  existingServices: string[];
  existingPrice: number;
  onSave: (services: string[], price: number) => void;
}

// Services without default prices - vendor will set pricing
const SERVICES_BY_ZONE: Record<string, string[]> = {
  exterior: [
    "Wash & Dry",
    "Clay Bar Treatment",
    "Polish",
    "Wax Coating",
    "Ceramic Coating",
    "PPF Installation",
    "Dent Removal",
    "Paint Touch-up",
    "Full Body Wrap",
    "Scratch Removal",
  ],
  glass: [
    "Clean & Polish",
    "Water Repellent Coating",
    "Tint Removal",
    "Tint Installation",
    "Chip Repair",
    "Windshield Replacement",
  ],
  wheels: [
    "Wheel Wash",
    "Tire Shine",
    "Wheel Polish",
    "Wheel Ceramic Coating",
    "Brake Dust Removal",
    "Wheel Alignment Check",
    "Tire Replacement",
    "Alloy Repair",
  ],
  interior: [
    "Vacuum & Clean",
    "Leather Conditioning",
    "Fabric Shampooing",
    "Dashboard Polish",
    "Odor Elimination",
    "Steam Cleaning",
    "Seat Repair",
    "Full Interior Detailing",
  ],
  lighting: [
    "Headlight Restoration",
    "Bulb Replacement",
    "LED Upgrade",
    "Lens Polish",
    "HID Installation",
    "Fog Light Installation",
  ],
  mechanical: [
    "Engine Bay Cleaning",
    "Engine Degrease",
    "Exhaust Polish",
    "Chain Lubrication",
    "Oil Change",
    "Filter Replacement",
  ],
  accessories: [
    "Chrome Polish",
    "Trim Restoration",
    "Badge Polish",
    "Rack Cleaning",
    "Mirror Replacement",
  ],
  controls: [
    "Handlebar Polish",
    "Grip Replacement",
    "Control Polish",
    "Lever Adjustment",
  ],
};

export function ServiceSelector({
  open,
  onClose,
  hotspot,
  existingServices,
  existingPrice,
  onSave,
}: ServiceSelectorProps) {
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [price, setPrice] = useState<string>("");

  useEffect(() => {
    if (open) {
      setSelectedServices(existingServices);
      setPrice(existingPrice > 0 ? existingPrice.toString() : "");
    }
  }, [open, existingServices, existingPrice]);

  if (!hotspot) return null;

  const availableServices = SERVICES_BY_ZONE[hotspot.zone_type] || SERVICES_BY_ZONE.exterior;

  const toggleService = (serviceName: string) => {
    setSelectedServices((prev) =>
      prev.includes(serviceName)
        ? prev.filter((s) => s !== serviceName)
        : [...prev, serviceName]
    );
  };

  const finalPrice = parseInt(price) || 0;

  const handleSave = () => {
    if (selectedServices.length > 0) {
      onSave(selectedServices, finalPrice);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-racing" />
            {hotspot.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Zone type badge */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Zone Type:</span>
            <span className="px-2 py-1 rounded bg-racing/10 text-racing text-xs font-medium capitalize">
              {hotspot.zone_type}
            </span>
          </div>

          {/* Services grid */}
          <div className="space-y-2">
            <Label>Select Services</Label>
            <div className="grid grid-cols-1 gap-2 max-h-[200px] overflow-y-auto pr-2">
              <AnimatePresence>
                {availableServices.map((serviceName, index) => {
                  const isSelected = selectedServices.includes(serviceName);
                  return (
                    <motion.button
                      key={serviceName}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.02 }}
                      onClick={() => toggleService(serviceName)}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-lg border transition-all text-left",
                        isSelected
                          ? "bg-racing/10 border-racing text-foreground"
                          : "bg-card border-border hover:border-racing/50"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "w-5 h-5 rounded flex items-center justify-center border transition-all shrink-0",
                            isSelected
                              ? "bg-racing border-racing text-white"
                              : "border-muted-foreground/30"
                          )}
                        >
                          {isSelected && <Check className="h-3 w-3" />}
                        </div>
                        <span className="font-medium text-sm">{serviceName}</span>
                      </div>
                    </motion.button>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>

          {/* Price input - Required */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1">
              Price for this zone 
              <span className="text-destructive">*</span>
            </Label>
            <div className="flex items-center gap-2">
              <span className="text-lg font-medium text-muted-foreground">₹</span>
              <Input
                type="number"
                placeholder="Enter price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="flex-1 text-lg font-semibold"
                min={0}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Set your custom price for the selected services
            </p>
          </div>

          {/* Total and actions */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div>
              <p className="text-sm text-muted-foreground">Zone Total</p>
              <p className="text-2xl font-bold text-racing">
                ₹{finalPrice.toLocaleString()}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={selectedServices.length === 0}
                className="bg-racing hover:bg-racing/90"
              >
                {existingServices.length > 0 ? "Update" : "Add"} Services
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
