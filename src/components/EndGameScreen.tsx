import React, { useState } from 'react';
import {
  Trophy,
  Skull,
  RotateCcw,
  ShieldCheck,
  Award,
  Users,
  Eye,
  CheckCircle2,
  XCircle,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Coins,
  CheckSquare
} from 'lucide-react';
import { Player, GameState } from '../types';

interface EndGameScreenProps {
  currentPlayer: Player;
  players: Player[];
  gameState: GameState;
  isHost: boolean;
  onRestartGame: () => void;
  onDismissToReview?: () => void;
}

export const EndGameScreen: React.FC<EndGameScreenProps> = ({
  currentPlayer,
  players,
  gameState,
  isHost,
  onRestartGame,
  onDismissToReview,
}) => {
  const [showRoster, setShowRoster] = useState(true);
  const [isRestarting, setIsRestarting] = useState(false);

  const winner = gameState.winner;
  const isPartyWin = winner === 'Fiesta (Inocentes)';
  const isShadowWin = winner === 'Sombras (Asesinos)';
  const isParanoicoWin = winner === 'Caos (Independiente)';

  // Determine if the current player won
  const isPlayerWinner = (() => {
    if (isPartyWin) return currentPlayer.team.includes('Fiesta');
    if (isShadowWin) return currentPlayer.team.includes('Sombras');
    if (isParanoicoWin) return currentPlayer.role === 'El Paranoico';
    return false;
  })();

  const completedMissionsCount = currentPlayer.missions?.filter((m) => m.completed).length || 0;
  const totalMissionsCount = currentPlayer.missions?.length || 0;

  const handleRestartClick = async () => {
    setIsRestarting(true);
    try {
      await onRestartGame();
    } finally {
      setIsRestarting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-950/95 backdrop-blur-md p-4 sm:p-6 flex flex-col items-center justify-start min-h-screen animate-in fade-in zoom-in-95 duration-300">
      <div className="max-w-md w-full space-y-5 my-auto pb-10">
        {/* Main Result Card */}
        <div
          className={`rounded-3xl p-6 text-center border relative overflow-hidden shadow-2xl ${
            isPlayerWinner
              ? 'bg-gradient-to-b from-amber-950/50 via-neutral-900/90 to-neutral-950 border-amber-500/50 shadow-amber-950/50'
              : 'bg-gradient-to-b from-rose-950/50 via-neutral-900/90 to-neutral-950 border-rose-600/50 shadow-rose-950/50'
          }`}
        >
          {/* Decorative Glow */}
          <div
            className={`absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 rounded-full blur-3xl opacity-30 pointer-events-none ${
              isPlayerWinner ? 'bg-amber-400' : 'bg-rose-600'
            }`}
          />

          {/* Result Icon */}
          <div className="relative inline-flex items-center justify-center mb-3">
            <div
              className={`w-20 h-20 rounded-3xl flex items-center justify-center border shadow-lg ${
                isPlayerWinner
                  ? 'bg-amber-500/20 border-amber-400/60 text-amber-300 shadow-amber-500/20 animate-bounce'
                  : 'bg-rose-500/20 border-rose-500/60 text-rose-300 shadow-rose-500/20'
              }`}
            >
              {isPlayerWinner ? (
                <Trophy className="w-10 h-10" />
              ) : (
                <Skull className="w-10 h-10" />
              )}
            </div>
            {isPlayerWinner && (
              <Sparkles className="w-6 h-6 text-amber-300 absolute -top-2 -right-2 animate-spin" />
            )}
          </div>

          {/* Heading */}
          <div className="space-y-1 relative">
            <div
              className={`text-xs font-black uppercase tracking-widest ${
                isPlayerWinner ? 'text-amber-400' : 'text-rose-400'
              }`}
            >
              Fin de la Velada en Macareno's Mystery
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              {isPlayerWinner ? '¡VICTORIA!' : '¡DERROTA!'}
            </h1>
            <div className="inline-block mt-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-neutral-900/80 border border-neutral-700 text-neutral-200">
              Triunfo: <span className="text-white font-extrabold">{winner || 'Sin Definir'}</span>
            </div>
          </div>

          {/* Win Reason Narrative */}
          {gameState.winReason && (
            <div className="mt-4 p-3.5 rounded-2xl bg-neutral-950/80 border border-neutral-800 text-xs text-neutral-300 leading-relaxed text-left">
              <div className="font-bold text-white mb-1 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                Veredicto del Árbitro IA:
              </div>
              <p>{gameState.winReason}</p>
            </div>
          )}

          {/* Player Personal Stat Badge */}
          <div className="mt-4 pt-4 border-t border-neutral-800/80 grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2.5 rounded-xl bg-neutral-950/60 border border-neutral-800/70">
              <div className="text-[10px] text-neutral-400 uppercase font-mono">Tu Rol</div>
              <div className="font-bold text-white text-xs truncate mt-0.5">{currentPlayer.role}</div>
            </div>
            <div className="p-2.5 rounded-xl bg-neutral-950/60 border border-neutral-800/70">
              <div className="text-[10px] text-neutral-400 uppercase font-mono">Estado</div>
              <div
                className={`font-bold text-xs mt-0.5 flex items-center justify-center gap-1 ${
                  currentPlayer.isAlive ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {currentPlayer.isAlive ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                {currentPlayer.isAlive ? 'Sobreviviente' : 'Alma en pena'}
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-neutral-950/60 border border-neutral-800/70">
              <div className="text-[10px] text-neutral-400 uppercase font-mono">Misiones</div>
              <div className="font-bold text-amber-300 text-xs mt-0.5 font-mono flex items-center justify-center gap-1">
                <CheckSquare className="w-3 h-3" />
                {completedMissionsCount}/{totalMissionsCount}
              </div>
            </div>
          </div>
        </div>

        {/* Master Identity Reveal (Who was who?) */}
        <div className="rounded-3xl border border-neutral-800 bg-neutral-900/90 backdrop-blur p-5 space-y-3 shadow-xl">
          <button
            id="toggle-final-roster-btn"
            onClick={() => setShowRoster(!showRoster)}
            className="w-full flex items-center justify-between text-xs font-bold text-white uppercase tracking-wider hover:text-neutral-300 transition"
          >
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-400" />
              <span>Revelación de Identidades ({players.length})</span>
            </div>
            {showRoster ? <ChevronUp className="w-4 h-4 text-neutral-400" /> : <ChevronDown className="w-4 h-4 text-neutral-400" />}
          </button>

          {showRoster && (
            <div className="space-y-2 pt-1 max-h-72 overflow-y-auto pr-1">
              {players.map((p) => {
                const isMe = p.id === currentPlayer.id;
                const isHostile = p.team.includes('Sombras');
                const isChaos = p.team.includes('Caos');

                return (
                  <div
                    key={p.id}
                    className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition ${
                      isMe
                        ? 'bg-neutral-800/90 border-neutral-600'
                        : 'bg-neutral-950/60 border-neutral-800/80'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">{p.avatar}</span>
                      <div>
                        <div className="font-bold text-white flex items-center gap-1.5">
                          <span>{p.name}</span>
                          {isMe && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-neutral-700 text-neutral-200">
                              Tú
                            </span>
                          )}
                          {!p.isAlive && (
                            <span className="text-[9px] text-rose-400 font-mono">✝ Caído</span>
                          )}
                        </div>
                        <div className="text-[10px] text-neutral-400">
                          {p.coins || 0} monedas · {p.missions?.filter((m) => m.completed).length || 0}/5 misiones
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div
                        className={`text-[11px] font-extrabold ${
                          isHostile
                            ? 'text-rose-400'
                            : isChaos
                            ? 'text-purple-400'
                            : 'text-emerald-400'
                        }`}
                      >
                        {p.role}
                      </div>
                      <div className="text-[9px] text-neutral-500 uppercase tracking-wider">
                        {p.team.includes('Fiesta')
                          ? 'Fiesta'
                          : p.team.includes('Sombras')
                          ? 'Sombras'
                          : 'Independiente'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="space-y-2 pt-1">
          {isHost ? (
            <button
              id="restart-game-btn"
              onClick={handleRestartClick}
              disabled={isRestarting}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 disabled:opacity-50 text-white font-extrabold text-sm uppercase tracking-wider shadow-lg shadow-rose-950/40 transition active:scale-95 flex items-center justify-center gap-2"
            >
              <RotateCcw className={`w-4 h-4 ${isRestarting ? 'animate-spin' : ''}`} />
              {isRestarting ? 'Reiniciando Sala...' : 'Reiniciar Sala y Jugar Otra Partida'}
            </button>
          ) : (
            <div className="p-3 rounded-2xl bg-neutral-900 border border-neutral-800 text-center text-xs text-neutral-400 space-y-1">
              <div className="font-semibold text-neutral-200 flex items-center justify-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                Esperando al Anfitrión
              </div>
              <p className="text-[11px]">
                El anfitrión de la sala puede reiniciar la partida para barajar nuevos roles en Macareno's Mystery.
              </p>
            </div>
          )}

          {onDismissToReview && (
            <button
              id="dismiss-end-screen-btn"
              onClick={onDismissToReview}
              className="w-full py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-850 text-neutral-300 text-xs font-semibold border border-neutral-800 transition flex items-center justify-center gap-1.5"
            >
              <Eye className="w-3.5 h-3.5" />
              Revisar Chat, Pruebas y Log de la Fiesta
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
