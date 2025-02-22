"use client";

import { ViewPosition } from "./vector-space";

interface ViewTabsProps {
  views: Record<string, ViewPosition>;
  currentView: string;
  onViewChange: (view: string) => void;
}

export function ViewTabs({ views, currentView, onViewChange }: ViewTabsProps) {
  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-white/10 backdrop-blur-md rounded-lg p-1 flex gap-1">
      {Object.entries(views).map(([key, view]) => (
        <button
          key={key}
          onClick={() => onViewChange(key)}
          className={`
            px-4 py-2 rounded-md transition-all duration-200
            ${currentView === key
              ? "bg-purple-600 text-white shadow-lg"
              : "hover:bg-white/10 text-gray-200"
            }
          `}
        >
          <span className="font-medium">{view.name}</span>
        </button>
      ))}
    </div>
  );
} 