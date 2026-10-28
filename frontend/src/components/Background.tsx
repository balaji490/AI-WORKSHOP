import React from 'react';

// Simple full‑screen gradient background with optional subtle particle effect.
// For performance we keep it lightweight – a gradient div plus an optional canvas.
// The particle canvas can be added later if desired, respecting prefers‑reduced‑motion.

const Background: React.FC = () => {
  return (
    <div className="fixed inset-0 -z-10 bg-gradient-to-br from-[#0a0e1a] via-[#1a1040] to-[#0f172a]" aria-hidden="true">
      {/* Optional subtle animated overlay – hidden on reduced motion */}
      <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
        backgroundImage: 'linear-gradient(rgba(139,92,246,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.3) 1px, transparent 1px)',
        backgroundSize: '60px 60px',
        animation: 'gradientShift 15s ease infinite',
      }} />
    </div>
  );
};

export default Background;
