"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Nav() {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm border-b border-purple-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-purple-900">
              GPUviz
            </Link>
          </div>
          <div className="flex space-x-4">
            <Link
              href="/visualize"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                pathname === "/visualize"
                  ? "bg-purple-100 text-purple-900"
                  : "text-purple-600 hover:bg-purple-50"
              }`}
            >
              3D Visualizations
            </Link>
            <Link
              href="/build"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                pathname === "/build"
                  ? "bg-purple-100 text-purple-900"
                  : "text-purple-600 hover:bg-purple-50"
              }`}
            >
              Build Server
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
} 