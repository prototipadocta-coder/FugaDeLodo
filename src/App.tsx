import React, { useState } from 'react';
import {
  Volume2,
  VolumeX,
  Trophy,
  HelpCircle,
  Play,
  Heart,
  Flame,
  Shield,
  Zap,
  ChevronRight,
  Info,
  Sparkles,
} from 'lucide-react';
import { CHARACTERS, DIFFICULTIES, Character, Difficulty } from './data/gameData';
import { sounds } from './audio/soundEffects';
import { MudRunnerLiveTeaser } from './components/MudRunnerLiveTeaser';
import { HowToPlayModal } from './components/HowToPlayModal';
import { LeaderboardModal } from './components/LeaderboardModal';
import { MudRunnerGame } from './components/MudRunnerGame';
import mudHeroBg from './assets/images/mud_avalanche_hero_1790690118527.jpg';

export default function App() {
  const [viewMode, setViewMode] = useState<'TITLE_SCREEN' | 'GAME_RUNNING'>('TITLE_SCREEN');
  const [selectedCharacter, setSelectedCharacter] = useState<Character>(CHARACTERS[0]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>(DIFFICULTIES[1]);
  const [isMuted, setIsMuted] = useState(false);
  const [isMusicActive, setIsMusicActive] = useState(false);

  // Modals state
  const [isHowToPlayOpen, setIsHowToPlayOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);

  const toggleSoundMute = () => {
    const muted = sounds.toggleMute();
    setIsMuted(muted);
    if (!muted) {
      sounds.playSelect();
    }
  };

  const toggleArcadeMusic = () => {
    if (isMusicActive) {
      sounds.stopMusic();
      setIsMusicActive(false);
    } else {
      sounds.startMusic();
      setIsMusicActive(true);
    }
  };

  const handleCharacterSelect = (char: Character) => {
    sounds.playSelect();
    setSelectedCharacter(char);
  };

  const handleDifficultySelect = (diff: Difficulty) => {
    sounds.playHover();
    setSelectedDifficulty(diff);
  };

  const handleStartGame = () => {
    sounds.playStartFanfare();
    setViewMode('GAME_RUNNING');
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col relative selection:bg-amber-500 selection:text-stone-950">
      {/* Background Cinematic Cover with Gradients */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <img
          src={mudHeroBg}
          alt="Avalancha de lodo amenazante"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center opacity-35 scale-105 filter blur-[1px] transform duration-1000"
        />
        {/* Deep Scrim Gradients */}
        <div className="absolute inset-0 bg-gradient-to-b from-stone-950/90 via-stone-950/80 to-stone-950" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(217,119,6,0.12)_0%,transparent_70%)]" />
      </div>

      {/* Top Bar Contract (1 line, 3 zones: Brand - Nav items - Actions) */}
      <header className="relative z-30 flex items-center justify-between px-6 py-4 border-b border-amber-900/40 bg-stone-950/80 backdrop-blur-md">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-2">
          <span className="text-2xl" role="img" aria-label="Lodo">🌊</span>
          <a
            href="/"
            className="text-xl font-display tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-amber-200 hover:opacity-90 transition-opacity"
          >
            FUGA DEL LODO
          </a>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-heading uppercase tracking-wider text-stone-300">
          <button
            onClick={() => {
              sounds.playHover();
              setIsHowToPlayOpen(true);
            }}
            className="hover:text-amber-400 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
            ¿Cómo Jugar?
          </button>
          <button
            onClick={() => {
              sounds.playHover();
              setIsLeaderboardOpen(true);
            }}
            className="hover:text-amber-400 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Trophy className="w-3.5 h-3.5 text-yellow-500" />
            Récords Mundiales
          </button>
          <a
            href="#personajes"
            onClick={() => sounds.playHover()}
            className="hover:text-amber-400 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span>Corredores</span>
          </a>
          <a
            href="#dificultad"
            onClick={() => sounds.playHover()}
            className="hover:text-amber-400 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span>Dificultad</span>
          </a>
        </nav>

        {/* Zone 3: Actions (Sound toggle + Play CTA) */}
        <div className="flex items-center gap-3">
          {/* Retro BGM toggle */}
          <button
            onClick={toggleArcadeMusic}
            onMouseEnter={() => sounds.playHover()}
            className={`px-3 py-1.5 rounded-lg border text-xs font-heading font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              isMusicActive
                ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200'
            }`}
            title="Música retro de sintetizador"
          >
            <span className="text-xs">🎵</span>
            <span className="hidden sm:inline">{isMusicActive ? 'Música ON' : 'Música'}</span>
          </button>

          {/* Sound FX Toggle */}
          <button
            onClick={toggleSoundMute}
            onMouseEnter={() => sounds.playHover()}
            className="p-2 rounded-lg bg-stone-900 border border-stone-800 text-stone-300 hover:text-white transition-colors cursor-pointer"
            aria-label={isMuted ? 'Activar sonido' : 'Silenciar sonido'}
            title={isMuted ? 'Sonidos silenciados' : 'Sonidos activos'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
          </button>

          {/* Header Quick Play CTA */}
          <button
            onClick={handleStartGame}
            onMouseEnter={() => sounds.playHover()}
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-stone-950 font-heading font-bold text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-stone-950" />
            ¡Jugar Ya!
          </button>
        </div>
      </header>

      {/* Main Container */}
      {viewMode === 'GAME_RUNNING' ? (
        <main className="relative z-10 flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col items-center justify-center">
          <MudRunnerGame
            character={selectedCharacter}
            difficulty={selectedDifficulty}
            onExitToMenu={() => setViewMode('TITLE_SCREEN')}
          />
        </main>
      ) : (
        <main className="relative z-10 flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-10">
          {/* Hero Banner with Game Title & Core Concept */}
          <section className="text-center space-y-4 pt-2 sm:pt-4">
            {/* Metadata banner without pills: clean text metadata */}
            <div className="flex items-center justify-center gap-2 text-xs font-heading uppercase tracking-widest text-amber-400/90">
              <span>Videojuego de Carrera Infinita</span>
              <span aria-hidden="true">·</span>
              <span>Supervivencia Arcade</span>
              <span aria-hidden="true">·</span>
              <span className="text-red-400 font-bold flex items-center gap-1">
                <Heart className="w-3.5 h-3.5 fill-red-500 text-red-500 inline" /> 6 Vidas
              </span>
              <span aria-hidden="true">·</span>
              <span className="text-amber-300 font-bold flex items-center gap-1">
                🐶 Perrito Compañero
              </span>
            </div>

            {/* Main Title */}
            <div className="space-y-2">
              <h1 className="text-4xl sm:text-6xl md:text-7xl font-display uppercase tracking-wide text-transparent bg-clip-text bg-gradient-to-b from-amber-200 via-orange-400 to-amber-600 drop-shadow-[0_5px_15px_rgba(217,119,6,0.4)]">
                ¡FUGA DEL LODO!
              </h1>
              <p className="text-lg sm:text-xl font-heading font-bold tracking-widest uppercase text-amber-300">
                AVALANCHA SALVAJE
              </p>
            </div>

            {/* Thematic Subtitle & Mechanics Explanation */}
            <p className="max-w-2xl mx-auto text-sm sm:text-base text-stone-300 font-body leading-relaxed text-balance">
              La presa de barro ha colapsado y una gigantesca avalancha de lodo viene devorando la colina.
              ¡Salta alto sobre los <strong>cactus con espinas</strong>, corre velozmente junto a tu <strong>perrito compañero</strong> y sobrevive!
              Cuentas con <strong className="text-red-400 font-semibold">6 vidas</strong> para llegar lo más lejos posible.
            </p>

            {/* 6 Lives Visual Badge Lockup */}
            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-xl bg-stone-900/90 border border-amber-800/60 shadow-lg">
              <span className="text-xs uppercase font-heading font-bold tracking-wider text-stone-400">
                Reserva de Salud:
              </span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Heart
                    key={i}
                    className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 fill-red-500 animate-pulse drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]"
                  />
                ))}
              </div>
              <span className="text-xs font-mono text-amber-300 font-bold ml-1">
                6 VIDAS
              </span>
            </div>
          </section>

          {/* Live Interactive Arcade Teaser Window */}
          <section className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-sm font-heading font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Vista Previa en Vivo: Escenario de Escape
              </h2>
              <span className="text-xs text-stone-400 hidden sm:inline">
                Presiona Espacio o toca para saltar los charcos de lodo
              </span>
            </div>

            <MudRunnerLiveTeaser selectedCharacterName={selectedCharacter.name} />
          </section>

          {/* Big Start Game Primary CTA Section */}
          <section className="text-center pt-2">
            <button
              onClick={handleStartGame}
              onMouseEnter={() => sounds.playHover()}
              className="group relative inline-flex items-center justify-center gap-3 px-10 sm:px-14 py-4 sm:py-5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:via-orange-400 hover:to-amber-500 text-stone-950 font-display text-xl sm:text-2xl uppercase tracking-wider shadow-2xl shadow-orange-600/50 hover:shadow-orange-500/70 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer pulse-glow"
            >
              <Play className="w-7 h-7 fill-stone-950 group-hover:translate-x-1 transition-transform" />
              <span>¡JUGAR AHORA!</span>
            </button>
            <div className="mt-3 flex items-center justify-center gap-4 text-xs font-heading text-stone-400">
              <span>🎮 1 Jugador</span>
              <span>·</span>
              <span>⌨️ Teclado o Táctil</span>
              <span>·</span>
              <span className="text-amber-400">❤️ 3 Vidas Disponibles</span>
            </div>
          </section>

          {/* Section 2: Character Selection */}
          <section id="personajes" className="space-y-4 pt-4 border-t border-stone-800/60">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
              <div>
                <h2 className="text-2xl font-display text-amber-400 tracking-wide">
                  Selecciona tu Corredor
                </h2>
                <p className="text-xs sm:text-sm text-stone-400 font-body">
                  Cada huidor tiene habilidades especiales para enfrentar la marea de lodo
                </p>
              </div>
              <div className="text-xs font-mono text-amber-300">
                Seleccionado: <strong className="text-white">{selectedCharacter.name}</strong>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {CHARACTERS.map((char) => {
                const isSelected = selectedCharacter.id === char.id;
                return (
                  <div
                    key={char.id}
                    onClick={() => handleCharacterSelect(char)}
                    onMouseEnter={() => sounds.playHover()}
                    className={`relative p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-amber-950/40 border-amber-500 shadow-xl shadow-amber-950/60 scale-[1.02]'
                        : 'bg-stone-900/60 border-stone-800/80 hover:border-stone-700 hover:bg-stone-900'
                    }`}
                  >
                    {/* Selected check badge */}
                    {isSelected && (
                      <div className="absolute top-4 right-4 bg-amber-500 text-stone-950 font-heading font-bold text-[10px] uppercase px-2 py-0.5 rounded-md">
                        Listo
                      </div>
                    )}

                    <div className="space-y-4">
                      {/* Character Avatar & Name */}
                      <div className="flex items-center gap-3">
                        <div className="relative w-14 h-14 rounded-xl overflow-hidden border border-amber-600/50 bg-stone-800 shrink-0">
                          <img
                            src={char.avatar}
                            alt={char.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <h3 className="font-heading font-bold text-base text-stone-100">
                            {char.name}
                          </h3>
                          <p className="text-xs text-amber-400 font-body">
                            {char.title}
                          </p>
                        </div>
                      </div>

                      {/* Flavor Lore */}
                      <p className="text-xs text-stone-400 font-body leading-relaxed">
                        {char.flavor}
                      </p>

                      {/* Stats Bars */}
                      <div className="space-y-2 pt-2 text-xs font-heading">
                        <div>
                          <div className="flex justify-between text-stone-400 mb-1">
                            <span>Velocidad</span>
                            <span className="font-mono text-amber-300">{char.speed}/10</span>
                          </div>
                          <div className="h-1.5 w-full bg-stone-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
                              style={{ width: `${char.speed * 10}%` }}
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-stone-400 mb-1">
                            <span>Salto / Agilidad</span>
                            <span className="font-mono text-emerald-400">{char.agility}/10</span>
                          </div>
                          <div className="h-1.5 w-full bg-stone-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                              style={{ width: `${char.agility * 10}%` }}
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-stone-400 mb-1">
                            <span>Resistencia al Lodo</span>
                            <span className="font-mono text-orange-400">{char.mudResistance}/10</span>
                          </div>
                          <div className="h-1.5 w-full bg-stone-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full"
                              style={{ width: `${char.mudResistance * 10}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Special Ability */}
                      <div className="p-2.5 rounded-lg bg-stone-950/60 border border-stone-800 text-xs">
                        <strong className="text-amber-400 font-heading block mb-0.5">
                          ⚡ {char.special}
                        </strong>
                      </div>
                    </div>

                    <button
                      className={`mt-4 w-full py-2 rounded-lg font-heading text-xs uppercase tracking-wider font-bold transition-colors ${
                        isSelected
                          ? 'bg-amber-500 text-stone-950'
                          : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                      }`}
                    >
                      {isSelected ? 'Corredor Elegido' : 'Seleccionar'}
                    </button>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Section 3: Difficulty Selection & Mud Avalanche Intensity */}
          <section id="dificultad" className="space-y-4 pt-4 border-t border-stone-800/60">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
              <div>
                <h2 className="text-2xl font-display text-amber-400 tracking-wide">
                  Nivel de Furia de la Avalancha
                </h2>
                <p className="text-xs sm:text-sm text-stone-400 font-body">
                  Determina la velocidad con la que el lodo te perseguirá
                </p>
              </div>
              <div className="text-xs font-mono text-stone-400">
                Multiplicador: <strong className="text-amber-400">{selectedDifficulty.multiplier}</strong>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {DIFFICULTIES.map((diff) => {
                const isSelected = selectedDifficulty.id === diff.id;
                return (
                  <div
                    key={diff.id}
                    onClick={() => handleDifficultySelect(diff)}
                    onMouseEnter={() => sounds.playHover()}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-950/40 border-amber-500 shadow-lg'
                        : 'bg-stone-900/50 border-stone-800 hover:border-stone-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-heading font-bold text-sm text-stone-100">
                        {diff.name}
                      </h3>
                      <span className="font-mono text-xs font-bold text-amber-400 bg-stone-900 px-2 py-0.5 rounded border border-stone-800">
                        {diff.multiplier}
                      </span>
                    </div>
                    <div className="text-xs text-amber-400/90 font-heading mb-2">
                      {diff.tagline}
                    </div>
                    <p className="text-xs text-stone-400 font-body mb-3 leading-relaxed">
                      {diff.description}
                    </p>
                    <div className="pt-2 border-t border-stone-800/60 flex justify-between text-[11px] font-mono text-stone-400">
                      <span>Velocidad: {diff.mudSpeed}</span>
                      <span>Obstáculos: {diff.obstacleDensity}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Bottom Feature Cards: Quick Rules & High Scores */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* How to play card trigger */}
            <div
              onClick={() => {
                sounds.playHover();
                setIsHowToPlayOpen(true);
              }}
              className="p-5 rounded-2xl bg-stone-900/60 border border-stone-800 hover:border-amber-700/60 transition-all cursor-pointer flex items-center justify-between group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                  📖
                </div>
                <div>
                  <h4 className="font-heading font-bold text-stone-200 text-sm group-hover:text-amber-400 transition-colors">
                    Reglas del Juego & Las 3 Vidas
                  </h4>
                  <p className="text-xs text-stone-400 font-body">
                    Conoce cómo esquivar las rocas, saltar los charcos y usar potenciadores.
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-stone-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
            </div>

            {/* High scores card trigger */}
            <div
              onClick={() => {
                sounds.playHover();
                setIsLeaderboardOpen(true);
              }}
              className="p-5 rounded-2xl bg-stone-900/60 border border-stone-800 hover:border-amber-700/60 transition-all cursor-pointer flex items-center justify-between group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                  🏆
                </div>
                <div>
                  <h4 className="font-heading font-bold text-stone-200 text-sm group-hover:text-yellow-400 transition-colors">
                    Salón de Récords
                  </h4>
                  <p className="text-xs text-stone-400 font-body">
                    Récord actual: 3,420 m por Camilo_Runner. ¿Podrás superarlo?
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-stone-500 group-hover:text-yellow-400 group-hover:translate-x-1 transition-all" />
            </div>
          </section>
        </main>
      )}

      {/* Footer */}
      <footer className="relative z-20 mt-12 py-6 border-t border-stone-800/80 bg-stone-950 text-center text-xs text-stone-500 font-body">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-display text-amber-500">FUGA DEL LODO</span>
            <span>·</span>
            <span>Pantalla de Inicio Oficial</span>
          </div>
          <div className="flex items-center gap-4 text-stone-400">
            <span>❤️ 3 Vidas</span>
            <span>·</span>
            <span>🌊 Avalancha de Lodo</span>
            <span>·</span>
            <span>🎮 ¡A Divertirse!</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <HowToPlayModal
        isOpen={isHowToPlayOpen}
        onClose={() => setIsHowToPlayOpen(false)}
      />

      <LeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
      />
    </div>
  );
}
