"use client";

import { useEffect, useRef } from "react";

const WORDS = [
  "INVESTMENT", "FOUNDER", "STARTUP", "ENTREPRENEUR", "IDEAS",
  "FINANCE", "AI", "TECHNOLOGY", "MEDICAL", "AEROSPACE",
  "ROBOTICS", "CAPITAL", "SCALE", "EQUITY", "SYNDICATE"
];
const SYMBOLS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz$€£¥₿%&@+#";
// High contrast colors for light backgrounds (Forest Green, Forest Roast, Matcha, Obsidian)
const COLORS = ["#012F13", "#40534C", "#677D6A", "#161616"];

class Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseChar: string;
  char: string;
  color: string;
  size: number;
  targetX: number | null;
  targetY: number | null;
  isForming: boolean;

  constructor(canvasWidth: number, canvasHeight: number) {
    this.x = Math.random() * canvasWidth;
    this.y = Math.random() * canvasHeight;
    this.vx = (Math.random() - 0.5) * 1.2;
    this.vy = (Math.random() - 0.5) * 1.2;
    this.baseChar = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
    this.char = this.baseChar;
    this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
    this.size = Math.random() * 12 + 10;
    this.targetX = null;
    this.targetY = null;
    this.isForming = false;
  }

  update(canvasWidth: number, canvasHeight: number) {
    if (this.isForming && this.targetX !== null && this.targetY !== null) {
      // Magnetic attraction to the target letter position
      const dx = this.targetX - this.x;
      const dy = this.targetY - this.y;
      this.vx += dx * 0.08; // Strong pull
      this.vy += dy * 0.08;
      this.vx *= 0.75; // Friction to snap into place without orbiting endlessly
      this.vy *= 0.75;
    } else {
      // Normal gentle aether floating
      this.vx *= 0.99;
      this.vy *= 0.99;
      this.vx += (Math.random() - 0.5) * 0.1;
      this.vy += (Math.random() - 0.5) * 0.1;

      const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
      if (speed > 1.5) {
        this.vx = (this.vx / speed) * 1.5;
        this.vy = (this.vy / speed) * 1.5;
      }
    }

    this.x += this.vx;
    this.y += this.vy;

    // Screen wrap
    if (this.x < -20) this.x = canvasWidth + 20;
    if (this.x > canvasWidth + 20) this.x = -20;
    if (this.y < -20) this.y = canvasHeight + 20;
    if (this.y > canvasHeight + 20) this.y = -20;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = this.color;
    ctx.font = `${this.isForming ? 'bold 22px' : `${this.size}px`} monospace`;
    ctx.fillText(this.char, this.x, this.y);
  }
}

export default function Universe() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let particles: Particle[] = [];
    let animationFrameId: number;
    let width = window.innerWidth;
    let height = window.innerHeight;

    let mouse = { x: -1000, y: -1000, isMoving: false };
    let lastMouse = { x: -1000, y: -1000 };
    let mouseIdleTimer = 0;
    let currentWord = "";
    let activeParticles: Particle[] = [];

    const init = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;

      const particleCount = Math.floor((width * height) / 6000);
      particles = Array.from({ length: particleCount }, () => new Particle(width, height));
    };

    const scatterWord = () => {
      activeParticles.forEach(p => {
        p.isForming = false;
        p.targetX = null;
        p.targetY = null;
        p.char = p.baseChar;
        p.color = COLORS[Math.floor(Math.random() * COLORS.length)];
      });
      activeParticles = [];
      currentWord = "";
    };

    const formWord = () => {
      if (currentWord !== "") return;

      currentWord = WORDS[Math.floor(Math.random() * WORDS.length)];
      const letterSpacing = 22;
      const totalWidth = currentWord.length * letterSpacing;

      // Position the word centered slightly above the cursor
      const startX = mouse.x - (totalWidth / 2);
      const startY = mouse.y - 20;

      // Find particles closest to the mouse to form the word
      const sorted = [...particles].sort((a, b) => {
        const distA = Math.sqrt(Math.pow(a.x - mouse.x, 2) + Math.pow(a.y - mouse.y, 2));
        const distB = Math.sqrt(Math.pow(b.x - mouse.x, 2) + Math.pow(b.y - mouse.y, 2));
        return distA - distB;
      });

      activeParticles = sorted.slice(0, currentWord.length);

      activeParticles.forEach((p, index) => {
        p.isForming = true;
        p.targetX = startX + (index * letterSpacing);
        p.targetY = startY;
        p.char = currentWord[index];
        p.color = "#8BC53D"; // Snap to Apple Green when forming words
      });
    };

    const animate = () => {
      // Clear canvas fully to let CSS background colors (Mint Sage/Almond) show through
      ctx.clearRect(0, 0, width, height);

      const dx = mouse.x - lastMouse.x;
      const dy = mouse.y - lastMouse.y;
      const speed = Math.sqrt(dx * dx + dy * dy);

      // If mouse is barely moving and is inside the window
      if (speed < 1 && mouse.x > 0 && mouse.y > 0 && mouse.x < width && mouse.y < height) {
        mouseIdleTimer++;
        if (mouseIdleTimer === 30) formWord(); // Snap together quickly when idle
      } else {
        mouseIdleTimer = 0;
        if (currentWord !== "") scatterWord(); // Release particles when moving
      }

      lastMouse.x = mouse.x;
      lastMouse.y = mouse.y;

      particles.forEach(p => {
        p.update(width, height);
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
      scatterWord();
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
      className="absolute inset-0 z-0 pointer-events-auto"
      // Transparent background so the root/theme background color dictates the tone
      style={{ background: "transparent" }}
    />
  );
}