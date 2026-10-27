// High-performance canvas-free & dependency-free celebration confetti for CampusSphere
// Uses fluid physics, devicePixelRatio scaling, and prefers-reduced-motion safety

export function fireSuccessBurst(customOptions = {}) {
  if (typeof window === 'undefined') return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  const canvas = document.createElement('canvas');
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '99999';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const width = window.innerWidth;
  const height = window.innerHeight;

  canvas.width = width * dpr;
  canvas.height = height * dpr;
  ctx.scale(dpr, dpr);

  // Amrita Crimson, Emerald, Amber, Royal Violet, Azure Gold
  const colors = customOptions.colors || [
    '#a51c30', // Amrita Crimson
    '#e0314b', // Vivid Crimson
    '#107e54', // Emerald Mint
    '#22c55e', // Vibrant Green
    '#f59e0b', // Amber Gold
    '#3b82f6', // Azure Blue
    '#8b5cf6', // Amrita Violet
    '#ffffff', // Crisp Pearl
  ];

  const particleCount = customOptions.count || 160;
  const particles = [];

  for (let i = 0; i < particleCount; i++) {
    const angle = (Math.PI / 2) + (Math.random() - 0.5) * (Math.PI * 0.9); // Upward cone
    const speed = 12 + Math.random() * 24;
    particles.push({
      x: width * 0.5 + (Math.random() - 0.5) * 80,
      y: height * 0.65,
      vx: Math.cos(angle) * speed * (Math.random() > 0.5 ? 1 : -1) * (0.6 + Math.random() * 0.8),
      vy: -Math.abs(Math.sin(angle) * speed),
      size: 5 + Math.random() * 6,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 14,
      gravity: 0.52 + Math.random() * 0.2,
      drag: 0.965,
      alpha: 1,
      decay: 0.008 + Math.random() * 0.012,
      shape: Math.random() > 0.4 ? 'rect' : 'circle',
    });
  }

  let animationFrameId;

  function render() {
    ctx.clearRect(0, 0, width, height);
    let activeCount = 0;

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      if (p.alpha <= 0.01) continue;

      activeCount++;
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.vx *= p.drag;
      p.vy *= p.drag;
      p.rotation += p.rotSpeed;
      p.alpha -= p.decay;

      ctx.save();
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.fillStyle = p.color;

      if (p.shape === 'rect') {
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }

    if (activeCount > 0) {
      animationFrameId = requestAnimationFrame(render);
    } else {
      cancelAnimationFrame(animationFrameId);
      if (canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
      }
    }
  }

  render();
}
