"use client";

import { useEffect, useRef } from "react";

// Soft, light-theme compatible Aether colors (Emerald, Sky, Indigo, Slate)
const COLORS = ["rgba(52, 211, 153, 0.4)", "rgba(125, 211, 252, 0.4)", "rgba(129, 140, 248, 0.3)", "rgba(148, 163, 184, 0.2)"];

class AetherParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;

  constructor(canvasWidth: number, canvasHeight: number) {
    this.x = Math.random() * canvasWidth;
    this.y = Math.random() * canvasHeight;
    this.vx = (Math.random() - 0.5) * 0.8;
    this.vy = (Math.random() - 0.5) * 0.8;
    this.radius = Math.random() * 40 + 10;
    this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
  }

  update(canvasWidth: number, canvasHeight: number, mouse: { x: number; y: number }) {
    // Gentle floating
    this.x += this.vx;
    this.y += this.vy;

    // Slight repulsion from mouse
    if (mouse.x > 0 && mouse.y > 0) {
      const dx = mouse.x - this.x;
      const dy = mouse.y - this.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < 150) {
        this.x -= (dx / distance) * 1.5;
        this.y -= (dy / distance) * 1.5;
      }
    }

    // Screen wrap
    if (this.x < -100) this.x = canvasWidth + 100;
    if (this.x > canvasWidth + 100) this.x = -100;
    if (this.y < -100) this.y = canvasHeight + 100;
    if (this.y > canvasHeight + 100) this.y = -100;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.closePath();
  }
}

export default function Universe() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let particles: AetherParticle[] = [];
    let animationFrameId: number;
    let width = window.innerWidth;
    let height = window.innerHeight;

    let mouse = { x: -1000, y: -1000 };

    const init = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;

      const particleCount = Math.floor((width * height) / 12000); // Fewer, larger particles for Aether
      particles = Array.from({ length: particleCount }, () => new AetherParticle(width, height));
    };

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Apply a subtle blur to everything drawn on the canvas
      ctx.filter = 'blur(12px)';

      particles.forEach(p => {
        p.update(width, height, mouse);
        p.draw(ctx);
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    window.addEventListener("resize", init);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);

    init();
    animate();

    return () => {
      window.removeEventListener("resize", init);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      // Fixed position ensures it covers the whole screen while scrolling
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ background: "transparent" }}
    />
  );
}