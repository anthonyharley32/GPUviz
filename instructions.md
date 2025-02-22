1. Color Scheme. Let's make the main site an off white with a purple accent for text and stuff. Use this for the hero section 

"""
Copy-paste this component to /components/ui folder:
```tsx
flickering-grid.tsx
"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

interface FlickeringGridProps {
  squareSize?: number;
  gridGap?: number;
  flickerChance?: number;
  color?: string;
  width?: number;
  height?: number;
  className?: string;

  maxOpacity?: number;
}

const FlickeringGrid: React.FC<FlickeringGridProps> = ({
  squareSize = 4,
  gridGap = 6,
  flickerChance = 0.3,
  color = "rgb(0, 0, 0)",
  width,
  height,
  className,
  maxOpacity = 0.3,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  const memoizedColor = useMemo(() => {
    const toRGBA = (color: string) => {
      if (typeof window === "undefined") {
        return `rgba(0, 0, 0,`;
      }
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = 1;
      const ctx = canvas.getContext("2d");
      if (!ctx) return "rgba(255, 0, 0,";
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, 1, 1);
      const [r, g, b] = Array.from(ctx.getImageData(0, 0, 1, 1).data);
      return `rgba(${r}, ${g}, ${b},`;
    };
    return toRGBA(color);
  }, [color]);

  const setupCanvas = useCallback(
    (canvas: HTMLCanvasElement, width: number, height: number) => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      const cols = Math.floor(width / (squareSize + gridGap));
      const rows = Math.floor(height / (squareSize + gridGap));

      const squares = new Float32Array(cols * rows);
      for (let i = 0; i < squares.length; i++) {
        squares[i] = Math.random() * maxOpacity;
      }

      return { cols, rows, squares, dpr };
    },
    [squareSize, gridGap, maxOpacity],
  );

  const updateSquares = useCallback(
    (squares: Float32Array, deltaTime: number) => {
      for (let i = 0; i < squares.length; i++) {
        if (Math.random() < flickerChance * deltaTime) {
          squares[i] = Math.random() * maxOpacity;
        }
      }
    },
    [flickerChance, maxOpacity],
  );

  const drawGrid = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      width: number,
      height: number,
      cols: number,
      rows: number,
      squares: Float32Array,
      dpr: number,
    ) => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = "transparent";
      ctx.fillRect(0, 0, width, height);

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const opacity = squares[i * rows + j];
          ctx.fillStyle = `${memoizedColor}${opacity})`;
          ctx.fillRect(
            i * (squareSize + gridGap) * dpr,
            j * (squareSize + gridGap) * dpr,
            squareSize * dpr,
            squareSize * dpr,
          );
        }
      }
    },
    [memoizedColor, squareSize, gridGap],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let gridParams: ReturnType<typeof setupCanvas>;

    const updateCanvasSize = () => {
      const newWidth = width || container.clientWidth;
      const newHeight = height || container.clientHeight;
      setCanvasSize({ width: newWidth, height: newHeight });
      gridParams = setupCanvas(canvas, newWidth, newHeight);
    };

    updateCanvasSize();

    let lastTime = 0;
    const animate = (time: number) => {
      if (!isInView) return;

      const deltaTime = (time - lastTime) / 1000;
      lastTime = time;

      updateSquares(gridParams.squares, deltaTime);
      drawGrid(
        ctx,
        canvas.width,
        canvas.height,
        gridParams.cols,
        gridParams.rows,
        gridParams.squares,
        gridParams.dpr,
      );
      animationFrameId = requestAnimationFrame(animate);
    };

    const resizeObserver = new ResizeObserver(() => {
      updateCanvasSize();
    });

    resizeObserver.observe(container);

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0 },
    );

    intersectionObserver.observe(canvas);

    if (isInView) {
      animationFrameId = requestAnimationFrame(animate);
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
    };
  }, [setupCanvas, updateSquares, drawGrid, width, height, isInView]);

  return (
    <div ref={containerRef} className={`w-full h-full ${className}`}>
      <canvas
        ref={canvasRef}
        className="pointer-events-none"
        style={{
          width: canvasSize.width,
          height: canvasSize.height,
        }}
      />
    </div>
  );
};

export { FlickeringGrid };


code.demo.tsx
import { FlickeringGrid } from "@/components/ui/flickering-grid";

export function FlickeringGridDemo() {
  return (
    <div className="relative h-[500px] rounded-lg w-full bg-background overflow-hidden border">
      <FlickeringGrid
        className="z-0 absolute inset-0 size-full"
        squareSize={4}
        gridGap={6}
        color="#6B7280"
        maxOpacity={0.5}
        flickerChance={0.1}
        height={800}
        width={800}
      />
    </div>
  );
}

```

Copy-paste these files for dependencies:
```tsx
/components/ui/flickering-grid.tsx
"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

interface FlickeringGridProps {
  squareSize?: number;
  gridGap?: number;
  flickerChance?: number;
  color?: string;
  width?: number;
  height?: number;
  className?: string;

  maxOpacity?: number;
}

const FlickeringGrid: React.FC<FlickeringGridProps> = ({
  squareSize = 4,
  gridGap = 6,
  flickerChance = 0.3,
  color = "rgb(0, 0, 0)",
  width,
  height,
  className,
  maxOpacity = 0.3,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  const memoizedColor = useMemo(() => {
    const toRGBA = (color: string) => {
      if (typeof window === "undefined") {
        return `rgba(0, 0, 0,`;
      }
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = 1;
      const ctx = canvas.getContext("2d");
      if (!ctx) return "rgba(255, 0, 0,";
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, 1, 1);
      const [r, g, b] = Array.from(ctx.getImageData(0, 0, 1, 1).data);
      return `rgba(${r}, ${g}, ${b},`;
    };
    return toRGBA(color);
  }, [color]);

  const setupCanvas = useCallback(
    (canvas: HTMLCanvasElement, width: number, height: number) => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      const cols = Math.floor(width / (squareSize + gridGap));
      const rows = Math.floor(height / (squareSize + gridGap));

      const squares = new Float32Array(cols * rows);
      for (let i = 0; i < squares.length; i++) {
        squares[i] = Math.random() * maxOpacity;
      }

      return { cols, rows, squares, dpr };
    },
    [squareSize, gridGap, maxOpacity],
  );

  const updateSquares = useCallback(
    (squares: Float32Array, deltaTime: number) => {
      for (let i = 0; i < squares.length; i++) {
        if (Math.random() < flickerChance * deltaTime) {
          squares[i] = Math.random() * maxOpacity;
        }
      }
    },
    [flickerChance, maxOpacity],
  );

  const drawGrid = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      width: number,
      height: number,
      cols: number,
      rows: number,
      squares: Float32Array,
      dpr: number,
    ) => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = "transparent";
      ctx.fillRect(0, 0, width, height);

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const opacity = squares[i * rows + j];
          ctx.fillStyle = `${memoizedColor}${opacity})`;
          ctx.fillRect(
            i * (squareSize + gridGap) * dpr,
            j * (squareSize + gridGap) * dpr,
            squareSize * dpr,
            squareSize * dpr,
          );
        }
      }
    },
    [memoizedColor, squareSize, gridGap],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let gridParams: ReturnType<typeof setupCanvas>;

    const updateCanvasSize = () => {
      const newWidth = width || container.clientWidth;
      const newHeight = height || container.clientHeight;
      setCanvasSize({ width: newWidth, height: newHeight });
      gridParams = setupCanvas(canvas, newWidth, newHeight);
    };

    updateCanvasSize();

    let lastTime = 0;
    const animate = (time: number) => {
      if (!isInView) return;

      const deltaTime = (time - lastTime) / 1000;
      lastTime = time;

      updateSquares(gridParams.squares, deltaTime);
      drawGrid(
        ctx,
        canvas.width,
        canvas.height,
        gridParams.cols,
        gridParams.rows,
        gridParams.squares,
        gridParams.dpr,
      );
      animationFrameId = requestAnimationFrame(animate);
    };

    const resizeObserver = new ResizeObserver(() => {
      updateCanvasSize();
    });

    resizeObserver.observe(container);

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0 },
    );

    intersectionObserver.observe(canvas);

    if (isInView) {
      animationFrameId = requestAnimationFrame(animate);
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
    };
  }, [setupCanvas, updateSquares, drawGrid, width, height, isInView]);

  return (
    <div ref={containerRef} className={`w-full h-full ${className}`}>
      <canvas
        ref={canvasRef}
        className="pointer-events-none"
        style={{
          width: canvasSize.width,
          height: canvasSize.height,
        }}
      />
    </div>
  );
};

export { FlickeringGrid };

```

Remember: Do not change the component's code unless it's required to integrate or the user asks you to.
IMPORTANT: Create all mentioned files in full, without abbreviations. Do not use placeholders like "insert the rest of the code here" – output every line of code exactly as it is, so it can be copied and pasted directly into the project.
"""

