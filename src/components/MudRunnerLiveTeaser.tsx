import React, { useEffect, useRef, useState } from 'react';
import { sounds } from '../audio/soundEffects';

interface MudRunnerLiveTeaserProps {
  selectedCharacterName: string;
}

export const MudRunnerLiveTeaser: React.FC<MudRunnerLiveTeaserProps> = ({
  selectedCharacterName,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [distance, setDistance] = useState(140);
  const [mudDistance, setMudDistance] = useState(24);
  const [isJumping, setIsJumping] = useState(false);
  const [lives, setLives] = useState(6);
  const [lastActionMsg, setLastActionMsg] = useState<string | null>(null);

  // Jump control (Salto alto potenciado)
  const triggerJump = () => {
    if (isJumping) return;
    setIsJumping(true);
    sounds.playJump();
    setLastActionMsg('¡Gran Salto Alto! 🐾 +18m');
    setMudDistance((prev) => Math.min(35, prev + 3));
    setTimeout(() => {
      setIsJumping(false);
    }, 620);
    setTimeout(() => {
      setLastActionMsg(null);
    }, 1200);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        triggerJump();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isJumping]);

  // Canvas animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let frame = 0;

    // Splatter particles
    const particles: { x: number; y: number; vx: number; vy: number; size: number; alpha: number; color: string }[] = [];

    // Terrain puddles
    const puddles = [
      { x: 300, w: 60 },
      { x: 650, w: 80 },
      { x: 1000, w: 50 },
    ];

    const render = () => {
      frame++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const w = canvas.width;
      const h = canvas.height;
      const groundY = h - 55;

      // 1. Sky & Countryside Sunset Gradient (Atardecer en el campo)
      const skyGrad = ctx.createLinearGradient(0, 0, 0, groundY);
      skyGrad.addColorStop(0, '#38bdf8');   // Azul cielo claro
      skyGrad.addColorStop(0.32, '#7dd3fc'); // Celeste suave
      skyGrad.addColorStop(0.58, '#fde68a'); // Dorado suave de atardecer
      skyGrad.addColorStop(0.82, '#fb923c'); // Naranja cálido de poniente
      skyGrad.addColorStop(1.0, '#f97316');  // Tonos cálidos dorados/naranjas en el horizonte
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, h);

      // Sol poniente en el horizonte
      const sunX = w * 0.75;
      const sunY = groundY - 50;
      const sunGlow = ctx.createRadialGradient(sunX, sunY, 8, sunX, sunY, 70);
      sunGlow.addColorStop(0, 'rgba(254, 240, 138, 0.95)');
      sunGlow.addColorStop(0.4, 'rgba(251, 146, 60, 0.5)');
      sunGlow.addColorStop(1, 'rgba(251, 146, 60, 0)');
      ctx.fillStyle = sunGlow;
      ctx.beginPath();
      ctx.arc(sunX, sunY, 70, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(sunX, sunY, 20, 0, Math.PI * 2);
      ctx.fill();

      // Colinas campestres distantes bañadas por luz dorada
      ctx.fillStyle = '#4d7c0f';
      ctx.beginPath();
      ctx.moveTo(0, groundY);
      for (let x = 0; x <= w; x += 40) {
        const peakY = groundY - 60 - Math.sin((x + frame * 0.4) * 0.012) * 28;
        ctx.lineTo(x, peakY);
      }
      ctx.lineTo(w, groundY);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Colinas verdes cercanas con arboledas
      ctx.fillStyle = '#15803d';
      ctx.beginPath();
      ctx.moveTo(0, groundY);
      for (let x = 0; x <= w; x += 25) {
        const fY = groundY - 35 - Math.cos((x + frame * 0.9) * 0.02) * 16;
        ctx.lineTo(x, fY);
      }
      ctx.lineTo(w, groundY);
      ctx.closePath();
      ctx.fill();

      // Árboles campestres
      ctx.fillStyle = '#166534';
      for (let t = 0; t < 5; t++) {
        const treeX = ((w + 100 - ((frame * 1.5 + t * 150) % (w + 180)))) - 40;
        const treeBaseY = groundY - 20;
        ctx.beginPath();
        ctx.arc(treeX, treeBaseY - 18, 13, 0, Math.PI * 2);
        ctx.arc(treeX - 8, treeBaseY - 12, 10, 0, Math.PI * 2);
        ctx.arc(treeX + 8, treeBaseY - 12, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#78350f';
        ctx.fillRect(treeX - 2, treeBaseY - 6, 4, 8);
        ctx.fillStyle = '#166534';
      }

      // 2. Suelo / Plataforma: Pasto verde de campo
      const groundGrad = ctx.createLinearGradient(0, groundY, 0, h);
      groundGrad.addColorStop(0, '#22c55e');    // Césped verde brillante superior
      groundGrad.addColorStop(0.15, '#16a34a'); // Verde hierba campo
      groundGrad.addColorStop(0.4, '#15803d');  // Verde bosque profundo
      groundGrad.addColorStop(0.75, '#166534'); // Base de raíces y tierra
      groundGrad.addColorStop(1, '#14532d');
      ctx.fillStyle = groundGrad;
      ctx.fillRect(0, groundY, w, h - groundY);

      // Borde de pasto verde fresco
      ctx.strokeStyle = '#4ade80';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, groundY);
      ctx.lineTo(w, groundY);
      ctx.stroke();

      // Briznas de pasto
      ctx.fillStyle = '#86efac';
      for (let i = 0; i < 20; i++) {
        const grassX = ((frame * 6 + i * 36) % (w + 40)) - 10;
        const grassSway = Math.sin((frame * 0.2 + i)) * 3;
        ctx.beginPath();
        ctx.moveTo(w - grassX, groundY + 1);
        ctx.lineTo(w - grassX - 3 + grassSway, groundY - 6);
        ctx.lineTo(w - grassX + 2, groundY + 1);
        ctx.fill();
      }

      // Florecillas silvestres campestres en el pasto
      for (let f = 0; f < 6; f++) {
        const flowerX = ((frame * 5 + f * 110) % (w + 60)) - 10;
        const flowerY = groundY + 8 + (f % 3) * 8;
        ctx.fillStyle = f % 2 === 0 ? '#ffffff' : '#fef08a';
        ctx.beginPath();
        ctx.arc(w - flowerX, flowerY, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(w - flowerX, flowerY, 1, 0, Math.PI * 2);
        ctx.fill();
      }

      // Mud puddles scrolling
      puddles.forEach((p) => {
        p.x -= 4;
        if (p.x < -100) p.x = w + 150 + Math.random() * 200;
        ctx.fillStyle = '#3f1f0a';
        ctx.beginPath();
        ctx.ellipse(p.x, groundY + 8, p.w / 2, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#271206';
        ctx.stroke();
      });

      // 3. Torrente de Agua Azul Generando el Alud de Lodo
      const mudWaveWidth = 140 + Math.sin(frame * 0.08) * 15;
      const waterWaveWidth = mudWaveWidth * 0.65;

      // 3a. Torrente de Agua Azul
      const waterGrad = ctx.createLinearGradient(0, 0, waterWaveWidth, 0);
      waterGrad.addColorStop(0, '#0369a1');
      waterGrad.addColorStop(0.4, '#0284c7');
      waterGrad.addColorStop(0.8, '#38bdf8');
      waterGrad.addColorStop(1, 'rgba(186, 230, 253, 0.4)');
      ctx.fillStyle = waterGrad;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(waterWaveWidth * 0.7, 0);
      for (let y = 0; y <= h; y += 15) {
        const wOffset = Math.sin((y * 0.06) + frame * 0.18) * 14 + Math.cos(frame * 0.14) * 6;
        ctx.lineTo(waterWaveWidth + wOffset, y);
      }
      ctx.lineTo(0, h);
      ctx.closePath();
      ctx.fill();

      // Cresta de espuma blanca de agua azul
      ctx.strokeStyle = '#e0f2fe';
      ctx.lineWidth = 3;
      ctx.beginPath();
      for (let y = 0; y <= groundY; y += 15) {
        const wOffset = Math.sin((y * 0.06) + frame * 0.18) * 14 + Math.cos(frame * 0.14) * 6;
        if (y === 0) ctx.moveTo(waterWaveWidth + wOffset, y);
        else ctx.lineTo(waterWaveWidth + wOffset, y);
      }
      ctx.stroke();

      // 3b. Masa de Lodo Generada por el Agua
      const mudGrad = ctx.createLinearGradient(waterWaveWidth * 0.4, 0, mudWaveWidth, 0);
      mudGrad.addColorStop(0, 'rgba(28, 16, 6, 0.95)');
      mudGrad.addColorStop(0.7, '#451a03');
      mudGrad.addColorStop(0.95, '#78350f');
      mudGrad.addColorStop(1, 'rgba(120, 53, 15, 0.1)');

      ctx.fillStyle = mudGrad;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(mudWaveWidth * 0.7, 0);

      // Violent churning wave face
      for (let y = 0; y <= h; y += 15) {
        const waveOffset = Math.sin((y * 0.05) + frame * 0.12) * 18 + Math.cos(frame * 0.15) * 10;
        ctx.lineTo(mudWaveWidth + waveOffset, y);
      }
      ctx.lineTo(0, h);
      ctx.closePath();
      ctx.fill();

      // Wave foam / mud spray crest
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 4;
      ctx.beginPath();
      for (let y = 0; y <= groundY; y += 20) {
        const waveOffset = Math.sin((y * 0.05) + frame * 0.12) * 18 + Math.cos(frame * 0.15) * 10;
        if (y === 0) ctx.moveTo(mudWaveWidth + waveOffset, y);
        else ctx.lineTo(mudWaveWidth + waveOffset, y);
      }
      ctx.stroke();

      // Droplets spawning from water & mud wave
      if (frame % 2 === 0) {
        particles.push({
          x: mudWaveWidth + 10,
          y: Math.random() * (groundY - 30) + 30,
          vx: Math.random() * 4 + 2,
          vy: (Math.random() - 0.5) * 4,
          size: Math.random() * 6 + 3,
          alpha: 0.9,
          color: Math.random() > 0.4 ? (Math.random() > 0.5 ? '#92400e' : '#b45309') : '#38bdf8',
        });
      }

      // 4. Update and draw mud particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const pt = particles[i];
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.vy += 0.15; // gravity
        pt.alpha -= 0.02;

        if (pt.alpha <= 0 || pt.x > w || pt.y > h) {
          particles.splice(i, 1);
          continue;
        }

        ctx.fillStyle = pt.color;
        ctx.globalAlpha = Math.max(0, pt.alpha);
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
      }

      // 5. Runner Character
      const runnerX = w * 0.62;
      const runnerBaseY = groundY - 2;
      // Jump parabolic trajectory (Salto alto potenciado)
      const jumpProgress = isJumping ? Math.sin((frame % 30) / 30 * Math.PI) * 75 : 0;
      const runnerY = runnerBaseY - jumpProgress;

      // Runner shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.beginPath();
      ctx.ellipse(runnerX, groundY + 2, 18 - (jumpProgress * 0.15), 5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Runner Sprite Animation (Niña aventurera en el campo)
      const legPhase = Math.sin(frame * 0.28);
      const hairSway = Math.sin(frame * 0.28) * 4;

      // Piernas con calzas deportivas celestes y zapatillas
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 4.5;
      ctx.lineCap = 'round';

      // Pierna izquierda
      ctx.beginPath();
      ctx.moveTo(runnerX, runnerY - 20);
      ctx.lineTo(runnerX + legPhase * 16, runnerY - 2);
      ctx.stroke();

      // Zapatilla izquierda
      ctx.fillStyle = '#f43f5e';
      ctx.beginPath();
      ctx.ellipse(runnerX + legPhase * 16 + 2, runnerY - 2, 5.5, 3.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Pierna derecha
      ctx.beginPath();
      ctx.moveTo(runnerX, runnerY - 20);
      ctx.lineTo(runnerX - legPhase * 16, runnerY - 2);
      ctx.stroke();

      // Zapatilla derecha
      ctx.fillStyle = '#f43f5e';
      ctx.beginPath();
      ctx.ellipse(runnerX - legPhase * 16 + 2, runnerY - 2, 5.5, 3.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Falda o shorts deportivos
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.moveTo(runnerX - 11, runnerY - 25);
      ctx.lineTo(runnerX + 11, runnerY - 25);
      ctx.lineTo(runnerX + 13, runnerY - 17);
      ctx.lineTo(runnerX - 13, runnerY - 17);
      ctx.closePath();
      ctx.fill();

      // Torso / Remera deportiva rosa de la niña
      ctx.fillStyle = '#ec4899';
      ctx.beginPath();
      ctx.roundRect(runnerX - 10, runnerY - 48, 20, 26, 4);
      ctx.fill();

      // Franja blanca deportiva con estrella dorada
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(runnerX - 7, runnerY - 40, 14, 3);
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.arc(runnerX, runnerY - 39, 2, 0, Math.PI * 2);
      ctx.fill();

      // Brazos animados
      ctx.strokeStyle = '#fed7aa';
      ctx.lineWidth = 3.5;
      ctx.lineCap = 'round';
      // Brazo izquierdo
      ctx.beginPath();
      ctx.moveTo(runnerX - 4, runnerY - 42);
      ctx.lineTo(runnerX - legPhase * 14, runnerY - 28);
      ctx.stroke();
      // Brazo derecho
      ctx.beginPath();
      ctx.moveTo(runnerX + 4, runnerY - 42);
      ctx.lineTo(runnerX + legPhase * 14, runnerY - 28);
      ctx.stroke();

      // Cabeza de la niña
      ctx.fillStyle = '#ffedd5';
      ctx.beginPath();
      ctx.arc(runnerX + 3, runnerY - 58, 10.5, 0, Math.PI * 2);
      ctx.fill();

      // Sonrojo tierno en mejillas
      ctx.fillStyle = 'rgba(244, 63, 94, 0.45)';
      ctx.beginPath();
      ctx.arc(runnerX + 9, runnerY - 56, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Ojo alegre brillante
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.arc(runnerX + 8, runnerY - 59, 1.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(runnerX + 8.5, runnerY - 59.5, 0.7, 0, Math.PI * 2);
      ctx.fill();

      // Sonrisa entusiasta
      ctx.strokeStyle = '#be123c';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(runnerX + 7, runnerY - 55, 2.5, 0.2, Math.PI * 0.8);
      ctx.stroke();

      // Pelo frontal / Flequillo castaño
      ctx.fillStyle = '#7c2d12';
      ctx.beginPath();
      ctx.arc(runnerX + 2, runnerY - 62, 10, Math.PI, 0);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(runnerX - 5, runnerY - 62);
      ctx.quadraticCurveTo(runnerX + 2, runnerY - 58, runnerX + 6, runnerY - 62);
      ctx.quadraticCurveTo(runnerX + 8, runnerY - 57, runnerX + 11, runnerY - 60);
      ctx.fill();

      // Coleta de pelo ondeando al viento (Ponytail dinámica)
      ctx.fillStyle = '#7c2d12';
      ctx.beginPath();
      const ponytailTipX = runnerX - 20 - (isJumping ? 12 : Math.abs(legPhase) * 6);
      const ponytailTipY = runnerY - 60 + hairSway;
      ctx.moveTo(runnerX - 6, runnerY - 62);
      ctx.quadraticCurveTo(runnerX - 14, runnerY - 70 + hairSway * 0.5, ponytailTipX, ponytailTipY);
      ctx.quadraticCurveTo(runnerX - 12, runnerY - 56 + hairSway * 0.5, runnerX - 4, runnerY - 54);
      ctx.closePath();
      ctx.fill();

      // Lazo fucsia en la coleta
      ctx.fillStyle = '#f43f5e';
      ctx.beginPath();
      ctx.arc(runnerX - 6, runnerY - 59, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#f43f5e';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(runnerX - 7, runnerY - 57);
      ctx.lineTo(runnerX - 12, runnerY - 50 + hairSway);
      ctx.stroke();

      // 5b. Perrito Compañero en el Teaser (Corre y salta junto a ella)
      const dogX = runnerX - 36;
      const dogProgress = isJumping ? jumpProgress * 0.92 : 0;
      const dogY = runnerBaseY - dogProgress;

      if (!isJumping) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
        ctx.beginPath();
        ctx.ellipse(dogX + 2, groundY + 2, 12, 3.5, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      const dogLegCycle = !isJumping ? Math.sin(frame * 0.42) : 0.6;
      const tailOsc = Math.sin(frame * 0.5) * 7;
      const earBnc = Math.cos(frame * 0.42) * 3;

      // Patas del perrito
      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = 2.8;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(dogX - 6, dogY - 5);
      ctx.lineTo(dogX - 6 - dogLegCycle * 6, dogY);
      ctx.stroke();

      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(dogX + 8, dogY - 5);
      ctx.lineTo(dogX + 8 + dogLegCycle * 6, dogY);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(dogX - 3, dogY - 5);
      ctx.lineTo(dogX - 3 + dogLegCycle * 6, dogY);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(dogX + 11, dogY - 5);
      ctx.lineTo(dogX + 11 - dogLegCycle * 6, dogY);
      ctx.stroke();

      // Cola alegre
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 3.2;
      ctx.beginPath();
      ctx.moveTo(dogX - 8, dogY - 12);
      ctx.quadraticCurveTo(dogX - 16, dogY - 18 + tailOsc, dogX - 14, dogY - 12 + tailOsc);
      ctx.stroke();

      // Cuerpo
      ctx.fillStyle = '#d97706';
      ctx.beginPath();
      ctx.roundRect(dogX - 9, dogY - 15, 20, 11, 5);
      ctx.fill();

      // Pecho claro
      ctx.fillStyle = '#fef3c7';
      ctx.beginPath();
      ctx.ellipse(dogX + 7, dogY - 11, 3.5, 4.5, 0.2, 0, Math.PI * 2);
      ctx.fill();

      // Cabeza
      ctx.fillStyle = '#d97706';
      ctx.beginPath();
      ctx.arc(dogX + 11, dogY - 17, 7, 0, Math.PI * 2);
      ctx.fill();

      // Hocico
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.roundRect(dogX + 14, dogY - 16, 6, 4.5, 2);
      ctx.fill();

      // Nariz negra
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(dogX + 20, dogY - 14.5, 1.6, 0, Math.PI * 2);
      ctx.fill();

      // Ojo
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(dogX + 12, dogY - 18, 1.4, 0, Math.PI * 2);
      ctx.fill();

      // Oreja floppy
      ctx.fillStyle = '#92400e';
      ctx.beginPath();
      ctx.ellipse(dogX + 7, dogY - 18 + earBnc, 3, 5, -0.3, 0, Math.PI * 2);
      ctx.fill();

      // Collar rojo con medallita
      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.arc(dogX + 10, dogY - 13, 3.5, 0.5, Math.PI * 0.9);
      ctx.stroke();
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(dogX + 12, dogY - 10, 1.8, 0, Math.PI * 2);
      ctx.fill();

      // Globo de ladrido en salto
      if (isJumping) {
        ctx.font = 'bold 10px sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.beginPath();
        ctx.roundRect(dogX - 6, dogY - 36, 48, 16, 4);
        ctx.fill();
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1.2;
        ctx.stroke();
        ctx.fillStyle = '#78350f';
        ctx.fillText('¡Guau! 🐾', dogX - 2, dogY - 24);
      }

      // Footstep grass puffs
      if (!isJumping && frame % 4 === 0) {
        particles.push({
          x: runnerX - 10,
          y: groundY - 2,
          vx: -(Math.random() * 2 + 1),
          vy: -(Math.random() * 1.5 + 0.5),
          size: Math.random() * 4 + 2,
          alpha: 0.7,
          color: Math.random() > 0.4 ? '#4ade80' : '#86efac',
        });
      }

      animId = requestAnimationFrame(render);
    };

    render();

    // Distance ticker
    const distInterval = setInterval(() => {
      setDistance((d) => d + 2);
    }, 120);

    return () => {
      cancelAnimationFrame(animId);
      clearInterval(distInterval);
    };
  }, [isJumping]);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-amber-900/60 bg-stone-900 shadow-2xl shadow-amber-950/40">
      {/* Top HUD inside the preview */}
      <div className="absolute top-0 inset-x-0 z-20 flex items-center justify-between px-4 py-2.5 bg-gradient-to-b from-stone-950/90 via-stone-950/60 to-transparent backdrop-blur-xs">
        {/* Lives indicator (6 vidas) */}
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-wider font-heading font-semibold text-amber-300">
            Vidas Disponibles:
          </span>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5, 6].map((heartIndex) => (
              <span
                key={heartIndex}
                className={`text-base sm:text-lg transition-transform duration-300 ${
                  heartIndex <= lives
                    ? 'text-red-500 scale-100 drop-shadow-[0_0_8px_rgba(239,68,68,0.7)]'
                    : 'text-stone-600 scale-90'
                }`}
                aria-label={`Vida ${heartIndex}`}
              >
                ❤️
              </span>
            ))}
          </div>
          <span className="text-xs font-mono text-stone-400 ml-1">
            ({lives}/6)
          </span>
        </div>

        {/* Meters ran & mud proximity */}
        <div className="flex items-center gap-4 text-xs font-heading">
          <div className="flex items-center gap-1.5 bg-stone-900/80 px-2.5 py-1 rounded-md border border-stone-700/60">
            <span className="text-stone-400">Distancia:</span>
            <span className="font-mono text-amber-400 font-bold text-sm tabular-nums">
              {distance} m
            </span>
          </div>
          <div className="flex items-center gap-1.5 bg-red-950/80 px-2.5 py-1 rounded-md border border-red-800/60">
            <span className="text-red-300">Lodo a:</span>
            <span className="font-mono text-red-400 font-bold text-sm tabular-nums">
              {mudDistance} m
            </span>
          </div>
        </div>
      </div>

      {/* Canvas viewport */}
      <canvas
        ref={canvasRef}
        width={720}
        height={260}
        className="w-full h-48 sm:h-64 object-cover block cursor-pointer"
        onClick={triggerJump}
        title="Haz clic o presiona Espacio para probar el salto"
      />

      {/* Floating feedback message when jumping */}
      {lastActionMsg && (
        <div className="absolute top-14 right-8 z-20 animate-bounce bg-emerald-500 text-stone-950 font-heading font-bold text-xs px-3 py-1 rounded-md shadow-lg">
          {lastActionMsg}
        </div>
      )}

      {/* Bottom control bar inside the preview */}
      <div className="absolute bottom-0 inset-x-0 z-20 flex flex-wrap items-center justify-between gap-2 px-4 py-2 bg-gradient-to-t from-stone-950/95 via-stone-950/80 to-transparent">
        <div className="flex items-center gap-2 text-xs text-stone-300">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="font-heading font-medium text-amber-200">
            Simulador de Calentamiento en Vivo
          </span>
          <span className="text-stone-500 hidden sm:inline">·</span>
          <span className="text-stone-400 hidden sm:inline">
            Corredor: <strong className="text-stone-200">{selectedCharacterName}</strong>
          </span>
        </div>

        <button
          onClick={triggerJump}
          onMouseEnter={() => sounds.playHover()}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 active:scale-95 text-stone-950 font-heading font-bold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer"
        >
          <span>⬆️ Saltar Charco</span>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-stone-900/40 rounded border border-stone-800">
            ESPACIO
          </kbd>
        </button>
      </div>
    </div>
  );
};
