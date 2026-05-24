'use client';

import { useRef, useState, type MouseEvent } from 'react';

interface ProductViewer3DProps {
  imageUrl?: string | null;
  name: string;
}

export default function ProductViewer3D({ imageUrl, name }: ProductViewer3DProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState('rotateX(-6deg) rotateY(12deg)');
  const [dragging, setDragging] = useState(false);

  const applyTilt = (e: MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTransform(
      `rotateX(${(-y * 22 - 4).toFixed(1)}deg) rotateY(${(x * 28 + 8).toFixed(1)}deg) translateZ(40px)`,
    );
  };

  return (
    <div className="product-viewer-3d">
      <div className="product-viewer-3d__stage">
        <div className="product-viewer-3d__shadow" aria-hidden />
        <div
          ref={ref}
          className={`product-viewer-3d__card ${dragging ? 'is-dragging' : ''}`}
          onMouseMove={applyTilt}
          onMouseLeave={() => setTransform('rotateX(-6deg) rotateY(12deg) translateZ(20px)')}
          onMouseDown={() => setDragging(true)}
          onMouseUp={() => setDragging(false)}
          style={{ transform }}
        >
          {imageUrl ? (
            <img src={imageUrl} alt={name} className="product-viewer-3d__img" draggable={false} />
          ) : (
            <div className="product-viewer-3d__placeholder">✦</div>
          )}
          <div className="product-viewer-3d__shine" aria-hidden />
        </div>
      </div>
    </div>
  );
}