2. Detailed GPU animations with photo links. Tell the AI to refer to actual photos of the GPUs. from the internet to use for reference of the animations in three.js.

3. Make it one 3D animation page linked to on the hero page that has multiple tabs to show different things like on https://bbycroft.net/llm where the different tabs change your location in vector space. So you have set positions you can see and it's a set flow. Then make a seperate page that is more a customizalbe build your own server page where you can add and compare anything from a Macbook air to a full warehouse and add and take away GPUs and servers and see the affect on the compute power.

4.  Specify that the GPU servers are for LLM/AI workloads so bring it from that context and make applicable comments and comparisons whether it's comparing to a reallife supercluster like Colossus or explaing a certain size of cluster to run a certain model like DeepSeek R1 for example. use that context to make applicable comments and comparisons.

5. Deep research for accurate numbers of setups and used hardware. Apply to warehouse for demo w/ less customizability:

"""
{
  "date": "2025-02-21",
  "overview": {
    "llm_requirements": {
      "training": "High compute (TFLOPS), memory (100s GB), bandwidth (TB/s), parallelism for pretraining/fine-tuning",
      "inference": "Optimized latency (TTFT), throughput (tokens/s), memory for parameters, energy efficiency (tokens/J)"
    },
    "hardware_selection_criteria": [
      "Compute Power (TFLOPS/PFLOPS)",
      "Memory Capacity (GB)",
      "Memory Bandwidth (TB/s)",
      "Energy Efficiency (tokens/J)",
      "Cost-Effectiveness (TCO)"
    ]
  },
  "hardware": {
    "training": [
      {
        "name": "NVIDIA A100",
        "variants": ["40GB", "80GB"],
        "specs": {
          "memory": {"40GB": "40GB HBM3", "80GB": "80GB HBM3"},
          "compute": "312 TFLOPS (FP16)",
          "bandwidth": {"40GB": "1.6 TB/s", "80GB": "2 TB/s"}
        },
        "use_case": "Training GPT-3 (175B params)",
        "stats": {
          "cluster_size": "2000 GPUs for GPT-3",
          "memory_needed": "350GB (FP16 params)",
          "training_cost": "$12M estimate",
          "simulated_inference": "4x A100s, 16 mins for GPT-3, 4.1% latency error"
        }
      },
      {
        "name": "NVIDIA H100",
        "variants": ["80GB", "141GB"],
        "specs": {
          "memory": "141GB HBM3e (newer)",
          "compute": "989 TFLOPS (FP16), 1.98 PFLOPS (FP8)",
          "bandwidth": "3 TB/s"
        },
        "use_case": "Next-gen LLMs (e.g., LLaMA-70B)",
        "stats": {
          "inference_boost": "1.7x over A100 (LLaMA-70B, FP8)",
          "training_latency": "52% reduction vs A100 (4x, batch 16)",
          "tensorrt_llm": "4.6x inference over A100"
        }
      },
      {
        "name": "AMD Instinct MI300X",
        "specs": {
          "memory": "192GB HBM3",
          "compute": "1.6 PFLOPS (FP16)",
          "bandwidth": "5.2 TB/s"
        },
        "use_case": "Hyperscale training/inference",
        "stats": {
          "inference": "Competitive with H100 for LLaMA-70B",
          "training_example": "4096 GPUs on Frontier supercomputer"
        }
      },
      {
        "name": "Google TPU",
        "variants": ["v5e", "v5p"],
        "specs": {
          "v5e": {"compute": "197 TFLOPS (BF16)", "memory": "128GB HBM3", "bandwidth": "1.2 TB/s"},
          "v5p": {"compute": "~400 TFLOPS", "designed_for": "trillion-param models"}
        },
        "use_case": "Google LLMs (PaLM, Gemini)",
        "stats": {
          "training_efficiency": "2x faster than GPUs for Transformers",
          "inference_throughput": "900 tokens/s (OPT-30B, batch 32)"
        }
      }
    ],
    "inference": [
      {
        "name": "NVIDIA RTX 4090",
        "specs": {
          "memory": "24GB GDDR6X",
          "compute": "82.6 TFLOPS (FP16)",
          "bandwidth": "1 TB/s"
        },
        "use_case": "Local inference (LLaMA-13B, MPT-7B)",
        "stats": {
          "throughput": "2.7 tokens/s (LLaMA-70B, INT8)",
          "fine_tuning": "16GB sufficient for LLaMA-13B",
          "cost": "~$1500"
        }
      },
      {
        "name": "NVIDIA RTX 6000 Ada",
        "specs": {
          "memory": "48GB GDDR6",
          "compute": "91.1 TFLOPS (FP16)",
          "bandwidth": "960 GB/s"
        },
        "use_case": "Professional inference (Bloom-176B)",
        "stats": {
          "throughput": "5 tokens/s (Bloom-176B, FP16)",
          "fine_tuning": "Handles 15B params, batch 1",
          "cost": "~$7000"
        }
      },
      {
        "name": "AMD Ryzen AI Max+ PRO 395",
        "specs": {
          "compute": "~20 TFLOPS (FP16)",
          "memory": "Shared up to 64GB"
        },
        "use_case": "Edge inference",
        "stats": {
          "throughput": "5.94 tokens/s (LLaMA-70B)",
          "comparison": "Outpaces RTX 4090 (2.7 tokens/s)"
        }
      },
      {
        "name": "Heterogeneous System (AiMX-xPU + H100)",
        "specs": {
          "components": "1 H100 (141GB) + 3 AiMX units",
          "memory": "141GB HBM3e + LPDDR6"
        },
        "use_case": "Enterprise inference",
        "stats": {
          "throughput": {"batch_1": "167 tokens/s", "batch_8": "220 tokens/s", "batch_32": "900 tokens/s (OPT-30B)"},
          "energy_efficiency": "Higher tokens/J than standalone GPUs"
        }
      }
    ]
  },
  "stats_comparison": {
    "training": {
      "memory_per_param": {"FP16": "2 bytes", "overhead": "16-24 bytes"},
      "scaling": "4x H100s reduce LLaMA-70B latency by 52% vs A100"
    },
    "inference": {
      "throughput": {
        "RTX_4090": "2.7 tokens/s (LLaMA-70B, INT8)",
        "H100": "20 tokens/s (FP16), 40 tokens/s (FP8)",
        "MI300X": ">40 tokens/s (unverified)"
      },
      "latency": {
        "H100": "36% lower TTFT vs A100 (4x, 512 tokens)",
        "RTX_6000_Ada": "1-2s (Bloom-176B, batch 1)"
      },
      "energy_efficiency": {
        "heterogeneous": "Up to 900 tokens/J (batch 32)",
        "GPUs": "100-200 tokens/J (H100, FP8)"
      }
    }
  },
  "trends": {
    "FP8_adoption": "50% memory reduction, doubles batch capacity",
    "batch_size_impact": "Higher throughput (16-32) increases latency",
    "edge_devices": "Low-power inference (e.g., Ryzen AI Max+)",
    "emerging": [
      {"name": "FPGAs (Xilinx Alveo U280)", "benefit": "2x throughput for GEMV"},
      {"name": "Quantization (INT8/FP8)", "benefit": "Enables consumer GPUs for 20B-70B models"},
      {"name": "Multimodality", "demand": "2-5x compute/memory increase"}
    ]
  },
  "conclusion": {
    "training_leaders": "H100, MI300X, TPUs for Google ecosystems",
    "inference_options": "RTX 4090/6000 Ada (small-scale), H100/MI300X/AiMX-xPU (enterprise)",
    "future_direction": "Compact, efficient inference hardware and cost-effective training clusters"
  }
}
"""

