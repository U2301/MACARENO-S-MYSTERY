import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import {
  Player,
  GameState,
  RoleType,
  TeamType,
  ChatMessage,
  MurderReport,
  PartyEvent,
  SHOP_ITEMS,
  NightReportEntry,
  PushNotificationPayload
} from './src/types';
import { generateFivePlayerMissions } from './src/data/missions';
import { PARTY_EVENTS, getRandomEvent } from './src/data/events';
import { buildMacarenoEvent } from './src/data/macarenoWheel';

const app = express();
const PORT = 3000;

app.use(express.json());

// Helper for broadcasting phone push notifications to room state
function broadcastPushToRoom(
  room: RoomData,
  push: PushNotificationPayload
) {
  room.state.latestPush = push;
  room.state.recentPushes = room.state.recentPushes || [];
  room.state.recentPushes.unshift(push);
  if (room.state.recentPushes.length > 25) {
    room.state.recentPushes.pop();
  }
}

// Initialize GoogleGenAI client (lazy / safe)
let genAI: GoogleGenAI | null = null;
function getAI(): GoogleGenAI | null {
  if (!genAI && process.env.GEMINI_API_KEY) {
    genAI = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return genAI;
}

// In-Memory Room Store for real-time online play
interface RoomData {
  state: GameState;
  players: Player[];
  chatMessages: ChatMessage[];
}

const rooms = new Map<string, RoomData>();

// Role catalog map
const ROLE_TEAMS: Record<RoleType, TeamType> = {
  'Inocente': 'Fiesta (Inocentes)',
  'El Fotógrafo': 'Fiesta (Inocentes)',
  'El Chismoso': 'Fiesta (Inocentes)',
  'El Médico Forense': 'Fiesta (Inocentes)',
  'El Escolta': 'Fiesta (Inocentes)',
  'El Guardaespaldas': 'Fiesta (Inocentes)',
  'El Periodista': 'Fiesta (Inocentes)',
  'El Detective Privado': 'Fiesta (Inocentes)',
  'El Cazador Vengativo': 'Fiesta (Inocentes)',
  'El Sommelier': 'Fiesta (Inocentes)',
  'El Mayordomo Mayor': 'Fiesta (Inocentes)',
  'El Médico': 'Fiesta (Inocentes)',
  'El Abogado Defensor': 'Fiesta (Inocentes)',
  'El Testigo Ocular': 'Fiesta (Inocentes)',
  'El Recluso': 'Fiesta (Inocentes)',
  'El Huésped Sospechoso': 'Fiesta (Inocentes)',
  'El Santo': 'Fiesta (Inocentes)',
  'El Heredero Maldito': 'Fiesta (Inocentes)',
  'El Borracho': 'Fiesta (Inocentes)',
  'El Borracho Inconsciente': 'Fiesta (Inocentes)',
  'El Paranoico': 'Caos (Independiente)',
  'El Huésped Paranoico': 'Caos (Independiente)',
  'Alma Atormentadora': 'Caos (Independiente)',
  'Asesino': 'Sombras (Asesinos)',
  'El Asesino Líder': 'Sombras (Asesinos)',
  'El Padrino Silencioso': 'Sombras (Asesinos)',
  'El Titiritero': 'Sombras (Asesinos)',
  'El Camaleón': 'Sombras (Asesinos)',
  'El Cómplice / Hacker': 'Sombras (Asesinos)',
  'El Hacker Cibernético': 'Sombras (Asesinos)',
  'El Barman Envenenador': 'Sombras (Asesinos)',
  'El Abogado de las Sombras': 'Sombras (Asesinos)',
  'El Lavador de Dinero': 'Sombras (Asesinos)',
};

// High-entropy Fisher-Yates shuffle algorithm
function fisherYatesShuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function balanceRolesForPlayers(playerCount: number): RoleType[] {
  const roles: RoleType[] = [];

  if (playerCount <= 3) {
    roles.push('Asesino', 'El Fotógrafo', 'Inocente');
  } else if (playerCount === 4) {
    roles.push('Asesino', 'El Fotógrafo', 'El Escolta', 'El Paranoico');
  } else if (playerCount === 5) {
    roles.push('Asesino', 'El Fotógrafo', 'El Escolta', 'El Médico Forense', 'El Chismoso');
  } else if (playerCount === 6) {
    roles.push('Asesino', 'El Fotógrafo', 'El Escolta', 'El Médico Forense', 'El Chismoso', 'El Camaleón');
  } else if (playerCount === 7) {
    roles.push('Asesino', 'El Fotógrafo', 'El Escolta', 'El Médico Forense', 'El Chismoso', 'El Camaleón', 'El Paranoico');
  } else if (playerCount === 8) {
    roles.push('Asesino', 'El Fotógrafo', 'El Escolta', 'El Médico Forense', 'El Chismoso', 'El Camaleón', 'El Cómplice / Hacker', 'El Paranoico');
  } else if (playerCount === 9) {
    roles.push('Asesino', 'El Fotógrafo', 'El Escolta', 'El Médico Forense', 'El Chismoso', 'El Camaleón', 'El Cómplice / Hacker', 'El Paranoico', 'El Detective Privado');
  } else if (playerCount <= 12) {
    // 10-12 jugadores (2 Asesinos, 2 Minions, 2 Forasteros, 4-6 Aldeanos)
    roles.push(
      'Asesino',
      'Asesino',
      'El Barman Envenenador',
      'El Camaleón',
      'El Santo',
      'El Paranoico',
      'El Fotógrafo',
      'El Escolta',
      'El Médico Forense',
      'El Detective Privado'
    );
    if (playerCount >= 11) roles.push('El Chismoso');
    if (playerCount >= 12) roles.push('El Cazador Vengativo');
  } else if (playerCount <= 16) {
    // 13-16 jugadores (2 Asesinos, 2 Minions, 3 Forasteros, 6-9 Aldeanos)
    roles.push(
      'Asesino',
      'Asesino',
      'El Barman Envenenador',
      'El Abogado de las Sombras',
      'El Santo',
      'El Recluso',
      'El Borracho',
      'El Fotógrafo',
      'El Escolta',
      'El Médico Forense',
      'El Chismoso',
      'El Detective Privado',
      'El Cazador Vengativo'
    );
    if (playerCount >= 14) roles.push('El Sommelier');
    if (playerCount >= 15) roles.push('El Periodista');
    if (playerCount >= 16) roles.push('El Paranoico');
  } else if (playerCount <= 20) {
    // 17-20 jugadores (2 Asesinos, 3 Minions, 4 Forasteros, Población completa)
    roles.push(
      'Asesino',
      'Asesino',
      'El Barman Envenenador',
      'El Abogado de las Sombras',
      'El Camaleón',
      'El Santo',
      'El Recluso',
      'El Borracho',
      'El Paranoico',
      'El Fotógrafo',
      'El Escolta',
      'El Médico Forense',
      'El Chismoso',
      'El Detective Privado',
      'El Cazador Vengativo',
      'El Sommelier',
      'El Periodista'
    );
    while (roles.length < playerCount) {
      roles.push('Inocente');
    }
  } else {
    // 21-25 jugadores (3 Asesinos, 4 Minions, 4 Forasteros, Todos los Aldeanos + Inocentes)
    roles.push(
      'Asesino',
      'Asesino',
      'Asesino',
      'El Barman Envenenador',
      'El Abogado de las Sombras',
      'El Camaleón',
      'El Cómplice / Hacker',
      'El Santo',
      'El Recluso',
      'El Borracho',
      'El Paranoico',
      'El Fotógrafo',
      'El Escolta',
      'El Médico Forense',
      'El Chismoso',
      'El Detective Privado',
      'El Cazador Vengativo',
      'El Sommelier',
      'El Periodista'
    );
    while (roles.length < playerCount) {
      roles.push('Inocente');
    }
  }

  while (roles.length < playerCount) {
    roles.push('Inocente');
  }

  return fisherYatesShuffle(fisherYatesShuffle(roles));
}

// BotC Night Resolution Engine: processes day actions and deposits confidential reports at nightfall
function processNightRevelations(room: RoomData) {
  const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  room.players.forEach((p) => {
    const isPlayerImpaired = !!(
      p.isPoisoned ||
      p.isImpaired ||
      p.isSommelierImpaired ||
      p.role === 'El Borracho' ||
      p.role === 'El Borracho Inconsciente'
    );

    // 1. Fotógrafo: Chemical film resolves in darkroom at night
    if (p.investigationPending) {
      const target = room.players.find((t) => t.id === p.investigationPending?.targetId);
      if (target) {
        let isHostile =
          target.team === 'Sombras (Asesinos)' ||
          target.registersAsHostile ||
          target.role === 'El Recluso' ||
          target.role === 'El Huésped Sospechoso';

        // Impairment / Drunkenness inversion (BotC rule: drunk/poisoned player receives faulty or inverted info)
        if (isPlayerImpaired) {
          isHostile = !isHostile;
        }

        const photoRecord = {
          id: 'photo_' + Date.now() + '_' + Math.random().toString(36).substring(2, 5),
          targetId: target.id,
          targetName: target.name,
          team: target.team,
          isHostile,
          revealedAt: timeStr,
        };
        p.revealedPhotos = p.revealedPhotos || [];
        p.revealedPhotos.unshift(photoRecord);

        const reportEntry: NightReportEntry = {
          id: 'rep_photo_' + Date.now(),
          title: `Revelado Químico: ${target.name}`,
          roleSource: 'LAB FOTOGRÁFICO',
          detail: `El negativo del cuarto oscuro dictamina: ${
            isHostile ? '🔴 SOMBRAS (Hostil / Sospechoso)' : '🟢 FIESTA (Inocente)'
          }.`,
          content: `El negativo del cuarto oscuro dictamina: ${
            isHostile ? '🔴 SOMBRAS (Hostil / Sospechoso)' : '🟢 FIESTA (Inocente)'
          }.`,
          timestamp: timeStr,
          isHostile,
        };
        p.nightReports = p.nightReports || [];
        p.nightReports.unshift(reportEntry);

        room.chatMessages.push({
          id: 'rev_night_' + Date.now(),
          senderId: 'system',
          senderName: 'ÁRBITRO IA (LAB FOTO)',
          receiverId: p.id,
          content: `🌙 BUZÓN CONFIDENCIAL NOCTURNO: El negativo de "${target.name}" se ha revelado en el cuarto oscuro: ${
            isHostile ? '🔴 SOMBRAS (Hostil / Sospechoso)' : '🟢 FIESTA (Inocente)'
          }. Guardado en tu Credencial de Rol.`,
          timestamp: timeStr,
          isAI: true,
          isSystem: true,
        });
      }
      p.investigationPending = undefined;
    }

    // 2. Chismoso: Rumor verification resolved at night
    if (p.chismosoPending) {
      const p1 = room.players.find((t) => t.id === p.chismosoPending?.p1Id);
      const p2 = room.players.find((t) => t.id === p.chismosoPending?.p2Id);
      if (p1 && p2) {
        let sameTeam = p1.team === p2.team;
        if (isPlayerImpaired) {
          sameTeam = !sameTeam;
        }
        const verdict = sameTeam
          ? `¡COINCIDENCIA DE BANDO! ${p1.name} y ${p2.name} comparten exactamente la misma alineación.`
          : `¡BANDOS OPUESTOS! ${p1.name} y ${p2.name} pertenecen a bandos rivales (uno es Fiesta y el otro Sombras).`;

        p.chismosoReport = {
          id: 'chism_' + Date.now(),
          p1Id: p1.id,
          p1Name: p1.name,
          p2Id: p2.id,
          p2Name: p2.name,
          sameTeam,
          verdict,
          timestamp: timeStr,
        };
        p.chismosoUsed = true;

        const reportEntry: NightReportEntry = {
          id: 'rep_chism_' + Date.now(),
          title: `Cotejo de Rumores: ${p1.name} vs ${p2.name}`,
          roleSource: 'CHISMOSO',
          detail: verdict,
          content: verdict,
          timestamp: timeStr,
        };
        p.nightReports = p.nightReports || [];
        p.nightReports.unshift(reportEntry);

        room.chatMessages.push({
          id: 'chism_night_' + Date.now(),
          senderId: 'system',
          senderName: 'ÁRBITRO IA (CHISMOSO)',
          receiverId: p.id,
          content: `🌙 BUZÓN CONFIDENCIAL NOCTURNO: El cotejo confidencial sobre ${p1.name} y ${p2.name} concluyó: ${verdict}`,
          timestamp: timeStr,
          isAI: true,
          isSystem: true,
        });
      }
      p.chismosoPending = undefined;
    }

    // 3. Detective Privado: Surveillance reports at night
    if (p.detectivePending) {
      const p1 = room.players.find((t) => t.id === p.detectivePending?.p1Id);
      const p2 = room.players.find((t) => t.id === p.detectivePending?.p2Id);
      if (p1 && p2) {
        let hasShadow =
          p1.team === 'Sombras (Asesinos)' ||
          p1.registersAsHostile ||
          p1.role === 'El Recluso' ||
          p1.role === 'El Huésped Sospechoso' ||
          p2.team === 'Sombras (Asesinos)' ||
          p2.registersAsHostile ||
          p2.role === 'El Recluso' ||
          p2.role === 'El Huésped Sospechoso';

        if (isPlayerImpaired) {
          hasShadow = !hasShadow;
        }
        const verdict = hasShadow
          ? `🔴 ALERTA: Al menos uno entre ${p1.name} y ${p2.name} pertenece a las Sombras (o genera sospechas profundas).`
          : `🟢 DESPEJADO: Ninguno entre ${p1.name} y ${p2.name} pertenece a las Sombras.`;
        p.detectiveLastReport = verdict;

        const reportEntry: NightReportEntry = {
          id: 'rep_det_' + Date.now(),
          title: `Vigilancia Nocturna: ${p1.name} y ${p2.name}`,
          roleSource: 'DETECTIVE PRIVADO',
          detail: verdict,
          content: verdict,
          timestamp: timeStr,
        };
        p.nightReports = p.nightReports || [];
        p.nightReports.unshift(reportEntry);

        room.chatMessages.push({
          id: 'det_night_' + Date.now(),
          senderId: 'system',
          senderName: 'ÁRBITRO IA (DETECTIVE)',
          receiverId: p.id,
          content: `🌙 BUZÓN CONFIDENCIAL NOCTURNO: Informe de vigilancia sobre ${p1.name} y ${p2.name}: ${verdict}`,
          timestamp: timeStr,
          isAI: true,
          isSystem: true,
        });
      }
      p.detectivePending = undefined;
    }

    // 4. Periodista: Publishing theories at night
    if (p.periodistaPending) {
      const target = room.players.find((t) => t.id === p.periodistaPending?.targetId);
      if (target) {
        let isCorrect = target.role === p.periodistaPending.guessedRole;
        if (isPlayerImpaired) {
          isCorrect = false;
        }
        p.periodistaTheories = p.periodistaTheories || [];
        p.periodistaTheories.push({
          targetId: target.id,
          guessedRole: p.periodistaPending.guessedRole,
          isCorrect,
        });
        if (isCorrect) {
          p.coins = (p.coins || 0) + 15;
        }
        const detail = isCorrect
          ? `📰 ¡PRIMICIA CONFIRMADA! "${target.name}" es efectivamente "${p.periodistaPending.guessedRole}". Has ganado +15 monedas del Seven.`
          : `📰 PISTA REFUTADA: Tras la edición nocturna, "${target.name}" NO ostenta el rol de "${p.periodistaPending.guessedRole}".`;

        const reportEntry: NightReportEntry = {
          id: 'rep_per_' + Date.now(),
          title: `Edición de Prensa: ${target.name}`,
          roleSource: 'PRENSA Y PRIMICIAS',
          detail,
          content: detail,
          timestamp: timeStr,
        };
        p.nightReports = p.nightReports || [];
        p.nightReports.unshift(reportEntry);

        room.chatMessages.push({
          id: 'per_night_' + Date.now(),
          senderId: 'system',
          senderName: 'ÁRBITRO IA (PRENSA)',
          receiverId: p.id,
          content: `🌙 BUZÓN CONFIDENCIAL NOCTURNO: ${detail}`,
          timestamp: timeStr,
          isAI: true,
          isSystem: true,
        });
      }
      p.periodistaPending = undefined;
    }

    // 5. El Mayordomo Mayor: Census of Evil in the Mansion at night
    if (p.role === 'El Mayordomo Mayor' && p.isAlive) {
      const realEvilCount = room.players.filter(
        (x) => x.isAlive && x.team === 'Sombras (Asesinos)'
      ).length;
      let reportedCount = realEvilCount;
      if (isPlayerImpaired) {
        reportedCount = Math.max(0, realEvilCount + (Math.random() > 0.5 ? 1 : -1));
      }

      const detail = `🌙 CENSO DE LA MANSIÓN: Percibes que hay exactamente ${reportedCount} presencia(s) oscura(s) de las Sombras merodeando la fiesta en este momento.`;
      p.mayordomoReport = detail;

      const reportEntry: NightReportEntry = {
        id: 'rep_mayordomo_' + Date.now(),
        title: 'Censo de Sombras del Mayordomo Mayor',
        roleSource: 'MAYORDOMO MAYOR',
        detail,
        content: detail,
        timestamp: timeStr,
      };
      p.nightReports = p.nightReports || [];
      p.nightReports.unshift(reportEntry);

      room.chatMessages.push({
        id: 'may_night_' + Date.now(),
        senderId: 'system',
        senderName: 'ÁRBITRO IA (MAYORDOMO)',
        receiverId: p.id,
        content: `🌙 BUZÓN CONFIDENCIAL NOCTURNO: ${detail}`,
        timestamp: timeStr,
        isAI: true,
        isSystem: true,
      });
    }
  });
}

function processDayAwakening(room: RoomData) {
  room.players.forEach((p) => {
    p.isSommelierImpaired = false;
    p.abogadoProtectedId = undefined;
    p.abogadoUsedToday = false;
    p.abogadoDefensorTargetId = undefined;
    p.abogadoDefensorUsedToday = false;
    p.barmanPoisonUsed = false;
    p.sommelierUsed = false;
    p.medicoAntidoteUsed = false;
    if (p.poisonedUntil && Date.now() > p.poisonedUntil) {
      p.isPoisoned = false;
      p.isImpaired = false;
      p.poisonedUntil = undefined;
    }
  });
}

// AI Group Chat Intervention: listens to group chatter and intervenes with dynamic wit
async function triggerAIGroupIntervention(room: RoomData, senderName: string, messageContent: string) {
  const recentMessages = room.chatMessages
    .filter((m) => !m.receiverId)
    .slice(-6)
    .map((m) => `${m.senderName}: "${m.content}"`)
    .join('\n');

  const aliveList = room.players.filter((p) => p.isAlive).map((p) => p.name);
  const deadList = room.players.filter((p) => !p.isAlive).map((p) => p.name);
  const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  let aiIntervention = '';

  try {
    const ai = getAI();
    if (ai) {
      const prompt = `Eres el ÁRBITRO IA y Maestro del Juego de deducción social de una fiesta real entre amigos en una casa.
Estás monitoreando el chat general de la aplicación.

DATOS VERIFICADOS DE LA SALA (HECHOS REALES, NO INVENTAR NADA FUERA DE AQUÍ):
- Jugadores vivos en la sala: ${aliveList.join(', ') || 'ninguno'}.
- Jugadores fallecidos / almas de ultratumba: ${deadList.join(', ') || 'ninguno aún'}.
- Historial de asesinatos registrados: ${room.state.murderHistory.map((m) => `${m.victimName} (pista: "${m.clue}")`).join(', ') || 'aún no hay muertes'}.
- Fase actual: ${room.state.phase} | Ronda de asamblea: ${room.state.meetingRound} | Progreso de fiesta: ${room.state.collectiveTaskProgress}%.

DIRECTIVAS ESTRICTAS CONTRA ALUCINACIONES (OBLIGATORIO):
1. PROHIBIDO INVENTAR NOMBRES: Únicamente puedes mencionar a los jugadores reales presentes en la lista anterior (${aliveList.join(', ')}${deadList.length ? ', ' + deadList.join(', ') : ''}). Jamás inventes personas ficticias.
2. PROHIBIDO INVENTAR ROLES O REGLAS: Los únicos roles existentes en este juego son: Inocente, Asesino, El Fotógrafo, El Chismoso, El Médico Forense, El Escolta, El Camaleón, El Cómplice / Hacker, El Paranoico, El Periodista, Alma Atormentadora. No menciones roles de otros juegos como Vidente, Bruja, Lobo, etc.
3. ESTRICTA VERDAD SOBRE ESTADO DE JUGADORES: No digas que alguien murió o fue eliminado a menos que figure explícitamente en la lista de fallecidos. Si están vivos, trátalos como vivos en la fiesta.
4. SI NO TIENES INFORMACIÓN O TE PIDEN DELATAR: Di que el Árbitro observa pero no revela identidades secretas para no arruinar la fiesta, o que no tienes pruebas forenses aún.
5. LONGITUD: Máximo 1 o 2 oraciones concisas, picantes y afiladas.

Anécdotas del grupo para sazonar el comentario:
- Luisda el migajero (siempre deja migajas de comida).
- León el mandilón.
- Uriel la rata (tacaño con comida/tragos).
- El caballo en Día de Muertos.
- Jackie siempre comiendo en la uni.
- Meta AI el metiche.
- En Cancún todo cambió para bien.
- Todos odian a Majo y a la canción Superestrella.
- Los Hidrotemplados es la banda mítica.
- Siempre comen pizza o van al Seven.
- La frase secreta para asesinar susurrada al oído es: "¿Qué traes allí?".

Historial reciente del chat general:
${recentMessages}

${senderName} acaba de escribir: "${messageContent}".

Tu intervención breve como Árbitro IA:`;

      const resp = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
      });

      if (resp.text) {
        aiIntervention = resp.text.trim();
      }
    }
  } catch (err) {
    console.error('AI group chat intervention error:', err);
  }

  // Fallback pool in case Gemini is unavailable or rate-limited
  if (!aiIntervention) {
    const fallbacks = [
      `👀 Árbitro IA: Mientras ${senderName} escribe eso, alguien en la sala está mirando fijamente la rebanada de pizza con cara de sospechoso.`,
      `⚖️ Intervención del Árbitro: Cuidado con las coartadas... recuerden que las migajas de Luisda nunca mienten.`,
      `🕵️ El Árbitro IA toma nota: Mucho bla bla bla en el chat, pero nadie ha explicado qué hacían cerca de la cocina hace 5 minutos.`,
      `🍕 Árbitro IA: No confíen en quien hable demasiado del Seven mientras susurra frases al oído de los demás.`,
      `⚠️ Alerta del Árbitro: Detecto altos niveles de cinismo en las palabras de ${senderName}. ¿Quién se atreve a mirarle a los ojos?`,
      `🎵 Árbitro IA: Esta discusión suena peor que la canción Superestrella. Más misiones y menos teatro.`,
      `👁️ Susurro del Árbitro: Alguien en este grupo tiene las manos frías y el corazón de asesino. Sigan debatiendo...`,
      `🐎 Árbitro IA: Si esa teoría fuera un caballo en Día de Muertos, ya se habría escapado trotando. Sean más observadores.`,
      `🥤 Árbitro IA: ${senderName} habla mucho para alguien que no ha completado ni una sola misión de fiesta.`,
      `🚨 Árbitro IA: El reloj sigue corriendo. Las sombras se preparan para preguntar otra vez "¿Qué traes allí?".`
    ];
    aiIntervention = fallbacks[Math.floor(Math.random() * fallbacks.length)];
  }

  room.chatMessages.push({
    id: 'ai_interv_' + Date.now(),
    senderId: 'system',
    senderName: 'ÁRBITRO IA',
    receiverId: null,
    content: aiIntervention,
    timestamp: timeString,
    isSystem: true,
    isAI: true,
  });
}

