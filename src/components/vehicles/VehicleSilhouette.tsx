import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export type VehicleType = "sedan" | "suv" | "bike";

interface VehicleZone {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

// Sedan zones
const SEDAN_ZONES: VehicleZone[] = [
  { id: "hood", name: "Hood", x: 65, y: 30, width: 18, height: 18 },
  { id: "roof", name: "Roof", x: 42, y: 22, width: 16, height: 14 },
  { id: "trunk", name: "Trunk", x: 12, y: 35, width: 14, height: 14 },
  { id: "front_bumper", name: "Front Bumper", x: 82, y: 48, width: 12, height: 12 },
  { id: "rear_bumper", name: "Rear Bumper", x: 4, y: 48, width: 12, height: 12 },
  { id: "front_fender_l", name: "Front Left Fender", x: 68, y: 48, width: 12, height: 14 },
  { id: "front_fender_r", name: "Front Right Fender", x: 68, y: 28, width: 12, height: 14 },
  { id: "rear_fender_l", name: "Rear Left Fender", x: 18, y: 48, width: 12, height: 14 },
  { id: "rear_fender_r", name: "Rear Right Fender", x: 18, y: 28, width: 12, height: 14 },
  { id: "door_front_l", name: "Front Left Door", x: 50, y: 45, width: 16, height: 16 },
  { id: "door_front_r", name: "Front Right Door", x: 50, y: 28, width: 16, height: 16 },
  { id: "door_rear_l", name: "Rear Left Door", x: 32, y: 45, width: 16, height: 16 },
  { id: "door_rear_r", name: "Rear Right Door", x: 32, y: 28, width: 16, height: 16 },
  { id: "windshield", name: "Windshield", x: 56, y: 24, width: 10, height: 22 },
  { id: "rear_window", name: "Rear Window", x: 26, y: 26, width: 8, height: 18 },
];

// SUV zones (taller profile)
const SUV_ZONES: VehicleZone[] = [
  { id: "hood", name: "Hood", x: 62, y: 28, width: 20, height: 16 },
  { id: "roof", name: "Roof", x: 30, y: 15, width: 30, height: 14 },
  { id: "trunk", name: "Trunk/Tailgate", x: 5, y: 25, width: 16, height: 20 },
  { id: "front_bumper", name: "Front Bumper", x: 80, y: 50, width: 14, height: 14 },
  { id: "rear_bumper", name: "Rear Bumper", x: 2, y: 50, width: 14, height: 14 },
  { id: "front_fender_l", name: "Front Left Fender", x: 65, y: 45, width: 14, height: 16 },
  { id: "front_fender_r", name: "Front Right Fender", x: 65, y: 25, width: 14, height: 16 },
  { id: "rear_fender_l", name: "Rear Left Fender", x: 15, y: 45, width: 14, height: 16 },
  { id: "rear_fender_r", name: "Rear Right Fender", x: 15, y: 25, width: 14, height: 16 },
  { id: "door_front_l", name: "Front Left Door", x: 48, y: 42, width: 16, height: 18 },
  { id: "door_front_r", name: "Front Right Door", x: 48, y: 26, width: 16, height: 18 },
  { id: "door_rear_l", name: "Rear Left Door", x: 30, y: 42, width: 16, height: 18 },
  { id: "door_rear_r", name: "Rear Right Door", x: 30, y: 26, width: 16, height: 18 },
  { id: "windshield", name: "Windshield", x: 55, y: 18, width: 10, height: 24 },
  { id: "rear_window", name: "Rear Window", x: 20, y: 20, width: 10, height: 20 },
];

// Motorcycle zones
const BIKE_ZONES: VehicleZone[] = [
  { id: "fuel_tank", name: "Fuel Tank", x: 40, y: 18, width: 20, height: 18 },
  { id: "headlight", name: "Headlight", x: 72, y: 22, width: 14, height: 14 },
  { id: "taillight", name: "Taillight", x: 8, y: 30, width: 12, height: 12 },
  { id: "front_fender", name: "Front Fender", x: 75, y: 40, width: 14, height: 20 },
  { id: "rear_fender", name: "Rear Fender", x: 10, y: 42, width: 14, height: 18 },
  { id: "engine", name: "Engine", x: 40, y: 42, width: 20, height: 18 },
  { id: "exhaust", name: "Exhaust", x: 22, y: 52, width: 20, height: 12 },
  { id: "seat", name: "Seat", x: 28, y: 22, width: 18, height: 14 },
  { id: "handlebars", name: "Handlebars", x: 60, y: 10, width: 16, height: 14 },
  { id: "front_wheel", name: "Front Wheel", x: 70, y: 50, width: 18, height: 22 },
  { id: "rear_wheel", name: "Rear Wheel", x: 12, y: 50, width: 18, height: 22 },
  { id: "side_panels", name: "Side Panels", x: 25, y: 35, width: 16, height: 12 },
];

const VEHICLE_ZONES: Record<VehicleType, VehicleZone[]> = {
  sedan: SEDAN_ZONES,
  suv: SUV_ZONES,
  bike: BIKE_ZONES,
};

interface VehicleSilhouetteProps {
  vehicleType: VehicleType;
  selectedZones?: string[];
  completedZones?: string[];
  onZoneClick?: (zoneId: string) => void;
  className?: string;
  interactive?: boolean;
  showLabels?: boolean;
  vehicleColor?: string;
}

export function VehicleSilhouette({
  vehicleType,
  selectedZones = [],
  completedZones = [],
  onZoneClick,
  className,
  interactive = true,
  showLabels = true,
  vehicleColor = "hsl(220 14% 12%)",
}: VehicleSilhouetteProps) {
  const [hoveredZone, setHoveredZone] = useState<string | null>(null);
  const zones = VEHICLE_ZONES[vehicleType];

  return (
    <div className={cn("relative w-full aspect-[2/1] select-none", className)}>
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden rounded-xl">
        <motion.div
          className="absolute inset-0 bg-gradient-radial from-racing/10 via-transparent to-transparent"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
        <motion.div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80%] h-1 bg-gradient-to-r from-transparent via-racing/50 to-transparent"
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
        />
      </div>

      {/* Vehicle SVG */}
      <svg
        viewBox="0 0 100 75"
        className="absolute inset-0 w-full h-full"
        style={{ filter: "drop-shadow(0 4px 20px hsl(0 72% 50% / 0.2))" }}
      >
        {vehicleType === "sedan" && <SedanSVG color={vehicleColor} />}
        {vehicleType === "suv" && <SUVSVG color={vehicleColor} />}
        {vehicleType === "bike" && <BikeSVG color={vehicleColor} />}
      </svg>

      {/* Interactive zone overlays */}
      {interactive && (
        <div className="absolute inset-0">
          {zones.map((zone) => {
            const isSelected = selectedZones.includes(zone.id);
            const isCompleted = completedZones.includes(zone.id);
            const isHovered = hoveredZone === zone.id;

            return (
              <motion.button
                key={zone.id}
                className={cn(
                  "absolute rounded-md border-2 transition-all duration-200",
                  isCompleted
                    ? "border-green-500 bg-green-500/30 shadow-[0_0_12px_hsl(142_76%_36%_/_0.5)]"
                    : isSelected
                    ? "border-racing bg-racing/25 shadow-[0_0_15px_hsl(0_72%_50%_/_0.4)]"
                    : isHovered
                    ? "border-primary/70 bg-primary/15"
                    : "border-white/20 hover:border-primary/50 hover:bg-muted/20"
                )}
                style={{
                  left: `${zone.x}%`,
                  top: `${zone.y}%`,
                  width: `${zone.width}%`,
                  height: `${zone.height}%`,
                }}
                onClick={() => onZoneClick?.(zone.id)}
                onMouseEnter={() => setHoveredZone(zone.id)}
                onMouseLeave={() => setHoveredZone(null)}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 1.5 + Math.random() * 0.5 }}
              />
            );
          })}
        </div>
      )}

      {/* Zone label tooltip */}
      <AnimatePresence>
        {hoveredZone && showLabels && (
          <motion.div
            className="absolute top-2 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-lg bg-card border border-border shadow-lg z-10"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <span className="text-sm font-medium text-foreground">
              {zones.find((z) => z.id === hoveredZone)?.name}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selection count badge */}
      {selectedZones.length > 0 && (
        <motion.div
          className="absolute top-2 right-2 px-2 py-1 rounded-full bg-racing text-white text-xs font-bold"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        >
          {selectedZones.length} zone{selectedZones.length > 1 ? "s" : ""}
        </motion.div>
      )}

      {/* Completed count badge */}
      {completedZones.length > 0 && (
        <motion.div
          className="absolute bottom-2 right-2 px-2 py-1 rounded-full bg-green-500 text-white text-xs font-bold"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
        >
          {completedZones.length}/{zones.length} done
        </motion.div>
      )}
    </div>
  );
}