6. Specify what the point of idle compute visualization is for: we don't specify idle compute in the servers though that can be mentioned but the point we want to make is consumer idle compute and when your laptop/desktop is idle at home you could be mining for a charity or for yourself or doing other computational tasks.



--------------------------------


### Key Points
- The plan breaks down web app development into 27 steps, starting with setup and ending with testing.
- Focuses on GPU visualization, server and warehouse scales, and idle compute using React and Three.js.
- Includes 3D models, animations, and interactive elements for user engagement.
- Ensures responsive design and accessibility, with performance and compatibility testing.

### Project Overview
This plan outlines the development of a web application that showcases GPU sizes, capabilities, and compute availability, with a focus on idle compute. It uses React for the front-end, Three.js for 3D visualizations, and includes animations and real-life comparisons to engage users.

### Design Specifications

#### Color Scheme and Hero Section
- Main site: Off-white background with purple accent for text and UI elements
- Hero section: Implement flickering grid component (see components/ui/flickering-grid.tsx)
- Grid properties: Customizable square size, gap, flicker chance, and color

#### GPU Visualization Requirements
1. Use actual GPU photos from the internet as reference for Three.js animations
2. Create one main 3D animation page linked from the hero section
3. Implement multiple tabs for different views (similar to bbycroft.net/llm)
4. Include vector space navigation between different visualization states
5. Create a separate customizable "build your own server" page

