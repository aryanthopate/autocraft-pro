import { Suspense, useState, useEffect, useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF, Center, Html } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, RotateCcw, ZoomIn, ZoomOut, Palette, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import * as THREE from "three";

interface Job3DViewerProps {
  modelUrl: string | null;
  carColor?: string | null;
  vehicleInfo?: {
    make: string;
    model: string;
    year?: number | null;
    vehicleType?: string;
  };
  completedZones?: string[];
  totalZones?: number;
  onReady?: () => void;
}

// Zone positions for highlighting completed work
const ZONE_POSITIONS: Record<string, [number, number, number]> = {
  hood: [0, 0.8, 1.2],
  roof: [0, 1.2, 0],
  trunk: [0, 0.7, -1.3],
  front_bumper: [0, 0.3, 1.8],
  rear_bumper: [0, 0.3, -1.8],
  front_fender_l: [-0.8, 0.5, 0.8],
  front_fender_r: [0.8, 0.5, 0.8],
  rear_fender_l: [-0.8, 0.5, -0.8],
  rear_fender_r: [0.8, 0.5, -0.8],
  door_front_l: [-0.9, 0.6, 0.2],
  door_front_r: [0.9, 0.6, 0.2],
  door_rear_l: [-0.9, 0.6, -0.3],
  door_rear_r: [0.9, 0.6, -0.3],
  windshield: [0, 1, 0.7],
  rear_window: [0, 0.9, -0.8],
};

function CompletedZoneMarker({ position, zoneName }: { position: [number, number, number]; zoneName: string }) {
  const [hovered, setHovered] = useState(false);
  
  return (
    <group position={position}>
      <mesh
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
      >
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial 
          color="#22c55e" 
          emissive="#22c55e"
          emissiveIntensity={0.5}
          transparent
          opacity={0.9}
        />
      </mesh>
      {hovered && (
        <Html center distanceFactor={3}>
          <div className="bg-green-600 text-white px-2 py-1 rounded text-xs whitespace-nowrap shadow-lg">
            ✓ {zoneName.replace(/_/g, " ")}
          </div>
        </Html>
      )}
    </group>
  );
}

function GLBModel({ 
  url, 
  color, 
  completedZones = [],
  onLoaded 
}: { 
  url: string; 
  color?: string | null;
  completedZones?: string[];
  onLoaded?: () => void;
}) {
  const { scene } = useGLTF(url);
  const modelRef = useRef<THREE.Group>(null);
  const [loaded, setLoaded] = useState(false);

  // Clone scene to avoid mutation issues
  const clonedScene = useMemo(() => scene.clone(), [scene]);

  useEffect(() => {
    if (clonedScene && !loaded) {
      setLoaded(true);
      onLoaded?.();
    }
  }, [clonedScene, loaded, onLoaded]);

  // Apply color only to body panels
  useEffect(() => {
    if (!color || !clonedScene) return;

    const skipParts = ['tire', 'wheel', 'rim', 'glass', 'window', 'chrome', 'metal', 'light', 'lamp', 'headlight', 'taillight', 'interior', 'seat', 'dashboard', 'steering', 'mirror', 'rubber', 'exhaust', 'brake', 'grille', 'grill', 'emblem', 'badge', 'logo'];
    const bodyParts = ['body', 'paint', 'exterior', 'panel', 'fender', 'hood', 'bonnet', 'door', 'roof', 'trunk', 'bumper', 'quarter', 'side', 'tank', 'fairing', 'cowl', 'mudguard'];

    clonedScene.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material) {
        const materials = Array.isArray(child.material) ? child.material : [child.material];
        materials.forEach((mat) => {
          if (mat instanceof THREE.MeshStandardMaterial || mat instanceof THREE.MeshPhysicalMaterial) {
            const matName = (mat.name || '').toLowerCase();
            const meshName = (child.name || '').toLowerCase();

            const shouldSkip = skipParts.some(part => matName.includes(part) || meshName.includes(part));
            const isBodyPart = bodyParts.some(part => matName.includes(part) || meshName.includes(part)) 
              || matName === '' || matName === 'material';

            if (isBodyPart && !shouldSkip) {
              mat.color.set(color);
              mat.needsUpdate = true;
            }
          }
        });
      }
    });
  }, [color, clonedScene]);

  // Auto-rotate
  useFrame((_, delta) => {
    if (modelRef.current) {
      modelRef.current.rotation.y += delta * 0.15;
    }
  });

  return (
    <group ref={modelRef}>
      <Center>
        <primitive object={clonedScene} scale={1.5} />
      </Center>
      
      {/* Completed zone markers */}
      {completedZones.map((zoneName) => {
        const position = ZONE_POSITIONS[zoneName];
        if (!position) return null;
        return (
          <CompletedZoneMarker 
            key={zoneName} 
            position={position} 
            zoneName={zoneName} 
          />
        );
      })}
    </group>
  );
}

