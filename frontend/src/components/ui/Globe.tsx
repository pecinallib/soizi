import createGlobe from 'cobe';
import { useEffect, useRef } from 'react';

const THETA = 0.2;
const MARKER_R = 0.85; // ee(0.8) + markerElevation(0.05)

interface City {
  name: string;
  lat: number;
  lng: number;
}

const CITIES: City[] = [
  { name: 'New York', lat: 40.7128, lng: -74.006 },
  { name: 'São Paulo', lat: -23.5505, lng: -46.6333 },
  { name: 'Londres', lat: 51.5074, lng: -0.1278 },
  { name: 'Tóquio', lat: 35.6762, lng: 139.6503 },
  { name: 'Singapura', lat: 1.3521, lng: 103.8198 },
  { name: 'Sydney', lat: -33.8688, lng: 151.2093 },
  { name: 'Dubai', lat: 25.2048, lng: 55.2708 },
  { name: 'San Francisco', lat: 37.7595, lng: -122.4367 },
];

// Reprodução exata das funções U() e O() do source do cobe
function project(lat: number, lng: number, phi: number, theta: number) {
  const la = (lat * Math.PI) / 180;
  const lo = (lng * Math.PI) / 180;

  // U(): sistema de coordenadas interno do cobe
  const ux = Math.cos(la) * Math.cos(lo);
  const uy = Math.sin(la);
  const uz = -Math.cos(la) * Math.sin(lo);

  const tx = ux * MARKER_R;
  const ty = uy * MARKER_R;
  const tz = uz * MARKER_R;

  const cp = Math.cos(phi), sp = Math.sin(phi);
  const ct = Math.cos(theta), st = Math.sin(theta);

  // O(): projeção interna do cobe
  const c = cp * tx + sp * tz;
  const s = sp * st * tx + ct * ty - cp * st * tz;
  const z = -sp * ct * tx + st * ty + cp * ct * tz;

  return {
    x: (c + 1) / 2,    // 0→1
    y: (-s + 1) / 2,   // 0→1
    visible: z >= 0,
  };
}

export function Globe(): React.JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const globe = createGlobe(canvas, {
      devicePixelRatio: 2,
      width: 600 * 2,
      height: 600 * 2,
      phi: 0.5,
      theta: THETA,
      dark: 0,
      diffuse: 0.9,
      mapSamples: 20000,
      mapBrightness: 7,
      baseColor: [0.83, 0.9, 0.98],
      markerColor: [0.0, 0.816, 0.518],
      glowColor: [0.86, 0.92, 1.0],
      markers: CITIES.map(({ lat, lng }) => ({
        location: [lat, lng] as [number, number],
        size: 0.05,
      })),
    });

    // cobe envolve o canvas num novo div (position:relative, 100%×100%)
    // As labels precisam ficar DENTRO desse wrapper para usar o mesmo sistema de coordenadas
    const wrapper = canvas.parentElement!;

    // Cria os elementos de label diretamente no DOM do wrapper do cobe
    const labelEls = CITIES.map((city) => {
      const el = document.createElement('div');
      el.style.cssText = [
        'position:absolute',
        'pointer-events:none',
        'user-select:none',
        'opacity:0',
        'transform:translate(-50%, calc(-100% - 8px))',
        'transition:opacity 0.15s ease',
      ].join(';');

      const badge = document.createElement('div');
      badge.style.cssText = [
        'background:rgba(30,41,59,0.88)',
        'backdrop-filter:blur(4px)',
        'color:#fff',
        'font-size:9px',
        'font-weight:700',
        'letter-spacing:0.08em',
        'padding:2px 8px',
        'border-radius:999px',
        'white-space:nowrap',
        'text-transform:uppercase',
        'font-family:inherit',
      ].join(';');
      badge.textContent = city.name;

      const line = document.createElement('div');
      line.style.cssText = 'display:flex;justify-content:center;margin-top:2px';
      const lineInner = document.createElement('div');
      lineInner.style.cssText = 'width:1px;height:7px;background:rgba(30,41,59,0.45)';
      line.append(lineInner);

      el.append(badge, line);
      wrapper.append(el);
      return el;
    });

    const phi = { value: 0.5 };
    let frameId: number;

    const animate = (): void => {
      phi.value += 0.003;
      globe.update({ phi: phi.value });

      CITIES.forEach((city, i) => {
        const { x, y, visible } = project(city.lat, city.lng, phi.value, THETA);
        const el = labelEls[i];
        // Usar % dentro do wrapper do cobe — mesmo sistema de coordenadas que O() usa internamente
        el.style.left = `${x * 100}%`;
        el.style.top = `${y * 100}%`;
        el.style.opacity = visible ? '1' : '0';
      });

      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);
    setTimeout(() => { canvas.style.opacity = '1'; }, 100);

    return () => {
      globe.destroy();
      cancelAnimationFrame(frameId);
      labelEls.forEach((el) => el.remove());
    };
  }, []);

  return (
    <div className="relative w-full" style={{ aspectRatio: '1 / 1' }}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ opacity: 0, transition: 'opacity 1.2s ease' }}
      />
    </div>
  );
}
