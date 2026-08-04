import { useEffect, useState, useRef } from "react";

export default function SpiderCursor({ enabled }: { enabled: boolean }) {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [isMoving, setIsMoving] = useState(false);
  const [twitchPhase, setTwitchPhase] = useState(0);
  const requestRef = useRef<number | null>(null);
  const lastMousePos = useRef({ x: 0, y: 0 });
  const targetPos = useRef({ x: -100, y: -100 });
  const velocity = useRef(0);

  useEffect(() => {
    if (!enabled) {
      document.body.classList.remove("custom-cursor-active");
      return;
    }

    // Add CSS class to hide default cursor
    document.body.classList.add("custom-cursor-active");

    const handleMouseMove = (e: MouseEvent) => {
      targetPos.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener("mousemove", handleMouseMove);

    // Smooth cursor trailing with animation loop
    const updateCursor = () => {
      setPosition((prev) => {
        const dx = targetPos.current.x - prev.x;
        const dy = targetPos.current.y - prev.y;
        
        // Calculate velocity for leg movement
        const currentVelocity = Math.sqrt(dx * dx + dy * dy);
        velocity.current = currentVelocity;
        
        if (currentVelocity > 1) {
          setIsMoving(true);
        } else {
          setIsMoving(false);
        }

        // Lerp position for cinematic trailing lag
        return {
          x: prev.x + dx * 0.22,
          y: prev.y + dy * 0.22,
        };
      });

      // Leg twitch loop when stationary
      setTwitchPhase((prev) => (prev + 0.1) % (Math.PI * 2));

      requestRef.current = requestAnimationFrame(updateCursor);
    };

    requestRef.current = requestAnimationFrame(updateCursor);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      document.body.classList.remove("custom-cursor-active");
    };
  }, [enabled]);

  if (!enabled) return null;

  // Leg offsets and rotations
  // Moving: fast swing. Stationary: gentle periodic twitches
  const getLegStyle = (index: number, isRight: boolean) => {
    const baseAngle = isRight ? (index - 1.5) * 18 : 180 - (index - 1.5) * 18;
    
    // Calculate swing angle based on speed or idle twitches
    let swing = 0;
    if (isMoving) {
      // Crawling swing animation
      swing = Math.sin(Date.now() * 0.015 + index * 1.2) * 18;
    } else {
      // Idle random twitching
      swing = Math.sin(twitchPhase * 2 + index) * 4 * (Math.sin(twitchPhase) > 0.8 ? 1.5 : 0.2);
    }

    const angle = baseAngle + swing;

    return {
      transform: `rotate(${angle}deg)`,
      transformOrigin: isRight ? "left center" : "right center",
    };
  };

  return (
    <div
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: "translate(-50%, -50%)",
      }}
      className="fixed pointer-events-none z-[999999] w-6 h-6 flex items-center justify-center transition-opacity duration-300"
    >
      <div className="relative w-2 h-2.5 bg-spider-red rounded-full shadow-lg shadow-spider-red/40">
        {/* Spider Head */}
        <div className="absolute top-[-2px] left-[1.5px] w-1 h-1 bg-white rounded-full opacity-90" />
        <div className="absolute top-[-2px] right-[1.5px] w-1 h-1 bg-white rounded-full opacity-90" />

        {/* Left Legs */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 flex flex-col space-y-[2px]">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={`left-leg-${i}`}
              className="absolute right-full w-2.5 h-[1px] bg-white opacity-85 origin-right transition-transform duration-75"
              style={getLegStyle(i, false)}
            />
          ))}
        </div>

        {/* Right Legs */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col space-y-[2px]">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={`right-leg-${i}`}
              className="absolute left-full w-2.5 h-[1px] bg-white opacity-85 origin-left transition-transform duration-75"
              style={getLegStyle(i, true)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
