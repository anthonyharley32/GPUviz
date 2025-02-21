"use client";

import { useState } from "react";
import { motion } from "framer-motion";

export interface Tab {
  id: string;
  title: string;
  description: string;
  position: [number, number, number]; // [x, y, z] camera position
  target: [number, number, number]; // [x, y, z] look-at target
}

interface TabsProps {
  tabs: Tab[];
  onTabChange: (tab: Tab) => void;
  currentTab: Tab;
}

export function Tabs({ tabs, onTabChange, currentTab }: TabsProps) {
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
      <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-1">
        <div className="flex space-x-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab)}
              onMouseEnter={() => setHoveredTab(tab.id)}
              onMouseLeave={() => setHoveredTab(null)}
              className={`relative px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                currentTab.id === tab.id
                  ? "text-purple-900 bg-purple-100"
                  : "text-purple-600 hover:bg-purple-50"
              }`}
            >
              {tab.title}
              {hoveredTab === tab.id && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute top-full left-0 mt-2 w-48 p-2 bg-white rounded-md shadow-lg text-xs text-purple-800"
                >
                  {tab.description}
                </motion.div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
} 