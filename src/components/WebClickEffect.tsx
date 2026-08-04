import { useEffect, useState } from "react";

interface WebStrand {
  id: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

interface WebSplat {
  id: string;
  x: number;
  y: number;
  scale: number;
}

interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
}

export default function WebClickEffect() {
  const [strands, setStrands] = useState<WebStrand[]>([]);
  const [splats, setSplats] = useState<WebSplat[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      // Find closest button or interactive element
      const target = e.target as HTMLElement;
      const interactiveEl = target.closest("button, a, select, [role='button'], .clickable");
      
      if (!interactiveEl) return;

      const rect = interactiveEl.getBoundingClientRect();
      const endX = rect.left + rect.width / 2 + window.scrollX;
      const endY = rect.top + rect.height / 2 + window.scrollY;
      const startX = e.pageX;
      const startY = e.pageY;

      const id = `${Date.now()}-${Math.random()}`;

      // 1. Trigger the Web Shoot line
      setStrands((prev) => [...prev, { id, startX, startY, endX, endY }]);

      // 2. Add impact splatter on the target button center
      setTimeout(() => {
        setSplats((prev) => [...prev, { id, x: endX, y: endY, scale: Math.random() * 0.4 + 0.8 }]);
        
        // Generate splash particles
        const newParticles: Particle[] = Array.from({ length: 12 }).map((_, i) => {
          const angle = (i / 12) * Math.PI * 2 + Math.random() * 0.4;
          const speed = Math.random() * 4 + 3;
          return {
            id: `${id}-p-${i}`,
            x: endX,
            y: endY,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: Math.random() * 3 + 1.5,
            color: Math.random() > 0.4 ? "rgba(255, 255, 255, 0.9)" : "rgba(230, 36, 41, 0.8)",
          };
        });
        setParticles((prev) => [...prev, ...newParticles]);
      }, 150); // slight delay for the web line to "travel"

      // 3. Cleanup animations
      setTimeout(() => {
        setStrands((prev) => prev.filter((s) => s.id !== id));
      }, 400);

      setTimeout(() => {
        setSplats((prev) => prev.filter((s) => s.id !== id));
      }, 700);
    };

    window.addEventListener("mousedown", handleClick);

    return () => {
      window.removeEventListener("mousedown", handleClick);
    };
  }, []);

  // Update particles loop
  useEffect(() => {
    if (particles.length === 0) return;

    const interval = setInterval(() => {
      setParticles((prev) =>
        prev
          .map((p) => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            vy: p.vy + 0.15, // gravity effect
            size: Math.max(0, p.size - 0.08),
          }))
          .filter((p) => p.size > 0)
      );
    }, 16);

    return () => clearInterval(interval);
  }, [particles]);

  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-[99999] overflow-hidden">
      {/* 1. Web Shoot lines */}
      {strands.map((s) => {
        const dx = s.endX - s.startX;
        const dy = s.endY - s.startY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);

        return (
          <div
            key={s.id}
            className="absolute origin-left pointer-events-none bg-white/90 shadow-[0_0_8px_rgba(255,255,255,0.8)]"
            style={{
              left: s.startX,
              top: s.startY,
              width: `${distance}px`,
              height: "2px",
              transform: `rotate(${angle}deg) scaleY(${strands.length > 0 ? 1 : 0})`,
              filter: "blur(0.5px)",
              transition: "transform 150ms cubic-bezier(0.19, 1, 0.22, 1)",
              opacity: 0.8,
            }}
          />
        );
      })}

      {/* 2. Web Splats */}
      {splats.map((s) => (
        <div
          key={s.id}
          className="absolute pointer-events-none flex items-center justify-center"
          style={{
            left: s.x,
            top: s.y,
            transform: `translate(-50%, -50%) scale(${s.scale})`,
            transition: "opacity 300ms ease-out",
          }}
        >
          {/* Decorative Web Splatter shape */}
          <div className="relative w-8 h-8 flex items-center justify-center opacity-80 animate-ping">
            <div className="absolute w-6 h-[1.5px] bg-white rotate-0" />
            <div className="absolute w-6 h-[1.5px] bg-white rotate-45" />
            <div className="absolute w-6 h-[1.5px] bg-white rotate-90" />
            <div className="absolute w-6 h-[1.5px] bg-white rotate-135" />
            <div className="w-2 h-2 bg-white rounded-full" />
          </div>
        </div>
      ))}

      {/* 3. Splat Particles */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full shadow-[0_0_4px_rgba(255,255,255,0.6)]"
          style={{
            left: p.x,
            top: p.y,
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.color,
          }}
        />
      ))}
    </div>
  );
}
