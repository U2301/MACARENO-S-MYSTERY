import { MacarenoWheelEvent, Player } from '../types';

export interface WheelSliceDefinition {
  index: number;
  archetype: string;
  title: string;
  shortName: string;
  color: string;
  accent: string;
  durationSeconds: number;
  effectType: 'snack' | 'migajas' | 'novia_malvada' | 'caballo' | 'alfa' | 'chisme' | 'capricho';
  generateLore: (targetName: string) => { lore: string; instructions: string };
}

export const MACARENO_SLICES: WheelSliceDefinition[] = [
  {
    index: 0,
    archetype: 'Jackie',
    title: '🍿 Hora del Snack de Jackie',
    shortName: 'Snack de Jackie',
    color: '#f59e0b',
    accent: '#d97706',
    durationSeconds: 90,
    effectType: 'snack',
    generateLore: (targetName: string) => ({
      lore: `El legendario e insaciable antojo del Snack de Jackie se le ha antojado a ${targetName}...`,
      instructions: `Quien le acerque físicamente una botana, bebida o snack a ${targetName} en menos de 90 segundos gana +15 monedas del Seven. Si nadie lo alimenta a tiempo, ¡recibirá inmunidad temporal por puro resentimiento!`,
    }),
  },
  {
    index: 1,
    archetype: 'Luisda',
    title: '🥖 Las Migajas de Luisda',
    shortName: 'Migajas de Luisda',
    color: '#10b981',
    accent: '#059669',
    durationSeconds: 45,
    effectType: 'migajas',
    generateLore: (targetName: string) => ({
      lore: `¡Alerta de descuido en el salón! A ${targetName} se le están cayendo las Migajas de Luisda por toda la casa...`,
      instructions: `Han aparecido migajas digitales en la pantalla. ¡El primer invitado que pulse la pantalla y recoja las migajas se llevará un botín sorpresa de +10 monedas del Seven!`,
    }),
  },
  {
    index: 2,
    archetype: 'Elle',
    title: '🥀 La Novia Malvada de Elle',
    shortName: 'Novia Malvada',
    color: '#ec4899',
    accent: '#be185d',
    durationSeconds: 90,
    effectType: 'novia_malvada',
    generateLore: (targetName: string) => ({
      lore: `Un escalofrío recorre la sala... El aura gélida y despiadada de 'La Novia Malvada de Elle' ha poseído hoy a ${targetName}.`,
      instructions: `${targetName} tiene el poder de fulminar con la mirada a un sospechoso. En la siguiente asamblea, ¡puede vetarle el derecho a voto o prohibirle emitir palabra durante 2 minutos!`,
    }),
  },
  {
    index: 3,
    archetype: 'Caballo',
    title: '🕯️🐴 Un Altar y un Caballo de Día de Muertos',
    shortName: 'Caballo de Muertos',
    color: '#8b5cf6',
    accent: '#6d28d9',
    durationSeconds: 120,
    effectType: 'caballo',
    generateLore: (targetName: string) => ({
      lore: `El Mictlán abre sus puertas y ha elegido a ${targetName} como el Corcel Sagrado de Día de Muertos...`,
      instructions: `Cada vez que ${targetName} hable o acuse a alguien durante los próximos 2 minutos, debe soltar un discreto relincho de caballo o pagar una multa de 5 monedas al pozo de la fiesta.`,
    }),
  },
  {
    index: 4,
    archetype: 'Alfa',
    title: '🐺 El Alfa de la Manada',
    shortName: 'Alfa de Manada',
    color: '#3b82f6',
    accent: '#1d4ed8',
    durationSeconds: 90,
    effectType: 'alfa',
    generateLore: (targetName: string) => ({
      lore: `Aullidos de dominancia territorial... ${targetName} ha sido coronado como El Alfa de la Manada.`,
      instructions: `Su voto contará por TRIPLE en la siguiente asamblea de emergencia, a menos que otro jugador se le acerque y le sostenga la mirada fija durante 10 segundos seguidos sin reírse para despojarlo del título.`,
    }),
  },
  {
    index: 5,
    archetype: 'Chisme',
    title: '🗣️ Me aburrí, hay que hablar mal de alguien',
    shortName: 'Hablar Mal de Alguien',
    color: '#f43f5e',
    accent: '#be123c',
    durationSeconds: 120,
    effectType: 'chisme',
    generateLore: (targetName: string) => ({
      lore: `La diplomacia aburrió profundamente a ${targetName} y exige veneno en la sala: "Me aburrí, hay que hablar mal de alguien".`,
      instructions: `¡Se abre el Confesionario Anónimo Exprés de Macareno! Escriban en el chat general un chisme, sospecha picante o teoría sobre cualquier persona sin dar su nombre real.`,
    }),
  },
  {
    index: 6,
    archetype: 'Capricho',
    title: '🐾 El Capricho de Macareno',
    shortName: 'Capricho Macareno',
    color: '#eab308',
    accent: '#ca8a04',
    durationSeconds: 60,
    effectType: 'capricho',
    generateLore: (targetName: string) => ({
      lore: `Macareno (mitad gato persa de ojos verdes, mitad calavera huesuda) se frota en las piernas de ${targetName}...`,
      instructions: `Macareno maúlla una profecía críptica: ${targetName} debe elegir a dos personas para que choquen copas y hagan un brindis público antes de que termine el tiempo, o un mal augurio caerá sobre la casa.`,
    }),
  },
];

export function buildMacarenoEvent(players: Player[], forcedIndex?: number): MacarenoWheelEvent {
  const alivePlayers = players.filter((p) => p.isAlive);
  const chosenPlayer = alivePlayers.length > 0
    ? alivePlayers[Math.floor(Math.random() * alivePlayers.length)]
    : (players[0] || { id: 'anon', name: 'Alguien' });

  const sliceIndex = forcedIndex !== undefined && forcedIndex >= 0 && forcedIndex < MACARENO_SLICES.length
    ? forcedIndex
    : Math.floor(Math.random() * MACARENO_SLICES.length);

  const def = MACARENO_SLICES[sliceIndex];
  const { lore, instructions } = def.generateLore(chosenPlayer.name);

  return {
    id: 'mac_ev_' + Date.now(),
    sliceIndex,
    title: def.title,
    characterArchetype: def.archetype,
    assignedPlayerId: chosenPlayer.id,
    assignedPlayerName: chosenPlayer.name,
    lore,
    instructions,
    durationSeconds: def.durationSeconds,
    effectType: def.effectType,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
}
