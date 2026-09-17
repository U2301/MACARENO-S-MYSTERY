import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  X,
  Users,
  Shield,
  Skull,
  Sparkles,
  Sun,
  Moon,
  AlertTriangle,
  Flame,
  CheckCircle2,
  Lock,
  Wine,
  Stethoscope,
  Camera,
  Briefcase,
  Zap,
  Eye,
  HelpCircle,
  Clock,
  Compass,
  FileQuestion,
  ChevronRight
} from 'lucide-react';
import { ROLES_CATALOG, RECOMMENDED_SETUP_TABLE, RoleDefinition } from '../data/roles';
import { RoleFamily, RoleType } from '../types';

interface RoleCompendiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialRole?: RoleType | null;
}

export const RoleCompendiumModal: React.FC<RoleCompendiumModalProps> = ({
  isOpen,
  onClose,
  initialRole,
}) => {
  const [activeTab, setActiveTab] = useState<'compendium' | 'instructions' | 'setup_table'>(
    initialRole ? 'compendium' : 'compendium'
  );
  const [selectedFamily, setSelectedFamily] = useState<RoleFamily | 'Todos'>('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedRole, setExpandedRole] = useState<RoleType | null>(initialRole || null);

  if (!isOpen) return null;

  // Filter roles
  const rolesList = Object.values(ROLES_CATALOG).filter((r) => {
    // Hide aliases that are duplicates in catalog display if redundant, but keep key unique ones
    const isAlias = ['El Escolta', 'El Borracho', 'El Paranoico', 'El Recluso', 'El Santo', 'El Cómplice / Hacker', 'Asesino'].includes(r.type);
    if (isAlias) return false;
    if (r.family === 'Ultratumba') return true;

    const matchesFamily = selectedFamily === 'Todos' || r.family === selectedFamily;
    const matchesSearch =
      r.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.abilityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.tagline.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFamily && matchesSearch;
  });

  const families: (RoleFamily | 'Todos')[] = [
    'Todos',
    'Invitados Distinguidos',
    'Excéntricos y Problemáticos',
    'Los Cómplices',
    'Las Sombras Supremos',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-white flex items-center gap-1.5">
                <span>Enciclopedia de Roles & Guía de Fiesta</span>
              </h2>
              <p className="text-[11px] text-neutral-400">
                Reglas presenciales, códigos de 4 dígitos y catálogo completo
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white rounded-xl bg-neutral-800/80 hover:bg-neutral-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-neutral-800 bg-neutral-950/40 px-3 pt-2 gap-1.5 overflow-x-auto text-xs font-bold">
          <button
            onClick={() => setActiveTab('compendium')}
            className={`px-3 py-2 rounded-t-xl transition flex items-center gap-1.5 border-b-2 whitespace-nowrap ${
              activeTab === 'compendium'
                ? 'border-rose-500 text-rose-400 bg-neutral-900'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Catálogo de Roles (25)</span>
          </button>

          <button
            onClick={() => setActiveTab('instructions')}
            className={`px-3 py-2 rounded-t-xl transition flex items-center gap-1.5 border-b-2 whitespace-nowrap ${
              activeTab === 'instructions'
                ? 'border-rose-500 text-rose-400 bg-neutral-900'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Reglas & Mecánicas</span>
          </button>

          <button
            onClick={() => setActiveTab('setup_table')}
            className={`px-3 py-2 rounded-t-xl transition flex items-center gap-1.5 border-b-2 whitespace-nowrap ${
              activeTab === 'setup_table'
                ? 'border-rose-500 text-rose-400 bg-neutral-900'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Tabla de Balanceo (7-25)</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* TAB 1: ROLES COMPENDIUM */}
          {activeTab === 'compendium' && (
            <div className="space-y-3.5">
              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Buscar rol, habilidad o palabra clave..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-rose-500 transition"
                />
              </div>

              {/* Family Filters */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 text-[11px]">
                {families.map((fam) => (
                  <button
                    key={fam}
                    onClick={() => setSelectedFamily(fam)}
                    className={`px-2.5 py-1 rounded-xl font-bold whitespace-nowrap border transition ${
                      selectedFamily === fam
                        ? 'bg-rose-950/60 border-rose-500/50 text-rose-300'
                        : 'bg-neutral-950/80 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    {fam === 'Invitados Distinguidos' && '🌟 '}
                    {fam === 'Excéntricos y Problemáticos' && '🎭 '}
                    {fam === 'Los Cómplices' && '🗡️ '}
                    {fam === 'Las Sombras Supremos' && '👁️ '}
                    {fam}
                  </button>
                ))}
              </div>

              {/* Roles Cards List */}
              <div className="space-y-2.5">
                {rolesList.map((r) => {
                  const isExpanded = expandedRole === r.type;
                  const isEvil = r.team === 'Sombras (Asesinos)';
                  const isChaos = r.team === 'Caos (Independiente)';

                  return (
                    <div
                      key={r.type}
                      className={`rounded-2xl border transition-all overflow-hidden ${
                        isExpanded
                          ? isEvil
                            ? 'bg-rose-950/20 border-rose-600/50'
                            : isChaos
                            ? 'bg-amber-950/20 border-amber-500/50'
                            : 'bg-neutral-950 border-neutral-700'
                          : 'bg-neutral-950/80 border-neutral-800 hover:border-neutral-700'
                      }`}
                    >
                      {/* Card Summary Row */}
                      <button
                        onClick={() => setExpandedRole(isExpanded ? null : r.type)}
                        className="w-full p-3.5 text-left flex items-center justify-between gap-2"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${
                              isEvil
                                ? 'bg-rose-950 border border-rose-700 text-rose-300'
                                : isChaos
                                ? 'bg-amber-950 border border-amber-700 text-amber-300'
                                : 'bg-emerald-950 border border-emerald-700 text-emerald-300'
                            }`}
                          >
                            {isEvil ? '👁️' : isChaos ? '🎭' : '🌟'}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-xs font-black text-white">{r.type}</h3>
                              <span
                                className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold uppercase ${
                                  isEvil
                                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                    : isChaos
                                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                }`}
                              >
                                {r.team.split(' ')[0]}
                              </span>
                            </div>
                            <p className="text-[11px] text-neutral-400 mt-0.5 line-clamp-1">{r.tagline}</p>
                          </div>
                        </div>

                        <ChevronRight
                          className={`w-4 h-4 text-neutral-500 transition-transform ${
                            isExpanded ? 'rotate-90 text-rose-400' : ''
                          }`}
                        />
                      </button>

                      {/* Expanded Details */}
                      {isExpanded && (
                        <div className="p-3.5 pt-0 border-t border-neutral-800/80 space-y-3 text-xs text-neutral-300">
                          <div className="mt-2.5 p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-1">
                            <span className="text-[10px] uppercase font-bold text-neutral-400">
                              Familia & Clasificación
                            </span>
                            <div className="flex items-center gap-2 text-white font-medium">
                              <span>{r.family}</span>
                              <span className="text-neutral-500">•</span>
                              <span className="text-neutral-300">{r.phaseDependence}</span>
                            </div>
                          </div>

                          <p className="text-[12px] text-neutral-300 leading-relaxed">{r.description}</p>

                          {/* Physical Pact Requirement (Presencial) */}
                          {r.pactRequirement && (
                            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 space-y-0.5">
                              <div className="font-bold flex items-center gap-1.5 text-[11px]">
                                <Lock className="w-3.5 h-3.5 text-amber-400" />
                                <span>Pacto Presencial con Código Secreto:</span>
                              </div>
                              <p className="text-[11px] text-amber-200/90">{r.pactRequirement}</p>
                            </div>
                          )}

                          {/* Ability Details */}
                          <div className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-1">
                            <div className="text-[11px] font-bold text-rose-400 flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>Habilidad: {r.abilityName}</span>
                            </div>
                            <p className="text-[11px] text-neutral-400 leading-normal">{r.abilityDescription}</p>
                          </div>

                          {/* Rules Checklist */}
                          <div className="space-y-1.5">
                            <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
                              Reglas Operativas
                            </span>
                            <ul className="space-y-1 text-[11px] text-neutral-300">
                              {r.rules.map((rule, idx) => (
                                <li key={idx} className="flex items-start gap-1.5">
                                  <span className="text-rose-400 shrink-0 font-bold">•</span>
                                  <span>{rule}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Win Condition */}
                          <div className="pt-1 text-[11px] text-neutral-400 border-t border-neutral-800/80">
                            <strong className="text-white">Condición de Victoria:</strong> {r.winCondition}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: INSTRUCTIONS & MECHANICS */}
          {activeTab === 'instructions' && (
            <div className="space-y-4 text-xs text-neutral-300 leading-relaxed">
              {/* Core Philosophy */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-rose-950/40 via-neutral-900 to-neutral-950 border border-rose-500/30 space-y-2">
                <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                  <Flame className="w-4 h-4 text-rose-400 animate-pulse" />
                  <span>Filosofía del Juego Presencial</span>
                </div>
                <p className="text-neutral-300 text-[12px]">
                  Macareno's Mystery no es un juego pasivo de móvil. Es un <strong>juego social presencial</strong> inspirado en <em>Blood on the Clocktower</em> y <em>Mafia</em>, donde el teléfono actúa únicamente como tu <strong>Árbitro IA confidencial</strong>. Habla, pacta alianzas y observa los ojos de tus amigos en la sala real.
                </p>
              </div>

              {/* 1. Ciclo de Información */}
              <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2">
                <div className="flex items-center gap-2 font-bold text-white text-xs">
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span>1. El Ciclo: "Acción en el Día → Revelación en la Noche"</span>
                </div>
                <p className="text-neutral-400 text-[11px]">
                  Para evitar meta-confirmaciones instantáneas en medio de la fiesta:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2.5 rounded-xl bg-amber-950/20 border border-amber-500/20 text-amber-200 space-y-1">
                    <strong className="text-amber-400 block">☀️ El Día (Acción Física):</strong>
                    Conversa cara a cara, ingresa códigos secretos, saca fotos con la cámara y cumple misiones sociales de fiesta.
                  </div>
                  <div className="p-2.5 rounded-xl bg-purple-950/20 border border-purple-500/20 text-purple-200 space-y-1">
                    <strong className="text-purple-400 block">🌙 La Noche (Procesamiento):</strong>
                    Las luces disminuyen. Las Sombras atacan y el Árbitro IA entrega en privado a tu <strong>Buzón Nocturno</strong> los negativos revelados, peritajes forenses y cotejos de rumores.
                  </div>
                </div>
              </div>

              {/* 2. El Pacto Presencial */}
              <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2">
                <div className="flex items-center gap-2 font-bold text-white text-xs">
                  <Lock className="w-4 h-4 text-indigo-400" />
                  <span>2. El "Pacto Presencial": Códigos de 4 Dígitos</span>
                </div>
                <p className="text-neutral-400 text-[11px]">
                  Nadie puede jugar aislado desde un rincón. Cada invitado tiene un <strong>Código Secreto de 4 dígitos</strong> generado al inicio:
                </p>
                <ul className="space-y-1.5 text-[11px] text-neutral-300">
                  <li className="flex items-start gap-1.5">
                    <span className="text-rose-400 font-bold">•</span>
                    <span><strong>El Asesino:</strong> Debe acorralar a su víctima a solas, susurrarle "¿Qué traes allí?" y pedir su código para ejecutar la baja.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-indigo-400 font-bold">•</span>
                    <span><strong>El Guardaespaldas:</strong> Debe hablar cara a cara con su protegido y solicitar su código para vincular el escudo nocturno.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-violet-400 font-bold">•</span>
                    <span><strong>El Sommelier:</strong> Brinda cara a cara con su invitado e ingresa su código para emborracharlo.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span><strong>El Médico:</strong> Pide el código presencial al herido o envenenado para inyectarle el antídoto.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-blue-400 font-bold">•</span>
                    <span><strong>El Abogado Defensor:</strong> Registra el código de su cliente para ampararlo contra linchamientos en la asamblea.</span>
                  </li>
                </ul>
              </div>

              {/* 3. Mecánicas Complejas sin Narrador */}
              <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2.5">
                <div className="flex items-center gap-2 font-bold text-white text-xs">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>3. Mecánicas Complejas de BotC Adaptadas</span>
                </div>

                <div className="space-y-2 text-[11px]">
                  <div className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-1">
                    <strong className="text-rose-400 block">A. Envenenamiento y Embriaguez (isImpaired):</strong>
                    <p className="text-neutral-400">
                      Un jugador envenenado por el Barman o ebrio por el Borracho o Sommelier <strong>nunca ve un mensaje de error</strong>. Cree que su poder funciona, pero el servidor genera un informe falso con un 50% de probabilidad o su protección falla silenciosamente.
                    </p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-1">
                    <strong className="text-purple-400 block">B. La Regla de la "Locura" (Madness):</strong>
                    <p className="text-neutral-400">
                      Si el Titiritero te infecta, recibes una orden mental directa: «Debes convencer a 2 personas de que eres [Otro Rol] pidiéndoles su código social». Si confiesas o rompes personaje, cualquier invitado puede pulsar <em>"Delatar Ruptura de Locura"</em> para causarte muerte súbita o pérdida de voto.
                    </p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-1">
                    <strong className="text-zinc-400 block">C. Falsos Positivos (El Huésped Sospechoso):</strong>
                    <p className="text-neutral-400">
                      El Huésped Sospechoso es inocente, pero mecánicamente registra como 🔴 SOMBRAS ante cualquier cámara o lupa de detective. No confíen ciegamente en datos puros sin contrastar la psicología del jugador.
                    </p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-1">
                    <strong className="text-amber-400 block">D. El Heredero Maldito (El Santo):</strong>
                    <p className="text-neutral-400">
                      Si la asamblea popular vota por expulsar al Santo en una reunión diurna, ¡las Sombras ganan la partida instantáneamente por error judicial!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SETUP RECOMMENDATION TABLE */}
          {activeTab === 'setup_table' && (
            <div className="space-y-3.5 text-xs">
              <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-1">
                <h3 className="font-bold text-white text-xs flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-rose-400" />
                  <span>Distribución Recomendada por Número de Jugadores</span>
                </h3>
                <p className="text-[11px] text-neutral-400">
                  La app balancea automáticamente los roles al iniciar la partida respetando las siguientes proporciones de equilibrio:
                </p>
              </div>

              <div className="space-y-2.5">
                {RECOMMENDED_SETUP_TABLE.map((setup, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2 hover:border-neutral-700 transition"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-black text-rose-400 text-xs">{setup.playerRange}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-900 border border-neutral-700 text-neutral-300 font-mono">
                        {setup.minPlayers} - {setup.maxPlayers} Personas
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[11px]">
                      <div className="p-2 rounded-xl bg-emerald-950/20 border border-emerald-500/20 text-emerald-300">
                        <span className="text-[10px] text-emerald-500 block uppercase font-bold">Buenos</span>
                        {setup.innocents}
                      </div>
                      <div className="p-2 rounded-xl bg-amber-950/20 border border-amber-500/20 text-amber-300">
                        <span className="text-[10px] text-amber-500 block uppercase font-bold">Forasteros</span>
                        {setup.outsiders}
                      </div>
                      <div className="p-2 rounded-xl bg-purple-950/20 border border-purple-500/20 text-purple-300">
                        <span className="text-[10px] text-purple-500 block uppercase font-bold">Cómplices</span>
                        {setup.minions}
                      </div>
                      <div className="p-2 rounded-xl bg-rose-950/20 border border-rose-500/20 text-rose-300">
                        <span className="text-[10px] text-rose-500 block uppercase font-bold">Asesinos</span>
                        {setup.killers}
                      </div>
                    </div>

                    <p className="text-[11px] text-neutral-400 italic bg-neutral-900/60 p-2 rounded-xl border border-neutral-850">
                      💡 {setup.note}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-neutral-800 bg-neutral-950/80 flex items-center justify-between text-xs">
          <span className="text-[11px] text-neutral-400">
            {activeTab === 'compendium' ? `Mostrando ${rolesList.length} roles` : 'Macareno’s Mystery • Árbitro IA'}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-750 text-white font-bold text-xs transition"
          >
            Cerrar Guía
          </button>
        </div>
      </div>
    </div>
  );
};
