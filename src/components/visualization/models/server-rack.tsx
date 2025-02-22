"use client";

import { useRef } from "react";
import { Mesh, Group } from "three";
import { Text } from "@react-three/drei";
import { GPU } from "./gpu";
import { GPUModels } from "./gpu-models";

interface ServerRackProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  gpuModel: keyof typeof GPUModels;
  gpuCount: number;
  showThermal?: boolean;
  showPerformance?: boolean;
  load?: number;
  rackHeight?: number;
  powerCapacity?: number;
}

export function ServerRack({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  gpuModel = "H100",
  gpuCount = 8,
  showThermal = false,
  showPerformance = false,
  load = 0.5,
  rackHeight = 42, // Standard 42U rack
  powerCapacity = 15000, // 15kW typical rack power
}: ServerRackProps) {
  const rackRef = useRef<Group>(null);
  const gpuSpec = GPUModels[gpuModel];

  // Calculate power usage
  const totalPower = gpuSpec.power.tdp * gpuCount * load;
  const powerUtilization = totalPower / powerCapacity;
  
  // Calculate total compute capacity
  const tflopsMatch = gpuSpec.compute.tflops.match(/(\d+\.?\d*)/);
  const tflopsPerGPU = tflopsMatch ? parseFloat(tflopsMatch[1]) : 0;
  const totalTFLOPS = tflopsPerGPU * gpuCount;

  // Calculate memory capacity
  const memoryMatch = gpuSpec.memory.capacity.match(/(\d+)/);
  const memoryPerGPU = memoryMatch ? parseInt(memoryMatch[1]) : 0;
  const totalMemory = memoryPerGPU * gpuCount;

  return (
    <group ref={rackRef} position={position} rotation={rotation}>
      {/* Rack frame */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1.2, rackHeight * 0.05, 1.2]} /> {/* 1U = 0.05 units */}
        <meshStandardMaterial color="#2C2C2C" />
      </mesh>

      {/* Rack rails */}
      <mesh position={[0.55, 0, 0]} castShadow>
        <boxGeometry args={[0.05, rackHeight * 0.05, 0.05]} />
        <meshStandardMaterial color="#4A4A4A" />
      </mesh>
      <mesh position={[-0.55, 0, 0]} castShadow>
        <boxGeometry args={[0.05, rackHeight * 0.05, 0.05]} />
        <meshStandardMaterial color="#4A4A4A" />
      </mesh>

      {/* GPUs */}
      {Array.from({ length: gpuCount }).map((_, i) => {
        const yOffset = (i - gpuCount / 2) * 0.3; // Space GPUs vertically
        return (
          <GPU
            key={i}
            model={gpuModel}
            position={[0, yOffset, 0]}
            showThermal={showThermal}
            showPerformance={showPerformance}
            load={load}
          />
        );
      })}

      {/* Rack metrics display */}
      <group position={[0.7, 0, 0]}>
        <Text
          position={[0, 0.6, 0]}
          rotation={[0, -Math.PI / 2, 0]}
          fontSize={0.1}
          color="white"
          anchorY="top"
          maxWidth={2}
        >
          {`${gpuCount}x ${gpuModel}\n${totalTFLOPS.toFixed(0)} TFLOPS\n${totalMemory}GB Memory`}
        </Text>
        <Text
          position={[0, 0, 0]}
          rotation={[0, -Math.PI / 2, 0]}
          fontSize={0.1}
          color={powerUtilization > 0.8 ? "#EF4444" : "#10B981"}
          anchorY="top"
          maxWidth={2}
        >
          {`Power: ${(totalPower / 1000).toFixed(1)}kW\n${(powerUtilization * 100).toFixed(0)}% Capacity`}
        </Text>
      </group>

      {/* Power indicator bar */}
      <mesh
        position={[0.6, -rackHeight * 0.025, 0]}
        scale={[0.05, rackHeight * 0.05 * powerUtilization, 0.05]}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          color={powerUtilization > 0.8 ? "#EF4444" : "#10B981"}
          emissive={powerUtilization > 0.8 ? "#EF4444" : "#10B981"}
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* Thermal zones */}
      {showThermal && (
        <mesh position={[0, 0, -0.6]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[1, rackHeight * 0.05]} />
          <meshStandardMaterial
            color="#EF4444"
            transparent
            opacity={0.2 + powerUtilization * 0.3}
          />
        </mesh>
      )}
    </group>
  );
} 