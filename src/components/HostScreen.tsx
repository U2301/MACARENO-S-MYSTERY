import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import {
  Sun,
  Moon,
  Skull,
  Users,
  Bell,
  Sparkles,
  Flame,
  QrCode,
  Radio,
  Clock,
  RotateCcw,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { GameState, Player } from '../types';

interface HostScreenProps {
  gameState: GameState;
  players: Player[];
  onTriggerEmergency: () => void;
  onTriggerRandomEvent: () => void;
  onAdvancePhase: () => void;
  onResetGame: () => void;
  onOpenNotificationsModal?: () => void;
  onSpinMacarenoWheel?: () => void;
}

export const HostScreen: React.FC<HostScreenProps> = ({
  gameState,
  players,
  onTriggerEmergency,
  onTriggerRandomEvent,
  onAdvancePhase,
  onResetGame,
  onOpenNotificationsModal,
  onSpinMacarenoWheel,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  useEffect(() => {
    // Generate QR code pointing to current URL
    const url = typeof window !== 'undefined' ? window.location.href : 'https://party.app';
    QRCode.toDataURL(url, { width: 180, margin: 1, color: { dark: '#000000', light: '#ffffff' } })
      .then((uri) => setQrDataUrl(uri))
      .catch((err) => console.error(err));
  }, []);

  const aliveCount = players.filter((p) => p.isAlive).length;
  const deadCount = players.filter((p) => !p.isAlive).length;

  const phaseMinutes = Math.floor(gameState.phaseTimeRemaining / 60);
  const phaseSeconds = gameState.phaseTimeRemaining % 60;
  const formattedPhaseTimer = `${phaseMinutes.toString().padStart(2, '0')}:${phaseSeconds
    .toString()
    .padStart(2, '0')}`;

  const isNight = gameState.phase === 'Noche';

  return (
    <div className="space-y-6">
      {/* Top TV Header with Phase Cycle */}
      <div
        className={`p-6 sm:p-8 rounded-3xl border transition-all ${
          isNight
            ? 'bg-gradient-to-br from-indigo-950/60 via-purple-950/40 to-neutral-950 border-purple-800/40 shadow-2xl shadow-purple-950/30'
            : 'bg-gradient-to-br from-amber-950/40 via-neutral-900 to-neutral-950 border-amber-500/30 shadow-2xl shadow-amber-950/20'
        }`}
      >
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center border shadow-inner ${
                isNight
                  ? 'bg-purple-600/20 border-purple-500/50 text-purple-300'
                  : 'bg-amber-500/20 border-amber-400/50 text-amber-300'
              }`}
            >
              {isNight ? <Moon className="w-8 h-8" /> : <Sun className="w-8 h-8" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase tracking-widest text-neutral-400">
                  Ciclo de la Fiesta
                </span>
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                    isNight
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}
                >
                  Fase de {gameState.phase}
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mt-0.5">
                {isNight ? 'Noche Silenciosa' : 'Día Social'}
              </h2>
              <p className="text-xs text-neutral-400 mt-1 max-w-md">
                {isNight
                  ? 'Los asesinos actúan con menor visibilidad y se revelan las fotografías de los investigadores.'
                  : 'Momento de socializar, cumplir tareas orgánicas y debatir sospechas antes de la caída del sol.'}
              </p>
            </div>
          </div>

          {/* Phase Countdown */}
          <div className="bg-black/60 border border-neutral-800 rounded-3xl p-4 sm:p-5 flex items-center gap-5 text-center">
            <div>
              <div className="text-[10px] uppercase font-mono text-neutral-400 tracking-wider">
                Rotación de Fase En:
              </div>
              <div
                className={`text-4xl sm:text-5xl font-mono font-black tracking-wider ${
                  isNight ? 'text-purple-400' : 'text-amber-400'
                }`}
              >
                {formattedPhaseTimer}
              </div>
            </div>
            <button
              onClick={onAdvancePhase}
              title="Avanzar manualmente de fase"
              className="px-3 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-xs font-semibold text-neutral-300 transition"
            >
              Rotar Fase
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Statistics + Room QR Code */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Census and Missions */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-3xl bg-neutral-900/70 border border-neutral-800">
              <div className="flex items-center justify-between text-neutral-400 text-xs font-semibold uppercase">
                <span>Vivos en la Fiesta</span>
                <Users className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-3xl font-black text-emerald-400 mt-2">
                {aliveCount} <span className="text-xs text-neutral-500 font-normal">/ {players.length}</span>
              </div>
              <div className="text-[11px] text-neutral-500 mt-1">Supervivientes activos</div>
            </div>

            <div className="p-5 rounded-3xl bg-neutral-900/70 border border-neutral-800">
              <div className="flex items-center justify-between text-neutral-400 text-xs font-semibold uppercase">
                <span>Bajas Mortales</span>
                <Skull className="w-4 h-4 text-rose-400" />
              </div>
              <div className="text-3xl font-black text-rose-400 mt-2">{deadCount}</div>
              <div className="text-[11px] text-neutral-500 mt-1">Almas atormentadoras</div>
            </div>

            <div className="p-5 rounded-3xl bg-neutral-900/70 border border-neutral-800">
              <div className="flex items-center justify-between text-neutral-400 text-xs font-semibold uppercase">
                <span>Progreso Colectivo</span>
                <Sparkles className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-3xl font-black text-amber-400 mt-2">
                {Math.round(gameState.collectiveTaskProgress)}%
              </div>
              <div className="text-[11px] text-neutral-500 mt-1">Meta de victoria inocente</div>
            </div>
          </div>

          {/* Collective Progress Bar */}
          <div className="p-6 rounded-3xl bg-neutral-900/70 border border-neutral-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-neutral-300">
              <span>Barra de Misiones Colectivas de los Invitados</span>
              <span className="text-amber-400 font-mono">
                {Math.round(gameState.collectiveTaskProgress)}% / 100%
              </span>
            </div>
            <div className="w-full bg-neutral-950 h-3.5 rounded-full overflow-hidden border border-neutral-800">
              <div
                className="bg-gradient-to-r from-amber-500 to-rose-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, gameState.collectiveTaskProgress)}%` }}
              />
            </div>
            <p className="text-[11px] text-neutral-500">
              Si los inocentes logran completar el 100% de las misiones orgánicas antes de que los asesinos igualen en número a los vivos, ¡la Fiesta gana automáticamente!
            </p>
          </div>

          {/* Autonomous Host Quick Actions */}
          <div className="p-6 rounded-3xl bg-neutral-900/70 border border-neutral-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3 flex items-center gap-2">
              <Radio className="w-4 h-4 text-rose-400" />
              Controles Autónomos del Juego
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {onSpinMacarenoWheel && (
                <button
                  onClick={onSpinMacarenoWheel}
                  className="p-3.5 rounded-2xl bg-neutral-950 hover:bg-neutral-900 border border-neutral-800 hover:border-amber-500/60 text-left transition group"
                >
                  <Sparkles className="w-4 h-4 text-amber-400 mb-1 group-hover:rotate-12 transition-transform" />
                  <div className="text-xs font-bold text-white">Girar Ruleta de Macareno</div>
                  <div className="text-[10px] text-neutral-400 mt-0.5">Activa el evento del gato místico.</div>
                </button>
              )}

              {onOpenNotificationsModal && (
                <button
                  onClick={onOpenNotificationsModal}
                  className="p-3.5 rounded-2xl bg-neutral-950 hover:bg-neutral-900 border border-neutral-800 hover:border-emerald-500/60 text-left transition"
                >
                  <Radio className="w-4 h-4 text-emerald-400 mb-1" />
                  <div className="text-xs font-bold text-white">Alerta Push a Celulares</div>
                  <div className="text-[10px] text-neutral-400 mt-0.5">Haz sonar y vibrar todos los teléfonos.</div>
                </button>
              )}

              <button
                onClick={onTriggerRandomEvent}
                className="p-3.5 rounded-2xl bg-neutral-950 hover:bg-neutral-900 border border-neutral-800 hover:border-amber-500/50 text-left transition"
              >
                <Flame className="w-4 h-4 text-amber-400 mb-1" />
                <div className="text-xs font-bold text-white">Disparar Evento Grupal</div>
                <div className="text-[10px] text-neutral-400 mt-0.5">Brote, silencio o brindis masivo.</div>
              </button>

              <button
                onClick={onTriggerEmergency}
                className="p-3.5 rounded-2xl bg-neutral-950 hover:bg-neutral-900 border border-neutral-800 hover:border-red-500/50 text-left transition"
              >
                <Bell className="w-4 h-4 text-red-400 mb-1" />
                <div className="text-xs font-bold text-white">Sonar Sirena de Asamblea</div>
                <div className="text-[10px] text-neutral-400 mt-0.5">Llama a todos al centro de la casa.</div>
              </button>

              <button
                onClick={onResetGame}
                className="p-3.5 rounded-2xl bg-neutral-950 hover:bg-neutral-900 border border-neutral-800 hover:border-emerald-500/50 text-left transition"
              >
                <RotateCcw className="w-4 h-4 text-emerald-400 mb-1" />
                <div className="text-xs font-bold text-white">Reiniciar Partida</div>
                <div className="text-[10px] text-neutral-400 mt-0.5">Nuevos roles y vidas al 100%.</div>
              </button>
            </div>
          </div>
        </div>

        {/* Right Col: QR Code to Join from Phone */}
        <div className="p-6 rounded-3xl bg-neutral-900/70 border border-neutral-800 flex flex-col items-center text-center justify-center">
          <div className="p-3 bg-white rounded-2xl shadow-xl mb-4">
            {qrDataUrl ? (
              <img src={qrDataUrl} alt="Escanear QR para unirse" className="w-40 h-40" />
            ) : (
              <div className="w-40 h-40 bg-neutral-200 animate-pulse rounded-xl" />
            )}
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-950 border border-neutral-800 text-[11px] font-mono text-rose-400 font-bold tracking-widest mb-2">
            SALA: {gameState.roomCode}
          </div>

          <h4 className="text-sm font-bold text-white mb-1">Únete desde tu Celular</h4>
          <p className="text-xs text-neutral-400 leading-relaxed max-w-xs">
            Apunta con la cámara de tu smartphone para abrir tu pantalla de jugador privada. Cada uno tendrá su propio rol protegido por PIN.
          </p>
        </div>
      </div>
    </div>
  );
};
