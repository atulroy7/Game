import React, { useEffect, useRef, useState } from 'react';

// Unique instance tracking so the root instance runs the canvas
let activeCanvasOwnerId = null;

const PALETTE = [
  '#f59e0b', // amber
  '#f43f5e', // coral
  '#10b981', // mint
  '#8b5cf6', // violet
  '#06b6d4', // cyan
  '#ec4899', // pink
  '#fbbf24', // bright gold
];

const GLYPHS = ['✦', '★', '▲', '◆', '●', '+', '×', '?', '∞', '⚡'];

export default function BgOrbs() {
  const canvasRef = useRef(null);
  const instanceId = useRef(Math.random().toString(36).substring(2, 9));
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    const id = instanceId.current;
    if (!activeCanvasOwnerId) {
      activeCanvasOwnerId = id;
      setIsOwner(true);
    }

    return () => {
      if (activeCanvasOwnerId === id) {
        activeCanvasOwnerId = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!isOwner) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Mouse tracking with velocity & smoothing
    const mouse = {
      x: -1000,
      y: -1000,
      targetX: -1000,
      targetY: -1000,
      prevX: -1000,
      prevY: -1000,
      speed: 0,
      radius: 170,
      isHovering: false,
    };

    // Stardust trail sparks
    const sparks = [];
    // Expanding shockwave ripples
    const ripples = [];

    // Floating nodes
    const nodeCount = Math.min(55, Math.max(28, Math.floor((width * height) / 26000)));
    const nodes = [];

    for (let i = 0; i < nodeCount; i++) {
      const isSpecial = Math.random() > 0.4;
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.7,
        vy: (Math.random() - 0.5) * 0.7,
        baseRadius: Math.random() * 3 + 2,
        radius: 3,
        color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
        alpha: Math.random() * 0.4 + 0.25,
        targetAlpha: 0.3,
        glyph: isSpecial ? GLYPHS[Math.floor(Math.random() * GLYPHS.length)] : null,
        glyphSize: Math.floor(Math.random() * 7) + 12,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.025,
      });
    }

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    let lastSparkTime = 0;

    const handlePointerMove = (e) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
      mouse.isHovering = true;

      const now = performance.now();
      const dx = e.clientX - mouse.prevX;
      const dy = e.clientY - mouse.prevY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      mouse.speed = Math.min(dist, 40);

      mouse.prevX = e.clientX;
      mouse.prevY = e.clientY;

      // Spawn trail particles based on movement
      if (now - lastSparkTime > 16 && dist > 2) {
        lastSparkTime = now;
        const count = Math.min(3, Math.max(1, Math.floor(dist / 8)));

        for (let i = 0; i < count; i++) {
          if (sparks.length > 70) break;
          const angle = Math.random() * Math.PI * 2;
          const spread = Math.random() * 3 + 1;
          const color = PALETTE[Math.floor(Math.random() * PALETTE.length)];
          const isStar = Math.random() > 0.45;

          sparks.push({
            x: e.clientX + (Math.random() - 0.5) * 16,
            y: e.clientY + (Math.random() - 0.5) * 16,
            vx: (Math.random() - 0.5) * 1.8 + (dx * 0.1),
            vy: (Math.random() - 0.5) * 1.8 + (dy * 0.1) - 0.4,
            size: Math.random() * 4.5 + 2.5,
            color,
            alpha: 1.0,
            life: 1.0,
            decay: Math.random() * 0.03 + 0.02,
            isStar,
            rotation: Math.random() * Math.PI * 2,
            rotSpeed: (Math.random() - 0.5) * 0.1,
          });
        }

        // Spawn a gentle ripple occasionally
        if (Math.random() > 0.85 && ripples.length < 5) {
          ripples.push({
            x: e.clientX,
            y: e.clientY,
            radius: 5,
            maxRadius: 65,
            alpha: 0.5,
            color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
          });
        }
      }
    };

    const handlePointerLeave = () => {
      mouse.isHovering = false;
      mouse.targetX = -1000;
      mouse.targetY = -1000;
    };

    // Click / Tap Burst Effect
    const handlePointerDown = (e) => {
      const burstCount = 14;
      for (let i = 0; i < burstCount; i++) {
        const angle = (Math.PI * 2 * i) / burstCount + (Math.random() - 0.5) * 0.3;
        const speed = Math.random() * 4 + 2;
        sparks.push({
          x: e.clientX,
          y: e.clientY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: Math.random() * 5 + 3,
          color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
          alpha: 1.0,
          life: 1.0,
          decay: Math.random() * 0.028 + 0.02,
          isStar: Math.random() > 0.3,
          rotation: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 0.15,
        });
      }

      // Add a shockwave ring on click
      ripples.push({
        x: e.clientX,
        y: e.clientY,
        radius: 10,
        maxRadius: 110,
        alpha: 0.8,
        color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
      });
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerleave', handlePointerLeave, { passive: true });
    window.addEventListener('pointerdown', handlePointerDown, { passive: true });

    // Draw a 4-point sparkling star
    const drawStar = (x, y, radius, color, alpha, rot) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rot);
      ctx.fillStyle = color;
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      for (let i = 0; i < 4; i++) {
        ctx.lineTo(Math.cos((i * Math.PI) / 2) * radius, Math.sin((i * Math.PI) / 2) * radius);
        ctx.lineTo(
          Math.cos((i * Math.PI) / 2 + Math.PI / 4) * (radius * 0.35),
          Math.sin((i * Math.PI) / 2 + Math.PI / 4) * (radius * 0.35)
        );
      }
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    };

    // Animation Loop
    let time = 0;
    const render = () => {
      time += 0.015;
      ctx.clearRect(0, 0, width, height);

      // Smooth mouse interpolation
      mouse.x += (mouse.targetX - mouse.x) * 0.22;
      mouse.y += (mouse.targetY - mouse.y) * 0.22;

      // ── 1. Interactive Cursor Spotlight Halo ──
      if (mouse.isHovering && mouse.x > 0 && mouse.y > 0) {
        const glowRadius = mouse.radius * 1.1;
        const glow = ctx.createRadialGradient(
          mouse.x,
          mouse.y,
          0,
          mouse.x,
          mouse.y,
          glowRadius
        );
        glow.addColorStop(0, 'rgba(251, 191, 36, 0.22)');
        glow.addColorStop(0.35, 'rgba(244, 63, 94, 0.12)');
        glow.addColorStop(0.7, 'rgba(16, 185, 129, 0.05)');
        glow.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, glowRadius, 0, Math.PI * 2);
        ctx.fill();

        // Delicate rotating targeting reticle around cursor
        ctx.save();
        ctx.translate(mouse.x, mouse.y);
        ctx.rotate(time * 0.8);
        ctx.strokeStyle = 'rgba(251, 191, 36, 0.45)';
        ctx.lineWidth = 1.2;
        ctx.setLineDash([6, 8]);
        ctx.beginPath();
        ctx.arc(0, 0, 22, 0, Math.PI * 2);
        ctx.stroke();

        ctx.rotate(-time * 1.4);
        ctx.strokeStyle = 'rgba(244, 63, 94, 0.35)';
        ctx.beginPath();
        ctx.arc(0, 0, 14, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // ── 2. Expanding Shockwave Ripples ──
      for (let r = ripples.length - 1; r >= 0; r--) {
        const rip = ripples[r];
        rip.radius += 2.8;
        rip.alpha *= 0.94;

        if (rip.alpha <= 0.02 || rip.radius >= rip.maxRadius) {
          ripples.splice(r, 1);
          continue;
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(rip.x, rip.y, rip.radius, 0, Math.PI * 2);
        ctx.strokeStyle = rip.color;
        ctx.lineWidth = 2;
        ctx.globalAlpha = rip.alpha;
        ctx.shadowColor = rip.color;
        ctx.shadowBlur = 8;
        ctx.stroke();
        ctx.restore();
      }

      // ── 3. Draw & Update Floating Nodes & Constellations ──
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];

        // Drift
        n.x += n.vx;
        n.y += n.vy;

        // Bounce
        if (n.x < 0) { n.x = 0; n.vx *= -1; }
        else if (n.x > width) { n.x = width; n.vx *= -1; }
        if (n.y < 0) { n.y = 0; n.vy *= -1; }
        else if (n.y > height) { n.y = height; n.vy *= -1; }

        n.rotation += n.rotSpeed;

        // Proximity to cursor
        const dx = mouse.x - n.x;
        const dy = mouse.y - n.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        let isNear = false;
        if (dist < mouse.radius && mouse.isHovering) {
          isNear = true;
          const force = (mouse.radius - dist) / mouse.radius;

          // Push gently away or pull into swirl
          n.x -= (dx / dist) * force * 4.2;
          n.y -= (dy / dist) * force * 4.2;
          n.rotation += (dx > 0 ? 0.08 : -0.08) * force;
          n.targetAlpha = 0.95;

          // Luminous laser beam from cursor to node!
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(mouse.x, mouse.y);
          ctx.lineTo(n.x, n.y);
          ctx.strokeStyle = n.color;
          ctx.globalAlpha = force * 0.7;
          ctx.lineWidth = force * 2.2 + 0.5;
          ctx.shadowColor = n.color;
          ctx.shadowBlur = 10;
          ctx.stroke();
          ctx.restore();
        } else {
          n.targetAlpha = n.alpha;
        }

        // Connect nearby nodes within 90px
        for (let j = i + 1; j < nodes.length; j++) {
          const n2 = nodes[j];
          const ndx = n.x - n2.x;
          const ndy = n.y - n2.y;
          const ndist = Math.sqrt(ndx * ndx + ndy * ndy);

          if (ndist < 95) {
            const lineAlpha = (1 - ndist / 95) * (isNear ? 0.45 : 0.18);
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(n.x, n.y);
            ctx.lineTo(n2.x, n2.y);
            ctx.strokeStyle = isNear ? n.color : 'rgba(160, 160, 160, 0.25)';
            ctx.globalAlpha = lineAlpha;
            ctx.lineWidth = 0.9;
            ctx.stroke();
            ctx.restore();
          }
        }

        // Draw node
        ctx.save();
        ctx.translate(n.x, n.y);
        ctx.rotate(n.rotation);
        ctx.globalAlpha = n.targetAlpha;

        if (n.glyph) {
          ctx.fillStyle = n.color;
          ctx.font = `900 ${n.glyphSize}px system-ui, -apple-system, sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          if (isNear) {
            ctx.shadowColor = n.color;
            ctx.shadowBlur = 12;
          }
          ctx.fillText(n.glyph, 0, 0);
        } else {
          ctx.fillStyle = n.color;
          if (isNear) {
            ctx.shadowColor = n.color;
            ctx.shadowBlur = 10;
          }
          ctx.beginPath();
          ctx.arc(0, 0, n.baseRadius * (isNear ? 1.4 : 1), 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }

      // ── 4. Draw & Update Cursor Stardust Trail Sparks ──
      for (let s = sparks.length - 1; s >= 0; s--) {
        const sp = sparks[s];
        sp.x += sp.vx;
        sp.y += sp.vy;
        sp.life -= sp.decay;
        sp.rotation += sp.rotSpeed;
        sp.size *= 0.97;

        if (sp.life <= 0 || sp.size < 0.6) {
          sparks.splice(s, 1);
          continue;
        }

        const sparkAlpha = sp.life * sp.alpha;

        if (sp.isStar) {
          drawStar(sp.x, sp.y, sp.size, sp.color, sparkAlpha, sp.rotation);
        } else {
          ctx.save();
          ctx.globalAlpha = sparkAlpha;
          ctx.fillStyle = sp.color;
          ctx.shadowColor = sp.color;
          ctx.shadowBlur = 6;
          ctx.beginPath();
          ctx.arc(sp.x, sp.y, sp.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
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
  }, [isOwner]);

  return (
    <div className="playful-bg" aria-hidden="true">
      {/* High-priority interactive foreground overlay canvas */}
      {isOwner && <canvas ref={canvasRef} className="interactive-bg-canvas" />}

      {/* Atmospheric flowing ambient blobs */}
      <span className="playful-blob blob-1" />
      <span className="playful-blob blob-2" />
      <span className="playful-blob blob-3" />
    </div>
  );
}
