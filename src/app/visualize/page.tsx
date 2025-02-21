"use client";

import { useState } from "react";
import { Scene } from "@/components/visualization/scene";
import { Tabs, type Tab } from "@/components/visualization/tabs";
import { GPU } from "@/components/visualization/models/gpu";
import { GPUModels } from "@/components/visualization/models/gpu-models";

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
    description: "Explore typical server configurations",
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
];

export default function VisualizePage() {
  const [currentTab, setCurrentTab] = useState<Tab>(tabs[0]);
  const [selectedGPU, setSelectedGPU] = useState<string>("A100");

  return (
    <div className="relative min-h-[calc(100vh-4rem)]">
      {/* 3D Scene */}
      <div className="absolute inset-0">
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
              {/* Server rack with multiple GPUs will be added here */}
              <GPU model="H100" position={[0, 0, 0]} rotation={[0, 0, 0]} />
            </>
          )}

          {/* Warehouse tab content */}
          {currentTab.id === "warehouse" && (
            <>
              {/* Multiple server racks will be added here */}
              <GPU model="H100" position={[0, 0, 0]} rotation={[0, 0, 0]} />
            </>
          )}

          {/* Ground plane */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[100, 100]} />
            <meshStandardMaterial color="#f3f4f6" /> {/* gray-100 */}
          </mesh>
        </Scene>
      </div>

      {/* Tabs */}
      <Tabs
        tabs={tabs}
        currentTab={currentTab}
        onTabChange={setCurrentTab}
      />

      {/* Info Panel */}
      <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-4">
        <h2 className="text-lg font-semibold text-purple-900 mb-2">
          {currentTab.id === "overview" ? selectedGPU : currentTab.title}
        </h2>
        {currentTab.id === "overview" && (
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
        )}
        {currentTab.id !== "overview" && (
          <p className="text-sm text-purple-800">
            {currentTab.description}
          </p>
        )}
      </div>
    </div>
  );
} 