"use client";

import { useEffect, useRef } from "react";

const WORDS = [
  // Core Matchmaking & Ecosystem
  "CAPITAL", "FOUNDERS", "STARTUP", "EQUITY", "VENTURE", "SYNDICATE",
  "PORTFOLIO", "PITCH DECK", "ANGEL", "UNICORN",

  // Financial Mechanics & Metrics
  "TERM SHEET", "VALUATION", "DUE DILIGENCE", "ROI", "LIQUIDITY",
  "RUNWAY", "BURN RATE", "BOOTSTRAPPED", "EXIT", "MERGER", "ALLOCATION",

  // Funding Stages
  "PRE-SEED", "SEED", "SERIES A", "SERIES B", "IPO",

  // Technology & Operations
  "INNOVATION", "SAAS", "ALGORITHM", "FULL-STACK", "CLOUD",
  "MVP", "SCALING", "DISRUPTION", "BPO", "NEURAL",

  // Industries & Sciences
  "ROBOTICS", "MEDICINE", "CRAFTS", "ENGINEERING", "BIOTECH",
  "AEROSPACE", "FINTECH", "CYBERSECURITY", "HEALTHCARE",
  "EDTECH", "CLEANTECH", "LOGISTICS", "E-COMMERCE"
];
const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+-*/=$€£¥₹₩₿¢";

class CharParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  char: string;
  isForming: boolean;
  targetX: number;
  targetY: number;
  size: number;
  color: string;

  constructor(width: number, height: number) {
    this.x = Math.random() * width;
    this.y = Math.random() * height;
    this.vx = (Math.random() - 0.5) * 1.5;
    this.vy = (Math.random() - 0.5) * 1.5;
    this.char = CHARS[Math.floor(Math.random() * CHARS.length)];
    this.isForming = false;
    this.targetX = 0;
    this.targetY = 0;
    this.size = Math.random() * 12 + 10;
    this.color = `rgba(148, 163, 184, ${Math.random() * 0.4 + 0.2})`; // Slate-400 with random opacity
  }

  update(width: number, height: number) {
    if (this.isForming) {
      // Lerp towards target position for spelling words
      this.x += (this.targetX - this.x) * 0.1;
      this.y += (this.targetY - this.y) * 0.1;
    } else {
      // Random drifting
      this.x += this.vx;
      this.y += this.vy;

      // Screen wrap
      if (this.x < -20) this.x = width + 20;
      if (this.x > width + 20) this.x = -20;
      if (this.y < -20) this.y = height + 20;
      if (this.y > height + 20) this.y = -20;

      // Randomly mutate characters occasionally for the "matrix" feel
      if (Math.random() < 0.01) {
        this.char = CHARS[Math.floor(Math.random() * CHARS.length)];
      }
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.font = `${this.isForming ? 'bold 16px' : `${this.size}px`} 'Inter', monospace`;
    ctx.fillStyle = this.isForming ? 'rgba(99, 102, 241, 0.8)' : this.color; // Indigo when forming
    ctx.fillText(this.char, this.x, this.y);
  }
}

export default function Background() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let particles: CharParticle[] = [];
    let animationFrameId: number;
    let width = window.innerWidth;
    let height = window.innerHeight;

    let mouse = { x: -1000, y: -1000 };
    let lastMouse = { x: -1000, y: -1000 };
    let idleTimer: NodeJS.Timeout;
    let isIdle = false;

    const init = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;

      const particleCount = Math.floor((width * height) / 10000);
      particles = Array.from({ length: particleCount }, () => new CharParticle(width, height));
    };

    const formWord = () => {
      if (mouse.x < 0 || mouse.y < 0) return;

      const word = WORDS[Math.floor(Math.random() * WORDS.length)];
      const spacing = 14;
      const totalWidth = word.length * spacing;
      const startX = mouse.x - totalWidth / 2;
      const startY = mouse.y - 40; // Hover slightly above cursor

      // Find the closest particles to use for the word
      const sortedParticles = [...particles].sort((a, b) => {
        const distA = Math.hypot(a.x - mouse.x, a.y - mouse.y);
        const distB = Math.hypot(b.x - mouse.x, b.y - mouse.y);
        return distA - distB;
      });

      for (let i = 0; i < word.length; i++) {
        if (sortedParticles[i]) {
          sortedParticles[i].isForming = true;
          sortedParticles[i].char = word[i];
          sortedParticles[i].targetX = startX + (i * spacing);
          sortedParticles[i].targetY = startY;
        }
      }
    };

    const breakWord = () => {
      particles.forEach(p => {
        if (p.isForming) {
          p.isForming = false;
          p.vx = (Math.random() - 0.5) * 3; // burst away slightly
          p.vy = (Math.random() - 0.5) * 3;
        }
      });
    };

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach(p => {
        p.update(width, height);
        p.draw(ctx);
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;

      const dist = Math.hypot(mouse.x - lastMouse.x, mouse.y - lastMouse.y);
      if (dist > 10) {
        if (isIdle) {
          isIdle = false;
          breakWord();
        }
        clearTimeout(idleTimer);
        idleTimer = setTimeout(() => {
          isIdle = true;
          formWord();
        }, 600); // 600ms of hovering triggers the word formation
      }

      lastMouse.x = mouse.x;
      lastMouse.y = mouse.y;
    };

    window.addEventListener("resize", init);
    window.addEventListener("mousemove", handleMouseMove);

    init();
    animate();

    return () => {
      window.removeEventListener("resize", init);
      window.removeEventListener("mousemove", handleMouseMove);
      clearTimeout(idleTimer);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-0 pointer-events-none mix-blend-multiply opacity-70"
      style={{ background: "transparent" }}
    />
  );
}