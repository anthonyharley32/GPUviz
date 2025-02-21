"use client";

import { useRef, useState } from "react";
import { Mesh, Group, Shape, ExtrudeGeometry, Color, TextureLoader } from "three";
import { useFrame, useLoader } from "@react-three/fiber";
import { GPUModels, type GPUSpec } from "./gpu-models";

interface GPUProps {
  model?: keyof typeof GPUModels;
  position?: [number, number, number];
  rotation?: [number, number, number];
  showThermal?: boolean;
  showPerformance?: boolean;
  load?: number; // 0-1 representing current load
}

export function GPU({
  model = "A100",
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  showThermal = false,
  showPerformance = false,
  load = 0.5,
}: GPUProps) {
  const spec = GPUModels[model];
  const groupRef = useRef<Group>(null);
  const fanRefs = useRef<Mesh[]>([]);
  const [temperature, setTemperature] = useState(40); // Starting temperature

  // Load textures
  const pcbTexture = spec.pcb.texture ? useLoader(TextureLoader, spec.pcb.texture) : null;
  const shroudTexture = spec.shroud.texture ? useLoader(TextureLoader, spec.shroud.texture) : null;

  // Calculate thermal color based on temperature
  const getThermalColor = (temp: number) => {
    const t = (temp - 40) / (spec.power.maxTemp - 40); // Normalize between 40°C and max temp
    return new Color().setHSL(0.6 - t * 0.6, 1, 0.5); // Blue to red
  };

  useFrame((state, delta) => {
    if (groupRef.current) {
      // Subtle floating animation
      groupRef.current.position.y += Math.sin(state.clock.elapsedTime) * 0.0005;
    }

    // Fan rotation speed based on load
    const fanSpeed = load * spec.fans.maxRPM / 60 * 2 * Math.PI;
    fanRefs.current.forEach((fan) => {
      if (fan) {
        fan.rotation.z += delta * fanSpeed;
      }
    });

    // Update temperature based on load
    const targetTemp = 40 + (spec.power.maxTemp - 40) * load;
    setTemperature(prev => prev + (targetTemp - prev) * delta);
  });

  // Create shroud geometry with fan cutouts
  const createShroudGeometry = () => {
    const shape = new Shape();
    const width = spec.heatsink.width + 0.05;
    const length = spec.heatsink.length + 0.05;
    const fanRadius = spec.fans.diameter / 2 + 0.01;

    // Draw outer rectangle
    shape.moveTo(-width / 2, -length / 2);
    shape.lineTo(width / 2, -length / 2);
    shape.lineTo(width / 2, length / 2);
    shape.lineTo(-width / 2, length / 2);
    shape.lineTo(-width / 2, -length / 2);

    // Create circular holes for fans
    spec.fans.positions.forEach(([x, _, z]) => {
      shape.absarc(x, z, fanRadius, 0, Math.PI * 2, true);
    });

    return new ExtrudeGeometry(shape, {
      depth: spec.heatsink.height,
      bevelEnabled: false,
    });
  };

  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={spec.scale}>
      {/* Main PCB with normal map */}
      <mesh castShadow receiveShadow>
        <boxGeometry
          args={[
            spec.dimensions.width,
            spec.dimensions.height,
            spec.dimensions.length,
          ]}
        />
        <meshStandardMaterial
          color={spec.pcb.color}
          roughness={0.6}
          normalMap={pcbTexture}
        />
      </mesh>

      {/* PCIe Connector */}
      <mesh
        position={[0, -spec.dimensions.height / 2, spec.dimensions.length / 2 - 0.1]}
        castShadow
      >
        <boxGeometry args={[0.4, 0.05, 0.15]} />
        <meshStandardMaterial color="#FFD700" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Heatsink Base with thermal visualization */}
      <mesh
        position={[0, spec.dimensions.height + spec.heatsink.height / 2, 0]}
        castShadow
        receiveShadow
      >
        <boxGeometry
          args={[
            spec.heatsink.width,
            spec.heatsink.height,
            spec.heatsink.length,
          ]}
        />
        <meshStandardMaterial
          color={showThermal ? getThermalColor(temperature) : spec.heatsink.color}
          metalness={0.8}
          roughness={0.2}
          emissive={showThermal ? getThermalColor(temperature) : "#000000"}
          emissiveIntensity={showThermal ? 0.5 : 0}
        />
      </mesh>

      {/* Shroud/Casing with normal map */}
      <mesh
        position={[
          0,
          spec.dimensions.height + spec.heatsink.height,
          0,
        ]}
        rotation={[-Math.PI / 2, 0, 0]}
        castShadow
      >
        <primitive object={createShroudGeometry()} />
        <meshStandardMaterial
          color={spec.shroud.color}
          metalness={0.6}
          roughness={0.3}
          normalMap={shroudTexture}
          side={2}
        />
      </mesh>

      {/* Enhanced fans with performance indication */}
      {spec.fans.positions.map((pos, index) => (
        <group key={index} position={pos}>
          {/* Fan housing with glow effect when under load */}
          <mesh castShadow receiveShadow>
            <cylinderGeometry
              args={[
                spec.fans.diameter / 2,
                spec.fans.diameter / 2,
                0.05,
                32,
              ]}
            />
            <meshStandardMaterial
              color={spec.fans.color}
              metalness={0.5}
              roughness={0.5}
              emissive={showPerformance ? new Color(0x4444ff) : undefined}
              emissiveIntensity={showPerformance ? load * 0.5 : 0}
            />
          </mesh>

          {/* Fan blades with motion blur effect at high speeds */}
          <mesh
            ref={(el) => {
              if (el) fanRefs.current[index] = el;
            }}
            position={[0, 0.01, 0]}
            castShadow
          >
            <cylinderGeometry
              args={[
                spec.fans.diameter / 2 - 0.02,
                spec.fans.diameter / 2 - 0.05,
                0.02,
                32,
                8,
              ]}
            />
            <meshStandardMaterial
              color={spec.fans.bladeColor}
              metalness={0.4}
              roughness={0.6}
              transparent={true}
              opacity={load > 0.8 ? 0.8 : 1} // Blur effect at high speeds
            />
          </mesh>

          {/* Fan center hub */}
          <mesh position={[0, 0.02, 0]} castShadow>
            <cylinderGeometry args={[0.05, 0.05, 0.03, 16]} />
            <meshStandardMaterial
              color={spec.fans.color}
              metalness={0.6}
              roughness={0.4}
            />
          </mesh>
        </group>
      ))}

      {/* Memory modules with performance indicators */}
      {[...Array(4)].map((_, i) => (
        <mesh
          key={i}
          position={[
            -spec.dimensions.width / 3 + (i * spec.dimensions.width) / 2,
            spec.dimensions.height,
            0,
          ]}
          castShadow
        >
          <boxGeometry args={[0.15, 0.02, 0.15]} />
          <meshStandardMaterial
            color="#1a1a1a"
            metalness={0.6}
            roughness={0.3}
            emissive={showPerformance ? new Color(0x00ff00) : undefined}
            emissiveIntensity={showPerformance ? load * 0.5 : 0}
          />
        </mesh>
      ))}

      {/* Performance indicator ring */}
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