// Sedan SVG Component
function SedanSVG({ color }: { color: string }) {
  return (
    <motion.g
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{ duration: 2, ease: "easeInOut" }}
    >
      {/* Main body */}
      <motion.path
        d="M 10 52 Q 5 52 5 47 L 8 44 Q 12 40 18 38 L 28 35 Q 32 28 40 25 L 58 23 Q 65 22 72 26 L 80 34 Q 85 38 90 44 L 93 48 Q 96 52 94 55 L 90 58 Q 88 60 84 60 L 18 60 Q 12 60 10 56 Z"
        fill={color}
        stroke="hsl(0 72% 50%)"
        strokeWidth="0.6"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 2, ease: "easeOut" }}
      />
      {/* Window line */}
      <motion.path
        d="M 28 36 L 38 28 Q 45 24 55 23 L 68 26 Q 74 30 78 36"
        fill="none"
        stroke="hsl(220 10% 35%)"
        strokeWidth="0.4"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.5, delay: 0.5 }}
      />
      {/* Front wheel */}
      <motion.circle cx="78" cy="58" r="9" fill="hsl(220 14% 8%)" stroke="hsl(220 10% 40%)" strokeWidth="0.6" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1 }} />
      <motion.circle cx="78" cy="58" r="5.5" fill="hsl(220 12% 18%)" stroke="hsl(38 92% 50%)" strokeWidth="0.4" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.2 }} />
      {/* Rear wheel */}
      <motion.circle cx="24" cy="58" r="9" fill="hsl(220 14% 8%)" stroke="hsl(220 10% 40%)" strokeWidth="0.6" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.1 }} />
      <motion.circle cx="24" cy="58" r="5.5" fill="hsl(220 12% 18%)" stroke="hsl(38 92% 50%)" strokeWidth="0.4" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.3 }} />
      {/* Headlight */}
      <motion.ellipse cx="92" cy="48" rx="3" ry="2.5" fill="hsl(45 100% 75%)" initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 0.8, 1] }} transition={{ delay: 1.8 }} />
      {/* Taillight */}
      <motion.rect x="6" y="46" width="3.5" height="5" rx="0.6" fill="hsl(0 72% 50%)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }} />
    </motion.g>
  );
}

