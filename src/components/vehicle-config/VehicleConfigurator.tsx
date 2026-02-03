import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Check,
  Plus,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { VehicleHotspot, HotspotData } from "./VehicleHotspot";
import { ServiceSelector } from "./ServiceSelector";

export type VehicleType = "sedan" | "suv" | "bike";
export type ViewAngle = "front" | "side" | "rear" | "top";

interface SelectedZone {
  id: string;
  name: string;
  services: string[];
  price: number;
}

interface VehicleConfiguratorProps {
  vehicleType: VehicleType;
  onVehicleTypeChange?: (type: VehicleType) => void;
  selectedZones: SelectedZone[];
  onZonesChange: (zones: SelectedZone[]) => void;
  readOnly?: boolean;
}

const VEHICLE_VIEWS: ViewAngle[] = ["front", "side", "rear", "top"];

const VIEW_LABELS: Record<ViewAngle, string> = {
  front: "Front View",
  side: "Side View", 
  rear: "Rear View",
  top: "Top View",
};

// Hotspot configurations per vehicle type and view
const HOTSPOTS: Record<VehicleType, Record<ViewAngle, HotspotData[]>> = {
  sedan: {
    front: [
      { id: "hood", name: "Hood", x: 50, y: 35, zone_type: "exterior" },
      { id: "windshield", name: "Windshield", x: 50, y: 55, zone_type: "glass" },
      { id: "front_bumper", name: "Front Bumper", x: 50, y: 85, zone_type: "exterior" },
      { id: "headlight_left", name: "Left Headlight", x: 25, y: 70, zone_type: "lighting" },
      { id: "headlight_right", name: "Right Headlight", x: 75, y: 70, zone_type: "lighting" },
    ],
    side: [
      { id: "roof", name: "Roof", x: 50, y: 20, zone_type: "exterior" },
      { id: "front_door", name: "Front Door", x: 35, y: 50, zone_type: "exterior" },
      { id: "rear_door", name: "Rear Door", x: 60, y: 50, zone_type: "exterior" },
      { id: "front_wheel", name: "Front Wheel", x: 22, y: 75, zone_type: "wheels" },
      { id: "rear_wheel", name: "Rear Wheel", x: 78, y: 75, zone_type: "wheels" },
      { id: "side_skirt", name: "Side Skirt", x: 50, y: 80, zone_type: "exterior" },
    ],
    rear: [
      { id: "trunk", name: "Trunk", x: 50, y: 40, zone_type: "exterior" },
      { id: "rear_windshield", name: "Rear Windshield", x: 50, y: 55, zone_type: "glass" },
      { id: "rear_bumper", name: "Rear Bumper", x: 50, y: 85, zone_type: "exterior" },
      { id: "taillight_left", name: "Left Taillight", x: 25, y: 65, zone_type: "lighting" },
      { id: "taillight_right", name: "Right Taillight", x: 75, y: 65, zone_type: "lighting" },
    ],
    top: [
      { id: "roof_top", name: "Roof Panel", x: 50, y: 45, zone_type: "exterior" },
      { id: "sunroof", name: "Sunroof", x: 50, y: 35, zone_type: "glass" },
      { id: "hood_top", name: "Hood", x: 50, y: 15, zone_type: "exterior" },
      { id: "trunk_top", name: "Trunk", x: 50, y: 80, zone_type: "exterior" },
    ],
  },
  suv: {
    front: [
      { id: "hood", name: "Hood", x: 50, y: 30, zone_type: "exterior" },
      { id: "grille", name: "Front Grille", x: 50, y: 65, zone_type: "exterior" },
      { id: "windshield", name: "Windshield", x: 50, y: 48, zone_type: "glass" },
      { id: "front_bumper", name: "Front Bumper", x: 50, y: 85, zone_type: "exterior" },
      { id: "fog_light_left", name: "Left Fog Light", x: 20, y: 80, zone_type: "lighting" },
      { id: "fog_light_right", name: "Right Fog Light", x: 80, y: 80, zone_type: "lighting" },
    ],
    side: [
      { id: "roof", name: "Roof", x: 50, y: 15, zone_type: "exterior" },
      { id: "roof_rails", name: "Roof Rails", x: 50, y: 10, zone_type: "accessories" },
      { id: "front_door", name: "Front Door", x: 30, y: 45, zone_type: "exterior" },
      { id: "rear_door", name: "Rear Door", x: 55, y: 45, zone_type: "exterior" },
      { id: "front_wheel", name: "Front Wheel", x: 18, y: 75, zone_type: "wheels" },
      { id: "rear_wheel", name: "Rear Wheel", x: 82, y: 75, zone_type: "wheels" },
      { id: "running_board", name: "Running Board", x: 50, y: 78, zone_type: "accessories" },
    ],
    rear: [
      { id: "tailgate", name: "Tailgate", x: 50, y: 45, zone_type: "exterior" },
      { id: "rear_windshield", name: "Rear Windshield", x: 50, y: 30, zone_type: "glass" },
      { id: "rear_bumper", name: "Rear Bumper", x: 50, y: 85, zone_type: "exterior" },
      { id: "spare_tire", name: "Spare Tire", x: 50, y: 55, zone_type: "wheels" },
    ],
    top: [
      { id: "roof_top", name: "Roof Panel", x: 50, y: 40, zone_type: "exterior" },
      { id: "roof_rack", name: "Roof Rack", x: 50, y: 30, zone_type: "accessories" },
      { id: "hood_top", name: "Hood", x: 50, y: 12, zone_type: "exterior" },
    ],
  },
  bike: {
    front: [
      { id: "headlight", name: "Headlight", x: 50, y: 25, zone_type: "lighting" },
      { id: "front_fender", name: "Front Fender", x: 50, y: 45, zone_type: "exterior" },
      { id: "front_wheel_bike", name: "Front Wheel", x: 50, y: 70, zone_type: "wheels" },
      { id: "handlebar", name: "Handlebar", x: 50, y: 15, zone_type: "controls" },
    ],
    side: [
      { id: "fuel_tank", name: "Fuel Tank", x: 40, y: 30, zone_type: "exterior" },
      { id: "seat", name: "Seat", x: 55, y: 35, zone_type: "interior" },
      { id: "engine", name: "Engine", x: 45, y: 55, zone_type: "mechanical" },
      { id: "exhaust", name: "Exhaust", x: 70, y: 65, zone_type: "mechanical" },
      { id: "front_wheel_side", name: "Front Wheel", x: 20, y: 70, zone_type: "wheels" },
      { id: "rear_wheel_side", name: "Rear Wheel", x: 80, y: 70, zone_type: "wheels" },
      { id: "chain_guard", name: "Chain Guard", x: 65, y: 75, zone_type: "mechanical" },
    ],
    rear: [
      { id: "taillight_bike", name: "Taillight", x: 50, y: 30, zone_type: "lighting" },
      { id: "rear_fender", name: "Rear Fender", x: 50, y: 50, zone_type: "exterior" },
      { id: "rear_wheel_bike", name: "Rear Wheel", x: 50, y: 70, zone_type: "wheels" },
      { id: "license_plate", name: "License Plate", x: 50, y: 85, zone_type: "accessories" },
    ],
    top: [
      { id: "tank_top", name: "Fuel Tank", x: 45, y: 35, zone_type: "exterior" },
      { id: "seat_top", name: "Seat", x: 60, y: 50, zone_type: "interior" },
      { id: "handlebar_top", name: "Handlebar", x: 30, y: 20, zone_type: "controls" },
    ],
  },
};

