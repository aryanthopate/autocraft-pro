import { Suspense, useRef, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows, useGLTF, Html, Center } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import * as THREE from "three";
import { Maximize2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

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
}

// Hotspot definitions using relative positions (0-1 range that scales with model)
// These are multiplied by actual model bounds at runtime
const HOTSPOT_DEFINITIONS = [
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

// Default fallback hotspots when no model bounds available
const DEFAULT_CAR_HOTSPOTS: Hotspot3D[] = HOTSPOT_DEFINITIONS.map(h => ({
  id: h.id,
  name: h.name,
  position: [h.relPos[0] * 2, h.relPos[1] * 1.5, h.relPos[2] * 2] as [number, number, number],
  zone_type: h.zone_type
}));

// Function to compute hotspots based on model bounds
function computeHotspots(bounds: { width: number; height: number; depth: number } | null): Hotspot3D[] {
  if (!bounds) return DEFAULT_CAR_HOTSPOTS;
  
  const { width, height, depth } = bounds;
  return HOTSPOT_DEFINITIONS.map(h => ({
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

    // Apply color to the model's materials
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material) {
        const materials = Array.isArray(child.material) ? child.material : [child.material];
        materials.forEach((mat) => {
          if (mat instanceof THREE.MeshStandardMaterial) {
            mat.color.set(color);
            mat.needsUpdate = true;
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
  carColor = "#FF6600", 
  selectedZones, 
  onHotspotClick,
  readOnly = false,
  vehicleMake,
  vehicleModel
}: Car3DViewerProps) {
  const controlsRef = useRef<any>(null);
  const [modelUrl, setModelUrl] = useState<string | null>(null);
  const [modelInfo, setModelInfo] = useState<{ make: string; model: string } | null>(null);
  const [loadingModel, setLoadingModel] = useState(true);
  const [modelBounds, setModelBounds] = useState<{ width: number; height: number; depth: number } | null>(null);

  // Compute hotspots based on model bounds
  const hotspots = computeHotspots(modelBounds);

  // Fetch the 3D model URL based on make/model
  useEffect(() => {
    const fetchModel = async () => {
      setLoadingModel(true);
      try {
        // If make/model specified, try to match exactly
        if (vehicleMake && vehicleModel) {
          const { data: exactMatch } = await supabase
            .from("car_models_3d")
            .select("make, model, model_url")
            .eq("is_active", true)
            .ilike("make", vehicleMake.trim())
            .ilike("model", vehicleModel.trim())
            .limit(1)
            .maybeSingle();
          
          if (exactMatch) {
            setModelUrl(exactMatch.model_url);
            setModelInfo({ make: exactMatch.make, model: exactMatch.model });
            setLoadingModel(false);
            return;
          }
        }

        // If no exact match or no make/model specified, just get the first available model
        const { data: fallback } = await supabase
          .from("car_models_3d")
          .select("make, model, model_url")
          .eq("is_active", true)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (fallback) {
          setModelUrl(fallback.model_url);
          setModelInfo({ make: fallback.make, model: fallback.model });
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

  return (
    <div className="relative">
      {/* 3D Canvas */}
      <div className="relative h-[450px] md:h-[550px] rounded-2xl overflow-hidden bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border border-border">
        {/* Ambient lighting effects */}
        <div className="absolute inset-0 bg-gradient-radial from-racing/10 via-transparent to-transparent pointer-events-none z-10" />
        
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
                  color={carColor} 
                  onBoundsCalculated={setModelBounds}
                />
              ) : (
                <FallbackCarModel color={carColor} />
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
              opacity={0.6} 
              scale={10} 
              blur={2} 
              far={4}
            />
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
              <planeGeometry args={[20, 20]} />
              <meshStandardMaterial color="#0a0a0a" metalness={0.5} roughness={0.8} />
            </mesh>
            
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
        
        {/* Control Buttons */}
        <div className="absolute bottom-4 left-4 flex gap-2 z-20">
          <Button
            size="sm"
            variant="outline"
            onClick={handleReset}
            className="backdrop-blur bg-card/80"
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Instructions */}
        <div className="absolute top-4 left-4 z-20">
          <div className="px-3 py-1.5 rounded-full bg-card/80 backdrop-blur border border-border">
            <span className="text-xs text-muted-foreground">
              🖱️ Drag to rotate • Scroll to zoom • Click hotspots to add services
            </span>
          </div>
        </div>
        
        {/* Car Info Badge - Shows actual model name */}
        <div className="absolute top-4 right-4 z-20">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-card/80 backdrop-blur border border-border">
            <div 
              className="h-4 w-4 rounded-full border-2 border-white/20"
              style={{ backgroundColor: carColor }}
            />
            <span className="text-xs font-medium">{displayName}</span>
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
              <Badge key={zone.id} variant="secondary" className="text-xs">
                {zone.name} • {zone.services.length} services
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
