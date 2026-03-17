import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

/**
 * InteractiveBG — Canvas-based interactive background
 * - Floating particles that drift organically
 * - Constellation-like lines connecting nearby particles  
 * - Particles react to mouse (repel gently near cursor)
 * - Click wave ripple effect
 * - Mouse glow trail
 * - Enhanced with motion orbs for better depth and lighting
 */
const ParallaxBG = () => {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: -500, y: -500 });
  const particlesRef = useRef([]);
  const wavesRef = useRef([]);
  const rafRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width = window.innerWidth;
    let height = window.innerHeight;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    resize();
    window.addEventListener('resize', resize);

    // --- particles ---
    const PARTICLE_COUNT = Math.min(Math.floor((width * height) / 10000), 100);
    const CONNECTION_DIST = 180;
    const MOUSE_RADIUS = 150; // Increased range of effect

    const createParticle = () => {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 0.12 + 0.04;
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        baseVx: Math.cos(angle) * speed,
        baseVy: Math.sin(angle) * speed,
        pushVx: 0,
        pushVy: 0,
        r: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.5 + 0.2,
        hue: Math.random() > 0.5 ? 190 : 260, // cyan or purple
      };
    };

    particlesRef.current = Array.from({ length: PARTICLE_COUNT }, createParticle);

    // --- mouse & clicks ---
    const handleMouse = (e) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    };
    const handleLeave = () => {
      mouseRef.current.x = -500;
      mouseRef.current.y = -500;
    };
    const handleClick = (e) => {
      wavesRef.current.push({
        x: e.clientX,
        y: e.clientY,
        radius: 0,
        opacity: 0.7,
        speed: 8,
      });
    };
    
    window.addEventListener('mousemove', handleMouse);
    window.addEventListener('mouseleave', handleLeave);
    window.addEventListener('click', handleClick);

    // --- animation ---
    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      const particles = particlesRef.current;
      const waves = wavesRef.current;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      // update positions
      for (const p of particles) {
        // mouse repulsion
        const dx = p.x - mx;
        const dy = p.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MOUSE_RADIUS && dist > 0) {
          const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS;
          const power = force * 0.4; 
          p.pushVx += (dx / dist) * power;
          p.pushVy += (dy / dist) * power;
        }

        // damping for push velocity only
        p.pushVx *= 0.95;
        p.pushVy *= 0.95;

        p.x += p.baseVx + p.pushVx;
        p.y += p.baseVy + p.pushVy;

        // wrap
        if (p.x < -100) p.x = width + 100;
        if (p.x > width + 100) p.x = -100;
        if (p.y < -100) p.y = height + 100;
        if (p.y > height + 100) p.y = -100;
      }

      // draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECTION_DIST) {
            const alpha = (1 - dist / CONNECTION_DIST) * 0.12;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(0, 212, 255, ${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      // draw waves
      for (let i = waves.length - 1; i >= 0; i--) {
        const w = waves[i];
        w.radius += w.speed;
        w.opacity -= 0.01;
        
        if (w.opacity <= 0) {
          waves.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(w.x, w.y, w.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(0, 212, 255, ${w.opacity * 0.2})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // draw particles
      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        const color = p.hue === 190
          ? `rgba(0, 212, 255, ${p.opacity})`
          : `rgba(167, 139, 250, ${p.opacity})`;
        ctx.fillStyle = color;
        ctx.fill();

        // mini glow
        if (p.r > 1) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r * 2.5, 0, Math.PI * 2);
          const glowColor = p.hue === 190
            ? `rgba(0, 212, 255, ${p.opacity * 0.15})`
            : `rgba(167, 139, 250, ${p.opacity * 0.15})`;
          ctx.fillStyle = glowColor;
          ctx.fill();
        }
      }

      // mouse glow
      if (mx > 0 && my > 0) {
        const grad = ctx.createRadialGradient(mx, my, 0, mx, my, 200);
        grad.addColorStop(0, 'rgba(0, 212, 255, 0.08)');
        grad.addColorStop(0.5, 'rgba(167, 139, 250, 0.03)');
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.fillRect(mx - 200, my - 200, 400, 400);
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouse);
      window.removeEventListener('mouseleave', handleLeave);
      window.removeEventListener('click', handleClick);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div style={{
      position: 'fixed', inset: 0,
      zIndex: 0, pointerEvents: 'none',
      overflow: 'hidden',
    }}>
      {/* ── Base Layer ── */}
      <div style={{
        position: 'absolute', inset: 0,
        background: '#020212',
      }} />

      {/* ── Dynamic Motion Orbs ── */}
      <motion.div
        animate={{
          x: [-100, 100, -50],
          y: [-50, 50, 100],
          scale: [1, 1.2, 0.9],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
        }}
        style={{
          position: 'absolute', top: '10%', left: '15%',
          width: '50vw', height: '50vw',
          background: 'radial-gradient(circle, rgba(0, 212, 255, 0.08) 0%, transparent 70%)',
          filter: 'blur(120px)',
          borderRadius: '50%',
        }}
      />

      <motion.div
        animate={{
          x: [100, -100, 50],
          y: [100, -50, -100],
          scale: [1.1, 0.8, 1.2],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
        }}
        style={{
          position: 'absolute', bottom: '15%', right: '10%',
          width: '45vw', height: '45vw',
          background: 'radial-gradient(circle, rgba(167, 139, 250, 0.06) 0%, transparent 70%)',
          filter: 'blur(100px)',
          borderRadius: '50%',
        }}
      />

      <motion.div
        animate={{
          opacity: [0.1, 0.3, 0.1],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{
          position: 'absolute', top: '40%', left: '50%',
          width: '30vw', height: '30vw',
          background: 'radial-gradient(circle, rgba(245, 158, 11, 0.04) 0%, transparent 70%)',
          filter: 'blur(150px)',
          borderRadius: '50%',
        }}
      />

      {/* ── Grid Overlay ── */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage:
          'linear-gradient(rgba(255,255,255,.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.015) 1px, transparent 1px)',
        backgroundSize: '100px 100px',
        opacity: 0.5,
      }} />

      {/* ── Interactive Canvas ── */}
      <canvas
        ref={canvasRef}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', mixBlendMode: 'screen' }}
      />
    </div>
  );
};

export default ParallaxBG;