#### Hardware Context
- Focus on LLM/AI workloads
- Include comparisons to real-life superclusters (e.g., Colossus)
- Provide context for cluster sizes needed for specific models (e.g., DeepSeek R1)
- Use accurate hardware specifications from the provided JSON data
- Include detailed performance metrics (TFLOPS, memory bandwidth, etc.)

#### Idle Compute Focus
- Emphasize consumer idle compute potential
- Showcase how idle personal devices (laptops/desktops) can contribute
- Include options for charitable mining and computational tasks
- Visualize potential impact of distributed computing

### Step-by-Step Breakdown
The implementation is divided into sections, each with specific tasks:
- **Setup and Navigation**: Install dependencies, set up React routing for page navigation.
- **Page Development**: Create home, GPU visualization, server visualization, warehouse visualization, and idle compute pages, each with unique 3D models and interactions.
- **Data and Design**: Handle static data for GPUs and servers, ensure responsive design, and add accessibility features.
- **Testing**: Perform functional, performance, and compatibility tests to ensure quality.

### Surprising Detail: Interactive 3D Simulations
It's fascinating that users can interact with 3D models, like rotating GPUs or zooming into warehouse details, making complex data more accessible and engaging.

---

### Comprehensive Development Plan for GPU Visualization Web Application

#### Introduction
This document presents a detailed, step-by-step implementation plan for developing a web application that demonstrates GPU sizes, capabilities, and compute availability, with a focus on idle compute. The application leverages React for the front-end, Three.js for 3D visualizations, and includes animations and real-life comparisons to engage users. The plan ensures a logical sequence of tasks, addressing all technical specifications and requirements, and includes testing strategies for quality assurance.

