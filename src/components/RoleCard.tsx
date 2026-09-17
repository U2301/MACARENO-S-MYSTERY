import React, { useState } from 'react';
import {
  ShieldAlert,
  Eye,
  EyeOff,
  Skull,
  Camera,
  MessageCircle,
  Stethoscope,
  ShieldCheck,
  Sparkles,
  Zap,
  HelpCircle,
  FileText,
  Ghost,
  CheckCircle2,
  Clock,
  Send,
  AlertCircle,
  Users,
  Sun,
  Moon,
  Wine,
  Briefcase,
  Crosshair,
  Mail,
  Search,
  Flame,
  ShieldX,
  Syringe,
  Scale,
  Crown,
  Drama,
  Key
} from 'lucide-react';
import { Player, RoleType, GamePhase, MurderReport } from '../types';
import { ROLES_CATALOG } from '../data/roles';

interface RoleCardProps {
  player: Player;
  players: Player[];
  currentPhase: GamePhase;
  murderHistory: MurderReport[];
  hackerGlitchActiveUntil?: number;
  onRegisterKill: (code: string) => { success: boolean; message: string };
  onTriggerHackerPulse: () => void;
  onUseChismoso: (p1Id: string, p2Id: string) => Promise<{ success: boolean; error?: string; chismosoReport?: any }> | { sameTeam: boolean };
  onUseEscolta: (targetId: string, targetCode?: string) => Promise<any> | void;
  onConfirmEscoltaFaceToFace: () => void;
  onUseFotografo: (targetId: string) => void;
  onAccelerateFotografo?: () => void;
  onSubmitPeriodistaTheory: (targetId: string, role: RoleType) => Promise<any> | any;
  onUseDetective?: (p1Id: string, p2Id: string) => Promise<any> | any;
  onUseSommelier?: (targetId: string, targetCode: string) => Promise<any> | any;
  onUseBarman?: (targetId: string) => Promise<any> | any;
  onUseAbogado?: (targetId: string) => Promise<any> | any;
  onUseCazadorVengeance?: (targetId: string) => Promise<any> | any;
  onUseMedicoAntidote?: (targetId: string, targetCode: string) => Promise<any> | any;
  onUseAbogadoDefensor?: (targetId: string, targetCode: string) => Promise<any> | any;
  onUseTitiritero?: (targetId: string, assignedRole: RoleType) => Promise<any> | any;
  onSubmitAlibiCode?: (code: string) => Promise<any> | any;
  onPadrinoSkipKill?: () => Promise<any> | any;
  onImpTransfer?: () => Promise<any> | any;
  onOpenTutorial?: () => void;
}

