import { Suspense, useState, useEffect, useRef } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, useGLTF, Environment, Center, PerspectiveCamera } from "@react-three/drei";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, RotateCcw, ZoomIn, ZoomOut, Box, AlertCircle } from "lucide-react";
import * as THREE from "three";

interface Model3DPreviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  modelUrl: string;
  modelName: string;
  defaultColor?: string;
}

function ModelLoader({ url, color, onLoaded, onError }: { 
  url: string; 
  color: string;
  onLoaded: () => void;
  onError: (error: string) => void;
}) {
  const { scene } = useGLTF(url);
  const { camera } = useThree();
  
  useEffect(() => {
    if (!scene) {
      onError("Failed to load model");
      return;
    }
    
    try {
      // Calculate bounding box to auto-fit model
      const box = new THREE.Box3().setFromObject(scene);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());
      
      // Scale model to fit nicely
      const maxDim = Math.max(size.x, size.y, size.z);
      const scale = maxDim > 0 ? 3 / maxDim : 1;
      
      scene.scale.setScalar(scale);
      scene.position.sub(center.multiplyScalar(scale));
      
      // Apply color to model materials
      scene.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material) {
          const materials = Array.isArray(child.material) ? child.material : [child.material];
          materials.forEach((material) => {
            if (material instanceof THREE.MeshStandardMaterial && material.color) {
              const name = (material.name || '').toLowerCase();
              // Apply to body/paint parts
              if (name.includes('body') || name.includes('paint') || 
                  name.includes('car') || name.includes('exterior') ||
                  name === '' || name.includes('material')) {
                material.color.set(color);
                material.needsUpdate = true;
              }
            }
          });
        }
      });
      
      onLoaded();
    } catch (err) {
      console.error("Error processing model:", err);
      onError("Error processing 3D model");
    }
  }, [scene, color, camera, onLoaded, onError]);

  return (
    <Center>
      <primitive object={scene} />
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
  const [errorMessage, setErrorMessage] = useState("");
  const controlsRef = useRef<any>(null);

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setIsLoading(true);
      setHasError(false);
      setErrorMessage("");
      setZoom(5);
      setColor(defaultColor);
    }
  }, [open, defaultColor]);

  // Check if model URL is a valid GLB/GLTF file
  const isValidModel = modelUrl && (
    modelUrl.toLowerCase().endsWith('.glb') || 
    modelUrl.toLowerCase().endsWith('.gltf')
  );

  const handleZoomIn = () => setZoom(Math.max(2, zoom - 1));
  const handleZoomOut = () => setZoom(Math.min(10, zoom + 1));
  const handleReset = () => {
    setZoom(5);
    setColor(defaultColor);
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };

  const handleLoaded = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleError = (error: string) => {
    setIsLoading(false);
    setHasError(true);
    setErrorMessage(error);
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

        <div className="flex-1 relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg overflow-hidden min-h-[400px]">
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
              className="w-8 h-8 rounded cursor-pointer border-0"
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
              <p className="text-xs text-muted-foreground mt-4 font-mono break-all max-w-lg px-4">
                {modelUrl}
              </p>
            </div>
          ) : hasError ? (
            <div className="flex flex-col items-center justify-center h-full text-white">
              <AlertCircle className="h-16 w-16 text-destructive mb-4" />
              <p className="font-medium">Failed to Load Model</p>
              <p className="text-sm text-muted-foreground mt-2 max-w-md text-center">
                {errorMessage || "The 3D model could not be loaded. Please check the file format."}
              </p>
              <p className="text-xs text-muted-foreground mt-4 font-mono break-all max-w-lg px-4">
                {modelUrl}
              </p>
            </div>
          ) : (
            <Canvas
              className="h-full w-full"
              gl={{ antialias: true, alpha: true }}
              dpr={[1, 2]}
            >
              <PerspectiveCamera makeDefault position={[0, 2, zoom]} fov={50} />
              <ambientLight intensity={0.6} />
              <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1.5} castShadow />
              <spotLight position={[-10, 10, -10]} angle={0.15} penumbra={1} intensity={0.8} />
              <directionalLight position={[0, 5, 5]} intensity={0.5} />
              
              <Suspense fallback={<LoadingFallback />}>
                <ModelLoader 
                  url={modelUrl} 
                  color={color} 
                  onLoaded={handleLoaded}
                  onError={handleError}
                />
                <Environment preset="city" />
              </Suspense>
              
              <OrbitControls
                ref={controlsRef}
                enableZoom={true}
                enablePan={true}
                minPolarAngle={0}
                maxPolarAngle={Math.PI}
                minDistance={2}
                maxDistance={20}
                enableDamping
                dampingFactor={0.05}
              />
            </Canvas>
          )}

          {isLoading && isValidModel && !hasError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70">
              <Loader2 className="h-10 w-10 animate-spin text-racing mb-3" />
              <p className="text-white text-sm">Loading 3D Model...</p>
              <p className="text-white/60 text-xs mt-1">This may take a moment</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