#### Project Background
The project aims to create a website that showcases GPU sizes and capabilities using real-life examples and animations, focusing on server sizes, warehouse scales, and idle compute availability. The technology stack includes React for the front-end, Three.js for 3D visualizations, Node.js with Express for potential back-end needs, and Firebase for data storage if necessary. The design emphasizes user-friendly interfaces, engaging content, and responsive, accessible design.

#### Implementation Plan

The development process is broken into 27 atomic steps, each designed for implementation in a single iteration by a code generation AI. The steps are organized into sections for clarity, ensuring dependencies are addressed sequentially.

##### Section 1: Project Setup and Navigation
This section initializes the project and sets up navigation for seamless user experience.

- **Step 1: Set up the project structure and dependencies.**
  - **Task**: Set up React project with Three.js, @react-three/fiber, and implement the flickering grid component
  - **Files**: 
    - `package.json`
    - `src/index.js`
    - `src/App.js`
    - `components/ui/flickering-grid.tsx`
  - **Step Dependencies**: None
  - **User Instructions**: Run `npm install` to install dependencies

- **Step 2: Implement client-side routing and theme.**
  - **Task**: Set up navigation and implement off-white/purple color scheme
  - **Files**: 
    - `src/index.js`
    - `src/App.js`
    - `src/styles/theme.css`
  - **Step Dependencies**: Step 1
  - **User Instructions**: None

