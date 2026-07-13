import React, { useRef, useEffect } from 'react';

// InteractiveField: renders a full‑size canvas that displays a dynamic vector‑field style
// background. Points are arranged in a grid and are attracted to the mouse cursor, producing
// the same "magnetic dot grid" effect visible on the Antigravity CLI page.
// The component is lightweight and uses only native Canvas APIs – no external libraries.

const InteractiveField = ({
  pointColor = '#00c3ff',
  lineColor = 'rgba(255,255,255,0.02)', // lighter lines
  pointSize = 2,
  lineWidth = 0.8,
  gridSpacing = 50,
}) => {
  const canvasRef = useRef(null);
  const mouse = useRef({ x: null, y: null });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    const points = [];
    // Determine canvas size; fallback to viewport if parent size is zero
    let width = canvas.parentElement.offsetWidth;
    let height = canvas.parentElement.offsetHeight;
    if (width === 0 || height === 0) {
      width = window.innerWidth;
      height = window.innerHeight;
    }
    canvas.width = width;
    canvas.height = height;

    // Initialise points in a regular grid
    for (let x = 0; x < width; x += gridSpacing) {
      for (let y = 0; y < height; y += gridSpacing) {
        const depth = Math.random() * 0.6 + 0.4; // 0.4 to 1.0 depth factor
        points.push({ x, y, ox: x, oy: y, vx: 0, vy: 0, z: depth });
      }
    }

    const render = () => {
      // Fade previous frame using canvas compositing
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'rgba(0,0,0,0.08)';
      ctx.fillRect(0, 0, width, height);
      ctx.globalCompositeOperation = 'source-over';
      // Update point positions – simple spring towards original position + mouse attraction
      points.forEach(p => {
        // Spring back to original location
        const dx0 = p.ox - p.x;
        const dy0 = p.oy - p.y;
        p.vx += dx0 * 0.02 * p.z;
        p.vy += dy0 * 0.02 * p.z;
        // Attraction to mouse if it exists
        if (mouse.current.x !== null) {
          const dx = mouse.current.x - p.x;
          const dy = mouse.current.y - p.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 150) {
            const force = (150 - dist) / 150;
            // Apply depth factor for parallax effect
            p.vx += dx * force * 0.05 * p.z;
            p.vy += dy * force * 0.05 * p.z;
          }
        }
        // Dampen velocity and apply
        p.vx *= 0.85;
        p.vy *= 0.85;
        p.x += p.vx;
        p.y += p.vy;
      });

      // Draw connections between nearby points
      for (let i = 0; i < points.length; i++) {
        for (let j = i + 1; j < points.length; j++) {
          const a = points[i];
          const b = points[j];
          const dist = Math.hypot(a.x - b.x, a.y - b.y);
          if (dist < gridSpacing * 1.0) { // fewer connections
            const alpha = 1 - dist / (gridSpacing * 1.0);
            ctx.strokeStyle = lineColor.replace('0.02', alpha.toFixed(2));
            ctx.lineWidth = lineWidth;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // Draw points
      points.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, pointSize * p.z, 0, Math.PI * 2);
        ctx.fillStyle = pointColor;
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    // Mouse movement tracking
    const handleMouse = e => {
      const rect = canvas.getBoundingClientRect();
      mouse.current.x = e.clientX - rect.left;
      mouse.current.y = e.clientY - rect.top;
    };
    const handleLeave = () => {
      mouse.current.x = null;
      mouse.current.y = null;
    };
    // Attach mouse events to window to capture movement even when canvas is behind overlay
    window.addEventListener('mousemove', handleMouse);
    window.addEventListener('mouseleave', handleLeave);

    render();

    // Resize canvas on window resize to keep animation responsive
    const resizeCanvas = () => {
      const newWidth = canvas.parentElement.offsetWidth || window.innerWidth;
      const newHeight = canvas.parentElement.offsetHeight || window.innerHeight;
      canvas.width = newWidth;
      canvas.height = newHeight;
    };
    window.addEventListener('resize', resizeCanvas);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouse);
      window.removeEventListener('mouseleave', handleLeave);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [gridSpacing, lineColor, pointColor, pointSize, lineWidth]);

  // The canvas covers the full parent area but stays behind other UI elements
  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none', // allow clicks through; mouse captured via window listener
        zIndex: 0,
      }}
    />
  );
};

export default InteractiveField;
