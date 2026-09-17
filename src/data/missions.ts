import { PlayerMission } from '../types';

export const FRIEND_LORE_MISSIONS: Omit<PlayerMission, 'id' | 'progress' | 'currentCount' | 'completed'>[] = [
  {
    title: 'El Rastro del Migajero',
    description: 'En honor a Luisda, encuentra o deja discretamente una pequeña migaja o servilleta doblada cerca de un jugador sin que te descubra.',
    type: 'lore',
    targetCount: 1,
  },
  {
    title: 'El Mandado de León',
    description: 'Cumple la orden de León el mandilón: ofrécete a servirle un vaso o alcanzarle algo a otro jugador diciendo "a tus órdenes".',
    type: 'lore',
    targetCount: 1,
  },
  {
    title: 'La Trampa de Queso',
    description: 'En honor a Uriel la rata, consigue que alguien te comparta comida o un trago usando una táctica de tacaño o engaño amistoso.',
    type: 'lore',
    targetCount: 1,
  },
  {
    title: 'La Leyenda del Caballo de Día de Muertos',
    description: 'Menciona sutilmente la palabra "caballo" o "Día de Muertos" en una conversación con dos personas sin que sospechen del juego.',
    type: 'lore',
    targetCount: 2,
  },
  {
    title: 'El Snack de Jackie en la Uni',
    description: 'Come o mastica disimuladamente algo de botana o pizza mientras escuchas una teoría de alguien con cara de máximo interés.',
    type: 'lore',
    targetCount: 1,
  },
  {
    title: 'Meta AI el Metiche',
    description: 'Interrumpe una conversación ajena diciendo de repente: "Según Meta AI..." o respondiendo algo que nadie te preguntó.',
    type: 'lore',
    targetCount: 2,
  },
  {
    title: 'Nostalgia de Cancún',
    description: 'Haz un brindis con al menos 2 jugadores diciendo la frase: "Brindo porque en Cancún todo cambió para bien".',
    type: 'lore',
    targetCount: 1,
  },
  {
    title: 'La Mirada Anti-Majo',
    description: 'Haz contacto visual cómplice con otro jugador y haz un gesto de desaprobación compartida como cuando todos odiamos a Majo.',
    type: 'lore',
    targetCount: 2,
  },
  {
    title: 'El Boicot a Superestrella',
    description: 'Critica o haz un comentario sarcástico sobre la canción "Superestrella" si suena, o convence a alguien de que esa canción es pésima.',
    type: 'lore',
    targetCount: 1,
  },
  {
    title: 'Himno de Los Hidrotemplados',
    description: 'Tararea una melodía o pregúntale a alguien si ha escuchado a la legendaria banda "Los Hidrotemplados".',
    type: 'lore',
    targetCount: 1,
  },
  {
    title: 'La Rebanada Sagrada de Pizza',
    description: 'Come o reparte una porción de pizza con alguien, debatiendo apasionadamente si la orilla de la pizza se come o se deja.',
    type: 'lore',
    targetCount: 1,
  },
  {
    title: 'Antojo Inminente del Seven',
    description: 'Propón en voz alta: "Deberíamos ir al Seven al rato por algo", y logra que al menos una persona te dé la razón.',
    type: 'lore',
    targetCount: 1,
  },
  {
    title: 'Duelo de Miradas Silencioso',
    description: 'Sostén la mirada con cualquier persona de la fiesta durante 6 segundos seguidos sin reírte ni pestañear en exceso.',
    type: 'social',
    targetCount: 2,
  },
  {
    title: 'El Chisme Inocente',
    description: 'Acércate a un jugador y susúrrale un secreto totalmente inventado pero inofensivo sobre la comida o la música.',
    type: 'social',
    targetCount: 1,
  },
  {
    title: 'El Brindis Cruzado',
    description: 'Choca tu vaso o botella con dos personas diferentes en un lapso menor a 2 minutos.',
    type: 'social',
    targetCount: 2,
  },
  {
    title: 'Verificación de Coartada',
    description: 'Pregúntale casualmente a alguien: "¿Dónde estabas hace 10 minutos?" fingiendo que es pura curiosidad.',
    type: 'social',
    targetCount: 2,
  },
  {
    title: 'El Halago Sospechoso',
    description: 'Dile un cumplido sincero o exagerado a otro jugador sobre su ropa o su vibra en la fiesta.',
    type: 'social',
    targetCount: 2,
  },
  {
    title: 'Intercambio de Objetos',
    description: 'Pide prestado un objeto pequeño (encendedor, servilleta, vaso vacío) y devuélvelo 1 minuto después con cara misteriosa.',
    type: 'desafio',
    targetCount: 1,
  },
  {
    title: 'La Postura de Alerta',
    description: 'Quédate apoyado contra una pared con los brazos cruzados observando la sala durante 30 segundos continuos.',
    type: 'desafio',
    targetCount: 1,
  }
];

