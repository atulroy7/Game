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
  '#a78bfa', // lavender
  '#34d399', // emerald
  '#fb7185', // rose
];

// Aesthetic geometric & symbolic glyphs
const GLYPHS = ['✦', '✧', '◈', '⬡', '⬠', '◇', '⭡', '⦿', '✶', '✹', '+', '×', '∞', '⦻', '◦'];

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
    const nodeCount = Math.min(60, Math.max(28, Math.floor((width * height) / 22000)));
    const nodes = [];

    for (let i = 0; i < nodeCount; i++) {
      const isSpecial = Math.random() > 0.35;
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.65,
        vy: (Math.random() - 0.5) * 0.65,
        baseRadius: Math.random() * 3 + 2,
        radius: 3,
        color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
        alpha: Math.random() * 0.4 + 0.25,
        targetAlpha: 0.3,
        glyph: isSpecial ? GLYPHS[Math.floor(Math.random() * GLYPHS.length)] : null,
        glyphSize: Math.floor(Math.random() * 7) + 11,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.022,
        pulsePhase: Math.random() * Math.PI * 2,
      });
    }

    // DNA helix pairs
    const helixCount = 4;
    const helixNodes = [];
    for (let h = 0; h < helixCount; h++) {
      helixNodes.push({
        x: (width / (helixCount + 1)) * (h + 1),
        phase: Math.random() * Math.PI * 2,
        color1: PALETTE[Math.floor(Math.random() * PALETTE.length)],
        color2: PALETTE[Math.floor(Math.random() * PALETTE.length)],
        speed: 0.3 + Math.random() * 0.2,
        amplitude: 28 + Math.random() * 18,
        drift: (Math.random() - 0.5) * 0.15,
      });
    }

    // Aurora blobs
    const auroraBlobs = [
      { x: width * 0.15, y: height * 0.25, color: '#8b5cf6', r: 180, phase: 0 },
      { x: width * 0.75, y: height * 0.65, color: '#06b6d4', r: 220, phase: 2.1 },
      { x: width * 0.5, y: height * 0.85, color: '#ec4899', r: 160, phase: 4.2 },
    ];

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
      time += 0.012;
      ctx.clearRect(0, 0, width, height);

      // Smooth mouse interpolation
      mouse.x += (mouse.targetX - mouse.x) * 0.22;
      mouse.y += (mouse.targetY - mouse.y) * 0.22;

      // ── 0. Aurora Breathing Blobs ──
      for (let b = 0; b < auroraBlobs.length; b++) {
        const blob = auroraBlobs[b];
        const scale = 1 + Math.sin(time * 0.5 + blob.phase) * 0.12;
        const r = blob.r * scale;
        // Slow drift
        blob.x += Math.sin(time * 0.08 + blob.phase) * 0.25;
        blob.y += Math.cos(time * 0.06 + blob.phase) * 0.2;
        // Wrap at edges
        if (blob.x < -r) blob.x = width + r;
        if (blob.x > width + r) blob.x = -r;
        if (blob.y < -r) blob.y = height + r;
        if (blob.y > height + r) blob.y = -r;

        const grad = ctx.createRadialGradient(blob.x, blob.y, 0, blob.x, blob.y, r);
        grad.addColorStop(0, blob.color + '18');
        grad.addColorStop(0.45, blob.color + '09');
        grad.addColorStop(1, blob.color + '00');
        ctx.save();
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(blob.x, blob.y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // ── 1. DNA Helix Streams ──
      for (let h = 0; h < helixNodes.length; h++) {
        const hn = helixNodes[h];
        hn.phase += hn.speed * 0.015;
        hn.x += hn.drift;
        if (hn.x < -40) hn.x = width + 40;
        if (hn.x > width + 40) hn.x = -40;

        const steps = 14;
        for (let s = 0; s < steps; s++) {
          const t = s / steps;
          const y1 = height * t;
          const y2 = height * (s + 1) / steps;
          const x1a = hn.x + Math.sin(hn.phase + t * Math.PI * 4) * hn.amplitude;
          const x1b = hn.x - Math.sin(hn.phase + t * Math.PI * 4) * hn.amplitude;
          const x2a = hn.x + Math.sin(hn.phase + (s + 1) / steps * Math.PI * 4) * hn.amplitude;
          const x2b = hn.x - Math.sin(hn.phase + (s + 1) / steps * Math.PI * 4) * hn.amplitude;

          // Strand A
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(x1a, y1);
          ctx.lineTo(x2a, y2);
          ctx.strokeStyle = hn.color1;
          ctx.globalAlpha = 0.12;
          ctx.lineWidth = 1.2;
          ctx.stroke();
          ctx.restore();

          // Strand B
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(x1b, y1);
          ctx.lineTo(x2b, y2);
          ctx.strokeStyle = hn.color2;
          ctx.globalAlpha = 0.10;
          ctx.lineWidth = 1.2;
          ctx.stroke();
          ctx.restore();

          // Cross-rungs every few steps
          if (s % 3 === 0) {
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(x1a, y1);
            ctx.lineTo(x1b, y1);
            ctx.strokeStyle = hn.color1;
            ctx.globalAlpha = 0.07;
            ctx.lineWidth = 0.8;
            ctx.stroke();
            ctx.restore();
          }
        }
      }

      if (mouse.isHovering && mouse.x > 0 && mouse.y > 0) {
        const glowRadius = mouse.radius * 1.1;
        const glow = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, glowRadius);
        glow.addColorStop(0, 'rgba(251, 191, 36, 0.20)');
        glow.addColorStop(0.35, 'rgba(244, 63, 94, 0.10)');
        glow.addColorStop(0.7, 'rgba(16, 185, 129, 0.04)');
        glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, glowRadius, 0, Math.PI * 2);
        ctx.fill();

        // Outer slow CCW ring
        ctx.save();
        ctx.translate(mouse.x, mouse.y);
        ctx.rotate(-time * 0.6);
        ctx.strokeStyle = 'rgba(251, 191, 36, 0.55)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([8, 10]);
        ctx.beginPath(); ctx.arc(0, 0, 28, 0, Math.PI * 2); ctx.stroke();

        // Inner fast CW ring
        ctx.rotate(time * 2.2);
        ctx.strokeStyle = 'rgba(244, 63, 94, 0.42)';
        ctx.lineWidth = 1.0;
        ctx.setLineDash([4, 7]);
        ctx.beginPath(); ctx.arc(0, 0, 16, 0, Math.PI * 2); ctx.stroke();

        // Tiny crosshair
        ctx.setLineDash([]);
        ctx.strokeStyle = 'rgba(251, 191, 36, 0.30)';
        ctx.lineWidth = 0.8;
        ctx.beginPath(); ctx.moveTo(-6, 0); ctx.lineTo(6, 0); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, -6); ctx.lineTo(0, 6); ctx.stroke();
        ctx.restore();

        // Comet streaks on fast movement
        if (mouse.speed > 12) {
          const cometCount = Math.min(4, Math.floor(mouse.speed / 8));
          const angle = Math.atan2(mouse.y - mouse.prevY, mouse.x - mouse.prevX);
          for (let c = 0; c < cometCount; c++) {
            const jitter = (Math.random() - 0.5) * 0.4;
            const len = mouse.speed * (1.5 + Math.random());
            const cx = mouse.x + (Math.random() - 0.5) * 10;
            const cy = mouse.y + (Math.random() - 0.5) * 10;
            const color = PALETTE[Math.floor(Math.random() * PALETTE.length)];
            ctx.save();
            const grad = ctx.createLinearGradient(cx, cy, cx - Math.cos(angle + jitter) * len, cy - Math.sin(angle + jitter) * len);
            grad.addColorStop(0, color + 'CC');
            grad.addColorStop(1, color + '00');
            ctx.strokeStyle = grad;
            ctx.lineWidth = 1.2 + Math.random();
            ctx.globalAlpha = 0.65;
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(cx - Math.cos(angle + jitter) * len, cy - Math.sin(angle + jitter) * len);
            ctx.stroke();
            ctx.restore();
          }
        }
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
