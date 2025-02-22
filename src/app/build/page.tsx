"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GPUModels } from "@/components/visualization/models/gpu-models";

// AI Workload types with real-world performance data
const AI_WORKLOADS = {
  gpt3_inference: {
    name: "GPT-3 175B Inference (1000 tokens)",
    description: "Run inference on GPT-3 175B model. Requires significant VRAM for model weights.",
    baseTime: 1, // seconds on A100 (source: a16z.com)
    requirements: {
      minMemory: 350, // GB (half of 700GB model size)
      minTFLOPS: 312,
      networkBandwidth: 600, // GB/s minimum for multi-GPU inference
    },
    reference: "Source: a16z.com - A single GPT-3 inference takes approximately 1 second on an A100, requiring 700GB total for weights",
    costEstimate: "$0.0002-$0.0014 per 1000 tokens on cloud providers",
  },
  stable_diffusion: {
    name: "Stable Diffusion Image Generation",
    description: "Generate one 512x512 image using Stable Diffusion v2",
    baseTime: 5, // seconds on A100
    requirements: {
      minMemory: 8, // GB VRAM required
      minTFLOPS: 100,
      networkBandwidth: 100, // GB/s for batch processing
    },
    reference: "Based on Stable Diffusion v2 requirements and real-world benchmarks",
    costEstimate: "$0.001-$0.02 per image on cloud providers",
  },
  llama7b_training: {
    name: "Train LLaMA-7B Model",
    description: "Train a 7B parameter model from scratch (smaller version of Meta's LLaMA)",
    baseTime: 147456, // hours on single A100
    requirements: {
      minMemory: 32, // GB minimum VRAM per GPU
      minTFLOPS: 312,
      networkBandwidth: 600, // GB/s for multi-GPU training
    },
    reference: "Based on Meta's LLaMA training requirements scaled down to 7B parameters",
    costEstimate: "$50,000-$100,000 total training cost on cloud providers",
  },
  gpt3_training: {
    name: "Train GPT-3 175B Model",
    description: "Train a GPT-3 scale model from scratch (175B parameters)",
    baseTime: 35040, // hours on A100 cluster
    requirements: {
      minMemory: 780, // GB minimum total VRAM
      minTFLOPS: 2496, // 8x A100s minimum
      networkBandwidth: 600, // GB/s
    },
    reference: "Source: a16z.com - GPT-3 training costs $500,000 to $4.6M for a single run",
    costEstimate: "$500,000-$4,600,000 total training cost",
  },
  video_generation: {
    name: "Generate 1-minute AI Video",
    description: "Generate 1 minute of 1080p video at 30fps using state-of-the-art models",
    baseTime: 1800, // seconds on A100
    requirements: {
      minMemory: 16, // GB
      minTFLOPS: 200,
      networkBandwidth: 100, // GB/s
    },
    reference: "Based on current video generation model requirements",
    costEstimate: "$1-$5 per minute of generated video",
  },
} as const;

// Component types that can be placed on the grid
const COMPONENT_TYPES = {
  consumer_laptop: "consumer_laptop",
  gaming_pc: "gaming_pc",
  workstation: "workstation",
  server_rack_a100: "server_rack_a100",
  server_rack_h100: "server_rack_h100",
} as const;