##### Section 2: Home Page and Hero Section
This section creates an engaging landing page with the flickering grid animation.

- **Step 3: Create the Home page component.**
  - **Task**: Design landing page with hero section using flickering grid
  - **Files**: 
    - `src/pages/Home.js`
    - `src/components/Hero.js`
  - **Step Dependencies**: Step 2
  - **User Instructions**: None

##### Section 3: GPU Visualization Pages
This section creates the main 3D visualization experience and customizable server builder.

- **Step 4: Source and prepare GPU models.**
  - **Task**: Create accurate 3D models based on real GPU photos, including A100, H100, MI300X, and consumer GPUs
  - **Files**: External 3D model files
  - **Step Dependencies**: None
  - **User Instructions**: Download and verify GPU reference photos

- **Step 5: Implement vector space navigation.**
  - **Task**: Create system for smooth transitions between visualization states
  - **Files**: `src/components/VectorSpace.js`
  - **Step Dependencies**: Step 1
  - **User Instructions**: None

- **Step 6: Create tabbed visualization interface.**
  - **Task**: Implement tab system similar to bbycroft.net/llm
  - **Files**: 
    - `src/pages/GPUVisualization.js`
    - `src/components/TabSystem.js`
  - **Step Dependencies**: Step 5
  - **User Instructions**: None

- **Step 7: Implement hardware comparison system.**
  - **Task**: Create interactive comparison using provided hardware specs
  - **Files**: 
    - `src/components/HardwareComparison.js`
    - `src/data/hardware.js`
  - **Step Dependencies**: Step 6
  - **User Instructions**: None

- **Step 8: Create server builder interface.**
  - **Task**: Implement customizable server configuration page
  - **Files**: 
    - `src/pages/ServerBuilder.js`
    - `src/components/ConfigurationTools.js`
  - **Step Dependencies**: Step 7
  - **User Instructions**: None

##### Section 4: Server and Warehouse Visualization
This section develops pages for visualizing server racks and data centers, with focus on AI/ML workloads.

- **Step 9: Implement server rack visualization.**
  - **Task**: Create interactive server rack display with accurate GPU placements and thermal visualization
  - **Files**: 
    - `src/components/ServerRack.js`
    - `src/components/ThermalOverlay.js`
  - **Step Dependencies**: Step 4
  - **User Instructions**: None

- **Step 10: Create LLM workload visualizations.**
  - **Task**: Add visual representations of different LLM workloads and their hardware requirements
  - **Files**: 
    - `src/components/WorkloadVisualizer.js`
    - `src/data/llm-workloads.js`
  - **Step Dependencies**: Step 9
  - **User Instructions**: None

- **Step 11: Implement warehouse scale view.**
  - **Task**: Create zoomable warehouse view with real-world supercomputer comparisons
  - **Files**: 
    - `src/pages/WarehouseView.js`
    - `src/components/SupercomputerComparison.js`
  - **Step Dependencies**: Step 10
  - **User Instructions**: None

- **Step 12: Add performance metrics visualization.**
  - **Task**: Display real-time metrics for different configurations (TFLOPS, bandwidth, etc.)
  - **Files**: 
    - `src/components/PerformanceMetrics.js`
    - `src/utils/metrics-calculator.js`
  - **Step Dependencies**: Step 11
  - **User Instructions**: None

##### Section 5: Idle Compute Visualization
This section focuses on showing the potential of consumer idle compute.

- **Step 13: Create idle compute calculator.**
  - **Task**: Implement tool to calculate potential compute contribution from idle devices
  - **Files**: 
    - `src/components/IdleComputeCalculator.js`
    - `src/utils/compute-estimator.js`
  - **Step Dependencies**: None
  - **User Instructions**: None

- **Step 14: Implement use case scenarios.**
  - **Task**: Create visualizations for different idle compute uses (charity mining, distributed computing)
  - **Files**: 
    - `src/components/UseCaseScenarios.js`
    - `src/data/use-cases.js`
  - **Step Dependencies**: Step 13
  - **User Instructions**: None

- **Step 15: Add impact visualization.**
  - **Task**: Show potential collective impact of idle compute networks
  - **Files**: 
    - `src/components/ImpactVisualizer.js`
    - `src/utils/impact-calculator.js`
  - **Step Dependencies**: Step 14
  - **User Instructions**: None

