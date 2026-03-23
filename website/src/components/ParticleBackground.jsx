import React, { useEffect, useRef } from 'react';

const ParticleBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = window.innerWidth;
    let height = window.innerHeight;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * window.devicePixelRatio;
      canvas.height = height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    
    window.addEventListener('resize', resize);
    resize();

    let time = 0;

    const draw = () => {
      // Clear with dark, transparent composite or solid color to match reference
      ctx.fillStyle = '#020510'; // Deep midnight blue to match image
      ctx.fillRect(0, 0, width, height);

      time += 0.0018;

      const lines = 110;
      const pointsPerLine = 240;
      const xStep = width / pointsPerLine;
      
      for (let i = 0; i < lines; i++) {
        const isRed = (i % 8 === 0) || (i % 8 === 1); // Group of red lines periodically

        ctx.beginPath();
        let first = true;
        
        for (let j = 0; j <= pointsPerLine; j++) {
          const x = j * xStep;
          
          const nx = j / pointsPerLine;
          const ny = i / lines;
          
          // Noise/Wave simulation
          const wave1 = Math.sin(nx * 5 + time + ny * 6) * 110;
          const wave2 = Math.cos(nx * 3 - time * 0.8 + ny * 4) * 85;
          const wave3 = Math.sin(nx * 9 + time * 1.4) * 35;
          const wave4 = Math.cos(nx * 14 - time * 2.5) * 10;

          const depth = ny * 800 + wave1 + wave2;
          // Scale to give 3D perspective
          const scale = 1200 / (1200 + depth);

          // Center vertically and distribute lines
          const y = (height * 0.15) + (ny * height * 1.5) + (wave1 + wave2 + wave3 + wave4) * scale;
          
          if (first) {
            ctx.moveTo(x, y);
            first = false;
          } else {
            ctx.lineTo(x, y);
          }
        }
        
        // Colors from reference: glowing red and deep blue
        const strokeColor = isRed 
          ? `rgba(255, 30, 48, ${0.9 * (1 - i/lines)})` 
          : `rgba(20, 90, 255, ${0.6 * (1 - i/lines)})`;
          
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = isRed ? 2.2 : 1.2;
        // Dotted line effect: points forming lines
        ctx.setLineDash([1, isRed ? 3 : 5]);
        ctx.lineCap = "round";
        ctx.stroke();
      }

      animationFrameId = requestAnimationFrame(draw);
    };
    
    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -1, /* Stay behind all content */
        pointerEvents: 'none',
      }}
    />
  );
};

export default ParticleBackground;
