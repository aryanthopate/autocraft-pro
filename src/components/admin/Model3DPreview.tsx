import { Suspense, useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, Environment, Center } from "@react-three/drei";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, RotateCcw, ZoomIn, ZoomOut, Box } from "lucide-react";
import * as THREE from "three";

interface Model3DPreviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  modelUrl: string;
  modelName: string;
  defaultColor?: string;
}

function ModelLoader({ url, color }: { url: string; color: string }) {
  const { scene } = useGLTF(url);
  
  useEffect(() => {
    // Apply color to model materials
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material) {
        const material = child.material as THREE.MeshStandardMaterial;
        if (material.color) {
          // Only apply to body parts, keep other materials
          if (material.name?.toLowerCase().includes('body') || 
              material.name?.toLowerCase().includes('paint') ||
              material.name?.toLowerCase().includes('car')) {
            material.color.set(color);
          }
        }
      }
    });
  }, [scene, color]);

  return (
    <Center>
      <primitive object={scene} scale={1.5} />
    </Center>
  );
}

function LoadingFallback() {
  return (
    <mesh>
      <boxGeometry args={[2, 1, 4]} />
      <meshStandardMaterial color="#333" wireframe />
    </mesh>
  );
}

export function Model3DPreview({ 
  open, 
  onOpenChange, 
  modelUrl, 
  modelName,
  defaultColor = "#FF6600"
}: Model3DPreviewProps) {
  const [zoom, setZoom] = useState(5);
  const [color, setColor] = useState(defaultColor);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Check if model URL is a valid GLB/GLTF file
  const isValidModel = modelUrl.endsWith('.glb') || modelUrl.endsWith('.gltf');

  const handleZoomIn = () => setZoom(Math.max(2, zoom - 1));
  const handleZoomOut = () => setZoom(Math.min(10, zoom + 1));
  const handleReset = () => {
    setZoom(5);
    setColor(defaultColor);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Box className="h-5 w-5" />
            3D Model Preview: {modelName}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg overflow-hidden">
          {/* Controls */}
          <div className="absolute top-4 right-4 z-10 flex gap-2">
            <Button variant="secondary" size="icon" onClick={handleZoomIn}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="secondary" size="icon" onClick={handleZoomOut}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button variant="secondary" size="icon" onClick={handleReset}>
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>

          {/* Color picker */}
          <div className="absolute bottom-4 left-4 z-10 flex items-center gap-2 bg-background/90 backdrop-blur rounded-lg p-2">
            <span className="text-sm font-medium">Color:</span>
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-8 h-8 rounded cursor-pointer"
            />
          </div>

          {/* Instructions */}
          <div className="absolute bottom-4 right-4 z-10 text-xs text-white/60 bg-black/40 backdrop-blur rounded px-2 py-1">
            Drag to rotate • Scroll to zoom
          </div>

          {!isValidModel ? (
            <div className="flex flex-col items-center justify-center h-full text-white">
              <Box className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="font-medium">ZIP Model Uploaded</p>
              <p className="text-sm text-muted-foreground mt-2 max-w-md text-center">
                This model is a ZIP file. To preview, the ZIP needs to be extracted 
                to get the GLB/GLTF file. The model will work when integrated with 
                the vehicle configurator.
              </p>
              <p className="text-xs text-muted-foreground mt-4 font-mono break-all max-w-lg">
                {modelUrl}
              </p>
            </div>
          ) : (
            <Canvas
              camera={{ position: [0, 2, zoom], fov: 50 }}
              className="h-full"
              onCreated={() => setIsLoading(false)}
            >
              <ambientLight intensity={0.4} />
              <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
              <spotLight position={[-10, 10, -10]} angle={0.15} penumbra={1} intensity={0.5} />
              
              <Suspense fallback={<LoadingFallback />}>
                <ModelLoader url={modelUrl} color={color} />
                <Environment preset="city" />
              </Suspense>
              
              <OrbitControls
                enableZoom={true}
                enablePan={false}
                minPolarAngle={Math.PI / 6}
                maxPolarAngle={Math.PI / 2}
                minDistance={3}
                maxDistance={15}
                enableDamping
                dampingFactor={0.05}
              />
            </Canvas>
          )}

          {isLoading && isValidModel && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <Loader2 className="h-8 w-8 animate-spin text-white" />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
