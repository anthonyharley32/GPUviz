"use client";

import { useRef, useEffect } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { Vector3, Quaternion } from "three";
import { easeInOutCubic } from "@/lib/utils/easing";

export interface ViewPosition {
  position: [number, number, number];
  target: [number, number, number];
  name: string;
  description: string;
}

interface VectorSpaceProps {
  children: React.ReactNode;
  currentView: string;
  views: Record<string, ViewPosition>;
  transitionDuration?: number;
}

export function VectorSpace({
  children,
  currentView,
  views,
  transitionDuration = 1.5,
}: VectorSpaceProps) {
  const { camera } = useThree();
  const animationRef = useRef({
    startTime: 0,
    startPosition: new Vector3(),
    startTarget: new Vector3(),
    endPosition: new Vector3(),
    endTarget: new Vector3(),
    isTransitioning: false,
  });

  // Initialize camera position
  useEffect(() => {
    if (views[currentView]) {
      const view = views[currentView];
      camera.position.set(...view.position);
      camera.lookAt(...view.target);
    }
  }, []);

  // Handle view transitions
  useEffect(() => {
    if (!views[currentView]) return;

    const anim = animationRef.current;
    const view = views[currentView];

    // Set up animation parameters
    anim.startTime = Date.now();
    anim.startPosition.copy(camera.position);
    anim.startTarget.copy(camera.getWorldDirection(new Vector3()).multiplyScalar(100).add(camera.position));
    anim.endPosition.set(...view.position);
    anim.endTarget.set(...view.target);
    anim.isTransitioning = true;
  }, [currentView, views]);

  // Animate camera transitions
  useFrame(() => {
    const anim = animationRef.current;
    if (!anim.isTransitioning) return;

    const elapsed = (Date.now() - anim.startTime) / 1000;
    const progress = Math.min(elapsed / transitionDuration, 1);
    const t = easeInOutCubic(progress);

    // Interpolate position
    camera.position.lerpVectors(anim.startPosition, anim.endPosition, t);

    // Interpolate target (look-at point)
    const currentTarget = new Vector3();
    currentTarget.lerpVectors(anim.startTarget, anim.endTarget, t);
    camera.lookAt(currentTarget);

    // End transition
    if (progress === 1) {
      anim.isTransitioning = false;
    }
  });

  return <>{children}</>;
} 