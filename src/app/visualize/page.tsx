"use client";

import { useState } from "react";
import { Scene, VisualizationScene } from "@/components/visualization/scene";
import { Tabs, type Tab } from "@/components/visualization/tabs";
import { GPU } from "@/components/visualization/models/gpu";
import { ServerRack } from "@/components/visualization/models/server-rack";
import { IdleCompute } from "@/components/visualization/models/idle-compute";
import { GPUModels } from "@/components/visualization/models/gpu-models";
import { Warehouse, type SupercomputerConfig, supercomputerConfigs } from "@/components/visualization/models/warehouse";

const tabs: Tab[] = [
  {
    id: "overview",
    title: "Overview",
    description: "Compare different GPU sizes and form factors",
    position: [0, 2, 5],
    target: [0, 0, 0],
  },
  {
    id: "server",
    title: "Server Setup",
    description: "Explore typical server configurations for AI/ML workloads",
    position: [5, 2, 5],
    target: [0, 0, 0],
  },
  {
    id: "warehouse",
    title: "Warehouse",
    description: "View warehouse-scale computing",
    position: [10, 5, 10],
    target: [0, 0, 0],
  },
  {
    id: "idle",
    title: "Idle Compute",
    description: "Explore the potential of idle consumer devices",
    position: [0, 2, 5],
    target: [0, 0, 0],
  },
  {
    id: "vector",
    title: "Vector Space",
    description: "Interactive GPU exploration in vector space",
    position: [0, 2, 5],
    target: [0, 0, 0],
  },
];

// Example workload configurations
const workloadConfigs = {
  "llama-70b": {
    name: "LLaMA-70B Training",
    gpuModel: "H100",
    gpuCount: 8,
    description: "Training configuration for LLaMA-70B, requiring high memory bandwidth and compute power",
    powerDraw: "~5.6kW per rack",
    performance: "15.8 PFLOPS FP16",
  },
  "gpt3-175b": {
    name: "GPT-3 175B Inference",
    gpuModel: "A100",
    gpuCount: 8,
    description: "Optimized for GPT-3 175B parameter model inference",
    powerDraw: "~3.2kW per rack",
    performance: "2.5 PFLOPS FP16",
  },
  "stable-diffusion": {
    name: "Stable Diffusion XL",
    gpuModel: "MI300X",
    gpuCount: 4,
    description: "Image generation cluster for Stable Diffusion XL",
    powerDraw: "~3.0kW per rack",
    performance: "6.4 PFLOPS FP16",
  },
};

const contributionTypes = {
  inference: "ML Inference",
  folding: "Protein Folding",
  mining: "Charitable Mining",
};

