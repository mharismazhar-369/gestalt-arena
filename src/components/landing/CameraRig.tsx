"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

export default function CameraRig() {
  const mouse = useRef(new THREE.Vector2(0, 0));

  if (typeof window !== "undefined") {
    window.onmousemove = (event) => {
      mouse.current.x = (event.clientX / window.innerWidth - 0.5) * 2;
      mouse.current.y = -(event.clientY / window.innerHeight - 0.5) * 2;
    };
  }

  useFrame((state) => {
    state.camera.position.x +=
      (mouse.current.x * 0.35 - state.camera.position.x) * 0.03;

    state.camera.position.y +=
      (mouse.current.y * 0.35 - state.camera.position.y) * 0.03;

    state.camera.lookAt(0, 0, 0);
  });

  return null;
}