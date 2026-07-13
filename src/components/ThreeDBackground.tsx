import React, { useEffect, useRef } from 'react';

export const ThreeDBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // 3D Point structure
    interface Point3D {
      x: number;
      y: number;
      z: number;
    }

    const points: Point3D[] = [];
    const lines: [number, number][] = [];

    // Generate Stadium Bowl - more detailed with 4 tiers
    const ringCount = 5;
    const pointsPerRing = 24;
    const ringRadiiX = [140, 190, 240, 290, 340];
    const ringRadiiZ = [80, 110, 140, 170, 200];
    const ringHeights = [-50, -25, 0, 25, 50];

    let indexOffset = 0;
    for (let r = 0; r < ringCount; r++) {
      const rx = ringRadiiX[r];
      const rz = ringRadiiZ[r];
      const h = ringHeights[r];

      for (let i = 0; i < pointsPerRing; i++) {
        const theta = (i / pointsPerRing) * Math.PI * 2;
        points.push({
          x: Math.cos(theta) * rx,
          y: h,
          z: Math.sin(theta) * rz
        });

        const curr = indexOffset + i;
        const next = indexOffset + ((i + 1) % pointsPerRing);
        lines.push([curr, next]);

        if (r > 0) {
          const prevRingIndex = indexOffset - pointsPerRing + i;
          lines.push([curr, prevRingIndex]);
        }
      }
      indexOffset += pointsPerRing;
    }

    // Pitch rectangle with center line and circle
    const pitchOffset = points.length;
    const pw = 90, ph = 55;
    points.push({ x: -pw, y: -50, z: -ph });
    points.push({ x: pw, y: -50, z: -ph });
    points.push({ x: pw, y: -50, z: ph });
    points.push({ x: -pw, y: -50, z: ph });
    // Center line endpoints
    points.push({ x: 0, y: -50, z: -ph });
    points.push({ x: 0, y: -50, z: ph });

    // Pitch outline
    lines.push([pitchOffset, pitchOffset + 1]);
    lines.push([pitchOffset + 1, pitchOffset + 2]);
    lines.push([pitchOffset + 2, pitchOffset + 3]);
    lines.push([pitchOffset + 3, pitchOffset]);
    // Center line
    lines.push([pitchOffset + 4, pitchOffset + 5]);

    // Center circle points
    const circleOffset = points.length;
    const circleSegs = 16;
    const circleR = 20;
    for (let i = 0; i < circleSegs; i++) {
      const theta = (i / circleSegs) * Math.PI * 2;
      points.push({
        x: Math.cos(theta) * circleR,
        y: -50,
        z: Math.sin(theta) * circleR
      });
      const curr = circleOffset + i;
      const next = circleOffset + ((i + 1) % circleSegs);
      lines.push([curr, next]);
    }

    // Floating particles
    interface Particle {
      x: number;
      y: number;
      z: number;
      speedY: number;
      speedX: number;
      size: number;
      brightness: number;
    }
    const particles: Particle[] = [];
    const particleCount = 80;
    for (let p = 0; p < particleCount; p++) {
      particles.push({
        x: (Math.random() - 0.5) * 1000,
        y: (Math.random() - 0.5) * 500,
        z: (Math.random() - 0.5) * 1000,
        speedY: (Math.random() - 0.5) * 0.25,
        speedX: (Math.random() - 0.5) * 0.1,
        size: Math.random() * 2 + 0.5,
        brightness: Math.random() * 0.5 + 0.3
      });
    }

    // Background grid points for depth
    interface GridLine {
      x1: number; z1: number;
      x2: number; z2: number;
      y: number;
    }
    const gridLines: GridLine[] = [];
    const gridSpacing = 80;
    const gridExtent = 600;
    for (let x = -gridExtent; x <= gridExtent; x += gridSpacing) {
      gridLines.push({ x1: x, z1: -gridExtent, x2: x, z2: gridExtent, y: 120 });
    }
    for (let z = -gridExtent; z <= gridExtent; z += gridSpacing) {
      gridLines.push({ x1: -gridExtent, z1: z, x2: gridExtent, z2: z, y: 120 });
    }

    let angleY = 0;
    let scrollPct = 0;

    const handleScroll = () => {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight > 0) {
        scrollPct = window.scrollY / docHeight;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    const project = (pt: Point3D, cosY: number, sinY: number, cosX: number, sinX: number, currentD: number) => {
      const x1 = pt.x * cosY - pt.z * sinY;
      const z1 = pt.x * sinY + pt.z * cosY;
      const y2 = pt.y * cosX - z1 * sinX;
      const z2 = pt.y * sinX + z1 * cosX;
      const scale = currentD / (currentD + z2 + 350);
      return {
        x: width / 2 + x1 * scale,
        y: height / 2 + y2 * scale,
        scale,
        visible: scale > 0
      };
    };

    const render = () => {
      // Gradient background
      const grad = ctx.createRadialGradient(width / 2, height * 0.35, 0, width / 2, height * 0.35, Math.max(width, height) * 0.7);
      grad.addColorStop(0, '#0e1a33');
      grad.addColorStop(0.5, '#091222');
      grad.addColorStop(1, '#060b18');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      angleY += 0.0008;

      // Interpolate camera angle and dolly distance based on scroll position
      const currentAngleY = angleY + scrollPct * Math.PI * 0.5;
      const currentAngleX = 0.32 - scrollPct * 0.15; // tilt down slightly as we scroll
      const currentD = 550 - scrollPct * 120; // dolly zoom close-up

      const cosY = Math.cos(currentAngleY);
      const sinY = Math.sin(currentAngleY);
      const cosX = Math.cos(currentAngleX);
      const sinX = Math.sin(currentAngleX);

      // Draw background grid
      ctx.strokeStyle = 'rgba(36, 59, 106, 0.12)';
      ctx.lineWidth = 0.5;
      for (const gl of gridLines) {
        const p1 = project({ x: gl.x1, y: gl.y, z: gl.z1 }, cosY, sinY, cosX, sinX, currentD);
        const p2 = project({ x: gl.x2, y: gl.y, z: gl.z2 }, cosY, sinY, cosX, sinX, currentD);
        if (p1.visible && p2.visible) {
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      }

      // Project all stadium points
      const projected = points.map(pt => project(pt, cosY, sinY, cosX, sinX, currentD));

      // Draw stadium wireframe lines with gold gradient
      ctx.lineWidth = 0.8;
      for (let i = 0; i < lines.length; i++) {
        const [pA, pB] = lines[i];
        const projA = projected[pA];
        const projB = projected[pB];

        if (projA.visible && projB.visible) {
          // Pitch lines are green, stadium lines are gold
          const isPitch = pA >= pitchOffset;
          const alpha = isPitch ? 0.5 : 0.25 + projA.scale * 0.15;
          
          if (isPitch) {
            ctx.strokeStyle = `rgba(34, 163, 82, ${alpha})`;
            ctx.lineWidth = 1.2;
          } else {
            ctx.strokeStyle = `rgba(200, 168, 78, ${alpha})`;
            ctx.lineWidth = 0.7;
          }
          
          ctx.beginPath();
          ctx.moveTo(projA.x, projA.y);
          ctx.lineTo(projB.x, projB.y);
          ctx.stroke();
        }
      }

      // Draw points as small dots
      for (let i = 0; i < projected.length; i++) {
        const proj = projected[i];
        if (proj.visible) {
          const isPitch = i >= pitchOffset;
          const alpha = isPitch ? 0.6 : 0.3;
          ctx.fillStyle = isPitch ? `rgba(34, 163, 82, ${alpha})` : `rgba(200, 168, 78, ${alpha})`;
          ctx.beginPath();
          ctx.arc(proj.x, proj.y, isPitch ? 1.5 : 1.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Draw and update floating particles
      for (const particle of particles) {
        particle.y += particle.speedY;
        particle.x += particle.speedX;

        if (particle.y > 250) particle.y = -250;
        if (particle.y < -250) particle.y = 250;
        if (particle.x > 500) particle.x = -500;
        if (particle.x < -500) particle.x = 500;

        const proj = project(particle, cosY, sinY, cosX, sinX, currentD);
        if (proj.visible) {
          const size = particle.size * proj.scale;
          const alpha = particle.brightness * proj.scale;
          ctx.fillStyle = `rgba(219, 190, 90, ${alpha})`;
          ctx.beginPath();
          ctx.arc(proj.x, proj.y, size, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Subtle vignette overlay
      const vignette = ctx.createRadialGradient(width / 2, height / 2, height * 0.3, width / 2, height / 2, Math.max(width, height) * 0.7);
      vignette.addColorStop(0, 'rgba(6, 11, 24, 0)');
      vignette.addColorStop(1, 'rgba(6, 11, 24, 0.5)');
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, width, height);

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full -z-20 pointer-events-none" />;
};