// Background Game Loop (1-second tick)
setInterval(() => {
  rooms.forEach((room, roomCode) => {
    if (room.state.status !== 'playing' || room.state.winner) return;

    // Phase timer
    room.state.phaseTimeRemaining -= 1;
    if (room.state.phaseTimeRemaining <= 0) {
      const nextPhase = room.state.phase === 'Día' ? 'Noche' : 'Día';
      room.state.phase = nextPhase;
      room.state.phaseTimeRemaining = room.state.phaseDuration;

      if (nextPhase === 'Día') {
        room.state.dayCount = (room.state.dayCount || 1) + 1;
        room.state.dayEventTriggered = false;
        room.state.activeEvent = null;
        room.state.eventTimeRemaining = 0;
        // Schedule single event for this day at a random moment
        const minBuffer = 25;
        const maxBuffer = Math.max(minBuffer + 10, room.state.phaseDuration - 60);
        room.state.dayEventScheduledSecond = Math.floor(Math.random() * (maxBuffer - minBuffer)) + minBuffer;

        processDayAwakening(room);

        broadcastPushToRoom(room, {
          id: 'push_phase_' + Date.now(),
          type: 'phase',
          title: `☀️ ¡Amanece el Día ${room.state.dayCount}!`,
          body: 'Regresa la luz a la fiesta. Revisa tu buzón y misiones secretas.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        });

        room.chatMessages.push({
          id: 'phase_day_' + Date.now(),
          senderId: 'system',
          senderName: 'ÁRBITRO IA',
          receiverId: null,
          content: `☀️ ¡AMANECE EL DÍA ${room.state.dayCount}! La luz regresa a la fiesta de Macareno. Habilidades diurnas activas (Fotógrafo, Chismoso, Periodista, Escolta, Detective, Sommelier). 1 evento sorpresa ocurrirá hoy.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isSystem: true,
        });
      } else {
        // Noche: no day party events
        room.state.activeEvent = null;
        room.state.eventTimeRemaining = 0;

        // Process all day actions and deliver confidential reports to night mailboxes
        processNightRevelations(room);

        broadcastPushToRoom(room, {
          id: 'push_phase_' + Date.now(),
          type: 'phase',
          title: `🌙 ¡Cae la Noche ${room.state.dayCount || 1}!`,
          body: 'Se apagan las luces. Revisa tu buzón con las revelaciones del día.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        });

        room.chatMessages.push({
          id: 'phase_night_' + Date.now(),
          senderId: 'system',
          senderName: 'ÁRBITRO IA',
          receiverId: null,
          content: `🌙 ¡CAE LA NOCHE ${room.state.dayCount || 1}! Las luces disminuyen. Se han revelado los informes confidenciales en los buzones privados. Las Sombras pueden cobrar víctimas.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isSystem: true,
        });
      }
    }

    // Emergency timer & Defense timer
    if (room.state.isEmergencyActive) {
      if (room.state.tribunalStage === 'defense') {
        room.state.defenseTimerRemaining = (room.state.defenseTimerRemaining ?? 60) - 1;
        if (room.state.defenseTimerRemaining <= 0) {
          // Defense time over, auto-conclude with expulsion of accused
          room.state.tribunalStage = 'concluded';
        }
      } else {
        room.state.emergencyTimeRemaining -= 1;
        if (room.state.emergencyTimeRemaining <= 0) {
          room.state.isEmergencyActive = false;
        }
      }
    }

    // Delayed Poison Assassin Execution (Victim dies anonymously without knowing killer)
    if (room.state.delayedPoisons && room.state.delayedPoisons.length > 0) {
      const now = Date.now();
      room.state.delayedPoisons.forEach((poison) => {
        if (!poison.executed && now >= poison.deathTime) {
          poison.executed = true;
          const target = room.players.find((p) => p.id === poison.victimId);
          if (target && target.isAlive) {
            const wasCazador = target.role === 'El Cazador Vengativo';
            target.isAlive = false;
            target.role = 'Alma Atormentadora';
            target.team = 'Caos (Independiente)';
            target.missions = generateFivePlayerMissions(true);
            if (wasCazador) {
              target.canVengeanceShot = true;
            }

            const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const rep = {
              id: 'rep_' + Date.now(),
              victimId: target.id,
              victimName: target.name,
              timestamp: timeString,
              clue: poison.clue,
            };
            room.state.murderHistory.unshift(rep);

            broadcastPushToRoom(room, {
              id: 'push_murder_' + Date.now(),
              type: 'murder',
              title: '💀 ¡COLAPSO EN LA FIESTA!',
              body: `${target.name} ha sucumbido silenciosamente a las Sombras.`,
              timestamp: timeString,
            });

            room.chatMessages.push({
              id: 'delayed_death_' + Date.now(),
              senderId: 'system',
              senderName: 'ÁRBITRO FORENSE',
              receiverId: null,
              content: `💀 ¡COLAPSO ANÓNIMO EN LA FIESTA! ${target.name} ha sucumbido silenciosamente tras el susurro prohibido. La identidad del asesino permanece oculta en las sombras.`,
              timestamp: timeString,
              isSystem: true,
              isAI: true,
            });
          }
        }
      });
    }

    // Macareno Roulette Event Timer & Single Random Event per Day
    if (room.state.status === 'playing' && !room.state.isEmergencyActive) {
      if (room.state.macarenoWheelActive) {
        room.state.eventTimeRemaining -= 1;
        if (room.state.eventTimeRemaining <= 0) {
          room.state.macarenoWheelActive = false;
          room.state.macarenoEvent = null;
        }
      } else if (room.state.activeEvent) {
        room.state.eventTimeRemaining -= 1;
        if (room.state.eventTimeRemaining <= 0) {
          room.state.activeEvent = null;
          // Event finished!
        }
      } else if (room.state.phase === 'Día' && !room.state.dayEventTriggered) {
        const triggerThreshold = room.state.dayEventScheduledSecond ?? Math.floor(room.state.phaseDuration / 2);
        if (room.state.phaseTimeRemaining <= triggerThreshold) {
          room.state.dayEventTriggered = true;
          // Trigger Macareno Wheel!
          const macEv = buildMacarenoEvent(room.players);
          room.state.macarenoEvent = macEv;
          room.state.macarenoWheelActive = true;
          room.state.eventTimeRemaining = macEv.durationSeconds;

          broadcastPushToRoom(room, {
            id: 'push_wheel_' + Date.now(),
            type: 'wheel',
            title: '🐱 ¡La Ruleta de Macareno ha Girado!',
            body: `${macEv.title}: ${macEv.assignedPlayerName} ha sido elegido.`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          });

          room.chatMessages.push({
            id: 'mac_spin_chat_' + Date.now(),
            senderId: 'system',
            senderName: 'LA RULETA DE MACARENO',
            receiverId: null,
            content: `🐱💀 ¡LA RULETA DE MACARENO HA APARECIDO EN LA FIESTA! Ha caído en "${macEv.title}". ${macEv.lore} ${macEv.instructions}`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isSystem: true,
            isAI: true,
          });
        }
      }
    }

    // Check Win Conditions
    const alivePlayers = room.players.filter((p) => p.isAlive);
    const aliveAssassins = alivePlayers.filter((p) => p.team === 'Sombras (Asesinos)');
    const aliveInnocents = alivePlayers.filter((p) => p.team === 'Fiesta (Inocentes)');

    if (aliveAssassins.length === 0 && alivePlayers.length > 0) {
      room.state.winner = 'Fiesta (Inocentes)';
      room.state.winReason = '¡Todos los Asesinos han sido descubiertos y purgados de la fiesta por la asamblea!';
      room.state.status = 'ended';
    } else if (aliveAssassins.length >= aliveInnocents.length && aliveAssassins.length > 0) {
      room.state.winner = 'Sombras (Asesinos)';
      room.state.winReason = 'Las Sombras diezmaron a los inocentes hasta igualar su número. La fiesta ha sucumbido ante la oscuridad.';
      room.state.status = 'ended';
    } else if (room.state.collectiveTaskProgress >= 100) {
      room.state.winner = 'Fiesta (Inocentes)';
      room.state.winReason = '¡Los inocentes completaron el 100% de las misiones colectivas antes de ser eliminados!';
      room.state.status = 'ended';
    }
  });
}, 1000);

// API: Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', serverTime: Date.now() });
});

