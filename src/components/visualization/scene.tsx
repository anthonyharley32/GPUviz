"use client";

import { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import { VectorSpace, type ViewPosition } from "./vector-space";
import { ViewTabs } from "./view-tabs";
import { GPU } from "./models/gpu";
import { HardwareComparison } from "./hardware-comparison";

// Basic scene setup for general use
interface SceneProps {
  children: React.ReactNode;
}

export function Scene({ children }: SceneProps) {
  return (
    <div className="w-full h-full">
      <Canvas shadows>
        <Environment preset="city" />
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[2.5, 8, 5]}
          intensity={1.5}
          castShadow
          shadow-mapSize={[1024, 1024]}
        >
          <orthographicCamera attach="shadow-camera" args={[-10, 10, -10, 10]} />
        </directionalLight>
        {children}
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 1.5}
        />
      </Canvas>
    </div>
  );
}

// Define our vector space views
const views: Record<string, ViewPosition> = {
  "overview": {
    name: "Overview",
    description: "Compare different GPU models side by side",
    position: [5, 3, 5],
    target: [0, 0, 0],
  },
  "a100": {
    name: "A100",
    description: "NVIDIA A100 - Data center GPU optimized for AI training",
    position: [2, 1, 2],
    target: [0, 0, 0],
  },
  "h100": {
    name: "H100",
    description: "NVIDIA H100 - Next-gen Hopper architecture",
    position: [-2, 1, 2],
    target: [0, 0, 0],
  },
  "mi300x": {
    name: "MI300X",
    description: "AMD Instinct MI300X - High-performance compute accelerator",
    position: [0, 1, -2],
    target: [0, 0, 0],
  },
  "comparison": {
    name: "Performance",
    description: "Compare performance metrics and capabilities",
    position: [0, 8, 0],
    target: [0, 0, 0],
  },
};

// Advanced visualization scene with vector space navigation
export function VisualizationScene() {
  const [currentView, setCurrentView] = useState("overview");
  const [showThermal, setShowThermal] = useState(false);
  const [showPerformance, setShowPerformance] = useState(false);
  const [load, setLoad] = useState(0.5);

  return (
    <div className="w-full h-screen relative">
      <ViewTabs
        views={views}
        currentView={currentView}
        onViewChange={setCurrentView}
      />
      
      <div className="absolute bottom-4 left-4 z-10 flex flex-col gap-4">
        {currentView !== "comparison" && (
          <>
            <label className="flex items-center gap-2 text-white">
              <input
                type="checkbox"
                checked={showThermal}
                onChange={(e) => setShowThermal(e.target.checked)}
                className="rounded border-gray-300"
              />
              Show Thermal
            </label>
            <label className="flex items-center gap-2 text-white">
              <input
                type="checkbox"
                checked={showPerformance}
                onChange={(e) => setShowPerformance(e.target.checked)}
                className="rounded border-gray-300"
              />
              Show Performance
            </label>
            <label className="flex flex-col gap-1 text-white">
              <span>Load: {Math.round(load * 100)}%</span>
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
          </>
        )}
      </div>

      <div className="absolute top-20 right-4 z-10 max-w-md bg-black/30 backdrop-blur-lg rounded-lg p-4 text-white">
        <h2 className="text-xl font-bold mb-2">{views[currentView].name}</h2>
        <p className="text-gray-200">{views[currentView].description}</p>
      </div>

      <Canvas shadows camera={{ position: [5, 3, 5], fov: 50 }}>
        <VectorSpace
          views={views}
          currentView={currentView}
          transitionDuration={1.5}
        >
          <Environment preset="city" />
          <ambientLight intensity={0.5} />
          <directionalLight
            position={[5, 5, 5]}
            intensity={1}
            castShadow
            shadow-mapSize={2048}
          />

          {currentView === "comparison" ? (
            <HardwareComparison />
          ) : (
            <>
              {/* GPUs */}
              <GPU
                model="A100"
                position={[2, 0, 0]}
                showThermal={showThermal}
                showPerformance={showPerformance}
                load={load}
              />
              <GPU
                model="H100"
                position={[-2, 0, 0]}
                rotation={[0, Math.PI / 6, 0]}
                showThermal={showThermal}
                showPerformance={showPerformance}
                load={load}
              />
              <GPU
                model="MI300X"
                position={[0, 0, -2]}
                rotation={[0, -Math.PI / 6, 0]}
                showThermal={showThermal}
                showPerformance={showPerformance}
                load={load}
              />
            </>
          )}

          {/* Ground plane */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[50, 50]} />
            <meshStandardMaterial color="#111111" />
          </mesh>

          <OrbitControls
            enablePan={false}
            enableZoom={true}
            minPolarAngle={Math.PI / 4}
            maxPolarAngle={Math.PI / 2}
          />
        </VectorSpace>
      </Canvas>
    </div>
  );
} 