export const GHOST_LORE_MISSIONS: Omit<PlayerMission, 'id' | 'progress' | 'currentCount' | 'completed'>[] = [
  {
    title: 'Aparición del Migajero Espectral',
    description: 'Como alma en pena de Luisda, quédate parado detrás de un jugador vivo a menos de un metro sin emitir sonido durante 20 segundos.',
    type: 'fantasma',
    targetCount: 1,
  },
  {
    title: 'La Maldición del Caballo',
    description: 'Pásale por al lado a dos jugadores vivos haciendo un leve relincho o chasquido con la lengua.',
    type: 'fantasma',
    targetCount: 2,
  },
  {
    title: 'El Fantasma Metiche de Meta AI',
    description: 'Ponte a escuchar el chisme de una conversación de vivos y asiente lentamente con la cabeza.',
    type: 'fantasma',
    targetCount: 2,
  },
  {
    title: 'Espíritu Hambriento de Pizza',
    description: 'Señala fijamente la comida o la pizza de un jugador vivo hasta que se sienta observado.',
    type: 'fantasma',
    targetCount: 1,
  },
  {
    title: 'Sombra del Seven-Eleven',
    description: 'Toca el hombro de un vivo y señálale la puerta de salida diciendo con la mirada que vaya al Seven.',
    type: 'fantasma',
    targetCount: 1,
  }
];

