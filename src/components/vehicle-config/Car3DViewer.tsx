import { Suspense, useRef, useState, useEffect, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows, useGLTF, Html, Center } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import * as THREE from "three";
import { Maximize2, Loader2, X, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { VEHICLE_COLORS } from "@/data/vehicleData";

interface Hotspot3D {
  id: string;
  name: string;
  position: [number, number, number];
  zone_type: string;
}

interface SelectedZone {
  id: string;
  name: string;
  services: string[];
  price: number;
}

interface Car3DViewerProps {
  carColor?: string;
  selectedZones: SelectedZone[];
  onHotspotClick: (hotspot: Hotspot3D) => void;
  readOnly?: boolean;
  vehicleMake?: string;
  vehicleModel?: string;
  vehicleCategory?: string;
  onZoneRemove?: (zoneId: string) => void;
  onColorChange?: (color: string) => void;
}

// CAR/SUV/TRUCK Hotspot definitions using relative positions (0-1 range that scales with model)
const CAR_HOTSPOT_DEFINITIONS = [
  { id: "hood", name: "Hood", relPos: [0, 0.5, 0.7], zone_type: "exterior" },
  { id: "roof", name: "Roof", relPos: [0, 0.85, 0], zone_type: "exterior" },
  { id: "trunk", name: "Trunk", relPos: [0, 0.45, -0.7], zone_type: "exterior" },
  { id: "front_bumper", name: "Front Bumper", relPos: [0, 0.2, 0.95], zone_type: "exterior" },
  { id: "rear_bumper", name: "Rear Bumper", relPos: [0, 0.2, -0.95], zone_type: "exterior" },
  { id: "driver_door", name: "Driver Door", relPos: [0.5, 0.4, 0.1], zone_type: "exterior" },
  { id: "passenger_door", name: "Passenger Door", relPos: [-0.5, 0.4, 0.1], zone_type: "exterior" },
  { id: "front_left_wheel", name: "Front Left Wheel", relPos: [0.45, 0.15, 0.55], zone_type: "wheels" },
  { id: "front_right_wheel", name: "Front Right Wheel", relPos: [-0.45, 0.15, 0.55], zone_type: "wheels" },
  { id: "rear_left_wheel", name: "Rear Left Wheel", relPos: [0.45, 0.15, -0.55], zone_type: "wheels" },
  { id: "rear_right_wheel", name: "Rear Right Wheel", relPos: [-0.45, 0.15, -0.55], zone_type: "wheels" },
  { id: "windshield", name: "Windshield", relPos: [0, 0.7, 0.4], zone_type: "glass" },
  { id: "rear_windshield", name: "Rear Windshield", relPos: [0, 0.65, -0.4], zone_type: "glass" },
  { id: "headlight_left", name: "Left Headlight", relPos: [0.35, 0.3, 0.9], zone_type: "lighting" },
  { id: "headlight_right", name: "Right Headlight", relPos: [-0.35, 0.3, 0.9], zone_type: "lighting" },
];

// BIKE/MOTORCYCLE Hotspot definitions - completely different layout
const BIKE_HOTSPOT_DEFINITIONS = [
  { id: "fuel_tank", name: "Fuel Tank", relPos: [0, 0.7, 0.2], zone_type: "exterior" },
  { id: "seat", name: "Seat", relPos: [0, 0.65, -0.2], zone_type: "exterior" },
  { id: "front_fairing", name: "Front Fairing", relPos: [0, 0.5, 0.8], zone_type: "exterior" },
  { id: "rear_cowl", name: "Rear Cowl", relPos: [0, 0.55, -0.6], zone_type: "exterior" },
  { id: "engine", name: "Engine", relPos: [0.3, 0.3, 0], zone_type: "mechanical" },
  { id: "exhaust", name: "Exhaust", relPos: [0.4, 0.2, -0.4], zone_type: "mechanical" },
  { id: "front_wheel", name: "Front Wheel", relPos: [0, 0.15, 0.7], zone_type: "wheels" },
  { id: "rear_wheel", name: "Rear Wheel", relPos: [0, 0.15, -0.7], zone_type: "wheels" },
  { id: "headlight", name: "Headlight", relPos: [0, 0.6, 0.9], zone_type: "lighting" },
  { id: "taillight", name: "Taillight", relPos: [0, 0.5, -0.85], zone_type: "lighting" },
  { id: "handlebar", name: "Handlebar", relPos: [0, 0.85, 0.5], zone_type: "controls" },
  { id: "mirrors", name: "Mirrors", relPos: [0.35, 0.8, 0.4], zone_type: "glass" },
];

// Get hotspot definitions based on category
function getHotspotDefinitions(category: string) {
  switch (category) {
    case "bike":
      return BIKE_HOTSPOT_DEFINITIONS;
    case "car":
    case "suv":
    case "truck":
    case "van":
    default:
      return CAR_HOTSPOT_DEFINITIONS;
  }
}

// Default fallback hotspots when no model bounds available
const DEFAULT_CAR_HOTSPOTS: Hotspot3D[] = CAR_HOTSPOT_DEFINITIONS.map(h => ({
  id: h.id,
  name: h.name,
  position: [h.relPos[0] * 2, h.relPos[1] * 1.5, h.relPos[2] * 2] as [number, number, number],
  zone_type: h.zone_type
}));

// Function to compute hotspots based on model bounds and category
function computeHotspots(
  bounds: { width: number; height: number; depth: number } | null,
  category: string = "car"
): Hotspot3D[] {
  const definitions = getHotspotDefinitions(category);
  
  if (!bounds) {
    return definitions.map(h => ({
      id: h.id,
      name: h.name,
      position: [h.relPos[0] * 2, h.relPos[1] * 1.5, h.relPos[2] * 2] as [number, number, number],
      zone_type: h.zone_type
    }));
  }
  
  const { width, height, depth } = bounds;
  return definitions.map(h => ({
    id: h.id,
    name: h.name,
    position: [
      h.relPos[0] * width,
      h.relPos[1] * height,
      h.relPos[2] * depth
    ] as [number, number, number],
    zone_type: h.zone_type
  }));
}

// GLB Model Component that loads from URL and auto-scales
function GLBCarModel({ 
  modelUrl, 
  color = "#FF6600",
  onBoundsCalculated 
}: { 
  modelUrl: string; 
  color: string;
  onBoundsCalculated?: (bounds: { width: number; height: number; depth: number }) => void;
}) {
  const { scene } = useGLTF(modelUrl);
  const modelRef = useRef<THREE.Group>(null);
  const [modelScale, setModelScale] = useState(1);

  useEffect(() => {
    // Clone the scene to avoid modifying the cached version
    const clonedScene = scene.clone();
    
    // Calculate bounding box to auto-scale the model
    const box = new THREE.Box3().setFromObject(clonedScene);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    
    // Target size: model should fit within ~4 units
    const maxDim = Math.max(size.x, size.y, size.z);
    const targetSize = 4;
    const scale = targetSize / maxDim;
    setModelScale(scale);
    
    // Report bounds for hotspot positioning
    if (onBoundsCalculated) {
      onBoundsCalculated({
        width: size.x * scale,
        height: size.y * scale,
        depth: size.z * scale
      });
    }

    // Apply color ONLY to body/paint materials, not tires, glass, etc.
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material) {
        const materials = Array.isArray(child.material) ? child.material : [child.material];
        materials.forEach((mat) => {
          if (mat instanceof THREE.MeshStandardMaterial) {
            const matName = (mat.name || '').toLowerCase();
            const meshName = (child.name || '').toLowerCase();
            
            // Skip parts that should NOT be colored (tires, glass, chrome, lights, etc.)
            const skipParts = [
              'tire', 'tyre', 'wheel', 'rim',
              'glass', 'window', 'windshield', 'windscreen',
              'chrome', 'mirror',
              'light', 'headlight', 'taillight', 'lamp',
              'rubber', 'plastic_black', 'black_plastic',
              'interior', 'seat', 'dashboard', 'steering',
              'grille', 'grill', 'exhaust', 'brake',
            ];
            
            const shouldSkip = skipParts.some(part => 
              matName.includes(part) || meshName.includes(part)
            );
            
            if (shouldSkip) {
              // Keep original color for these parts
              return;
            }
            
            // Apply color to body/paint/exterior parts
            const bodyParts = [
              'body', 'paint', 'car', 'exterior', 'panel',
              'hood', 'bonnet', 'fender', 'door', 'trunk', 'boot',
              'bumper', 'roof', 'quarter', 'side', 'metal',
              'frame', 'cowl', 'fairing', 'tank', 'fuel',
            ];
            
            const isBodyPart = bodyParts.some(part => 
              matName.includes(part) || meshName.includes(part)
            ) || matName === '' || matName === 'material';
            
            if (isBodyPart) {
              mat.color.set(color);
              mat.needsUpdate = true;
            }
          }
        });
      }
    });
  }, [scene, color, onBoundsCalculated]);

  useFrame((state) => {
    if (modelRef.current) {
      // Subtle breathing animation
      modelRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.02;
    }
  });

  return (
    <group ref={modelRef}>
      <primitive object={scene} scale={modelScale} />
    </group>
  );
}

