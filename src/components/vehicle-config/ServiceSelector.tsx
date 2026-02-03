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

const SERVICES_BY_ZONE: Record<string, { name: string; price: number }[]> = {
  exterior: [
    { name: "Wash & Dry", price: 500 },
    { name: "Clay Bar Treatment", price: 1500 },
    { name: "Polish", price: 2000 },
    { name: "Wax Coating", price: 1500 },
    { name: "Ceramic Coating", price: 8000 },
    { name: "PPF Installation", price: 15000 },
    { name: "Dent Removal", price: 3000 },
    { name: "Paint Touch-up", price: 2500 },
  ],
  glass: [
    { name: "Clean & Polish", price: 800 },
    { name: "Water Repellent Coating", price: 1200 },
    { name: "Tint Removal", price: 1500 },
    { name: "Tint Installation", price: 3500 },
    { name: "Chip Repair", price: 1000 },
  ],
  wheels: [
    { name: "Wheel Wash", price: 400 },
    { name: "Tire Shine", price: 300 },
    { name: "Wheel Polish", price: 1500 },
    { name: "Wheel Ceramic Coating", price: 4000 },
    { name: "Brake Dust Removal", price: 800 },
    { name: "Wheel Alignment Check", price: 500 },
  ],
  interior: [
    { name: "Vacuum & Clean", price: 600 },
    { name: "Leather Conditioning", price: 1500 },
    { name: "Fabric Shampooing", price: 2000 },
    { name: "Dashboard Polish", price: 500 },
    { name: "Odor Elimination", price: 1200 },
    { name: "Steam Cleaning", price: 3000 },
  ],
  lighting: [
    { name: "Headlight Restoration", price: 2000 },
    { name: "Bulb Replacement", price: 800 },
    { name: "LED Upgrade", price: 3500 },
    { name: "Lens Polish", price: 1000 },
  ],
  mechanical: [
    { name: "Engine Bay Cleaning", price: 1500 },
    { name: "Engine Degrease", price: 2000 },
    { name: "Exhaust Polish", price: 1200 },
    { name: "Chain Lubrication", price: 500 },
  ],
  accessories: [
    { name: "Chrome Polish", price: 800 },
    { name: "Trim Restoration", price: 1500 },
    { name: "Badge Polish", price: 400 },
    { name: "Rack Cleaning", price: 600 },
  ],
  controls: [
    { name: "Handlebar Polish", price: 500 },
    { name: "Grip Replacement", price: 800 },
    { name: "Control Polish", price: 600 },
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
  const [customPrice, setCustomPrice] = useState<string>("");

  useEffect(() => {
    if (open) {
      setSelectedServices(existingServices);
      setCustomPrice(existingPrice > 0 ? existingPrice.toString() : "");
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

  const calculatedPrice = selectedServices.reduce((sum, serviceName) => {
    const service = availableServices.find((s) => s.name === serviceName);
    return sum + (service?.price || 0);
  }, 0);

  const finalPrice = customPrice ? parseInt(customPrice) : calculatedPrice;

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
            <div className="grid grid-cols-1 gap-2 max-h-[250px] overflow-y-auto pr-2">
              <AnimatePresence>
                {availableServices.map((service, index) => {
                  const isSelected = selectedServices.includes(service.name);
                  return (
                    <motion.button
                      key={service.name}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                      onClick={() => toggleService(service.name)}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-lg border transition-all",
                        isSelected
                          ? "bg-racing/10 border-racing text-foreground"
                          : "bg-card border-border hover:border-racing/50"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "w-5 h-5 rounded flex items-center justify-center border transition-all",
                            isSelected
                              ? "bg-racing border-racing text-white"
                              : "border-muted-foreground/30"
                          )}
                        >
                          {isSelected && <Check className="h-3 w-3" />}
                        </div>
                        <span className="font-medium text-sm">{service.name}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        ₹{service.price.toLocaleString()}
                      </span>
                    </motion.button>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>

          {/* Custom price */}
          <div className="space-y-2">
            <Label>Custom Price (Optional)</Label>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">₹</span>
              <Input
                type="number"
                placeholder={calculatedPrice.toString()}
                value={customPrice}
                onChange={(e) => setCustomPrice(e.target.value)}
                className="flex-1"
              />
            </div>
            {!customPrice && selectedServices.length > 0 && (
              <p className="text-xs text-muted-foreground">
                Calculated: ₹{calculatedPrice.toLocaleString()}
              </p>
            )}
          </div>

          {/* Total and actions */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div>
              <p className="text-sm text-muted-foreground">Total Price</p>
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
                Add Services
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