// SUV SVG Component
function SUVSVG({ color }: { color: string }) {
  return (
    <motion.g
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{ duration: 2, ease: "easeInOut" }}
    >
      {/* Main body - taller SUV shape */}
      <motion.path
        d="M 8 52 Q 4 52 4 46 L 6 42 Q 10 36 16 32 L 22 28 Q 26 18 35 15 L 60 14 Q 70 14 78 20 L 85 30 Q 90 36 94 44 L 96 50 Q 98 55 95 58 L 90 62 Q 86 64 80 64 L 20 64 Q 12 64 8 58 Z"
        fill={color}
        stroke="hsl(0 72% 50%)"
        strokeWidth="0.6"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 2, ease: "easeOut" }}
      />
      {/* Window area */}
      <motion.path
        d="M 22 30 L 32 18 Q 40 14 55 14 L 72 18 Q 78 22 82 30"
        fill="none"
        stroke="hsl(220 10% 35%)"
        strokeWidth="0.4"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.5, delay: 0.5 }}
      />
      {/* Roof rails */}
      <motion.line x1="30" y1="14" x2="65" y2="14" stroke="hsl(220 10% 50%)" strokeWidth="1" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.8 }} />
      {/* Front wheel */}
      <motion.circle cx="80" cy="62" r="10" fill="hsl(220 14% 8%)" stroke="hsl(220 10% 40%)" strokeWidth="0.7" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1 }} />
      <motion.circle cx="80" cy="62" r="6" fill="hsl(220 12% 18%)" stroke="hsl(38 92% 50%)" strokeWidth="0.5" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.2 }} />
      {/* Rear wheel */}
      <motion.circle cx="22" cy="62" r="10" fill="hsl(220 14% 8%)" stroke="hsl(220 10% 40%)" strokeWidth="0.7" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.1 }} />
      <motion.circle cx="22" cy="62" r="6" fill="hsl(220 12% 18%)" stroke="hsl(38 92% 50%)" strokeWidth="0.5" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.3 }} />
      {/* Headlight */}
      <motion.ellipse cx="94" cy="48" rx="3.5" ry="3" fill="hsl(45 100% 75%)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.8 }} />
      {/* Taillight */}
      <motion.rect x="4" y="44" width="4" height="6" rx="0.8" fill="hsl(0 72% 50%)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }} />
    </motion.g>
  );
}