// Fallback primitive car model (used when no GLB is available)
function FallbackCarModel({ color = "#FF6600" }: { color: string }) {
  const meshRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.02;
    }
  });

  return (
    <group ref={meshRef}>
      {/* Main Body */}
      <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.8, 0.5, 4]} />
        <meshStandardMaterial 
          color={color} 
          metalness={0.9} 
          roughness={0.1}
          envMapIntensity={1.5}
        />
      </mesh>
      
      {/* Cabin */}
      <mesh position={[0, 0.85, -0.2]} castShadow>
        <boxGeometry args={[1.6, 0.5, 2]} />
        <meshStandardMaterial 
          color={color} 
          metalness={0.9} 
          roughness={0.1}
          envMapIntensity={1.5}
        />
      </mesh>
      
      {/* Windshield */}
      <mesh position={[0, 0.9, 0.85]} rotation={[Math.PI * 0.15, 0, 0]}>
        <boxGeometry args={[1.5, 0.5, 0.05]} />
        <meshStandardMaterial 
          color="#1a1a2e" 
          metalness={0.5} 
          roughness={0}
          transparent
          opacity={0.8}
        />
      </mesh>
      
      {/* Rear Windshield */}
      <mesh position={[0, 0.9, -1.15]} rotation={[-Math.PI * 0.15, 0, 0]}>
        <boxGeometry args={[1.5, 0.45, 0.05]} />
        <meshStandardMaterial 
          color="#1a1a2e" 
          metalness={0.5} 
          roughness={0}
          transparent
          opacity={0.8}
        />
      </mesh>
      
      {/* Side Windows */}
      <mesh position={[0.85, 0.85, -0.2]}>
        <boxGeometry args={[0.05, 0.35, 1.6]} />
        <meshStandardMaterial color="#1a1a2e" transparent opacity={0.7} />
      </mesh>
      <mesh position={[-0.85, 0.85, -0.2]}>
        <boxGeometry args={[0.05, 0.35, 1.6]} />
        <meshStandardMaterial color="#1a1a2e" transparent opacity={0.7} />
      </mesh>
      
      {/* Wheels */}
      {[[0.85, 0.25, 1.2], [-0.85, 0.25, 1.2], [0.85, 0.25, -1.2], [-0.85, 0.25, -1.2]].map((pos, i) => (
        <group key={i} position={pos as [number, number, number]}>
          <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.3, 0.3, 0.2, 32]} />
            <meshStandardMaterial color="#1a1a1a" metalness={0.8} roughness={0.3} />
          </mesh>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.2, 0.2, 0.22, 16]} />
            <meshStandardMaterial color="#404040" metalness={0.9} roughness={0.2} />
          </mesh>
        </group>
      ))}
      
      {/* Headlights */}
      <mesh position={[0.5, 0.45, 1.98]}>
        <boxGeometry args={[0.3, 0.15, 0.05]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffaa" emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[-0.5, 0.45, 1.98]}>
        <boxGeometry args={[0.3, 0.15, 0.05]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffaa" emissiveIntensity={0.5} />
      </mesh>
      
      {/* Taillights */}
      <mesh position={[0.65, 0.45, -1.98]}>
        <boxGeometry args={[0.4, 0.1, 0.05]} />
        <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[-0.65, 0.45, -1.98]}>
        <boxGeometry args={[0.4, 0.1, 0.05]} />
        <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={0.3} />
      </mesh>
      
      {/* Grille */}
      <mesh position={[0, 0.35, 1.98]}>
        <boxGeometry args={[0.8, 0.25, 0.02]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.9} roughness={0.3} />
      </mesh>
    </group>
  );
}
// Interactive Hotspot Component
function Hotspot3DPoint({ 
  hotspot, 
  isSelected, 
  onClick,
  readOnly
}: { 
  hotspot: Hotspot3D; 
  isSelected: boolean;
  onClick: () => void;
  readOnly: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      // Pulsing animation
      const scale = isSelected 
        ? 1.3 + Math.sin(state.clock.elapsedTime * 4) * 0.2
        : 1 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
      meshRef.current.scale.setScalar(hovered ? scale * 1.2 : scale);
    }
  });

  return (
    <group position={hotspot.position}>
      {/* Outer glow ring */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial 
          color={isSelected ? "#00ff00" : "#ff6600"} 
          emissive={isSelected ? "#00ff00" : "#ff6600"}
          emissiveIntensity={hovered ? 1 : 0.5}
          transparent
          opacity={0.9}
        />
      </mesh>
      
      {/* Inner core */}
      <mesh>
        <sphereGeometry args={[0.04, 16, 16]} />
        <meshStandardMaterial 
          color="#ffffff" 
          emissive="#ffffff"
          emissiveIntensity={0.8}
        />
      </mesh>
      
      {/* Clickable area */}
      <mesh
        onPointerOver={() => !readOnly && setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={() => !readOnly && onClick()}
      >
        <sphereGeometry args={[0.15, 8, 8]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
      
      {/* Label on hover */}
      {hovered && (
        <Html distanceFactor={5} position={[0, 0.2, 0]}>
          <div className="px-2 py-1 bg-card/95 backdrop-blur border border-border rounded-lg shadow-lg whitespace-nowrap">
            <span className="text-xs font-medium">{hotspot.name}</span>
          </div>
        </Html>
      )}
    </group>
  );
}

// Camera Controls
function CameraController() {
  const { camera } = useThree();
  
  useEffect(() => {
    camera.position.set(4, 2.5, 4);
    camera.lookAt(0, 0.5, 0);
  }, [camera]);
  
  return null;
}

// Loading Component
function LoadingFallback() {
  return (
    <Html center>
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-racing" />
        <span className="text-sm text-muted-foreground">Loading 3D Model...</span>
      </div>
    </Html>
  );
}

export function Car3DViewer({ 
  carColor, 
  selectedZones, 
  onHotspotClick,
  readOnly = false,
  vehicleMake,
  vehicleModel,
  vehicleCategory = "car",
  onZoneRemove,
  onColorChange
}: Car3DViewerProps) {
  const controlsRef = useRef<any>(null);
  const [modelUrl, setModelUrl] = useState<string | null>(null);
  const [modelInfo, setModelInfo] = useState<{ 
    make: string; 
    model: string; 
    default_color?: string | null;
    vehicle_category?: string;
  } | null>(null);
  const [loadingModel, setLoadingModel] = useState(true);
  const [modelBounds, setModelBounds] = useState<{ width: number; height: number; depth: number } | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(carColor || null);
  const [colorPickerOpen, setColorPickerOpen] = useState(false);

  // Get the effective category from model info or prop
  const effectiveCategory = modelInfo?.vehicle_category || vehicleCategory || "car";

  // Compute hotspots based on model bounds AND category
  const hotspots = computeHotspots(modelBounds, effectiveCategory);

  // Handle color change from user selection
  const handleColorSelect = useCallback((hex: string) => {
    setSelectedColor(hex);
    onColorChange?.(hex);
    setColorPickerOpen(false);
  }, [onColorChange]);

  // Fetch the 3D model URL based on make/model
  useEffect(() => {
    const fetchModel = async () => {
      setLoadingModel(true);
      try {
        // If make/model specified, try to match exactly
        if (vehicleMake && vehicleModel) {
          const { data: exactMatch } = await supabase
            .from("car_models_3d")
            .select("make, model, model_url, default_color, vehicle_category")
            .eq("is_active", true)
            .ilike("make", vehicleMake.trim())
            .ilike("model", vehicleModel.trim())
            .limit(1)
            .maybeSingle();
          
          if (exactMatch) {
            setModelUrl(exactMatch.model_url);
            setModelInfo({ 
              make: exactMatch.make, 
              model: exactMatch.model, 
              default_color: exactMatch.default_color,
              vehicle_category: exactMatch.vehicle_category
            });
            setLoadingModel(false);
            return;
          }
        }

        // If no exact match or no make/model specified, just get the first available model
        const { data: fallback } = await supabase
          .from("car_models_3d")
          .select("make, model, model_url, default_color, vehicle_category")
          .eq("is_active", true)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (fallback) {
          setModelUrl(fallback.model_url);
          setModelInfo({ 
            make: fallback.make, 
            model: fallback.model, 
            default_color: fallback.default_color,
            vehicle_category: fallback.vehicle_category
          });
        } else {
          setModelUrl(null);
          setModelInfo(null);
        }
      } catch (error) {
        console.error("Error fetching 3D model:", error);
        setModelUrl(null);
        setModelInfo(null);
      } finally {
        setLoadingModel(false);
      }
    };

    fetchModel();
  }, [vehicleMake, vehicleModel]);

  const handleReset = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };

  const totalPrice = selectedZones.reduce((sum, z) => sum + z.price, 0);
  const displayName = modelInfo ? `${modelInfo.make} ${modelInfo.model}` : "3D Vehicle";
  // Use user-selected color first, then passed carColor, then model's default
  const effectiveColor = selectedColor || carColor || modelInfo?.default_color || "#FF6600";
  
  // Find the color name from VEHICLE_COLORS for display
  const colorName = VEHICLE_COLORS.find(c => c.hex.toLowerCase() === effectiveColor?.toLowerCase())?.name || "Custom";

  return (
    <div className="relative">
      {/* 3D Canvas */}
      <div className="relative h-[500px] md:h-[600px] rounded-2xl overflow-hidden bg-gradient-to-b from-background via-muted/30 to-background border border-border shadow-xl">
        {/* Ambient lighting effects */}
        <div className="absolute inset-0 bg-gradient-radial from-racing/5 via-transparent to-transparent pointer-events-none z-10" />
        
        <Canvas 
          shadows 
          camera={{ position: [4, 2.5, 4], fov: 45 }}
          gl={{ antialias: true, alpha: true }}
        >
          <Suspense fallback={<LoadingFallback />}>
            {/* Lighting */}
            <ambientLight intensity={0.4} />
            <spotLight 
              position={[10, 10, 5]} 
              angle={0.3} 
              penumbra={1} 
              intensity={1} 
              castShadow 
              shadow-mapSize={[2048, 2048]}
            />
            <spotLight 
              position={[-10, 10, -5]} 
              angle={0.3} 
              penumbra={1} 
              intensity={0.5}
            />
            <pointLight position={[0, 5, 0]} intensity={0.5} color="#ff6600" />
            
            {/* Environment */}
            <Environment preset="city" />
            
            {/* Car Model - Use GLB if available, otherwise fallback */}
            <Center>
              {modelUrl ? (
                <GLBCarModel 
                  modelUrl={modelUrl} 
                   color={effectiveColor} 
                  onBoundsCalculated={setModelBounds}
                />
              ) : (
                 <FallbackCarModel color={effectiveColor} />
              )}
            </Center>
            
            {/* Hotspots - positioned based on model bounds */}
            {hotspots.map((hotspot) => (
              <Hotspot3DPoint
                key={hotspot.id}
                hotspot={hotspot}
                isSelected={selectedZones.some(z => z.id === hotspot.id)}
                onClick={() => onHotspotClick(hotspot)}
                readOnly={readOnly}
              />
            ))}
            
            {/* Floor */}
             <ContactShadows 
               position={[0, -0.05, 0]} 
               opacity={0.4} 
               scale={10} 
               blur={2.5} 
               far={4}
             />
            
            {/* Camera Controls - Manual rotation only */}
            <CameraController />
            <OrbitControls 
              ref={controlsRef}
              autoRotate={false}
              enablePan={false}
              minDistance={3}
              maxDistance={8}
              minPolarAngle={Math.PI * 0.2}
              maxPolarAngle={Math.PI * 0.5}
              enableDamping={true}
              dampingFactor={0.05}
            />
          </Suspense>
        </Canvas>
        
        {/* Control Buttons & Color Picker */}
        <div className="absolute bottom-4 left-4 flex gap-2 z-20">
          <Button
            size="sm"
            variant="outline"
            onClick={handleReset}
            className="backdrop-blur bg-card/80 hover:bg-card"
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
          
          {/* Color Picker */}
          {!readOnly && (
            <Popover open={colorPickerOpen} onOpenChange={setColorPickerOpen}>
              <PopoverTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  className="backdrop-blur bg-card/80 hover:bg-card gap-2"
                >
                  <div 
                    className="h-4 w-4 rounded-full border border-border"
                    style={{ backgroundColor: effectiveColor }}
                  />
                  <Palette className="h-4 w-4" />
                  <span className="hidden sm:inline text-xs">{colorName}</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-3" align="start">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Select Vehicle Color</p>
                  <div className="grid grid-cols-5 gap-2">
                    {VEHICLE_COLORS.map((color) => (
                      <button
                        key={color.hex}
                        title={color.name}
                        onClick={() => handleColorSelect(color.hex)}
                        className={cn(
                          "w-9 h-9 rounded-lg border-2 transition-all hover:scale-110",
                          effectiveColor?.toLowerCase() === color.hex.toLowerCase()
                            ? "border-racing ring-2 ring-racing/30"
                            : "border-border hover:border-muted-foreground"
                        )}
                        style={{ backgroundColor: color.hex }}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground pt-1">
                    Selected: {colorName}
                  </p>
                </div>
              </PopoverContent>
            </Popover>
          )}
        </div>
        
        {/* Instructions */}
        <div className="absolute top-4 left-4 z-20">
          <div className="px-3 py-1.5 rounded-full bg-card/80 backdrop-blur border border-border">
            <span className="text-xs text-muted-foreground">
              🖱️ Drag to rotate • Scroll to zoom • Click hotspots to add services
            </span>
          </div>
        </div>
        
        {/* Car Info Badge - Shows actual model name and color */}
        <div className="absolute top-4 right-4 z-20">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-card/90 backdrop-blur border border-border shadow-lg">
            <div 
              className="h-5 w-5 rounded-full border-2 border-border shadow-sm"
              style={{ backgroundColor: effectiveColor }}
            />
            <div className="flex flex-col">
              <span className="text-xs font-semibold">{displayName}</span>
              <span className="text-[10px] text-muted-foreground">{colorName}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Selected Zones Summary */}
      {selectedZones.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-4 rounded-xl bg-card border border-border"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm">Selected Zones ({selectedZones.length})</h3>
            <Badge variant="outline" className="bg-racing/10 text-racing border-racing/30">
              ₹{totalPrice.toLocaleString()}
            </Badge>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedZones.map((zone) => (
               <Badge key={zone.id} variant="secondary" className="text-xs pr-1.5 flex items-center gap-1.5">
                {zone.name} • {zone.services.length} services
                 {onZoneRemove && !readOnly && (
                   <button
                     onClick={() => onZoneRemove(zone.id)}
                     className="p-0.5 rounded-full hover:bg-destructive/20 transition-colors"
                   >
                     <X className="h-3 w-3 text-destructive" />
                   </button>
                 )}
              </Badge>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

export { DEFAULT_CAR_HOTSPOTS as CAR_HOTSPOTS };
export type { Hotspot3D, SelectedZone };
