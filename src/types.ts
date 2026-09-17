export type RoleFamily =
  | 'Invitados Distinguidos'
  | 'Excéntricos y Problemáticos'
  | 'Los Cómplices'
  | 'Las Sombras Supremos';

export type RoleType =
  // I. Invitados Distinguidos (Aldeanos / Bien)
  | 'Inocente'
  | 'El Fotógrafo'
  | 'El Mayordomo Mayor'
  | 'El Sommelier'
  | 'El Guardaespaldas'
  | 'El Escolta' // alias compatible
  | 'El Médico Forense'
  | 'El Cazador Vengativo'
  | 'El Detective Privado'
  | 'El Periodista'
  | 'El Abogado Defensor'
  | 'El Testigo Ocular'
  | 'El Médico'
  | 'El Chismoso'
  // II. Excéntricos y Problemáticos (Forasteros / Outsiders)
  | 'El Borracho Inconsciente'
  | 'El Borracho' // alias compatible
  | 'El Huésped Paranoico'
  | 'El Paranoico' // alias compatible
  | 'El Huésped Sospechoso'
  | 'El Recluso' // alias compatible
  | 'El Heredero Maldito'
  | 'El Santo' // alias compatible
  // III. Los Cómplices (Esbirros / Minions)
  | 'El Barman Envenenador'
  | 'El Hacker Cibernético'
  | 'El Cómplice / Hacker' // alias compatible
  | 'El Camaleón'
  | 'El Lavador de Dinero'
  | 'El Abogado de las Sombras'
  // IV. Las Sombras Supremos (Demonios / Killers)
  | 'El Asesino Líder'
  | 'Asesino' // alias compatible
  | 'El Padrino Silencioso'
  | 'El Titiritero'
  // Ultratumba
  | 'Alma Atormentadora';

export type TeamType = 'Fiesta (Inocentes)' | 'Sombras (Asesinos)' | 'Caos (Independiente)';

export type GamePhase = 'Día' | 'Noche';

export const MURDER_PACT_WORD = '¿Qué traes allí?';

export interface PlayerMission {
  id: string;
  title: string;
  description: string;
  type: 'social' | 'desafio' | 'fantasma' | 'lore' | 'sombra';
  progress: number; // 0 - 100
  targetCount: number;
  currentCount: number;
  completed: boolean;
  rewardCoins?: number; // Monedas ganadas al completar
}

export interface RevealedPhoto {
  id: string;
  targetId: string;
  targetName: string;
  team: TeamType;
  isHostile: boolean;
  revealedAt: string;
}

export interface ChismosoReport {
  id: string;
  p1Id: string;
  p1Name: string;
  p2Id: string;
  p2Name: string;
  sameTeam: boolean;
  verdict: string;
  timestamp: string;
}

export interface NightReportEntry {
  id: string;
  title?: string;
  detail?: string;
  roleSource?: string;
  content?: string;
  timestamp: string;
  isHostile?: boolean;
}

export interface Player {
  id: string;
  name: string;
  avatar: string;
  pin: string; // PIN personal de 4 dígitos
  victimCode: string; // Código de 4 dígitos para pactos presenciales (escolta, veneno, asesinato)
  role: RoleType;
  fakeRole?: RoleType; // Para El Borracho: el rol que cree tener
  team: TeamType;
  isAlive: boolean;
  isHost?: boolean;
  emergencyCallsLeft: number;
  coins: number; // Monedas / Fichas de la Fiesta
  hasBulletproofVest?: boolean; // Chaleco Antibalas (salva de 1 intento)
  doubleVotesAvailable?: number; // Votos dobles para asamblea
  purchasedClues?: string[];
  missions: PlayerMission[]; // Misiones individuales
  missionCompleted?: boolean;
  
  // Escolta
  protectedByEscoltaUntil?: number; // timestamp
  hasEscoltaSpokenFaceToFace?: boolean;
  escoltaTargetId?: string;
  escoltaProtectedUntil?: number;
  
  // Fotógrafo (Acción de Día -> Revelación de Noche)
  photographCooldownUntil?: number;
  investigationPending?: { targetId: string; revealTime: number; queuedForNight?: boolean };
  revealedPhotos?: RevealedPhoto[];
  
