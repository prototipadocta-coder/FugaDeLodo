import React from 'react';
import { X, Heart, Zap, Footprints, ShieldAlert, Sparkles } from 'lucide-react';
import { sounds } from '../audio/soundEffects';

interface HowToPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-stone-900 border-2 border-amber-600/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-amber-950 via-stone-900 to-amber-950 border-b border-amber-800/40">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📜</span>
            <div>
              <h2 className="text-xl font-display text-amber-400 tracking-wide">
                Instrucciones de Supervivencia
              </h2>
              <p className="text-xs text-stone-400 font-body">
                Guía oficial para escapar de la avalancha de lodo
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              sounds.playHover();
              onClose();
            }}
            className="p-2 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-stone-200 font-body text-sm">
          {/* Objective Banner */}
          <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-800/50 flex items-start gap-3">
            <ShieldAlert className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-heading font-bold text-amber-300 text-base mb-1">
                Objetivo Principal: ¡Corre por tu vida!
              </h3>
              <p className="text-stone-300 leading-relaxed text-xs sm:text-sm">
                Un colosal aluvión de barro y rocas se desbordó desde el volcán dormido.
                Tu única misión es correr la máxima distancia posible sin ser engullido por la ola de fango.
              </p>
            </div>
          </div>

          {/* Core Rule: 3 Lives */}
          <div className="p-4 rounded-xl bg-red-950/30 border border-red-900/50">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center gap-1">
                <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                <Heart className="w-5 h-5 text-red-500 fill-red-500" />
              </div>
              <h4 className="font-heading font-bold text-red-300 text-base">
                Sistema de 3 Vidas
              </h4>
            </div>
            <p className="text-stone-300 text-xs sm:text-sm leading-relaxed">
              Inicias cada carrera con <strong>3 vidas</strong>. Cada vez que tropieces con una roca, caigas
              en un pozo de barro viscoso o te golpee un tronco, perderás <strong>1 corazón</strong> y la avalancha
              de lodo ganará <strong>10 metros de ventaja</strong> hacia ti.
              ¡Si pierdes los 3 corazones o el lodo te alcanza, fin del juego!
            </p>
          </div>

          {/* Controls Grid */}
          <div>
            <h4 className="font-heading font-bold text-amber-400 text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
              <Footprints className="w-4 h-4" /> Controles del Juego
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-stone-800/60 border border-stone-700/50">
                <div className="flex items-center gap-2 mb-1">
                  <kbd className="px-2 py-1 text-xs font-mono bg-stone-900 text-amber-300 rounded border border-stone-700">
                    ESPACIO / ⬆️
                  </kbd>
                  <span className="font-heading font-semibold text-white text-xs">
                    Salto Ágil
                  </span>
                </div>
                <p className="text-stone-400 text-xs">
                  Salta sobre zanjas de lodo, troncos caídos y rocas afiladas.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-stone-800/60 border border-stone-700/50">
                <div className="flex items-center gap-2 mb-1">
                  <kbd className="px-2 py-1 text-xs font-mono bg-stone-900 text-amber-300 rounded border border-stone-700">
                    ⬇️ / S
                  </kbd>
                  <span className="font-heading font-semibold text-white text-xs">
                    Deslizamiento
                  </span>
                </div>
                <p className="text-stone-400 text-xs">
                  Pasa por debajo de ramas bajas y puentes de raíces sin frenar.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-stone-800/60 border border-stone-700/50">
                <div className="flex items-center gap-2 mb-1">
                  <kbd className="px-2 py-1 text-xs font-mono bg-stone-900 text-amber-300 rounded border border-stone-700">
                    ➡️ / D
                  </kbd>
                  <span className="font-heading font-semibold text-white text-xs">
                    Sprint de Turbo
                  </span>
                </div>
                <p className="text-stone-400 text-xs">
                  Gasta energía acumulada para alejarte velozmente de la ola.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-stone-800/60 border border-stone-700/50">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-1 text-xs font-mono bg-stone-900 text-emerald-400 rounded border border-stone-700">
                    📱 PANTALLA
                  </span>
                  <span className="font-heading font-semibold text-white text-xs">
                    Toque Táctil
                  </span>
                </div>
                <p className="text-stone-400 text-xs">
                  Compatible 100% con móviles y tablets: toca para saltar.
                </p>
              </div>
            </div>
          </div>

          {/* Powerups */}
          <div>
            <h4 className="font-heading font-bold text-amber-400 text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> Objetos de la Pista
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-stone-800/40 border border-stone-700/40">
                <div className="text-xl mb-1">🥾</div>
                <strong className="text-amber-300 block mb-0.5">Botas Resorte</strong>
                <p className="text-stone-400">Saltos dobles gigantescos para sobrevolar tramos difíciles.</p>
              </div>
              <div className="p-3 rounded-lg bg-stone-800/40 border border-stone-700/40">
                <div className="text-xl mb-1">💧</div>
                <strong className="text-sky-300 block mb-0.5">Agua Manantial</strong>
                <p className="text-stone-400">Limpia el barro de tus piernas y restaura velocidad máxima.</p>
              </div>
              <div className="p-3 rounded-lg bg-stone-800/40 border border-stone-700/40">
                <div className="text-xl mb-1">🪙</div>
                <strong className="text-yellow-400 block mb-0.5">Monedas de Oro</strong>
                <p className="text-stone-400">Suman puntos de récord para ascender en la tabla mundial.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-950 border-t border-stone-800 flex justify-end">
          <button
            onClick={() => {
              sounds.playSelect();
              onClose();
            }}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-stone-950 font-heading font-bold text-sm uppercase tracking-wider transition-all shadow-lg cursor-pointer"
          >
            ¡Entendido, Listo para Correr!
          </button>
        </div>
      </div>
    </div>
  );
};