export function VehicleConfigurator({
  vehicleType,
  onVehicleTypeChange,
  selectedZones,
  onZonesChange,
  readOnly = false,
}: VehicleConfiguratorProps) {
  const [currentView, setCurrentView] = useState<ViewAngle>("side");
  const [activeHotspot, setActiveHotspot] = useState<HotspotData | null>(null);
  const [isRotating, setIsRotating] = useState(false);

  const rotateView = useCallback((direction: "left" | "right") => {
    setIsRotating(true);
    const currentIndex = VEHICLE_VIEWS.indexOf(currentView);
    const newIndex = direction === "right" 
      ? (currentIndex + 1) % VEHICLE_VIEWS.length
      : (currentIndex - 1 + VEHICLE_VIEWS.length) % VEHICLE_VIEWS.length;
    
    setTimeout(() => {
      setCurrentView(VEHICLE_VIEWS[newIndex]);
      setIsRotating(false);
    }, 150);
  }, [currentView]);

  const handleHotspotClick = (hotspot: HotspotData) => {
    if (readOnly) return;
    setActiveHotspot(hotspot);
  };

  const handleAddServices = (services: string[], price: number) => {
    if (!activeHotspot) return;
    
    const existingIndex = selectedZones.findIndex(z => z.id === activeHotspot.id);
    
    if (existingIndex >= 0) {
      const updated = [...selectedZones];
      updated[existingIndex] = {
        ...updated[existingIndex],
        services,
        price,
      };
      onZonesChange(updated);
    } else {
      onZonesChange([
        ...selectedZones,
        {
          id: activeHotspot.id,
          name: activeHotspot.name,
          services,
          price,
        },
      ]);
    }
    setActiveHotspot(null);
  };

  const handleRemoveZone = (zoneId: string) => {
    onZonesChange(selectedZones.filter(z => z.id !== zoneId));
  };

  const currentHotspots = HOTSPOTS[vehicleType][currentView];
  const totalPrice = selectedZones.reduce((sum, z) => sum + z.price, 0);

  return (
    <div className="space-y-6">
      {/* Vehicle Type Selector */}
      {onVehicleTypeChange && (
        <div className="flex justify-center gap-3">
          {(["sedan", "suv", "bike"] as VehicleType[]).map((type) => (
            <motion.button
              key={type}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onVehicleTypeChange(type)}
              className={cn(
                "px-6 py-3 rounded-xl font-medium transition-all duration-300 border-2",
                vehicleType === type
                  ? "bg-racing text-white border-racing shadow-lg shadow-racing/30"
                  : "bg-card border-border text-muted-foreground hover:border-racing/50 hover:text-foreground"
              )}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </motion.button>
          ))}
        </div>
      )}

      {/* Main Configurator */}
      <div className="relative">
        {/* View Controls */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <RotateCcw className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Rotate to explore</span>
          </div>
          <div className="flex items-center gap-2">
            {VEHICLE_VIEWS.map((view) => (
              <button
                key={view}
                onClick={() => setCurrentView(view)}
                className={cn(
                  "px-3 py-1.5 text-xs rounded-lg transition-all",
                  currentView === view
                    ? "bg-racing text-white"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                {VIEW_LABELS[view]}
              </button>
            ))}
          </div>
        </div>

        {/* 3D-Style Vehicle Display */}
        <motion.div
          className="relative bg-gradient-to-b from-card via-card/95 to-background rounded-2xl border border-border overflow-hidden"
          style={{ perspective: "1000px" }}
        >
          {/* Ambient lighting effect */}
          <div className="absolute inset-0 bg-gradient-radial from-racing/5 via-transparent to-transparent pointer-events-none" />
          
          {/* Floor reflection */}
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-racing/10 to-transparent pointer-events-none" />

          {/* Rotation Controls */}
          <button
            onClick={() => rotateView("left")}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-card/80 backdrop-blur border border-border hover:bg-racing hover:text-white hover:border-racing transition-all"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={() => rotateView("right")}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-card/80 backdrop-blur border border-border hover:bg-racing hover:text-white hover:border-racing transition-all"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          {/* Vehicle Container */}
          <div className="relative h-[400px] md:h-[500px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${vehicleType}-${currentView}`}
                initial={{ 
                  opacity: 0, 
                  rotateY: isRotating ? -30 : 0,
                  scale: 0.9 
                }}
                animate={{ 
                  opacity: 1, 
                  rotateY: 0,
                  scale: 1 
                }}
                exit={{ 
                  opacity: 0, 
                  rotateY: 30,
                  scale: 0.9 
                }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="absolute inset-0 flex items-center justify-center"
                style={{ transformStyle: "preserve-3d" }}
              >
                {/* Vehicle SVG */}
                <VehicleSVG 
                  vehicleType={vehicleType} 
                  view={currentView}
                  selectedZones={selectedZones.map(z => z.id)}
                />

                {/* Hotspots */}
                {currentHotspots.map((hotspot) => (
                  <VehicleHotspot
                    key={hotspot.id}
                    hotspot={hotspot}
                    isSelected={selectedZones.some(z => z.id === hotspot.id)}
                    isActive={activeHotspot?.id === hotspot.id}
                    onClick={() => handleHotspotClick(hotspot)}
                    readOnly={readOnly}
                  />
                ))}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Current View Label */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-card/80 backdrop-blur border border-border">
            <span className="text-sm font-medium">{VIEW_LABELS[currentView]}</span>
          </div>
        </motion.div>
      </div>

      {/* Selected Zones Summary */}
      {selectedZones.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl bg-card border border-border"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-racing" />
              Selected Services
            </h3>
            <Badge variant="outline" className="bg-racing/10 text-racing border-racing/30">
              ₹{totalPrice.toLocaleString()}
            </Badge>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedZones.map((zone) => (
              <motion.div
                key={zone.id}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted"
              >
                <Check className="h-3 w-3 text-green-500" />
                <span className="text-sm font-medium">{zone.name}</span>
                <span className="text-xs text-muted-foreground">
                  ({zone.services.length} services)
                </span>
                {!readOnly && (
                  <button
                    onClick={() => handleRemoveZone(zone.id)}
                    className="ml-1 p-0.5 rounded hover:bg-destructive/20 text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Service Selector Dialog */}
      <ServiceSelector
        open={!!activeHotspot}
        onClose={() => setActiveHotspot(null)}
        hotspot={activeHotspot}
        existingServices={selectedZones.find(z => z.id === activeHotspot?.id)?.services || []}
        existingPrice={selectedZones.find(z => z.id === activeHotspot?.id)?.price || 0}
        onSave={handleAddServices}
      />
    </div>
  );
}

// Premium Vehicle SVG Component
function VehicleSVG({ 
  vehicleType, 
  view,
  selectedZones 
}: { 
  vehicleType: VehicleType; 
  view: ViewAngle;
  selectedZones: string[];
}) {
  return (
    <div className="relative w-full max-w-[600px] h-full flex items-center justify-center">
      <svg
        viewBox="0 0 400 300"
        className="w-full h-auto max-h-[350px]"
        style={{ filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.3))" }}
      >
        {vehicleType === "sedan" && <SedanSVG view={view} />}
        {vehicleType === "suv" && <SUVSVG view={view} />}
        {vehicleType === "bike" && <BikeSVG view={view} />}
      </svg>
    </div>
  );
}

function SedanSVG({ view }: { view: ViewAngle }) {
  if (view === "front") {
    return (
      <g>
        {/* Body */}
        <path
          d="M80 200 L80 140 Q80 100 120 80 L280 80 Q320 100 320 140 L320 200 Q320 220 300 220 L100 220 Q80 220 80 200 Z"
          fill="hsl(var(--muted))"
          stroke="hsl(var(--racing))"
          strokeWidth="2"
        />
        {/* Windshield */}
        <path
          d="M120 130 L130 90 L270 90 L280 130 Z"
          fill="hsl(var(--background))"
          stroke="hsl(var(--border))"
          strokeWidth="1"
          opacity="0.8"
        />
        {/* Grille */}
        <rect x="140" y="160" width="120" height="30" rx="5" fill="hsl(var(--background))" opacity="0.5" />
        {/* Headlights */}
        <ellipse cx="100" cy="155" rx="15" ry="20" fill="hsl(var(--primary))" opacity="0.8" />
        <ellipse cx="300" cy="155" rx="15" ry="20" fill="hsl(var(--primary))" opacity="0.8" />
        {/* Wheels */}
        <ellipse cx="100" cy="220" rx="25" ry="10" fill="hsl(var(--foreground))" opacity="0.3" />
        <ellipse cx="300" cy="220" rx="25" ry="10" fill="hsl(var(--foreground))" opacity="0.3" />
      </g>
    );
  }
  
  if (view === "rear") {
    return (
      <g>
        {/* Body */}
        <path
          d="M80 200 L80 140 Q80 100 120 80 L280 80 Q320 100 320 140 L320 200 Q320 220 300 220 L100 220 Q80 220 80 200 Z"
          fill="hsl(var(--muted))"
          stroke="hsl(var(--racing))"
          strokeWidth="2"
        />
        {/* Rear windshield */}
        <path
          d="M130 130 L140 95 L260 95 L270 130 Z"
          fill="hsl(var(--background))"
          stroke="hsl(var(--border))"
          strokeWidth="1"
          opacity="0.8"
        />
        {/* Trunk */}
        <rect x="120" y="135" width="160" height="40" rx="5" fill="hsl(var(--muted-foreground))" opacity="0.3" />
        {/* Taillights */}
        <rect x="85" y="150" rx="3" width="20" height="35" fill="hsl(var(--racing))" opacity="0.9" />
        <rect x="295" y="150" rx="3" width="20" height="35" fill="hsl(var(--racing))" opacity="0.9" />
        {/* Bumper */}
        <rect x="100" y="195" width="200" height="15" rx="3" fill="hsl(var(--muted-foreground))" opacity="0.4" />
      </g>
    );
  }

  if (view === "top") {
    return (
      <g>
        {/* Body outline */}
        <path
          d="M150 40 Q200 30 250 40 L280 80 L290 200 Q290 240 200 250 Q110 240 110 200 L120 80 Z"
          fill="hsl(var(--muted))"
          stroke="hsl(var(--racing))"
          strokeWidth="2"
        />
        {/* Windshield */}
        <path
          d="M140 70 L260 70 L270 110 L130 110 Z"
          fill="hsl(var(--background))"
          stroke="hsl(var(--border))"
          strokeWidth="1"
          opacity="0.6"
        />
        {/* Roof */}
        <rect x="140" y="115" width="120" height="60" rx="10" fill="hsl(var(--muted-foreground))" opacity="0.3" />
        {/* Rear windshield */}
        <path
          d="M145 180 L255 180 L260 210 L140 210 Z"
          fill="hsl(var(--background))"
          stroke="hsl(var(--border))"
          strokeWidth="1"
          opacity="0.6"
        />
      </g>
    );
  }

  // Side view (default)
  return (
    <g>
      {/* Body */}
      <path
        d="M50 180 L50 140 L80 140 L100 100 L280 100 L320 140 L350 140 L350 180 Q350 200 330 200 L70 200 Q50 200 50 180 Z"
        fill="hsl(var(--muted))"
        stroke="hsl(var(--racing))"
        strokeWidth="2"
      />
      {/* Windows */}
      <path
        d="M110 105 L130 140 L175 140 L175 105 Z"
        fill="hsl(var(--background))"
        stroke="hsl(var(--border))"
        strokeWidth="1"
        opacity="0.8"
      />
      <path
        d="M180 105 L180 140 L230 140 L230 105 Z"
        fill="hsl(var(--background))"
        stroke="hsl(var(--border))"
        strokeWidth="1"
        opacity="0.8"
      />
      <path
        d="M235 105 L235 140 L290 140 L310 115 Z"
        fill="hsl(var(--background))"
        stroke="hsl(var(--border))"
        strokeWidth="1"
        opacity="0.8"
      />
      {/* Wheels */}
      <circle cx="100" cy="200" r="30" fill="hsl(var(--foreground))" opacity="0.8" />
      <circle cx="100" cy="200" r="18" fill="hsl(var(--muted))" />
      <circle cx="100" cy="200" r="8" fill="hsl(var(--foreground))" opacity="0.5" />
      <circle cx="300" cy="200" r="30" fill="hsl(var(--foreground))" opacity="0.8" />
      <circle cx="300" cy="200" r="18" fill="hsl(var(--muted))" />
      <circle cx="300" cy="200" r="8" fill="hsl(var(--foreground))" opacity="0.5" />
      {/* Door handles */}
      <rect x="155" y="135" width="15" height="4" rx="2" fill="hsl(var(--foreground))" opacity="0.5" />
      <rect x="210" y="135" width="15" height="4" rx="2" fill="hsl(var(--foreground))" opacity="0.5" />
    </g>
  );
}

function SUVSVG({ view }: { view: ViewAngle }) {
  if (view === "front") {
    return (
      <g>
        {/* Body */}
        <path
          d="M60 200 L60 100 Q60 70 100 60 L300 60 Q340 70 340 100 L340 200 Q340 220 320 220 L80 220 Q60 220 60 200 Z"
          fill="hsl(var(--muted))"
          stroke="hsl(var(--racing))"
          strokeWidth="2"
        />
        {/* Windshield */}
        <path
          d="M100 100 L120 70 L280 70 L300 100 Z"
          fill="hsl(var(--background))"
          stroke="hsl(var(--border))"
          strokeWidth="1"
          opacity="0.8"
        />
        {/* Grille */}
        <rect x="120" y="130" width="160" height="40" rx="5" fill="hsl(var(--background))" opacity="0.5" />
        {/* Headlights */}
        <rect x="70" y="120" rx="5" width="35" height="25" fill="hsl(var(--primary))" opacity="0.8" />
        <rect x="295" y="120" rx="5" width="35" height="25" fill="hsl(var(--primary))" opacity="0.8" />
        {/* Fog lights */}
        <circle cx="90" cy="185" r="10" fill="hsl(var(--primary))" opacity="0.6" />
        <circle cx="310" cy="185" r="10" fill="hsl(var(--primary))" opacity="0.6" />
      </g>
    );
  }

  if (view === "rear") {
    return (
      <g>
        {/* Body */}
        <path
          d="M60 200 L60 100 Q60 70 100 60 L300 60 Q340 70 340 100 L340 200 Q340 220 320 220 L80 220 Q60 220 60 200 Z"
          fill="hsl(var(--muted))"
          stroke="hsl(var(--racing))"
          strokeWidth="2"
        />
        {/* Rear windshield */}
        <path
          d="M110 100 L130 70 L270 70 L290 100 Z"
          fill="hsl(var(--background))"
          stroke="hsl(var(--border))"
          strokeWidth="1"
          opacity="0.8"
        />
        {/* Tailgate */}
        <rect x="100" y="105" width="200" height="70" rx="5" fill="hsl(var(--muted-foreground))" opacity="0.2" />
        {/* Spare tire */}
        <circle cx="200" cy="145" r="35" fill="hsl(var(--foreground))" opacity="0.4" />
        <circle cx="200" cy="145" r="20" fill="hsl(var(--muted))" />
        {/* Taillights */}
        <rect x="65" y="120" rx="3" width="25" height="50" fill="hsl(var(--racing))" opacity="0.9" />
        <rect x="310" y="120" rx="3" width="25" height="50" fill="hsl(var(--racing))" opacity="0.9" />
      </g>
    );
  }

  if (view === "top") {
    return (
      <g>
        {/* Body outline */}
        <path
          d="M120 30 Q200 20 280 30 L310 70 L320 220 Q320 260 200 270 Q80 260 80 220 L90 70 Z"
          fill="hsl(var(--muted))"
          stroke="hsl(var(--racing))"
          strokeWidth="2"
        />
        {/* Roof rails */}
        <rect x="95" y="80" width="10" height="130" rx="5" fill="hsl(var(--foreground))" opacity="0.4" />
        <rect x="295" y="80" width="10" height="130" rx="5" fill="hsl(var(--foreground))" opacity="0.4" />
        {/* Sunroof */}
        <rect x="150" y="100" width="100" height="80" rx="10" fill="hsl(var(--background))" opacity="0.5" />
      </g>
    );
  }

  // Side view
  return (
    <g>
      {/* Body */}
      <path
        d="M40 180 L40 120 L70 120 L90 70 L310 70 L340 120 L360 120 L360 180 Q360 210 340 210 L60 210 Q40 210 40 180 Z"
        fill="hsl(var(--muted))"
        stroke="hsl(var(--racing))"
        strokeWidth="2"
      />
      {/* Roof rails */}
      <rect x="95" y="65" width="210" height="8" rx="4" fill="hsl(var(--foreground))" opacity="0.4" />
      {/* Windows */}
      <path
        d="M100 75 L120 120 L165 120 L165 80 Z"
        fill="hsl(var(--background))"
        stroke="hsl(var(--border))"
        strokeWidth="1"
        opacity="0.8"
      />
      <path
        d="M170 80 L170 120 L220 120 L220 80 Z"
        fill="hsl(var(--background))"
        stroke="hsl(var(--border))"
        strokeWidth="1"
        opacity="0.8"
      />
      <path
        d="M225 80 L225 120 L300 120 L320 90 Z"
        fill="hsl(var(--background))"
        stroke="hsl(var(--border))"
        strokeWidth="1"
        opacity="0.8"
      />
      {/* Running board */}
      <rect x="80" y="195" width="240" height="8" rx="2" fill="hsl(var(--foreground))" opacity="0.3" />
      {/* Wheels - larger for SUV */}
      <circle cx="95" cy="210" r="35" fill="hsl(var(--foreground))" opacity="0.8" />
      <circle cx="95" cy="210" r="22" fill="hsl(var(--muted))" />
      <circle cx="95" cy="210" r="10" fill="hsl(var(--foreground))" opacity="0.5" />
      <circle cx="305" cy="210" r="35" fill="hsl(var(--foreground))" opacity="0.8" />
      <circle cx="305" cy="210" r="22" fill="hsl(var(--muted))" />
      <circle cx="305" cy="210" r="10" fill="hsl(var(--foreground))" opacity="0.5" />
    </g>
  );
}

function BikeSVG({ view }: { view: ViewAngle }) {
  if (view === "front") {
    return (
      <g>
        {/* Handlebar */}
        <rect x="130" y="60" width="140" height="8" rx="4" fill="hsl(var(--foreground))" opacity="0.8" />
        {/* Headlight */}
        <circle cx="200" cy="90" r="25" fill="hsl(var(--primary))" opacity="0.9" />
        <circle cx="200" cy="90" r="18" fill="hsl(var(--background))" opacity="0.5" />
        {/* Fork */}
        <rect x="170" y="100" width="8" height="80" fill="hsl(var(--foreground))" opacity="0.6" />
        <rect x="222" y="100" width="8" height="80" fill="hsl(var(--foreground))" opacity="0.6" />
        {/* Front fender */}
        <path
          d="M150 150 Q200 130 250 150 L250 170 Q200 160 150 170 Z"
          fill="hsl(var(--muted))"
          stroke="hsl(var(--racing))"
          strokeWidth="2"
        />
        {/* Front wheel */}
        <ellipse cx="200" cy="200" rx="60" ry="20" fill="hsl(var(--foreground))" opacity="0.3" />
        <circle cx="200" cy="200" r="50" fill="hsl(var(--foreground))" opacity="0.8" stroke="none" />
        <circle cx="200" cy="200" r="30" fill="hsl(var(--muted))" />
      </g>
    );
  }

  if (view === "rear") {
    return (
      <g>
        {/* Seat */}
        <path
          d="M160 80 Q200 70 240 80 L250 100 L150 100 Z"
          fill="hsl(var(--foreground))"
          opacity="0.7"
        />
        {/* Taillight */}
        <rect x="180" y="105" width="40" height="15" rx="3" fill="hsl(var(--racing))" opacity="0.9" />
        {/* Rear fender */}
        <path
          d="M140 130 Q200 110 260 130 L260 160 Q200 150 140 160 Z"
          fill="hsl(var(--muted))"
          stroke="hsl(var(--racing))"
          strokeWidth="2"
        />
        {/* License plate */}
        <rect x="170" y="170" width="60" height="25" rx="3" fill="hsl(var(--background))" stroke="hsl(var(--border))" />
        {/* Rear wheel */}
        <ellipse cx="200" cy="220" rx="55" ry="18" fill="hsl(var(--foreground))" opacity="0.3" />
        <circle cx="200" cy="220" r="45" fill="hsl(var(--foreground))" opacity="0.8" />
        <circle cx="200" cy="220" r="28" fill="hsl(var(--muted))" />
      </g>
    );
  }

  if (view === "top") {
    return (
      <g>
        {/* Handlebar */}
        <rect x="120" y="60" width="160" height="12" rx="6" fill="hsl(var(--foreground))" opacity="0.7" />
        {/* Tank */}
        <path
          d="M170 90 Q200 80 230 90 L240 140 Q200 150 160 140 Z"
          fill="hsl(var(--muted))"
          stroke="hsl(var(--racing))"
          strokeWidth="2"
        />
        {/* Seat */}
        <path
          d="M175 150 Q200 145 225 150 L230 210 Q200 220 170 210 Z"
          fill="hsl(var(--foreground))"
          opacity="0.6"
        />
        {/* Front wheel */}
        <ellipse cx="200" cy="50" rx="15" ry="30" fill="hsl(var(--foreground))" opacity="0.5" />
        {/* Rear wheel */}
        <ellipse cx="200" cy="240" rx="18" ry="35" fill="hsl(var(--foreground))" opacity="0.5" />
      </g>
    );
  }

  // Side view
  return (
    <g>
      {/* Frame */}
      <path
        d="M160 150 L200 100 L280 150 L240 150 L200 180 L160 150"
        fill="none"
        stroke="hsl(var(--racing))"
        strokeWidth="4"
      />
      {/* Tank */}
      <path
        d="M150 120 Q180 100 210 110 L210 140 Q180 150 150 140 Z"
        fill="hsl(var(--muted))"
        stroke="hsl(var(--racing))"
        strokeWidth="2"
      />
      {/* Seat */}
      <path
        d="M210 115 Q250 105 290 120 L290 135 Q250 140 210 130 Z"
        fill="hsl(var(--foreground))"
        opacity="0.7"
      />
      {/* Engine */}
      <rect x="175" y="150" width="50" height="40" rx="5" fill="hsl(var(--muted-foreground))" opacity="0.5" />
      {/* Exhaust */}
      <path
        d="M230 175 L320 185 L320 195 L230 185 Z"
        fill="hsl(var(--muted-foreground))"
        opacity="0.6"
      />
      {/* Handlebars */}
      <line x1="145" y1="90" x2="175" y2="110" stroke="hsl(var(--foreground))" strokeWidth="4" opacity="0.7" />
      {/* Fork */}
      <line x1="160" y1="110" x2="120" y2="200" stroke="hsl(var(--foreground))" strokeWidth="6" opacity="0.6" />
      {/* Front fender */}
      <path
        d="M90 170 Q120 150 150 170"
        fill="none"
        stroke="hsl(var(--muted))"
        strokeWidth="8"
      />
      {/* Rear fender */}
      <path
        d="M270 170 Q300 150 330 170"
        fill="none"
        stroke="hsl(var(--muted))"
        strokeWidth="8"
      />
      {/* Headlight */}
      <circle cx="135" cy="100" r="15" fill="hsl(var(--primary))" opacity="0.9" />
      {/* Front wheel */}
      <circle cx="120" cy="200" r="40" fill="hsl(var(--foreground))" opacity="0.8" />
      <circle cx="120" cy="200" r="25" fill="hsl(var(--muted))" />
      <circle cx="120" cy="200" r="8" fill="hsl(var(--foreground))" opacity="0.5" />
      {/* Rear wheel */}
      <circle cx="300" cy="200" r="40" fill="hsl(var(--foreground))" opacity="0.8" />
      <circle cx="300" cy="200" r="25" fill="hsl(var(--muted))" />
      <circle cx="300" cy="200" r="8" fill="hsl(var(--foreground))" opacity="0.5" />
      {/* Chain */}
      <ellipse cx="240" cy="200" rx="30" ry="5" fill="hsl(var(--foreground))" opacity="0.3" />
    </g>
  );
}