export const RoleCard: React.FC<RoleCardProps> = ({
  player,
  players,
  currentPhase,
  murderHistory,
  hackerGlitchActiveUntil,
  onRegisterKill,
  onTriggerHackerPulse,
  onUseChismoso,
  onUseEscolta,
  onConfirmEscoltaFaceToFace,
  onUseFotografo,
  onAccelerateFotografo,
  onSubmitPeriodistaTheory,
  onUseDetective,
  onUseSommelier,
  onUseBarman,
  onUseAbogado,
  onUseCazadorVengeance,
  onUseMedicoAntidote,
  onUseAbogadoDefensor,
  onUseTitiritero,
  onSubmitAlibiCode,
  onPadrinoSkipKill,
  onImpTransfer,
  onOpenTutorial,
}) => {
  const [showSecret, setShowSecret] = useState(false);
  const [killCode, setKillCode] = useState('');
  const [killFeedback, setKillFeedback] = useState<{ success: boolean; message: string } | null>(null);

  // Ability local state
  const [chismosoP1, setChismosoP1] = useState('');
  const [chismosoP2, setChismosoP2] = useState('');
  const [chismosoResult, setChismosoResult] = useState<string | null>(null);
  const [chismosoLoading, setChismosoLoading] = useState(false);

  const [escoltaTarget, setEscoltaTarget] = useState('');
  const [escoltaCode, setEscoltaCode] = useState('');
  const [escoltaFeedback, setEscoltaFeedback] = useState<string | null>(null);

  const [fotografoTarget, setFotografoTarget] = useState('');
  const [periodistaTarget, setPeriodistaTarget] = useState('');
  const [periodistaRoleGuess, setPeriodistaRoleGuess] = useState<RoleType>('El Fotógrafo');
  const [periodistaFeedback, setPeriodistaFeedback] = useState<string | null>(null);

  const [detectiveP1, setDetectiveP1] = useState('');
  const [detectiveP2, setDetectiveP2] = useState('');
  const [detectiveFeedback, setDetectiveFeedback] = useState<string | null>(null);
  const [detectiveLoading, setDetectiveLoading] = useState(false);

  const [sommelierTarget, setSommelierTarget] = useState('');
  const [sommelierCode, setSommelierCode] = useState('');
  const [sommelierFeedback, setSommelierFeedback] = useState<string | null>(null);
  const [sommelierLoading, setSommelierLoading] = useState(false);

  const [barmanTarget, setBarmanTarget] = useState('');
  const [barmanFeedback, setBarmanFeedback] = useState<string | null>(null);
  const [barmanLoading, setBarmanLoading] = useState(false);

  const [abogadoTarget, setAbogadoTarget] = useState('');
  const [abogadoFeedback, setAbogadoFeedback] = useState<string | null>(null);
  const [abogadoLoading, setAbogadoLoading] = useState(false);

  const [cazadorTarget, setCazadorTarget] = useState('');
  const [cazadorFeedback, setCazadorFeedback] = useState<string | null>(null);
  const [cazadorLoading, setCazadorLoading] = useState(false);

  // New BotC Mechanics State
  const [medicoTarget, setMedicoTarget] = useState('');
  const [medicoCode, setMedicoCode] = useState('');
  const [medicoFeedback, setMedicoFeedback] = useState<string | null>(null);
  const [medicoLoading, setMedicoLoading] = useState(false);

  const [abogadoDefensorTarget, setAbogadoDefensorTarget] = useState('');
  const [abogadoDefensorCode, setAbogadoDefensorCode] = useState('');
  const [abogadoDefensorFeedback, setAbogadoDefensorFeedback] = useState<string | null>(null);
  const [abogadoDefensorLoading, setAbogadoDefensorLoading] = useState(false);

  const [titiriteroTarget, setTitiriteroTarget] = useState('');
  const [titiriteroRole, setTitiriteroRole] = useState<RoleType>('El Santo');
  const [titiriteroFeedback, setTitiriteroFeedback] = useState<string | null>(null);
  const [titiriteroLoading, setTitiriteroLoading] = useState(false);

  const [alibiInputCode, setAlibiInputCode] = useState('');
  const [alibiFeedback, setAlibiFeedback] = useState<string | null>(null);
  const [alibiLoading, setAlibiLoading] = useState(false);

  const [padrinoFeedback, setPadrinoFeedback] = useState<string | null>(null);
  const [padrinoLoading, setPadrinoLoading] = useState(false);

  const [impFeedback, setImpFeedback] = useState<string | null>(null);
  const [impLoading, setImpLoading] = useState(false);

  // BotC Rule: The Drunk sees their fake role, not "El Borracho"
  const displayedRole: RoleType = (player.fakeRole as RoleType) || player.role;
  const roleDef = ROLES_CATALOG[displayedRole] || ROLES_CATALOG[player.role] || ROLES_CATALOG['Inocente'];
  const isGhost = !player.isAlive;
  const aliveOthers = players.filter((p) => p.isAlive && p.id !== player.id);
  const deadPlayers = players.filter((p) => !p.isAlive);

  // Shadow team allies (for Asesino, Hacker, Camaleón)
  const isShadowTeam = player.team.includes('Sombras');
  const shadowAllies = players.filter(
    (p) => p.id !== player.id && p.team.includes('Sombras')
  );

  const handleKillSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!killCode.trim()) return;
    const res = onRegisterKill(killCode.trim());
    setKillFeedback(res);
    if (res.success) setKillCode('');
    setTimeout(() => setKillFeedback(null), 4000);
  };

  const handleChismosoSubmit = async () => {
    if (!chismosoP1 || !chismosoP2 || chismosoP1 === chismosoP2) return;
    setChismosoLoading(true);
    try {
      const res: any = await onUseChismoso(chismosoP1, chismosoP2);
      if (res && res.success) {
        setChismosoResult('🤫 Rumor en cotejo registrado. El veredicto confidencial llegará a tu Buzón Nocturno al caer la noche.');
      } else if (res && res.chismosoReport) {
        setChismosoResult(res.chismosoReport.verdict);
      } else if (res && res.error) {
        setChismosoResult(`⚠️ ${res.error}`);
      }
    } catch (e) {
      console.error('Chismoso error:', e);
    } finally {
      setChismosoLoading(false);
    }
  };

  const handlePeriodistaSubmit = async () => {
    if (!periodistaTarget) return;
    const res = await onSubmitPeriodistaTheory(periodistaTarget, periodistaRoleGuess);
    const targetName = players.find(p => p.id === periodistaTarget)?.name;
    if (res && res.error) {
      setPeriodistaFeedback(`⚠️ ${res.error}`);
    } else {
      setPeriodistaFeedback(`📰 Teoría registrada sobre ${targetName || 'el invitado'}. La edición nocturna dictaminará en tu Buzón Nocturno si acertaste (+15 monedas).`);
    }
    setTimeout(() => setPeriodistaFeedback(null), 6000);
  };

  const handleMedicoSubmit = async () => {
    if (!medicoTarget || !medicoCode || !onUseMedicoAntidote) return;
    setMedicoLoading(true);
    const res = await onUseMedicoAntidote(medicoTarget, medicoCode);
    setMedicoLoading(false);
    if (res && res.error) {
      setMedicoFeedback(`⚠️ ${res.error}`);
    } else {
      setMedicoFeedback('✓ Antídoto administrado con éxito. El paciente ha sido desintoxicado.');
      setMedicoCode('');
    }
    setTimeout(() => setMedicoFeedback(null), 5000);
  };

  const handleAbogadoDefensorSubmit = async () => {
    if (!abogadoDefensorTarget || !abogadoDefensorCode || !onUseAbogadoDefensor) return;
    setAbogadoDefensorLoading(true);
    const res = await onUseAbogadoDefensor(abogadoDefensorTarget, abogadoDefensorCode);
    setAbogadoDefensorLoading(false);
    if (res && res.error) {
      setAbogadoDefensorFeedback(`⚠️ ${res.error}`);
    } else {
      setAbogadoDefensorFeedback('✓ Poder de defensa firmado. Tu cliente queda protegido de la expulsión hoy.');
      setAbogadoDefensorCode('');
    }
    setTimeout(() => setAbogadoDefensorFeedback(null), 5000);
  };

  const handleTitiriteroSubmit = async () => {
    if (!titiriteroTarget || !onUseTitiritero) return;
    setTitiriteroLoading(true);
    const res = await onUseTitiritero(titiriteroTarget, titiriteroRole);
    setTitiriteroLoading(false);
    if (res && res.error) {
      setTitiriteroFeedback(`⚠️ ${res.error}`);
    } else {
      setTitiriteroFeedback(`✓ Maldición de la locura impuesta. La víctima debe fingir ser ${titiriteroRole}.`);
    }
    setTimeout(() => setTitiriteroFeedback(null), 5000);
  };

  const handleAlibiSubmit = async () => {
    if (!alibiInputCode.trim() || !onSubmitAlibiCode) return;
    setAlibiLoading(true);
    const res = await onSubmitAlibiCode(alibiInputCode.trim());
    setAlibiLoading(false);
    if (res && res.error) {
      setAlibiFeedback(`⚠️ ${res.error}`);
    } else {
      setAlibiFeedback('✓ Coartada presencial registrada.');
      setAlibiInputCode('');
    }
    setTimeout(() => setAlibiFeedback(null), 5000);
  };

  const handlePadrinoSkipSubmit = async () => {
    if (!onPadrinoSkipKill) return;
    setPadrinoLoading(true);
    const res = await onPadrinoSkipKill();
    setPadrinoLoading(false);
    if (res && res.error) {
      setPadrinoFeedback(`⚠️ ${res.error}`);
    } else {
      setPadrinoFeedback('✓ Acecho activado. Tendrás 3 asesinatos acumulados la próxima Noche.');
    }
    setTimeout(() => setPadrinoFeedback(null), 5000);
  };

  const handleImpTransferSubmit = async () => {
    if (!onImpTransfer) return;
    setImpLoading(true);
    const res = await onImpTransfer();
    setImpLoading(false);
    if (res && res.error) {
      setImpFeedback(`⚠️ ${res.error}`);
    } else {
      setImpFeedback('✓ Inmolación completada. Tu sucesor ha asumido el liderazgo nocturno.');
    }
    setTimeout(() => setImpFeedback(null), 5000);
  };

  const isGlitchActive = !!(hackerGlitchActiveUntil && hackerGlitchActiveUntil > Date.now());
  const glitchSecsLeft = isGlitchActive
    ? Math.max(0, Math.ceil((hackerGlitchActiveUntil! - Date.now()) / 1000))
    : 0;

  return (
    <div className="space-y-6">
      {/* Secret Credential Container */}
      <div className="rounded-3xl border border-neutral-800 bg-neutral-900/80 p-6 backdrop-blur shadow-xl relative overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Credencial Secreta de Identidad
            </span>
          </div>

          <div className="flex items-center gap-2">
            {onOpenTutorial && (
              <button
                id="open-tutorial-rolecard-btn"
                onClick={onOpenTutorial}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-semibold border border-amber-500/30 transition"
                title="Tutorial de Iconos y Acciones"
              >
                <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Tutorial</span>
              </button>
            )}

            <button
              id="toggle-secret-btn"
              onClick={() => setShowSecret(!showSecret)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-750 text-neutral-300 text-xs font-semibold border border-neutral-700 transition"
            >
              {showSecret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              {showSecret ? 'Ocultar Credencial' : 'Tocar para ver'}
            </button>
          </div>
        </div>

        {showSecret ? (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div>
              <div className="text-xs text-neutral-400 font-medium">Tu Rol Oculto:</div>
              <div className="text-2xl sm:text-3xl font-black text-white flex flex-wrap items-center gap-2.5 mt-1">
                <span>{displayedRole}</span>
                <span
                  className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                    (player.fakeRole ? false : player.team.includes('Sombras'))
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      : (player.fakeRole ? false : player.team.includes('Caos'))
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  }`}
                >
                  {player.fakeRole ? 'Fiesta (Inocentes)' : player.team}
                </span>
              </div>
              <p className="text-xs text-neutral-400 italic mt-0.5">{roleDef.tagline}</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-neutral-950/70 border border-neutral-800 text-xs text-neutral-300 leading-relaxed space-y-2">
              <p>{roleDef.description}</p>
              <div className="border-t border-neutral-800/80 pt-2 font-medium text-neutral-400 text-[11px]">
                <strong className="text-neutral-200">Condición de Victoria:</strong> {roleDef.winCondition}
              </div>
            </div>

            {/* Secret Interaction / Victim Code */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800">
              <div>
                <div className="text-[10px] text-neutral-400 uppercase font-mono tracking-wider">
                  Tu Código Secreto de Interacción
                </div>
                <div className="text-2xl font-mono font-black text-rose-400 tracking-widest mt-0.5">
                  {player.victimCode}
                </div>
              </div>
              <div className="text-[11px] text-neutral-400 max-w-[210px] text-right leading-tight">
                🔑 Úsalo para validar interacciones cara a cara (Escolta, Sommelier) o entrégalo si un Asesino te susurra al oído: <em>"¿Qué traes allí?"</em>.
              </div>
            </div>
          </div>
        ) : (
          <div
            onClick={() => setShowSecret(true)}
            className="h-32 flex flex-col items-center justify-center border-2 border-dashed border-neutral-800 rounded-2xl bg-neutral-950/40 cursor-pointer hover:border-neutral-700 transition group"
          >
            <Eye className="w-6 h-6 text-neutral-500 group-hover:text-neutral-300 transition mb-2" />
            <span className="text-xs font-semibold text-neutral-300">
              Toca para consultar tu rol secreto en privado
            </span>
            <span className="text-[11px] text-neutral-500 mt-1">
              Verifica que nadie en la fiesta esté mirando tu pantalla
            </span>
          </div>
        )}
      </div>

      {/* 🎭 REGLA DE LA LOCURA (BOTC MADNESS BANNER) */}
      {player.madness && (
        <div className="rounded-3xl border-2 border-amber-500 bg-gradient-to-b from-amber-950/80 to-neutral-900/90 p-5 backdrop-blur shadow-2xl space-y-3 animate-in fade-in duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-300 font-black text-sm">
              <Drama className="w-5 h-5 text-amber-400 animate-pulse" />
              <span>¡REGLA DE LA LOCURA ACTIVA!</span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/50 text-amber-300 text-[10px] font-bold uppercase tracking-wider">
              Bajo Hechizo
            </span>
          </div>

          <p className="text-xs text-amber-100 leading-relaxed">
            El Titiritero te ha poseído. Estás bajo la <strong>Regla de la Locura</strong> y debes fingir con convicción ante los demás invitados que tu rol es:{' '}
            <strong className="text-white bg-amber-900/80 px-2 py-0.5 rounded-lg border border-amber-500/60 inline-block my-0.5">
              {player.madness.assignedRole}
            </strong>.
          </p>

          <div className="p-3 rounded-2xl bg-neutral-950/80 border border-amber-500/30 text-xs space-y-2">
            <div className="flex items-center justify-between text-[11px] text-amber-300 font-semibold">
              <span>Coartada Presencial ("Pacto de Confianza"):</span>
              <span className="font-mono">
                {player.madness.confirmedCodes.length} / {player.madness.targetCodesNeeded} testigos
              </span>
            </div>
            <p className="text-[10px] text-neutral-400">
              Pídele discretamente su Código Secreto de 4 dígitos a 2 personas distintas para demostrar tu autenticidad y romper la maldición antes del anochecer.
            </p>

            <div className="flex gap-2">
              <input
                type="text"
                maxLength={4}
                placeholder="Código 4 dígitos de un amigo"
                value={alibiInputCode}
                onChange={(e) => setAlibiInputCode(e.target.value)}
                className="flex-1 bg-neutral-900 border border-amber-600/60 rounded-xl px-3 py-2 text-xs font-mono tracking-widest text-white outline-none focus:border-amber-400"
              />
              <button
                onClick={handleAlibiSubmit}
                disabled={!alibiInputCode.trim() || alibiLoading}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-neutral-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition"
              >
                <Key className="w-3.5 h-3.5" />
                Validar
              </button>
            </div>

            {alibiFeedback && (
              <div className="p-2 rounded-xl bg-amber-950/60 border border-amber-500/40 text-amber-200 text-[11px] font-medium">
                {alibiFeedback}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 🥴 EFECTO DE INTOXICACIÓN / IMPAIRMENT BANNER */}
      {(player.isPoisoned || player.isImpaired || player.isSommelierImpaired) && (
        <div className="rounded-2xl border border-violet-500/40 bg-violet-950/40 p-3.5 text-xs text-violet-200 flex items-start gap-2.5">
          <Wine className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <div className="font-bold text-violet-300">Sentidos o Habilidades Alteradas (Embriaguez / Veneno)</div>
            <p className="text-[11px] text-violet-200/90 leading-tight">
              Has sido afectado por una bebida adulterada o pócima. Tus capacidades perceptivas pueden fallar o arrojar datos invertidos hasta que El Médico te asista o pase la noche.
            </p>
          </div>
        </div>
      )}

      {/* ⚠️ AURA HOSTIL (EL RECLUSO / EL HUÉSPED SOSPECHOSO) */}
      {player.registersAsHostile && (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-950/30 p-3.5 text-xs text-rose-200 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <div className="font-bold text-rose-300">Aura Hostil por Antecedentes</div>
            <p className="text-[11px] text-rose-200/90 leading-tight">
              Aunque eres leal a la Fiesta, tus sospechosos antecedentes hacen que las investigaciones diurnas te registren falsamente como miembro de las Sombras.
            </p>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* BUZÓN NOCTURNO: INFORMES Y REVELACIONES DE LA NOCHE                      */}
      {/* ========================================================================= */}
      {player.nightReports && player.nightReports.length > 0 && (
        <div className="rounded-3xl border border-sky-800/60 bg-gradient-to-b from-sky-950/40 via-neutral-900/90 to-neutral-900/90 p-5 backdrop-blur shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-sky-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-sky-300">
                Buzón Nocturno de Inteligencia ({player.nightReports.length})
              </span>
            </div>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-sky-900/80 text-sky-200 border border-sky-700/50 flex items-center gap-1 font-mono">
              <Moon className="w-3 h-3 text-sky-300" /> Entregado en Noche
            </span>
          </div>

          <p className="text-[11px] text-neutral-300 leading-tight">
            Los resultados confidenciales de tus indagaciones diurnas se procesan y depositan aquí cada noche:
          </p>

          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {player.nightReports.map((report) => (
              <div
                key={report.id}
                className="p-3.5 rounded-2xl bg-neutral-950 border border-sky-900/40 text-xs space-y-1 shadow-inner"
              >
                <div className="flex items-center justify-between text-sky-400 font-mono text-[10px]">
                  <span className="font-bold uppercase tracking-wider">
                    {report.title || report.roleSource || 'INFORME CONFIDENCIAL'}
                  </span>
                  <span className="text-neutral-400">{report.timestamp}</span>
                </div>
                <p className="text-neutral-100 text-xs font-medium leading-relaxed">
                  {report.detail || report.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sommelier impairment status notice */}
      {player.isSommelierImpaired && (
        <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-600/40 text-xs text-amber-200 flex items-center gap-2.5 shadow">
          <Wine className="w-4 h-4 text-amber-400 shrink-0" />
          <div>
            <div className="font-bold text-amber-300">Efecto del Brindis Activo</div>
            <p className="text-[11px] text-amber-200/90 leading-tight mt-0.5">
              Has compartido una copa con el Sommelier. Tu mente está ligeramente nublada por el vino durante este ciclo.
            </p>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* INTERACTIVE ROLE-SPECIFIC ABILITY PANEL                                   */}
      {/* ========================================================================= */}
      <div className="rounded-3xl border border-neutral-800 bg-neutral-900/80 p-6 backdrop-blur shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-300">
              Habilidad Especial: {roleDef.abilityName}
            </h3>
          </div>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-300">
            Fase: {roleDef.phaseDependence}
          </span>
        </div>

        {/* 1. ASESINO */}
        {player.role === 'Asesino' && (
          <div className="space-y-4">
            {currentPhase !== 'Noche' && (
              <div className="p-3 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs flex items-start gap-2">
                <Sun className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-amber-300">Habilidad Inactiva de Día</div>
                  <p className="text-[11px] text-amber-200/90 mt-0.5">
                    Las Sombras solo pueden cobrar víctimas durante la <strong>NOCHE</strong>. Durante el día debes mantener tu coartada social intacta.
                  </p>
                </div>
              </div>
            )}
            <p className="text-xs text-neutral-300 leading-relaxed">
              Acorrala a un invitado a solas (sin testigos a 3m), susúrrale discretamente en la penumbra la frase: <strong className="text-rose-400">"¿Qué traes allí?"</strong> y solicita su Código Secreto de 4 dígitos. Al ingresarlo, se inyectará una <strong>toxina anónima</strong> silenciosa: la víctima colapsará tras un breve retraso sin descubrir quién fue su ejecutor, dándote tiempo para disimular entre la multitud:
            </p>
            <form onSubmit={handleKillSubmit} className="flex gap-2">
              <input
                type="text"
                maxLength={4}
                placeholder="Código (Ej: 4921)"
                value={killCode}
                onChange={(e) => setKillCode(e.target.value)}
                disabled={currentPhase !== 'Noche'}
                className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-sm font-mono tracking-widest text-white outline-none focus:border-rose-500 disabled:opacity-40"
              />
              <button
                type="submit"
                disabled={currentPhase !== 'Noche' || !killCode.trim()}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0"
              >
                <Skull className="w-3.5 h-3.5" />
                {currentPhase === 'Noche' ? 'Registrar Baja' : 'Solo en Noche'}
              </button>
            </form>
            {killFeedback && (
              <div
                className={`p-2.5 rounded-xl text-xs font-semibold ${
                  killFeedback.success
                    ? 'bg-emerald-950/60 border border-emerald-600/40 text-emerald-300'
                    : 'bg-rose-950/60 border border-rose-600/40 text-rose-300'
                }`}
              >
                {killFeedback.message}
              </div>
            )}

            {/* Shadow Allies Syndicate */}
            {shadowAllies.length > 0 && (
              <div className="p-3 rounded-2xl bg-rose-950/30 border border-rose-900/40 text-xs space-y-1.5">
                <div className="flex items-center gap-1.5 text-rose-300 font-bold uppercase tracking-wider text-[10px]">
                  <Users className="w-3.5 h-3.5" />
                  Tus Aliados de las Sombras:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {shadowAllies.map((a) => (
                    <span
                      key={a.id}
                      className="px-2 py-0.5 rounded-lg bg-rose-900/50 border border-rose-700/60 text-rose-200 text-[11px] font-semibold"
                    >
                      {a.name} ({a.role})
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 2. EL FOTÓGRAFO */}
        {player.role === 'El Fotógrafo' && (
          <div className="space-y-4 text-xs">
            {currentPhase !== 'Día' && !player.investigationPending && (
              <div className="p-3 rounded-2xl bg-purple-950/40 border border-purple-500/40 text-purple-200 text-xs flex items-start gap-2">
                <Moon className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-purple-300">Cámara Inactiva de Noche</div>
                  <p className="text-[11px] text-purple-200/90 mt-0.5">
                    El flash llamaría la atención en la oscuridad. El Fotógrafo solo puede capturar fotos de <strong>DÍA</strong>. Espera al amanecer.
                  </p>
                </div>
              </div>
            )}
            <p className="text-neutral-300 leading-relaxed">
              Toma una fotografía discreta a un invitado durante el <strong>DÍA</strong>. El negativo se revelará en el cuarto oscuro durante la <strong>NOCHE</strong> y el dictamen confidencial se depositará en tu Buzón Nocturno:
            </p>

            {player.investigationPending ? (
              <div className="p-4 rounded-2xl bg-sky-950/50 border border-sky-600/40 text-sky-200 space-y-2">
                <div className="flex items-center justify-between font-bold">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-sky-400 animate-spin" />
                    <span>Negativo en el Cuarto Oscuro</span>
                  </div>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-sky-900 text-sky-300 font-mono">
                    En espera de la Noche
                  </span>
                </div>
                <p className="text-[11px] text-sky-100 leading-relaxed">
                  Negativo químico de{' '}
                  <strong className="text-white">
                    {players.find((p) => p.id === player.investigationPending?.targetId)?.name || 'Objetivo'}
                  </strong>{' '}
                  en proceso de fijado. Al caer la noche, el dictamen de alineación se revelará automáticamente en tu <strong className="text-sky-300">Buzón Nocturno</strong>.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <select
                  value={fotografoTarget}
                  onChange={(e) => setFotografoTarget(e.target.value)}
                  disabled={currentPhase !== 'Día'}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-sky-500 disabled:opacity-40"
                >
                  <option value="">Selecciona al jugador a fotografiar...</option>
                  {aliveOthers.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => {
                    if (fotografoTarget) {
                      onUseFotografo(fotografoTarget);
                      setFotografoTarget('');
                    }
                  }}
                  disabled={!fotografoTarget || currentPhase !== 'Día'}
                  className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-40 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition"
                >
                  <Camera className="w-3.5 h-3.5" />
                  {currentPhase === 'Día' ? 'Disparar y Enviar a Revelado' : 'Cámara Inactiva (Requiere Día)'}
                </button>
              </div>
            )}

            {/* Permanent Photo Gallery of Revealed Targets */}
            {player.revealedPhotos && player.revealedPhotos.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-neutral-800">
                <div className="flex items-center justify-between text-neutral-400 font-semibold text-[11px]">
                  <span className="flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-sky-400" />
                    Galería de Negativos Revelados ({player.revealedPhotos.length})
                  </span>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {player.revealedPhotos.map((photo) => (
                    <div
                      key={photo.id}
                      className={`p-3 rounded-xl border flex items-center justify-between ${
                        photo.isHostile
                          ? 'bg-rose-950/40 border-rose-700/50 text-rose-200'
                          : 'bg-emerald-950/40 border-emerald-700/50 text-emerald-200'
                      }`}
                    >
                      <div>
                        <div className="font-bold text-white text-xs">{photo.targetName}</div>
                        <div className="text-[10px] opacity-75 font-mono">Revelado a las {photo.revealedAt}</div>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                          photo.isHostile
                            ? 'bg-rose-600 text-white'
                            : 'bg-emerald-600 text-white'
                        }`}
                      >
                        {photo.isHostile ? '🔴 HOSTIL (Sombras)' : '🟢 INOCENTE (Fiesta)'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 3. EL CHISMOSO */}
        {player.role === 'El Chismoso' && (
          <div className="space-y-4 text-xs">
            {currentPhase !== 'Día' && !player.chismosoUsed && !player.chismosoReport && (
              <div className="p-3 rounded-2xl bg-purple-950/40 border border-purple-500/40 text-purple-200 text-xs flex items-start gap-2">
                <Moon className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-purple-300">Cotejo Inactivo de Noche</div>
                  <p className="text-[11px] text-purple-200/90 mt-0.5">
                    Los rumores solo se contrastan en las conversaciones sociales del <strong>DÍA</strong>. Podrás usar tu cotejo cuando amanezca.
                  </p>
                </div>
              </div>
            )}

            <p className="text-neutral-300">
              Compara a 2 invitados una sola vez por partida durante el <strong>DÍA</strong>. Tu informe confidencial se entregará en tu Buzón Nocturno al caer la noche:
            </p>

            {player.chismosoPending ? (
              <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-amber-100 space-y-2">
                <div className="flex items-center justify-between font-bold">
                  <div className="flex items-center gap-1.5 text-amber-300">
                    <Clock className="w-4 h-4 text-amber-400 animate-spin" />
                    <span>Cotejo de Rumores en Proceso</span>
                  </div>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-900 text-amber-300 font-mono">
                    En espera de la Noche
                  </span>
                </div>
                <p className="text-[11px] text-amber-100 leading-relaxed">
                  Has puesto la mira en{' '}
                  <strong className="text-white">
                    {players.find((p) => p.id === player.chismosoPending?.p1Id)?.name || 'Sospechoso 1'}
                  </strong>{' '}
                  y{' '}
                  <strong className="text-white">
                    {players.find((p) => p.id === player.chismosoPending?.p2Id)?.name || 'Sospechoso 2'}
                  </strong>
                  . Al caer la noche, tu informe confidencial revelará en tu Buzón Nocturno si pertenecen al mismo bando o son rivales.
                </p>
              </div>
            ) : player.chismosoReport || player.chismosoUsed ? (
              <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-amber-100 space-y-2">
                <div className="flex items-center justify-between font-bold">
                  <div className="flex items-center gap-1.5 text-amber-300">
                    <CheckCircle2 className="w-4 h-4 text-amber-400" />
                    <span>Expediente de Cotejo Oficial</span>
                  </div>
                  {player.chismosoReport?.timestamp && (
                    <span className="text-[10px] font-mono text-amber-400/80">
                      {player.chismosoReport.timestamp}
                    </span>
                  )}
                </div>
                {player.chismosoReport ? (
                  <>
                    <div className="flex items-center gap-2 text-white font-bold text-xs">
                      <span>{player.chismosoReport.p1Name}</span>
                      <span className="text-neutral-400">vs</span>
                      <span>{player.chismosoReport.p2Name}</span>
                      <span
                        className={`text-[10px] ml-auto px-2 py-0.5 rounded-full font-bold ${
                          player.chismosoReport.sameTeam
                            ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/50'
                            : 'bg-rose-500/30 text-rose-300 border border-rose-500/50'
                        }`}
                      >
                        {player.chismosoReport.sameTeam ? 'Mismo Bando' : 'Bandos Opuestos'}
                      </span>
                    </div>
                    <p className="text-[11px] text-amber-100 leading-relaxed font-medium">
                      {player.chismosoReport.verdict}
                    </p>
                  </>
                ) : (
                  <p className="text-neutral-300">
                    {chismosoResult || 'Habilidad de cotejo de rumores ya utilizada.'}
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={chismosoP1}
                    onChange={(e) => setChismosoP1(e.target.value)}
                    className="bg-neutral-950 border border-neutral-800 rounded-xl px-2.5 py-2 text-xs text-white outline-none"
                  >
                    <option value="">Jugador 1...</option>
                    {aliveOthers.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                  <select
                    value={chismosoP2}
                    onChange={(e) => setChismosoP2(e.target.value)}
                    className="bg-neutral-950 border border-neutral-800 rounded-xl px-2.5 py-2 text-xs text-white outline-none"
                  >
                    <option value="">Jugador 2...</option>
                    {aliveOthers.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={handleChismosoSubmit}
                  disabled={chismosoLoading || !chismosoP1 || !chismosoP2 || chismosoP1 === chismosoP2 || currentPhase !== 'Día'}
                  className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-white rounded-xl font-bold transition flex items-center justify-center gap-1.5"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  {currentPhase !== 'Día'
                    ? 'Inactivo de Noche (Requiere Día)'
                    : chismosoLoading
                    ? 'Cotejando rumores...'
                    : 'Analizar Lazos Ocultos (1 solo uso)'}
                </button>

                {chismosoResult && (
                  <div className="p-3 rounded-xl bg-amber-950/50 border border-amber-600/40 text-amber-200 font-semibold animate-in fade-in">
                    {chismosoResult}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* 4. EL MÉDICO FORENSE */}
        {player.role === 'El Médico Forense' && (
          <div className="space-y-3 text-xs">
            <div className="flex items-center gap-2 text-teal-400 font-semibold">
              <Stethoscope className="w-4 h-4" />
              <span>Registro de Autopsias Forenses</span>
            </div>

            {murderHistory.length === 0 ? (
              <p className="text-neutral-500 italic">No se han registrado víctimas mortales todavía.</p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {murderHistory.map((m) => (
                  <div key={m.id} className="p-3 rounded-xl bg-neutral-950 border border-teal-900/40 space-y-1">
                    <div className="flex items-center justify-between text-teal-300 font-bold">
                      <span>Víctima: {m.victimName}</span>
                      <span className="font-mono text-[10px] text-neutral-400">{m.timestamp}</span>
                    </div>
                    <p className="text-neutral-300 text-[11px] leading-relaxed">
                      🔍 <strong>Pista Forense:</strong> {m.clue}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 5. EL ESCOLTA */}
        {displayedRole === 'El Escolta' && (
          <div className="space-y-3 text-xs">
            {currentPhase !== 'Día' && (
              <div className="p-3 rounded-2xl bg-purple-950/40 border border-purple-500/40 text-purple-200 text-xs flex items-start gap-2">
                <Moon className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-purple-300">Custodia Coordinable de Día</div>
                  <p className="text-[11px] text-purple-200/90 mt-0.5">
                    Debes coordinar y hablar cara a cara con tu protegido durante el <strong>DÍA</strong> para solicitarle su código secreto de verificación.
                  </p>
                </div>
              </div>
            )}

            <p className="text-neutral-300">
              Selecciona a quién proteger. <strong>Garantía Presencial:</strong> Habla con la persona en la fiesta y pídele su Código Secreto de 4 dígitos para certificar que estuvieron juntos.
            </p>

            <div className="space-y-2">
              <select
                value={escoltaTarget}
                onChange={(e) => setEscoltaTarget(e.target.value)}
                disabled={currentPhase !== 'Día'}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-500 disabled:opacity-40"
              >
                <option value="">Selecciona al objetivo a escoltar...</option>
                {aliveOthers.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>

              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength={4}
                  placeholder="Código de 4 dígitos del protegido..."
                  value={escoltaCode}
                  onChange={(e) => setEscoltaCode(e.target.value)}
                  disabled={currentPhase !== 'Día'}
                  className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs font-mono tracking-widest text-white outline-none focus:border-indigo-500 disabled:opacity-40"
                />
                <button
                  onClick={async () => {
                    if (escoltaTarget) {
                      const res: any = await onUseEscolta(escoltaTarget, escoltaCode.trim());
                      if (res && res.error) {
                        setEscoltaFeedback(`⚠️ ${res.error}`);
                      } else {
                        setEscoltaFeedback('✓ ¡Custodia presencial activada con éxito!');
                        setEscoltaCode('');
                      }
                      setTimeout(() => setEscoltaFeedback(null), 4000);
                    }
                  }}
                  disabled={!escoltaTarget || currentPhase !== 'Día'}
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 transition shrink-0"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {currentPhase === 'Día' ? 'Activar Custodia' : 'Solo Día'}
                </button>
              </div>

              {escoltaFeedback && (
                <div className="p-2.5 rounded-xl bg-indigo-950/60 border border-indigo-600/40 text-indigo-200 text-xs font-semibold">
                  {escoltaFeedback}
                </div>
              )}

              {/* Display current protected target */}
              {player.escoltaTargetId && (
                <div className="p-3.5 rounded-2xl bg-indigo-950/50 border border-indigo-600/40 text-indigo-200 space-y-2">
                  <div className="flex items-center justify-between font-bold">
                    <span>
                      Escoltando a:{' '}
                      <strong className="text-white">
                        {players.find((p) => p.id === player.escoltaTargetId)?.name || 'Jugador'}
                      </strong>
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        player.hasEscoltaSpokenFaceToFace
                          ? 'bg-emerald-600 text-white'
                          : 'bg-amber-600 text-white'
                      }`}
                    >
                      {player.hasEscoltaSpokenFaceToFace ? '✓ Blindaje Activo' : '⚠️ Validación Pendiente'}
                    </span>
                  </div>

                  <p className="text-[11px] text-indigo-300">
                    {player.hasEscoltaSpokenFaceToFace
                      ? 'Has verificado la presencia cara a cara. Tu protegido sobrevivirá al siguiente intento de asesinato durante la noche.'
                      : 'Pídele su código secreto de 4 dígitos cara a cara para consolidar la protección presencial.'}
                  </p>

                  <button
                    onClick={onConfirmEscoltaFaceToFace}
                    className={`w-full py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      player.hasEscoltaSpokenFaceToFace
                        ? 'bg-emerald-950 border border-emerald-600 text-emerald-300'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {player.hasEscoltaSpokenFaceToFace
                      ? '✓ Charla Cara a Cara Confirmada'
                      : 'Confirmar Charla Cara a Cara en la Fiesta'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 6. EL CÓMPLICE / HACKER */}
        {player.role === 'El Cómplice / Hacker' && (
          <div className="space-y-3 text-xs">
            {currentPhase !== 'Noche' && (
              <div className="p-3 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs flex items-start gap-2">
                <Sun className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-amber-300">Pulso EMP Inactivo de Día</div>
                  <p className="text-[11px] text-amber-200/90 mt-0.5">
                    El pulso cibernético requiere la cobertura de la <strong>NOCHE</strong> para inhabilitar las comunicaciones sin ser rastreado.
                  </p>
                </div>
              </div>
            )}

            <p className="text-neutral-300">
              Desata un pulso electromagnético (EMP) una vez por partida para glitchear e inhabilitar los teléfonos de todos los inocentes durante 3 minutos y congelar las sirenas de emergencia.
            </p>

            {isGlitchActive && (
              <div className="p-3.5 rounded-2xl bg-red-950/60 border border-red-500 text-red-200 animate-pulse space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-red-400">
                  <Zap className="w-4 h-4 text-amber-300" />
                  ⚡ PULSO EMP ACTIVO: {glitchSecsLeft}s restantes
                </div>
                <p className="text-[11px] text-red-100">
                  Las pantallas de los inocentes están saturadas con estática cibernética. Tus asesinos tienen vía libre para actuar.
                </p>
              </div>
            )}

            <button
              onClick={onTriggerHackerPulse}
              disabled={player.hackerUsed || isGlitchActive || currentPhase !== 'Noche'}
              className="w-full py-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 disabled:opacity-30 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-red-950/40 transition"
            >
              <Zap className="w-4 h-4 text-amber-300" />
              {currentPhase !== 'Noche'
                ? 'Solo Activable en Noche'
                : player.hackerUsed
                ? 'Interferencia Ya Utilizada'
                : 'Activar Pulso EMP (3 Minutos de Bloqueo)'}
            </button>

            {/* Shadow Allies Syndicate */}
            {shadowAllies.length > 0 && (
              <div className="p-3 rounded-2xl bg-rose-950/30 border border-rose-900/40 text-xs space-y-1.5">
                <div className="flex items-center gap-1.5 text-rose-300 font-bold uppercase tracking-wider text-[10px]">
                  <Users className="w-3.5 h-3.5" />
                  Tus Aliados de las Sombras:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {shadowAllies.map((a) => (
                    <span
                      key={a.id}
                      className="px-2 py-0.5 rounded-lg bg-rose-900/50 border border-rose-700/60 text-rose-200 text-[11px] font-semibold"
                    >
                      {a.name} ({a.role})
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 6b. EL CAMALEÓN */}
        {player.role === 'El Camaleón' && (
          <div className="space-y-3 text-xs">
            {currentPhase !== 'Noche' && (
              <div className="p-3 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs flex items-start gap-2">
                <Sun className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-amber-300">Suplantación Nocturna</div>
                  <p className="text-[11px] text-amber-200/90 mt-0.5">
                    El Camaleón solo puede emitir suplantaciones en el chat durante la <strong>NOCHE</strong>. Durante el día conversa con normalidad.
                  </p>
                </div>
              </div>
            )}

            <p className="text-neutral-300">
              Una vez por partida, suplanta la identidad de un jugador eliminado en el chat general para emitir coartadas falsas, acusaciones o sembrar desinformación.
            </p>

            {player.camaleonUsed ? (
              <div className="p-3.5 rounded-2xl bg-purple-950/40 border border-purple-600/40 text-purple-200">
                <div className="flex items-center gap-1.5 font-bold mb-1">
                  <CheckCircle2 className="w-4 h-4 text-purple-400" />
                  Suplantación Emitida
                </div>
                <p className="text-[11px]">
                  Tu mensaje encubierto ya fue difundido en el chat de la fiesta bajo el nombre de una víctima.
                </p>
              </div>
            ) : deadPlayers.length === 0 ? (
              <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 text-neutral-400 space-y-1">
                <div className="font-bold text-neutral-300 flex items-center gap-1.5">
                  <Ghost className="w-4 h-4 text-purple-400" />
                  Esperando la Primera Baja
                </div>
                <p className="text-[11px]">
                  Aún no hay almas fallecidas en la fiesta. Podrás suplantar la voz de la víctima en el chat en cuanto ocurra el primer asesinato.
                </p>
              </div>
            ) : (
              <div className="p-3.5 rounded-2xl bg-purple-950/50 border border-purple-600/50 text-purple-200 space-y-2">
                <div className="font-bold flex items-center gap-1.5 text-purple-300">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  Habilidad Lista para Usarse en el Chat
                </div>
                <p className="text-[11px] text-purple-100">
                  Ve a la pestaña <strong>Chat</strong> y pulsa el botón morado <strong>"Suplantar Identidad"</strong> para hablar fingiendo ser:{' '}
                  <strong className="text-white">
                    {deadPlayers.map((d) => d.name).join(', ')}
                  </strong>
                  .
                </p>
              </div>
            )}

            {/* Shadow Allies Syndicate */}
            {shadowAllies.length > 0 && (
              <div className="p-3 rounded-2xl bg-rose-950/30 border border-rose-900/40 text-xs space-y-1.5">
                <div className="flex items-center gap-1.5 text-rose-300 font-bold uppercase tracking-wider text-[10px]">
                  <Users className="w-3.5 h-3.5" />
                  Tus Aliados de las Sombras:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {shadowAllies.map((a) => (
                    <span
                      key={a.id}
                      className="px-2 py-0.5 rounded-lg bg-rose-900/50 border border-rose-700/60 text-rose-200 text-[11px] font-semibold"
                    >
                      {a.name} ({a.role})
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 7. EL PERIODISTA */}
        {player.role === 'El Periodista' && (
          <div className="space-y-3 text-xs">
            {currentPhase !== 'Día' && (
              <div className="p-3 rounded-2xl bg-purple-950/40 border border-purple-500/40 text-purple-200 text-xs flex items-start gap-2">
                <Moon className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-purple-300">Investigación Diurna</div>
                  <p className="text-[11px] text-purple-200/90 mt-0.5">
                    Las primicias e investigaciones de rol se contrastan con la luz del <strong>DÍA</strong>. Podrás formular tus teorías cuando amanezca.
                  </p>
                </div>
              </div>
            )}

            <p className="text-neutral-300">
              Formula teorías sobre las identidades secretas de otros invitados durante el <strong>DÍA</strong>. Al caer la noche, tu primicia se cotejará y el dictamen se entregará en tu Buzón Nocturno (+15 monedas si aciertas):
            </p>

            {player.periodistaPending ? (
              <div className="p-3.5 rounded-2xl bg-cyan-950/40 border border-cyan-600/40 text-cyan-200 space-y-1">
                <div className="font-bold flex items-center justify-between text-cyan-300">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-cyan-400 animate-spin" />
                    <span>Teoría en Redacción para la Noche</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-900 text-cyan-300 font-mono">
                    En imprenta
                  </span>
                </div>
                <p className="text-[11px] text-cyan-100">
                  Investigando si <strong className="text-white">{players.find((p) => p.id === player.periodistaPending?.targetId)?.name || 'Objetivo'}</strong> ostenta el rol de <strong className="text-white">{player.periodistaPending?.guessedRole}</strong>. El dictamen oficial llegará a tu Buzón Nocturno al anochecer.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={periodistaTarget}
                    onChange={(e) => setPeriodistaTarget(e.target.value)}
                    disabled={currentPhase !== 'Día'}
                    className="bg-neutral-950 border border-neutral-800 rounded-xl px-2.5 py-2 text-xs text-white outline-none disabled:opacity-40"
                  >
                    <option value="">Investigado...</option>
                    {players.filter(p => p.id !== player.id).map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>

                  <select
                    value={periodistaRoleGuess}
                    onChange={(e) => setPeriodistaRoleGuess(e.target.value as RoleType)}
                    disabled={currentPhase !== 'Día'}
                    className="bg-neutral-950 border border-neutral-800 rounded-xl px-2.5 py-2 text-xs text-white outline-none disabled:opacity-40"
                  >
                    <option value="El Fotógrafo">El Fotógrafo</option>
                    <option value="El Chismoso">El Chismoso</option>
                    <option value="El Médico Forense">El Médico Forense</option>
                    <option value="El Escolta">El Escolta</option>
                    <option value="El Camaleón">El Camaleón</option>
                    <option value="El Cómplice / Hacker">El Cómplice / Hacker</option>
                    <option value="El Detective Privado">El Detective Privado</option>
                    <option value="El Sommelier">El Sommelier</option>
                    <option value="El Barman Envenenador">El Barman Envenenador</option>
                    <option value="El Abogado de las Sombras">El Abogado de las Sombras</option>
                    <option value="El Cazador Vengativo">El Cazador Vengativo</option>
                    <option value="El Santo">El Santo</option>
                    <option value="El Recluso">El Recluso</option>
                    <option value="El Borracho">El Borracho</option>
                    <option value="El Paranoico">El Paranoico</option>
                    <option value="Asesino">Asesino</option>
                  </select>
                </div>

                <button
                  onClick={handlePeriodistaSubmit}
                  disabled={!periodistaTarget || currentPhase !== 'Día'}
                  className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 transition"
                >
                  <FileText className="w-3.5 h-3.5" />
                  {currentPhase === 'Día' ? 'Registrar Teoría Periodística' : 'Solo Disponible de Día'}
                </button>
              </div>
            )}

            {player.periodistaTheories && player.periodistaTheories.length > 0 && (
              <div className="space-y-1.5 pt-2 border-t border-neutral-800">
                <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                  Historial de Primicias Publicadas:
                </div>
                <div className="space-y-1">
                  {player.periodistaTheories.map((theory, idx) => {
                    const targetName = players.find((p) => p.id === theory.targetId)?.name || 'Invitado';
                    return (
                      <div
                        key={idx}
                        className={`p-2 rounded-xl border text-[11px] flex items-center justify-between ${
                          theory.isCorrect
                            ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                            : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
                        }`}
                      >
                        <span>{targetName}: {theory.guessedRole}</span>
                        <span className="font-bold text-[10px]">
                          {theory.isCorrect ? '✅ Acertado (+15)' : '❌ Refutado'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {periodistaFeedback && (
              <div className="p-2.5 rounded-xl bg-cyan-950/60 border border-cyan-600/40 text-cyan-200 font-semibold">
                {periodistaFeedback}
              </div>
            )}
          </div>
        )}

        {/* 8. EL DETECTIVE PRIVADO (BOTC INVESTIGATOR) */}
        {displayedRole === 'El Detective Privado' && (
          <div className="space-y-3 text-xs">
            {currentPhase !== 'Día' && (
              <div className="p-3 rounded-2xl bg-purple-950/40 border border-purple-500/40 text-purple-200 text-xs flex items-start gap-2">
                <Moon className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-purple-300">Vigilancia Diurna</div>
                  <p className="text-[11px] text-purple-200/90 mt-0.5">
                    Las pesquisas y seguimientos se inician durante el <strong>DÍA</strong>. El informe se revelará en tu buzón nocturno.
                  </p>
                </div>
              </div>
            )}

            <p className="text-neutral-300">
              Selecciona a dos invitados para vigilarlos de día. Al caer la noche, tu informe confidencial revelará si <strong>al menos uno de ellos</strong> pertenece a las Sombras.
            </p>

            {player.detectivePending || (player.pendingDetectiveP1 && player.pendingDetectiveP2) ? (
              <div className="p-3.5 rounded-2xl bg-sky-950/40 border border-sky-600/40 text-sky-200 space-y-1">
                <div className="font-bold flex items-center justify-between text-sky-300">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-sky-400 animate-spin" />
                    <span>Pesquisas en curso para la noche</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-900 text-sky-300 font-mono">
                    En seguimiento
                  </span>
                </div>
                <p className="text-[11px] text-sky-100">
                  Vigilando a:{' '}
                  <strong className="text-white">
                    {players.find((p) => p.id === (player.detectivePending?.p1Id || player.pendingDetectiveP1))?.name || 'Sospechoso 1'}
                  </strong>{' '}
                  y{' '}
                  <strong className="text-white">
                    {players.find((p) => p.id === (player.detectivePending?.p2Id || player.pendingDetectiveP2))?.name || 'Sospechoso 2'}
                  </strong>
                  . El informe confidencial llegará al anochecer a tu Buzón Nocturno.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={detectiveP1}
                    onChange={(e) => setDetectiveP1(e.target.value)}
                    disabled={currentPhase !== 'Día'}
                    className="bg-neutral-950 border border-neutral-800 rounded-xl px-2.5 py-2 text-xs text-white outline-none disabled:opacity-40"
                  >
                    <option value="">Sospechoso 1...</option>
                    {aliveOthers.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>

                  <select
                    value={detectiveP2}
                    onChange={(e) => setDetectiveP2(e.target.value)}
                    disabled={currentPhase !== 'Día'}
                    className="bg-neutral-950 border border-neutral-800 rounded-xl px-2.5 py-2 text-xs text-white outline-none disabled:opacity-40"
                  >
                    <option value="">Sospechoso 2...</option>
                    {aliveOthers.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={async () => {
                    if (detectiveP1 && detectiveP2 && detectiveP1 !== detectiveP2 && onUseDetective) {
                      setDetectiveLoading(true);
                      const res = await onUseDetective(detectiveP1, detectiveP2);
                      setDetectiveLoading(false);
                      if (res && res.error) {
                        setDetectiveFeedback(`⚠️ ${res.error}`);
                      } else {
                        setDetectiveFeedback('✓ Vigilancia iniciada. El informe confidencial llegará en la noche.');
                        setDetectiveP1('');
                        setDetectiveP2('');
                      }
                      setTimeout(() => setDetectiveFeedback(null), 5000);
                    }
                  }}
                  disabled={!detectiveP1 || !detectiveP2 || detectiveP1 === detectiveP2 || currentPhase !== 'Día' || detectiveLoading}
                  className="w-full py-2.5 bg-sky-600 hover:bg-sky-500 disabled:opacity-40 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 transition"
                >
                  <Search className="w-3.5 h-3.5" />
                  {currentPhase === 'Día' ? 'Iniciar Pesquisa Diurna' : 'Solo Disponible de Día'}
                </button>

                {detectiveFeedback && (
                  <div className="p-2.5 rounded-xl bg-sky-950/60 border border-sky-600/40 text-sky-200 font-semibold">
                    {detectiveFeedback}
                  </div>
                )}
              </div>
            )}

            {player.detectiveLastReport && (
              <div className="p-3 rounded-2xl bg-sky-950/60 border border-sky-600/40 text-sky-200 text-xs space-y-1">
                <div className="font-bold text-sky-300 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                  <FileText className="w-3.5 h-3.5 text-sky-400" />
                  Último Dictamen de Vigilancia:
                </div>
                <p className="font-medium text-white">{player.detectiveLastReport}</p>
              </div>
            )}
          </div>
        )}

        {/* 9. EL SOMMELIER (BOTC INNKEEPER / DRUNKENNESS) */}
        {displayedRole === 'El Sommelier' && (
          <div className="space-y-3 text-xs">
            {currentPhase !== 'Día' && (
              <div className="p-3 rounded-2xl bg-purple-950/40 border border-purple-500/40 text-purple-200 text-xs flex items-start gap-2">
                <Moon className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-purple-300">Cata Social de Día</div>
                  <p className="text-[11px] text-purple-200/90 mt-0.5">
                    Debes acercarte y brindar cara a cara durante el <strong>DÍA</strong> pidiéndole su código secreto de 4 dígitos.
                  </p>
                </div>
              </div>
            )}

            <p className="text-neutral-300">
              Ofrece una copa a un invitado en persona. Pídele su <strong>Código Secreto de 4 dígitos</strong> para verificar el brindis presencial. El jugador quedará <em>Borracho</em> (sus habilidades fallarán o darán pistas erróneas silenciosamente) hasta el amanecer.
            </p>

            <div className="space-y-2">
              <select
                value={sommelierTarget}
                onChange={(e) => setSommelierTarget(e.target.value)}
                disabled={currentPhase !== 'Día'}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white outline-none disabled:opacity-40"
              >
                <option value="">Selecciona al compañero de brindis...</option>
                {aliveOthers.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>

              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength={4}
                  placeholder="Código de 4 dígitos del invitado..."
                  value={sommelierCode}
                  onChange={(e) => setSommelierCode(e.target.value)}
                  disabled={currentPhase !== 'Día'}
                  className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs font-mono tracking-widest text-white outline-none disabled:opacity-40"
                />
                <button
                  onClick={async () => {
                    if (sommelierTarget && sommelierCode.trim() && onUseSommelier) {
                      setSommelierLoading(true);
                      const res = await onUseSommelier(sommelierTarget, sommelierCode.trim());
                      setSommelierLoading(false);
                      if (res && res.error) {
                        setSommelierFeedback(`⚠️ ${res.error}`);
                      } else {
                        setSommelierFeedback('✓ ¡Brindis verificado! El invitado ha bebido de tu copa.');
                        setSommelierCode('');
                      }
                      setTimeout(() => setSommelierFeedback(null), 5000);
                    }
                  }}
                  disabled={!sommelierTarget || !sommelierCode.trim() || currentPhase !== 'Día' || sommelierLoading}
                  className="px-4 py-2.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 transition shrink-0"
                >
                  <Wine className="w-3.5 h-3.5" />
                  {currentPhase === 'Día' ? 'Brindar' : 'Solo Día'}
                </button>
              </div>

              {sommelierFeedback && (
                <div className="p-2.5 rounded-xl bg-amber-950/60 border border-amber-600/40 text-amber-200 font-semibold">
                  {sommelierFeedback}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 10. EL BARMAN ENVENENADOR (BOTC POISONER) */}
        {displayedRole === 'El Barman Envenenador' && (
          <div className="space-y-3 text-xs">
            {currentPhase !== 'Noche' && (
              <div className="p-3 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs flex items-start gap-2">
                <Sun className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-amber-300">Veneno Nocturno</div>
                  <p className="text-[11px] text-amber-200/90 mt-0.5">
                    El cóctel con belladona solo se mezcla al amparo de la <strong>NOCHE</strong>. Espera a que caiga la oscuridad.
                  </p>
                </div>
              </div>
            )}

            <p className="text-neutral-300">
              Vierte discretamente veneno en la copa de un inocente durante la noche. Su habilidad fallará silenciosamente o le otorgará datos corrompidos durante el día siguiente sin que él se entere.
            </p>

            <div className="space-y-2">
              <select
                value={barmanTarget}
                onChange={(e) => setBarmanTarget(e.target.value)}
                disabled={currentPhase !== 'Noche'}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white outline-none disabled:opacity-40"
              >
                <option value="">Selecciona al objetivo a envenenar...</option>
                {aliveOthers.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>

              <button
                onClick={async () => {
                  if (barmanTarget && onUseBarman) {
                    setBarmanLoading(true);
                    const res = await onUseBarman(barmanTarget);
                    setBarmanLoading(false);
                    if (res && res.error) {
                      setBarmanFeedback(`⚠️ ${res.error}`);
                    } else {
                      setBarmanFeedback('✓ Copa envenenada secretamente. El objetivo sufrirá delirios silenciosos.');
                    }
                    setTimeout(() => setBarmanFeedback(null), 5000);
                  }
                }}
                disabled={!barmanTarget || currentPhase !== 'Noche' || barmanLoading}
                className="w-full py-2.5 bg-rose-700 hover:bg-rose-600 disabled:opacity-40 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 transition"
              >
                <Flame className="w-3.5 h-3.5" />
                {currentPhase === 'Noche' ? 'Verter Veneno en su Copa' : 'Solo en Noche'}
              </button>

              {barmanFeedback && (
                <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-600/40 text-rose-200 font-semibold">
                  {barmanFeedback}
                </div>
              )}
            </div>

            {/* Shadow Allies Syndicate */}
            {shadowAllies.length > 0 && (
              <div className="p-3 rounded-2xl bg-rose-950/30 border border-rose-900/40 text-xs space-y-1.5">
                <div className="flex items-center gap-1.5 text-rose-300 font-bold uppercase tracking-wider text-[10px]">
                  <Users className="w-3.5 h-3.5" />
                  Tus Aliados de las Sombras:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {shadowAllies.map((a) => (
                    <span
                      key={a.id}
                      className="px-2 py-0.5 rounded-lg bg-rose-900/50 border border-rose-700/60 text-rose-200 text-[11px] font-semibold"
                    >
                      {a.name} ({a.role})
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 11. EL ABOGADO DE LAS SOMBRAS (BOTC DEVIL'S ADVOCATE) */}
        {displayedRole === 'El Abogado de las Sombras' && (
          <div className="space-y-3 text-xs">
            {currentPhase !== 'Noche' && (
              <div className="p-3 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs flex items-start gap-2">
                <Sun className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-amber-300">Amparo Nocturno</div>
                  <p className="text-[11px] text-amber-200/90 mt-0.5">
                    El recurso legal se redacta durante la <strong>NOCHE</strong> para proteger a un aliado de la asamblea siguiente.
                  </p>
                </div>
              </div>
            )}

            <p className="text-neutral-300">
              Elige a un jugador (tú o un aliado de las Sombras) para emitir una orden de amparo judicial preventivo. Si la asamblea del día vota mayoritariamente para expulsarlo, la ejecución quedará judicialmente bloqueada.
            </p>

            <div className="space-y-2">
              <select
                value={abogadoTarget}
                onChange={(e) => setAbogadoTarget(e.target.value)}
                disabled={currentPhase !== 'Noche'}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white outline-none disabled:opacity-40"
              >
                <option value="">Selecciona al protegido judicial...</option>
                {players.filter(p => p.isAlive).map((p) => (
                  <option key={p.id} value={p.id}>{p.name} {p.id === player.id ? '(Tú)' : ''}</option>
                ))}
              </select>

              <button
                onClick={async () => {
                  if (abogadoTarget && onUseAbogado) {
                    setAbogadoLoading(true);
                    const res = await onUseAbogado(abogadoTarget);
                    setAbogadoLoading(false);
                    if (res && res.error) {
                      setAbogadoFeedback(`⚠️ ${res.error}`);
                    } else {
                      setAbogadoFeedback('✓ Amparo legal emitido. El objetivo es inmune a la siguiente votación de asamblea.');
                    }
                    setTimeout(() => setAbogadoFeedback(null), 5000);
                  }
                }}
                disabled={!abogadoTarget || currentPhase !== 'Noche' || abogadoLoading}
                className="w-full py-2.5 bg-indigo-700 hover:bg-indigo-600 disabled:opacity-40 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 transition"
              >
                <Briefcase className="w-3.5 h-3.5" />
                {currentPhase === 'Noche' ? 'Emitir Amparo Judicial' : 'Solo en Noche'}
              </button>

              {abogadoFeedback && (
                <div className="p-2.5 rounded-xl bg-indigo-950/60 border border-indigo-600/40 text-indigo-200 font-semibold">
                  {abogadoFeedback}
                </div>
              )}
            </div>

            {/* Shadow Allies Syndicate */}
            {shadowAllies.length > 0 && (
              <div className="p-3 rounded-2xl bg-rose-950/30 border border-rose-900/40 text-xs space-y-1.5">
                <div className="flex items-center gap-1.5 text-rose-300 font-bold uppercase tracking-wider text-[10px]">
                  <Users className="w-3.5 h-3.5" />
                  Tus Aliados de las Sombras:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {shadowAllies.map((a) => (
                    <span
                      key={a.id}
                      className="px-2 py-0.5 rounded-lg bg-rose-900/50 border border-rose-700/60 text-rose-200 text-[11px] font-semibold"
                    >
                      {a.name} ({a.role})
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 12. EL CAZADOR VENGATIVO (BOTC SLAYER / HUNTER) */}
        {player.role === 'El Cazador Vengativo' && (
          <div className="space-y-3 text-xs">
            <p className="text-neutral-300">
              Si mueres asesinado o ejecutado en la asamblea, tienes una última oportunidad de cobrar venganza disparando tu flecha mortal contra un invitado antes de que termine la partida.
            </p>

            {player.cazadorShotUsed ? (
              <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 text-neutral-400">
                ✓ Has ejecutado tu disparo de venganza final. Tu arco descansa en paz.
              </div>
            ) : player.canVengeanceShot ? (
              <div className="p-4 rounded-2xl bg-rose-950/80 border-2 border-rose-600 text-rose-100 space-y-2 animate-pulse">
                <div className="font-black text-rose-300 flex items-center gap-1.5 text-sm uppercase">
                  <Crosshair className="w-4 h-4 text-rose-400" />
                  ¡DISPARO DE VENGANZA MORTAL ACTIVO!
                </div>
                <p className="text-[11px] text-rose-200">
                  Has caído en combate. Apunta a quien sospeches que es el Asesino o miembro de las Sombras para llevarlo contigo a la tumba inmediatamente:
                </p>

                <select
                  value={cazadorTarget}
                  onChange={(e) => setCazadorTarget(e.target.value)}
                  className="w-full bg-neutral-950 border border-rose-600 rounded-xl px-3 py-2 text-xs text-white outline-none"
                >
                  <option value="">Selecciona al objetivo de tu venganza...</option>
                  {aliveOthers.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>

                <button
                  onClick={async () => {
                    if (cazadorTarget && onUseCazadorVengeance) {
                      setCazadorLoading(true);
                      const res = await onUseCazadorVengeance(cazadorTarget);
                      setCazadorLoading(false);
                      if (res && res.error) {
                        setCazadorFeedback(`⚠️ ${res.error}`);
                      } else {
                        setCazadorFeedback('🎯 ¡Flecha disparada con éxito!');
                      }
                    }
                  }}
                  disabled={!cazadorTarget || cazadorLoading}
                  className="w-full py-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black rounded-xl text-xs uppercase tracking-widest shadow-lg shadow-red-950 transition"
                >
                  🏹 Disparar Flecha de Venganza
                </button>

                {cazadorFeedback && (
                  <div className="p-2.5 rounded-xl bg-neutral-950 text-rose-300 font-bold text-center">
                    {cazadorFeedback}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-3 rounded-2xl bg-neutral-950 border border-neutral-800 text-neutral-400">
                🏹 Tu arco está cargado. Se activará si caes abatido por las Sombras o la asamblea.
              </div>
            )}
          </div>
        )}

        {/* 13. EL SANTO / EL HEREDERO MALDITO */}
        {(displayedRole === 'El Santo' || displayedRole === 'El Heredero Maldito') && (
          <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-xs text-amber-200 space-y-2">
            <div className="font-bold flex items-center gap-1.5 text-amber-400 text-sm">
              <ShieldX className="w-4 h-4 text-amber-400" />
              Regla Sagrada de Martirio:
            </div>
            <p className="leading-relaxed">
              Si la asamblea te expulsa por votación, <strong>¡LAS SOMBRAS GANAN LA PARTIDA AL INSTANTE!</strong>
            </p>
            <p className="text-[11px] text-amber-300/80">
              Debes defenderte de cualquier acusación falsa con firmeza, pero ten cautela: si revelas abiertamente que eres El Santo, el Asesino te eliminará por la noche para evitar que los inocentes tengan este salvavidas.
            </p>
          </div>
        )}

        {/* 14. EL RECLUSO / EL HUÉSPED SOSPECHOSO */}
        {(displayedRole === 'El Recluso' || displayedRole === 'El Huésped Sospechoso') && (
          <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-500/40 text-xs text-purple-200 space-y-2">
            <div className="font-bold flex items-center gap-1.5 text-purple-300">
              <AlertCircle className="w-4 h-4 text-purple-400" />
              Pasado Turbio (Aura Falsa):
            </div>
            <p className="leading-relaxed">
              Perteneces fielmente al equipo de la <strong>Fiesta (Inocentes)</strong>, pero debido a tus antecedentes penales, las habilidades de investigación (como el Fotógrafo, el Chismoso o el Detective) pueden registrarte falsamente como si fueras de las Sombras.
            </p>
          </div>
        )}

        {/* 15. EL MAYORDOMO MAYOR */}
        {displayedRole === 'El Mayordomo Mayor' && (
          <div className="p-4 rounded-2xl bg-neutral-950/60 border border-amber-500/30 text-xs text-neutral-300 space-y-2">
            <div className="font-bold flex items-center gap-1.5 text-amber-400 text-sm">
              <Users className="w-4 h-4 text-amber-400" />
              Censo Nocturno de las Sombras:
            </div>
            <p className="text-[11px] leading-relaxed">
              Como conocedor de todos los rincones de la mansión, cada noche el Árbitro IA te envía a tu <strong>Buzón Nocturno</strong> el recuento exacto de cuántos miembros de las Sombras siguen vivos en la fiesta.
            </p>
            {player.mayordomoReport && (
              <div className="p-2.5 rounded-xl bg-amber-950/50 border border-amber-500/40 text-amber-200 font-mono text-[11px]">
                {player.mayordomoReport}
              </div>
            )}
          </div>
        )}

        {/* 16. EL TESTIGO OCULAR */}
        {displayedRole === 'El Testigo Ocular' && (
          <div className="p-4 rounded-2xl bg-neutral-950 border border-sky-600/40 text-xs text-sky-200 space-y-2">
            <div className="font-bold flex items-center gap-1.5 text-sky-300 text-sm">
              <Eye className="w-4 h-4 text-sky-400" />
              Testimonio Ocular Póstumo:
            </div>
            <p className="text-[11px] text-neutral-300">
              Si caes asesinado por las Sombras, en el instante de tu muerte logras vislumbrar a 2 sospechosos: uno de ellos es tu ejecutor real.
            </p>
            {player.testigoKillerCandidates && player.testigoKillerCandidates.length > 0 && (
              <div className="p-3 rounded-xl bg-sky-950/80 border border-sky-500 text-sky-100 space-y-1">
                <div className="font-bold text-[11px] text-amber-300 uppercase">
                  👁️ ¡Viste en la penumbra a:
                </div>
                <div className="flex gap-2">
                  {player.testigoKillerCandidates.map((name, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-lg bg-neutral-950 border border-sky-400 text-white font-mono font-bold text-xs">
                      {name}
                    </span>
                  ))}
                </div>
                <div className="text-[10px] text-sky-300 mt-1">
                  Uno de ellos es el asesino real. ¡Compártelo en la asamblea!
                </div>
              </div>
            )}
          </div>
        )}

        {/* 17. EL MÉDICO (PACTO PRESENCIAL: CÓDIGO 4 DÍGITOS) */}
        {displayedRole === 'El Médico' && (
          <div className="space-y-3 text-xs">
            <p className="text-neutral-300">
              Acércate físicamente a un invitado, pídele su <strong>Código Secreto de 4 dígitos</strong> e inyéctale tu antídoto para limpiar cualquier veneno o alteración sensorial por hoy:
            </p>

            <div className="space-y-2">
              <select
                value={medicoTarget}
                onChange={(e) => setMedicoTarget(e.target.value)}
                disabled={player.medicoAntidoteUsed}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white outline-none disabled:opacity-40"
              >
                <option value="">Selecciona paciente a inyectar...</option>
                {aliveOthers.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>

              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength={4}
                  placeholder="Código Secreto de 4 dígitos"
                  value={medicoCode}
                  onChange={(e) => setMedicoCode(e.target.value)}
                  disabled={player.medicoAntidoteUsed}
                  className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs font-mono tracking-widest text-white outline-none disabled:opacity-40"
                />
                <button
                  onClick={handleMedicoSubmit}
                  disabled={!medicoTarget || !medicoCode || player.medicoAntidoteUsed || medicoLoading}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition"
                >
                  <Syringe className="w-3.5 h-3.5" />
                  Inyectar
                </button>
              </div>

              {medicoFeedback && (
                <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-600/40 text-emerald-200 font-semibold">
                  {medicoFeedback}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 18. EL ABOGADO DEFENSOR (PACTO PRESENCIAL: CÓDIGO 4 DÍGITOS) */}
        {displayedRole === 'El Abogado Defensor' && (
          <div className="space-y-3 text-xs">
            <p className="text-neutral-300">
              Acércate físicamente a un inocente, intercambien su <strong>Código Secreto de 4 dígitos</strong> y formalicen su poder notarial. Si la asamblea vota por expulsarlo hoy, la orden quedará revocada:
            </p>

            <div className="space-y-2">
              <select
                value={abogadoDefensorTarget}
                onChange={(e) => setAbogadoDefensorTarget(e.target.value)}
                disabled={player.abogadoDefensorUsedToday}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white outline-none disabled:opacity-40"
              >
                <option value="">Selecciona al cliente defendido...</option>
                {players.filter((p) => p.isAlive).map((p) => (
                  <option key={p.id} value={p.id}>{p.name} {p.id === player.id ? '(Tú)' : ''}</option>
                ))}
              </select>

              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength={4}
                  placeholder="Código Secreto de 4 dígitos"
                  value={abogadoDefensorCode}
                  onChange={(e) => setAbogadoDefensorCode(e.target.value)}
                  disabled={player.abogadoDefensorUsedToday}
                  className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs font-mono tracking-widest text-white outline-none disabled:opacity-40"
                />
                <button
                  onClick={handleAbogadoDefensorSubmit}
                  disabled={!abogadoDefensorTarget || !abogadoDefensorCode || player.abogadoDefensorUsedToday || abogadoDefensorLoading}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition"
                >
                  <Scale className="w-3.5 h-3.5" />
                  Firmar Poder
                </button>
              </div>

              {abogadoDefensorFeedback && (
                <div className="p-2.5 rounded-xl bg-indigo-950/60 border border-indigo-600/40 text-indigo-200 font-semibold">
                  {abogadoDefensorFeedback}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 19. EL TITIRITERO (MALDICIÓN DE LA LOCURA) */}
        {displayedRole === 'El Titiritero' && (
          <div className="space-y-3 text-xs">
            <p className="text-neutral-300">
              Hilos de Locura: Selecciona a un invitado para poseerlo con la <strong>Regla de la Locura</strong>. Deberá fingir ante todos que posee el rol asignado. Además, si eliminas de noche a un Forastero, se unirá secretamente a las Sombras.
            </p>

            <div className="space-y-2">
              <select
                value={titiriteroTarget}
                onChange={(e) => setTitiriteroTarget(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white outline-none"
              >
                <option value="">Selecciona objetivo a maldecir...</option>
                {aliveOthers.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>

              <select
                value={titiriteroRole}
                onChange={(e) => setTitiriteroRole(e.target.value as RoleType)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white outline-none"
              >
                <option value="El Santo">Obligar a fingir ser: El Santo</option>
                <option value="El Fotógrafo">Obligar a fingir ser: El Fotógrafo</option>
                <option value="El Detective Privado">Obligar a fingir ser: El Detective</option>
                <option value="El Escolta">Obligar a fingir ser: El Escolta</option>
                <option value="El Sommelier">Obligar a fingir ser: El Sommelier</option>
              </select>

              <button
                onClick={handleTitiriteroSubmit}
                disabled={!titiriteroTarget || titiriteroLoading}
                className="w-full py-2.5 bg-purple-700 hover:bg-purple-600 disabled:opacity-40 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 transition"
              >
                <Drama className="w-3.5 h-3.5" />
                Lanzar Hechizo de Locura
              </button>

              {titiriteroFeedback && (
                <div className="p-2.5 rounded-xl bg-purple-950/60 border border-purple-600/40 text-purple-200 font-semibold">
                  {titiriteroFeedback}
                </div>
              )}
            </div>

            {/* Shadow Allies Syndicate */}
            {shadowAllies.length > 0 && (
              <div className="p-3 rounded-2xl bg-rose-950/30 border border-rose-900/40 text-xs space-y-1.5">
                <div className="flex items-center gap-1.5 text-rose-300 font-bold uppercase tracking-wider text-[10px]">
                  <Users className="w-3.5 h-3.5" />
                  Tus Aliados de las Sombras:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {shadowAllies.map((a) => (
                    <span
                      key={a.id}
                      className="px-2 py-0.5 rounded-lg bg-rose-900/50 border border-rose-700/60 text-rose-200 text-[11px] font-semibold"
                    >
                      {a.name} ({a.role})
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 20. EL PADRINO SILENCIOSO */}
        {displayedRole === 'El Padrino Silencioso' && (
          <div className="space-y-3 text-xs">
            <p className="text-neutral-300">
              Paciencia Letal: Si decides no asesinar durante esta Noche, entrarás en modo acecho y acumularás una ráfaga de hasta 3 asesinatos consecutivos para la noche siguiente:
            </p>

            <button
              onClick={handlePadrinoSkipSubmit}
              disabled={currentPhase !== 'Noche' || padrinoLoading}
              className="w-full py-2.5 bg-neutral-900 hover:bg-neutral-800 border border-rose-600/50 text-rose-300 font-bold rounded-xl flex items-center justify-center gap-1.5 transition disabled:opacity-40"
            >
              <Skull className="w-3.5 h-3.5 text-rose-400" />
              {currentPhase === 'Noche' ? 'Pausar Caza y Cargar Ráfaga Mortal' : 'Solo disponible en Noche'}
            </button>

            {padrinoFeedback && (
              <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-600/40 text-rose-200 font-semibold">
                {padrinoFeedback}
              </div>
            )}

            {/* Shadow Allies Syndicate */}
            {shadowAllies.length > 0 && (
              <div className="p-3 rounded-2xl bg-rose-950/30 border border-rose-900/40 text-xs space-y-1.5">
                <div className="flex items-center gap-1.5 text-rose-300 font-bold uppercase tracking-wider text-[10px]">
                  <Users className="w-3.5 h-3.5" />
                  Tus Aliados de las Sombras:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {shadowAllies.map((a) => (
                    <span
                      key={a.id}
                      className="px-2 py-0.5 rounded-lg bg-rose-900/50 border border-rose-700/60 text-rose-200 text-[11px] font-semibold"
                    >
                      {a.name} ({a.role})
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 21. EL ASESINO LÍDER (IMP TRANSFER) */}
        {displayedRole === 'El Asesino Líder' && (
          <div className="space-y-3 text-xs">
            <p className="text-neutral-300">
              Estrategia del Líder: Puedes autoinmolarte de noche o de día para despistar a la asamblea. Al morir voluntariamente, el comando nocturno se transferirá a uno de tus cómplices vivos:
            </p>

            <button
              onClick={handleImpTransferSubmit}
              disabled={impLoading}
              className="w-full py-2.5 bg-red-950 hover:bg-red-900 border border-red-600 text-red-200 font-bold rounded-xl flex items-center justify-center gap-1.5 transition"
            >
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              Sacrificio Supremo (Heredar Manto)
            </button>

            {impFeedback && (
              <div className="p-2.5 rounded-xl bg-red-950/80 border border-red-600 text-red-200 font-semibold">
                {impFeedback}
              </div>
            )}

            {/* Shadow Allies Syndicate */}
            {shadowAllies.length > 0 && (
              <div className="p-3 rounded-2xl bg-rose-950/30 border border-rose-900/40 text-xs space-y-1.5">
                <div className="flex items-center gap-1.5 text-rose-300 font-bold uppercase tracking-wider text-[10px]">
                  <Users className="w-3.5 h-3.5" />
                  Tus Aliados de las Sombras:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {shadowAllies.map((a) => (
                    <span
                      key={a.id}
                      className="px-2 py-0.5 rounded-lg bg-rose-900/50 border border-rose-700/60 text-rose-200 text-[11px] font-semibold"
                    >
                      {a.name} ({a.role})
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 22. EL LAVADOR DE DINERO */}
        {displayedRole === 'El Lavador de Dinero' && (
          <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-600/40 text-xs text-emerald-200 space-y-2">
            <div className="font-bold flex items-center gap-1.5 text-emerald-300 text-sm">
              <Briefcase className="w-4 h-4 text-emerald-400" />
              Sindicato Financiero de las Sombras:
            </div>
            <p className="text-[11px] text-neutral-300 leading-relaxed">
              Cada asesinato ejecutado por el sindicato te otorga <strong>+10 monedas</strong> directas en la tienda del Seven. Al acumular 3 bajas, el sindicato desbloqueará una baja adicional para la noche.
            </p>

            {/* Shadow Allies Syndicate */}
            {shadowAllies.length > 0 && (
              <div className="p-3 rounded-2xl bg-rose-950/30 border border-rose-900/40 text-xs space-y-1.5 mt-2">
                <div className="flex items-center gap-1.5 text-rose-300 font-bold uppercase tracking-wider text-[10px]">
                  <Users className="w-3.5 h-3.5" />
                  Tus Aliados de las Sombras:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {shadowAllies.map((a) => (
                    <span
                      key={a.id}
                      className="px-2 py-0.5 rounded-lg bg-rose-900/50 border border-rose-700/60 text-rose-200 text-[11px] font-semibold"
                    >
                      {a.name} ({a.role})
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 15. EL PARANOICO */}
        {displayedRole === 'El Paranoico' && (
          <div className="p-3.5 rounded-2xl bg-yellow-950/30 border border-yellow-500/30 text-xs text-yellow-200 space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-yellow-400" />
              Objetivo de Victoria Único:
            </div>
            <p>
              Debes lograr que la asamblea te expulse mediante votos en la <strong>Asamblea 1 o 2</strong>. ¡Actúa de forma errática y sospechosa pero sin confesar tu rol!
            </p>
          </div>
        )}

        {/* 9. ALMA ATORMENTADORA */}
        {isGhost && (
          <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-300 space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-slate-300">
              <Ghost className="w-4 h-4 text-purple-400" />
              Poder Espectral:
            </div>
            <p>
              Sigue completando tus tareas de ultratumba para alterar el equilibrio de la fiesta y apoyar a tu causa favorita.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
