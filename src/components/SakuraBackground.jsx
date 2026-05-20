import React, { useEffect, useRef } from 'react';

export const SakuraBackground = ({ theme = 'kyoto' }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Dynamic coloring based on active theme
    // Kyoto = crimson/cherry blossom, Tokyo = electric magenta glow, Anime = bright pastel pink
    let petalColor = 'rgba(255, 183, 197, 0.7)'; // Default Kyoto soft pink
    let secondaryColor = 'rgba(255, 140, 160, 0.5)';
    if (theme === 'tokyo') {
      petalColor = 'rgba(236, 72, 153, 0.45)'; // Electric hot pink (glowy)
      secondaryColor = 'rgba(168, 85, 247, 0.3)'; // Electric purple
    } else if (theme === 'anime') {
      petalColor = 'rgba(255, 192, 203, 0.8)'; // Pastel cherry pink
      secondaryColor = 'rgba(255, 218, 224, 0.6)';
    }

    const petalCount = Math.min(60, Math.floor((width * height) / 25000));
    const petals = [];

    class Petal {
      constructor() {
        this.reset();
        this.y = Math.random() * height; // Start spread out initially
      }

      reset() {
        this.x = Math.random() * width;
        this.y = -20;
        this.size = Math.random() * 8 + 6;
        this.speedY = Math.random() * 1.2 + 0.8;
        this.speedX = Math.random() * 1.5 - 0.5;
        this.rotation = Math.random() * 360;
        this.rotationSpeed = Math.random() * 1.5 - 0.75;
        this.opacity = Math.random() * 0.4 + 0.5;
        this.wobble = Math.random() * 2 * Math.PI;
        this.wobbleSpeed = Math.random() * 0.02 + 0.01;
        this.color = Math.random() > 0.4 ? petalColor : secondaryColor;
      }

      update(mouseX, mouseY) {
        this.y += this.speedY;
        this.x += this.speedX + Math.sin(this.wobble) * 0.4;
        this.wobble += this.wobbleSpeed;
        this.rotation += this.rotationSpeed;

        // Repel from cursor
        if (mouseX !== undefined && mouseY !== undefined) {
          const dx = this.x - mouseX;
          const dy = this.y - mouseY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            const force = (150 - dist) / 150;
            this.x += (dx / dist) * force * 5;
            this.y += (dy / dist) * force * 3;
          }
        }

        // Wrap around borders
        if (this.y > height + 20 || this.x < -20 || this.x > width + 20) {
          this.reset();
        }
      }

      draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate((this.rotation * Math.PI) / 180);
        ctx.beginPath();
        
        // Draw sakura petal shape using bezier curves
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(-this.size, -this.size / 2, -this.size, this.size, 0, this.size);
        ctx.bezierCurveTo(this.size, this.size, this.size, -this.size / 2, 0, 0);
        
        ctx.fillStyle = this.color;
        ctx.shadowColor = this.color;
        // Glow in dark mode (Tokyo theme)
        ctx.shadowBlur = theme === 'tokyo' ? 8 : 0;
        ctx.fill();
        ctx.restore();
      }
    }

    // Initialize particles
    for (let i = 0; i < petalCount; i++) {
      petals.push(new Petal());
    }

    let mouseX, mouseY;
    const handleMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const handleMouseLeave = () => {
      mouseX = undefined;
      mouseY = undefined;
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Loop
    const tick = () => {
      ctx.clearRect(0, 0, width, height);

      // Add a subtle gradient layer depending on themes
      if (theme === 'kyoto') {
        const grad = ctx.createRadialGradient(width / 2, height / 2, 10, width / 2, height / 2, Math.max(width, height));
        grad.addColorStop(0, 'rgba(253, 251, 247, 0.01)');
        grad.addColorStop(1, 'rgba(235, 227, 213, 0.15)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
      } else if (theme === 'tokyo') {
        const grad = ctx.createRadialGradient(width / 2, height / 2, 10, width / 2, height / 2, Math.max(width, height));
        grad.addColorStop(0, 'rgba(15, 10, 25, 0.01)');
        grad.addColorStop(1, 'rgba(8, 5, 15, 0.25)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
      }

      petals.forEach((petal) => {
        petal.update(mouseX, mouseY);
        petal.draw();
      });

      animationFrameId = requestAnimationFrame(tick);
    };

    tick();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('resize', handleResize);
    };
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0 transition-colors duration-1000"
    />
  );
};