// Motorcycle SVG Component
function BikeSVG({ color }: { color: string }) {
  return (
    <motion.g
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{ duration: 2, ease: "easeInOut" }}
    >
      {/* Frame */}
      <motion.path
        d="M 25 55 L 35 40 L 55 35 L 70 40 L 75 55"
        fill="none"
        stroke={color}
        strokeWidth="2"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.5 }}
      />
      {/* Fuel tank */}
      <motion.ellipse cx="48" cy="32" rx="12" ry="7" fill={color} stroke="hsl(0 72% 50%)" strokeWidth="0.5" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5 }} />
      {/* Seat */}
      <motion.path d="M 32 35 Q 38 28 48 30 Q 38 30 32 35" fill="hsl(220 14% 20%)" stroke="hsl(220 10% 40%)" strokeWidth="0.3" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.6 }} />
      {/* Handlebars */}
      <motion.path d="M 62 22 Q 68 18 74 22 M 68 20 L 68 30" fill="none" stroke="hsl(220 10% 50%)" strokeWidth="1.5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.8 }} />
      {/* Front fork */}
      <motion.line x1="72" y1="35" x2="78" y2="55" stroke="hsl(220 10% 40%)" strokeWidth="1.5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.9 }} />
      {/* Front wheel */}
      <motion.circle cx="78" cy="58" r="12" fill="hsl(220 14% 8%)" stroke="hsl(220 10% 40%)" strokeWidth="1" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1 }} />
      <motion.circle cx="78" cy="58" r="7" fill="hsl(220 12% 15%)" stroke="hsl(38 92% 50%)" strokeWidth="0.5" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.2 }} />
      {/* Rear wheel */}
      <motion.circle cx="22" cy="58" r="12" fill="hsl(220 14% 8%)" stroke="hsl(220 10% 40%)" strokeWidth="1" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.1 }} />
      <motion.circle cx="22" cy="58" r="7" fill="hsl(220 12% 15%)" stroke="hsl(38 92% 50%)" strokeWidth="0.5" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.3 }} />
      {/* Engine */}
      <motion.rect x="38" y="42" width="18" height="12" rx="2" fill="hsl(220 12% 25%)" stroke="hsl(220 10% 40%)" strokeWidth="0.4" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.4 }} />
      {/* Exhaust */}
      <motion.path d="M 38 52 L 28 56 Q 22 58 18 56" fill="none" stroke="hsl(220 10% 45%)" strokeWidth="2" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 1.5 }} />
      {/* Headlight */}
      <motion.circle cx="74" cy="28" r="4" fill="hsl(45 100% 75%)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.8 }} />
      {/* Taillight */}
      <motion.ellipse cx="15" cy="40" rx="2" ry="3" fill="hsl(0 72% 50%)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }} />
    </motion.g>
  );
}

export { VEHICLE_ZONES };
export type { VehicleZone };
