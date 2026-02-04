import { Suspense, useState, useEffect, useRef } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF, Environment, Center } from "@react-three/drei";
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
  const groupRef = useRef<THREE.Group>(null);
  
  useEffect(() => {
    if (!scene) {
      onError("Failed to load model");
      return;
    }
    
    try {
      // Clone the scene to avoid modifying the cached version
      const clonedScene = scene.clone(true);
      
      // Calculate bounding box
      const box = new THREE.Box3().setFromObject(clonedScene);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());
      
      // Get the maximum dimension for scaling
      const maxDim = Math.max(size.x, size.y, size.z);
      
      // Scale to fit in a 4-unit box (good viewing size)
      const targetSize = 4;
      const scale = maxDim > 0 ? targetSize / maxDim : 1;
      
      // Apply scale
      clonedScene.scale.setScalar(scale);
      
      // Center the model
      clonedScene.position.set(
        -center.x * scale,
        -center.y * scale,
        -center.z * scale
      );
      
      // Apply color to materials
      clonedScene.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material) {
          const materials = Array.isArray(child.material) ? child.material : [child.material];
          materials.forEach((mat) => {
            if (mat instanceof THREE.MeshStandardMaterial) {
              // Clone material to avoid modifying cached version
              const newMat = mat.clone();
              const name = (newMat.name || '').toLowerCase();
              
              // Apply color to body/paint parts
              if (name.includes('body') || name.includes('paint') || 
                  name.includes('car') || name.includes('exterior') ||
                  name === '' || name.includes('material') || name.includes('metal')) {
                newMat.color.set(color);
              }
              
              // Ensure materials are visible
              newMat.metalness = Math.min(newMat.metalness, 0.8);
              newMat.roughness = Math.max(newMat.roughness, 0.2);
              child.material = newMat;
            }
          });
        }
      });
      
      // Update the group with cloned scene
      if (groupRef.current) {
        // Clear existing children
        while (groupRef.current.children.length > 0) {
          groupRef.current.remove(groupRef.current.children[0]);
        }
        groupRef.current.add(clonedScene);
      }
      
      // Position camera to see the model
      camera.position.set(5, 3, 8);
      camera.lookAt(0, 0, 0);
      
      onLoaded();
    } catch (err) {
      console.error("Error processing model:", err);
      onError("Error processing 3D model");
    }
  }, [scene, color, camera, onLoaded, onError]);

  return (
    <group ref={groupRef} />
  );
}

function LoadingFallback() {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.5;
    }
  });
  
  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[2, 1, 4]} />
      <meshStandardMaterial color="#444" wireframe />
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
      setColor(defaultColor);
    }
  }, [open, defaultColor]);

  // Check if model URL is a valid GLB/GLTF file
  const isValidModel = modelUrl && (
    modelUrl.toLowerCase().endsWith('.glb') || 
    modelUrl.toLowerCase().endsWith('.gltf')
  );

  const handleZoomIn = () => {
    if (controlsRef.current) {
      const controls = controlsRef.current;
      const currentDistance = controls.getDistance();
      controls.object.position.multiplyScalar(0.7);
      controls.update();
    }
  };
  
  const handleZoomOut = () => {
    if (controlsRef.current) {
      const controls = controlsRef.current;
      controls.object.position.multiplyScalar(1.3);
      controls.update();
    }
  };
  
  const handleReset = () => {
    setColor(defaultColor);
    if (controlsRef.current) {
      controlsRef.current.reset();
      controlsRef.current.object.position.set(5, 3, 8);
      controlsRef.current.update();
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
            <Button variant="secondary" size="icon" onClick={handleZoomIn} title="Zoom In">
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="secondary" size="icon" onClick={handleZoomOut} title="Zoom Out">
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button variant="secondary" size="icon" onClick={handleReset} title="Reset View">
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
              camera={{ position: [5, 3, 8], fov: 45 }}
            >
              <ambientLight intensity={0.8} />
              <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={2} castShadow />
              <spotLight position={[-10, 10, -10]} angle={0.15} penumbra={1} intensity={1} />
              <directionalLight position={[0, 10, 5]} intensity={1} />
              <pointLight position={[0, -5, 0]} intensity={0.3} />
              
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
                zoomSpeed={2}
                rotateSpeed={1}
                minDistance={0.5}
                maxDistance={100}
                enableDamping
                dampingFactor={0.1}
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