  // Chismoso (Acción de Día -> Revelación de Noche)
  chismosoUsed: boolean;
  chismosoPending?: { p1Id: string; p2Id: string };
  chismosoReport?: ChismosoReport;
  
  // Detective Privado (Acción de Día -> Revelación de Noche)
  detectivePending?: { p1Id: string; p2Id: string };
  pendingDetectiveP1?: string;
  pendingDetectiveP2?: string;
  detectiveLastReport?: string;
  
  // Periodista
  periodistaPending?: { targetId: string; guessedRole: RoleType };
  periodistaTheories: { targetId: string; guessedRole: RoleType; isCorrect?: boolean }[];
  
  // Sommelier & Barman & Envenenamiento & Embriaguez (isImpaired)
  isPoisoned?: boolean;
  poisonedUntil?: number;
  isImpaired?: boolean; // Flag interno BotC: veneno, alcohol o interferencia (falla silenciosa o 50% info falsa)
  registersAsHostile?: boolean; // Flag interno BotC: Falso Positivo (Recluso / Huésped Sospechoso)
  barmanPoisonUsed?: boolean;
  barmanPoisonTargetId?: string;
  sommelierTargetId?: string;
  sommelierUsed?: boolean;
  isSommelierImpaired?: boolean;

  // Médico
  medicoAntidoteUsed?: boolean;

  // Abogado Defensor (Bien) vs Abogado de las Sombras (Mal)
  abogadoDefensorTargetId?: string;
  abogadoDefensorUsedToday?: boolean;
  abogadoProtectedId?: string;
  abogadoUsedToday?: boolean;

  // Testigo Ocular
  testigoKillerCandidates?: string[];

  // Mayordomo Mayor
  mayordomoReport?: string;

  // Regla de la Locura (Madness)
  madness?: {
    assignedRole: RoleType;
    targetCodesNeeded: number;
    confirmedCodes: string[];
    isBroken?: boolean;
  };

  // Asesino Líder / Padrino Silencioso / Titiritero / Lavador de Dinero
  isImpLeader?: boolean;
  padrinoCharged?: boolean; // Si no mató la noche anterior, puede matar hasta 3
  padrinoKillsRemaining?: number;
  titiriteroInfectedId?: string;
  lavadorBonusKills?: number;
  
  // Cazador Vengativo
  canVengeanceShot?: boolean;
  vengeanceShotUsed?: boolean;
  cazadorShotUsed?: boolean;

  // Buzón de Informes Nocturnos
  nightReports?: NightReportEntry[];
  
  // Modificadores de la Ruleta de Macareno
  macarenoBuff?: {
    type: 'snack_immune' | 'alfa_vote' | 'silenced' | 'horse';
    expiresAt: number;
  };

  // Roles de engaño
  camaleonUsed: boolean;
  hackerUsed: boolean;
}

export interface ShopItem {
  id: string;
  name: string;
  icon: string;
  cost: number;
  description: string;
  badge?: string;
  availableFor: 'all' | 'alive' | 'ghost';
}

export const SHOP_ITEMS: ShopItem[] = [
  {
    id: 'vest',
    name: 'Chaleco Antibalas',
    icon: '🛡️',
    cost: 15,
    description: 'Si un asesino te acorrala e introduce tu código, el chaleco amortigua el ataque y tu muerte queda anulada.',
    badge: 'Defensa Vital',
    availableFor: 'alive',
  },
  {
    id: 'bribe_clue',
    name: 'Soborno al Forense (Pista IA)',
    icon: '🔍',
    cost: 10,
    description: 'El Árbitro IA te envía una pista confidencial al chat privado sobre la vestimenta o hábitos del asesino.',
    badge: 'Información',
    availableFor: 'all',
  },
  {
    id: 'double_vote',
    name: 'Voto Doble en Asamblea',
    icon: '⚖️',
    cost: 8,
    description: 'Tu voto contará por 2 en la próxima asamblea de emergencia para expulsar a un sospechoso.',
    badge: 'Influencia',
    availableFor: 'alive',
  },
  {
    id: 'seven_snack',
    name: 'Ronda de Pizza del Seven',
    icon: '🍕',
    cost: 6,
    description: 'Aporta a la fiesta. Sube la barra colectiva de los inocentes en +8% de inmediato.',
    badge: 'Colectivo',
    availableFor: 'all',
  },
  {
    id: 'emp_jam',
    name: 'Interferidor de Asamblea',
    icon: '📡',
    cost: 12,
    description: 'Bloquea la sirena de emergencia de la fiesta durante 90 segundos de caos total.',
    badge: 'Caos',
    availableFor: 'all',
  }
];