export default function VisualizePage() {
  const [currentTab, setCurrentTab] = useState<Tab>(tabs[0]);
  const [selectedGPU, setSelectedGPU] = useState<string>("A100");
  const [showThermal, setShowThermal] = useState(false);
  const [showPerformance, setShowPerformance] = useState(false);
  const [load, setLoad] = useState(0.5);
  const [selectedWorkload, setSelectedWorkload] = useState<keyof typeof workloadConfigs>("llama-70b");
  const [selectedDevice, setSelectedDevice] = useState(0);
  const [contributionType, setContributionType] = useState<keyof typeof contributionTypes>("inference");
  const [idleTime, setIdleTime] = useState(12);
  const [selectedCluster, setSelectedCluster] = useState(0);

  return (
    <div className="relative min-h-[calc(100vh-4rem)]">
      {/* 3D Scene */}
      <div className="absolute inset-0">
        {currentTab.id === "vector" ? (
          <VisualizationScene />
        ) : (
          <Scene>
            {/* Overview tab content */}
            {currentTab.id === "overview" && (
              <>
                <GPU model="A100" position={[-2.5, 0, 0]} rotation={[0, Math.PI / 6, 0]} />
                <GPU model="H100" position={[0, 0, 0]} rotation={[0, Math.PI / 6, 0]} />
                <GPU model="MI300X" position={[2.5, 0, 0]} rotation={[0, Math.PI / 6, 0]} />
              </>
            )}

            {/* Server tab content */}
            {currentTab.id === "server" && (
              <>
                <ServerRack
                  position={[0, 0, 0]}
                  gpuModel={workloadConfigs[selectedWorkload].gpuModel as keyof typeof GPUModels}
                  gpuCount={workloadConfigs[selectedWorkload].gpuCount}
                  showThermal={showThermal}
                  showPerformance={showPerformance}
                  load={load}
                />
              </>
            )}

            {/* Warehouse tab content */}
            {currentTab.id === "warehouse" && (
              <Warehouse
                selectedConfig={selectedCluster}
                showThermal={showThermal}
                showPerformance={showPerformance}
                load={load}
              />
            )}

            {/* Idle Compute tab content */}
            {currentTab.id === "idle" && (
              <>
                <IdleCompute
                  position={[-2.5, 0, 0]}
                  selectedDevice={0}
                  contributionType={contributionType}
                  idleTime={idleTime}
                />
                <IdleCompute
                  position={[0, 0, 0]}
                  selectedDevice={1}
                  contributionType={contributionType}
                  idleTime={idleTime}
                />
                <IdleCompute
                  position={[2.5, 0, 0]}
                  selectedDevice={2}
                  contributionType={contributionType}
                  idleTime={idleTime}
                />
              </>
            )}

            {/* Ground plane */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
              <planeGeometry args={[100, 100]} />
              <meshStandardMaterial color="#f3f4f6" />
            </mesh>
          </Scene>
        )}
      </div>

      {/* Tabs */}
      <Tabs
        tabs={tabs}
        currentTab={currentTab}
        onTabChange={setCurrentTab}
      />

      {/* Controls */}
      {currentTab.id !== "vector" && currentTab.id !== "overview" && (
        <div className="absolute top-20 left-4 bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-4 space-y-4">
          {currentTab.id === "idle" ? (
            <>
              <h3 className="text-lg font-semibold text-purple-900">Idle Compute Settings</h3>
              <div className="space-y-4">
                <div>
                  <p className="font-medium text-purple-900 mb-2">Contribution Type</p>
                  {Object.entries(contributionTypes).map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => setContributionType(key as keyof typeof contributionTypes)}
                      className={`block w-full text-left px-3 py-2 rounded ${
                        contributionType === key
                          ? "bg-purple-600 text-white"
                          : "hover:bg-purple-100 text-purple-900"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <div>
                  <label className="flex flex-col gap-1">
                    <span className="text-purple-900">Idle Hours per Day: {idleTime}h</span>
                    <input
                      type="range"
                      min="1"
                      max="24"
                      step="1"
                      value={idleTime}
                      onChange={(e) => setIdleTime(Number(e.target.value))}
                      className="w-48"
                    />
                  </label>
                </div>
              </div>
            </>
          ) : currentTab.id === "warehouse" ? (
            <>
              <h3 className="text-lg font-semibold text-purple-900">Supercomputer Configuration</h3>
              <div className="space-y-2">
                {supercomputerConfigs.map((config: SupercomputerConfig, index: number) => (
                  <button
                    key={index}
                    onClick={() => setSelectedCluster(index)}
                    className={`block w-full text-left px-3 py-2 rounded ${
                      selectedCluster === index
                        ? "bg-purple-600 text-white"
                        : "hover:bg-purple-100 text-purple-900"
                    }`}
                  >
                    <div className="font-medium">{config.name}</div>
                    <div className="text-sm opacity-80">{config.description}</div>
                  </button>
                ))}
              </div>
              <div className="space-y-2 pt-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={showThermal}
                    onChange={(e) => setShowThermal(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-purple-900">Show Thermal</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={showPerformance}
                    onChange={(e) => setShowPerformance(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-purple-900">Show Network</span>
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-purple-900">Load: {Math.round(load * 100)}%</span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={load}
                    onChange={(e) => setLoad(Number(e.target.value))}
                    className="w-48"
                  />
                </label>
              </div>
            </>
          ) : (
            <>
              <h3 className="text-lg font-semibold text-purple-900">Workload Configuration</h3>
              <div className="space-y-2">
                {Object.entries(workloadConfigs).map(([key, config]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedWorkload(key as keyof typeof workloadConfigs)}
                    className={`block w-full text-left px-3 py-2 rounded ${
                      selectedWorkload === key
                        ? "bg-purple-600 text-white"
                        : "hover:bg-purple-100 text-purple-900"
                    }`}
                  >
                    {config.name}
                  </button>
                ))}
              </div>
              <div className="space-y-2 pt-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={showThermal}
                    onChange={(e) => setShowThermal(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-purple-900">Show Thermal</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={showPerformance}
                    onChange={(e) => setShowPerformance(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-purple-900">Show Performance</span>
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-purple-900">Load: {Math.round(load * 100)}%</span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={load}
                    onChange={(e) => setLoad(Number(e.target.value))}
                    className="w-48"
                  />
                </label>
              </div>
            </>
          )}
        </div>
      )}

      {/* Info Panel */}
      {currentTab.id !== "vector" && (
        <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-4">
          <h2 className="text-lg font-semibold text-purple-900 mb-2">
            {currentTab.id === "overview"
              ? selectedGPU
              : currentTab.id === "idle"
              ? "Idle Compute Impact"
              : currentTab.id === "warehouse"
              ? supercomputerConfigs[selectedCluster].name
              : workloadConfigs[selectedWorkload].name}
          </h2>
          {currentTab.id === "overview" ? (
            <div className="space-y-2 text-sm text-purple-800">
              <p className="font-medium">{GPUModels[selectedGPU as keyof typeof GPUModels].name}</p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="font-medium">Memory</p>
                  <p>{GPUModels[selectedGPU as keyof typeof GPUModels].memory.capacity} {GPUModels[selectedGPU as keyof typeof GPUModels].memory.type}</p>
                </div>
                <div>
                  <p className="font-medium">Compute</p>
                  <p>{GPUModels[selectedGPU as keyof typeof GPUModels].compute.tflops}</p>
                </div>
                <div>
                  <p className="font-medium">Architecture</p>
                  <p>{GPUModels[selectedGPU as keyof typeof GPUModels].compute.architecture}</p>
                </div>
              </div>
            </div>
          ) : currentTab.id === "idle" ? (
            <div className="space-y-2 text-sm text-purple-800">
              <p>
                When your devices are idle, they can contribute to various computational tasks:
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>Help train and run AI models</li>
                <li>Support scientific research through distributed computing</li>
                <li>Mine cryptocurrency for charitable causes</li>
              </ul>
              <p className="mt-4">
                With just {idleTime} hours of idle time per day, your devices can make a significant impact
                while maintaining their primary functionality.
              </p>
            </div>
          ) : currentTab.id === "warehouse" ? (
            <div className="space-y-2 text-sm text-purple-800">
              <p>{supercomputerConfigs[selectedCluster].description}</p>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div>
                  <p className="font-medium">Total GPUs</p>
                  <p>{supercomputerConfigs[selectedCluster].rackCount * supercomputerConfigs[selectedCluster].gpuCount}x {supercomputerConfigs[selectedCluster].gpuModel}</p>
                </div>
                <div>
                  <p className="font-medium">Peak Power</p>
                  <p>{supercomputerConfigs[selectedCluster].totalPower.toFixed(1)} kW</p>
                </div>
                <div>
                  <p className="font-medium">Peak Performance</p>
                  <p>{supercomputerConfigs[selectedCluster].totalCompute.toFixed(1)} PFLOPS</p>
                </div>
                <div>
                  <p className="font-medium">Workload</p>
                  <p>{supercomputerConfigs[selectedCluster].aiWorkload}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2 text-sm text-purple-800">
              <p>{workloadConfigs[selectedWorkload].description}</p>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div>
                  <p className="font-medium">Power Draw</p>
                  <p>{workloadConfigs[selectedWorkload].powerDraw}</p>
                </div>
                <div>
                  <p className="font-medium">Performance</p>
                  <p>{workloadConfigs[selectedWorkload].performance}</p>
                </div>
                <div>
                  <p className="font-medium">Configuration</p>
                  <p>{workloadConfigs[selectedWorkload].gpuCount}x {workloadConfigs[selectedWorkload].gpuModel}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 