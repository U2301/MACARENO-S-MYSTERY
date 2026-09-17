import React from 'react';
import { Sparkles, Gift, BookOpen, X, Clock } from 'lucide-react';
import { MacarenoWheelEvent, Player } from '../types';

interface MacarenoWheelBannerProps {
  event: MacarenoWheelEvent | null;
  timeRemaining: number;
  currentPlayer: Player;
  onOpenModal: () => void;
  onCollectMigajas: () => void;
  onDismiss: () => void;
}

export const MacarenoWheelBanner: React.FC<MacarenoWheelBannerProps> = ({
  event,
  timeRemaining,
  currentPlayer,
  onOpenModal,
  onCollectMigajas,
  onDismiss,
}) => {
  if (!event || timeRemaining <= 0) return null;

  const isAssignedToMe = currentPlayer.id === event.assignedPlayerId;

  return (
    <div className="fixed top-14 left-3 right-3 z-30 max-w-md mx-auto pointer-events-auto animate-in slide-in-from-top-2 duration-200">
      <div className="p-2.5 sm:p-3 rounded-2xl bg-neutral-900/95 border-2 border-amber-500/80 backdrop-blur-xl shadow-xl shadow-amber-950/40 text-left">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xl shrink-0">🐱💀</span>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wide">
                  Ruleta de Macareno
                </span>
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300">
                  ⏳ {timeRemaining}s
                </span>
              </div>
              <div className="text-xs font-bold text-white truncate">
                {event.title}
              </div>
            </div>
          </div>

          <button
            onClick={onDismiss}
            className="p-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition shrink-0"
            title="Ocultar aviso de ruleta"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Quick action buttons row */}
        <div className="mt-2 pt-2 border-t border-neutral-800 flex items-center gap-2">
          <button
            onClick={onOpenModal}
            className="flex-1 py-1.5 px-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-[11px] font-bold flex items-center justify-center gap-1 transition"
          >
            <BookOpen className="w-3 h-3" />
            <span>Leer Detalles e Instrucciones</span>
          </button>

          {event.effectType === 'migajas' && !event.migajasCollected && (
            <button
              onClick={onCollectMigajas}
              className="py-1.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white text-[11px] font-black flex items-center gap-1 animate-pulse"
            >
              <Gift className="w-3 h-3" />
              <span>¡Migajas! (+10🪙)</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
