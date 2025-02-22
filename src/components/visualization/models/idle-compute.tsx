"use client";

import { useRef } from "react";
import { Group, Vector3, Mesh, MeshStandardMaterial } from "three";
import { Text } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";

interface ConsumerDevice {
  type: "laptop" | "desktop" | "workstation";
  name: string;
  specs: {
    gpu: string;
    compute: number; // TFLOPS
    memory: number; // GB
    power: number; // Watts
  };
  contribution: {
    mining: number; // Crypto mining potential (H/s)
    folding: number; // Protein folding points/day
    inference: number; // ML inference tokens/s
  };
}

const consumerDevices: ConsumerDevice[] = [
  {
    type: "laptop",
    name: "MacBook Pro M2",
    specs: {
      gpu: "M2 Pro",
      compute: 6.8,
      memory: 32,
      power: 65,
    },
    contribution: {
      mining: 25,
      folding: 180000,
      inference: 8,
    },
  },
  {
    type: "desktop",
    name: "Gaming PC",
    specs: {
      gpu: "RTX 4090",
      compute: 82.6,
      memory: 24,
      power: 450,
    },
    contribution: {
      mining: 150,
      folding: 1200000,
      inference: 40,
    },
  },
  {
    type: "workstation",
    name: "Creator Workstation",
    specs: {
      gpu: "RTX 6000 Ada",
      compute: 91.1,
      memory: 48,
      power: 300,
    },
    contribution: {
      mining: 130,
      folding: 1500000,
      inference: 45,
    },
  },
];

interface IdleComputeProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  selectedDevice?: number;
  showContribution?: boolean;
  contributionType?: keyof ConsumerDevice["contribution"];
  idleTime?: number; // Hours per day
}

export function IdleCompute({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  selectedDevice = 0,
  showContribution = true,
  contributionType = "inference",
  idleTime = 12,
}: IdleComputeProps) {
  const groupRef = useRef<Group>(null);
  const particlesRef = useRef<Group>(null);
  const device = consumerDevices[selectedDevice];

  // Animation for contribution visualization
  useFrame((state) => {
    if (particlesRef.current && showContribution) {
      particlesRef.current.children.forEach((particle) => {
        const mesh = particle as Mesh<any, MeshStandardMaterial>;
        const t = ((state.clock.elapsedTime + mesh.userData.offset) % 2) / 2;
        const scale = 1 - t;
        const y = t * 2;
        
        mesh.position.y = y;
        mesh.scale.setScalar(scale * 0.2);
        mesh.material.opacity = scale;
      });
    }
  });

  // Calculate daily contribution
  const dailyContribution = device.contribution[contributionType] * (idleTime / 24);
  const contributionLabel = (() => {
    switch (contributionType) {
      case "mining":
        return `${dailyContribution.toFixed(1)} H/s`;
      case "folding":
        return `${(dailyContribution / 1000).toFixed(1)}k points/day`;
      case "inference":
        return `${dailyContribution.toFixed(1)} tokens/s`;
    }
  })();

  return (
    <group ref={groupRef} position={position} rotation={rotation}>
      {/* Device base */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.8, 0.05, 0.6]} />
        <meshStandardMaterial color="#2C2C2C" />
      </mesh>

      {/* Device body */}
      {device.type === "laptop" ? (
        <>
          {/* Laptop base */}
          <mesh position={[0, 0.025, 0]} castShadow>
            <boxGeometry args={[0.6, 0.02, 0.4]} />
            <meshStandardMaterial color="#666666" metalness={0.8} roughness={0.2} />
          </mesh>
          {/* Laptop screen */}
          <mesh position={[0, 0.2, -0.15]} rotation={[-0.3, 0, 0]} castShadow>
            <boxGeometry args={[0.6, 0.4, 0.02]} />
            <meshStandardMaterial color="#333333" metalness={0.5} roughness={0.5} />
          </mesh>
        </>
      ) : (
        <>
          {/* Desktop/Workstation tower */}
          <mesh position={[0, 0.3, 0]} castShadow>
            <boxGeometry args={[0.3, 0.5, 0.4]} />
            <meshStandardMaterial color="#444444" metalness={0.6} roughness={0.4} />
          </mesh>
          {/* Ventilation grills */}
          <mesh position={[0, 0.3, 0.201]} castShadow>
            <planeGeometry args={[0.25, 0.45]} />
            <meshStandardMaterial
              color="#333333"
              metalness={0.7}
              roughness={0.3}
              transparent
              opacity={0.8}
            />
          </mesh>
        </>
      )}

      {/* Contribution visualization */}
      {showContribution && (
        <group ref={particlesRef}>
          {Array.from({ length: 10 }).map((_, i) => (
            <mesh key={i} position={[0, 0, 0]} userData={{ offset: i * 0.1 }}>
              <sphereGeometry args={[0.1]} />
              <meshStandardMaterial
                color="#8B5CF6"
                transparent
                opacity={0.8}
                emissive="#8B5CF6"
                emissiveIntensity={0.5}
              />
            </mesh>
          ))}
        </group>
      )}

      {/* Device info */}
      <group position={[0.5, 0.3, 0]}>
        <Text
          position={[0, 0.2, 0]}
          rotation={[0, -Math.PI / 2, 0]}
          fontSize={0.08}
          color="white"
          anchorY="top"
          maxWidth={1}
        >
          {device.name}
        </Text>
        <Text
          position={[0, 0, 0]}
          rotation={[0, -Math.PI / 2, 0]}
          fontSize={0.06}
          color="#A78BFA"
          anchorY="top"
          maxWidth={1}
        >
          {`${device.specs.compute} TFLOPS\n${device.specs.memory}GB Memory`}
        </Text>
        {showContribution && (
          <Text
            position={[0, -0.2, 0]}
            rotation={[0, -Math.PI / 2, 0]}
            fontSize={0.06}
            color="#10B981"
            anchorY="top"
            maxWidth={1}
          >
            {`Idle Contribution:\n${contributionLabel}\n(${idleTime}h/day)`}
          </Text>
        )}
      </group>
    </group>
  );
} 