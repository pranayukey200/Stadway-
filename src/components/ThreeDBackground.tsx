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

    // Handle resize
    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // 3D Point class
    interface Point3D {
      x: number;
      y: number;
      z: number;
    }

    const points: Point3D[] = [];
    const lines: [number, number][] = [];

    // 1. Generate 3D Stadium Rings (concentric ellipses in layers)
    const ringCount = 3;
    const pointsPerRing = 16;
    const ringRadiiX = [180, 240, 300];
    const ringRadiiZ = [100, 140, 180];
    const ringHeights = [-40, 0, 40];

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

        // Connect ring points sequentially
        const curr = indexOffset + i;
        const next = indexOffset + ((i + 1) % pointsPerRing);
        lines.push([curr, next]);

        // Connect vertically to previous ring
        if (r > 0) {
          const prevRingIndex = indexOffset - pointsPerRing + i;
          lines.push([curr, prevRingIndex]);
        }
      }
      indexOffset += pointsPerRing;
    }

    // 2. Generate Pitch field lines (rectangular base in center)
    const pitchPointsOffset = points.length;
    points.push({ x: -100, y: -40, z: -50 });
    points.push({ x: 100, y: -40, z: -50 });
    points.push({ x: 100, y: -40, z: 50 });
    points.push({ x: -100, y: -40, z: 50 });

    lines.push([pitchPointsOffset, pitchPointsOffset + 1]);
    lines.push([pitchPointsOffset + 1, pitchPointsOffset + 2]);
    lines.push([pitchPointsOffset + 2, pitchPointsOffset + 3]);
    lines.push([pitchPointsOffset + 3, pitchPointsOffset]);

    // 3. Generate Floating Particles
    interface Particle {
      x: number;
      y: number;
      z: number;
      speedY: number;
      size: number;
    }
    const particles: Particle[] = [];
    const particleCount = 65;
    for (let p = 0; p < particleCount; p++) {
      particles.push({
        x: (Math.random() - 0.5) * 800,
        y: (Math.random() - 0.5) * 400,
        z: (Math.random() - 0.5) * 800,
        speedY: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 2 + 1
      });
    }

    // Rotation angles
    let angleY = 0.001;
    let angleX = 0.35; // Tilt the stadium slightly down so we see it in 3D perspective

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Rotate slightly over time
      angleY += 0.0012;

      const cosY = Math.cos(angleY);
      const sinY = Math.sin(angleY);
      const cosX = Math.cos(angleX);
      const sinX = Math.sin(angleX);

      const d = 500; // Camera distance / perspective index
      const centerX = width / 2;
      const centerY = height / 2;

      // Project 3D points to 2D screen coordinates
      const projected: { x: number; y: number; visible: boolean }[] = [];

      for (let i = 0; i < points.length; i++) {
        const pt = points[i];

        // Y-axis rotation
        let x1 = pt.x * cosY - pt.z * sinY;
        let z1 = pt.x * sinY + pt.z * cosY;

        // X-axis rotation (tilt)
        let y2 = pt.y * cosX - z1 * sinX;
        let z2 = pt.y * sinX + z1 * cosX;

        // Perspective division
        const scale = d / (d + z2 + 320);
        const sx = centerX + x1 * scale;
        const sy = centerY + y2 * scale;

        projected.push({
          x: sx,
          y: sy,
          visible: scale > 0
        });
      }

      // Draw Lines
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.45)'; // Bright indigo lines
      ctx.lineWidth = 1;
      for (let i = 0; i < lines.length; i++) {
        const [pA, pB] = lines[i];
        const projA = projected[pA];
        const projB = projected[pB];

        if (projA.visible && projB.visible) {
          ctx.beginPath();
          ctx.moveTo(projA.x, projA.y);
          ctx.lineTo(projB.x, projB.y);
          ctx.stroke();
        }
      }

      // Draw Points (Location Sensors)
      for (let i = 0; i < projected.length; i++) {
        const proj = projected[i];
        if (proj.visible) {
          ctx.fillStyle = i >= pitchPointsOffset ? 'rgba(56, 189, 248, 0.7)' : 'rgba(99, 102, 241, 0.55)';
          ctx.beginPath();
          ctx.arc(proj.x, proj.y, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Update and Draw Floating Particles in 3D
      ctx.fillStyle = 'rgba(186, 230, 253, 0.35)'; // Bright sky blue particles
      for (let p = 0; p < particles.length; p++) {
        const particle = particles[p];
        particle.y += particle.speedY;

        // Wrap around bounds
        if (particle.y > 200) particle.y = -200;
        if (particle.y < -200) particle.y = 200;

        // Rotate particle
        let x1 = particle.x * cosY - particle.z * sinY;
        let z1 = particle.x * sinY + particle.z * cosY;
        let y2 = particle.y * cosX - z1 * sinX;
        let z2 = particle.y * sinX + z1 * cosX;

        const scale = d / (d + z2 + 320);
        if (scale > 0) {
          const sx = centerX + x1 * scale;
          const sy = centerY + y2 * scale;
          const size = particle.size * scale;

          ctx.beginPath();
          ctx.arc(sx, sy, size, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full -z-20 pointer-events-none bg-[#05070a]" />;
};