// API: Create Room
app.post('/api/rooms/create', (req, res) => {
  const { hostName, avatar, pin, roomCode } = req.body;
  const code = (roomCode || 'FIESTA-' + Math.floor(10 + Math.random() * 90)).toUpperCase().trim();

  const hostPlayer: Player = {
    id: 'p_' + Date.now(),
    name: hostName || 'Anfitrión',
    avatar: avatar || '👑',
    pin: pin || '1234',
    victimCode: Math.floor(1000 + Math.random() * 9000).toString(),
    role: 'Inocente',
    team: 'Fiesta (Inocentes)',
    isAlive: true,
    isHost: true,
    emergencyCallsLeft: 1,
    coins: 10,
    missions: generateFivePlayerMissions(false),
    chismosoUsed: false,
    camaleonUsed: false,
    hackerUsed: false,
    periodistaTheories: [],
  };

  const initialGameState: GameState = {
    roomCode: code,
    status: 'lobby',
    hostPlayerId: hostPlayer.id,
    phase: 'Día',
    phaseTimeRemaining: 900,
    phaseDuration: 900,
    dayCount: 1,
    dayEventTriggered: false,
    dayEventScheduledSecond: 450,
    isGameStarted: false,
    isEmergencyActive: false,
    emergencyTimeRemaining: 180,
    emergencyCallerName: null,
    activeEvent: null,
    eventTimeRemaining: 0,
    votes: {},
    meetingRound: 1,
    hackerGlitchActiveUntil: null,
    murderHistory: [],
    collectiveTaskProgress: 0,
    latestPush: null,
    recentPushes: [],
    aiNarratorLogs: [
      {
        id: 'log_0',
        text: `Sala ${code} de Macareno's Mystery creada. Esperando a los invitados en el lobby.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'lore',
      },
    ],
    winner: null,
  };

  rooms.set(code, {
    state: initialGameState,
    players: [hostPlayer],
    chatMessages: [
      {
        id: 'msg_0',
        senderId: 'system',
        senderName: 'ÁRBITRO IA',
        receiverId: null,
        content: `🎉 ¡Bienvenidos a la Sala ${code}! Entren con el código o escaneen el QR desde su celular.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isSystem: true,
        isAI: true,
      },
    ],
  });

  res.json({
    roomCode: code,
    player: hostPlayer,
    roomState: initialGameState,
    players: [hostPlayer],
  });
});

// API: Join Room
app.post('/api/rooms/join', (req, res) => {
  const { roomCode, name, avatar, pin } = req.body;
  const code = (roomCode || '').toUpperCase().trim();
  const room = rooms.get(code);

  if (!room) {
    return res.status(404).json({ error: 'La sala especificada no existe.' });
  }

  // Check if player already exists by name (re-login)
  const existingPlayer = room.players.find(
    (p) => p.name.toLowerCase().trim() === (name || '').toLowerCase().trim()
  );

  if (existingPlayer) {
    if (existingPlayer.pin === pin) {
      return res.json({
        roomCode: code,
        player: existingPlayer,
        roomState: room.state,
        players: room.players,
      });
    } else {
      return res.status(403).json({ error: 'PIN incorrecto para este jugador.' });
    }
  }

  if (room.state.status === 'playing') {
    return res.status(400).json({ error: 'La partida ya comenzó. No se admiten nuevos jugadores.' });
  }

  const newPlayer: Player = {
    id: 'p_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    name: name.trim(),
    avatar: avatar || '👤',
    pin: pin || '1234',
    victimCode: Math.floor(1000 + Math.random() * 9000).toString(),
    role: 'Inocente',
    team: 'Fiesta (Inocentes)',
    isAlive: true,
    isHost: false,
    emergencyCallsLeft: 1,
    coins: 10,
    missions: generateFivePlayerMissions(false),
    chismosoUsed: false,
    camaleonUsed: false,
    hackerUsed: false,
    periodistaTheories: [],
  };

  room.players.push(newPlayer);

  room.chatMessages.push({
    id: 'msg_join_' + Date.now(),
    senderId: 'system',
    senderName: 'LOBBY',
    receiverId: null,
    content: `${newPlayer.name} se ha unido al lobby de la fiesta.`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    isSystem: true,
  });

  res.json({
    roomCode: code,
    player: newPlayer,
    roomState: room.state,
    players: room.players,
  });
});

// API: Get Room State (polling)
app.get('/api/rooms/:roomCode', (req, res) => {
  const code = req.params.roomCode.toUpperCase().trim();
  const room = rooms.get(code);

  if (!room) {
    return res.status(404).json({ error: 'Sala no encontrada' });
  }

  res.json({
    roomState: room.state,
    players: room.players,
    chatMessages: room.chatMessages,
  });
});

