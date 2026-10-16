import { useRef, useState } from 'react';
import { swatchBg } from '../utils/swatch.js';

const WALLS = [['#efe6d4', 'Cream'], ['#dfe7e1', 'Sage'], ['#f3f3f1', 'White'], ['#e8d3c4', 'Terracotta']];
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

/**
 * "3D view" user story — CSS 3D version from the prototype.
 * Drag left/right to turn the room, up/down to tilt it.
 *
 * TODO (Sprint 3): replace the .scene with a Three.js canvas
 * (window plane + curtain plane with a bamboo texture + OrbitControls).
 */
export default function Curtain3D({ product }) {
  const [rot, setRot] = useState({ x: -6, y: -22 });
  const [open, setOpen] = useState(70);           // % of the window covered
  const [wall, setWall] = useState(WALLS[0][0]);
  const drag = useRef(null);

  const onPointerDown = (e) => {
    drag.current = { startX: e.clientX, startY: e.clientY, rotX: rot.x, rotY: rot.y };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e) => {
    const d = drag.current;
    if (!d) return;
    setRot({
      y: clamp(d.rotY + (e.clientX - d.startX) * 0.4, -60, 60),
      x: clamp(d.rotX - (e.clientY - d.startY) * 0.2, -25, 10)
    });
  };
  const stop = () => { drag.current = null; };

  const height = Math.round((144 * open) / 100);

  return (
    <div>
      <div className="stage" onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={stop} onPointerCancel={stop}>
        <div className="scene" style={{ transform: `rotateX(${rot.x}deg) rotateY(${rot.y}deg)`, '--wallc': wall }}>
          <div className="lwall" />
          <div className="floor" />
          <div className="wall" />
          <div className="win" />
          <div className="sill" />
          <div className="cur" style={{ height, background: swatchBg({ ...product, images: [] }) }} />
          <div className="roll" />
          <div className="cord" style={{ height: height + 20 }} />
        </div>
        <div className="hint3d">Drag to rotate · 3D preview</div>
      </div>

      <div className="card pad" style={{ marginTop: 12 }}>
        <div className="spread"><b>3D view — see it installed</b><span className="muted small">Next: Three.js model</span></div>
        <div className="field" style={{ marginTop: 10 }}>
          <label htmlFor="roll">Roll up / down</label>
          <input id="roll" type="range" min="10" max="100" value={open} onChange={(e) => setOpen(+e.target.value)} />
        </div>
        <label>Wall colour</label>
        <div className="opt">
          {WALLS.map(([c, n]) => (
            <button key={c} className={wall === c ? 'on' : ''} onClick={() => setWall(c)}>{n}</button>
          ))}
        </div>
      </div>
    </div>
  );
}