##### Section 6: Data Handling
This section ensures all necessary data is structured and integrated for use in the application.

- **Step 16: Create a data structure for GPU specifications.**
  - **Task**: Define a JavaScript object or JSON file containing GPU data, including compute power, memory, and energy consumption.
  - **Files**: `src/data/gpus.js`
  - **Step Dependencies**: None
  - **User Instructions**: None

- **Step 17: Create a data structure for server configurations.**
  - **Task**: Define server configurations with GPU counts and types, ensuring dynamic updates if needed.
  - **Files**: `src/data/servers.js`
  - **Step Dependencies**: Step 16
  - **User Instructions**: None

- **Step 18: Integrate data into components.**
  - **Task**: Use the data in respective components for displaying information, ensuring consistency across pages.
  - **Files**: Various component files
  - **Step Dependencies**: Step 16, Step 17
  - **User Instructions**: None

##### Section 7: Responsive Design and Accessibility
This section ensures the application is user-friendly across devices and accessible to all users.

- **Step 19: Ensure responsive design for all pages.**
  - **Task**: Make sure the application adapts to different screen sizes, including mobile and desktop, using responsive CSS techniques.
  - **Files**: All component and page files
  - **Step Dependencies**: All previous steps
  - **User Instructions**: Test on different devices or screen sizes.

- **Step 20: Implement accessibility features.**
  - **Task**: Add keyboard navigation and screen reader support, ensuring compliance with accessibility standards.
  - **Files**: All component and page files
  - **Step Dependencies**: All previous steps
  - **User Instructions**: None

##### Section 8: Testing
This section ensures the application is robust, performant, and compatible across platforms.

- **Step 21: Functional testing.**
  - **Task**: Verify all interactive elements (e.g., 3D model rotation, zoom functionality) work as expected.
  - **Files**: None
  - **Step Dependencies**: All previous steps
  - **User Instructions**: Manually test each feature or write unit tests.

- **Step 22: Performance testing.**
  - **Task**: Use tools like Lighthouse to ensure 3D models and animations load efficiently, especially on lower-end devices.
  - **Files**: None
  - **Step Dependencies**: All previous steps
  - **User Instructions**: Run performance tests and optimize if necessary.

- **Step 23: Compatibility testing.**
  - **Task**: Test the application across browsers (Chrome, Firefox, Safari) and devices (desktop, tablet, mobile) for consistent behavior.
  - **Files**: None
  - **Step Dependencies**: All previous steps
  - **User Instructions**: Test on different browsers and devices.

#### Directory Structure
The project follows a structured directory layout to organize code effectively:

| Directory/Folder | Description                              |
|------------------|------------------------------------------|
| src/             | Main source code directory               |
| components/      | Reusable React components                |
| pages/           | Page-specific components                 |
| utils/           | Utility functions (e.g., data fetching)  |
| data/            | Data files for GPUs, servers, etc.       |
| App.js           | Main React component                     |
| index.js         | Entry point for rendering the app        |
| public/          | Static assets (e.g., index.html)         |

#### Key Considerations
- **3D Model Sourcing**: Users must source or create 3D models for GPUs, reference objects, server racks, and warehouses, placing them in the appropriate directory.
- **Static vs. Dynamic Data**: Initially, data is static, but the plan allows for future integration with Firebase if dynamic updates are needed, especially for idle compute simulations.
- **Performance Optimization**: Given the use of 3D visualizations, performance testing is crucial, particularly for lower-end devices, using tools like Lighthouse.
- **Accessibility**: Ensuring keyboard navigation and screen reader support is vital for inclusivity, aligning with the responsive design principles.

#### Conclusion
This comprehensive plan ensures the web application is developed systematically, addressing all technical specifications and requirements. It provides a clear path for implementation, with each step building upon the previous, and includes thorough testing to deliver a high-quality, user-friendly application.

#### Key Citations
- [React Official Documentation Installation Guide](https://reactjs.org/docs/getting-started.html)
- [Three.js Official Documentation for 3D Models](https://threejs.org/docs/index.html#manual/en/introduction/Creating-a-scene)
- [Lighthouse Performance Testing Tool](https://developers.google.com/web/tools/lighthouse)