// Component definitions with their properties
const COMPONENTS = {
  [COMPONENT_TYPES.consumer_laptop]: {
    name: "MacBook Air M2",
    width: 1,
    height: 1,
    specs: {
      cpu: "Apple M2 (8-core)",
      memory: "8GB Unified Memory",
      gpu: "8-core GPU",
      tflops: 3.3,
      vram: 8,
    },
    baseProcessingPower: 0.01, // relative to A100
    icon: "💻",
    description: "M2 MacBook Air with 8GB RAM",
    powerConsumption: 0.03, // kW
  },
  [COMPONENT_TYPES.gaming_pc]: {
    name: "Gaming PC (RTX 4090)",
    width: 1,
    height: 1,
    specs: {
      cpu: "Intel i9-13900K",
      memory: "32GB DDR5",
      gpu: "NVIDIA RTX 4090",
      tflops: 82.6,
      vram: 24,
    },
    baseProcessingPower: 0.26, // relative to A100
    icon: "🖥️",
    description: "High-end gaming PC with RTX 4090",
    powerConsumption: 0.45, // kW
  },
  [COMPONENT_TYPES.workstation]: {
    name: "Pro Workstation (RTX 6000)",
    width: 1,
    height: 2,
    specs: {
      cpu: "AMD Threadripper Pro",
      memory: "256GB DDR5",
      gpu: "NVIDIA RTX 6000",
      tflops: 91.1,
      vram: 48,
    },
    baseProcessingPower: 0.29, // relative to A100
    icon: "🖥️",
    description: "Professional workstation with RTX 6000",
    powerConsumption: 0.5, // kW
  },
  [COMPONENT_TYPES.server_rack_a100]: {
    name: "A100 Server Rack",
    width: 2,
    height: 2,
    specs: {
      cpu: "2x AMD EPYC 7763",
      memory: "2TB DDR5",
      gpu: "8x NVIDIA A100",
      tflops: 312 * 8, // per GPU * count
      vram: 80 * 8, // per GPU * count
    },
    baseProcessingPower: 8, // 8x A100s
    icon: "🗄️",
    description: "Enterprise server rack with 8x NVIDIA A100 GPUs",
    powerConsumption: 6.4, // kW
  },
  [COMPONENT_TYPES.server_rack_h100]: {
    name: "H100 Server Rack",
    width: 2,
    height: 2,
    specs: {
      cpu: "2x AMD EPYC 7763",
      memory: "2TB DDR5",
      gpu: "8x NVIDIA H100",
      tflops: 500 * 8, // per GPU * count
      vram: 80 * 8, // per GPU * count
    },
    baseProcessingPower: 16, // ~2x faster than A100 rack
    icon: "🗄️",
    description: "Enterprise server rack with 8x NVIDIA H100 GPUs",
    powerConsumption: 8, // kW
  },
};

// Grid configuration
const GRID_SIZE = 8;
const CELL_SIZE = 80;

interface GridCell {
  id: string;
  type: keyof typeof COMPONENT_TYPES;
  x: number;
  y: number;
}

