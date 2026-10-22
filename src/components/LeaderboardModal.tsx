import React from 'react';
import { X, Trophy, Medal } from 'lucide-react';
import { HIGH_SCORES } from '../data/gameData';
import { sounds } from '../audio/soundEffects';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-stone-900 border-2 border-amber-600/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-amber-950 via-stone-900 to-amber-950 border-b border-amber-800/40">
          <div className="flex items-center gap-3">
            <Trophy className="w-6 h-6 text-amber-400" />
            <div>
              <h2 className="text-xl font-display text-amber-400 tracking-wide">
                Salón de la Fama
              </h2>
              <p className="text-xs text-stone-400 font-body">
                Los corredores que más lejos huyeron del lodo
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

        {/* Scores List */}
        <div className="p-6 overflow-y-auto">
          <div className="space-y-3">
            {HIGH_SCORES.map((score) => {
              const isTop3 = score.rank <= 3;
              const rankColor =
                score.rank === 1
                  ? 'text-yellow-400 bg-yellow-500/10 border-yellow-500/40'
                  : score.rank === 2
                  ? 'text-stone-300 bg-stone-400/10 border-stone-400/30'
                  : score.rank === 3
                  ? 'text-amber-600 bg-amber-600/10 border-amber-600/30'
                  : 'text-stone-400 bg-stone-800/40 border-stone-700/30';

              return (
                <div
                  key={score.rank}
                  className={`flex items-center justify-between p-3.5 rounded-xl border ${rankColor} transition-transform hover:scale-[1.01]`}
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center font-heading font-bold text-sm bg-stone-950/60 border border-stone-700">
                      {score.rank === 1 ? '🥇' : score.rank === 2 ? '🥈' : score.rank === 3 ? '🥉' : `#${score.rank}`}
                    </div>
                    <div>
                      <div className="font-heading font-bold text-stone-100 text-sm flex items-center gap-2">
                        {score.player}
                        {isTop3 && (
                          <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 bg-amber-500/20 text-amber-300 rounded">
                            Elite
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-stone-400 font-body">
                        {score.character} · <span className="text-stone-500">{score.date}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-heading font-bold text-amber-400 text-base tabular-nums">
                      {score.distance.toLocaleString()} m
                    </div>
                    <div className="text-[10px] text-stone-500 uppercase tracking-wider font-mono">
                      Distancia
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 p-4 rounded-xl bg-amber-950/30 border border-amber-900/40 text-center">
            <p className="text-xs text-amber-300 font-body">
              💡 <strong>Consejo pro:</strong> Elige a Mateo para mayor aceleración o a Lía para esquivar baches con su salto alto.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-950 border-t border-stone-800 flex justify-end">
          <button
            onClick={() => {
              sounds.playSelect();
              onClose();
            }}
            className="px-6 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-heading font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
