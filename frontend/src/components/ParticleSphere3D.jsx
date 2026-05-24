import React, { useEffect, useRef } from 'react';

const ParticleSphere3D = ({ radius = 160, particleCount = 280, interactive = true }) => {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0, active: false });
  const rotationRef = useRef({ x: 0, y: 0, speedX: 0.003, speedY: 0.005 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let width = canvas.width = canvas.offsetWidth;
    let height = canvas.height = canvas.offsetHeight;

    // Handle resizing
    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };

    window.addEventListener('resize', handleResize);

    // Generate points on a sphere (Fibonacci lattice for uniform distribution)
    const points = [];
    const goldenRatio = (1 + Math.sqrt(5)) / 2;

    for (let i = 0; i < particleCount; i++) {
      const theta = 2 * Math.PI * i / goldenRatio;
      const phi = Math.acos(1 - 2 * (i + 0.5) / particleCount);
      
      const x = radius * Math.cos(theta) * Math.sin(phi);
      const y = radius * Math.sin(theta) * Math.sin(phi);
      const z = radius * Math.cos(phi);
      
      // Assign custom properties
      points.push({
        x, y, z,
        baseColor: i % 3 === 0 ? 'cyan' : i % 3 === 1 ? 'purple' : 'magenta',
        size: Math.random() * 1.5 + 1
      });
    }

    // Interactive mouse listeners
    const handleMouseMove = (e) => {
      if (!interactive) return;
      const rect = canvas.getBoundingClientRect();
      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;
      
      // Coordinates normalized to center (-1 to 1)
      mouseRef.current.targetX = (clientX - width / 2) / (width / 2);
      mouseRef.current.targetY = (clientY - height / 2) / (height / 2);
      mouseRef.current.active = true;
    };

    const handleMouseLeave = () => {
      mouseRef.current.targetX = 0;
      mouseRef.current.targetY = 0;
      mouseRef.current.active = false;
    };

    const parent = canvas.parentElement;
    if (parent) {
      parent.addEventListener('mousemove', handleMouseMove);
      parent.addEventListener('mouseleave', handleMouseLeave);
    }

    const focalLength = 300;

    // Main render loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Lerp mouse coordinates for smooth damping
      const mouse = mouseRef.current;
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      // Adjust rotation speed based on mouse movement
      const rot = rotationRef.current;
      const currentSpeedX = rot.speedX + mouse.y * 0.015;
      const currentSpeedY = rot.speedY + mouse.x * 0.015;

      // Update rotation angles
      rot.x += currentSpeedX;
      rot.y += currentSpeedY;

      // Sine and Cosine of angles
      const cosX = Math.cos(rot.x);
      const sinX = Math.sin(rot.x);
      const cosY = Math.cos(rot.y);
      const sinY = Math.sin(rot.y);

      // Project and store computed coordinates for rendering connections
      const projected = [];

      for (let i = 0; i < points.length; i++) {
        const p = points[i];

        // 3D Rotations
        // Rotate around Y-axis
        let x1 = p.x * cosY - p.z * sinY;
        let z1 = p.x * sinY + p.z * cosY;

        // Rotate around X-axis
        let y2 = p.y * cosX - z1 * sinX;
        let z2 = p.y * sinX + z1 * cosX;

        // Depth projection (z2 determines scale and opacity)
        const scale = focalLength / (focalLength + z2);
        const projX = width / 2 + x1 * scale;
        const projY = height / 2 + y2 * scale;

        projected.push({
          x: projX,
          y: projY,
          z: z2,
          scale: scale,
          baseColor: p.baseColor,
          size: p.size
        });
      }

      // Draw connections first (background)
      ctx.lineWidth = 0.4;
      for (let i = 0; i < projected.length; i++) {
        const p1 = projected[i];
        if (p1.z > 50) continue; // Skip connecting deep background points to reduce clutter

        // Limit the number of checks for better performance
        for (let j = i + 1; j < projected.length; j += 4) {
          const p2 = projected[j];
          
          // Calculate distance in 2D space
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 55) {
            // Transparency based on distance and average z-depth
            const avgZ = (p1.z + p2.z) / 2;
            const depthAlpha = Math.max(0, 1 - (avgZ + radius) / (2 * radius));
            const distAlpha = Math.max(0, 1 - dist / 55);
            const alpha = distAlpha * depthAlpha * 0.18;

            ctx.strokeStyle = `rgba(99, 102, 241, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      // Draw particles
      for (let i = 0; i < projected.length; i++) {
        const p = projected[i];
        
        // Alpha based on depth z (-radius to radius)
        const alpha = Math.max(0.15, Math.min(1, 1 - (p.z + radius) / (2 * radius * 1.2)));
        const pointSize = Math.max(0.8, p.size * p.scale);

        // Map colors with custom gradient look based on depth & base color
        let colorStr = 'rgba(99, 102, 241, ' + alpha + ')'; // Default Indigo
        if (p.baseColor === 'cyan') {
          colorStr = `rgba(6, 182, 212, ${alpha * 1.1})`; // Cyan
        } else if (p.baseColor === 'purple') {
          colorStr = `rgba(168, 85, 247, ${alpha * 0.9})`; // Purple
        } else if (p.baseColor === 'magenta') {
          colorStr = `rgba(236, 72, 153, ${alpha * 1.0})`; // Magenta
        }

        ctx.fillStyle = colorStr;
        ctx.beginPath();
        ctx.arc(p.x, p.y, pointSize, 0, Math.PI * 2);
        ctx.fill();

        // Beautiful particle glow for closer, larger particles
        if (p.z < -80 && i % 4 === 0) {
          ctx.shadowBlur = 12;
          ctx.shadowColor = p.baseColor === 'cyan' ? '#06b6d4' : p.baseColor === 'purple' ? '#a855f7' : '#ec4899';
          ctx.beginPath();
          ctx.arc(p.x, p.y, pointSize * 1.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.4})`;
          ctx.fill();
          ctx.shadowBlur = 0; // Reset shadow for performance
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (parent) {
        parent.removeEventListener('mousemove', handleMouseMove);
        parent.removeEventListener('mouseleave', handleMouseLeave);
      }
      cancelAnimationFrame(animationFrameId);
    };
  }, [radius, particleCount, interactive]);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
      style={{ mixBlendMode: 'screen' }}
    />
  );
};

export default ParticleSphere3D;
