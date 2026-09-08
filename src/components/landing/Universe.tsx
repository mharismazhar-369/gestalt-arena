"use client";

import { useEffect, useRef } from "react";

// Premium Aether colors (Teal, Emerald, Indigo, Purple, Slate)
const COLORS = [
  "rgba(20, 184, 166, 0.5)", // Teal
  "rgba(16, 185, 129, 0.4)", // Emerald
  "rgba(99, 102, 241, 0.4)", // Indigo
  "rgba(168, 85, 247, 0.3)", // Purple
  "rgba(148, 163, 184, 0.2)", // Slate
];

class AetherParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  baseRadius: number;

  constructor(canvasWidth: number, canvasHeight: number) {
    this.x = Math.random() * canvasWidth;
    this.y = Math.random() * canvasHeight;
    this.vx = (Math.random() - 0.5) * 0.6;
    this.vy = (Math.random() - 0.5) * 0.6;
    this.baseRadius = Math.random() * 25 + 5;
    this.radius = this.baseRadius;
    this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
  }

  update(canvasWidth: number, canvasHeight: number, mouse: { x: number; y: number }) {
    // Gentle floating
    this.x += this.vx;
    this.y += this.vy;

    // Fluid repulsion from mouse
    if (mouse.x > 0 && mouse.y > 0) {
      const dx = mouse.x - this.x;
      const dy = mouse.y - this.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const maxDistance = 250;

      if (distance < maxDistance) {
        const force = (maxDistance - distance) / maxDistance;
        this.x -= (dx / distance) * force * 2.5;
        this.y -= (dy / distance) * force * 2.5;
        // Expand slightly when pushed
        this.radius = this.baseRadius + (force * 15);
      } else {
        // Return to normal size
        if (this.radius > this.baseRadius) this.radius -= 0.5;
      }
    } else {
       if (this.radius > this.baseRadius) this.radius -= 0.5;
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

      // Higher particle count for connection lines
      const particleCount = Math.floor((width * height) / 8000); 
      particles = Array.from({ length: particleCount }, () => new AetherParticle(width, height));
    };

    const drawConnections = () => {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          // Connect particles that are close to each other
          if (distance < 180) {
            ctx.beginPath();
            const opacity = 1 - (distance / 180);
            ctx.strokeStyle = `rgba(148, 163, 184, ${opacity * 0.15})`;
            ctx.lineWidth = 1;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
            ctx.closePath();
          }
        }
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Core Aether blur effect
      ctx.filter = 'blur(8px)';

      particles.forEach(p => {
        p.update(width, height, mouse);
        p.draw(ctx);
      });

      // Draw thin constellation lines
      ctx.filter = 'blur(1px)';
      drawConnections();

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
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ background: "transparent" }}
    />
  );
}