// API: Start Game (Host only)
app.post('/api/rooms/:roomCode/start', async (req, res) => {
  const code = req.params.roomCode.toUpperCase().trim();
  const { playerId } = req.body;
  const room = rooms.get(code);

  if (!room) return res.status(404).json({ error: 'Sala no encontrada' });
  if (room.state.hostPlayerId !== playerId) {
    return res.status(403).json({ error: 'Solo el anfitrión de la sala puede iniciar la partida.' });
  }
  if (room.players.length < 3) {
    return res.status(400).json({ error: 'Se necesitan al menos 3 jugadores para jugar.' });
  }

  // Distribute balanced roles
  const assignedRoles = balanceRolesForPlayers(room.players.length);
  // Also shuffle player order mapping so host doesn't always receive the first role
  const playerShuffleOrder = fisherYatesShuffle(room.players.map((_, i) => i));

  room.players = room.players.map((p, originalIdx) => {
    const randomizedRoleIdx = playerShuffleOrder.indexOf(originalIdx);
    const role = assignedRoles[randomizedRoleIdx];
    const team = ROLE_TEAMS[role] || 'Fiesta (Inocentes)';
    const isShadow = team === 'Sombras (Asesinos)';
    
    // BotC: El Borracho cree con total certeza que tiene un rol de información
    const fakeRole = (role === 'El Borracho' || role === 'El Borracho Inconsciente')
      ? (Math.random() > 0.5 ? 'El Detective Privado' : 'El Fotógrafo')
      : undefined;

    const registersAsHostile = role === 'El Recluso' || role === 'El Huésped Sospechoso';
    const isImpLeader = role === 'Asesino' || role === 'El Asesino Líder';

    return {
      ...p,
      role,
      team,
      isAlive: true,
      emergencyCallsLeft: 1,
      coins: p.coins ?? 10,
      hasBulletproofVest: false,
      doubleVotesAvailable: 0,
      victimCode: Math.floor(1000 + Math.random() * 9000).toString(),
      missions: generateFivePlayerMissions(false, isShadow),
      chismosoUsed: false,
      camaleonUsed: false,
      hackerUsed: false,
      periodistaTheories: [],
      nightReports: [],
      fakeRole,
      registersAsHostile,
      isImpLeader,
      isImpaired: false,
      isPoisoned: false,
      isSommelierImpaired: false,
      padrinoCharged: false,
      padrinoKillsRemaining: 1,
      lavadorBonusKills: 0,
      barmanPoisonUsed: false,
      abogadoUsedToday: false,
      abogadoDefensorUsedToday: false,
      sommelierUsed: false,
      medicoAntidoteUsed: false,
    };
  });

  room.state.status = 'playing';
  room.state.isGameStarted = true;
  room.state.phase = 'Día';
  room.state.phaseTimeRemaining = room.state.phaseDuration;
  room.state.meetingRound = 1;
  room.state.collectiveTaskProgress = 0;
  room.state.dayCount = 1;
  room.state.dayEventTriggered = false;
  room.state.activeEvent = null;
  room.state.eventTimeRemaining = 0;
  // Schedule the single event of Day 1 at a random moment
  const minBuffer = 25;
  const maxBuffer = Math.max(minBuffer + 10, room.state.phaseDuration - 60);
  room.state.dayEventScheduledSecond = Math.floor(Math.random() * (maxBuffer - minBuffer)) + minBuffer;

  // Generate AI Opening with Gemini
  const playerNames = room.players.map((p) => p.name).join(', ');
  let aiOpening = '¡La fiesta ha comenzado! Recuerden: para asesinar, susurren al oído "¿Qué traes allí?". Completen sus misiones orgánicas.';

  try {
    const ai = getAI();
    if (ai) {
      const prompt = `Eres el Árbitro IA y Maestro del Crimen de "Macareno's Mystery", un juego presencial de deducción social en una fiesta real entre amigos.
Los únicos jugadores presentes en esta sala son exactamente: ${playerNames}. (PROHIBIDO INVENTAR OTROS NOMBRES).
El grupo tiene estas anécdotas y bromas internas:
- Luisda es el migajero.
- León es mandilón.
- Uriel es una rata.
- Una pareja que se conoció por un caballo en Día de Muertos.
- Jackie siempre está comiendo en la uni.
- Meta AI es un metiche.
- En Cancún todo cambió para bien.
- Todos odiamos a Majo y a Superestrella.
- Los Hidrotemplados es un gran grupo musical.
- Siempre comen pizza o van al Seven.
- La frase de muerte pactada que susurran los asesinos es: "¿Qué traes allí?".

Escribe una proclama de inicio breve, divertida, picante y con mucho misterio (máximo 3 párrafos cortos) dando la bienvenida a la fiesta e incitando a la sospecha social.`;

      const aiResponse = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
      });

      if (aiResponse.text) {
        aiOpening = aiResponse.text.trim();
      }
    }
  } catch (err) {
    console.error('Gemini AI Opening error:', err);
  }

  room.state.aiNarratorLogs.push({
    id: 'proclama_' + Date.now(),
    text: aiOpening,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    type: 'lore',
  });

  room.chatMessages.push({
    id: 'chat_proclama_' + Date.now(),
    senderId: 'system',
    senderName: 'ÁRBITRO IA',
    receiverId: null,
    content: aiOpening,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    isSystem: true,
    isAI: true,
  });

  res.json({
    roomState: room.state,
    players: room.players,
    chatMessages: room.chatMessages,
  });
});

