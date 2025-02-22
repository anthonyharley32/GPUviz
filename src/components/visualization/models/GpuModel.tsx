"use client";

import { useRef } from "react";
import { useGLTF } from "@react-three/drei";
import { Group, Color } from "three";
import { GPUModels, type GPUSpec } from "./gpu-models";

interface GpuModelProps {
  model?: keyof typeof GPUModels;
  position?: [number, number, number];
  rotation?: [number, number, number];
  showThermal?: boolean;
  showPerformance?: boolean;
  load?: number;
  modelPath: string;
}

export function GpuModel({
  model = "A100",
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  showThermal = false,
  showPerformance = false,
  load = 0.5,
  modelPath,
}: GpuModelProps) {
  const groupRef = useRef<Group>(null);
  const spec = GPUModels[model];
  
  // Load the GLTF model
  const { scene } = useGLTF(modelPath);

  // Clone the scene to avoid sharing materials between instances
  const modelScene = scene.clone();

  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={spec.scale}>
      <primitive object={modelScene} />
      
      {/* Performance indicator ring - keeping this from the original GPU component */}
      {showPerformance && (
        <mesh position={[0, spec.dimensions.height * 2, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[spec.dimensions.width * 0.6, 0.02, 16, 100]} />
          <meshStandardMaterial
            color={new Color().setHSL(load * 0.3, 1, 0.5)}
            emissive={new Color().setHSL(load * 0.3, 1, 0.5)}
            emissiveIntensity={0.5}
            transparent={true}
            opacity={0.8}
          />
        </mesh>
      )}
    </group>
  );
}

// Pre-load the model to improve performance
useGLTF.preload("/sample.glb"); 