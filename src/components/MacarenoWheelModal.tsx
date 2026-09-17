import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Trophy, Skull, Clock, Gift, Volume2, X, MessageSquare, FastForward, Minimize2, Check } from 'lucide-react';
import { MacarenoWheelEvent, Player } from '../types';
import { MACARENO_SLICES } from '../data/macarenoWheel';
import { soundManager } from '../utils/audio';

interface MacarenoWheelModalProps {
  isOpen: boolean;
  event: MacarenoWheelEvent | null;
  currentPlayer: Player;
  isHost?: boolean;
  timeRemaining: number;
  isAlreadySpun?: boolean;
  onCollectMigajas?: () => void;
  onClose?: () => void;
  onForceSpin?: () => void;
  onDismissForAll?: () => void;
}

export const MacarenoWheelModal: React.FC<MacarenoWheelModalProps> = ({
  isOpen,
  event,
  currentPlayer,
  isHost,
  timeRemaining,
  isAlreadySpun = false,
  onCollectMigajas,
  onClose,
  onForceSpin,
  onDismissForAll,
}) => {
  const [rotation, setRotation] = useState<number>(0);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [hasLanded, setHasLanded] = useState<boolean>(false);
  const lastSpunEventIdRef = useRef<string | null>(null);

  // Calculate rotation angle so that the pointer lands on event.sliceIndex
  const totalSlices = MACARENO_SLICES.length;
  const sliceAngle = 360 / totalSlices;

  const calculateTargetAngle = (sliceIndex: number) => {
    const targetSliceCenter = sliceIndex * sliceAngle + sliceAngle / 2;
    const spins = 5 * 360;
    return spins + (360 - targetSliceCenter);
  };

  useEffect(() => {
    if (!isOpen || !event) return;

    const finalAngle = calculateTargetAngle(event.sliceIndex);

    // If already spun previously for this exact event, don't spin again!
    if (isAlreadySpun || lastSpunEventIdRef.current === event.id) {
      setRotation(finalAngle);
      setIsSpinning(false);
      setHasLanded(true);
      return;
    }

    lastSpunEventIdRef.current = event.id;
    setIsSpinning(true);
    setHasLanded(false);
    soundManager.playTick();

    const spinTimer = setTimeout(() => {
      setRotation(finalAngle);
    }, 50);

    const landTimer = setTimeout(() => {
      setIsSpinning(false);
      setHasLanded(true);
      soundManager.playSuccess();
    }, 3600);

    return () => {
      clearTimeout(spinTimer);
      clearTimeout(landTimer);
    };
  }, [isOpen, event?.id, isAlreadySpun]);

  const handleSkipSpin = () => {
    if (!event) return;
    const finalAngle = calculateTargetAngle(event.sliceIndex);
    setRotation(finalAngle);
    setIsSpinning(false);
    setHasLanded(true);
    soundManager.playSuccess();
  };

  if (!isOpen || !event) return null;

  const currentDef = MACARENO_SLICES[event.sliceIndex] || MACARENO_SLICES[0];
  const isAssignedToMe = currentPlayer.id === event.assignedPlayerId;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl overflow-y-auto p-3 sm:p-5 flex flex-col items-center justify-start sm:justify-center animate-in fade-in duration-200">
      <div className="max-w-md sm:max-w-lg w-full bg-neutral-900 border-2 border-amber-500/60 rounded-3xl p-4 sm:p-6 shadow-2xl shadow-amber-950/50 text-center relative overflow-hidden my-auto shrink-0">
        {/* Glow ambient background */}
        <div className="absolute -top-24 -left-24 w-60 h-60 bg-amber-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Top Control Bar: Minimize and Close are ALWAYS available */}
        <div className="flex items-center justify-between mb-2 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-[10px] font-mono text-amber-300 uppercase tracking-widest">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Ruleta de Macareno</span>
          </div>

          <div className="flex items-center gap-1.5">
            {isSpinning && (
              <button
                onClick={handleSkipSpin}
                className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-[10px] text-amber-300 font-bold flex items-center gap-1 transition active:scale-95"
                title="Saltar animación y ver resultado"
              >
                <FastForward className="w-3 h-3" />
                <span>Detener y Leer</span>
              </button>
            )}

            {onClose && (
              <button
                onClick={onClose}
                className="p-1.5 rounded-full bg-neutral-800/80 hover:bg-neutral-700 text-neutral-400 hover:text-white transition"
                title="Minimizar ventana"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Title */}
        <h2 className="text-lg sm:text-2xl font-black text-white uppercase tracking-tight mb-1">
          {isSpinning ? '¡Macareno está girando el destino!' : currentDef.title}
        </h2>

        <p className="text-xs text-neutral-300 max-w-sm mx-auto mb-3">
          {isSpinning
            ? 'El gato místico (mitad felino negro, mitad calavera huesuda) elige el evento de hoy...'
            : event.lore}
        </p>

        {/* Interactive Roulette Stage */}
        <div className="relative w-44 h-44 sm:w-60 sm:h-60 mx-auto my-2 flex items-center justify-center">
          {/* Top Indicator Needle */}
          <div className="absolute -top-3 z-30 flex flex-col items-center">
            <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[16px] border-t-amber-400 drop-shadow-[0_2px_8px_rgba(245,158,11,0.8)]" />
          </div>

          {/* Spinning Wheel SVG */}
          <div
            className={`w-full h-full rounded-full border-4 border-amber-500/80 shadow-2xl overflow-hidden ${
              isSpinning
                ? 'transition-transform duration-[3600ms] cubic-bezier(0.15, 0.9, 0.2, 1)'
                : 'transition-none'
            }`}
            style={{ transform: `rotate(${rotation}deg)` }}
          >
            <svg viewBox="0 0 100 100" className="w-full h-full">
              {MACARENO_SLICES.map((slice, i) => {
                const total = MACARENO_SLICES.length;
                const angle = 360 / total;
                const startAngle = i * angle;
                const endAngle = (i + 1) * angle;

                // SVG Arc math
                const startRad = ((startAngle - 90) * Math.PI) / 180;
                const endRad = ((endAngle - 90) * Math.PI) / 180;
                const x1 = 50 + 50 * Math.cos(startRad);
                const y1 = 50 + 50 * Math.sin(startRad);
                const x2 = 50 + 50 * Math.cos(endRad);
                const y2 = 50 + 50 * Math.sin(endRad);

                const d = `M 50 50 L ${x1} ${y1} A 50 50 0 0 1 ${x2} ${y2} Z`;

                return (
                  <g key={slice.index}>
                    <path d={d} fill={slice.color} opacity={0.9} stroke="#171717" strokeWidth="0.8" />
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Center Hub: Macareno illustration (Half Cat / Half Skeleton) */}
          <div className="absolute z-20 w-16 h-16 sm:w-22 sm:h-22 rounded-full bg-neutral-950 border-3 border-amber-400 shadow-2xl flex items-center justify-center overflow-hidden">
            <svg viewBox="0 0 120 120" className="w-full h-full p-0.5">
              <defs>
                <clipPath id="left-half-cat">
                  <rect x="0" y="0" width="60" height="120" />
                </clipPath>
                <clipPath id="right-half-skel">
                  <rect x="60" y="0" width="60" height="120" />
                </clipPath>
                <radialGradient id="catEyeGlowModal" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#4ade80" />
                  <stop offset="100%" stopColor="#15803d" />
                </radialGradient>
                <radialGradient id="skelEyeGlowModal" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#c084fc" />
                  <stop offset="100%" stopColor="#6b21a8" />
                </radialGradient>
              </defs>

              <circle cx="60" cy="60" r="56" fill="#0a0a0a" />

              {/* LEFT HALF: Black Cat */}
              <g clipPath="url(#left-half-cat)">
                <polygon points="25,48 35,15 54,38" fill="#1c1917" stroke="#44403c" strokeWidth="1.5" />
                <polygon points="30,42 38,22 48,38" fill="#ec4899" opacity="0.6" />
                <path d="M 60,35 Q 26,38 28,68 Q 30,95 60,98 Z" fill="#1c1917" />
                <ellipse cx="44" cy="58" rx="8" ry="11" fill="url(#catEyeGlowModal)" />
                <ellipse cx="44" cy="58" rx="2" ry="9" fill="#022c22" />
                <polygon points="56,74 60,78 60,74" fill="#f43f5e" />
              </g>

              {/* RIGHT HALF: Skeleton Cat */}
              <g clipPath="url(#right-half-skel)">
                <polygon points="95,48 85,15 66,38" fill="#e5e5e5" stroke="#737373" strokeWidth="1.5" />
                <polygon points="90,42 82,22 72,38" fill="#404040" opacity="0.7" />
                <path d="M 60,35 Q 94,38 92,68 Q 90,95 60,98 Z" fill="#e5e5e5" />
                <circle cx="76" cy="58" r="9" fill="#171717" stroke="#525252" strokeWidth="1.5" />
                <circle cx="76" cy="58" r="4" fill="url(#skelEyeGlowModal)" />
                <line x1="60" y1="88" x2="84" y2="88" stroke="#171717" strokeWidth="2" />
              </g>

              <line x1="60" y1="18" x2="60" y2="108" stroke="#eab308" strokeWidth="2" strokeDasharray="3 2" />
            </svg>
          </div>
        </div>

        {/* Read Panel / Action Panel */}
        <div className="mt-3 p-3.5 rounded-2xl bg-neutral-950 border border-amber-500/40 text-left space-y-2.5">
          <div className="flex items-center justify-between flex-wrap gap-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
              Elegido por Macareno:
            </span>
            <span
              className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-md ${
                isAssignedToMe
                  ? 'bg-rose-500 text-white animate-pulse'
                  : 'bg-amber-500/20 text-amber-300'
              }`}
            >
              {event.assignedPlayerName} {isAssignedToMe && '(¡ERES TÚ!)'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-200 leading-relaxed font-sans">
            <div className="font-bold text-amber-300 mb-1 flex items-center gap-1.5">
              <span>Instrucciones del evento:</span>
            </div>
            {event.instructions}
          </div>

          {/* Special Interactive Event: Las Migajas de Luisda Quick Tap */}
          {event.effectType === 'migajas' && (
            <div className="pt-1">
              {event.migajasCollected ? (
                <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-xs text-center font-bold">
                  ✓ ¡{event.migajasCollectorName} fue el más rápido y recogió las migajas (+10 monedas)!
                </div>
              ) : (
                <button
                  onClick={onCollectMigajas}
                  className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2 active:scale-95 transition"
                >
                  <Gift className="w-4 h-4 text-emerald-200" />
                  ¡RECOGER LAS MIGAJAS DE LUISDA! (+10 🪙)
                </button>
              )}
            </div>
          )}

          {/* Remaining Event Timer & Close Buttons */}
          <div className="flex items-center justify-between text-[11px] text-neutral-400 pt-1 border-t border-neutral-800">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              Tiempo restante:
            </span>
            <span className="font-mono font-bold text-amber-300">
              {Math.max(0, timeRemaining)}s restantes
            </span>
          </div>
        </div>

        {/* Bottom Actions for Cellphones */}
        <div className="mt-3 flex items-center gap-2">
          {onClose && (
            <button
              onClick={onClose}
              className="flex-1 py-2.5 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition active:scale-95"
            >
              <Minimize2 className="w-3.5 h-3.5" />
              <span>Minimizar / Entendido</span>
            </button>
          )}

          {isHost && onDismissForAll && (
            <button
              onClick={onDismissForAll}
              className="py-2.5 px-3 rounded-xl bg-red-950/60 hover:bg-red-900/80 border border-red-500/40 text-red-300 text-xs font-bold transition active:scale-95"
              title="Cierra el evento para todos los jugadores"
            >
              Cerrar para Todos
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
