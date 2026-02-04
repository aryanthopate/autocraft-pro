import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Circle, ChevronDown, Car, Layers, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface JobZone {
  id: string;
  zone_name: string;
  zone_type: string;
  services: any;
  completed: boolean;
  notes: string | null;
}

interface VehicleZoneSelectorProps {
  zones: JobZone[];
  vehicleType: string;
  onCompleteZone: (zoneId: string) => void;
  disabled: boolean;
}

// Categorize zones for quick selection
const ZONE_CATEGORIES = {
  whole_car: {
    label: "Whole Car",
    icon: Car,
    zones: ["hood", "roof", "trunk", "front_bumper", "rear_bumper", "front_fender_l", "front_fender_r", "rear_fender_l", "rear_fender_r", "door_front_l", "door_front_r", "door_rear_l", "door_rear_r", "windshield", "rear_window"],
  },
  left_side: {
    label: "Left Side",
    icon: ArrowLeft,
    zones: ["front_fender_l", "rear_fender_l", "door_front_l", "door_rear_l"],
  },
  right_side: {
    label: "Right Side", 
    icon: ArrowRight,
    zones: ["front_fender_r", "rear_fender_r", "door_front_r", "door_rear_r"],
  },
  front: {
    label: "Front",
    icon: Car,
    zones: ["hood", "front_bumper", "front_fender_l", "front_fender_r", "windshield"],
  },
  rear: {
    label: "Rear",
    icon: Car,
    zones: ["trunk", "rear_bumper", "rear_fender_l", "rear_fender_r", "rear_window"],
  },
  exterior: {
    label: "Exterior",
    icon: Layers,
    zones: ["hood", "roof", "trunk", "front_bumper", "rear_bumper", "front_fender_l", "front_fender_r", "rear_fender_l", "rear_fender_r", "door_front_l", "door_front_r", "door_rear_l", "door_rear_r"],
  },
  glass: {
    label: "Glass",
    icon: Layers,
    zones: ["windshield", "rear_window"],
  },
};

export function VehicleZoneSelector({ zones, vehicleType, onCompleteZone, disabled }: VehicleZoneSelectorProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>("all");

  const completedCount = zones.filter(z => z.completed).length;
  const totalCount = zones.length;

  // Group zones by their matching categories
  const categorizedZones = zones.reduce((acc, zone) => {
    const zoneId = zone.zone_name.toLowerCase().replace(/\s+/g, "_");
    const category = Object.entries(ZONE_CATEGORIES).find(([_, cat]) => 
      cat.zones.includes(zoneId)
    )?.[0] || "other";
    
    if (!acc[category]) acc[category] = [];
    acc[category].push(zone);
    return acc;
  }, {} as Record<string, JobZone[]>);

  return (
    <div className="divide-y">
      {/* Quick Selection Header */}
      <div className="p-4 bg-muted/30">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold flex items-center gap-2">
            <Layers className="h-4 w-4 text-primary" />
            Vehicle Zones
          </h3>
          <Badge variant="outline" className={cn(
            completedCount === totalCount 
              ? "bg-accent/50 text-accent-foreground border-accent"
              : "bg-primary/15 text-primary border-primary/30"
          )}>
            {completedCount}/{totalCount} completed
          </Badge>
        </div>
        
        {/* Quick Category Buttons */}
        <div className="flex flex-wrap gap-2">
          {Object.entries(ZONE_CATEGORIES).slice(0, 4).map(([key, cat]) => {
            const categoryZones = zones.filter(z => 
              cat.zones.includes(z.zone_name.toLowerCase().replace(/\s+/g, "_"))
            );
            const allCompleted = categoryZones.length > 0 && categoryZones.every(z => z.completed);
            const someCompleted = categoryZones.some(z => z.completed);
            
            return (
              <Button
                key={key}
                variant="outline"
                size="sm"
                className={cn(
                  "gap-1.5 text-xs",
                  allCompleted && "bg-accent/30 border-accent text-accent-foreground",
                  someCompleted && !allCompleted && "bg-secondary/50 border-secondary text-secondary-foreground"
                )}
                onClick={() => setExpandedCategory(expandedCategory === key ? null : key)}
              >
                <cat.icon className="h-3 w-3" />
                {cat.label}
                <span className="opacity-70">
                  ({categoryZones.filter(z => z.completed).length}/{categoryZones.length})
                </span>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Zone List */}
      <div className="max-h-[400px] overflow-y-auto">
        <AnimatePresence mode="popLayout">
          {zones.map((zone, i) => {
            const zoneId = zone.zone_name.toLowerCase().replace(/\s+/g, "_");
            const services = Array.isArray(zone.services) ? zone.services : [];
            
            return (
              <motion.div
                key={zone.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: i * 0.03 }}
                className={cn(
                  "group flex items-center gap-4 p-4 border-b last:border-b-0 transition-colors",
                  zone.completed ? "bg-accent/30" : "hover:bg-muted/50"
                )}
              >
                {/* Completion Toggle */}
                <button
                  onClick={() => !zone.completed && !disabled && onCompleteZone(zone.id)}
                  disabled={disabled || zone.completed}
                  className={cn(
                    "h-10 w-10 rounded-xl flex items-center justify-center transition-all flex-shrink-0",
                    zone.completed
                      ? "bg-accent text-accent-foreground shadow-lg"
                      : disabled
                      ? "border-2 border-muted-foreground/20 cursor-not-allowed"
                      : "border-2 border-muted-foreground/30 hover:border-primary hover:bg-primary/10 hover:scale-110 cursor-pointer"
                  )}
                >
                  {zone.completed ? (
                    <CheckCircle2 className="h-6 w-6" />
                  ) : (
                    <Circle className="h-6 w-6 opacity-30 group-hover:opacity-100 transition-opacity" />
                  )}
                </button>

                {/* Zone Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={cn(
                      "font-medium",
                      zone.completed && "text-muted-foreground line-through"
                    )}>
                      {zone.zone_name}
                    </p>
                    <Badge variant="outline" className="text-xs">
                      {zone.zone_type}
                    </Badge>
                  </div>
                  {services.length > 0 && (
                    <p className="text-sm text-muted-foreground mt-0.5 truncate">
                      {services.join(" • ")}
                    </p>
                  )}
                  {zone.notes && (
                    <p className="text-xs text-secondary-foreground mt-1 truncate">
                      📝 {zone.notes}
                    </p>
                  )}
                </div>

                {/* Status Badge */}
                {zone.completed && (
                  <Badge className="bg-accent/50 text-accent-foreground border-accent">
                    Done
                  </Badge>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
