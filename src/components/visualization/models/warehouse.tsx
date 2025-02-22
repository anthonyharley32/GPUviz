"use client";

import { useRef } from "react";
import { Group } from "three";
import { Text } from "@react-three/drei";
import { ServerRack } from "./server-rack";
import { GPUModels } from "./gpu-models";

export interface SupercomputerConfig {
  name: string;
  description: string;
  gpuModel: keyof typeof GPUModels;
  gpuCount: number;
  rackCount: number;
  totalPower: number; // kW
  totalCompute: number; // PFLOPS
  aiWorkload: string;
}

export const supercomputerConfigs: SupercomputerConfig[] = [
  {
    name: "Colossus AI-1",
    description: "Large language model training cluster",
    gpuModel: "H100",
    gpuCount: 8,
    rackCount: 12,
    totalPower: 67.2, // 12 racks * 8 GPUs * 700W
    totalCompute: 189.7, // 12 racks * 8 GPUs * 1.98 PFLOPS
    aiWorkload: "Training foundation models up to 1T parameters",
  },
  {
    name: "DeepSeek Cluster",
    description: "High-throughput inference setup",
    gpuModel: "A100",
    gpuCount: 8,
    rackCount: 8,
    totalPower: 25.6, // 8 racks * 8 GPUs * 400W
    totalCompute: 20, // 8 racks * 8 GPUs * 312 TFLOPS
    aiWorkload: "Serving DeepSeek-70B with 4K requests/s",
  },
  {
    name: "Vision Forge",
    description: "Multi-modal AI processing center",
    gpuModel: "MI300X",
    gpuCount: 4,
    rackCount: 16,
    totalPower: 48, // 16 racks * 4 GPUs * 750W
    totalCompute: 102.4, // 16 racks * 4 GPUs * 1.6 PFLOPS
    aiWorkload: "Stable Diffusion XL and multi-modal model training",
  },
];

interface WarehouseProps {
  selectedConfig: number;
  showThermal?: boolean;
  showPerformance?: boolean;
  load?: number;
}

export function Warehouse({
  selectedConfig = 0,
  showThermal = false,
  showPerformance = false,
  load = 0.5,
}: WarehouseProps) {
  const groupRef = useRef<Group>(null);
  const config = supercomputerConfigs[selectedConfig];

  // Calculate grid layout
  const rows = Math.ceil(Math.sqrt(config.rackCount));
  const cols = Math.ceil(config.rackCount / rows);

  // Calculate actual power and compute based on load
  const currentPower = config.totalPower * load;
  const currentCompute = config.totalCompute * load;

  return (
    <group ref={groupRef}>
      {/* Server racks in a grid */}
      {Array.from({ length: config.rackCount }).map((_, index) => {
        const row = Math.floor(index / cols);
        const col = index % cols;
        return (
          <ServerRack
            key={index}
            position={[
              (row - rows / 2) * 2.5,
              0,
              (col - cols / 2) * 2.5,
            ]}
            rotation={[0, Math.PI / 2, 0]}
            gpuModel={config.gpuModel}
            gpuCount={config.gpuCount}
            showThermal={showThermal}
            showPerformance={showPerformance}
            load={load}
          />
        );
      })}

      {/* Cluster metrics display */}
      <group position={[rows * 1.5, 2, 0]}>
        <Text
          position={[0, 0.6, 0]}
          rotation={[0, -Math.PI / 2, 0]}
          fontSize={0.15}
          color="white"
          anchorY="top"
          maxWidth={4}
        >
          {config.name}
        </Text>
        <Text
          position={[0, 0.3, 0]}
          rotation={[0, -Math.PI / 2, 0]}
          fontSize={0.1}
          color="#A78BFA"
          anchorY="top"
          maxWidth={4}
        >
          {`${config.rackCount} Racks × ${config.gpuCount} ${config.gpuModel}\nTotal: ${
            config.rackCount * config.gpuCount
          } GPUs`}
        </Text>
        <Text
          position={[0, 0, 0]}
          rotation={[0, -Math.PI / 2, 0]}
          fontSize={0.1}
          color="#10B981"
          anchorY="top"
          maxWidth={4}
        >
          {`Current Power: ${currentPower.toFixed(1)} kW\nPeak Performance: ${currentCompute.toFixed(1)} PFLOPS`}
        </Text>
        <Text
          position={[0, -0.3, 0]}
          rotation={[0, -Math.PI / 2, 0]}
          fontSize={0.08}
          color="#94A3B8"
          anchorY="top"
          maxWidth={4}
        >
          {config.aiWorkload}
        </Text>
      </group>

      {/* Power distribution visualization */}
      {showThermal && (
        <mesh position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[rows * 2.5, cols * 2.5]} />
          <meshStandardMaterial
            color="#EF4444"
            transparent
            opacity={0.1 + load * 0.2}
          />
        </mesh>
      )}

      {/* Cooling system indicators */}
      {showThermal && Array.from({ length: rows }).map((_, row) =>
        Array.from({ length: cols }).map((_, col) => (
          <mesh
            key={`cooling-${row}-${col}`}
            position={[
              (row - rows / 2) * 2.5,
              3,
              (col - cols / 2) * 2.5,
            ]}
          >
            <cylinderGeometry args={[0.2, 0.1, 0.3]} />
            <meshStandardMaterial
              color="#60A5FA"
              transparent
              opacity={0.3 + load * 0.4}
            />
          </mesh>
        ))
      )}

      {/* Network connectivity visualization */}
      {showPerformance && (
        <group>
          {Array.from({ length: config.rackCount - 1 }).map((_, i) => {
            const startRow = Math.floor(i / cols);
            const startCol = i % cols;
            const endRow = Math.floor((i + 1) / cols);
            const endCol = (i + 1) % cols;
            return (
              <mesh key={`network-${i}`} position={[
                ((startRow + endRow) / 2 - rows / 2) * 2.5,
                0.5,
                ((startCol + endCol) / 2 - cols / 2) * 2.5,
              ]}>
                <boxGeometry args={[0.05, 0.02, 2.5]} />
                <meshStandardMaterial
                  color="#8B5CF6"
                  transparent
                  opacity={0.3 + load * 0.5}
                  emissive="#8B5CF6"
                  emissiveIntensity={load * 0.5}
                />
              </mesh>
            );
          })}
        </group>
      )}
    </group>
  );
} 