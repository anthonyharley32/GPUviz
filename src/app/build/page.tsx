"use client";

import { FlickeringGrid } from "@/components/ui/flickering-grid";

export default function BuildPage() {
  return (
    <div className="relative min-h-[calc(100vh-4rem)]">
      {/* Background Grid */}
      <div className="absolute inset-0">
        <FlickeringGrid
          color="#6B21A8"
          maxOpacity={0.1}
          flickerChance={0.1}
          squareSize={4}
          gridGap={6}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-purple-900 mb-6">
          Build Your Server
        </h1>
        <p className="text-lg text-purple-800 mb-8">
          Design and compare custom GPU server configurations for AI/ML workloads.
          Interactive builder coming soon...
        </p>
      </div>
    </div>
  );
} 