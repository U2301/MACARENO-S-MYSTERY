import React, { useState } from 'react';
import { Target, CheckCircle2, Circle, Flame, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { PlayerMission } from '../types';

interface MissionsPanelProps {
  missions: PlayerMission[];
  isAlive: boolean;
  onAdvanceMission: (missionId: string) => void;
}

export const MissionsPanel: React.FC<MissionsPanelProps> = ({
  missions,
  isAlive,
  onAdvanceMission,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(missions[0]?.id || null);

  const completedCount = missions.filter((m) => m.completed).length;
  const overallPercentage = Math.round((completedCount / (missions.length || 1)) * 100);

  return (
    <div className="rounded-3xl border border-neutral-800 bg-neutral-900/80 p-5 sm:p-6 backdrop-blur shadow-xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-amber-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-300">
            {isAlive ? 'Tus 5 Misiones Orgánicas' : '5 Tareas Espectrales de Ultratumba'}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-amber-400">
            {completedCount}/{missions.length} completadas
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono">
            {overallPercentage}%
          </span>
        </div>
      </div>

      {/* Collective Mini-Progress */}
      <div className="w-full bg-neutral-950 h-2 rounded-full overflow-hidden border border-neutral-800">
        <div
          className="bg-gradient-to-r from-amber-500 to-rose-500 h-full rounded-full transition-all duration-500"
          style={{ width: `${overallPercentage}%` }}
        />
      </div>

      {/* Mission List */}
      <div className="space-y-2.5">
        {missions.map((m, idx) => {
          const isExpanded = expandedId === m.id;
          const isShadowMission = m.type === 'sombra';

          return (
            <div
              key={m.id}
              className={`p-3.5 rounded-2xl border transition-all ${
                m.completed
                  ? 'bg-emerald-950/20 border-emerald-600/30'
                  : isShadowMission
                  ? 'bg-rose-950/20 border-rose-800/40 hover:border-rose-700/60'
                  : 'bg-neutral-950/80 border-neutral-800 hover:border-neutral-700'
              }`}
            >
              <div
                onClick={() => setExpandedId(isExpanded ? null : m.id)}
                className="flex items-center justify-between cursor-pointer gap-2"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {m.completed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : isShadowMission ? (
                    <Flame className="w-4 h-4 text-rose-400 shrink-0" />
                  ) : (
                    <Circle className="w-4 h-4 text-neutral-500 shrink-0" />
                  )}
                  <span
                    className={`text-xs font-bold truncate ${
                      m.completed
                        ? 'text-emerald-300 line-through'
                        : isShadowMission
                        ? 'text-rose-200'
                        : 'text-white'
                    }`}
                  >
                    {idx + 1}. {m.title}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {m.rewardCoins && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300">
                      🪙 +{m.rewardCoins}
                    </span>
                  )}
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-400">
                    {m.currentCount}/{m.targetCount}
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-3.5 h-3.5 text-neutral-400" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
                  )}
                </div>
              </div>

              {isExpanded && (
                <div className="mt-3 pt-2.5 border-t border-neutral-800/80 space-y-3 animate-in fade-in duration-150">
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    {m.description}
                  </p>

                  {isShadowMission && (
                    <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-900/40 text-[11px] text-rose-300 leading-tight">
                      ⚠️ <strong>Misión Sospechosa de Sombra:</strong> Esta acción llama la atención en la vida real. Si la completas ganas monedas, pero avanzas la meta colectiva de la fiesta (+7%) y dejas pistas al bando de los inocentes.
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-neutral-400 font-mono">
                      {m.type === 'sombra'
                        ? '🩸 Bando Sombras'
                        : m.type === 'lore'
                        ? '🔥 Lore del Grupo'
                        : m.type === 'desafio'
                        ? '⚡ Desafío'
                        : m.type === 'fantasma'
                        ? '👻 Alma en Pena'
                        : '👥 Social'}
                    </span>

                    <button
                      onClick={() => onAdvanceMission(m.id)}
                      disabled={m.completed}
                      className={`px-3 py-1.5 rounded-xl disabled:opacity-40 text-xs font-bold transition flex items-center gap-1.5 border ${
                        isShadowMission
                          ? 'bg-rose-900/60 hover:bg-rose-800/80 text-rose-100 border-rose-700/50'
                          : 'bg-neutral-800 hover:bg-neutral-750 text-neutral-200 border-neutral-700'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      {m.completed ? '¡Logrado!' : 'Marcar Avance (+1)'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