// API: Game Action Handler
app.post('/api/rooms/:roomCode/action', async (req, res) => {
  const code = req.params.roomCode.toUpperCase().trim();
  const { playerId, actionType, payload } = req.body;
  const room = rooms.get(code);

  if (!room) return res.status(404).json({ error: 'Sala no encontrada' });

  const actingPlayer = room.players.find((p) => p.id === playerId);
  if (!actingPlayer) return res.status(404).json({ error: 'Jugador no encontrado en la sala' });

  // 1. Action: Kill
  if (actionType === 'kill') {
    if (room.state.phase !== 'Noche') {
      return res.status(400).json({
        error: '🌙 Las Sombras solo pueden cobrar víctimas durante la NOCHE. De día debes mantener tu tapadera y coartada.',
      });
    }

    const { victimCode } = payload;
    const victim = room.players.find((p) => p.victimCode === victimCode && p.isAlive);

    if (!victim) {
      return res.status(400).json({ error: 'Código incorrecto o jugador ya fallecido.' });
    }
    if (victim.id === actingPlayer.id) {
      return res.status(400).json({ error: 'No puedes atentar contra ti mismo.' });
    }

    // Sommelier impairment check
    if (actingPlayer.isSommelierImpaired || actingPlayer.isImpaired) {
      return res.status(400).json({
        error: '🍷 ¡Estás mareado por la copa del Sommelier o indispuesto! No logras concentrarte ni ejecutar ningún ataque esta noche.',
      });
    }

    // Barman poison check (silent / glitch failure)
    if (actingPlayer.isPoisoned) {
      return res.status(400).json({
        error: '🧪 Sientes un ardor helado en el pecho... Has sido secretamente envenenado y tu ataque se disipa en la nada.',
      });
    }

    // Escolta check
    if (
      victim.protectedByEscoltaUntil &&
      victim.protectedByEscoltaUntil > Date.now() &&
      victim.hasEscoltaSpokenFaceToFace
    ) {
      return res.status(400).json({
        error: '¡Ataque frustrado! El objetivo estaba protegido físicamente por un Escolta presencial.',
      });
    }

    // Bulletproof Vest check
    if (victim.hasBulletproofVest) {
      victim.hasBulletproofVest = false;
      room.chatMessages.push({
        id: 'vest_chat_' + Date.now(),
        senderId: 'system',
        senderName: 'ÁRBITRO IA',
        receiverId: null,
        content: `🛡️ ¡SALVADO POR EL CHALECO! ${victim.name} escuchó el susurro mortal en su oído, pero su Chaleco Antibalas absorbió el ataque. El chaleco ha quedado destruido, ¡pero sigue con vida!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isSystem: true,
        isAI: true,
      });

      return res.status(400).json({
        error: `¡Ataque frustrado! ${victim.name} llevaba equipado un Chaleco Antibalas del mercado negro. El chaleco amortiguó el golpe y tu víctima sobrevivió.`,
      });
    }

    // Check Forastero role
    const isVictimForastero =
      victim.role === 'El Santo' ||
      victim.role === 'El Heredero Maldito' ||
      victim.role === 'El Recluso' ||
      victim.role === 'El Huésped Sospechoso' ||
      victim.role === 'El Borracho' ||
      victim.role === 'El Borracho Inconsciente' ||
      victim.role === 'El Paranoico' ||
      victim.role === 'El Huésped Paranoico';

    // Titiritero Corruption Mechanic: If Titiritero targets a Forastero, they are secretly corrupted to evil instead of dying
    if (actingPlayer.role === 'El Titiritero' && isVictimForastero) {
      victim.team = 'Sombras (Asesinos)';
      room.chatMessages.push({
        id: 'titi_corrupt_' + Date.now(),
        senderId: 'system',
        senderName: 'ÁRBITRO IA (EL TITIRITERO)',
        receiverId: victim.id,
        content: `🎭 ¡HILOS DE CORRUPCIÓN! El Titiritero ha manipulado tu alma. No mueres, pero a partir de este instante perteneces en secreto a las SOMBRAS (Asesinos). Tu objetivo ahora es que las Sombras ganen la partida.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isSystem: true,
        isAI: true,
      });

      return res.json({
        success: true,
        message: `¡Corrupción consumada! ${victim.name} era un Forastero y ahora sirve secretamente a las Sombras.`,
      });
    }

    // Padrino Silencioso (Po) Burst charge management
    if (actingPlayer.role === 'El Padrino Silencioso' && actingPlayer.padrinoCharged) {
      actingPlayer.padrinoKillsRemaining = (actingPlayer.padrinoKillsRemaining ?? 3) - 1;
      if (actingPlayer.padrinoKillsRemaining <= 0) {
        actingPlayer.padrinoCharged = false;
      }
    }

    // Reward killer with coins for elimination
    actingPlayer.coins = (actingPlayer.coins || 0) + 10;

    // Lavador de Dinero bonus if a Forastero is eliminated
    if (isVictimForastero) {
      const lavador = room.players.find((p) => p.isAlive && p.role === 'El Lavador de Dinero');
      if (lavador) {
        lavador.lavadorBonusKills = (lavador.lavadorBonusKills || 0) + 1;
        lavador.coins = (lavador.coins || 0) + 10;
      }
    }

    // Check if victim is Cazador Vengativo or Testigo Ocular
    const wasCazador = victim.role === 'El Cazador Vengativo';
    const wasTestigoOcular = victim.role === 'El Testigo Ocular';

    // Anonymous Murder Mechanic:
    // The victim is tagged with a stealth delayed toxin or silent sudden demise.
    // The victim does NOT know who the killer is.
    // We register the delayed poison execution (10 to 20 seconds delay, or immediate anonymous).
    const delaySeconds = 12; // Gives killer 12s to walk away naturally so victim has no idea who whispered or entered the code
    const deathTime = Date.now() + delaySeconds * 1000;
    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Generate AI Forensic Clue using Gemini
    let aiClue = 'Se detectaron migajas cerca del cuerpo y olor a pizza del Seven.';
    try {
      const ai = getAI();
      if (ai) {
        const prompt = `Genera una pista forense abstracta y críptica para el Médico Forense en una fiesta.
La víctima fue: ${victim.name}.
El atacante le susurró discretamente en penumbra: "¿Qué traes allí?".
Incluye sutiles referencias humorísticas al grupo (migajas de Luisda, mandilón como León, la rata Uriel, el caballo de Día de Muertos, comida en la uni como Jackie, Meta AI el metiche, Cancún, Los Hidrotemplados, pizza o el Seven).
La pista JAMÁS debe revelar directamente el nombre del asesino, sino un detalle sensorial o de vestimenta/comportamiento. Máximo 2 oraciones.`;

        const resp = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
        });
        if (resp.text) aiClue = resp.text.trim();
      }
    } catch (err) {
      console.error('AI clue error:', err);
    }

    room.state.delayedPoisons = room.state.delayedPoisons || [];
    room.state.delayedPoisons.push({
      victimId: victim.id,
      victimName: victim.name,
      killerId: actingPlayer.id,
      killerName: actingPlayer.name,
      strikeTime: Date.now(),
      deathTime,
      clue: aiClue,
      executed: false,
    });

    // Testigo Ocular decoy logic: even if they see candidates, it won't single out the killer immediately
    if (wasTestigoOcular) {
      const otherLiving = room.players.filter(
        (p) => p.isAlive && p.id !== victim.id && p.id !== actingPlayer.id
      );
      const decoy = otherLiving.length > 0
        ? otherLiving[Math.floor(Math.random() * otherLiving.length)]
        : null;
      const candidates = decoy
        ? fisherYatesShuffle([actingPlayer.name, decoy.name])
        : [actingPlayer.name, 'Una sombra encapuchada'];
      victim.testigoKillerCandidates = candidates;
    }

    // Secret whisper to victim: they only hear that poison was injected, killer is completely anonymous
    room.chatMessages.push({
      id: 'poison_whisper_' + Date.now(),
      senderId: 'system',
      senderName: 'ÁRBITRO ANÓNIMO',
      receiverId: victim.id,
      content: `🧪 Una sombra anónima susurró a tu espalda: "¿Qué traes allí?". Has sido envenenado con toxina silenciosa y colapsarás en unos segundos. Tu ejecutor escapó en la penumbra y su identidad permanece en total anonimato.`,
      timestamp: timeString,
      isSystem: true,
      isAI: true,
    });

    return res.json({
      success: true,
      message: `Toxina letal administrada a ${victim.name}. La víctima colapsará en breve sin saber quién la atacó. Aléjate con disimulo.`,
    });
  }

  // 2. Action: Emergency Buzzer
  if (actionType === 'emergency') {
    if (room.state.hackerGlitchActiveUntil && room.state.hackerGlitchActiveUntil > Date.now()) {
      return res.status(400).json({
        error: '¡Sirena bloqueada! Hay una interferencia electromagnética activa en la fiesta.',
      });
    }

    if (!actingPlayer.isAlive || actingPlayer.emergencyCallsLeft <= 0) {
      return res.status(400).json({ error: 'No tienes llamadas de asamblea disponibles.' });
    }

    actingPlayer.emergencyCallsLeft -= 1;
    room.state.isEmergencyActive = true;
    room.state.emergencyCallerName = actingPlayer.name;
    room.state.emergencyTimeRemaining = 180;
    room.state.votes = {};
    room.state.doubleVoteUsers = [];
    room.state.accusedPlayerId = null;
    room.state.tribunalStage = 'voting';
    room.state.defenseTimerRemaining = 60;

    broadcastPushToRoom(room, {
      id: 'push_emg_' + Date.now(),
      type: 'emergency',
      title: '🚨 ¡ASAMBLEA DE EMERGENCIA!',
      body: `${actingPlayer.name} ha convocado a todos los invitados al debate.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      senderName: actingPlayer.name,
    });

    room.chatMessages.push({
      id: 'emg_' + Date.now(),
      senderId: 'system',
      senderName: 'SIRENA DE ASAMBLEA',
      receiverId: null,
      content: `🚨 ¡${actingPlayer.name} ha convocado a todos al centro de la sala para una asamblea de emergencia! Tienen 3 minutos de debate.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSystem: true,
    });

    return res.json({ success: true });
  }

  // 3. Action: Cast Vote (with support for Double Vote)
  if (actionType === 'vote') {
    const { targetId, useDoubleVote } = payload;
    if (!actingPlayer.isAlive) {
      return res.status(403).json({ error: 'Las almas no pueden votar en la asamblea.' });
    }

    room.state.votes[actingPlayer.id] = targetId;

    if (useDoubleVote && (actingPlayer.doubleVotesAvailable || 0) > 0) {
      room.state.doubleVoteUsers = room.state.doubleVoteUsers || [];
      if (!room.state.doubleVoteUsers.includes(actingPlayer.id)) {
        room.state.doubleVoteUsers.push(actingPlayer.id);
        actingPlayer.doubleVotesAvailable = Math.max(0, (actingPlayer.doubleVotesAvailable || 0) - 1);
        room.chatMessages.push({
          id: 'dvote_' + Date.now(),
          senderId: 'system',
          senderName: 'ÁRBITRO IA (VOTO DOBLE)',
          receiverId: null,
          content: `⚡ ¡UN CIUDADANO HA ACTIVADO UNA FICHA DE VOTO DOBLE! Su voto pesa por dos en este escrutinio.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isSystem: true,
        });
      }
    }

    return res.json({
      success: true,
      votes: room.state.votes,
      doubleVoteUsers: room.state.doubleVoteUsers,
    });
  }

  // 3.5 Action: Start Defense Stage
  if (actionType === 'start_defense') {
    const { accusedId } = payload;
    const accused = room.players.find((p) => p.id === accusedId);
    if (!accused) return res.status(404).json({ error: 'Acusado no encontrado' });

    room.state.accusedPlayerId = accusedId;
    room.state.tribunalStage = 'defense';
    room.state.defenseTimerRemaining = 60;

    room.chatMessages.push({
      id: 'def_stage_' + Date.now(),
      senderId: 'system',
      senderName: 'TRIBUNAL DE MACARENO',
      receiverId: null,
      content: `⚖️ ¡EL ESTRADO CONVOCA A ${accused.name}! Es el sospechoso principal de la asamblea. Se le otorgan 60 segundos en el centro de la sala para emitir su alegato final de inocencia.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSystem: true,
      isAI: true,
    });

    return res.json({ success: true, roomState: room.state });
  }

  // 3.6 Action: Spin Macareno Wheel (Host or triggered)
  if (actionType === 'spin_macareno_wheel') {
    const { sliceIndex } = payload || {};
    const macEv = buildMacarenoEvent(room.players, sliceIndex);
    room.state.macarenoEvent = macEv;
    room.state.macarenoWheelActive = true;
    room.state.eventTimeRemaining = macEv.durationSeconds;
    room.state.dayEventTriggered = true;

    broadcastPushToRoom(room, {
      id: 'push_wheel_' + Date.now(),
      type: 'wheel',
      title: '🐱 ¡La Ruleta de Macareno ha Girado!',
      body: `${macEv.title}: ${macEv.assignedPlayerName} ha sido elegido.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });

    room.chatMessages.push({
      id: 'mac_manual_' + Date.now(),
      senderId: 'system',
      senderName: 'LA RULETA DE MACARENO',
      receiverId: null,
      content: `🐱💀 ¡LA RULETA DE MACARENO HA GIRADO! Resultado: "${macEv.title}". ${macEv.lore} ${macEv.instructions}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSystem: true,
      isAI: true,
    });

    return res.json({ success: true, event: macEv, roomState: room.state });
  }

  // 3.65 Action: Dismiss Macareno Wheel for all (Host or conclusion)
  if (actionType === 'dismiss_macareno_wheel') {
    room.state.macarenoWheelActive = false;
    room.state.macarenoEvent = null;
    room.state.eventTimeRemaining = 0;
    return res.json({ success: true, roomState: room.state });
  }

  // 3.66 Action: Broadcast Custom Push Notification to All Cellphones (Host)
  if (actionType === 'broadcast_push') {
    const { title, body } = payload || {};
    if (!title || !body) {
      return res.status(400).json({ error: 'Título y mensaje son requeridos.' });
    }
    const push: PushNotificationPayload = {
      id: 'push_bcast_' + Date.now(),
      type: 'broadcast',
      title: String(title).trim(),
      body: String(body).trim(),
      senderName: actingPlayer.name,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    broadcastPushToRoom(room, push);

    room.chatMessages.push({
      id: 'bcast_msg_' + Date.now(),
      senderId: 'system',
      senderName: 'AVISO EN CELULARES',
      receiverId: null,
      content: `📢 [ALERTA DE ${actingPlayer.name}]: ${push.title} - ${push.body}`,
      timestamp: push.timestamp,
      isSystem: true,
    });

    return res.json({ success: true, push, roomState: room.state });
  }

  // 3.7 Action: Collect Luisda's Migajas (Quick interactive event)
  if (actionType === 'collect_migajas') {
    if (!room.state.macarenoEvent || room.state.macarenoEvent.effectType !== 'migajas') {
      return res.status(400).json({ error: 'No hay migajas de Luisda en el suelo en este momento.' });
    }

    if (room.state.macarenoEvent.migajasCollected) {
      return res.status(400).json({ error: `¡Demasiado tarde! ${room.state.macarenoEvent.migajasCollectorName} ya las barrió.` });
    }

    room.state.macarenoEvent.migajasCollected = true;
    room.state.macarenoEvent.migajasCollectorName = actingPlayer.name;
    actingPlayer.coins = (actingPlayer.coins || 0) + 10;

    room.chatMessages.push({
      id: 'mig_win_' + Date.now(),
      senderId: 'system',
      senderName: 'MIGAJAS DE LUISDA',
      receiverId: null,
      content: `🥖🧹 ¡BARRIDO RELÁMPAGO! ${actingPlayer.name} fue el más rápido en recoger las migajas de Luisda y se embolsa +10 monedas del Seven.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSystem: true,
    });

    return res.json({
      success: true,
      player: actingPlayer,
      event: room.state.macarenoEvent,
    });
  }

  // 4. Action: Conclude Emergency
  if (actionType === 'conclude_meeting') {
    let { expelledPlayerId } = payload;
    let announcement = 'La asamblea ha concluido sin expulsar a ningún sospechoso.';

    if (expelledPlayerId && expelledPlayerId !== 'skip') {
      // 1. Abogado de las Sombras intervention check
      const lawyer = room.players.find((p) => p.role === 'El Abogado de las Sombras' && p.isAlive);
      if (lawyer && lawyer.abogadoProtectedId === expelledPlayerId) {
        const saved = room.players.find((p) => p.id === expelledPlayerId);
        announcement = `⚖️ ¡AMPARO JUDICIAL! El Abogado de las Sombras presentó un recurso legal y la expulsión de ${
          saved?.name || 'este sospechoso'
        } ha sido revocada de inmediato. Nadie es expulsado en esta asamblea.`;
        expelledPlayerId = null;
      }

      // 2. Abogado Defensor (Innocents) intervention check
      const defenseLawyer = room.players.find((p) => p.role === 'El Abogado Defensor' && p.isAlive);
      if (expelledPlayerId && defenseLawyer && defenseLawyer.abogadoDefensorTargetId === expelledPlayerId) {
        const saved = room.players.find((p) => p.id === expelledPlayerId);
        announcement = `⚖️ ¡AMPARO LEGAL DEL DEFENSOR! El Abogado Defensor presentó la orden de protección y la expulsión de ${
          saved?.name || 'este ciudadano'
        } ha sido revocada de inmediato. Nadie es expulsado en esta asamblea.`;
        expelledPlayerId = null;
      }
    }

    if (expelledPlayerId && expelledPlayerId !== 'skip') {
      const expelled = room.players.find((p) => p.id === expelledPlayerId);
      if (expelled) {
        // El Santo / El Heredero Maldito martyrdom rule: Evil wins instantly if Saint is executed
        if (expelled.role === 'El Santo' || expelled.role === 'El Heredero Maldito') {
          room.state.winner = 'Sombras (Asesinos)';
          room.state.winReason = `💀 ¡MARTIRIO DE ${expelled.role.toUpperCase()}! La asamblea ha votado por expulsar a ${expelled.name} (${expelled.role}). Por la regla del martirio sagrado, ¡las Sombras se alzan con la victoria absoluta!`;
          room.state.status = 'ended';
          room.state.isEmergencyActive = false;
          room.chatMessages.push({
            id: 'santo_win_' + Date.now(),
            senderId: 'system',
            senderName: 'ÁRBITRO IA',
            receiverId: null,
            content: `💀 ¡TRAGEDIA DEL MÁRTIR! ${expelled.name} era ${expelled.role}. Al haber sido expulsado por la asamblea, ¡las Sombras ganan la partida automáticamente!`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isSystem: true,
            isAI: true,
          });
          return res.json({ success: true, winner: 'Sombras (Asesinos)' });
        }

        // Paranoico solo victory check in rounds 1 or 2
        if (
          (expelled.role === 'El Paranoico' || expelled.role === 'El Huésped Paranoico') &&
          room.state.meetingRound <= 2
        ) {
          room.state.winner = 'Caos (Independiente)';
          room.state.winReason = `🏆 ¡${expelled.role} (${expelled.name}) manipuló a la asamblea para ser expulsado en la ronda ${room.state.meetingRound} y se alza con la victoria en solitario!`;
          room.state.status = 'ended';
          room.state.isEmergencyActive = false;
          room.chatMessages.push({
            id: 'paranoico_win_' + Date.now(),
            senderId: 'system',
            senderName: 'ÁRBITRO IA',
            receiverId: null,
            content: `🏆 ¡VICTORIA ABSOLUTA DE ${expelled.role.toUpperCase()}! ${expelled.name} manipuló a la asamblea para ser expulsado en la ronda ${room.state.meetingRound}. ¡Ha ganado la partida en solitario!`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isSystem: true,
            isAI: true,
          });
          return res.json({ success: true, winner: 'Caos (Independiente)' });
        }

        // Check if expelled was Forastero and give bonus to Lavador de Dinero
        const isExpelledForastero =
          expelled.role === 'El Recluso' ||
          expelled.role === 'El Huésped Sospechoso' ||
          expelled.role === 'El Borracho' ||
          expelled.role === 'El Borracho Inconsciente' ||
          expelled.role === 'El Paranoico' ||
          expelled.role === 'El Huésped Paranoico';

        if (isExpelledForastero) {
          const lavador = room.players.find((p) => p.isAlive && p.role === 'El Lavador de Dinero');
          if (lavador) {
            lavador.lavadorBonusKills = (lavador.lavadorBonusKills || 0) + 1;
            lavador.coins = (lavador.coins || 0) + 10;
          }
        }

        // Check Cazador
        const wasCazador = expelled.role === 'El Cazador Vengativo';

        // Convert expelled to Alma Atormentadora with 5 ghost missions without revealing role
        expelled.isAlive = false;
        expelled.role = 'Alma Atormentadora';
        expelled.team = 'Caos (Independiente)';
        expelled.missions = generateFivePlayerMissions(true);
        if (wasCazador) {
          expelled.canVengeanceShot = true;
        }

        announcement = `Por votación de la fiesta, ${expelled.name} ha sido expulsado al reino de las sombras. Su rol exacto permanece en el anonimato.`;
      }
    }

    room.chatMessages.push({
      id: 'meet_res_' + Date.now(),
      senderId: 'system',
      senderName: 'ASAMBLEA',
      receiverId: null,
      content: announcement,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSystem: true,
    });

    room.state.isEmergencyActive = false;
    room.state.meetingRound += 1;
    room.state.votes = {};
    room.state.doubleVoteUsers = [];
    room.state.accusedPlayerId = null;
    room.state.tribunalStage = 'concluded';
    room.state.defenseTimerRemaining = 60;

    return res.json({ success: true });
  }

  // 5. Action: Advance Mission
  if (actionType === 'advance_mission') {
    const { missionId } = payload;
    const mission = actingPlayer.missions.find((m) => m.id === missionId);

    if (mission && !mission.completed) {
      mission.currentCount += 1;
      mission.completed = mission.currentCount >= mission.targetCount;
      mission.progress = Math.min(100, Math.round((mission.currentCount / mission.targetCount) * 100));

      let earnedCoins = 0;
      if (mission.completed) {
        earnedCoins = mission.rewardCoins || (mission.type === 'sombra' ? 12 : 10);
        actingPlayer.coins = (actingPlayer.coins || 0) + earnedCoins;

        room.chatMessages.push({
          id: 'reward_whisper_' + Date.now(),
          senderId: 'system',
          senderName: 'ÁRBITRO IA',
          receiverId: actingPlayer.id,
          content: `🪙 ¡Misión completada: "${mission.title}"! Has recibido +${earnedCoins} monedas del Seven. Saldo total: 🪙 ${actingPlayer.coins}.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isSystem: true,
          isAI: true,
        });

        // Si fue una misión del bando de las Sombras, genera una pista sospechosa pública que ayuda a los buenos
        if (mission.type === 'sombra') {
          room.chatMessages.push({
            id: 'shadow_trace_' + Date.now(),
            senderId: 'system',
            senderName: 'ÁRBITRO FORENSE',
            receiverId: null,
            content: `👁️ RASTRO DETECTADO: Alguien de las Sombras ejecutó una acción sospechosa en la casa (Completó encubierto: "${mission.title}"). ¡Observen con atención quién estuvo actuando de forma extraña recientemente!`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isSystem: true,
            isAI: true,
          });
        }
      }

      // Increase collective task bar (las misiones de sombra ayudan a los buenos con +7%)
      const progressBonus = mission.type === 'sombra' ? 7 : 5;
      room.state.collectiveTaskProgress = Math.min(100, room.state.collectiveTaskProgress + progressBonus);

      return res.json({
        success: true,
        mission,
        earnedCoins,
        newBalance: actingPlayer.coins,
        collectiveProgress: room.state.collectiveTaskProgress
      });
    }
    return res.status(400).json({ error: 'Misión no encontrada o ya completada.' });
  }

  // 6. Action: Hacker EMP
  if (actionType === 'hacker_emp') {
    if (room.state.phase !== 'Noche') {
      return res.status(400).json({
        error: '🌙 El Hacker solo puede activar el Pulso EMP durante la NOCHE, aprovechando las fallas de la penumbra.',
      });
    }

    actingPlayer.hackerUsed = true;
    room.state.hackerGlitchActiveUntil = Date.now() + 180 * 1000;

    room.chatMessages.push({
      id: 'emp_msg_' + Date.now(),
      senderId: 'system',
      senderName: 'ALERTA TÉCNICA',
      receiverId: null,
      content: `⚡ ¡PULSO ELECTROMAGNÉTICO! Los dispositivos móviles de los inocentes han sufrido una sobrecarga de estática durante 3 minutos.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSystem: true,
    });

    room.chatMessages.push({
      id: 'emp_hacker_' + Date.now(),
      senderId: 'system',
      senderName: 'ÁRBITRO IA (HACKER)',
      receiverId: actingPlayer.id,
      content: `⚡ ¡PULSO ACTIVADO CON ÉXITO! Has inhabilitado los teléfonos de todos los inocentes y congelado las sirenas de emergencia por 3 minutos (180s). Tus aliados de las Sombras tienen vía libre.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSystem: true,
      isAI: true,
    });

    return res.json({
      success: true,
      glitchUntil: room.state.hackerGlitchActiveUntil,
      player: actingPlayer,
      roomState: room.state,
    });
  }

  // 7. Action: Send Chat Message
  if (actionType === 'send_message') {
    const { receiverId, content, asChameleon, targetDisguiseName } = payload;
    const deadPlayers = room.players.filter((p) => !p.isAlive);
    let disguise: string | undefined = undefined;

    if (asChameleon && deadPlayers.length > 0) {
      if (room.state.phase !== 'Noche') {
        return res.status(400).json({
          error: '🌙 El Camaleón solo puede suplantar la voz de un difunto durante la NOCHE, cuando las sombras confunden a la fiesta.',
        });
      }

      const chosen = targetDisguiseName
        ? deadPlayers.find((p) => p.name.toLowerCase() === targetDisguiseName.toLowerCase())
        : deadPlayers[0];
      disguise = chosen ? chosen.name : deadPlayers[0].name;
      actingPlayer.camaleonUsed = true;

      room.chatMessages.push({
        id: 'camaleon_notice_' + Date.now(),
        senderId: 'system',
        senderName: 'ÁRBITRO IA (CAMALEÓN)',
        receiverId: actingPlayer.id,
        content: `🎭 SUPLANTACIÓN EMITIDA: Tu mensaje fue enviado en el chat general haciéndote pasar por "${disguise}". Todos los demás jugadores ven el mensaje como si fuera enviado por esa alma.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isSystem: true,
        isAI: true,
      });
    }

    const newMsg: ChatMessage = {
      id: 'msg_' + Date.now(),
      senderId: actingPlayer.id,
      senderName: disguise || actingPlayer.name,
      receiverId: receiverId || null,
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isChameleon: !!disguise,
      chameleonDisguiseName: disguise,
    };

    room.chatMessages.push(newMsg);

    // AI group intervention check: when talking in general chat, the AI arbitrator listens and responds
    if (!receiverId) {
      const lower = (content || '').toLowerCase();
      const mentionsAI =
        lower.includes('@ia') ||
        lower.includes('@árbitro') ||
        lower.includes('@arbitro') ||
        lower.includes('arbitro') ||
        lower.includes('árbitro') ||
        lower.includes('quién es') ||
        lower.includes('quien es');

      const isSpicy =
        lower.includes('asesin') ||
        lower.includes('culpable') ||
        lower.includes('migaja') ||
        lower.includes('luisda') ||
        lower.includes('león') ||
        lower.includes('leon') ||
        lower.includes('mandil') ||
        lower.includes('uriel') ||
        lower.includes('rata') ||
        lower.includes('jackie') ||
        lower.includes('pizza') ||
        lower.includes('seven') ||
        lower.includes('cancún') ||
        lower.includes('cancun') ||
        lower.includes('caballo') ||
        lower.includes('majo') ||
        lower.includes('superestrella') ||
        lower.includes('sospech') ||
        lower.includes('traes allí');

      const recentAIMessages = room.chatMessages.slice(-5).filter((m) => m.isAI).length;

      if (mentionsAI || isSpicy || recentAIMessages === 0) {
        setTimeout(() => {
          triggerAIGroupIntervention(room, actingPlayer.name, content).catch((e) =>
            console.error('Intervention error:', e)
          );
        }, 1200);
      }
    }

    return res.json({ success: true, message: newMsg, player: actingPlayer });
  }

  // 8. Action: Fotógrafo Snap (Day action -> Night feedback)
  if (actionType === 'fotografo_snap') {
    if (room.state.phase !== 'Día') {
      return res.status(400).json({
        error: '☀️ El Fotógrafo necesita la luz del DÍA para retratar sospechosos discretamente.',
      });
    }

    const { targetId } = payload;
    const target = room.players.find((p) => p.id === targetId);
    if (!target) {
      return res.status(404).json({ error: 'Objetivo fotográfico no encontrado en la sala.' });
    }

    actingPlayer.investigationPending = {
      targetId,
      revealTime: 0, // Resolved at nightfall
    };

    room.chatMessages.push({
      id: 'foto_snap_' + Date.now(),
      senderId: 'system',
      senderName: 'ÁRBITRO IA (LAB FOTO)',
      receiverId: actingPlayer.id,
      content: `📷 FOTO CAPTURADA: Has enfocado la lente en "${target.name}". El negativo será procesado en el cuarto oscuro al caer la NOCHE. El dictamen confidencial llegará a tu Buzón Nocturno.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSystem: true,
      isAI: true,
    });

    return res.json({ success: true, player: actingPlayer });
  }

  // 8b. Action: Chismoso Compare (Day action -> Night feedback)
  if (actionType === 'chismoso_compare') {
    if (room.state.phase !== 'Día') {
      return res.status(400).json({
        error: '☀️ Los rumores del Chismoso solo se cotejan socialmente durante el DÍA entre la multitud.',
      });
    }

    const { p1Id, p2Id } = payload;
    if (actingPlayer.chismosoUsed) {
      return res.status(400).json({ error: 'Ya has utilizado tu habilidad única de cotejo del Chismoso.' });
    }

    const p1 = room.players.find((p) => p.id === p1Id);
    const p2 = room.players.find((p) => p.id === p2Id);

    if (!p1 || !p2 || p1.id === p2.id) {
      return res.status(400).json({ error: 'Debes seleccionar dos jugadores distintos válidos de la fiesta.' });
    }

    actingPlayer.chismosoPending = { p1Id, p2Id };
    actingPlayer.chismosoUsed = true;

    room.chatMessages.push({
      id: 'chism_msg_' + Date.now(),
      senderId: 'system',
      senderName: 'ÁRBITRO IA (CHISMOSO)',
      receiverId: actingPlayer.id,
      content: `🤫 RUMOR EN COTEJO: Has puesto la mira en ${p1.name} y ${p2.name}. El análisis de coartadas y bandos se contrastará al caer la NOCHE en tu Buzón Nocturno.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSystem: true,
      isAI: true,
    });

    return res.json({
      success: true,
      player: actingPlayer,
    });
  }

  // 9. Action: Escolta Protect (Requires physical encounter with Secret Code)
  if (actionType === 'escolta_protect') {
    if (room.state.phase !== 'Día') {
      return res.status(400).json({
        error: '☀️ El Escolta debe coordinar su custodia presencial durante el DÍA para hablar cara a cara con su objetivo.',
      });
    }

    const { targetId, targetCode } = payload;
    const target = room.players.find((p) => p.id === targetId);
    if (!target) {
      return res.status(404).json({ error: 'Jugador objetivo no encontrado.' });
    }

    if (!targetCode || target.victimCode !== targetCode.toString().trim()) {
      return res.status(400).json({
        error: '🔒 Código Secreto incorrecto. Acércate físicamente a esa persona en la fiesta y pídele su Código Secreto de 4 dígitos para coordinar la escolta.',
      });
    }

    const protectDuration = 900 * 1000;
    target.protectedByEscoltaUntil = Date.now() + protectDuration;
    target.hasEscoltaSpokenFaceToFace = true;

    actingPlayer.escoltaTargetId = targetId;
    actingPlayer.escoltaProtectedUntil = target.protectedByEscoltaUntil;
    actingPlayer.hasEscoltaSpokenFaceToFace = true;

    room.chatMessages.push({
      id: 'esc_msg_' + Date.now(),
      senderId: 'system',
      senderName: 'ÁRBITRO IA (ESCOLTA)',
      receiverId: actingPlayer.id,
      content: `🛡️ ¡CUSTODIA PRESENCIAL ACTIVADA! Has validado el código secreto de ${target.name} cara a cara. Queda blindado físicamente contra cualquier atentado nocturno de las Sombras.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSystem: true,
      isAI: true,
    });

    return res.json({ success: true, player: actingPlayer });
  }

  // 10. Action: Periodista Investigate Theory (Day action -> Night feedback)
  if (actionType === 'periodista_investigate') {
    if (room.state.phase !== 'Día') {
      return res.status(400).json({
        error: '☀️ El Periodista solo formula primicias durante el DÍA tras entrevistas directas.',
      });
    }

    const { targetId, guessedRole } = payload;
    const target = room.players.find((p) => p.id === targetId);
    if (!target) {
      return res.status(404).json({ error: 'Jugador no encontrado.' });
    }

    actingPlayer.periodistaPending = { targetId, guessedRole };

    room.chatMessages.push({
      id: 'per_msg_' + Date.now(),
      senderId: 'system',
      senderName: 'ÁRBITRO IA (PRENSA)',
      receiverId: actingPlayer.id,
      content: `📰 TEORÍA DE PRENSA REGISTRADA: Has formulado la tesis de que "${target.name}" es "${guessedRole}". La edición nocturna del periódico revelará en tu Buzón Nocturno si diste en el blanco (+15 monedas).`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSystem: true,
      isAI: true,
    });

    return res.json({
      success: true,
      player: actingPlayer,
    });
  }

  // 10c. Action: Detective Investigate (Day action -> Night feedback)
  if (actionType === 'detective_investigate') {
    if (room.state.phase !== 'Día') {
      return res.status(400).json({
        error: '☀️ El Detective Privado coloca sus micrófonos y marcas de seguimiento durante el DÍA.',
      });
    }

    const { p1Id, p2Id } = payload;
    const p1 = room.players.find((p) => p.id === p1Id);
    const p2 = room.players.find((p) => p.id === p2Id);

    if (!p1 || !p2 || p1.id === p2.id) {
      return res.status(400).json({ error: 'Debes seleccionar dos jugadores distintos para vigilar.' });
    }

    actingPlayer.detectivePending = { p1Id, p2Id };

    room.chatMessages.push({
      id: 'det_msg_' + Date.now(),
      senderId: 'system',
      senderName: 'ÁRBITRO IA (DETECTIVE)',
      receiverId: actingPlayer.id,
      content: `🕵️‍♂️ VIGILANCIA FIJADA: Has colocado la lupa sobre ${p1.name} y ${p2.name}. El informe de si alguno pertenece a las Sombras se emitirá al caer la NOCHE en tu Buzón Nocturno.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSystem: true,
      isAI: true,
    });

    return res.json({ success: true, player: actingPlayer });
  }

  // 10d. Action: Sommelier Toast (Requires physical encounter with Secret Code)
  if (actionType === 'sommelier_toast') {
    if (room.state.phase !== 'Día') {
      return res.status(400).json({
        error: '☀️ El Sommelier debe invitar la copa especial durante el DÍA en plena fiesta.',
      });
    }
    if (actingPlayer.sommelierUsed) {
      return res.status(400).json({ error: 'Ya has invitado tu copa especial del día.' });
    }

    const { targetId, targetCode } = payload;
    const target = room.players.find((p) => p.id === targetId);
    if (!target) {
      return res.status(404).json({ error: 'Invitado no encontrado.' });
    }

    if (!targetCode || target.victimCode !== targetCode.toString().trim()) {
      return res.status(400).json({
        error: '🍷 Código Secreto incorrecto. Para brindar, acércate en persona, choca copas y pídele su Código Secreto de 4 dígitos.',
      });
    }

    target.isSommelierImpaired = true;
    actingPlayer.sommelierUsed = true;

    room.chatMessages.push({
      id: 'somm_msg_' + Date.now(),
      senderId: 'system',
      senderName: 'ÁRBITRO IA (SOMMELIER)',
      receiverId: actingPlayer.id,
      content: `🍷 ¡BRINDIS ESPECIAL CONSUMADO! Has brindado cara a cara con ${target.name}. Sus sentidos han quedado nublados: si es Asesino no podrá matar esta noche; si investiga, recibirá información distorsionada.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSystem: true,
      isAI: true,
    });

    return res.json({ success: true, player: actingPlayer });
  }

  // 10e. Action: Barman Envenenador Poison
  if (actionType === 'barman_poison') {
    if (actingPlayer.barmanPoisonUsed) {
      return res.status(400).json({ error: 'Ya has utilizado tu dosis de veneno por hoy.' });
    }

    const { targetId } = payload;
    const target = room.players.find((p) => p.id === targetId);
    if (!target) {
      return res.status(404).json({ error: 'Objetivo no encontrado.' });
    }

    target.isPoisoned = true;
    target.poisonedUntil = Date.now() + 24 * 60 * 60 * 1000; // Poison lasts until dawn
    actingPlayer.barmanPoisonUsed = true;

    room.chatMessages.push({
      id: 'bar_msg_' + Date.now(),
      senderId: 'system',
      senderName: 'ÁRBITRO IA (BARMAN)',
      receiverId: actingPlayer.id,
      content: `🧪 CÓCTEL ADULTERADO: Has vertido veneno en la copa de "${target.name}". No lo sabrá, pero a partir de ahora sus habilidades fallarán en silencio o recibirán datos falsos.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSystem: true,
      isAI: true,
    });

    return res.json({ success: true, player: actingPlayer });
  }

  // 10f. Action: Abogado de las Sombras Shield
  if (actionType === 'abogado_shield') {
    if (actingPlayer.abogadoUsedToday) {
      return res.status(400).json({ error: 'Ya has emitido un amparo judicial para esta asamblea.' });
    }

    const { targetId } = payload;
    const target = room.players.find((p) => p.id === targetId);
    if (!target) {
      return res.status(404).json({ error: 'Objetivo no encontrado.' });
    }

    actingPlayer.abogadoProtectedId = targetId;
    actingPlayer.abogadoUsedToday = true;

    room.chatMessages.push({
      id: 'abog_msg_' + Date.now(),
      senderId: 'system',
      senderName: 'ÁRBITRO IA (ABOGADO)',
      receiverId: actingPlayer.id,
      content: `⚖️ RECURSO LEGAL RADICADO: Has emitido un amparo preventivo para "${target.name}". Si la asamblea vota por expulsarlo hoy, la ejecución será anulada automáticamente.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSystem: true,
      isAI: true,
    });

    return res.json({ success: true, player: actingPlayer });
  }

  // 10g. Action: Cazador Vengativo Shoot
  if (actionType === 'cazador_vengeance') {
    if (!actingPlayer.canVengeanceShot || actingPlayer.cazadorShotUsed) {
      return res.status(400).json({ error: 'No tienes disponible tu disparo de venganza.' });
    }

    const { targetId } = payload;
    const target = room.players.find((p) => p.id === targetId && p.isAlive);
    if (!target) {
      return res.status(404).json({ error: 'Objetivo no encontrado o ya eliminado.' });
    }

    target.isAlive = false;
    target.role = 'Alma Atormentadora';
    target.team = 'Caos (Independiente)';
    target.missions = generateFivePlayerMissions(true);

    actingPlayer.canVengeanceShot = false;
    actingPlayer.cazadorShotUsed = true;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    room.chatMessages.push({
      id: 'caz_shot_' + Date.now(),
      senderId: 'system',
      senderName: 'ÁRBITRO IA (EL CAZADOR)',
      receiverId: null,
      content: `🏹 ¡EL DISPARO FINAL DEL CAZADOR! Al ser abatido, ${actingPlayer.name} reveló su rol de Cazador Vengativo y arrastró a la tumba a "${target.name}". ¡Ambos son ahora Almas en pena!`,
      timestamp: timeStr,
      isSystem: true,
      isAI: true,
    });

    return res.json({ success: true, player: actingPlayer });
  }

  // 10h. Action: El Médico Antidote (Pacto Presencial: requires 4-digit secret code)
  if (actionType === 'medico_antidote') {
    if (actingPlayer.medicoAntidoteUsed) {
      return res.status(400).json({ error: 'Ya has utilizado tu dosis de antídoto por hoy.' });
    }

    const { targetId, targetCode } = payload;
    const target = room.players.find((p) => p.id === targetId && p.isAlive);
    if (!target) {
      return res.status(404).json({ error: 'Paciente no encontrado o ya fallecido.' });
    }

    if (!targetCode || target.victimCode !== targetCode.toString().trim()) {
      return res.status(400).json({
        error: '🔒 Código Secreto incorrecto. Acércate físicamente a tu paciente y pídele su Código Secreto de 4 dígitos para inyectar el antídoto.',
      });
    }

    target.isPoisoned = false;
    target.isImpaired = false;
    target.isSommelierImpaired = false;
    target.poisonedUntil = undefined;
    actingPlayer.medicoAntidoteUsed = true;

    room.chatMessages.push({
      id: 'med_msg_' + Date.now(),
      senderId: 'system',
      senderName: 'ÁRBITRO IA (EL MÉDICO)',
      receiverId: actingPlayer.id,
      content: `💉 ¡ANTÍDOTO INYECTADO! Has purificado por completo a ${target.name}. Cualquier veneno, mareo o alteración perceptiva ha sido sanada.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSystem: true,
      isAI: true,
    });

    room.chatMessages.push({
      id: 'med_patient_' + Date.now(),
      senderId: 'system',
      senderName: 'ÁRBITRO IA (EL MÉDICO)',
      receiverId: target.id,
      content: `💉 Sientes una repentina claridad mental y física: El Médico te ha administrado su antídoto en persona. Estás libre de todo veneno.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSystem: true,
      isAI: true,
    });

    return res.json({ success: true, player: actingPlayer });
  }

  // 10i. Action: Abogado Defensor Protect (Pacto Presencial: requires 4-digit code)
  if (actionType === 'abogado_defensor_protect') {
    if (actingPlayer.abogadoDefensorUsedToday) {
      return res.status(400).json({ error: 'Ya has tramitado la defensa legal de un cliente para esta asamblea.' });
    }

    const { targetId, targetCode } = payload;
    const target = room.players.find((p) => p.id === targetId && p.isAlive);
    if (!target) {
      return res.status(404).json({ error: 'Cliente no encontrado o ya eliminado.' });
    }

    if (!targetCode || target.victimCode !== targetCode.toString().trim()) {
      return res.status(400).json({
        error: '⚖️ Código Secreto incorrecto. Acércate físicamente a tu cliente e intercambien el Código de 4 dígitos para formalizar la representación legal.',
      });
    }

    actingPlayer.abogadoDefensorTargetId = targetId;
    actingPlayer.abogadoDefensorUsedToday = true;

    room.chatMessages.push({
      id: 'abog_def_msg_' + Date.now(),
      senderId: 'system',
      senderName: 'ÁRBITRO IA (ABOGADO DEFENSOR)',
      receiverId: actingPlayer.id,
      content: `⚖️ PODER NOTARIAL FIRMADO: Has asumido la defensa legal de "${target.name}". Si la asamblea vota por expulsarlo hoy, la orden será revocada legalmente y sobrevivirá.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSystem: true,
      isAI: true,
    });

    return res.json({ success: true, player: actingPlayer });
  }

  // 10j. Action: Titiritero Madness Curse
  if (actionType === 'titiritero_madness') {
    const { targetId, assignedRole } = payload;
    const target = room.players.find((p) => p.id === targetId && p.isAlive);
    if (!target) {
      return res.status(404).json({ error: 'Víctima no encontrada.' });
    }

    target.madness = {
      assignedRole: assignedRole || 'El Santo',
      targetCodesNeeded: 2,
      confirmedCodes: [],
      isBroken: false,
    };
    actingPlayer.titiriteroInfectedId = targetId;

    room.chatMessages.push({
      id: 'titi_curse_' + Date.now(),
      senderId: 'system',
      senderName: 'ÁRBITRO IA (EL TITIRITERO)',
      receiverId: target.id,
      content: `🎭 ¡MALDICIÓN DE LA LOCURA! El Titiritero ha tomado el control de tus hilos. Debes fingir públicamente ante todos que eres "${target.madness.assignedRole}". Para librarte antes del anochecer, debes conseguir discretamente que 2 invitados te den su Código Secreto de 4 dígitos para validar tu coartada en la app.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSystem: true,
      isAI: true,
    });

    return res.json({ success: true, player: actingPlayer });
  }

  // 10k. Action: Submit Alibi Code (Break Madness)
  if (actionType === 'alibi_submit_code') {
    const { code } = payload;
    if (!actingPlayer.madness) {
      return res.status(400).json({ error: 'No estás bajo los efectos de la Regla de la Locura.' });
    }

    const cleanCode = code ? code.toString().trim() : '';
    const matchingFriend = room.players.find(
      (p) => p.victimCode === cleanCode && p.id !== actingPlayer.id
    );

    if (!matchingFriend) {
      return res.status(400).json({ error: 'Código de coartada incorrecto. Pídeselo a un compañero en persona.' });
    }

    if (actingPlayer.madness.confirmedCodes.includes(matchingFriend.id)) {
      return res.status(400).json({ error: 'Ya has registrado la coartada de este invitado.' });
    }

    actingPlayer.madness.confirmedCodes.push(matchingFriend.id);
    const left = actingPlayer.madness.targetCodesNeeded - actingPlayer.madness.confirmedCodes.length;

    if (left <= 0) {
      actingPlayer.madness = undefined;
      room.chatMessages.push({
        id: 'madness_cleared_' + Date.now(),
        senderId: 'system',
        senderName: 'ÁRBITRO IA',
        receiverId: actingPlayer.id,
        content: `🎉 ¡COARTADA REUNIDA! Has demostrado tu inocencia física ante los invitados. La maldición de la locura se desvanece de tu mente.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isSystem: true,
      });
    } else {
      room.chatMessages.push({
        id: 'madness_prog_' + Date.now(),
        senderId: 'system',
        senderName: 'ÁRBITRO IA',
        receiverId: actingPlayer.id,
        content: `📜 Coartada de ${matchingFriend.name} registrada con éxito. Te falta ${left} testimonio presencial más.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isSystem: true,
      });
    }

    return res.json({ success: true, player: actingPlayer });
  }

  // 10l. Action: Padrino Silencioso Skip Kill (Charge Burst)
  if (actionType === 'padrino_skip_kill') {
    if (room.state.phase !== 'Noche') {
      return res.status(400).json({ error: 'El acecho silencioso del Padrino solo puede tramitarse durante la Noche.' });
    }

    actingPlayer.padrinoCharged = true;
    actingPlayer.padrinoKillsRemaining = 3;

    room.chatMessages.push({
      id: 'padrino_charged_' + Date.now(),
      senderId: 'system',
      senderName: 'ÁRBITRO IA (PADRINO)',
      receiverId: actingPlayer.id,
      content: `🗡️ ACECHO SILENCIOSO CARGADO: Has contenido tu sed de sangre esta noche. En la próxima Noche tendrás una ráfaga mortal de hasta 3 asesinatos consecutivos.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSystem: true,
      isAI: true,
    });

    return res.json({ success: true, player: actingPlayer });
  }

  // 10m. Action: Imp Transfer (Asesino Líder Sacrifice & Succession)
  if (actionType === 'imp_transfer') {
    const minions = room.players.filter(
      (p) => p.isAlive && p.team === 'Sombras (Asesinos)' && p.id !== actingPlayer.id
    );

    if (minions.length === 0) {
      return res.status(400).json({ error: 'No quedan cómplices vivos en tu séquito a quienes heredar el manto del Líder.' });
    }

    const successor = minions[Math.floor(Math.random() * minions.length)];

    // Leader sacrifices himself
    actingPlayer.isAlive = false;
    actingPlayer.role = 'Alma Atormentadora';
    actingPlayer.team = 'Caos (Independiente)';
    actingPlayer.missions = generateFivePlayerMissions(true);

    // Successor becomes new Leader
    successor.role = 'El Asesino Líder';
    successor.isImpLeader = true;

    room.chatMessages.push({
      id: 'imp_trans_' + Date.now(),
      senderId: 'system',
      senderName: 'ÁRBITRO IA (SACRIFICIO SUPREMO)',
      receiverId: successor.id,
      content: `👑 ¡HERENCIA DE LAS SOMBRAS! Tu Líder (${actingPlayer.name}) se ha inmolado para despistar a la asamblea. Ahora TÚ eres El Asesino Líder y asumes el comando nocturno.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSystem: true,
      isAI: true,
    });

    return res.json({ success: true, player: actingPlayer, successorName: successor.name });
  }

  // 11. Action: AI Chat with Game Master
  if (actionType === 'ai_consult') {
    const { query } = payload;
    let reply = 'Las sombras susurran en la cocina... observa a quienes te rodean con atención.';

    try {
      const ai = getAI();
      if (ai) {
        const aliveNames = room.players.filter((p) => p.isAlive).map((p) => p.name).join(', ');
        const deadNames = room.players.filter((p) => !p.isAlive).map((p) => p.name).join(', ');
        const prompt = `Eres el Árbitro IA oficial del juego presencial de deducción social de fiesta entre amigos.
El jugador ${actingPlayer.name} (rol: ${actingPlayer.role}, equipo: ${actingPlayer.team}) te consulta en privado: "${query}".

DATOS REALES Y VERIFICADOS DE ESTA PARTIDA (PROHIBIDO INVENTAR NADA FUERA DE ESTOS HECHOS):
- Jugadores vivos en la sala: ${aliveNames || 'ninguno'}.
- Jugadores fallecidos / almas: ${deadNames || 'ninguno aún'}.
- Fase actual: ${room.state.phase} | Progreso de la fiesta: ${room.state.collectiveTaskProgress}%.
- Reglas oficiales del juego: Los asesinos eliminan susurrando al oído "¿Qué traes allí?". Cada jugador tiene 1 llamada de asamblea de emergencia. Las misiones dan monedas y llenan la meta colectiva para que ganen los inocentes. En la tienda del Seven se compran chalecos, votos dobles y sobornos.

DIRECTIVAS ESTRICTAS CONTRA ALUCINACIONES:
1. NUNCA inventes nombres de personas que no estén en la lista de jugadores reales.
2. NUNCA inventes reglas, poderes fantásticos o roles que no pertenezcan al juego.
3. Si el jugador te pide que le reveles quién es el asesino o los roles secretos de otros, niégate ingeniosamente explicando que el Árbitro cuida la integridad del juego.
4. Si no sabes algo o te preguntan sobre hechos no ocurridos, responde con ingenio diciendo que el Árbitro solo juzga con evidencia real y no con inventos.
5. Mantén la respuesta en máximo 2 oraciones breves, sarcásticas, misteriosas y divertidas.`;

        const resp = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
        });
        if (resp.text) reply = resp.text.trim();
      }
    } catch (err) {
      console.error('AI consult error:', err);
    }

    return res.json({ success: true, reply });
  }

  // 12. Action: Buy Item from Black Market / Shop
  if (actionType === 'buy_item') {
    const { itemId } = payload;
    const item = SHOP_ITEMS.find((it) => it.id === itemId);
    if (!item) {
      return res.status(404).json({ error: 'Artículo no encontrado en el catálogo del mercado negro.' });
    }

    if ((actingPlayer.coins || 0) < item.cost) {
      return res.status(400).json({ error: `Monedas insuficientes. Necesitas ${item.cost} monedas del Seven.` });
    }

    actingPlayer.coins = (actingPlayer.coins || 0) - item.cost;
    let buyMessage = `Has adquirido ${item.name}.`;

    if (itemId === 'vest') {
      actingPlayer.hasBulletproofVest = true;
      buyMessage = '¡Chaleco Antibalas equipado! Estás blindado contra tu siguiente intento de asesinato.';
    } else if (itemId === 'double_vote') {
      actingPlayer.doubleVotesAvailable = (actingPlayer.doubleVotesAvailable || 0) + 1;
      buyMessage = '¡Voto Doble adquirido! Tu voto valdrá x2 en la próxima asamblea de emergencia.';
    } else if (itemId === 'seven_snack') {
      room.state.collectiveTaskProgress = Math.min(100, room.state.collectiveTaskProgress + 8);
      buyMessage = '¡Ronda de botana comprada! La meta colectiva de la fiesta subió +8%.';
      room.chatMessages.push({
        id: 'snack_chat_' + Date.now(),
        senderId: 'system',
        senderName: 'MERCADO DEL SEVEN',
        receiverId: null,
        content: `🍕 ¡RONDA DE PIZZA! ${actingPlayer.name} compró botanas para toda la fiesta. La meta colectiva de los inocentes subió un +8%.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isSystem: true,
      });
    } else if (itemId === 'emp_jam') {
      room.state.hackerGlitchActiveUntil = Date.now() + 90 * 1000;
      buyMessage = 'Interferidor activado: sirenas de asamblea bloqueadas por 90 segundos.';
      room.chatMessages.push({
        id: 'jam_chat_' + Date.now(),
        senderId: 'system',
        senderName: 'MERCADO DEL SEVEN',
        receiverId: null,
        content: `📡 ¡INTERFERENCIA TOTAL! ${actingPlayer.name} activó un inhibidor de señal. Las sirenas de asamblea están bloqueadas durante 90 segundos.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isSystem: true,
      });
    } else if (itemId === 'bribe_clue') {
      let clueText = 'El asesino se ha acercado a la mesa de snacks y suele mirar disimuladamente a los lados.';
      try {
        const ai = getAI();
        if (ai) {
          const killers = room.players.filter((p) => p.role === 'Asesino');
          const killerNames = killers.map((k) => k.name).join(' o ');
          const prompt = `Eres el Forense Clandestino de la fiesta. Un jugador (${actingPlayer.name}) te pagó un soborno de 10 monedas.
Los asesinos son: ${killerNames || 'alguien entre las sombras'}.
Genera una pista sutil, picante y confidencial sobre los hábitos o vestimenta de los asesinos en la reunión (sin decir el nombre directamente, pero dando un indicio como su cercanía a la cocina, su postura, si comió pizza o si habló de Cancún o del Seven). Máximo 1 o 2 oraciones breves.`;
          const resp = await ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: prompt,
          });
          if (resp.text) clueText = resp.text.trim();
        }
      } catch (e) {
        console.error('Clue generation error:', e);
      }

      actingPlayer.purchasedClues = actingPlayer.purchasedClues || [];
      actingPlayer.purchasedClues.push(clueText);

      room.chatMessages.push({
        id: 'clue_whisper_' + Date.now(),
        senderId: 'system',
        senderName: 'FORENSE CLANDESTINO',
        receiverId: actingPlayer.id,
        content: `🕵️ PISTA CONFIDENCIAL POR SOBORNO: "${clueText}"`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isSystem: true,
        isAI: true,
      });

      buyMessage = `Pista obtenida y enviada a tus susurros privados: "${clueText}"`;
    }

    return res.json({
      success: true,
      message: buyMessage,
      player: actingPlayer,
      roomState: room.state,
    });
  }

  // 13. Action: Transfer Coins to Friend
  if (actionType === 'transfer_coins') {
    const { targetPlayerId, amount } = payload;
    const numAmount = parseInt(amount) || 0;
    if (numAmount <= 0) {
      return res.status(400).json({ error: 'La cantidad debe ser mayor a 0.' });
    }
    if ((actingPlayer.coins || 0) < numAmount) {
      return res.status(400).json({ error: 'No cuentas con suficientes monedas para transferir.' });
    }

    const targetPlayer = room.players.find((p) => p.id === targetPlayerId);
    if (!targetPlayer) {
      return res.status(404).json({ error: 'Jugador destinatario no encontrado.' });
    }

    actingPlayer.coins = (actingPlayer.coins || 0) - numAmount;
    targetPlayer.coins = (targetPlayer.coins || 0) + numAmount;

    room.chatMessages.push({
      id: 'tx_chat_' + Date.now(),
      senderId: 'system',
      senderName: 'BANCO DEL SEVEN',
      receiverId: null,
      content: `💸 ¡TRANSFERENCIA! ${actingPlayer.name} le transfirió ${numAmount} monedas a ${targetPlayer.name}. ¿Soborno o pago de pizza?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSystem: true,
    });

    return res.json({
      success: true,
      senderBalance: actingPlayer.coins,
      message: `Has transferido ${numAmount} monedas a ${targetPlayer.name}.`,
    });
  }

  // 14. Action: Advance Phase (Host only)
  if (actionType === 'advance_phase') {
    if (actingPlayer.id !== room.state.hostPlayerId) {
      return res.status(403).json({ error: 'Solo el anfitrión puede adelantar la fase.' });
    }
    const nextPhase = room.state.phase === 'Día' ? 'Noche' : 'Día';
    room.state.phase = nextPhase;
    room.state.phaseTimeRemaining = room.state.phaseDuration;

    if (nextPhase === 'Día') {
      room.state.dayCount = (room.state.dayCount || 1) + 1;
      room.state.dayEventTriggered = false;
      room.state.activeEvent = null;
      room.state.eventTimeRemaining = 0;
      const minBuffer = 25;
      const maxBuffer = Math.max(minBuffer + 10, room.state.phaseDuration - 60);
      room.state.dayEventScheduledSecond = Math.floor(Math.random() * (maxBuffer - minBuffer)) + minBuffer;

      processDayAwakening(room);

      room.chatMessages.push({
        id: 'adv_day_' + Date.now(),
        senderId: 'system',
        senderName: 'ÁRBITRO IA',
        receiverId: null,
        content: `☀️ ¡AMANECE EL DÍA ${room.state.dayCount}! El anfitrión aceleró el ciclo. Se activan las habilidades diurnas (Fotógrafo, Chismoso, Periodista, Escolta, Detective, Sommelier). Habrá 1 evento sorpresa hoy.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isSystem: true,
      });
    } else {
      room.state.activeEvent = null;
      room.state.eventTimeRemaining = 0;

      processNightRevelations(room);

      room.chatMessages.push({
        id: 'adv_night_' + Date.now(),
        senderId: 'system',
        senderName: 'ÁRBITRO IA',
        receiverId: null,
        content: `🌙 ¡CAE LA NOCHE ${room.state.dayCount || 1}! El anfitrión aceleró el anochecer. Los informes confidenciales se han depositado en los buzones nocturnos. Las Sombras acechan.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isSystem: true,
      });
    }

    return res.json({ success: true, roomState: room.state });
  }

  // 15. Action: Trigger Random Event (Host manual trigger)
  if (actionType === 'trigger_event') {
    if (actingPlayer.id !== room.state.hostPlayerId) {
      return res.status(403).json({ error: 'Solo el anfitrión puede forzar un evento.' });
    }
    const nextEv = getRandomEvent(room.state.activeEvent?.id);
    room.state.activeEvent = nextEv;
    room.state.eventTimeRemaining = nextEv.durationSeconds;
    room.state.dayEventTriggered = true;

    room.chatMessages.push({
      id: 'manual_ev_' + Date.now(),
      senderId: 'system',
      senderName: 'ÁRBITRO IA',
      receiverId: null,
      content: `🎲 ¡EVENTO FORZADO POR ANFITRIÓN: "${nextEv.title}"! ${nextEv.instructions} (Tiempo: ${nextEv.durationSeconds}s).`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSystem: true,
    });

    return res.json({ success: true, activeEvent: nextEv, roomState: room.state });
  }

  res.status(400).json({ error: 'Acción no reconocida' });
});

// API: Reset / Restart Room (Host only)
app.post('/api/rooms/:roomCode/reset', (req, res) => {
  const code = req.params.roomCode.toUpperCase().trim();
  const { playerId } = req.body;
  const room = rooms.get(code);

  if (!room) return res.status(404).json({ error: 'Sala no encontrada' });
  if (room.state.hostPlayerId !== playerId) {
    return res.status(403).json({ error: 'Solo el anfitrión puede reiniciar la partida.' });
  }

  room.state.status = 'lobby';
  room.state.isGameStarted = false;
  room.state.winner = null;
  room.state.winReason = undefined;
  room.state.activeEvent = null;
  room.state.eventTimeRemaining = 0;
  room.state.dayCount = 1;
  room.state.dayEventTriggered = false;
  room.state.dayEventScheduledSecond = 450;
  room.state.murderHistory = [];
  room.state.collectiveTaskProgress = 0;
  room.state.votes = {};
  room.state.isEmergencyActive = false;
  room.state.hackerGlitchActiveUntil = null;
  room.state.meetingRound = 1;

  room.players = room.players.map((p) => ({
    ...p,
    role: 'Inocente',
    team: 'Fiesta (Inocentes)',
    isAlive: true,
    emergencyCallsLeft: 1,
    coins: 10,
    hasBulletproofVest: false,
    doubleVotesAvailable: 0,
    victimCode: Math.floor(1000 + Math.random() * 9000).toString(),
    missions: [],
    chismosoUsed: false,
    chismosoReport: undefined,
    camaleonUsed: false,
    hackerUsed: false,
    periodistaTheories: [],
    revealedPhotos: [],
    investigationPending: undefined,
    escoltaTargetId: undefined,
    hasEscoltaSpokenFaceToFace: false,
  }));

  room.chatMessages.push({
    id: 'reset_' + Date.now(),
    senderId: 'system',
    senderName: 'ÁRBITRO IA',
    receiverId: null,
    content: '🔄 La partida ha sido reiniciada. Regresando al lobby para una nueva ronda en Macareno\'s Mystery.',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    isSystem: true,
  });

  return res.json({
    success: true,
    roomState: room.state,
    players: room.players,
    chatMessages: room.chatMessages,
  });
});

// Vite middleware & Static serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
