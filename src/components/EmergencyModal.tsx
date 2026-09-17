import React, { useState } from 'react';
import { Bell, Vote, AlertTriangle, Users, Check, X, ShieldAlert, Sparkles, Scale, Megaphone, Clock } from 'lucide-react';
import { Player, RoleType } from '../types';
import { soundManager } from '../utils/audio';

interface EmergencyModalProps {
  callerName: string | null;
  timeRemaining: number;
  meetingRound: number;
  players: Player[];
  currentPlayer: Player;
  votes: Record<string, string>;
  doubleVoteUsers?: string[];
  accusedPlayerId?: string | null;
  defenseTimerRemaining?: number;
  tribunalStage?: 'voting' | 'defense' | 'concluded';
  onCastVote: (targetId: string | 'skip', useDoubleVote?: boolean) => void;
  onConcludeMeeting: (expelledPlayerId: string | null) => void;
  onStartDefense?: (accusedId: string) => void;
}

export const EmergencyModal: React.FC<EmergencyModalProps> = ({
  callerName,
  timeRemaining,
  meetingRound,
  players,
  currentPlayer,
  votes,
  doubleVoteUsers = [],
  accusedPlayerId,
  defenseTimerRemaining = 60,
  tribunalStage = 'voting',
  onCastVote,
  onConcludeMeeting,
  onStartDefense,
}) => {
  const [selectedTarget, setSelectedTarget] = useState<string | null>(
    votes[currentPlayer.id] || null
  );
  const [wantDoubleVote, setWantDoubleVote] = useState<boolean>(
    doubleVoteUsers.includes(currentPlayer.id)
  );
  const [localDefenseMode, setLocalDefenseMode] = useState<boolean>(tribunalStage === 'defense');
  const [currentAccused, setCurrentAccused] = useState<Player | null>(
    players.find((p) => p.id === accusedPlayerId) || null
  );

  const alivePlayers = players.filter((p) => p.isAlive);
  const totalVotesCast = Object.keys(votes).length;
  const isGhost = !currentPlayer.isAlive;
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const formattedTimer = `${minutes.toString().padStart(2, '0')}:${seconds
    .toString()
    .padStart(2, '0')}`;

  const hasDoubleVoteToken = (currentPlayer.doubleVotesAvailable || 0) > 0;

  const handleVoteSubmit = (targetId: string | 'skip') => {
    if (isGhost) return;
    setSelectedTarget(targetId);
    onCastVote(targetId, wantDoubleVote && hasDoubleVoteToken);
    soundManager.playTick();
  };

  const toggleDoubleVote = () => {
    const next = !wantDoubleVote;
    setWantDoubleVote(next);
    if (selectedTarget) {
      onCastVote(selectedTarget, next);
    }
  };

  const calculateTopAccused = () => {
    const counts: Record<string, number> = {};
    Object.entries(votes).forEach(([voterId, target]) => {
      const targetKey = String(target);
      const voter = players.find((p) => p.id === voterId);
      const isDouble = doubleVoteUsers.includes(voterId) || (voter?.doubleVotesAvailable && voter.doubleVotesAvailable > 0);
      const weight = isDouble ? 2 : 1;
      counts[targetKey] = (counts[targetKey] || 0) + weight;
    });

    let topTarget: string | null = null;
    let topCount = 0;
    let isTie = false;

    Object.entries(counts).forEach(([target, count]) => {
      if (count > topCount) {
        topTarget = target;
        topCount = count;
        isTie = false;
      } else if (count === topCount && topCount > 0) {
        isTie = true;
      }
    });

    return { topTarget, topCount, isTie, counts };
  };

  const handleProceedToDefenseOrConclude = () => {
    const { topTarget, isTie } = calculateTopAccused();

    if (topTarget === 'skip' || isTie || !topTarget) {
      // Inconclusive: conclude directly
      onConcludeMeeting(null);
      return;
    }

    const accused = players.find((p) => p.id === topTarget);
    if (accused && !localDefenseMode) {
      setCurrentAccused(accused);
      setLocalDefenseMode(true);
      if (onStartDefense) onStartDefense(accused.id);
      soundManager.playEmergencyAlarm();
    } else {
      // Conclude and execute sentence
      onConcludeMeeting(topTarget);
    }
  };

  const handlePardonAccused = () => {
    onConcludeMeeting(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-300">
      <div className="max-w-xl w-full border-2 border-red-600/60 bg-neutral-900/95 rounded-3xl p-5 sm:p-8 shadow-2xl shadow-red-950/60 text-center relative overflow-hidden">
        {/* Header Alert */}
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-red-600/20 border border-red-500/50 flex items-center justify-center mx-auto mb-3 animate-pulse">
          {localDefenseMode ? (
            <Scale className="w-7 h-7 sm:w-8 sm:h-8 text-amber-400" />
          ) : (
            <Bell className="w-7 h-7 sm:w-8 sm:h-8 text-red-400" />
          )}
        </div>

        <div className="inline-block px-3 py-1 rounded-full bg-red-950/70 border border-red-800 text-[11px] font-mono text-red-300 uppercase tracking-widest mb-2">
          {localDefenseMode
            ? '⚖️ El Estrado del Tribunal: Alegato Final'
            : `Asamblea de Emergencia #Ronda ${meetingRound}`}
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
          {localDefenseMode ? '¡Juicio y Alegato de Defensa!' : '¡Tribunal en Sesión!'}
        </h2>

        {!localDefenseMode ? (
          <p className="text-xs sm:text-sm text-neutral-300 mt-1 max-w-md mx-auto leading-relaxed">
            {callerName ? (
              <>
                <strong>{callerName}</strong> ha tocado la alarma en la fiesta. Todos los participantes deben reunirse en el centro de la sala y guardar silencio mientras se debate.
              </>
            ) : (
              'Se ha reportado un suceso crítico. Reúnanse en el centro de la sala para votar si expulsar a un sospechoso.'
            )}
          </p>
        ) : (
          <p className="text-xs sm:text-sm text-amber-200 mt-1 max-w-md mx-auto leading-relaxed font-semibold">
            {currentAccused?.name} ha sido el sospechoso más votado. Tiene 60 segundos de reloj en el centro de la sala para convencer a la fiesta de su inocencia.
          </p>
        )}

        {/* Synchronized Debate Timer or Defense Timer */}
        <div className="mt-4 mb-5 p-3.5 sm:p-4 rounded-2xl bg-black/70 border border-red-500/30 flex items-center justify-around">
          <div>
            <div className="text-[10px] uppercase font-mono text-neutral-400 tracking-wider">
              {localDefenseMode ? 'Tiempo de Defensa' : 'Tiempo de Debate'}
            </div>
            <div className="text-3xl sm:text-4xl font-mono font-black text-red-400 tracking-wider">
              {localDefenseMode ? `${defenseTimerRemaining}s` : formattedTimer}
            </div>
          </div>
          <div className="h-10 w-px bg-neutral-800" />
          <div>
            <div className="text-[10px] uppercase font-mono text-neutral-400 tracking-wider">Votos Emitidos</div>
            <div className="text-2xl sm:text-3xl font-mono font-bold text-white">
              {totalVotesCast} / {alivePlayers.length}
            </div>
          </div>
        </div>

        {/* DEFENSE STAGE: Center Spotlight on Accused */}
        {localDefenseMode && currentAccused && (
          <div className="p-4 rounded-2xl bg-amber-950/40 border-2 border-amber-500/50 text-left space-y-3 mb-5 animate-in zoom-in-95">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{currentAccused.avatar}</span>
              <div>
                <div className="text-xs uppercase font-mono text-amber-400 font-bold">Acusado en el Banquillo:</div>
                <div className="text-lg font-black text-white">{currentAccused.name}</div>
              </div>
            </div>

            <p className="text-xs text-neutral-200 leading-relaxed">
              🎤 <strong>Instrucción Presencial:</strong> {currentAccused.name} debe ponerse de pie en medio del grupo y presentar su coartada. Tras escuchar su alegato, el anfitrión o la mayoría confirmará si se ratifica la expulsión o se concede el perdón.
            </p>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={handlePardonAccused}
                className="py-2.5 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4 text-emerald-400" />
                Perdonar (No Expulsar)
              </button>

              <button
                onClick={() => onConcludeMeeting(currentAccused.id)}
                className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md shadow-red-950/50"
              >
                <X className="w-4 h-4 text-white" />
                Ratificar Expulsión
              </button>
            </div>
          </div>
        )}

        {/* Voting UI */}
        {!localDefenseMode && (
          <>
            {isGhost ? (
              <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 text-neutral-400 text-xs mb-6">
                <ShieldAlert className="w-5 h-5 text-amber-400 mx-auto mb-2" />
                <p className="font-semibold text-neutral-300">Eres un Alma Atormentadora (Eliminado)</p>
                <p className="text-[11px] text-neutral-500 mt-1">
                  Las almas no pueden votar ni hablar en persona durante las asambleas. Observa las reacciones de los vivos en silencio.
                </p>
              </div>
            ) : (
              <div className="space-y-3 mb-5 text-left">
                <div className="flex items-center justify-between text-xs font-bold text-neutral-400 uppercase tracking-wider px-1">
                  <span>Emite tu voto anónimo:</span>
                  <span className="text-[11px] text-rose-400">
                    {selectedTarget ? 'Voto registrado' : 'Pendiente de votar'}
                  </span>
                </div>

                {/* Double Vote Toggle Option from Seven Shop */}
                {hasDoubleVoteToken && (
                  <button
                    onClick={toggleDoubleVote}
                    className={`w-full p-2.5 rounded-xl border text-xs flex items-center justify-between transition ${
                      wantDoubleVote
                        ? 'bg-amber-500/25 border-amber-500 text-amber-200 font-bold shadow-sm'
                        : 'bg-neutral-950/60 border-amber-500/30 text-amber-300/80 hover:border-amber-500/60'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      Ficha de Doble Voto en Inventario:
                    </span>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300">
                      {wantDoubleVote ? '✓ ACTIVADO (x2 Votos)' : 'Hacer Clic para Activar x2'}
                    </span>
                  </button>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-52 overflow-y-auto p-1">
                  {alivePlayers.map((player) => {
                    const isSelected = selectedTarget === player.id;
                    return (
                      <button
                        key={player.id}
                        onClick={() => handleVoteSubmit(player.id)}
                        className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-semibold transition ${
                          isSelected
                            ? 'bg-red-600/30 border-red-500 text-white shadow-sm'
                            : 'bg-neutral-950/70 border-neutral-800 text-neutral-300 hover:border-neutral-700 hover:text-white'
                        }`}
                      >
                        <span className="flex items-center gap-2 truncate">
                          <span>{player.avatar}</span>
                          <span>{player.name}</span>
                        </span>
                        {isSelected && <Check className="w-4 h-4 text-red-400 shrink-0" />}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => handleVoteSubmit('skip')}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-semibold col-span-1 sm:col-span-2 transition ${
                      selectedTarget === 'skip'
                        ? 'bg-neutral-800 border-neutral-600 text-white'
                        : 'bg-neutral-950/50 border-neutral-800 text-neutral-400 hover:text-white'
                    }`}
                  >
                    <span>Saltar Voto (No expulsar a nadie / Abstención)</span>
                    {selectedTarget === 'skip' && <Check className="w-4 h-4 text-neutral-400" />}
                  </button>
                </div>
              </div>
            )}

            {/* Conclude or Proceed to Defense */}
            <button
              onClick={handleProceedToDefenseOrConclude}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-red-950/50 transition flex items-center justify-center gap-1.5"
            >
              <Megaphone className="w-4 h-4" />
              Llamar al Estrado al Más Votado o Revelar Veredicto
            </button>
          </>
        )}
      </div>
    </div>
  );
};
