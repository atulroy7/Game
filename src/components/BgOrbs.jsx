import React, { useEffect, useRef, useState } from 'react';

// Single active canvas instance controller so multiple BgOrbs components never duplicate canvases
let globalCanvasActive = false;

const GLYPHS = ['✦', '★', '▲', '◆', '+', '×', '÷', '?', '∑', 'π', '∞'];

const PALETTE_COLORS = [
  '#f43f5e', // coral
  '#10b981', // mint
  '#f59e0b', // amber
  '#8b5cf6', // violet
  '#06b6d4', // cyan
  '#ec4899', // pink
];

export default function BgOrbs() {
  const canvasRef = useRef(null);
  const [isPrimary, setIsPrimary] = useState(false);

  useEffect(() => {
    // If a canvas is already running in another component instance, skip creating a duplicate
    if (!globalCanvasActive) {
      globalCanvasActive = true;
      setIsPrimary(true);
    }

    return () => {
      if (isPrimary) {
        globalCanvasActive = false;
      }
    };
  }, [isPrimary]);

  useEffect(() => {
    if (!isPrimary) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Mouse coordinates (interpolated for silky smooth trailing)
    const mouse = {
      x: -1000,
      y: -1000,
      targetX: -1000,
      targetY: -1000,
      radius: 140,
      isHovering: false,
    };

    // Stardust trail particles spawned on mouse movement
    const trailSparks = [];

    // Ambient floating particles
    const particleCount = Math.min(50, Math.max(25, Math.floor((width * height) / 28000)));
    const particles = [];

    for (let i = 0; i < particleCount; i++) {
      const hasGlyph = Math.random() > 0.45;
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        baseX: 0,
        baseY: 0,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        radius: Math.random() * 2.5 + 1.5,
        color: PALETTE_COLORS[Math.floor(Math.random() * PALETTE_COLORS.length)],
        alpha: Math.random() * 0.25 + 0.15,
        targetAlpha: 0.2,
        glyph: hasGlyph ? GLYPHS[Math.floor(Math.random() * GLYPHS.length)] : null,
        glyphSize: Math.floor(Math.random() * 6) + 11,
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.02,
      });
    }

    // Resize handler
    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Pointer move listener across whole window
    const handlePointerMove = (e) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
      mouse.isHovering = true;

      // Spawn 1-2 interactive cursor stardust particles
      if (trailSparks.length < 35 && Math.random() > 0.3) {
        trailSparks.push({
          x: e.clientX + (Math.random() - 0.5) * 12,
          y: e.clientY + (Math.random() - 0.5) * 12,
          vx: (Math.random() - 0.5) * 1.5,
          vy: (Math.random() - 0.5) * 1.5 - 0.5,
          color: PALETTE_COLORS[Math.floor(Math.random() * PALETTE_COLORS.length)],
          size: Math.random() * 3 + 2,
          alpha: 0.8,
          life: 1.0,
          decay: Math.random() * 0.035 + 0.025,
        });
      }
    };

    const handlePointerLeave = () => {
      mouse.isHovering = false;
      mouse.targetX = -1000;
      mouse.targetY = -1000;
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerleave', handlePointerLeave, { passive: true });

    // Click / tap burst effect
    const handlePointerDown = (e) => {
      for (let i = 0; i < 8; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 3 + 1;
        trailSparks.push({
          x: e.clientX,
          y: e.clientY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          color: PALETTE_COLORS[Math.floor(Math.random() * PALETTE_COLORS.length)],
          size: Math.random() * 3.5 + 2.5,
          alpha: 1.0,
          life: 1.0,
          decay: Math.random() * 0.04 + 0.03,
        });
      }
    };
    window.addEventListener('pointerdown', handlePointerDown, { passive: true });

    // Animation Loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Smooth mouse interpolation
      mouse.x += (mouse.targetX - mouse.x) * 0.18;
      mouse.y += (mouse.targetY - mouse.y) * 0.18;

      // ── Interactive Cursor Glow Spotlight ──
      if (mouse.isHovering && mouse.x > 0 && mouse.y > 0) {
        const spotlight = ctx.createRadialGradient(
          mouse.x,
          mouse.y,
          0,
          mouse.x,
          mouse.y,
          mouse.radius * 1.3
        );
        spotlight.addColorStop(0, 'rgba(245, 158, 11, 0.12)');
        spotlight.addColorStop(0.5, 'rgba(244, 63, 94, 0.05)');
        spotlight.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = spotlight;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, mouse.radius * 1.3, 0, Math.PI * 2);
        ctx.fill();
      }

      // ── Draw & Update Particles ──
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Move
        p.x += p.vx;
        p.y += p.vy;

        // Bounce on edges
        if (p.x < 0) { p.x = 0; p.vx *= -1; }
        else if (p.x > width) { p.x = width; p.vx *= -1; }
        if (p.y < 0) { p.y = 0; p.vy *= -1; }
        else if (p.y > height) { p.y = height; p.vy *= -1; }

        p.rotation += p.vRot;

        // Cursor proximity physics
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        let isNearMouse = false;
        if (dist < mouse.radius && mouse.isHovering) {
          isNearMouse = true;
          const force = (mouse.radius - dist) / mouse.radius;
          // Gently push particle and speed up spin
          p.x -= (dx / dist) * force * 3;
          p.y -= (dy / dist) * force * 3;
          p.rotation += (dx > 0 ? 0.04 : -0.04) * force;
          p.targetAlpha = 0.85;

          // Connect cursor to particle with glowing elastic line
          ctx.beginPath();
          ctx.moveTo(mouse.x, mouse.y);
          ctx.lineTo(p.x, p.y);
          ctx.strokeStyle = p.color;
          ctx.globalAlpha = (1 - dist / mouse.radius) * 0.45;
          ctx.lineWidth = (1 - dist / mouse.radius) * 1.8;
          ctx.stroke();
          ctx.globalAlpha = 1.0;
        } else {
          p.targetAlpha = p.alpha;
        }

        // Smooth alpha transition
        const currentAlpha = p.targetAlpha;

        // Connect nearby particles with faint constellation lines
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const cdx = p.x - p2.x;
          const cdy = p.y - p2.y;
          const cdist = Math.sqrt(cdx * cdx + cdy * cdy);
          if (cdist < 85) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = isNearMouse ? p.color : 'rgba(150, 150, 150, 0.15)';
            ctx.globalAlpha = (1 - cdist / 85) * (isNearMouse ? 0.35 : 0.12);
            ctx.lineWidth = 0.8;
            ctx.stroke();
            ctx.globalAlpha = 1.0;
          }
        }

        // Render particle or glyph
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = currentAlpha;

        if (p.glyph) {
          ctx.fillStyle = p.color;
          ctx.font = `bold ${p.glyphSize}px system-ui, -apple-system, sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(p.glyph, 0, 0);
        } else {
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }

      // ── Draw & Update Cursor Trail Sparks ──
      for (let s = trailSparks.length - 1; s >= 0; s--) {
        const spark = trailSparks[s];
        spark.x += spark.vx;
        spark.y += spark.vy;
        spark.life -= spark.decay;
        spark.size *= 0.96;

        if (spark.life <= 0 || spark.size < 0.5) {
          trailSparks.splice(s, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = spark.life * spark.alpha;
        ctx.fillStyle = spark.color;
        ctx.beginPath();
        ctx.arc(spark.x, spark.y, spark.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerleave', handlePointerLeave);
      window.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [isPrimary]);

  return (
    <div className="playful-bg" aria-hidden="true">
      {/* Interactive HTML5 Motion & Cursor Canvas */}
      {isPrimary && <canvas ref={canvasRef} className="interactive-bg-canvas" />}

      {/* Atmospheric Soft Gradient Blobs */}
      <span className="playful-blob blob-1" />
      <span className="playful-blob blob-2" />
      <span className="playful-blob blob-3" />
    </div>
  );
}
