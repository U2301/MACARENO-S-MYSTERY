import React from 'react';
import { ShieldAlert, ZapOff, Radio } from 'lucide-react';

interface HackerGlitchOverlayProps {
  timeRemainingSeconds: number;
}

export const HackerGlitchOverlay: React.FC<HackerGlitchOverlayProps> = ({
  timeRemainingSeconds,
}) => {
  const minutes = Math.floor(timeRemainingSeconds / 60);
  const seconds = timeRemainingSeconds % 60;
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds
    .toString()
    .padStart(2, '0')}`;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center select-none overflow-hidden animate-pulse">
      {/* Glitch CRT lines effect */}
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.85)_50%)] bg-[length:100%_4px]" />

      <div className="relative z-10 max-w-md w-full border border-red-600/60 bg-red-950/40 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-red-900/60">
        <div className="w-16 h-16 rounded-2xl bg-red-600/20 border border-red-500/40 flex items-center justify-center mx-auto mb-4 animate-bounce">
          <ZapOff className="w-8 h-8 text-red-500" />
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950 border border-red-800 text-[11px] font-mono text-red-400 uppercase tracking-widest mb-3">
          <Radio className="w-3.5 h-3.5 animate-spin" />
          INTERFERENCIA CIBERNÉTICA ACTIVA
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase mb-2">
          Dispositivo Bloqueado
        </h2>

        <p className="text-xs sm:text-sm text-red-200/80 mb-6 leading-relaxed">
          El Cómplice / Hacker ha emitido un pulso electromagnético masivo. Todas las telecomunicaciones y habilidades de los inocentes se encuentran temporalmente congeladas.
        </p>

        {/* Big Glitch Countdown */}
        <div className="bg-black/80 border border-red-500/40 rounded-2xl p-4 mb-4">
          <div className="text-[10px] uppercase font-mono tracking-widest text-red-400/80 mb-1">
            Restablecimiento del Sistema En:
          </div>
          <div className="text-4xl sm:text-5xl font-mono font-black text-red-500 tracking-wider">
            {formattedTime}
          </div>
        </div>

        <div className="text-[11px] text-neutral-400 flex items-center justify-center gap-1.5">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>¡Mantente alerta en la fiesta! No bajes la guardia mientras estás sin señal.</span>
        </div>
      </div>
    </div>
  );
};
