"use client";

import { Canvas } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import { Suspense } from "react";
import CameraRig from "./CameraRig";

function Scene() {
  return (
    <>
      <ambientLight intensity={0.8} />

      <CameraRig />

      <Stars
        radius={300}
        depth={80}
        count={5000}
        factor={6}
        saturation={0}
        fade
        speed={0.5}
      />
    </>
  );
}

export default function Universe() {
  return (
    <div className="absolute inset-0">
      <Canvas
        dpr={[1, 2]}
        camera={{
          position: [0, 0, 1],
          fov: 75,
        }}
      >
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
    </div>
  );
}