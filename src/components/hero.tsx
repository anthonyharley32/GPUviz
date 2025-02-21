"use client";

import { FlickeringGrid } from "@/components/ui/flickering-grid";
import Link from "next/link";

export function Hero() {
  return (
    <div className="relative min-h-[80vh] flex items-center justify-center overflow-hidden bg-[#fafafa]">
      {/* Background Grid */}
      <div className="absolute inset-0">
        <FlickeringGrid
          color="#6B21A8" // Tailwind purple-800
          maxOpacity={0.15}
          flickerChance={0.1}
          squareSize={4}
          gridGap={6}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-purple-900 mb-6">
          GPU Visualization & Compute
        </h1>
        <p className="text-xl md:text-2xl text-purple-800 mb-8 max-w-3xl mx-auto">
          Explore GPU capabilities, from personal devices to warehouse-scale computing.
          Discover the potential of idle compute and its impact on AI workloads.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/visualize"
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 transition-colors"
          >
            Explore 3D Visualizations
          </Link>
          <Link
            href="/build"
            className="inline-flex items-center justify-center px-6 py-3 border border-purple-600 text-base font-medium rounded-md text-purple-600 bg-white hover:bg-purple-50 transition-colors"
          >
            Build Your Server
          </Link>
        </div>
      </div>
    </div>
  );
} 