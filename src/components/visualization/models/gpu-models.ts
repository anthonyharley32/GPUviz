// GPU model specifications based on real photos and measurements
// References:
// NVIDIA A100: https://www.nvidia.com/content/dam/en-zz/Solutions/Data-Center/a100/nvidia-a100-datasheet.pdf
// NVIDIA H100: https://www.nvidia.com/content/dam/en-zz/Solutions/Data-Center/h100/nvidia-h100-datasheet.pdf
// AMD MI300X: https://www.amd.com/en/products/server-accelerators/instinct-mi300x

export interface GPUSpec {
  name: string;
  dimensions: {
    width: number;  // PCB width in relative units (1 unit = 10cm)
    height: number; // PCB height
    length: number; // PCB length
  };
  heatsink: {
    width: number;
    height: number;
    length: number;
    color: string; // Heatsink color
  };
  pcb: {
    color: string; // PCB color
    texture?: string; // PCB texture map URL
  };
  shroud: {
    color: string; // Shroud/casing color
    texture?: string; // Shroud texture map URL
  };
  fans: {
    diameter: number;
    count: number;
    positions: [number, number, number][]; // x, y, z positions relative to PCB center
    color: string; // Fan color
    bladeColor: string; // Fan blade color
    maxRPM: number; // Maximum fan speed
  };
  memory: {
    capacity: string;
    type: string;
    bandwidth: string; // Memory bandwidth in TB/s
  };
  compute: {
    tflops: string;
    architecture: string;
    tensorCores: number; // Number of tensor cores
  };
  power: {
    tdp: number; // Thermal Design Power in watts
    maxTemp: number; // Maximum operating temperature in Celsius
    cooling: string; // Cooling solution description
  };
  performance: {
    inferenceSpeed: string; // Tokens/second for specific models
    trainingCapability: string; // Training capability description
    efficiency: string; // Performance per watt
  };
  scale: number; // Scale factor for visualization
}

export const GPUModels: { [key: string]: GPUSpec } = {
  "A100": {
    name: "NVIDIA A100",
    dimensions: {
      width: 1.0,   // PCIe dual-slot width
      height: 0.15, // Standard PCB thickness
      length: 1.5,  // Full-length PCIe card
    },
    heatsink: {
      width: 0.9,
      height: 0.3,
      length: 1.4,
      color: "#C0C0C0", // Silver aluminum
    },
    pcb: {
      color: "#006400", // Dark green PCB
      texture: "/textures/pcb-normal.png",
    },
    shroud: {
      color: "#D4D4D4", // Light silver
      texture: "/textures/shroud-normal.png",
    },
    fans: {
      diameter: 0.4,
      count: 3,
      positions: [
        [-0.4, 0.26, 0],
        [0, 0.26, 0],
        [0.4, 0.26, 0],
      ],
      color: "#2C2C2C", // Dark gray housing
      bladeColor: "#1A1A1A", // Near black blades
      maxRPM: 3000,
    },
    memory: {
      capacity: "80GB",
      type: "HBM2e",
      bandwidth: "2 TB/s",
    },
    compute: {
      tflops: "312 TFLOPS (FP16)",
      architecture: "Ampere",
      tensorCores: 432,
    },
    power: {
      tdp: 400,
      maxTemp: 85,
      cooling: "Passive + Active Fan Cooling",
    },
    performance: {
      inferenceSpeed: "20 tokens/s (FP16)",
      trainingCapability: "Suitable for models up to 175B parameters",
      efficiency: "0.78 TFLOPS/W",
    },
    scale: 1,
  },
  "H100": {
    name: "NVIDIA H100",
    dimensions: {
      width: 1.1,
      height: 0.15,
      length: 1.6,
    },
    heatsink: {
      width: 1.0,
      height: 0.35,
      length: 1.5,
      color: "#B8B8B8", // Brushed aluminum
    },
    pcb: {
      color: "#006400", // Dark green PCB
      texture: "/textures/pcb-normal.png",
    },
    shroud: {
      color: "#CCCCCC", // Silver/gray
      texture: "/textures/shroud-normal.png",
    },
    fans: {
      diameter: 0.45,
      count: 3,
      positions: [
        [-0.45, 0.28, 0],
        [0, 0.28, 0],
        [0.45, 0.28, 0],
      ],
      color: "#2C2C2C", // Dark gray housing
      bladeColor: "#1A1A1A", // Near black blades
      maxRPM: 3500,
    },
    memory: {
      capacity: "141GB",
      type: "HBM3e",
      bandwidth: "3.9 TB/s",
    },
    compute: {
      tflops: "989 TFLOPS (FP16), 1.98 PFLOPS (FP8)",
      architecture: "Hopper",
      tensorCores: 528,
    },
    power: {
      tdp: 700,
      maxTemp: 90,
      cooling: "Advanced Vapor Chamber + Active Fan Cooling",
    },
    performance: {
      inferenceSpeed: "40 tokens/s (FP8)",
      trainingCapability: "Optimized for trillion-parameter models",
      efficiency: "1.41 TFLOPS/W",
    },
    scale: 1.2,
  },
  "MI300X": {
    name: "AMD Instinct MI300X",
    dimensions: {
      width: 1.05,
      height: 0.15,
      length: 1.55,
    },
    heatsink: {
      width: 0.95,
      height: 0.32,
      length: 1.45,
      color: "#B8B8B8", // Brushed aluminum
    },
    pcb: {
      color: "#006400", // Dark green PCB
      texture: "/textures/pcb-normal.png",
    },
    shroud: {
      color: "#C8C8C8", // Light silver/gray (similar to NVIDIA cards)
      texture: "/textures/shroud-normal.png",
    },
    fans: {
      diameter: 0.42,
      count: 3,
      positions: [
        [-0.42, 0.27, 0],
        [0, 0.27, 0],
        [0.42, 0.27, 0],
      ],
      color: "#2C2C2C", // Dark gray housing
      bladeColor: "#1A1A1A", // Near black blades
      maxRPM: 3200,
    },
    memory: {
      capacity: "192GB",
      type: "HBM3",
      bandwidth: "5.3 TB/s",
    },
    compute: {
      tflops: "1.6 PFLOPS (FP16)",
      architecture: "CDNA 3",
      tensorCores: 584,
    },
    power: {
      tdp: 750,
      maxTemp: 95,
      cooling: "Advanced Vapor Chamber + Active Fan Cooling",
    },
    performance: {
      inferenceSpeed: ">40 tokens/s (FP16)",
      trainingCapability: "Optimized for large language models and multi-modal AI",
      efficiency: "2.13 TFLOPS/W",
    },
    scale: 1.1,
  },
}; 