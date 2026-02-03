import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface CarZone {
  id: string;
  name: string;
  path: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface AnimatedCarSilhouetteProps {
  selectedZones?: string[];
  onZoneClick?: (zoneId: string) => void;
  className?: string;
  interactive?: boolean;
}

const CAR_ZONES: CarZone[] = [
  { id: "hood", name: "Hood", path: "hood", x: 65, y: 35, width: 20, height: 15 },
  { id: "roof", name: "Roof", path: "roof", x: 45, y: 25, width: 15, height: 12 },
  { id: "trunk", name: "Trunk", path: "trunk", x: 15, y: 40, width: 15, height: 12 },
  { id: "front_bumper", name: "Front Bumper", path: "front-bumper", x: 80, y: 55, width: 12, height: 10 },
  { id: "rear_bumper", name: "Rear Bumper", path: "rear-bumper", x: 5, y: 55, width: 12, height: 10 },
  { id: "front_fender_l", name: "Front Left Fender", path: "front-fender-l", x: 70, y: 50, width: 10, height: 12 },
  { id: "front_fender_r", name: "Front Right Fender", path: "front-fender-r", x: 70, y: 35, width: 10, height: 12 },
  { id: "rear_fender_l", name: "Rear Left Fender", path: "rear-fender-l", x: 20, y: 50, width: 10, height: 12 },
  { id: "rear_fender_r", name: "Rear Right Fender", path: "rear-fender-r", x: 20, y: 35, width: 10, height: 12 },
  { id: "door_front_l", name: "Front Left Door", path: "door-front-l", x: 52, y: 48, width: 14, height: 15 },
  { id: "door_front_r", name: "Front Right Door", path: "door-front-r", x: 52, y: 32, width: 14, height: 15 },
  { id: "door_rear_l", name: "Rear Left Door", path: "door-rear-l", x: 35, y: 48, width: 14, height: 15 },
  { id: "door_rear_r", name: "Rear Right Door", path: "door-rear-r", x: 35, y: 32, width: 14, height: 15 },
  { id: "windshield", name: "Windshield", path: "windshield", x: 58, y: 28, width: 10, height: 20 },
  { id: "rear_window", name: "Rear Window", path: "rear-window", x: 28, y: 28, width: 8, height: 18 },
];

export function AnimatedCarSilhouette({
  selectedZones = [],
  onZoneClick,
  className,
  interactive = true,
}: AnimatedCarSilhouetteProps) {
  const [hoveredZone, setHoveredZone] = useState<string | null>(null);

  return (
    <div className={cn("relative w-full aspect-[2/1] select-none", className)}>
      {/* Background glow effects */}
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

      {/* Car SVG */}
      <svg
        viewBox="0 0 100 70"
        className="absolute inset-0 w-full h-full car-glow"
        style={{ filter: "drop-shadow(0 4px 20px hsl(0 72% 50% / 0.2))" }}
      >
        {/* Car body outline with animation */}
        <motion.g
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 2, ease: "easeInOut" }}
        >
          {/* Main body shape */}
          <motion.path
            d="M 10 50 
               Q 5 50 5 45 
               L 8 42 
               Q 10 40 15 38 
               L 25 35 
               Q 30 30 35 28 
               L 55 25 
               Q 60 24 65 26 
               L 75 32 
               Q 80 35 85 40 
               L 90 45 
               Q 95 48 95 52 
               L 92 55 
               Q 90 58 85 58 
               L 20 58 
               Q 12 58 10 55 
               Z"
            fill="hsl(220 14% 12%)"
            stroke="hsl(0 72% 50%)"
            strokeWidth="0.5"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, ease: "easeOut" }}
          />
          
          {/* Window line */}
          <motion.path
            d="M 28 35 L 35 30 Q 40 27 50 26 L 62 28 Q 68 30 72 35"
            fill="none"
            stroke="hsl(220 10% 30%)"
            strokeWidth="0.3"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, delay: 0.5 }}
          />
          
          {/* Front wheel */}
          <motion.circle
            cx="75"
            cy="55"
            r="8"
            fill="hsl(220 14% 8%)"
            stroke="hsl(220 10% 35%)"
            strokeWidth="0.5"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 1 }}
          />
          <motion.circle
            cx="75"
            cy="55"
            r="5"
            fill="hsl(220 12% 15%)"
            stroke="hsl(38 92% 50%)"
            strokeWidth="0.3"
            initial={{ scale: 0, rotate: 0 }}
            animate={{ scale: 1, rotate: 360 }}
            transition={{ duration: 1, delay: 1.2 }}
          />
          
          {/* Rear wheel */}
          <motion.circle
            cx="25"
            cy="55"
            r="8"
            fill="hsl(220 14% 8%)"
            stroke="hsl(220 10% 35%)"
            strokeWidth="0.5"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 1.1 }}
          />
          <motion.circle
            cx="25"
            cy="55"
            r="5"
            fill="hsl(220 12% 15%)"
            stroke="hsl(38 92% 50%)"
            strokeWidth="0.3"
            initial={{ scale: 0, rotate: 0 }}
            animate={{ scale: 1, rotate: 360 }}
            transition={{ duration: 1, delay: 1.3 }}
          />
          
          {/* Headlight */}
          <motion.ellipse
            cx="90"
            cy="46"
            rx="3"
            ry="2"
            fill="hsl(45 100% 70%)"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0.7, 1] }}
            transition={{ duration: 0.5, delay: 1.8, times: [0, 0.3, 0.6, 1] }}
          />
          
          {/* Taillight */}
          <motion.rect
            x="7"
            y="44"
            width="3"
            height="4"
            rx="0.5"
            fill="hsl(0 72% 50%)"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0.6, 1] }}
            transition={{ duration: 0.5, delay: 2 }}
          />
        </motion.g>
      </svg>

      {/* Interactive zone overlays */}
      {interactive && (
        <div className="absolute inset-0">
          {CAR_ZONES.map((zone) => {
            const isSelected = selectedZones.includes(zone.id);
            const isHovered = hoveredZone === zone.id;

            return (
              <motion.button
                key={zone.id}
                className={cn(
                  "absolute rounded-md border transition-all duration-200",
                  isSelected
                    ? "border-racing bg-racing/20 shadow-[0_0_15px_hsl(0_72%_50%_/_0.4)]"
                    : isHovered
                    ? "border-primary/60 bg-primary/10"
                    : "border-transparent hover:border-muted-foreground/30 hover:bg-muted/20"
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
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 2 + Math.random() * 0.5 }}
              />
            );
          })}
        </div>
      )}

      {/* Zone label tooltip */}
      <AnimatePresence>
        {hoveredZone && (
          <motion.div
            className="absolute top-2 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-lg bg-card border border-border shadow-lg z-10"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <span className="text-sm font-medium text-foreground">
              {CAR_ZONES.find((z) => z.id === hoveredZone)?.name}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selection count badge */}
      {selectedZones.length > 0 && (
        <motion.div
          className="absolute top-2 right-2 px-2 py-1 rounded-full bg-racing text-accent-foreground text-xs font-bold"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        >
          {selectedZones.length} zone{selectedZones.length > 1 ? "s" : ""} selected
        </motion.div>
      )}
    </div>
  );
}

export { CAR_ZONES };
export type { CarZone };
