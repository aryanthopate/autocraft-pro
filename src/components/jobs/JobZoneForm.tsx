import { useState } from "react";
import { motion } from "framer-motion";
import {
  X,
  Camera,
  Video,
  Mic,
  Palette,
  Wrench,
  MessageSquare,
  Save,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface JobZoneFormProps {
  zoneName: string;
  zoneType: string;
  onSave: (data: ZoneFormData) => Promise<void>;
  onClose: () => void;
  initialData?: Partial<ZoneFormData>;
}

export interface ZoneFormData {
  services: string[];
  colorChange: string | null;
  expectedResult: string;
  notes: string;
}

const SERVICES = {
  exterior: [
    { id: "wash", label: "Exterior Wash" },
    { id: "clay", label: "Clay Bar Treatment" },
    { id: "polish", label: "Paint Polishing" },
    { id: "wax", label: "Wax/Sealant" },
    { id: "ceramic", label: "Ceramic Coating" },
    { id: "ppf", label: "Paint Protection Film" },
    { id: "wrap", label: "Vinyl Wrap" },
    { id: "dent", label: "Dent Removal" },
    { id: "scratch", label: "Scratch Repair" },
    { id: "headlight", label: "Headlight Restoration" },
    { id: "trim", label: "Trim Restoration" },
  ],
  interior: [
    { id: "vacuum", label: "Vacuuming" },
    { id: "steam", label: "Steam Cleaning" },
    { id: "leather", label: "Leather Conditioning" },
    { id: "fabric", label: "Fabric Shampoo" },
    { id: "carpet", label: "Carpet Extraction" },
    { id: "dash", label: "Dashboard Treatment" },
    { id: "odor", label: "Odor Removal" },
    { id: "glass_int", label: "Interior Glass" },
    { id: "sanitize", label: "Sanitization" },
  ],
  wheels: [
    { id: "wheel_clean", label: "Wheel Cleaning" },
    { id: "tire_dress", label: "Tire Dressing" },
    { id: "caliper", label: "Caliper Painting" },
    { id: "wheel_seal", label: "Wheel Sealant" },
    { id: "wheel_repair", label: "Wheel Repair" },
  ],
  glass: [
    { id: "glass_clean", label: "Glass Cleaning" },
    { id: "rain_repel", label: "Rain Repellent" },
    { id: "tint", label: "Window Tinting" },
    { id: "chip_repair", label: "Chip Repair" },
  ],
};

const COLOR_OPTIONS = [
  "Gloss Black",
  "Matte Black",
  "Satin Black",
  "Carbon Fiber",
  "Midnight Blue",
  "Racing Red",
  "Pearl White",
  "Gunmetal Grey",
  "Brushed Aluminum",
  "Chrome Delete",
  "Custom Color",
];

export function JobZoneForm({
  zoneName,
  zoneType,
  onSave,
  onClose,
  initialData,
}: JobZoneFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedServices, setSelectedServices] = useState<string[]>(
    initialData?.services || []
  );
  const [colorChange, setColorChange] = useState<string>(
    initialData?.colorChange || ""
  );
  const [expectedResult, setExpectedResult] = useState(
    initialData?.expectedResult || ""
  );
  const [notes, setNotes] = useState(initialData?.notes || "");

  const availableServices = SERVICES[zoneType as keyof typeof SERVICES] || SERVICES.exterior;

  const handleServiceToggle = (serviceId: string) => {
    setSelectedServices((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await onSave({
        services: selectedServices,
        colorChange: colorChange || null,
        expectedResult,
        notes,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
    >
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="sticky top-0 bg-card z-10 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-racing/10 flex items-center justify-center">
                <Wrench className="h-5 w-5 text-racing" />
              </div>
              <div>
                <CardTitle className="text-lg">{zoneName}</CardTitle>
                <p className="text-sm text-muted-foreground capitalize">
                  {zoneType} zone configuration
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Services Selection */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Services Required</Label>
              <div className="grid grid-cols-2 gap-2">
                {availableServices.map((service) => (
                  <label
                    key={service.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedServices.includes(service.id)
                        ? "bg-primary/10 border-primary"
                        : "bg-muted/30 border-border hover:border-primary/50"
                    }`}
                  >
                    <Checkbox
                      checked={selectedServices.includes(service.id)}
                      onCheckedChange={() => handleServiceToggle(service.id)}
                    />
                    <span className="text-sm">{service.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Color Change */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2 text-base font-semibold">
                <Palette className="h-4 w-4" />
                Color Change (if applicable)
              </Label>
              <Select value={colorChange} onValueChange={setColorChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select color or leave empty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No color change</SelectItem>
                  {COLOR_OPTIONS.map((color) => (
                    <SelectItem key={color} value={color}>
                      {color}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Expected Result */}
            <div className="space-y-3">
              <Label htmlFor="expectedResult" className="text-base font-semibold">
                Expected Result
              </Label>
              <Input
                id="expectedResult"
                placeholder="e.g., Mirror finish, swirl-free paint"
                value={expectedResult}
                onChange={(e) => setExpectedResult(e.target.value)}
              />
            </div>

            {/* Notes */}
            <div className="space-y-3">
              <Label htmlFor="notes" className="flex items-center gap-2 text-base font-semibold">
                <MessageSquare className="h-4 w-4" />
                Additional Notes
              </Label>
              <Textarea
                id="notes"
                placeholder="Special instructions, customer requests, areas to pay attention to..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
              />
            </div>

            {/* Media Upload Hints */}
            <div className="p-4 rounded-lg bg-muted/50 border border-border">
              <p className="text-sm font-medium mb-2">Media uploads available:</p>
              <div className="flex gap-4 text-muted-foreground">
                <div className="flex items-center gap-2 text-sm">
                  <Camera className="h-4 w-4" />
                  <span>Photos</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Video className="h-4 w-4" />
                  <span>Videos</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Mic className="h-4 w-4" />
                  <span>Voice Notes</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Media can be uploaded after saving the zone configuration
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Zone
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
