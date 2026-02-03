import { motion } from "framer-motion";
import { Plus, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface HotspotData {
  id: string;
  name: string;
  x: number;
  y: number;
  zone_type: string;
}

interface VehicleHotspotProps {
  hotspot: HotspotData;
  isSelected: boolean;
  isActive: boolean;
  onClick: () => void;
  readOnly?: boolean;
}

export function VehicleHotspot({
  hotspot,
  isSelected,
  isActive,
  onClick,
  readOnly = false,
}: VehicleHotspotProps) {
  return (
    <motion.button
      onClick={onClick}
      disabled={readOnly}
      className={cn(
        "absolute z-10 group",
        readOnly && "cursor-default"
      )}
      style={{
        left: `${hotspot.x}%`,
        top: `${hotspot.y}%`,
        transform: "translate(-50%, -50%)",
      }}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      whileHover={readOnly ? {} : { scale: 1.2 }}
      whileTap={readOnly ? {} : { scale: 0.9 }}
    >
      {/* Pulse ring */}
      {!isSelected && !readOnly && (
        <motion.div
          className="absolute inset-0 rounded-full bg-racing/30"
          animate={{
            scale: [1, 1.8, 1],
            opacity: [0.6, 0, 0.6],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            width: "100%",
            height: "100%",
          }}
        />
      )}

      {/* Main button */}
      <div
        className={cn(
          "relative flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-300",
          isSelected
            ? "bg-green-500 border-green-400 text-white shadow-lg shadow-green-500/40"
            : isActive
            ? "bg-racing border-racing text-white shadow-lg shadow-racing/50 scale-125"
            : "bg-card/90 border-racing/60 text-racing hover:bg-racing hover:text-white hover:border-racing"
        )}
      >
        {isSelected ? (
          <Check className="h-4 w-4" />
        ) : (
          <Plus className="h-4 w-4" />
        )}
      </div>

      {/* Tooltip */}
      <div
        className={cn(
          "absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-lg bg-card border border-border shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none",
          isActive && "opacity-100"
        )}
      >
        <span className="text-xs font-medium">{hotspot.name}</span>
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-card border-r border-b border-border rotate-45" />
      </div>
    </motion.button>
  );
}
