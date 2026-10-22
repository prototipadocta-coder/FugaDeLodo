import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Heart,
  Volume2,
  VolumeX,
  RotateCcw,
  ArrowLeft,
  Pause,
  Play,
  Trophy,
  Zap,
  Sparkles,
  AlertTriangle,
  Flame,
  Shield,
} from 'lucide-react';
import { Character, Difficulty } from '../data/gameData';
import { sounds } from '../audio/soundEffects';

interface MudRunnerGameProps {
  character: Character;
  difficulty: Difficulty;
  onExitToMenu: () => void;
  onSaveHighScore?: (meters: number) => void;
}

interface Obstacle {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'rock' | 'puddle' | 'log' | 'high_branch';
  passed: boolean;
}

interface Collectible {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'coin' | 'water' | 'spring' | 'heart';
  collected: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  color: string;
}

interface FloatingText {
  id: number;
  text: string;
  x: number;
  y: number;
  alpha: number;
  color: string;
}

export const MudRunnerGame: React.FC<MudRunnerGameProps> = ({
  character,
  difficulty,
  onExitToMenu,
  onSaveHighScore,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // React state for HUD
  const [gameState, setGameState] = useState<'PLAYING' | 'PAUSED' | 'GAME_OVER'>('PLAYING');
  const [lives, setLives] = useState(3);
  const [distanceMeters, setDistanceMeters] = useState(0);
  const [mudGapMeters, setMudGapMeters] = useState(35);
  const [coins, setCoins] = useState(0);
  const [gameOverReason, setGameOverReason] = useState<string>('');
  const [isSuperJumpActive, setIsSuperJumpActive] = useState(false);
  const [isMuted, setIsMuted] = useState(sounds.isMuted);

  // References for the 60fps game loop
  const stateRef = useRef({
    gameState: 'PLAYING' as 'PLAYING' | 'PAUSED' | 'GAME_OVER',
    lives: 3,
    distance: 0,
    coins: 0,
    mudGap: 35, // Distance in meters between mud wave and player (0 = eaten)
    baseSpeed: difficulty.id === 'facil' ? 5.5 : difficulty.id === 'normal' ? 7.0 : 8.5,
    currentSpeed: 7.0,
    mudAdvanceRate: difficulty.id === 'facil' ? 0.035 : difficulty.id === 'normal' ? 0.055 : 0.08,
    // Runner state
    runner: {
      x: 180,
      y: 0,
      vy: 0,
      isGrounded: true,
      isJumping: false,
      isSliding: false,
      slideTimer: 0,
      jumpCount: 0,
      maxJumps: character.id === 'lia' ? 2 : 1, // Lía has double jump!
      invulnerableTimer: 0,
      superJumpTimer: 0,
    },
    // Obstacles and items
    obstacles: [] as Obstacle[],
    collectibles: [] as Collectible[],
    particles: [] as Particle[],
    floatingTexts: [] as FloatingText[],
    nextObstacleDist: 400,
    nextItemDist: 250,
    frame: 0,
    screenShake: 0,
    entityCounter: 0,
  });

  // Jump trigger
  const performJump = useCallback(() => {
    const s = stateRef.current;
    if (s.gameState !== 'PLAYING') return;

    const r = s.runner;
    if (r.jumpCount < r.maxJumps) {
      r.isJumping = true;
      r.isGrounded = false;
      r.isSliding = false; // cancel slide
      r.jumpCount++;
      const jumpPower = r.superJumpTimer > 0 ? -14.5 : character.id === 'lia' ? -13.0 : -11.5;
      r.vy = jumpPower;
      sounds.playJump();

      // Jump dust & grass particles
      for (let i = 0; i < 6; i++) {
        s.particles.push({
          x: r.x + 10,
          y: 280,
          vx: -(Math.random() * 3 + 1),
          vy: -(Math.random() * 2),
          size: Math.random() * 5 + 3,
          alpha: 0.8,
          color: Math.random() > 0.4 ? '#4ade80' : '#86efac',
        });
      }
    }
  }, [character.id]);

  // Slide trigger
  const performSlide = useCallback(() => {
    const s = stateRef.current;
    if (s.gameState !== 'PLAYING') return;
    const r = s.runner;
    if (r.isGrounded && !r.isSliding) {
      r.isSliding = true;
      r.slideTimer = 28; // ~0.5s slide
      sounds.playHover();

      // Slide grass particles
      for (let i = 0; i < 5; i++) {
        s.particles.push({
          x: r.x - 5,
          y: 290,
          vx: -(Math.random() * 4 + 2),
          vy: -(Math.random() * 1.5),
          size: Math.random() * 4 + 2,
          alpha: 0.7,
          color: Math.random() > 0.4 ? '#22c55e' : '#4ade80',
        });
      }
    }
  }, []);

  // Keyboard handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        e.preventDefault();
        performJump();
      } else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
        e.preventDefault();
        performSlide();
      } else if (e.code === 'KeyP' || e.code === 'Escape') {
        e.preventDefault();
        togglePause();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [performJump, performSlide]);

  const togglePause = () => {
    const s = stateRef.current;
    if (s.gameState === 'GAME_OVER') return;
    if (s.gameState === 'PLAYING') {
      s.gameState = 'PAUSED';
      setGameState('PAUSED');
      sounds.stopMusic();
    } else if (s.gameState === 'PAUSED') {
      s.gameState = 'PLAYING';
      setGameState('PLAYING');
      sounds.startMusic();
    }
  };

  const restartGame = () => {
    const s = stateRef.current;
    s.gameState = 'PLAYING';
    s.lives = 3;
    s.distance = 0;
    s.coins = 0;
    s.mudGap = 35;
    s.currentSpeed = s.baseSpeed;
    s.runner.y = 0;
    s.runner.vy = 0;
    s.runner.isGrounded = true;
    s.runner.isJumping = false;
    s.runner.isSliding = false;
    s.runner.slideTimer = 0;
    s.runner.jumpCount = 0;
    s.runner.invulnerableTimer = 0;
    s.runner.superJumpTimer = 0;
    s.obstacles = [];
    s.collectibles = [];
    s.particles = [];
    s.floatingTexts = [];
    s.screenShake = 0;
    s.frame = 0;

    setLives(3);
    setDistanceMeters(0);
    setMudGapMeters(35);
    setCoins(0);
    setGameState('PLAYING');
    setIsSuperJumpActive(false);

    sounds.playStartFanfare();
    sounds.startMusic();
  };

  // Main Canvas Game Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    sounds.startMusic();
    let animId: number;

    const gameLoop = () => {
      const s = stateRef.current;

      if (s.gameState === 'PLAYING') {
        s.frame++;
        const groundY = 295;
        const runner = s.runner;

        // 1. Advance distance & calculate speed
        s.distance += Math.round(s.currentSpeed * 0.12);
        // Slowly increase base speed over distance
        const speedBoostFromDist = Math.min(3.5, s.distance * 0.001);
        const targetSpeed = s.baseSpeed + speedBoostFromDist;
        s.currentSpeed += (targetSpeed - s.currentSpeed) * 0.05;

        // Mud wave natural advance
        s.mudGap = Math.max(0, s.mudGap - s.mudAdvanceRate);

        // Check if engulfed by mud
        if (s.mudGap <= 0 && s.lives > 0) {
          s.lives = 0;
          s.gameState = 'GAME_OVER';
          setLives(0);
          setGameState('GAME_OVER');
          setGameOverReason('¡La ola de lodo te atrapó y te engulló por completo!');
          sounds.playMudSplash();
          sounds.playGameOver();
          sounds.stopMusic();
          if (onSaveHighScore) onSaveHighScore(s.distance);
        }

        // 2. Runner Physics
        if (!runner.isGrounded) {
          runner.vy += 0.58; // Gravity
          runner.y += runner.vy;
          if (runner.y >= 0) {
            runner.y = 0;
            runner.vy = 0;
            runner.isGrounded = true;
            runner.isJumping = false;
            runner.jumpCount = 0;
          }
        }

        // Slide timer
        if (runner.isSliding) {
          runner.slideTimer--;
          if (runner.slideTimer <= 0) {
            runner.isSliding = false;
          }
        }

        // Timers
        if (runner.invulnerableTimer > 0) runner.invulnerableTimer--;
        if (runner.superJumpTimer > 0) {
          runner.superJumpTimer--;
          if (runner.superJumpTimer === 0) setIsSuperJumpActive(false);
        }
        if (s.screenShake > 0) s.screenShake--;

        // 3. Spawning Obstacles
        s.nextObstacleDist -= s.currentSpeed;
        if (s.nextObstacleDist <= 0) {
          s.entityCounter++;
          const obstacleTypes: ('rock' | 'puddle' | 'log' | 'high_branch')[] = [
            'rock',
            'puddle',
            'log',
            'high_branch',
          ];
          const chosenType = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];

          let width = 36;
          let height = 36;
          let y = groundY - height;

          if (chosenType === 'puddle') {
            width = 65;
            height = 16;
            y = groundY - 10;
          } else if (chosenType === 'log') {
            width = 45;
            height = 28;
            y = groundY - height;
          } else if (chosenType === 'high_branch') {
            width = 50;
            height = 45;
            y = groundY - 82; // Must slide under!
          }

          s.obstacles.push({
            id: s.entityCounter,
            x: canvas.width + 50,
            y,
            width,
            height,
            type: chosenType,
            passed: false,
          });

          // Next obstacle spacing based on difficulty
          const spacingMin = difficulty.id === 'extremo' ? 240 : difficulty.id === 'normal' ? 320 : 400;
          s.nextObstacleDist = spacingMin + Math.random() * 220;
        }

        // 4. Spawning Collectibles
        s.nextItemDist -= s.currentSpeed;
        if (s.nextItemDist <= 0) {
          s.entityCounter++;
          const rand = Math.random();
          let itemType: 'coin' | 'water' | 'spring' | 'heart' = 'coin';

          if (rand > 0.88 && s.lives < 3) {
            itemType = 'heart';
          } else if (rand > 0.72) {
            itemType = 'water';
          } else if (rand > 0.6) {
            itemType = 'spring';
          }

          const inAir = Math.random() > 0.4;
          const itemY = inAir ? groundY - 65 : groundY - 32;

          s.collectibles.push({
            id: s.entityCounter,
            x: canvas.width + 60,
            y: itemY,
            width: 26,
            height: 26,
            type: itemType,
            collected: false,
          });

          s.nextItemDist = 200 + Math.random() * 260;
        }

        // 5. Update Obstacles & Check Collisions
        const runnerHitbox = {
          x: runner.x - 12,
          y: groundY - 50 + runner.y + (runner.isSliding ? 25 : 0),
          width: 24,
          height: runner.isSliding ? 25 : 48,
        };

        for (let i = s.obstacles.length - 1; i >= 0; i--) {
          const obs = s.obstacles[i];
          obs.x -= s.currentSpeed;

          // AABB collision detection
          const isColliding =
            runnerHitbox.x < obs.x + obs.width &&
            runnerHitbox.x + runnerHitbox.width > obs.x &&
            runnerHitbox.y < obs.y + obs.height &&
            runnerHitbox.y + runnerHitbox.height > obs.y;

          if (isColliding && runner.invulnerableTimer === 0) {
            // Player takes damage!
            s.lives--;
            setLives(s.lives);
            runner.invulnerableTimer = 80; // ~1.3s invulnerability blink
            s.screenShake = 18;

            // Character perk: Roco loses less mud gap
            const mudPenalty = character.id === 'roco' ? 6 : 11;
            s.mudGap = Math.max(0, s.mudGap - mudPenalty);
            s.currentSpeed = Math.max(3.0, s.currentSpeed - 3.5);

            sounds.playHurt();
            sounds.playMudSplash();

            // Floating text
            s.floatingTexts.push({
              id: Math.random(),
              text: '-1 VIDA',
              x: runner.x,
              y: runnerHitbox.y - 20,
              alpha: 1.0,
              color: '#ef4444',
            });

            // Hit debris particles
            for (let p = 0; p < 12; p++) {
              s.particles.push({
                x: obs.x + obs.width / 2,
                y: obs.y + obs.height / 2,
                vx: (Math.random() - 0.5) * 6,
                vy: -(Math.random() * 4 + 2),
                size: Math.random() * 5 + 3,
                alpha: 0.9,
                color: obs.type === 'puddle' ? '#78350f' : '#ef4444',
              });
            }

            // Check if lives reached 0
            if (s.lives <= 0) {
              s.gameState = 'GAME_OVER';
              setGameState('GAME_OVER');
              setGameOverReason('¡Perdiste tus 3 vidas por los obstáculos del camino!');
              sounds.playGameOver();
              sounds.stopMusic();
              if (onSaveHighScore) onSaveHighScore(s.distance);
            }
          }

          // Despawn offscreen
          if (obs.x < -100) {
            s.obstacles.splice(i, 1);
          }
        }

        // 6. Update Collectibles & Collisions
        for (let i = s.collectibles.length - 1; i >= 0; i--) {
          const item = s.collectibles[i];
          item.x -= s.currentSpeed;

          const isCollected =
            !item.collected &&
            runnerHitbox.x < item.x + item.width &&
            runnerHitbox.x + runnerHitbox.width > item.x &&
            runnerHitbox.y < item.y + item.height &&
            runnerHitbox.y + runnerHitbox.height > item.y;

          if (isCollected) {
            item.collected = true;

            if (item.type === 'coin') {
              s.coins += 1;
              setCoins(s.coins);
              sounds.playCoin();
              s.floatingTexts.push({
                id: Math.random(),
                text: '+1 🪙',
                x: item.x,
                y: item.y - 15,
                alpha: 1.0,
                color: '#fbbf24',
              });
            } else if (item.type === 'water') {
              // Water cleans mud, pushes avalanche back!
              s.mudGap = Math.min(50, s.mudGap + 8);
              s.currentSpeed += 2.0;
              sounds.playPowerup();
              s.floatingTexts.push({
                id: Math.random(),
                text: '💧 ¡AGUA FRESCA! +8m',
                x: item.x,
                y: item.y - 20,
                alpha: 1.0,
                color: '#38bdf8',
              });
            } else if (item.type === 'spring') {
              runner.superJumpTimer = 320; // ~5 seconds
              setIsSuperJumpActive(true);
              sounds.playPowerup();
              s.floatingTexts.push({
                id: Math.random(),
                text: '🥾 ¡SUPER SALTO!',
                x: item.x,
                y: item.y - 20,
                alpha: 1.0,
                color: '#a855f7',
              });
            } else if (item.type === 'heart') {
              if (s.lives < 3) {
                s.lives += 1;
                setLives(s.lives);
              }
              sounds.playPowerup();
              s.floatingTexts.push({
                id: Math.random(),
                text: '❤️ +1 VIDA',
                x: item.x,
                y: item.y - 20,
                alpha: 1.0,
                color: '#f43f5e',
              });
            }

            s.collectibles.splice(i, 1);
            continue;
          }

          if (item.x < -80) {
            s.collectibles.splice(i, 1);
          }
        }

        // Synchronize HUD state
        if (s.frame % 6 === 0) {
          setDistanceMeters(s.distance);
          setMudGapMeters(Math.round(s.mudGap));
        }
      }

      // ==========================================
      // RENDERING CANVAS (60fps)
      // ==========================================
      ctx.save();

      // Screen Shake on damage
      if (stateRef.current.screenShake > 0) {
        const shakeMagnitude = (stateRef.current.screenShake / 18) * 6;
        const dx = (Math.random() - 0.5) * shakeMagnitude;
        const dy = (Math.random() - 0.5) * shakeMagnitude;
        ctx.translate(dx, dy);
      }

      const w = canvas.width;
      const h = canvas.height;
      const groundY = 295;
      const frame = s.frame;

      // 1. Sky & Countryside Sunset Gradient (Atardecer en el campo)
      // Cielo azul claro arriba transitando a tonos cálidos dorados y anaranjados hacia el horizonte
      const skyGrad = ctx.createLinearGradient(0, 0, 0, groundY);
      skyGrad.addColorStop(0, '#38bdf8');   // Azul cielo claro
      skyGrad.addColorStop(0.32, '#7dd3fc'); // Celeste suave
      skyGrad.addColorStop(0.58, '#fde68a'); // Dorado suave de atardecer
      skyGrad.addColorStop(0.82, '#fb923c'); // Naranja cálido de poniente
      skyGrad.addColorStop(1.0, '#f97316');  // Tonos cálidos dorados/naranjas en el horizonte
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, h);

      // Sol radiante del atardecer cerca del horizonte
      const sunX = w * 0.72;
      const sunY = groundY - 60;
      const sunGlow = ctx.createRadialGradient(sunX, sunY, 10, sunX, sunY, 90);
      sunGlow.addColorStop(0, 'rgba(254, 240, 138, 0.95)'); // Centro amarillo brillante
      sunGlow.addColorStop(0.35, 'rgba(251, 146, 60, 0.55)'); // Halo naranja cálido
      sunGlow.addColorStop(1, 'rgba(251, 146, 60, 0)');
      ctx.fillStyle = sunGlow;
      ctx.beginPath();
      ctx.arc(sunX, sunY, 90, 0, Math.PI * 2);
      ctx.fill();

      // Disco del sol
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(sunX, sunY, 26, 0, Math.PI * 2);
      ctx.fill();

      // Nubes suaves de atardecer con tintes rosados/dorados
      ctx.fillStyle = 'rgba(254, 215, 170, 0.45)';
      for (let c = 0; c < 4; c++) {
        const cloudX = ((frame * 0.3 + c * 240) % (w + 160)) - 80;
        const cloudY = 45 + (c % 2) * 35;
        ctx.beginPath();
        ctx.arc(cloudX, cloudY, 22, 0, Math.PI * 2);
        ctx.arc(cloudX + 18, cloudY - 8, 26, 0, Math.PI * 2);
        ctx.arc(cloudX + 42, cloudY, 20, 0, Math.PI * 2);
        ctx.fill();
      }

      // Colinas distantes del campo bañadas en luz dorada (Parallax Capa 1)
      ctx.fillStyle = '#4d7c0f'; // Verde oliva campestre iluminado por el ocaso
      ctx.beginPath();
      ctx.moveTo(0, groundY);
      for (let x = 0; x <= w; x += 30) {
        const py = groundY - 80 - Math.sin((x + frame * 0.35) * 0.009) * 35;
        ctx.lineTo(x, py);
      }
      ctx.lineTo(w, groundY);
      ctx.closePath();
      ctx.fill();

      // Borde de luz dorada en la cima de las colinas
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Colinas cercanas con arboledas campestres (Parallax Capa 2)
      ctx.fillStyle = '#15803d'; // Verde campo más cercano y vivo
      ctx.beginPath();
      ctx.moveTo(0, groundY);
      for (let x = 0; x <= w; x += 20) {
        const py = groundY - 45 - Math.cos((x + frame * 0.9) * 0.02) * 22;
        ctx.lineTo(x, py);
      }
      ctx.lineTo(w, groundY);
      ctx.closePath();
      ctx.fill();

      // Árboles campestres redondeados en las colinas
      ctx.fillStyle = '#166534';
      for (let t = 0; t < 6; t++) {
        const treeX = ((w + 120 - ((frame * 1.5 + t * 160) % (w + 200)))) - 50;
        const treeBaseY = groundY - 25;
        ctx.beginPath();
        ctx.arc(treeX, treeBaseY - 22, 16, 0, Math.PI * 2);
        ctx.arc(treeX - 10, treeBaseY - 16, 12, 0, Math.PI * 2);
        ctx.arc(treeX + 10, treeBaseY - 16, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#78350f';
        ctx.fillRect(treeX - 2.5, treeBaseY - 8, 5, 10);
        ctx.fillStyle = '#166534';
      }

      // 2. Suelo / Plataforma: Pasto verde de campo
      const groundGrad = ctx.createLinearGradient(0, groundY, 0, h);
      groundGrad.addColorStop(0, '#22c55e');    // Césped verde brillante superior
      groundGrad.addColorStop(0.12, '#16a34a'); // Verde hierba campo
      groundGrad.addColorStop(0.35, '#15803d'); // Verde bosque profundo
      groundGrad.addColorStop(0.7, '#166534');  // Base de tierra y raíces
      groundGrad.addColorStop(1.0, '#14532d');  // Verde oscuro profundo de campo
      ctx.fillStyle = groundGrad;
      ctx.fillRect(0, groundY, w, h - groundY);

      // Borde de briznas de pasto verde fresco en la superficie
      ctx.strokeStyle = '#4ade80';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, groundY);
      ctx.lineTo(w, groundY);
      ctx.stroke();

      // Briznas de pasto en movimiento
      ctx.fillStyle = '#86efac';
      for (let i = 0; i < 28; i++) {
        const grassX = ((frame * 7 + i * 38) % (w + 40)) - 10;
        const grassSway = Math.sin((frame * 0.2 + i)) * 3;
        ctx.beginPath();
        ctx.moveTo(w - grassX, groundY + 1);
        ctx.lineTo(w - grassX - 3 + grassSway, groundY - 7);
        ctx.lineTo(w - grassX + 2, groundY + 1);
        ctx.fill();
      }

      // Florecillas silvestres campestres en el pasto
      for (let f = 0; f < 8; f++) {
        const flowerX = ((frame * 6 + f * 115) % (w + 80)) - 20;
        const flowerY = groundY + 10 + (f % 3) * 10;
        ctx.fillStyle = f % 2 === 0 ? '#ffffff' : '#fef08a';
        ctx.beginPath();
        ctx.arc(w - flowerX, flowerY, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(w - flowerX, flowerY, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }

      // 3. Render Collectibles
      s.collectibles.forEach((item) => {
        const bob = Math.sin((frame + item.id * 10) * 0.1) * 4;
        const cy = item.y + bob;

        if (item.type === 'coin') {
          ctx.fillStyle = '#fbbf24';
          ctx.beginPath();
          ctx.arc(item.x + 12, cy + 12, 10, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#d97706';
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.fillStyle = '#78350f';
          ctx.font = 'bold 11px sans-serif';
          ctx.fillText('$', item.x + 9, cy + 16);
        } else if (item.type === 'water') {
          // Water bottle icon
          ctx.fillStyle = '#38bdf8';
          ctx.beginPath();
          ctx.roundRect(item.x + 4, cy + 2, 14, 20, 4);
          ctx.fill();
          ctx.fillStyle = '#0284c7';
          ctx.fillRect(item.x + 6, cy - 2, 10, 5);
          // Droplet aura
          ctx.fillStyle = 'rgba(56, 189, 248, 0.4)';
          ctx.beginPath();
          ctx.arc(item.x + 11, cy + 11, 14, 0, Math.PI * 2);
          ctx.fill();
        } else if (item.type === 'spring') {
          // Spring boot
          ctx.fillStyle = '#a855f7';
          ctx.beginPath();
          ctx.roundRect(item.x + 2, cy + 4, 18, 14, 3);
          ctx.fill();
          ctx.strokeStyle = '#c084fc';
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 9px sans-serif';
          ctx.fillText('UP', item.x + 4, cy + 14);
        } else if (item.type === 'heart') {
          // Extra life heart
          ctx.fillStyle = '#ef4444';
          ctx.font = '22px sans-serif';
          ctx.fillText('❤️', item.x + 2, cy + 18);
        }
      });

      // 4. Render Obstacles
      s.obstacles.forEach((obs) => {
        if (obs.type === 'puddle') {
          // Sticky dark mud puddle
          ctx.fillStyle = '#3f1f0a';
          ctx.beginPath();
          ctx.ellipse(obs.x + obs.width / 2, groundY + 4, obs.width / 2, 9, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#271206';
          ctx.lineWidth = 2;
          ctx.stroke();

          // Mud bubbles in puddle
          const bubblePhase = Math.sin((frame + obs.id) * 0.15);
          if (bubblePhase > 0.4) {
            ctx.fillStyle = '#92400e';
            ctx.beginPath();
            ctx.arc(obs.x + obs.width / 2, groundY, 4, 0, Math.PI * 2);
            ctx.fill();
          }
        } else if (obs.type === 'rock') {
          // Sharp rock
          ctx.fillStyle = '#44403c';
          ctx.beginPath();
          ctx.moveTo(obs.x, groundY);
          ctx.lineTo(obs.x + obs.width * 0.4, obs.y);
          ctx.lineTo(obs.x + obs.width, groundY);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = '#292524';
          ctx.lineWidth = 2;
          ctx.stroke();
          // Rock highlight
          ctx.strokeStyle = '#78716c';
          ctx.beginPath();
          ctx.moveTo(obs.x + obs.width * 0.3, obs.y + 4);
          ctx.lineTo(obs.x + obs.width * 0.4, obs.y);
          ctx.stroke();
        } else if (obs.type === 'log') {
          // Fallen wood trunk
          ctx.fillStyle = '#713f12';
          ctx.beginPath();
          ctx.roundRect(obs.x, obs.y, obs.width, obs.height, 6);
          ctx.fill();
          ctx.strokeStyle = '#451a03';
          ctx.lineWidth = 2;
          ctx.stroke();
          // Bark rings
          ctx.strokeStyle = '#a16207';
          ctx.beginPath();
          ctx.arc(obs.x + 8, obs.y + obs.height / 2, 6, 0, Math.PI * 2);
          ctx.stroke();
        } else if (obs.type === 'high_branch') {
          // Overhanging branch (Slide under)
          ctx.fillStyle = '#451a03';
          ctx.beginPath();
          ctx.roundRect(obs.x, obs.y, obs.width, 16, 4);
          ctx.fill();
          // Hanging vines
          ctx.strokeStyle = '#15803d';
          ctx.lineWidth = 2;
          for (let v = 0; v < 3; v++) {
            ctx.beginPath();
            ctx.moveTo(obs.x + 10 + v * 14, obs.y + 16);
            ctx.lineTo(obs.x + 10 + v * 14, obs.y + 36);
            ctx.stroke();
          }
        }
      });

      // 5. Render Runner Character (Niña corredora de campo)
      const runner = s.runner;
      const isInvulnerable = runner.invulnerableTimer > 0;
      // Blinking effect during invulnerability
      const shouldRenderRunner = !isInvulnerable || Math.floor(frame / 4) % 2 === 0;

      if (shouldRenderRunner) {
        const rx = runner.x;
        const ry = groundY + runner.y;

        // Sombra suave bajo la niña sobre el pasto
        if (runner.isGrounded) {
          ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
          ctx.beginPath();
          ctx.ellipse(rx, groundY + 2, runner.isSliding ? 24 : 16, 5, 0, 0, Math.PI * 2);
          ctx.fill();
        }

        if (runner.isSliding) {
          // Pose de deslizamiento / barrida: Niña deslizándose por el pasto
          // Piernas estiradas hacia adelante con calzas
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 4.5;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(rx - 8, groundY - 10);
          ctx.lineTo(rx + 22, groundY - 5);
          ctx.stroke();

          // Zapatillas deportivas con detalle blanco
          ctx.fillStyle = '#f43f5e';
          ctx.beginPath();
          ctx.roundRect(rx + 20, groundY - 9, 12, 7, 2);
          ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(rx + 23, groundY - 7, 6, 2);

          // Torso horizontal / remera deportiva
          ctx.fillStyle = '#ec4899';
          ctx.beginPath();
          ctx.roundRect(rx - 22, groundY - 22, 28, 16, 4);
          ctx.fill();
          // Franja blanca deportiva en la remera
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(rx - 16, groundY - 18, 16, 3);

          // Brazo estirado hacia atrás para equilibrio
          ctx.strokeStyle = '#fed7aa';
          ctx.lineWidth = 3.5;
          ctx.beginPath();
          ctx.moveTo(rx - 12, groundY - 16);
          ctx.lineTo(rx - 24, groundY - 26);
          ctx.stroke();

          // Cabeza inclinada de la niña
          ctx.fillStyle = '#ffedd5';
          ctx.beginPath();
          ctx.arc(rx + 8, groundY - 16, 9, 0, Math.PI * 2);
          ctx.fill();

          // Cabello castaño frontal
          ctx.fillStyle = '#7c2d12';
          ctx.beginPath();
          ctx.arc(rx + 7, groundY - 19, 8, Math.PI, 0);
          ctx.fill();

          // Coleta/ponytail flotando horizontalmente hacia atrás en la barrida
          ctx.fillStyle = '#7c2d12';
          ctx.beginPath();
          ctx.moveTo(rx - 1, groundY - 22);
          ctx.quadraticCurveTo(rx - 18, groundY - 28, rx - 34, groundY - 24);
          ctx.quadraticCurveTo(rx - 18, groundY - 20, rx - 1, groundY - 18);
          ctx.fill();

          // Lazo fucsia en la coleta
          ctx.fillStyle = '#f43f5e';
          ctx.beginPath();
          ctx.arc(rx - 1, groundY - 20, 3.5, 0, Math.PI * 2);
          ctx.fill();

          // Ojo decidido
          ctx.fillStyle = '#1e293b';
          ctx.beginPath();
          ctx.arc(rx + 12, groundY - 16, 1.5, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Pose erguida de carrera / salto de la niña
          const legPhase = runner.isGrounded ? Math.sin(frame * 0.3) : 0.8;
          const hairSway = Math.sin(frame * 0.3) * 4;

          // Piernas con calzas deportivas celestes y zapatillas
          ctx.strokeStyle = '#0284c7';
          ctx.lineWidth = 4.5;
          ctx.lineCap = 'round';

          // Pierna izquierda
          ctx.beginPath();
          ctx.moveTo(rx, ry - 18);
          ctx.lineTo(rx + legPhase * 16, ry - 2);
          ctx.stroke();

          // Zapatilla izquierda
          ctx.fillStyle = '#f43f5e';
          ctx.beginPath();
          ctx.ellipse(rx + legPhase * 16 + 2, ry - 2, 5.5, 3.5, 0, 0, Math.PI * 2);
          ctx.fill();

          // Pierna derecha
          ctx.beginPath();
          ctx.moveTo(rx, ry - 18);
          ctx.lineTo(rx - legPhase * 16, ry - 2);
          ctx.stroke();

          // Zapatilla derecha
          ctx.fillStyle = '#f43f5e';
          ctx.beginPath();
          ctx.ellipse(rx - legPhase * 16 + 2, ry - 2, 5.5, 3.5, 0, 0, Math.PI * 2);
          ctx.fill();

          // Shorts/falda deportiva de niña
          ctx.fillStyle = '#38bdf8';
          ctx.beginPath();
          ctx.moveTo(rx - 11, ry - 24);
          ctx.lineTo(rx + 11, ry - 24);
          ctx.lineTo(rx + 13, ry - 16);
          ctx.lineTo(rx - 13, ry - 16);
          ctx.closePath();
          ctx.fill();

          // Torso / Remera de aventurera alegre (rosa vibrante)
          ctx.fillStyle = '#ec4899';
          ctx.beginPath();
          ctx.roundRect(rx - 10, ry - 46, 20, 24, 4);
          ctx.fill();

          // Franja blanca deportiva con estrella dorada
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(rx - 7, ry - 38, 14, 3);
          ctx.fillStyle = '#fde047';
          ctx.beginPath();
          ctx.arc(rx, ry - 37, 2, 0, Math.PI * 2);
          ctx.fill();

          // Brazos animados con piel
          ctx.strokeStyle = '#fed7aa';
          ctx.lineWidth = 3.5;
          ctx.lineCap = 'round';
          // Brazo izquierdo
          ctx.beginPath();
          ctx.moveTo(rx - 4, ry - 40);
          ctx.lineTo(rx - legPhase * 14, ry - 26);
          ctx.stroke();
          // Brazo derecho
          ctx.beginPath();
          ctx.moveTo(rx + 4, ry - 40);
          ctx.lineTo(rx + legPhase * 14, ry - 26);
          ctx.stroke();

          // Cabeza de la niña
          ctx.fillStyle = '#ffedd5';
          ctx.beginPath();
          ctx.arc(rx + 3, ry - 56, 10.5, 0, Math.PI * 2);
          ctx.fill();

          // Sonrojo tierno en mejillas
          ctx.fillStyle = 'rgba(244, 63, 94, 0.45)';
          ctx.beginPath();
          ctx.arc(rx + 9, ry - 54, 2.5, 0, Math.PI * 2);
          ctx.fill();

          // Ojo alegre brillante
          ctx.fillStyle = '#1e293b';
          ctx.beginPath();
          ctx.arc(rx + 8, ry - 57, 1.8, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(rx + 8.5, ry - 57.5, 0.7, 0, Math.PI * 2);
          ctx.fill();

          // Sonrisa entusiasta
          ctx.strokeStyle = '#be123c';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.arc(rx + 7, ry - 53, 2.5, 0.2, Math.PI * 0.8);
          ctx.stroke();

          // Pelo frontal / Flequillo castaño
          ctx.fillStyle = '#7c2d12';
          ctx.beginPath();
          ctx.arc(rx + 2, ry - 60, 10, Math.PI, 0);
          ctx.fill();
          ctx.beginPath();
          ctx.moveTo(rx - 5, ry - 60);
          ctx.quadraticCurveTo(rx + 2, ry - 56, rx + 6, ry - 60);
          ctx.quadraticCurveTo(rx + 8, ry - 55, rx + 11, ry - 58);
          ctx.fill();

          // Coleta de pelo ondeando al viento (Ponytail dinámica)
          ctx.fillStyle = '#7c2d12';
          ctx.beginPath();
          const ponytailTipX = rx - 20 - (runner.isGrounded ? Math.abs(legPhase) * 6 : 10);
          const ponytailTipY = ry - 58 + hairSway;
          ctx.moveTo(rx - 6, ry - 60);
          ctx.quadraticCurveTo(rx - 14, ry - 68 + hairSway * 0.5, ponytailTipX, ponytailTipY);
          ctx.quadraticCurveTo(rx - 12, ry - 54 + hairSway * 0.5, rx - 4, ry - 52);
          ctx.closePath();
          ctx.fill();

          // Lazo fucsia en la coleta
          ctx.fillStyle = '#f43f5e';
          ctx.beginPath();
          ctx.arc(rx - 6, ry - 57, 4, 0, Math.PI * 2);
          ctx.fill();
          // Cinta colgante del lazo
          ctx.strokeStyle = '#f43f5e';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(rx - 7, ry - 55);
          ctx.lineTo(rx - 12, ry - 48 + hairSway);
          ctx.stroke();

          // Botas super salto (aura mágica)
          if (runner.superJumpTimer > 0) {
            ctx.fillStyle = 'rgba(168, 85, 247, 0.4)';
            ctx.beginPath();
            ctx.arc(rx, ry - 5, 14, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      // 6. Giant Churning Mud Avalanche Wave (Left side of the screen)
      // Visual width on canvas is dynamically inversely proportional to mudGap
      // mudGap = 50 -> wave at x ~ -20
      // mudGap = 35 -> wave at x ~ 70
      // mudGap = 10 -> wave at x ~ 150
      // mudGap = 0 -> wave reaches runner at x = 180!
      const mudWaveFrontX = Math.max(10, 180 - s.mudGap * 3.4);

      const mudGrad = ctx.createLinearGradient(0, 0, mudWaveFrontX, 0);
      mudGrad.addColorStop(0, '#1c1006');
      mudGrad.addColorStop(0.65, '#451a03');
      mudGrad.addColorStop(0.92, '#78350f');
      mudGrad.addColorStop(1, 'rgba(120, 53, 15, 0.15)');

      ctx.fillStyle = mudGrad;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(mudWaveFrontX * 0.7, 0);

      // Churning turbulent wave profile
      for (let y = 0; y <= h; y += 12) {
        const offset = Math.sin((y * 0.05) + frame * 0.14) * 16 + Math.cos(frame * 0.18) * 8;
        ctx.lineTo(mudWaveFrontX + offset, y);
      }
      ctx.lineTo(0, h);
      ctx.closePath();
      ctx.fill();

      // Wave foaming crest
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 4;
      ctx.beginPath();
      for (let y = 0; y <= groundY; y += 16) {
        const offset = Math.sin((y * 0.05) + frame * 0.14) * 16 + Math.cos(frame * 0.18) * 8;
        if (y === 0) ctx.moveTo(mudWaveFrontX + offset, y);
        else ctx.lineTo(mudWaveFrontX + offset, y);
      }
      ctx.stroke();

      // Mud spray droplets flying from wave towards the player
      if (frame % 2 === 0) {
        s.particles.push({
          x: mudWaveFrontX + 8,
          y: Math.random() * (groundY - 20) + 20,
          vx: Math.random() * 5 + 2,
          vy: (Math.random() - 0.5) * 4,
          size: Math.random() * 6 + 2,
          alpha: 0.9,
          color: Math.random() > 0.5 ? '#92400e' : '#b45309',
        });
      }

      // 7. Update and Draw Particles
      for (let i = s.particles.length - 1; i >= 0; i--) {
        const p = s.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.18; // gravity
        p.alpha -= 0.025;

        if (p.alpha <= 0 || p.x > w || p.y > h) {
          s.particles.splice(i, 1);
          continue;
        }

        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
      }

      // 8. Floating Action Texts
      for (let i = s.floatingTexts.length - 1; i >= 0; i--) {
        const ft = s.floatingTexts[i];
        ft.y -= 1.2;
        ft.alpha -= 0.025;

        if (ft.alpha <= 0) {
          s.floatingTexts.splice(i, 1);
          continue;
        }

        ctx.font = 'bold 15px sans-serif';
        ctx.fillStyle = ft.color;
        ctx.globalAlpha = Math.max(0, ft.alpha);
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.globalAlpha = 1.0;
      }

      // Proximity Danger Warning Vignette when mud is too close (< 14m)
      if (s.mudGap < 14) {
        const pulse = (Math.sin(frame * 0.2) + 1) * 0.5;
        ctx.strokeStyle = `rgba(239, 68, 68, ${0.4 + pulse * 0.4})`;
        ctx.lineWidth = 12;
        ctx.strokeRect(0, 0, w, h);
      }

      ctx.restore();
      animId = requestAnimationFrame(gameLoop);
    };

    animId = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(animId);
      sounds.stopMusic();
    };
  }, [character, difficulty, onSaveHighScore]);

  return (
    <div className="relative w-full max-w-5xl mx-auto flex flex-col items-center">
      {/* HUD Header Bar */}
      <div className="w-full flex items-center justify-between px-4 sm:px-6 py-3 bg-stone-900/90 border border-amber-900/60 rounded-t-2xl shadow-xl backdrop-blur-md">
        {/* Left: Character & 3 Lives */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden border border-amber-500/60 bg-stone-800 shrink-0">
            <img
              src={character.avatar}
              alt={character.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <div className="text-xs font-heading font-bold text-stone-200">
              {character.name}
            </div>
            {/* 3 LIVES DISPLAY */}
            <div className="flex items-center gap-1 mt-0.5">
              {[1, 2, 3].map((heartIndex) => (
                <Heart
                  key={heartIndex}
                  className={`w-5 h-5 transition-transform ${
                    heartIndex <= lives
                      ? 'text-red-500 fill-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)] scale-100'
                      : 'text-stone-700 scale-90'
                  }`}
                />
              ))}
              <span className="text-xs font-mono text-stone-400 ml-1">
                ({lives}/3)
              </span>
            </div>
          </div>
        </div>

        {/* Center: Distance Ran & Mud Proximity */}
        <div className="flex items-center gap-3 sm:gap-6 font-heading">
          {/* Distance */}
          <div className="text-center">
            <span className="text-[10px] text-stone-400 uppercase tracking-wider block">
              Distancia
            </span>
            <span className="text-xl sm:text-2xl font-bold font-mono text-amber-400 tabular-nums">
              {distanceMeters} m
            </span>
          </div>

          {/* Mud Proximity Meter */}
          <div className="hidden sm:block text-center">
            <span className="text-[10px] text-stone-400 uppercase tracking-wider block">
              Alud de Lodo a
            </span>
            <div className="flex items-center gap-2">
              <span
                className={`text-base font-bold font-mono tabular-nums ${
                  mudGapMeters <= 12 ? 'text-red-400 animate-pulse' : 'text-orange-400'
                }`}
              >
                {mudGapMeters} m
              </span>
              <div className="w-20 h-2 bg-stone-800 rounded-full overflow-hidden border border-stone-700">
                <div
                  className={`h-full rounded-full transition-all duration-200 ${
                    mudGapMeters <= 12
                      ? 'bg-red-500 animate-pulse'
                      : mudGapMeters <= 25
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(100, (mudGapMeters / 50) * 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Coins */}
          <div className="text-center">
            <span className="text-[10px] text-stone-400 uppercase tracking-wider block">
              Monedas
            </span>
            <span className="text-base sm:text-xl font-bold font-mono text-yellow-400 tabular-nums flex items-center gap-1 justify-center">
              🪙 {coins}
            </span>
          </div>
        </div>

        {/* Right: Audio & Controls */}
        <div className="flex items-center gap-2">
          {isSuperJumpActive && (
            <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded bg-purple-900/60 border border-purple-500 text-purple-200 text-xs font-heading font-bold animate-bounce">
              🥾 Super Salto
            </span>
          )}

          <button
            onClick={() => {
              const muted = sounds.toggleMute();
              setIsMuted(muted);
            }}
            className="p-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors cursor-pointer"
            title={isMuted ? 'Activar sonido' : 'Silenciar'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
          </button>

          <button
            onClick={togglePause}
            className="p-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors cursor-pointer"
            title={gameState === 'PAUSED' ? 'Reanudar' : 'Pausar'}
          >
            {gameState === 'PAUSED' ? <Play className="w-4 h-4 text-emerald-400" /> : <Pause className="w-4 h-4 text-amber-400" />}
          </button>

          <button
            onClick={onExitToMenu}
            className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-heading uppercase tracking-wider transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Salir
          </button>
        </div>
      </div>

      {/* Canvas Viewport Frame */}
      <div className="relative w-full overflow-hidden border-x border-b border-amber-900/60 bg-stone-950 shadow-2xl">
        <canvas
          ref={canvasRef}
          width={880}
          height={360}
          className="w-full h-auto block select-none touch-none"
          onClick={performJump}
        />

        {/* Mobile / Touch On-Screen Controls */}
        <div className="absolute bottom-3 inset-x-3 flex items-center justify-between pointer-events-none sm:hidden">
          <button
            onClick={(e) => {
              e.stopPropagation();
              performSlide();
            }}
            className="pointer-events-auto px-5 py-3 rounded-xl bg-stone-900/90 border-2 border-amber-600 text-amber-300 font-heading font-bold text-sm uppercase shadow-lg active:scale-95 transition-transform"
          >
            ⬇️ Deslizar
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              performJump();
            }}
            className="pointer-events-auto px-7 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-stone-950 font-heading font-bold text-sm uppercase shadow-lg active:scale-95 transition-transform"
          >
            ⬆️ Saltar
          </button>
        </div>

        {/* Mud Alert Banner when in extreme danger */}
        {mudGapMeters <= 10 && gameState === 'PLAYING' && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-red-600/90 border border-red-400 text-white font-heading font-bold text-xs uppercase tracking-wider animate-bounce shadow-xl flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-300" />
            ¡PELIGRO! ¡LA OLA DE LODO ESTÁ ENCIMA TUYO!
          </div>
        )}

        {/* PAUSE MODAL OVERLAY */}
        {gameState === 'PAUSED' && (
          <div className="absolute inset-0 z-30 bg-black/80 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center space-y-4">
            <h3 className="text-3xl font-display text-amber-400 uppercase tracking-wider">
              Juego en Pausa
            </h3>
            <p className="text-xs text-stone-300 max-w-sm">
              Toma un respiro. La avalancha de lodo te está esperando.
            </p>
            <div className="flex gap-3">
              <button
                onClick={togglePause}
                className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-heading font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
              >
                Reanudar Carrera
              </button>
              <button
                onClick={restartGame}
                className="px-5 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-heading font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
              >
                Reiniciar
              </button>
              <button
                onClick={onExitToMenu}
                className="px-5 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-heading font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
              >
                Menú Principal
              </button>
            </div>
          </div>
        )}

        {/* GAME OVER MODAL OVERLAY */}
        {gameState === 'GAME_OVER' && (
          <div className="absolute inset-0 z-30 bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center space-y-4 animate-in fade-in duration-300">
            <div className="text-4xl mb-1">🌊🪨</div>
            <h3 className="text-3xl sm:text-4xl font-display text-red-500 uppercase tracking-wide drop-shadow-[0_0_12px_rgba(239,68,68,0.6)]">
              ¡FIN DE LA CARRERA!
            </h3>
            <p className="text-sm text-stone-300 max-w-md font-body leading-relaxed">
              {gameOverReason}
            </p>

            {/* Scorecard */}
            <div className="grid grid-cols-2 gap-4 max-w-sm w-full p-4 rounded-xl bg-stone-900 border border-stone-800 text-center">
              <div>
                <span className="text-[10px] text-stone-400 uppercase font-heading block">
                  Distancia Lograda
                </span>
                <span className="text-2xl font-display text-amber-400 tabular-nums">
                  {distanceMeters} m
                </span>
              </div>
              <div>
                <span className="text-[10px] text-stone-400 uppercase font-heading block">
                  Monedas Recogidas
                </span>
                <span className="text-2xl font-display text-yellow-400 tabular-nums">
                  🪙 {coins}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <button
                onClick={restartGame}
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-stone-950 font-heading font-bold text-sm uppercase tracking-wider shadow-lg active:scale-95 transition-all cursor-pointer flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                ¡JUGAR DE NUEVO!
              </button>
              <button
                onClick={onExitToMenu}
                className="px-6 py-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-heading font-bold text-sm uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Volver al Menú
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Keyboard Controls Guide beneath canvas */}
      <div className="w-full flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-stone-900/60 border-x border-b border-amber-900/40 rounded-b-2xl text-xs text-stone-400 font-heading">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <kbd className="px-2 py-0.5 bg-stone-800 border border-stone-700 rounded text-amber-300 font-mono">
              ESPACIO / ⬆️
            </kbd>
            <span>Saltar charcos y rocas</span>
          </span>
          <span className="flex items-center gap-1.5">
            <kbd className="px-2 py-0.5 bg-stone-800 border border-stone-700 rounded text-amber-300 font-mono">
              ⬇️ / S
            </kbd>
            <span>Deslizarse bajo ramas</span>
          </span>
        </div>
        <div className="flex items-center gap-2 text-stone-500">
          <span>❤️ 3 Vidas</span>
          <span>·</span>
          <span>💧 Agua aleja el lodo</span>
          <span>·</span>
          <span>[P] Pausar</span>
        </div>
      </div>
    </div>
  );
};