export interface PartyEvent {
  id: string;
  title: string;
  description: string;
  instructions: string;
  durationSeconds: number;
  type: 'urgente' | 'divertido' | 'caotico';
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  receiverId: string | null; // null = General, string = privado
  content: string;
  timestamp: string;
  isSystem?: boolean;
  isAI?: boolean;
  isChameleon?: boolean;
  chameleonDisguiseName?: string;
}

export interface MurderReport {
  id: string;
  victimId: string;
  victimName: string;
  timestamp: string;
  clue: string; // Pista forense abstracta o generada por IA
  aiAnalysis?: string;
}

export interface AILogEntry {
  id: string;
  text: string;
  timestamp: string;
  type: 'forensic' | 'lore' | 'event' | 'referee';
}

export interface MacarenoWheelEvent {
  id: string;
  sliceIndex: number;
  title: string;
  lore: string;
  characterArchetype: string; // 'Jackie' | 'Luisda' | 'Elle' | 'Caballo' | 'Alfa' | 'Chisme' | 'Capricho'
  assignedPlayerId: string;
  assignedPlayerName: string;
  instructions: string;
  durationSeconds: number;
  effectType: 'snack' | 'migajas' | 'novia_malvada' | 'caballo' | 'alfa' | 'chisme' | 'capricho';
  migajasCollected?: boolean;
  migajasCollectorName?: string;
  timestamp: string;
}

export interface DelayedPoisonVictim {
  victimId: string;
  victimName: string;
  killerId: string;
  killerName: string;
  strikeTime: number;
  deathTime: number; // Resolves silently after delay
  clue: string;
  executed: boolean;
}

export type PushNotificationType =
  | 'emergency'
  | 'wheel'
  | 'phase'
  | 'murder'
  | 'whisper'
  | 'broadcast'
  | 'general';

export interface PushNotificationPayload {
  id: string;
  type: PushNotificationType;
  title: string;
  body: string;
  icon?: string;
  timestamp: string;
  senderName?: string;
}

export interface GameState {
  roomCode: string;
  status: 'lobby' | 'playing' | 'ended';
  hostPlayerId: string;
  phase: GamePhase;
  phaseTimeRemaining: number;
  phaseDuration: number;
  dayCount: number;
  dayEventTriggered: boolean;
  dayEventScheduledSecond?: number;
  isGameStarted: boolean;
  isEmergencyActive: boolean;
  emergencyTimeRemaining: number;
  emergencyCallerName: string | null;
  activeEvent: PartyEvent | null;
  eventTimeRemaining: number;
  nextEventCooldown?: number;
  macarenoWheelActive?: boolean;
  macarenoEvent?: MacarenoWheelEvent | null;
  macarenoWheelSpinning?: boolean;
  delayedPoisons?: DelayedPoisonVictim[];
  latestPush?: PushNotificationPayload | null;
  recentPushes?: PushNotificationPayload[];
  votes: Record<string, string>; // voterId -> targetId | 'skip'
  doubleVoteUsers?: string[]; // voterIds who activated double vote in this tribunal
  accusedPlayerId?: string | null; // For final plea defense in tribunal
  defenseTimerRemaining?: number; // 60s defense countdown
  tribunalStage?: 'voting' | 'defense' | 'concluded';
  meetingRound: number;
  hackerGlitchActiveUntil: number | null;
  murderHistory: MurderReport[];
  collectiveTaskProgress: number; // 0 - 100%
  aiNarratorLogs: AILogEntry[];
  winner: TeamType | null;
  winReason?: string;
}
