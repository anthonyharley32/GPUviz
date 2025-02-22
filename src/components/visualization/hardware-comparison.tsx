"use client";

import { useRef, useEffect } from "react";
import { Line, Text } from "@react-three/drei";
import { Vector3 } from "three";
import { GPUModels } from "./models/gpu-models";

interface MetricBar {
  label: string;
  value: number;
  maxValue: number;
  position: [number, number, number];
  color: string;
}

interface ComparisonMetrics {
  tflops: MetricBar[];
  memory: MetricBar[];
  bandwidth: MetricBar[];
  efficiency: MetricBar[];
}

function calculateMetrics(): ComparisonMetrics {
  // Convert string values to numbers and normalize
  const metrics: ComparisonMetrics = {
    tflops: [],
    memory: [],
    bandwidth: [],
    efficiency: [],
  };

  Object.entries(GPUModels).forEach(([key, gpu], index) => {
    const xOffset = (index - 1) * 2; // Center the bars

    // TFLOPS calculation
    const tflopsMatch = gpu.compute.tflops.match(/(\d+\.?\d*)/);
    const tflopsValue = tflopsMatch ? parseFloat(tflopsMatch[1]) : 0;
    metrics.tflops.push({
      label: `${gpu.name}\n${gpu.compute.tflops}`,
      value: tflopsValue,
      maxValue: 2000, // Max TFLOPS to normalize against
      position: [xOffset, 0, 0],
      color: "#8B5CF6", // Purple
    });

    // Memory capacity
    const memoryMatch = gpu.memory.capacity.match(/(\d+)/);
    const memoryValue = memoryMatch ? parseInt(memoryMatch[1]) : 0;
    metrics.memory.push({
      label: `${gpu.memory.capacity}\n${gpu.memory.type}`,
      value: memoryValue,
      maxValue: 200, // Max GB to normalize against
      position: [xOffset, 0, 2],
      color: "#10B981", // Emerald
    });

    // Memory bandwidth
    const bandwidthMatch = gpu.memory.bandwidth.match(/(\d+\.?\d*)/);
    const bandwidthValue = bandwidthMatch ? parseFloat(bandwidthMatch[1]) : 0;
    metrics.bandwidth.push({
      label: `${gpu.memory.bandwidth}`,
      value: bandwidthValue,
      maxValue: 6, // Max TB/s to normalize against
      position: [xOffset, 0, 4],
      color: "#3B82F6", // Blue
    });

    // Efficiency (TFLOPS/W)
    const efficiencyMatch = gpu.performance.efficiency.match(/(\d+\.?\d*)/);
    const efficiencyValue = efficiencyMatch ? parseFloat(efficiencyMatch[1]) : 0;
    metrics.efficiency.push({
      label: `${gpu.performance.efficiency}`,
      value: efficiencyValue,
      maxValue: 3, // Max TFLOPS/W to normalize against
      position: [xOffset, 0, 6],
      color: "#EC4899", // Pink
    });
  });

  return metrics;
}

function MetricBars({ metrics }: { metrics: MetricBar[] }) {
  return (
    <>
      {metrics.map((metric, index) => {
        const height = (metric.value / metric.maxValue) * 5; // Scale height to 5 units max
        return (
          <group key={index} position={metric.position}>
            {/* Bar */}
            <mesh position={[0, height / 2, 0]}>
              <boxGeometry args={[0.5, height, 0.5]} />
              <meshStandardMaterial color={metric.color} />
            </mesh>
            {/* Label */}
            <Text
              position={[0, -0.5, 0]}
              rotation={[-Math.PI / 2, 0, 0]}
              fontSize={0.3}
              color="white"
              anchorY="bottom"
              maxWidth={2}
              textAlign="center"
            >
              {metric.label}
            </Text>
          </group>
        );
      })}
    </>
  );
}

export function HardwareComparison() {
  const metrics = calculateMetrics();

  return (
    <group position={[0, 0, 0]}>
      {/* Category labels */}
      <Text position={[-4, 0, 0]} rotation={[0, Math.PI / 2, 0]} fontSize={0.5} color="white">
        Compute (TFLOPS)
      </Text>
      <Text position={[-4, 0, 2]} rotation={[0, Math.PI / 2, 0]} fontSize={0.5} color="white">
        Memory (GB)
      </Text>
      <Text position={[-4, 0, 4]} rotation={[0, Math.PI / 2, 0]} fontSize={0.5} color="white">
        Bandwidth (TB/s)
      </Text>
      <Text position={[-4, 0, 6]} rotation={[0, Math.PI / 2, 0]} fontSize={0.5} color="white">
        Efficiency (TFLOPS/W)
      </Text>

      {/* Metric bars */}
      <MetricBars metrics={metrics.tflops} />
      <MetricBars metrics={metrics.memory} />
      <MetricBars metrics={metrics.bandwidth} />
      <MetricBars metrics={metrics.efficiency} />

      {/* Grid lines */}
      <gridHelper args={[20, 20, "#666666", "#444444"]} position={[0, 0, 0]} />
    </group>
  );
} 