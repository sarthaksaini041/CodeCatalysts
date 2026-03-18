import React, { useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

const ParallaxBG = () => {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: -500, y: -500 });
  const particlesRef = useRef([]);
  const wavesRef = useRef([]);
  const rafRef = useRef(null);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (shouldReduceMotion) return undefined;

    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const ctx = canvas.getContext('2d', { alpha: true, desynchronized: true });
    if (!ctx) return undefined;

    const coarsePointer = window.matchMedia('(pointer: coarse)').matches;
    const connectionDistance = coarsePointer ? 140 : 175;
    const mouseRadius = coarsePointer ? 0 : 150;

    let width = window.innerWidth;
    let height = window.innerHeight;

    const getParticleCount = () => {
      const density = coarsePointer ? 22000 : 14000;
      const maxCount = coarsePointer ? 40 : 72;
      const minCount = coarsePointer ? 18 : 28;
      return Math.max(minCount, Math.min(Math.floor((width * height) / density), maxCount));
    };

    const createParticle = () => {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 0.1 + 0.03;
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        baseVx: Math.cos(angle) * speed,
        baseVy: Math.sin(angle) * speed,
        pushVx: 0,
        pushVy: 0,
        r: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.45 + 0.18,
        hue: Math.random() > 0.5 ? 190 : 260,
      };
    };

    const seedScene = () => {
      particlesRef.current = Array.from({ length: getParticleCount() }, createParticle);
      wavesRef.current = [];
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seedScene();
    };

    const handleMouse = (event) => {
      mouseRef.current.x = event.clientX;
      mouseRef.current.y = event.clientY;
    };

    const handleLeave = () => {
      mouseRef.current.x = -500;
      mouseRef.current.y = -500;
    };

    const handleClick = (event) => {
      wavesRef.current.push({
        x: event.clientX,
        y: event.clientY,
        radius: 0,
        opacity: 0.7,
        speed: 8,
      });
    };

    const stop = () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      const particles = particlesRef.current;
      const waves = wavesRef.current;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      for (const particle of particles) {
        const dx = particle.x - mx;
        const dy = particle.y - my;
        const distance = Math.hypot(dx, dy);

        if (mouseRadius > 0 && distance < mouseRadius && distance > 0) {
          const force = (mouseRadius - distance) / mouseRadius;
          const power = force * 0.35;
          particle.pushVx += (dx / distance) * power;
          particle.pushVy += (dy / distance) * power;
        }

        particle.pushVx *= 0.95;
        particle.pushVy *= 0.95;
        particle.x += particle.baseVx + particle.pushVx;
        particle.y += particle.baseVy + particle.pushVy;

        if (particle.x < -100) particle.x = width + 100;
        if (particle.x > width + 100) particle.x = -100;
        if (particle.y < -100) particle.y = height + 100;
        if (particle.y > height + 100) particle.y = -100;
      }

      for (let i = 0; i < particles.length; i += 1) {
        for (let j = i + 1; j < particles.length; j += 1) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.hypot(dx, dy);

          if (distance < connectionDistance) {
            const alpha = (1 - distance / connectionDistance) * 0.12;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(0, 212, 255, ${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      for (let i = waves.length - 1; i >= 0; i -= 1) {
        const wave = waves[i];
        wave.radius += wave.speed;
        wave.opacity -= 0.01;

        if (wave.opacity <= 0) {
          waves.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(wave.x, wave.y, wave.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(0, 212, 255, ${wave.opacity * 0.2})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      for (const particle of particles) {
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.r, 0, Math.PI * 2);
        const fillColor = particle.hue === 190
          ? `rgba(0, 212, 255, ${particle.opacity})`
          : `rgba(167, 139, 250, ${particle.opacity})`;
        ctx.fillStyle = fillColor;
        ctx.fill();

        if (particle.r > 1) {
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.r * 2.4, 0, Math.PI * 2);
          const glowColor = particle.hue === 190
            ? `rgba(0, 212, 255, ${particle.opacity * 0.12})`
            : `rgba(167, 139, 250, ${particle.opacity * 0.12})`;
          ctx.fillStyle = glowColor;
          ctx.fill();
        }
      }

      if (mx > 0 && my > 0) {
        const gradient = ctx.createRadialGradient(mx, my, 0, mx, my, 200);
        gradient.addColorStop(0, 'rgba(0, 212, 255, 0.08)');
        gradient.addColorStop(0.5, 'rgba(167, 139, 250, 0.03)');
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.fillRect(mx - 200, my - 200, 400, 400);
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    const start = () => {
      if (document.visibilityState === 'hidden' || rafRef.current !== null) return;
      rafRef.current = requestAnimationFrame(animate);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        stop();
      } else {
        start();
      }
    };

    resize();
    window.addEventListener('resize', resize, { passive: true });
    window.addEventListener('mousemove', handleMouse, { passive: true });
    window.addEventListener('mouseleave', handleLeave, { passive: true });
    if (!coarsePointer) {
      window.addEventListener('click', handleClick, { passive: true });
    }
    document.addEventListener('visibilitychange', handleVisibilityChange);
    start();

    return () => {
      stop();
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouse);
      window.removeEventListener('mouseleave', handleLeave);
      window.removeEventListener('click', handleClick);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [shouldReduceMotion]);

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 0,
      pointerEvents: 'none',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute',
        inset: 0,
        background: '#020212',
      }} />

      <motion.div
        animate={shouldReduceMotion ? undefined : {
          x: [-100, 100, -50],
          y: [-50, 50, 100],
          scale: [1, 1.2, 0.9],
        }}
        transition={shouldReduceMotion ? undefined : {
          duration: 20,
          repeat: Infinity,
          repeatType: 'reverse',
          ease: 'easeInOut',
        }}
        style={{
          position: 'absolute',
          top: '10%',
          left: '15%',
          width: '50vw',
          height: '50vw',
          background: 'radial-gradient(circle, rgba(0, 212, 255, 0.08) 0%, transparent 70%)',
          filter: 'blur(120px)',
          borderRadius: '50%',
        }}
      />

      <motion.div
        animate={shouldReduceMotion ? undefined : {
          x: [100, -100, 50],
          y: [100, -50, -100],
          scale: [1.1, 0.8, 1.2],
        }}
        transition={shouldReduceMotion ? undefined : {
          duration: 25,
          repeat: Infinity,
          repeatType: 'reverse',
          ease: 'easeInOut',
        }}
        style={{
          position: 'absolute',
          bottom: '15%',
          right: '10%',
          width: '45vw',
          height: '45vw',
          background: 'radial-gradient(circle, rgba(167, 139, 250, 0.06) 0%, transparent 70%)',
          filter: 'blur(100px)',
          borderRadius: '50%',
        }}
      />

      <motion.div
        animate={shouldReduceMotion ? undefined : {
          opacity: [0.1, 0.3, 0.1],
        }}
        transition={shouldReduceMotion ? undefined : {
          duration: 15,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{
          position: 'absolute',
          top: '40%',
          left: '50%',
          width: '30vw',
          height: '30vw',
          background: 'radial-gradient(circle, rgba(245, 158, 11, 0.04) 0%, transparent 70%)',
          filter: 'blur(150px)',
          borderRadius: '50%',
        }}
      />

      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage:
          'linear-gradient(rgba(255,255,255,.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.015) 1px, transparent 1px)',
        backgroundSize: '100px 100px',
        opacity: shouldReduceMotion ? 0.32 : 0.5,
      }} />

      {!shouldReduceMotion && (
        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            mixBlendMode: 'screen',
          }}
        />
      )}
    </div>
  );
};

export default ParallaxBG;