// Misiones exclusivas para el Bando de las Sombras (Asesinos / Cómplices):
// Son acciones sospechosas en la vida real que te exponen, pero al completarlas
// ganas monedas para la tienda y además avanzan la barra colectiva de los inocentes (ayudan a los buenos).
export const SHADOW_SUSPICIOUS_MISSIONS: Omit<PlayerMission, 'id' | 'progress' | 'currentCount' | 'completed'>[] = [
  {
    title: 'El Vaso Marcado del Asesino',
    description: 'Ofrécele una bebida o una botana a un inocente sosteniéndole la mirada fija durante 5 segundos sin sonreír.',
    type: 'sombra',
    targetCount: 1,
  },
  {
    title: 'El Sabotaje de Luz o Música',
    description: 'Acércate al interruptor de la luz y apágala por 5 segundos, o ve al altavoz y cambia la canción a algo incómodo. Todos sospecharán de quién estuvo ahí.',
    type: 'sombra',
    targetCount: 1,
  },
  {
    title: 'La Coartada Contradictoria',
    description: 'Dile a dos inocentes por separado versiones diferentes de dónde estabas hace 5 minutos (ej: a uno que estabas en la cocina y a otro en el baño).',
    type: 'sombra',
    targetCount: 2,
  },
  {
    title: 'El Acecho a Menos de 1 Metro',
    description: 'Quédate parado a menos de un metro de cualquier inocente durante 30 segundos continuos fingiendo revisar tu celular.',
    type: 'sombra',
    targetCount: 1,
  },
  {
    title: 'La Pregunta Incriminatoria',
    description: 'Pregúntale en voz alta a un inocente delante de al menos dos personas: "¿Por qué estás tan nervioso/a hoy? Pareces culpable".',
    type: 'sombra',
    targetCount: 1,
  },
  {
    title: 'El Objeto Plantado',
    description: 'Deja discretamente una servilleta arrugada, una moneda o un limón en el bolsillo o junto al vaso de un inocente.',
    type: 'sombra',
    targetCount: 1,
  },
  {
    title: 'El Falso Susurro de Muerte',
    description: 'Acércate al oído de un inocente y susúrrale algo totalmente absurdo con voz tenebrosa (ej: "La pizza se enfría"), poniéndolo en alerta.',
    type: 'sombra',
    targetCount: 1,
  },
  {
    title: 'Sembrar la Falsa Alarma',
    description: 'Sugiere en voz alta a dos personas: "Deberíamos tocar la sirena de asamblea ya mismo", provocando que cuestionen tu urgencia.',
    type: 'sombra',
    targetCount: 2,
  },
  {
    title: 'El Brindis de Judas',
    description: 'Choca tu vaso con un inocente mirándolo a los ojos y diciendo: "Por los que todavía siguen vivos en esta casa".',
    type: 'sombra',
    targetCount: 1,
  },
  {
    title: 'La Salida Falsa a Oscuras',
    description: 'Camina hacia la puerta de salida o hacia una habitación oscura como si te retiraras, quédate 15 segundos y regresa mirando a todos.',
    type: 'sombra',
    targetCount: 1,
  },
  {
    title: 'Ostentación Clandestina del Seven',
    description: 'Presume ante un inocente que tienes monedas para comprar en el Mercado del Seven, pero niégate a decir de qué misión salieron.',
    type: 'sombra',
    targetCount: 1,
  },
  {
    title: 'El Guiño Cómplice',
    description: 'Hazle un guiño evidente o un gesto de "guardar silencio" con el dedo en los labios a un inocente que te esté mirando.',
    type: 'sombra',
    targetCount: 1,
  }
];

// Algoritmo Fisher-Yates de alta entropía para mezclas justas
function fisherYatesShuffle<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// Genera 5 misiones únicas por jugador según su estado y bando
export function generateFivePlayerMissions(isGhost: boolean, isShadow: boolean = false): PlayerMission[] {
  let selectedMissions: Omit<PlayerMission, 'id' | 'progress' | 'currentCount' | 'completed'>[] = [];

  if (isGhost) {
    const shuffledGhosts = fisherYatesShuffle(GHOST_LORE_MISSIONS);
    selectedMissions = shuffledGhosts.slice(0, 5);
  } else if (isShadow) {
    // Para las Sombras: 3 misiones sospechosas específicas + 2 misiones de lore para camuflarse
    const shuffledShadows = fisherYatesShuffle(SHADOW_SUSPICIOUS_MISSIONS);
    const shuffledLore = fisherYatesShuffle(FRIEND_LORE_MISSIONS);
    selectedMissions = [...shuffledShadows.slice(0, 3), ...shuffledLore.slice(0, 2)];
    selectedMissions = fisherYatesShuffle(selectedMissions);
  } else {
    // Para los inocentes: 5 misiones variadas de lore y desafíos
    const shuffledInnocents = fisherYatesShuffle(FRIEND_LORE_MISSIONS);
    selectedMissions = shuffledInnocents.slice(0, 5);
  }

  return selectedMissions.map((m, idx) => ({
    id: `mis_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 6)}`,
    title: m.title,
    description: m.description,
    type: m.type,
    progress: 0,
    targetCount: m.targetCount,
    currentCount: 0,
    completed: false,
    rewardCoins: m.type === 'sombra' ? 12 : 5 + ((idx * 3) % 3) * 5, // Sombras ganan 12 monedas por arriesgarse
  }));
}