export function Job3DViewer({
  modelUrl,
  carColor,
  vehicleInfo,
  completedZones = [],
  totalZones = 0,
  onReady,
}: Job3DViewerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [autoRotate, setAutoRotate] = useState(true);

  if (!modelUrl) {
    return (
      <div className="h-[300px] flex items-center justify-center bg-gradient-to-b from-muted/50 to-muted rounded-xl border">
        <p className="text-muted-foreground text-sm">No 3D model available</p>
      </div>
    );
  }

  const progressPercent = totalZones > 0 ? Math.round((completedZones.length / totalZones) * 100) : 0;

  return (
    <div className="relative h-[320px] rounded-xl overflow-hidden bg-gradient-to-b from-background via-muted/30 to-muted/50 border">
      {/* Loading overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-20 flex items-center justify-center bg-background/80 backdrop-blur-sm"
          >
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Loading vehicle...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [4, 2, 4], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        className="touch-none"
      >
        <ambientLight intensity={0.9} />
        <directionalLight position={[10, 10, 5]} intensity={1.2} castShadow />
        <directionalLight position={[-10, 5, -5]} intensity={0.6} />
        <pointLight position={[0, 5, 0]} intensity={0.5} />

        <Suspense fallback={null}>
          <GLBModel
            url={modelUrl}
            color={carColor}
            completedZones={completedZones}
            onLoaded={() => {
              setIsLoading(false);
              onReady?.();
            }}
          />
        </Suspense>

        <OrbitControls
          enablePan={false}
          enableZoom={true}
          minDistance={3}
          maxDistance={10}
          autoRotate={autoRotate}
          autoRotateSpeed={0.5}
          maxPolarAngle={Math.PI / 2}
        />
      </Canvas>

      {/* Vehicle Info Badge */}
      {vehicleInfo && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-3 left-3 z-10"
        >
          <Badge className="bg-background/90 backdrop-blur text-foreground border shadow-lg px-3 py-1.5 gap-2">
            <span className="font-semibold">
              {vehicleInfo.make} {vehicleInfo.model}
            </span>
            {vehicleInfo.year && (
              <span className="text-muted-foreground">'{String(vehicleInfo.year).slice(-2)}</span>
            )}
          </Badge>
        </motion.div>
      )}

      {/* Progress Badge */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-3 right-3 z-10"
      >
        <Badge 
          className={cn(
            "backdrop-blur border shadow-lg px-3 py-1.5 gap-2",
            progressPercent === 100 
              ? "bg-green-500/90 text-white border-green-400" 
              : "bg-background/90 text-foreground"
          )}
        >
          <CheckCircle2 className="h-3.5 w-3.5" />
          <span className="font-semibold">{progressPercent}%</span>
          <span className="text-xs opacity-80">Complete</span>
        </Badge>
      </motion.div>

      {/* Controls */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute bottom-3 right-3 z-10 flex gap-2"
      >
        <Button
          size="sm"
          variant={autoRotate ? "default" : "outline"}
          onClick={() => setAutoRotate(!autoRotate)}
          className="h-8 w-8 p-0 backdrop-blur"
        >
          <RotateCcw className={cn("h-4 w-4", autoRotate && "animate-spin")} style={{ animationDuration: "3s" }} />
        </Button>
      </motion.div>

      {/* Instructions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="absolute bottom-3 left-3 z-10"
      >
        <p className="text-xs text-muted-foreground bg-background/60 backdrop-blur px-2 py-1 rounded">
          Drag to rotate • Scroll to zoom • Green markers = completed zones
        </p>
      </motion.div>
    </div>
  );
}