export default function BuildPage() {
  const [placedComponents, setPlacedComponents] = useState<GridCell[]>([]);
  const [selectedComponent, setSelectedComponent] = useState<keyof typeof COMPONENT_TYPES | null>(null);
  const [hoveredCell, setHoveredCell] = useState<{ x: number; y: number } | null>(null);
  const [selectedWorkload, setSelectedWorkload] = useState<keyof typeof AI_WORKLOADS>("gpt3_inference");
  const [showSpecs, setShowSpecs] = useState<string | null>(null);

  // Calculate total processing power and memory
  const calculateTotalResources = () => {
    return placedComponents.reduce(
      (total, component) => {
        const componentData = COMPONENTS[component.type];
        return {
          processingPower: total.processingPower + componentData.baseProcessingPower,
          totalMemory: total.totalMemory + componentData.specs.vram,
          totalTFLOPS: total.totalTFLOPS + componentData.specs.tflops,
          powerConsumption: total.powerConsumption + componentData.powerConsumption,
        };
      },
      { processingPower: 0, totalMemory: 0, totalTFLOPS: 0, powerConsumption: 0 }
    );
  };

  // Format time duration
  const formatDuration = (seconds: number): string => {
    if (seconds < 1) {
      return `${Math.round(seconds * 1000)}ms`;
    }
    if (seconds < 60) {
      return `${Math.round(seconds)}s`;
    }
    if (seconds < 3600) {
      return `${Math.round(seconds / 60)}m`;
    }
    if (seconds < 86400) {
      return `${Math.round(seconds / 3600)}h`;
    }
    return `${Math.round(seconds / 86400)}d`;
  };

  // Calculate processing time for selected workload
  const calculateProcessingTime = () => {
    const resources = calculateTotalResources();
    const workload = AI_WORKLOADS[selectedWorkload];
    
    // Check if minimum requirements are met
    if (resources.totalMemory < workload.requirements.minMemory ||
        resources.totalTFLOPS < workload.requirements.minTFLOPS) {
      return "Insufficient resources";
    }

    // Calculate time based on processing power relative to A100
    const timeInSeconds = workload.baseTime / resources.processingPower;
    return formatDuration(timeInSeconds);
  };

  // Calculate power cost
  const calculatePowerCost = () => {
    const resources = calculateTotalResources();
    const kwhRate = 0.12; // Average electricity rate in USD
    const hourlyRate = resources.powerConsumption * kwhRate;
    return hourlyRate.toFixed(2);
  };

  // Check if a position is valid for placement
  const isValidPlacement = (x: number, y: number, type: keyof typeof COMPONENT_TYPES) => {
    const component = COMPONENTS[type];
    
    // Check boundaries
    if (x < 0 || y < 0 || x + component.width > GRID_SIZE || y + component.height > GRID_SIZE) {
      return false;
    }

    // Check overlap with other components
    return !placedComponents.some(placed => {
      const placedComponent = COMPONENTS[placed.type];
      return (
        x < placed.x + placedComponent.width &&
        x + component.width > placed.x &&
        y < placed.y + placedComponent.height &&
        y + component.height > placed.y
      );
    });
  };

  // Handle cell click for component placement
  const handleCellClick = (x: number, y: number) => {
    if (!selectedComponent) return;

    if (isValidPlacement(x, y, selectedComponent)) {
      setPlacedComponents([
        ...placedComponents,
        {
          id: `${selectedComponent}-${Date.now()}`,
          type: selectedComponent,
          x,
          y,
        },
      ]);
      setSelectedComponent(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-purple-900">AI Computing Calculator</h1>
          <p className="mt-2 text-gray-600">
            Design your AI computing setup and calculate processing times for various workloads
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Component Selection */}
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-purple-900 mb-4">Hardware Components</h2>
              <div className="space-y-2">
                {Object.entries(COMPONENTS).map(([type, component]) => (
                  <motion.button
                    key={type}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedComponent(type as keyof typeof COMPONENT_TYPES)}
                    onMouseEnter={() => setShowSpecs(type)}
                    onMouseLeave={() => setShowSpecs(null)}
                    className={`w-full p-4 rounded-lg border text-left transition-colors relative ${
                      selectedComponent === type
                        ? "border-purple-600 bg-purple-50"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">{component.icon}</span>
                      <div>
                        <h3 className="font-medium text-purple-900">{component.name}</h3>
                        <p className="text-sm text-gray-600">{component.description}</p>
                      </div>
                    </div>
                    {showSpecs === type && (
                      <div className="absolute z-10 left-full ml-2 top-0 w-64 p-4 bg-white rounded-lg shadow-lg border border-gray-200">
                        <h4 className="font-medium text-purple-900 mb-2">Specifications:</h4>
                        <div className="space-y-1 text-sm">
                          <p><strong>CPU:</strong> {component.specs.cpu}</p>
                          <p><strong>Memory:</strong> {component.specs.memory}</p>
                          <p><strong>GPU:</strong> {component.specs.gpu}</p>
                          <p><strong>TFLOPS:</strong> {component.specs.tflops}</p>
                          <p><strong>VRAM:</strong> {component.specs.vram}GB</p>
                          <p><strong>Power:</strong> {component.powerConsumption}kW</p>
                        </div>
                      </div>
                    )}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Workload Selection */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-purple-900 mb-4">AI Workload</h2>
              <select
                value={selectedWorkload}
                onChange={(e) => setSelectedWorkload(e.target.value as keyof typeof AI_WORKLOADS)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
              >
                {Object.entries(AI_WORKLOADS).map(([key, workload]) => (
                  <option key={key} value={key}>
                    {workload.name}
                  </option>
                ))}
              </select>
              <div className="mt-2 space-y-2 text-sm">
                <p className="text-gray-600">
                  {AI_WORKLOADS[selectedWorkload].description}
                </p>
                <p className="text-gray-500 italic text-xs">
                  {AI_WORKLOADS[selectedWorkload].reference}
                </p>
                <p className="text-purple-600 font-medium">
                  Estimated Cost: {AI_WORKLOADS[selectedWorkload].costEstimate}
                </p>
                <div className="mt-2 bg-gray-50 p-2 rounded text-xs">
                  <p><strong>Requirements:</strong></p>
                  <p>• Minimum VRAM: {AI_WORKLOADS[selectedWorkload].requirements.minMemory}GB</p>
                  <p>• Minimum TFLOPS: {AI_WORKLOADS[selectedWorkload].requirements.minTFLOPS}</p>
                  <p>• Network Bandwidth: {AI_WORKLOADS[selectedWorkload].requirements.networkBandwidth}GB/s</p>
                </div>
              </div>
            </div>

            {/* Results Display */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-purple-900 mb-4">Processing Details</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-700">Processing Time</h3>
                  <p className="text-2xl font-bold text-purple-600">
                    {calculateProcessingTime()}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-700">Power Cost</h3>
                  <p className="text-xl font-bold text-purple-600">
                    ${calculatePowerCost()}/hour
                  </p>
                </div>
                <div className="text-sm text-gray-600">
                  <p>Total TFLOPS: {calculateTotalResources().totalTFLOPS.toFixed(1)}</p>
                  <p>Total VRAM: {calculateTotalResources().totalMemory}GB</p>
                  <p>Power Usage: {calculateTotalResources().powerConsumption.toFixed(1)}kW</p>
                </div>
              </div>
            </div>
          </div>

          {/* Grid */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div
                className="grid gap-1 relative"
                style={{
                  gridTemplateColumns: `repeat(${GRID_SIZE}, ${CELL_SIZE}px)`,
                  width: "max-content",
                  margin: "0 auto",
                }}
              >
                {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, index) => {
                  const x = index % GRID_SIZE;
                  const y = Math.floor(index / GRID_SIZE);
                  
                  return (
                    <motion.div
                      key={`${x}-${y}`}
                      className={`border ${
                        selectedComponent && hoveredCell?.x === x && hoveredCell?.y === y
                          ? isValidPlacement(x, y, selectedComponent)
                            ? "border-green-400 bg-green-50"
                            : "border-red-400 bg-red-50"
                          : "border-gray-200"
                      }`}
                      style={{
                        width: CELL_SIZE,
                        height: CELL_SIZE,
                        cursor: selectedComponent ? "pointer" : "default",
                      }}
                      onClick={() => handleCellClick(x, y)}
                      onMouseEnter={() => setHoveredCell({ x, y })}
                      onMouseLeave={() => setHoveredCell(null)}
                    />
                  );
                })}

                {/* Placed Components */}
                <AnimatePresence>
                  {placedComponents.map((component) => {
                    const componentData = COMPONENTS[component.type];
                    return (
                      <motion.div
                        key={component.id}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="absolute bg-purple-100 rounded-lg flex items-center justify-center"
                        style={{
                          width: componentData.width * CELL_SIZE - 2,
                          height: componentData.height * CELL_SIZE - 2,
                          left: component.x * CELL_SIZE,
                          top: component.y * CELL_SIZE,
                        }}
                      >
                        <div className="text-center">
                          <div className="text-3xl mb-1">{componentData.icon}</div>
                          <div className="text-sm font-medium text-purple-900">
                            {componentData.name}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 