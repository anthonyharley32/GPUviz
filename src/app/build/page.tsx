"use client";

import { useState } from "react";
import { Scene } from "@/components/visualization/scene";
import { ServerRack } from "@/components/visualization/models/server-rack";
import { GPUModels } from "@/components/visualization/models/gpu-models";

interface ServerConfig {
  name: string;
  gpuModel: keyof typeof GPUModels;
  gpuCount: number;
  rackCount: number;
}

export default function BuildPage() {
  const [configs, setConfigs] = useState<ServerConfig[]>([
    {
      name: "My Server",
      gpuModel: "H100",
      gpuCount: 4,
      rackCount: 1,
    },
  ]);
  const [showThermal, setShowThermal] = useState(false);
  const [showPerformance, setShowPerformance] = useState(false);
  const [load, setLoad] = useState(0.5);
  const [selectedConfig, setSelectedConfig] = useState(0);

  // Calculate total metrics for a configuration
  const calculateMetrics = (config: ServerConfig) => {
    const gpu = GPUModels[config.gpuModel];
    const tflopsMatch = gpu.compute.tflops.match(/(\d+\.?\d*)/);
    const tflopsPerGPU = tflopsMatch ? parseFloat(tflopsMatch[1]) : 0;
    const totalTFLOPS = tflopsPerGPU * config.gpuCount * config.rackCount;

    const memoryMatch = gpu.memory.capacity.match(/(\d+)/);
    const memoryPerGPU = memoryMatch ? parseInt(memoryMatch[1]) : 0;
    const totalMemory = memoryPerGPU * config.gpuCount * config.rackCount;

    const totalPower = gpu.power.tdp * config.gpuCount * config.rackCount * load / 1000; // kW

    return { totalTFLOPS, totalMemory, totalPower };
  };

  // Add a new configuration
  const addConfig = () => {
    setConfigs([
      ...configs,
      {
        name: `Server ${configs.length + 1}`,
        gpuModel: "H100",
        gpuCount: 4,
        rackCount: 1,
      },
    ]);
  };

  // Update a configuration
  const updateConfig = (index: number, updates: Partial<ServerConfig>) => {
    const newConfigs = [...configs];
    newConfigs[index] = { ...newConfigs[index], ...updates };
    setConfigs(newConfigs);
  };

  // Delete a configuration
  const deleteConfig = (index: number) => {
    if (configs.length > 1) {
      const newConfigs = configs.filter((_, i) => i !== index);
      setConfigs(newConfigs);
      if (selectedConfig >= newConfigs.length) {
        setSelectedConfig(newConfigs.length - 1);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-purple-900">Build Your Server</h1>
          <p className="mt-2 text-gray-600">
            Design and compare custom GPU server configurations for AI/ML workloads
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Configuration Controls */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-purple-900">Configurations</h2>
                <button
                  onClick={addConfig}
                  className="px-3 py-1 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                >
                  Add Server
                </button>
              </div>

              <div className="space-y-2">
                {configs.map((config, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedConfig(index)}
                    className={`block w-full text-left px-4 py-3 rounded-lg border ${
                      selectedConfig === index
                        ? "border-purple-600 bg-purple-50"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-purple-900">{config.name}</span>
                      {configs.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteConfig(index);
                          }}
                          className="text-gray-400 hover:text-red-600"
                        >
                          ×
                        </button>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {config.rackCount}x Rack • {config.gpuCount}x {config.gpuModel} per rack
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Configuration Controls */}
            <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
              <h2 className="text-lg font-semibold text-purple-900">Server Settings</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    value={configs[selectedConfig].name}
                    onChange={(e) => updateConfig(selectedConfig, { name: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">GPU Model</label>
                  <select
                    value={configs[selectedConfig].gpuModel}
                    onChange={(e) => updateConfig(selectedConfig, { gpuModel: e.target.value as keyof typeof GPUModels })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                  >
                    {Object.keys(GPUModels).map((model) => (
                      <option key={model} value={model}>
                        {model}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">GPUs per Rack</label>
                  <input
                    type="number"
                    min="1"
                    max="16"
                    value={configs[selectedConfig].gpuCount}
                    onChange={(e) => updateConfig(selectedConfig, { gpuCount: Math.max(1, Math.min(16, parseInt(e.target.value))) })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Number of Racks</label>
                  <input
                    type="number"
                    min="1"
                    max="16"
                    value={configs[selectedConfig].rackCount}
                    onChange={(e) => updateConfig(selectedConfig, { rackCount: Math.max(1, Math.min(16, parseInt(e.target.value))) })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Load</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={load}
                    onChange={(e) => setLoad(Number(e.target.value))}
                    className="mt-1 block w-full"
                  />
                  <div className="mt-1 text-sm text-gray-600">{Math.round(load * 100)}% Utilization</div>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={showThermal}
                      onChange={(e) => setShowThermal(e.target.checked)}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-700">Show Thermal</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={showPerformance}
                      onChange={(e) => setShowPerformance(e.target.checked)}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-700">Show Performance</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* 3D Visualization */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden" style={{ height: "600px" }}>
              <Scene>
                {configs.map((config, index) => (
                  <group
                    key={index}
                    position={[
                      (index - selectedConfig) * 4,
                      0,
                      0,
                    ]}
                  >
                    {Array.from({ length: config.rackCount }).map((_, rackIndex) => (
                      <ServerRack
                        key={rackIndex}
                        position={[0, 0, (rackIndex - (config.rackCount - 1) / 2) * 2]}
                        rotation={[0, Math.PI / 2, 0]}
                        gpuModel={config.gpuModel}
                        gpuCount={config.gpuCount}
                        showThermal={showThermal}
                        showPerformance={showPerformance}
                        load={load}
                      />
                    ))}
                  </group>
                ))}

                {/* Ground plane */}
                <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                  <planeGeometry args={[100, 100]} />
                  <meshStandardMaterial color="#f3f4f6" />
                </mesh>
              </Scene>
            </div>

            {/* Metrics */}
            <div className="mt-6 grid grid-cols-3 gap-4">
              {configs.map((config, index) => {
                const metrics = calculateMetrics(config);
                return (
                  <div
                    key={index}
                    className={`p-4 rounded-lg ${
                      selectedConfig === index
                        ? "bg-purple-600 text-white"
                        : "bg-white text-purple-900"
                    }`}
                  >
                    <h3 className="font-medium">{config.name}</h3>
                    <div className="mt-2 space-y-1 text-sm">
                      <p>
                        {metrics.totalTFLOPS.toFixed(1)} TFLOPS
                      </p>
                      <p>
                        {metrics.totalMemory} GB Memory
                      </p>
                      <p>
                        {metrics.totalPower.toFixed(1)} kW Power
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 