import React, { useState, useEffect } from 'react';
import {
  HelpCircle,
  X,
  ChevronLeft,
  ChevronRight,
  Shield,
  Skull,
  Sparkles,
  Coins,
  Sun,
  Moon,
  Bell,
  Scale,
  Scroll,
  MessageSquare,
  Key,
  Eye,
  Bot,
  Flame,
  Search,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Wine,
  Camera,
  HeartPulse,
  Lock,
  Compass,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { Player, RoleType } from '../types';
import { soundManager } from '../utils/audio';

interface GameTutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlayer?: Player | null;
  onNavigateToCompendium?: () => void;
}

interface StepItem {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
}

export const GameTutorialModal: React.FC<GameTutorialModalProps> = ({
  isOpen,
  onClose,
  currentPlayer,
  onNavigateToCompendium,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [dontShowAgain, setDontShowAgain] = useState<boolean>(false);
  const [roleSearchFilter, setRoleSearchFilter] = useState<string>('');
  const [selectedRoleCategory, setSelectedRoleCategory] = useState<'Todos' | 'Inocentes' | 'Sombras' | 'Otros'>('Todos');

  useEffect(() => {
    if (isOpen) {
      soundManager.playTick();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClose = () => {
    if (dontShowAgain) {
      localStorage.setItem('macareno_tutorial_seen', 'true');
    }
    soundManager.playTick();
    onClose();
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
      soundManager.playTick();
    } else {
      handleClose();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
      soundManager.playTick();
    }
  };

  const steps: StepItem[] = [
    {
      id: 'hibrido',
      badge: 'Paso 1 de 6',
      title: 'La Dinámica Híbrida',
      subtitle: 'La web coordina en silencio; la intriga ocurre en la fiesta real',
    },
    {
      id: 'iconos',
      badge: 'Paso 2 de 6',
      title: 'Mapa de Iconos de Pantalla',
      subtitle: 'Glosario rápido de todos los símbolos e indicadores del juego',
    },
    {
      id: 'tu_rol',
      badge: 'Paso 3 de 6',
      title: 'Tu Rol & Acción Especial',
      subtitle: 'Descubre cómo ejecutar el poder asignado a tu personaje',
    },
    {
      id: 'acciones_roles',
      badge: 'Paso 4 de 6',
      title: 'Catálogo de Acciones Especiales',
      subtitle: 'Cómo funcionan las habilidades secretas de cada rol clave',
    },
    {
      id: 'tribunal',
      badge: 'Paso 5 de 6',
      title: 'El Tribunal & Estrado de 60s',
      subtitle: 'Voto doble, debates presenciales y alegatos de defensa',
    },
    {
      id: 'honor',
      badge: 'Paso 6 de 6',
      title: 'Reglas de Oro & Honor',
      subtitle: 'Discreción, etiqueta con el teléfono y diversión asegurada',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden relative">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-16 bg-gradient-to-r from-amber-500/20 via-rose-500/20 to-purple-500/20 blur-2xl pointer-events-none" />

        {/* Top Header */}
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/80 shrink-0 relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-gradient-to-br from-amber-500/20 to-rose-500/20 border border-amber-500/30 text-amber-300">
              <Sparkles className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {steps[currentStep].badge}
                </span>
                <span className="text-xs text-neutral-400 font-mono">Guía de Inicio Rápido</span>
              </div>
              <h2 className="text-base font-black text-white leading-tight mt-0.5">
                {steps[currentStep].title}
              </h2>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-2 text-neutral-400 hover:text-white rounded-xl bg-neutral-800/80 hover:bg-neutral-800 transition"
            title="Cerrar tutorial"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Indicators */}
        <div className="px-4 py-2 bg-neutral-950/50 border-b border-neutral-800 flex items-center gap-1.5 shrink-0 overflow-x-auto">
          {steps.map((step, idx) => (
            <button
              key={step.id}
              onClick={() => {
                setCurrentStep(idx);
                soundManager.playTick();
              }}
              className={`flex-1 min-w-[36px] py-1 px-1.5 rounded-lg text-center transition flex flex-col items-center gap-1 ${
                currentStep === idx
                  ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold'
                  : currentStep > idx
                  ? 'bg-neutral-800/80 text-emerald-400'
                  : 'bg-neutral-900 text-neutral-500 hover:bg-neutral-800'
              }`}
            >
              <div
                className={`h-1.5 w-full rounded-full ${
                  currentStep === idx
                    ? 'bg-amber-400'
                    : currentStep > idx
                    ? 'bg-emerald-500'
                    : 'bg-neutral-800'
                }`}
              />
              <span className="text-[9px] font-mono truncate max-w-full hidden sm:inline">
                {idx + 1}. {step.title.split(' ')[0]}
              </span>
            </button>
          ))}
        </div>

        {/* Main Step Content Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 text-neutral-200 text-xs space-y-4">
          {/* ========================================================================= */}
          {/* STEP 1: LA DINÁMICA HÍBRIDA */}
          {/* ========================================================================= */}
          {currentStep === 0 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-neutral-900 to-neutral-950 border border-neutral-800 space-y-2.5">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                  <Flame className="w-5 h-5 text-amber-400" />
                  <span>¿Cómo se juega esta experiencia?</span>
                </div>
                <p className="text-neutral-300 leading-relaxed text-xs">
                  Estás en un juego de <strong>deducción social híbrido</strong>. La web es tu tarjeta secreta de agente, tu inventario y el árbitro silencioso de la fiesta, pero las acusaciones, alianzas y mentiras ocurren <strong>cara a cara en la sala</strong>.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="p-3 rounded-2xl bg-neutral-950/70 border border-neutral-800 space-y-1.5">
                  <div className="text-xl">🤫</div>
                  <div className="font-bold text-white text-xs">1. Discreción Total</div>
                  <p className="text-[11px] text-neutral-400 leading-tight">
                    Nunca muestres tu pantalla a los demás. Toca el botón de privacidad para leer tu rol sin que nadie espíe por encima de tu hombro.
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-neutral-950/70 border border-neutral-800 space-y-1.5">
                  <div className="text-xl">🗣️</div>
                  <div className="font-bold text-white text-xs">2. Interacción Real</div>
                  <p className="text-[11px] text-neutral-400 leading-tight">
                    Platica, sirve bebidas, busca sospechosos a solas o crea camarillas. Tus misiones exigen acciones físicas en la fiesta.
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-neutral-950/70 border border-neutral-800 space-y-1.5">
                  <div className="text-xl">🔑</div>
                  <div className="font-bold text-white text-xs">3. Códigos Secretos</div>
                  <p className="text-[11px] text-neutral-400 leading-tight">
                    Cada jugador tiene un Código de 4 dígitos. Solo se entrega cuando un rol específico te lo exige según las reglas de la fiesta.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-rose-950/30 border border-rose-800/40 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <p className="text-[11px] text-rose-200/90 leading-relaxed">
                  <strong>Regla de oro:</strong> Cuando no estés consultando tu rol o emitiendo una acción, guarda tu teléfono en el bolsillo o ponlo con la pantalla hacia abajo.
                </p>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 2: MAPA DE ICONOS DE LA PANTALLA */}
          {/* ========================================================================= */}
          {currentStep === 1 && (
            <div className="space-y-3 animate-in fade-in duration-200">
              <p className="text-neutral-400 text-xs">
                Familiarízate con los botones y símbolos que verás permanentemente en la cabecera y en tu pantalla de juego:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 flex items-start gap-2.5">
                  <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 shrink-0">
                    <Coins className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-white text-xs">🪙 Monedas del Seven</div>
                    <div className="text-[11px] text-neutral-400 leading-tight">
                      Tu saldo para comprar en el Mercado: Chaleco antibalas, Test toxicológico, Ficha de Voto Doble o Chismes.
                    </div>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 flex items-start gap-2.5">
                  <div className="p-2 rounded-lg bg-purple-500/20 text-purple-300 shrink-0">
                    <Moon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-white text-xs">☀️ / 🌙 Ciclo Día y Noche</div>
                    <div className="text-[11px] text-neutral-400 leading-tight">
                      Cronómetro sincronizado. La Noche dura 2-3 minutos para resolver crímenes y la Mañana para debatir.
                    </div>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 flex items-start gap-2.5">
                  <div className="p-2 rounded-lg bg-red-500/20 text-red-400 shrink-0">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-white text-xs">🚨 Alarma de Asamblea</div>
                    <div className="text-[11px] text-neutral-400 leading-tight">
                      Convoca de golpe a todos los jugadores al centro de la sala para discutir sospechas y votar expulsiones.
                    </div>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 flex items-start gap-2.5">
                  <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 shrink-0">
                    <Scroll className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-white text-xs">📜 Misiones de Fiesta</div>
                    <div className="text-[11px] text-neutral-400 leading-tight">
                      Desafíos personales (ej. hacer un brindis, buscar un cómplice). Compleméntalas para ganar monedas o sumar puntos de victoria.
                    </div>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 flex items-start gap-2.5">
                  <div className="p-2 rounded-lg bg-pink-500/20 text-pink-300 shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-white text-xs">🐱💀 Ruleta de Macareno</div>
                    <div className="text-[11px] text-neutral-400 leading-tight">
                      Un evento caótico al día (Snack de Jackie, Migajas de Luisda, Novia Malvada) que altera las reglas de la fiesta.
                    </div>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 flex items-start gap-2.5">
                  <div className="p-2 rounded-lg bg-rose-500/20 text-rose-400 shrink-0">
                    <Key className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-white text-xs">🔒 Código Secreto (4 Dígitos)</div>
                    <div className="text-[11px] text-neutral-400 leading-tight">
                      Tu identificador único. Si un asesino te susurra "¿Qué traes allí?", debes entregarlo discretamente.
                    </div>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 flex items-start gap-2.5">
                  <div className="p-2 rounded-lg bg-sky-500/20 text-sky-400 shrink-0">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-white text-xs">💬 Buzón & Chat Clandestino</div>
                    <div className="text-[11px] text-neutral-400 leading-tight">
                      Canal privado en la web para que las Sombras conspiren o para recibir informes forenses y avisos del Árbitro.
                    </div>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 flex items-start gap-2.5">
                  <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400 shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-white text-xs">🔮 Árbitro IA / Oráculo</div>
                    <div className="text-[11px] text-neutral-400 leading-tight">
                      Pregúntale cualquier duda sobre roles, pistas forenses abstractas o la resolución de situaciones dudosas.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 3: TU ROL & ACCIÓN ESPECIAL PERSONALIZADA */}
          {/* ========================================================================= */}
          {currentStep === 2 && (
            <div className="space-y-3.5 animate-in fade-in duration-200">
              {currentPlayer?.role ? (
                <div className="p-4 rounded-2xl bg-neutral-950 border-2 border-amber-500/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="text-3xl">{currentPlayer.avatar}</span>
                      <div>
                        <div className="text-[10px] font-mono uppercase text-amber-400 font-bold">
                          Tu Rol Asignado en esta Sala
                        </div>
                        <div className="text-base font-black text-white">{currentPlayer.role}</div>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase ${
                        currentPlayer.team === 'Las Sombras'
                          ? 'bg-rose-950 text-rose-300 border border-rose-800'
                          : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      }`}
                    >
                      {currentPlayer.team}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-300 leading-relaxed">
                    <div className="font-bold text-amber-300 mb-1 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5" />
                      <span>Cómo activar tu habilidad en la pantalla:</span>
                    </div>
                    {currentPlayer.team === 'Las Sombras' || currentPlayer.role.includes('Asesino') ? (
                      <div>
                        Tienes la acción <strong>"Silencio Mortal"</strong> en tu tarjeta. Busca a una víctima a solas (a más de 3 metros de testigos), susúrrale al oído <em>"¿Qué traes allí?"</em> y pídele su Código Secreto de 4 dígitos. Al ingresarlo en tu pantalla, la víctima recibirá una toxina silenciosa y colapsará tras un breve retraso sin saber quién la atacó.
                      </div>
                    ) : currentPlayer.role === 'El Médico' ? (
                      <div>
                        En tu pantalla verás la lista de invitados. Durante cada noche puedes usar tu <strong>Frasco de Antídoto</strong> para inmunizar a un jugador contra posibles envenenamientos o asesinatos.
                      </div>
                    ) : currentPlayer.role === 'El Investigador' || currentPlayer.role === 'El Testigo Ocular' ? (
                      <div>
                        Tu panel incluye la acción de <strong>Inspección Forense</strong>. Selecciona a un sospechoso durante la noche para recibir un reporte analítico en tu buzón sobre sus alianzas.
                      </div>
                    ) : (
                      <div>
                        Consulta los botones interactivos dentro de tu <strong>Tarjeta de Rol</strong>. Cada noche o día aparecerán tus botones de acción especiales según la fase de la partida.
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-900/90 border border-neutral-800">
                    <span className="text-neutral-400 text-xs">Tu Código Secreto para esta partida:</span>
                    <span className="text-base font-mono font-black text-rose-400 tracking-wider">
                      {currentPlayer.victimCode || '••••'}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 text-center space-y-2">
                  <ShieldCheck className="w-8 h-8 text-amber-400 mx-auto" />
                  <div className="font-bold text-white text-sm">Tu rol se revelará al iniciar la partida</div>
                  <p className="text-neutral-400 text-xs">
                    Cuando el anfitrión pulse "Iniciar Partida", el sistema te asignará aleatoriamente un personaje secreto (Inocente o de las Sombras) con su acción especial correspondiente.
                  </p>
                </div>
              )}

              <div className="p-3 rounded-2xl bg-neutral-950/70 border border-neutral-800 flex items-start gap-2.5">
                <Eye className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <p className="text-[11px] text-neutral-300 leading-relaxed">
                  Para ver tu rol en la partida sin delatarte, toca el panel <em>"Toca para consultar tu rol secreto"</em>. Solo se revelará mientras mantengas la pestaña abierta.
                </p>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 4: CATÁLOGO DE ACCIONES ESPECIALES */}
          {/* ========================================================================= */}
          {currentStep === 3 && (
            <div className="space-y-3 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
                <div className="flex items-center gap-1 bg-neutral-950 p-1 rounded-xl border border-neutral-800 text-[11px]">
                  {(['Todos', 'Inocentes', 'Sombras', 'Otros'] as const).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedRoleCategory(cat)}
                      className={`px-2.5 py-1 rounded-lg font-bold transition ${
                        selectedRoleCategory === cat
                          ? 'bg-amber-500 text-neutral-950'
                          : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    placeholder="Buscar rol o acción..."
                    value={roleSearchFilter}
                    onChange={(e) => setRoleSearchFilter(e.target.value)}
                    className="w-full sm:w-44 bg-neutral-950 border border-neutral-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-neutral-500 outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Roles Cards List */}
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {/* Asesino */}
                {(selectedRoleCategory === 'Todos' || selectedRoleCategory === 'Sombras') &&
                  ('asesino silencio mortal toxina'.includes(roleSearchFilter.toLowerCase()) || !roleSearchFilter) && (
                    <div className="p-3 rounded-2xl bg-neutral-950 border border-rose-900/40 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="font-bold text-rose-400 text-xs flex items-center gap-1.5">
                          <Skull className="w-3.5 h-3.5" />
                          <span>Asesino / Impostor — Habilidad: "Silencio Mortal"</span>
                        </div>
                        <span className="text-[9px] px-2 py-0.5 rounded-md bg-rose-950 text-rose-300 font-mono">
                          Noche / Sigilo
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-300 leading-tight">
                        <strong>Mecánica:</strong> Acorrala a alguien a solas sin testigos a 3 metros. Susúrrale: <em>"¿Qué traes allí?"</em>. Ingresa su código de 4 dígitos. La víctima recibirá una toxina silenciosa y colapsará discretamente tras un retraso sin saber quién fue.
                      </p>
                    </div>
                  )}

                {/* Investigador */}
                {(selectedRoleCategory === 'Todos' || selectedRoleCategory === 'Inocentes') &&
                  ('investigador forense pista'.includes(roleSearchFilter.toLowerCase()) || !roleSearchFilter) && (
                    <div className="p-3 rounded-2xl bg-neutral-950 border border-sky-900/40 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="font-bold text-sky-400 text-xs flex items-center gap-1.5">
                          <Search className="w-3.5 h-3.5" />
                          <span>El Investigador — Habilidad: "Interrogatorio Nocturno"</span>
                        </div>
                        <span className="text-[9px] px-2 py-0.5 rounded-md bg-sky-950 text-sky-300 font-mono">
                          Fase Noche
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-300 leading-tight">
                        <strong>Mecánica:</strong> Selecciona en tu pantalla a un jugador para analizarlo. Al amanecer, tu buzón nocturno te indicará si pertenece a la Fiesta o a las Sombras.
                      </p>
                    </div>
                  )}

                {/* Médico */}
                {(selectedRoleCategory === 'Todos' || selectedRoleCategory === 'Inocentes') &&
                  ('medico doctor antidoto salvar curar'.includes(roleSearchFilter.toLowerCase()) || !roleSearchFilter) && (
                    <div className="p-3 rounded-2xl bg-neutral-950 border border-emerald-900/40 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="font-bold text-emerald-400 text-xs flex items-center gap-1.5">
                          <HeartPulse className="w-3.5 h-3.5" />
                          <span>El Médico — Habilidad: "Antídoto Preventivo"</span>
                        </div>
                        <span className="text-[9px] px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-300 font-mono">
                          Fase Noche
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-300 leading-tight">
                        <strong>Mecánica:</strong> Elige a un invitado para protegerlo durante la noche. Si el asesino intenta envenenarlo, tu antídoto anula el golpe.
                      </p>
                    </div>
                  )}

                {/* Hacker */}
                {(selectedRoleCategory === 'Todos' || selectedRoleCategory === 'Sombras') &&
                  ('hacker glitch caos distorsion'.includes(roleSearchFilter.toLowerCase()) || !roleSearchFilter) && (
                    <div className="p-3 rounded-2xl bg-neutral-950 border border-violet-900/40 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="font-bold text-violet-400 text-xs flex items-center gap-1.5">
                          <Zap className="w-3.5 h-3.5" />
                          <span>El Hacker — Habilidad: "Glitch Visual Masivo"</span>
                        </div>
                        <span className="text-[9px] px-2 py-0.5 rounded-md bg-violet-950 text-violet-300 font-mono">
                          1 Uso por Partida
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-300 leading-tight">
                        <strong>Mecánica:</strong> Pulsa el botón de glitch para desatar una interferencia cibernética en las pantallas de todos los invitados durante 20 segundos, distrayendo la sala en momentos clave.
                      </p>
                    </div>
                  )}

                {/* Cazador Vengativo */}
                {(selectedRoleCategory === 'Todos' || selectedRoleCategory === 'Inocentes' || selectedRoleCategory === 'Otros') &&
                  ('cazador vengativo disparo bala'.includes(roleSearchFilter.toLowerCase()) || !roleSearchFilter) && (
                    <div className="p-3 rounded-2xl bg-neutral-950 border border-amber-900/40 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="font-bold text-amber-400 text-xs flex items-center gap-1.5">
                          <Flame className="w-3.5 h-3.5" />
                          <span>El Cazador Vengativo — Habilidad: "Bala Póstuma"</span>
                        </div>
                        <span className="text-[9px] px-2 py-0.5 rounded-md bg-amber-950 text-amber-300 font-mono">
                          Al Morir
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-300 leading-tight">
                        <strong>Mecánica:</strong> Si eres eliminado por asesinato o en el tribunal, se desbloquea un botón en tu pantalla para elegir a un sospechoso y llevártelo contigo a la tumba.
                      </p>
                    </div>
                  )}

                {/* Alma Atormentadora */}
                {(selectedRoleCategory === 'Todos' || selectedRoleCategory === 'Otros') &&
                  ('alma atormentadora fantasma muerto'.includes(roleSearchFilter.toLowerCase()) || !roleSearchFilter) && (
                    <div className="p-3 rounded-2xl bg-neutral-950 border border-neutral-700 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="font-bold text-neutral-300 text-xs flex items-center gap-1.5">
                          <Skull className="w-3.5 h-3.5 text-neutral-400" />
                          <span>Alma Atormentadora (Eliminados)</span>
                        </div>
                        <span className="text-[9px] px-2 py-0.5 rounded-md bg-neutral-800 text-neutral-300 font-mono">
                          Espectro
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-400 leading-tight">
                        <strong>Mecánica:</strong> Si caes eliminado, no puedes hablar ni votar en las asambleas, pero continúas jugando: recibes 5 misiones espectrales y puedes participar en eventos anónimos de la ruleta.
                      </p>
                    </div>
                  )}
              </div>

              {onNavigateToCompendium && (
                <button
                  onClick={() => {
                    handleClose();
                    onNavigateToCompendium();
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold transition flex items-center justify-center gap-1.5"
                >
                  <span>Abrir Enciclopedia Completa de Todos los Roles</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 5: EL TRIBUNAL & ESTRADO DE 60s */}
          {/* ========================================================================= */}
          {currentStep === 4 && (
            <div className="space-y-3.5 animate-in fade-in duration-200">
              <div className="p-3.5 rounded-2xl bg-red-950/40 border border-red-800/60 space-y-2">
                <div className="flex items-center gap-2 text-red-400 font-bold text-sm">
                  <Scale className="w-5 h-5 text-red-400" />
                  <span>El Juicio en el Estrado</span>
                </div>
                <p className="text-neutral-300 text-xs leading-relaxed">
                  Cualquier jugador vivo puede pulsar la <strong>Alarma de Emergencia 🚨</strong> para detener la fiesta y convocar a todos al centro de la sala.
                </p>
              </div>

              <div className="space-y-2.5">
                <div className="p-3 rounded-2xl bg-neutral-950 border border-neutral-800 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-red-500/20 text-red-400 font-bold font-mono flex items-center justify-center shrink-0 text-xs">
                    1
                  </div>
                  <div>
                    <div className="font-bold text-white text-xs">Votación Secreta en la Web</div>
                    <p className="text-[11px] text-neutral-400 leading-tight mt-0.5">
                      Cada participante elige a un sospechoso en su teléfono de manera anónima o pulsa <em>"Saltar Voto"</em> si prefiere abstenerse.
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-neutral-950 border border-neutral-800 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-bold font-mono flex items-center justify-center shrink-0 text-xs">
                    2
                  </div>
                  <div>
                    <div className="font-bold text-amber-300 text-xs flex items-center gap-1">
                      <span>Ficha de Voto Doble (x2)</span>
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    </div>
                    <p className="text-[11px] text-neutral-400 leading-tight mt-0.5">
                      Si compraste una ficha de Voto Doble en el Mercado del Seven, puedes activarla con un toque antes de emitir tu voto para que pese por dos en el recuento.
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-neutral-950 border border-neutral-800 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 font-bold font-mono flex items-center justify-center shrink-0 text-xs">
                    3
                  </div>
                  <div>
                    <div className="font-bold text-white text-xs">Alegato de Defensa Oral (60 Segundos)</div>
                    <p className="text-[11px] text-neutral-400 leading-tight mt-0.5">
                      El sospechoso con mayor cantidad de votos es llamado al <strong>Estrado</strong>. Se inicia un cronómetro de 60s en pantalla y debe hablar de pie ante toda la fiesta para defender su inocencia antes de que se decida si se le perdona o expulsa.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 6: REGLAS DE ORO & HONOR */}
          {/* ========================================================================= */}
          {currentStep === 5 && (
            <div className="space-y-3.5 animate-in fade-in duration-200">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 via-neutral-900 to-neutral-950 border border-amber-500/30 text-center space-y-2">
                <ShieldCheck className="w-10 h-10 text-amber-400 mx-auto" />
                <h3 className="text-sm font-black text-white uppercase tracking-wide">
                  Código de Honor de la Fiesta
                </h3>
                <p className="text-xs text-neutral-300 leading-relaxed max-w-sm mx-auto">
                  Para que la partida sea inmersiva, emocionante y divertida para todos, sigan estas 4 reglas fundamentales:
                </p>
              </div>

              <div className="space-y-2">
                <div className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-[11px] text-neutral-300">
                    <strong>Cero espionaje:</strong> Queda prohibido mirar las pantallas de otros jugadores o grabarlos con la cámara.
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-[11px] text-neutral-300">
                    <strong>Silencio al caer eliminado:</strong> Las almas en pena no revelan al asesino ni dan pistas en voz alta durante las asambleas.
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-[11px] text-neutral-300">
                    <strong>Respetar la regla de 3 metros:</strong> El asesino no puede atacar frente a testigos; debe aislar con astucia a su víctima.
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-[11px] text-neutral-300">
                    <strong>Juega tu papel:</strong> Si la ruleta de Macareno o tu rol te pide un capricho o una broma, ¡súmate con entusiasmo!
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Footer Controls */}
        <div className="p-4 border-t border-neutral-800 bg-neutral-950 flex items-center justify-between shrink-0">
          <label className="flex items-center gap-2 cursor-pointer select-none text-[11px] text-neutral-400 hover:text-neutral-200">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="rounded border-neutral-700 bg-neutral-900 text-amber-500 focus:ring-0 focus:ring-offset-0 w-3.5 h-3.5"
            />
            <span>No volver a mostrar al inicio</span>
          </label>

          <div className="flex items-center gap-2">
            {currentStep > 0 && (
              <button
                onClick={prevStep}
                className="py-2 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold transition flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Anterior</span>
              </button>
            )}

            <button
              onClick={nextStep}
              className="py-2 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-neutral-950 text-xs font-black uppercase tracking-wider transition flex items-center gap-1 shadow-lg shadow-amber-950/40"
            >
              <span>{currentStep === steps.length - 1 ? '¡Entendido, a Jugar!' : 'Siguiente'}</span>
              {currentStep < steps.length - 1 && <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
