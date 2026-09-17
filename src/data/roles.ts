import { RoleType, TeamType, RoleFamily } from '../types';

export interface RoleDefinition {
  type: RoleType;
  family: RoleFamily | 'Ultratumba';
  team: TeamType;
  badgeColor: string;
  tagline: string;
  description: string;
  rules: string[];
  winCondition: string;
  phaseDependence: string;
  abilityName: string;
  abilityDescription: string;
  pactRequirement?: string; // Requisito presencial con código de 4 dígitos
  falsoPositivo?: boolean;
}

export interface SetupRecommendation {
  playerRange: string;
  minPlayers: number;
  maxPlayers: number;
  innocents: string;
  outsiders: string;
  minions: string;
  killers: string;
  note: string;
}

export const RECOMMENDED_SETUP_TABLE: SetupRecommendation[] = [
  {
    playerRange: '7 – 9 Jugadores',
    minPlayers: 7,
    maxPlayers: 9,
    innocents: '5 Invitados (Buenos)',
    outsiders: '1 Excéntrico (Forastero)',
    minions: '1 Cómplice (Esbirro)',
    killers: '1 Asesino Supremo',
    note: 'Ideal para partidas ágiles. Se recomienda 1 Asesino Líder, 1 Barman o Hacker, y Forasteros como El Huésped Sospechoso o Paranoico.',
  },
  {
    playerRange: '10 – 12 Jugadores',
    minPlayers: 10,
    maxPlayers: 12,
    innocents: '7 Invitados (Buenos)',
    outsiders: '1 Excéntrico (Forastero)',
    minions: '2 Cómplices (Esbirros)',
    killers: '1 Asesino Supremo',
    note: 'Entra en juego el juego de información cruzada: Fotógrafo, Detective y Sommelier contra Barman y Camaleón.',
  },
  {
    playerRange: '13 – 15 Jugadores',
    minPlayers: 13,
    maxPlayers: 15,
    innocents: '9 Invitados (Buenos)',
    outsiders: '2 Excéntricos (Forasteros)',
    minions: '2 Cómplices (Esbirros)',
    killers: '1 Asesino Supremo',
    note: 'Tensión alta: El Santo / Heredero Maldito y El Borracho generan dudas sobre la autenticidad de las pistas.',
  },
  {
    playerRange: '16 – 19 Jugadores',
    minPlayers: 16,
    maxPlayers: 19,
    innocents: '11 Invitados (Buenos)',
    outsiders: '2 Excéntricos (Forasteros)',
    minions: '3 Cómplices (Esbirros)',
    killers: '1 – 2 Asesinos Supremos',
    note: 'Combate masivo. Puede incluirse a El Padrino Silencioso o Titiritero con manipulación de la regla de la Locura.',
  },
  {
    playerRange: '20 – 25 Jugadores',
    minPlayers: 20,
    maxPlayers: 25,
    innocents: '14 – 17 Invitados (Buenos)',
    outsiders: '3 Excéntricos (Forasteros)',
    minions: '3 – 4 Cómplices (Esbirros)',
    killers: '2 Asesinos Supremos',
    note: 'Nivel fiesta magna. Ambas Sombras Supremas activas, red de cómplices completa, abogados y red de rescate forense.',
  },
];

export const ROLES_CATALOG: Record<RoleType, RoleDefinition> = {
  // ==========================================
  // I. INVITADOS DISTINGUIDOS (ALDEANOS / BIEN)
  // ==========================================
  'Inocente': {
    type: 'Inocente',
    family: 'Invitados Distinguidos',
    team: 'Fiesta (Inocentes)',
    badgeColor: 'emerald',
    tagline: 'Superviviente social y observador',
    description: 'Eres un invitado de honor en la fiesta de Macareno. No posees habilidades esotéricas, pero tu deducción, lenguaje corporal y votos en asamblea son la salvación de la fiesta.',
    rules: [
      'Cumple tus misiones cotidianas para avanzar la barra colectiva de la fiesta (al 100% ganan los inocentes).',
      'Si alguien te arrincona estrictamente a solas y te susurra "¿Qué traes allí?", dale tu Código Secreto de 4 dígitos sin gritar.',
      'Al morir, te conviertes en Alma Atormentadora con misiones espirituales de ultratumba.'
    ],
    winCondition: 'Eliminar a todos los Asesinos Supremos en la asamblea O completar el 100% de la barra de misiones colectivas.',
    phaseDependence: 'Ambos (Día y Noche)',
    abilityName: 'Deducción y Coartadas',
    abilityDescription: 'Observa contradicciones entre los invitados y vota sabiamente en las asambleas.'
  },

  'El Fotógrafo': {
    type: 'El Fotógrafo',
    family: 'Invitados Distinguidos',
    team: 'Fiesta (Inocentes)',
    badgeColor: 'sky',
    tagline: 'Cazador de sombras a través del lente',
    description: 'De día capturas un retrato furtivo de un invitado. En la noche, el laboratorio químico procesa el negativo y deposita en tu Buzón Nocturno si esa persona es Inocente o Hostil (Sombras).',
    rules: [
      'Durante el Día, enfoca tu lente y selecciona a un invitado para fotografiarlo.',
      'Ciclo de Información: El resultado NO es instantáneo. Debes esperar a que caiga la Noche para que el Árbitro IA te entregue el rollo revelado en privado.',
      '¡Atención! Si estás ebrio o envenenado, o si fotografías al Huésped Sospechoso, el revelado puede dar un resultado falso.'
    ],
    winCondition: 'Revelar las identidades de las Sombras y guiar la votación diurna de la asamblea.',
    phaseDependence: 'Acción de Día → Revelación en la Noche',
    abilityName: 'Cámara Forense Instantánea',
    abilityDescription: 'Retrata a un invitado de día; su alineación química se revela al caer la noche en tu buzón privado.',
    pactRequirement: 'Visual / Presencial en la fiesta'
  },

  'El Mayordomo Mayor': {
    type: 'El Mayordomo Mayor',
    family: 'Invitados Distinguidos',
    team: 'Fiesta (Inocentes)',
    badgeColor: 'teal',
    tagline: 'El anfitrión observador de la sala',
    description: 'Conoces cada rincón de la casa y el pulso social de los grupos. Al caer la noche, el Árbitro IA te informa cuántos cómplices o parejas de Sombras operan activamente cerca de ti o en la fiesta.',
    rules: [
      'Al inicio de cada Noche, recibes un informe sensorial en tu Buzón Nocturno indicando el número exacto o cercanía de presencias oscuras.',
      'Si estás ebrio o envenenado por el Barman, el cálculo puede arrojar una cifra alterada.',
      'Usa la información para identificar si un grupo de personas sentadas en una mesa alberga un nido de cómplices.'
    ],
    winCondition: 'Guiar al pueblo informando la densidad de maldad en la fiesta para estrechar el círculo de sospechosos.',
    phaseDependence: 'Pasiva Nocturna (Informe en cada Noche)',
    abilityName: 'Lectura de Sala',
    abilityDescription: 'Recibe en la noche un recuento de cuántos aliados de las Sombras se encuentran en juego.'
  },

  'El Sommelier': {
    type: 'El Sommelier',
    family: 'Invitados Distinguidos',
    team: 'Fiesta (Inocentes)',
    badgeColor: 'violet',
    tagline: 'Maestro de copas y neutralizador',
    description: 'Conoces las mejores reservas de la bodega. De día, te acercas cara a cara a un invitado, brindas con él e ingresas su Código Secreto de 4 dígitos para ofrecerle una copa especial. Si esa persona es un Asesino o Cómplice, queda ebrio e inofensivo durante 24 horas.',
    rules: [
      'PACTO PRESENCIAL: Debes acercarte físicamente al invitado, chocar copas y pedirle su Código Secreto de 4 dígitos.',
      'Si el objetivo es Asesino, su intento de asesinato nocturno fallará silenciosamente.',
      'Si es Hacker o Barman, su sabotaje quedará anulado.',
      'Puedes usar tu copa especial una vez por ciclo diurno.'
    ],
    winCondition: 'Emborrachar a los asesinos para salvar vidas en la noche y delatar a quienes intentaron matar sin éxito.',
    phaseDependence: 'Solo Día (Pacto Presencial con Código)',
    abilityName: 'Copa de Reserva',
    abilityDescription: 'Ingresa el código presencial de un invitado para embriagarlo. Si es de las Sombras, queda neutralizado por 24h.',
    pactRequirement: 'Pacto Presencial: Código Secreto de 4 dígitos de la persona con quien brindas'
  },

  'El Guardaespaldas': {
    type: 'El Guardaespaldas',
    family: 'Invitados Distinguidos',
    team: 'Fiesta (Inocentes)',
    badgeColor: 'indigo',
    tagline: 'Custodio personal y escudo humano',
    description: 'Durante el día, te acercas a un invitado, coordinas su seguridad en persona y le pides su Código Secreto de 4 dígitos. Al registrarlo en la app, queda formalmente custodiado: si un asesino intenta matarlo esa noche, el ataque es rechazado.',
    rules: [
      'PACTO PRESENCIAL: Debes hablar cara a cara con tu protegido y solicitarle su código de 4 dígitos.',
      'Si las Sombras atacan a esa persona esa misma noche, la muerte queda frustrada.',
      'Si estás envenenado por el Barman, la app te dirá "Custodia asignada", pero el escudo fallará en silencio si lo atacan.'
    ],
    winCondition: 'Mantener con vida a los invitados clave y anular los crímenes nocturnos.',
    phaseDependence: 'Acción de Día → Protección activa en la Noche',
    abilityName: 'Escudo Presencial',
    abilityDescription: 'Ingresa el código presencial de un aliado de día para blindarlo contra el asesinato esa noche.',
    pactRequirement: 'Pacto Presencial: Código Secreto de 4 dígitos del protegido'
  },

  'El Escolta': {
    type: 'El Escolta',
    family: 'Invitados Distinguidos',
    team: 'Fiesta (Inocentes)',
    badgeColor: 'indigo',
    tagline: 'Guardaespaldas presencial (Monje)',
    description: 'Alias de El Guardaespaldas. Protege físicamente a un invitado ingresando su código secreto presencial de 4 dígitos.',
    rules: [
      'Solicita el código secreto de 4 dígitos al aliado que deseas blindar.',
      'Protege contra atentados nocturnos si se vincula de día.'
    ],
    winCondition: 'Proteger a los inocentes y frustrar los ataques de las Sombras.',
    phaseDependence: 'Solo Día (Pacto con Código)',
    abilityName: 'Escudo Presencial',
    abilityDescription: 'Blindaje nocturno mediante código presencial diurno.',
    pactRequirement: 'Pacto Presencial: Código Secreto de 4 dígitos'
  },

  'El Médico Forense': {
    type: 'El Médico Forense',
    family: 'Invitados Distinguidos',
    team: 'Fiesta (Inocentes)',
    badgeColor: 'teal',
    tagline: 'Sepulturero y perito de la escena',
    description: 'Cada noche tras una expulsión en asamblea o tras registrarse un asesinato, el Árbitro IA te envía en privado a tu Buzón Nocturno un informe forense con pistas de la escena y el rol real del difunto.',
    rules: [
      'Al caer la noche, si hubo una muerte o expulsión, recibes un informe confidencial detallando pistas forenses (ej: vestimenta del agresor, restos o rol verdadero).',
      'Compara la hora y las pistas sensoriales con las coartadas físicas de los invitados en la asamblea.'
    ],
    winCondition: 'Reconstruir las escenas del crimen y delatar a los asesinos con evidencia científica.',
    phaseDependence: 'Pasiva Nocturna (Al ocurrir muertes)',
    abilityName: 'Informe de Autopsia',
    abilityDescription: 'Recibe detalles confidenciales y peritaje de cada víctima en tu Buzón Nocturno.'
  },

  'El Cazador Vengativo': {
    type: 'El Cazador Vengativo',
    family: 'Invitados Distinguidos',
    team: 'Fiesta (Inocentes)',
    badgeColor: 'amber',
    tagline: 'Centinela armado hasta el último aliento',
    description: 'Duermes con el dedo en el gatillo. Si mueres durante la noche por atentado de las Sombras, despiertas en la app con una última bala para disparar y arrastrar contigo a la tumba a un sospechoso.',
    rules: [
      'Si eres asesinado de noche, se activa un botón de emergencia en tu pantalla: "Disparo de Venganza".',
      'Selecciona a cualquier sospechoso para eliminarlo de inmediato antes de convertirte en Alma.',
      'Si disparas al Asesino Líder, habrás salvado la fiesta.'
    ],
    winCondition: 'Eliminar a las Sombras, incluso cobrando venganza mortal desde la ultratumba.',
    phaseDependence: 'Reactiva Nocturna (Al ser asesinado)',
    abilityName: 'Disparo Póstumo',
    abilityDescription: 'Si te asesinan de noche, tienes un disparo letal de venganza contra quien elijas.'
  },

  'El Detective Privado': {
    type: 'El Detective Privado',
    family: 'Invitados Distinguidos',
    team: 'Fiesta (Inocentes)',
    badgeColor: 'emerald',
    tagline: 'Ojo clínico y clarividente de la fiesta',
    description: 'Durante el día marcas a dos sospechosos en la app. Al caer la noche, el Árbitro IA te entrega un informe en tu Buzón Nocturno indicando si al menos uno de ellos oculta intenciones asesinas.',
    rules: [
      'Selecciona a 2 invitados durante el Día.',
      'En la Noche, recibes el veredicto: «Alerta: Sombras» si alguno es hostil (o si incluiste al Huésped Sospechoso), o «Despejado» si ambos son inocentes puros.',
      'Si estás embriagado o envenenado, el reporte puede ser invertido.'
    ],
    winCondition: 'Cercar matemáticamente a los culpables mediante cruce de parejas de sospechosos.',
    phaseDependence: 'Acción de Día → Revelación en la Noche',
    abilityName: 'Vigilancia Secreta',
    abilityDescription: 'Elige 2 invitados de día; en la noche sabrás si al menos uno pertenece a las Sombras.'
  },

  'El Periodista': {
    type: 'El Periodista',
    family: 'Invitados Distinguidos',
    team: 'Fiesta (Inocentes)',
    badgeColor: 'cyan',
    tagline: 'Cronista de investigación y primicias',
    description: 'De día entrevistas a los invitados y registras tus tesis periodísticas en la app. En la noche, la edición nocturna valida tus hipótesis y te recompensa con monedas e indicios confidenciales.',
    rules: [
      'Elige a un jugador y arriesga cuál es su rol exacto tras entrevistarlo en la fiesta.',
      'En la Noche, la redacción te confirma si acertaste, otorgándote +15 monedas del Seven para comprar chalecos o pistas.'
    ],
    winCondition: 'Descubrir los roles ocultos de la fiesta mediante deducción social y financiar al bando del bien.',
    phaseDependence: 'Acción de Día → Revelación en la Noche',
    abilityName: 'Cuaderno de Primicias',
    abilityDescription: 'Formula tu hipótesis sobre un invitado de día; la confirmación y monedas llegan en la noche.'
  },

  'El Abogado Defensor': {
    type: 'El Abogado Defensor',
    family: 'Invitados Distinguidos',
    team: 'Fiesta (Inocentes)',
    badgeColor: 'blue',
    tagline: 'Garante del debido proceso ciudadano',
    description: 'Durante el día, pactas con un cliente en persona pidiéndole su Código Secreto de 4 dígitos. Si esa persona resulta ser la más votada en la asamblea de esa tarde, tu amparo anula la ejecución y sobrevive al juicio.',
    rules: [
      'PACTO PRESENCIAL: Debes ingresar el código secreto de 4 dígitos de tu cliente durante el día.',
      'Si es condenado por la asamblea popular esa tarde, la expulsión queda revocada y nadie muere en esa asamblea.',
      'No puedes defender al mismo cliente dos días consecutivos.'
    ],
    winCondition: 'Salvar a inocentes valiosos de ser linchados injustamente por el pánico de la asamblea.',
    phaseDependence: 'Solo Día (Pacto Presencial con Código)',
    abilityName: 'Amparo de Inocencia',
    abilityDescription: 'Ingresa el código de un cliente de día; si es el más votado en la asamblea, sobrevive a la expulsión.',
    pactRequirement: 'Pacto Presencial: Código Secreto de 4 dígitos de tu cliente'
  },

  'El Testigo Ocular': {
    type: 'El Testigo Ocular',
    family: 'Invitados Distinguidos',
    team: 'Fiesta (Inocentes)',
    badgeColor: 'amber',
    tagline: 'El sabio con mirada penetrante',
    description: 'Tus ojos captan detalles fugaces en la penumbra. Si un Asesino te ataca y te quita la vida durante la noche, antes de exhalar la app te muestra en secreto dos nombres: uno de ellos fue tu asesino directo.',
    rules: [
      'Habilidad pasiva reactiva: Se dispara exclusivamente al morir a manos de un asesino nocturno.',
      'Tu pantalla te revelará 2 nombres de invitados vivos: uno es el asesino real que te acorraló y el otro es un inocente aleatorio.',
      'Como Alma Atormentadora, puedes usar tus susurros de ultratumba para señalar a esos 2 sospechosos.'
    ],
    winCondition: 'Dejar un testimonio clave póstumo para que la fiesta capture a tu verdugo.',
    phaseDependence: 'Reactiva Nocturna (Al ser asesinado)',
    abilityName: 'Testimonio Póstumo',
    abilityDescription: 'Si te asesinan de noche, la app te revela 2 sospechosos: uno de ellos es tu asesino.'
  },

  'El Médico': {
    type: 'El Médico',
    family: 'Invitados Distinguidos',
    team: 'Fiesta (Inocentes)',
    badgeColor: 'emerald',
    tagline: 'Curandero y toxicólogo de emergencia',
    description: 'Llevas viales de antídoto de amplio espectro. Si sospechas que un aliado fue envenenado por el Barman o está bajo efectos nocivos, te acercas, le pides su Código Secreto de 4 dígitos y le administras el antídoto.',
    rules: [
      'PACTO PRESENCIAL: Debes acercarte en persona al paciente y solicitar su código secreto de 4 dígitos.',
      'Cura de inmediato el estado de envenenamiento (`isImpaired`), restaurando la veracidad de sus poderes para la noche.',
      'Puedes suministrar 1 antídoto por ciclo diurno.'
    ],
    winCondition: 'Revertir los sabotajes toxicológicos de las Sombras y devolverle la visión al pueblo.',
    phaseDependence: 'Solo Día (Pacto Presencial con Código)',
    abilityName: 'Antídoto Clínico',
    abilityDescription: 'Ingresa el código presencial de un invitado para purgar el veneno de su organismo.',
    pactRequirement: 'Pacto Presencial: Código Secreto de 4 dígitos del paciente'
  },

  'El Chismoso': {
    type: 'El Chismoso',
    family: 'Invitados Distinguidos',
    team: 'Fiesta (Inocentes)',
    badgeColor: 'amber',
    tagline: 'El oído indiscreto de la fiesta',
    description: 'De día eliges a dos invitados para contrastar rumores sobre ellos. Al caer la noche, recibes un informe confidencial indicando si ambos pertenecen al mismo bando o si son de bandos rivales.',
    rules: [
      'Selecciona a 2 jugadores durante el Día.',
      'En la Noche, el Buzón Nocturno te confirmará: «Mismo Bando» o «Bandos Opuestos».',
      'No sabrás cuál es cuál, pero sabrás si están aliados o enfrentados.'
    ],
    winCondition: 'Descubrir redes de complicidad conectando pares de sospechosos.',
    phaseDependence: 'Acción de Día → Revelación en la Noche',
    abilityName: 'Cotejo de Rumores',
    abilityDescription: 'Compara a 2 jugadores de día para saber en la noche si comparten o no el mismo bando.'
  },

  // ==========================================
  // II. EXCÉNTRICOS Y PROBLEMÁTICOS (FORASTEROS / OUTSIDERS)
  // ==========================================
  'El Borracho Inconsciente': {
    type: 'El Borracho Inconsciente',
    family: 'Excéntricos y Problemáticos',
    team: 'Fiesta (Inocentes)',
    badgeColor: 'orange',
    tagline: 'El investigador intoxicado',
    description: 'Bebiste de más al llegar a la fiesta. Crees con total convicción que posees un rol de información (Fotógrafo, Detective o Chismoso), pero tus resultados nocturnos son desinformación generada por la IA.',
    rules: [
      'Tu pantalla te muestra la credencial y botones de otro rol bueno (crees serlo de verdad).',
      'Tus habilidades parecen ejecutarse normalmente, pero los informes nocturnos que recibes son engañosos o falsos.',
      'Perteneces al bando bueno, pero tus certezas son el mayor peligro de la asamblea.'
    ],
    winCondition: 'Ayudar a la Fiesta dándote cuenta a tiempo de que tus datos están ebrios.',
    phaseDependence: 'Pasiva de Desinformación Permanente',
    abilityName: 'Alucinación Alcohólica',
    abilityDescription: 'Crees tener otro rol, pero tus deducciones nocturnas están intoxicadas.'
  },

  'El Borracho': {
    type: 'El Borracho',
    family: 'Excéntricos y Problemáticos',
    team: 'Fiesta (Inocentes)',
    badgeColor: 'orange',
    tagline: 'Alias de El Borracho Inconsciente',
    description: 'Alias de El Borracho Inconsciente. Cree tener un rol útil pero sus datos son falsos.',
    rules: ['Cree tener otro rol.', 'Genera desinformación involuntaria.'],
    winCondition: 'Victoria del bien.',
    phaseDependence: 'Pasiva',
    abilityName: 'Alucinación Alcohólica',
    abilityDescription: 'Información distorsionada en el buzón nocturno.'
  },

  'El Huésped Paranoico': {
    type: 'El Huésped Paranoico',
    family: 'Excéntricos y Problemáticos',
    team: 'Caos (Independiente)',
    badgeColor: 'yellow',
    tagline: 'El chivo expiatorio voluntario',
    description: 'Estás profundamente convencido de que todos conspiran contra ti. Tu mente retorcida sólo busca el martirio: si logras que la asamblea te vote y te expulse en la primera o segunda reunión, ganas la partida en solitario.',
    rules: [
      'Ganas en solitario ÚNICAMENTE si la asamblea te expulsa por votación en la asamblea 1 o 2.',
      'Actúa de forma titubeante, sospechosa y misteriosa para atraer los votos sin parecer obvio.',
      'Si superas la segunda asamblea sin ser expulsado, pierdes tu condición de victoria en solitario y juegas como inocente.'
    ],
    winCondition: 'Ser expulsado por mayoría de votos en la asamblea de emergencia 1 o 2.',
    phaseDependence: 'Día (Asamblea de Votación)',
    abilityName: 'Auto-Inculpación',
    abilityDescription: 'Provoca que la asamblea te expulse en las primeras 2 reuniones para ganar en solitario.'
  },

  'El Paranoico': {
    type: 'El Paranoico',
    family: 'Excéntricos y Problemáticos',
    team: 'Caos (Independiente)',
    badgeColor: 'yellow',
    tagline: 'Alias de El Huésped Paranoico',
    description: 'Alias de El Huésped Paranoico.',
    rules: ['Gana si es expulsado en la asamblea 1 o 2.'],
    winCondition: 'Expulsión temprana.',
    phaseDependence: 'Asamblea',
    abilityName: 'Auto-Inculpación',
    abilityDescription: 'Gana en solitario si lo expulsan pronto.'
  },

  'El Huésped Sospechoso': {
    type: 'El Huésped Sospechoso',
    family: 'Excéntricos y Problemáticos',
    team: 'Fiesta (Inocentes)',
    badgeColor: 'zinc',
    tagline: 'El falso positivo involuntario (Recluso / Ermitaño)',
    description: 'Eres 100% inocente y apoyas a la Fiesta, pero tus modales retraídos y tu aura te hacen lucir culpable: ante cualquier cámara de Fotógrafo o lupa de Detective, te registrarás falsamente como 🔴 HOSTIL (Sombras).',
    rules: [
      'FALSO POSITIVO PASIVO: Todas las investigaciones mecánicas te detectarán como hostil de las Sombras.',
      'Debes explicar tu rol y coartada con inteligencia humana sin que el pueblo te ejecute por un resultado de cámara.',
      'Si el Asesino te mata, eres una baja inocente normal.'
    ],
    winCondition: 'Sobrevivir al linchamiento y ayudar a la Fiesta a pesar de tu falsa marca hostil.',
    phaseDependence: 'Pasiva permanente (Falso Positivo)',
    abilityName: 'Aura Sospechosa',
    abilityDescription: 'Eres inocente, pero todas las investigaciones mecánicas te marcan como Sombras.',
    falsoPositivo: true
  },

  'El Recluso': {
    type: 'El Recluso',
    family: 'Excéntricos y Problemáticos',
    team: 'Fiesta (Inocentes)',
    badgeColor: 'zinc',
    tagline: 'Alias de El Huésped Sospechoso',
    description: 'Alias de El Huésped Sospechoso (Ermitaño / Falso Positivo).',
    rules: ['Registra falsamente como Sombras.'],
    winCondition: 'Victoria del bien.',
    phaseDependence: 'Pasiva',
    abilityName: 'Aura Sospechosa',
    abilityDescription: 'Falso positivo ante cámaras e investigaciones.',
    falsoPositivo: true
  },

  'El Heredero Maldito': {
    type: 'El Heredero Maldito',
    family: 'Excéntricos y Problemáticos',
    team: 'Fiesta (Inocentes)',
    badgeColor: 'amber',
    tagline: 'El mártir intocable (El Santo)',
    description: 'Tu sangre sostiene la paz de la fiesta. Si la asamblea popular comete el fatal error de votar por tu expulsión en un juicio diurno, ¡LAS SOMBRAS GANAN LA PARTIDA DE INMEDIATO POR TRAGEDIA JUDICIAL!',
    rules: [
      'Eres inocente y quieres que gane la Fiesta.',
      'REGLA DEL MARTIRIO TRÁGICO: Si la asamblea te expulsa por votación popular, el juego termina y ganan las Sombras.',
      'Si sospechan de ti, defiéndete ferozmente y advierte del peligro de un error fatal.'
    ],
    winCondition: 'Evitar a toda costa ser expulsado en la asamblea y apoyar al bando inocente.',
    phaseDependence: 'Pasiva de Asamblea',
    abilityName: 'Mártir Inocente',
    abilityDescription: 'Si el pueblo te vota y expulsa en asamblea, las Sombras ganan la partida al instante.'
  },

  'El Santo': {
    type: 'El Santo',
    family: 'Excéntricos y Problemáticos',
    team: 'Fiesta (Inocentes)',
    badgeColor: 'amber',
    tagline: 'Alias de El Heredero Maldito',
    description: 'Alias de El Heredero Maldito (El Santo).',
    rules: ['Si es expulsado por voto, ganan las Sombras.'],
    winCondition: 'Evitar ejecución popular.',
    phaseDependence: 'Pasiva',
    abilityName: 'Mártir Inocente',
    abilityDescription: 'Victoria inmediata de las Sombras si es votado fuera.'
  },

  // ==========================================
  // III. LOS CÓMPLICES (ESBIRROS / MINIONS)
  // ==========================================
  'El Barman Envenenador': {
    type: 'El Barman Envenenador',
    family: 'Los Cómplices',
    team: 'Sombras (Asesinos)',
    badgeColor: 'rose',
    tagline: 'El químico silencioso del complot',
    description: 'Preparas los cócteles detrás de la barra con sustancias adulteradas. Cada día o noche, seleccionas a un invitado para servirle una bebida envenenada. Sus poderes fallarán en silencio o recibirán datos falsos.',
    rules: [
      'Elige a un invitado en la app para envenenarlo.',
      'El envenenamiento es silencioso: esa persona no ve ningún aviso de error, pero durante esa noche y el día siguiente, su habilidad falla o da información opuesta.',
      'Si envenenas al Escolta, su protección no salvará a nadie. Si envenenas a un Fotógrafo, el revelado mentirá con un 50% de probabilidad.'
    ],
    winCondition: 'Sabotear las investigaciones del pueblo y proteger a los Asesinos Supremos.',
    phaseDependence: 'Acción Diurna o Nocturna (1 dosis por ciclo)',
    abilityName: 'Cóctel Adulterado',
    abilityDescription: 'Envenena en secreto a un jugador; sus poderes fallan o dan datos falsos.'
  },

  'El Hacker Cibernético': {
    type: 'El Hacker Cibernético',
    family: 'Los Cómplices',
    team: 'Sombras (Asesinos)',
    badgeColor: 'red',
    tagline: 'Terrorista informático de bolsillo',
    description: 'Lanzas interferencia electromagnética que bloquea las pantallas de todos los inocentes con glitch y congela la sirena de emergencia durante 3 minutos, dándole vía libre al Asesino.',
    rules: [
      'Una vez por partida (de Noche), activa tu Pulso EMP.',
      'Durante 3 minutos exactos, los inocentes sufrirán un bloqueo glitch en sus celulares que les impide ver misiones o activar habilidades.',
      'La sirena de emergencia queda completamente congelada durante el pulso.'
    ],
    winCondition: 'Crear caos comunicacional para facilitar los asesinatos.',
    phaseDependence: 'Solo Noche (1 pulso EMP)',
    abilityName: 'Pulso de Interferencia (EMP)',
    abilityDescription: 'Bloquea y glitchea los teléfonos de todos los inocentes y congela la sirena por 3 minutos.'
  },

  'El Cómplice / Hacker': {
    type: 'El Cómplice / Hacker',
    family: 'Los Cómplices',
    team: 'Sombras (Asesinos)',
    badgeColor: 'red',
    tagline: 'Alias de El Hacker Cibernético',
    description: 'Alias de El Hacker Cibernético.',
    rules: ['Pulso EMP de 3 minutos.'],
    winCondition: 'Victoria de las Sombras.',
    phaseDependence: 'Noche',
    abilityName: 'Pulso de Interferencia (EMP)',
    abilityDescription: 'Inhibición de pantallas y sirenas.'
  },

  'El Camaleón': {
    type: 'El Camaleón',
    family: 'Los Cómplices',
    team: 'Sombras (Asesinos)',
    badgeColor: 'purple',
    tagline: 'Suplantador de identidades digitales',
    description: 'Manipulas los sistemas de comunicación de la fiesta. Durante la noche, puedes usurpar la voz de un invitado que ya haya sido eliminado y emitir un comunicado oficial en el chat haciéndote pasar por esa alma.',
    rules: [
      'Una vez por partida, durante la Noche, elige el nombre de un jugador fallecido.',
      'Escribe tu mensaje en la app: aparecerá en el chat general como si viniera directamente del fantasma de esa persona.',
      'Siembra pistas falsas, incrimina a inocentes o inventa notas póstumas.'
    ],
    winCondition: 'Desorientar al pueblo con testimonios falsos desde la ultratumba.',
    phaseDependence: 'Solo Noche (1 comunicado)',
    abilityName: 'Suplantación Póstuma',
    abilityDescription: 'Envía un mensaje en el chat general suplantando la identidad de un muerto.'
  },

  'El Lavador de Dinero': {
    type: 'El Lavador de Dinero',
    family: 'Los Cómplices',
    team: 'Sombras (Asesinos)',
    badgeColor: 'rose',
    tagline: 'El financista del crimen organizado',
    description: 'Conoces las identidades de todos los asesinos y financias sus armas. Si un Forastero problemático es eliminado de la fiesta (por asamblea o asesinato), tu red clandestina se activa y ganas un asesinato extra para la noche.',
    rules: [
      'Conoces a los Asesinos Supremos y a tus compañeros Cómplices.',
      'Si un Forastero (Borracho, Santo, Recluso, Paranoico) es eliminado, obtienes una orden de ejecución adicional para la noche siguiente.',
      'Puedes comprar artículos del mercado negro con descuento.'
    ],
    winCondition: 'Asegurar la supremacía de las Sombras financiando el caos y aprovechando la caída de los forasteros.',
    phaseDependence: 'Pasiva Diurna y Nocturna',
    abilityName: 'Contrato de Liquidación',
    abilityDescription: 'Gana un asesinato adicional para la noche si un Forastero es eliminado de la fiesta.'
  },

  'El Abogado de las Sombras': {
    type: 'El Abogado de las Sombras',
    family: 'Los Cómplices',
    team: 'Sombras (Asesinos)',
    badgeColor: 'rose',
    tagline: 'El escudo legal del complot',
    description: 'Manejas coartadas jurídicas y vacíos legales. De día seleccionas a un aliado de las Sombras (o a ti mismo); si la asamblea vota por expulsarlo esa tarde, tu amparo anula la ejecución y sobrevive al juicio.',
    rules: [
      'Durante el Día, selecciona a un aliado en la app.',
      'Si resulta ser el más votado en la asamblea de esa tarde, la expulsión queda anulada y nadie muere en esa asamblea.',
      'No puedes amparar a la misma persona dos días seguidos.'
    ],
    winCondition: 'Impedir que el pueblo expulse a los asesinos y asegurar el dominio de las Sombras.',
    phaseDependence: 'Solo Día (Antes de la Asamblea)',
    abilityName: 'Amparo de Sombras',
    abilityDescription: 'Blinda a un aliado de día; si es el más votado en la asamblea, sobrevive a la expulsión.'
  },

  // ==========================================
  // IV. LAS SOMBRAS SUPREMOS (DEMONIOS / KILLERS)
  // ==========================================
  'El Asesino Líder': {
    type: 'El Asesino Líder',
    family: 'Las Sombras Supremos',
    team: 'Sombras (Asesinos)',
    badgeColor: 'rose',
    tagline: 'El demonio principal del complot (Imp)',
    description: 'Cobras víctimas nocturnas acorralando a tus objetivos a solas, susurrando "¿Qué traes allí?" e ingresando su Código Secreto de 4 dígitos. Si te sientes acorralado por las sospechas, de noche puedes autoinmolarte para transferir el rol de Asesino Líder a uno de tus Cómplices vivos.',
    rules: [
      'PACTO PRESENCIAL OBLIGATORIO: Acorrala a tu víctima a solas (sin testigos a menos de 3 metros), susúrrale "¿Qué traes allí?" y solicita su Código Secreto de 4 dígitos.',
      'Ingresa el código en tu consola de asesinato en la app para confirmar la baja (solo de noche).',
      'TRANSFERENCIA DE PODER (Imp Suicide): Si de noche decides sacrificarte, mueres pero uno de tus Cómplices vivos se convierte automáticamente en el nuevo Asesino Líder.'
    ],
    winCondition: 'Igualar o superar en número a los inocentes vivos en la fiesta.',
    phaseDependence: 'Solo Noche (Consola de Asesinato)',
    abilityName: 'Consola de Asesinato y Metamorfosis',
    abilityDescription: 'Ingresa el código de 4 dígitos de tu víctima de noche. Puedes suicidarte para ceder tu rol a un cómplice.',
    pactRequirement: 'Pacto Presencial: Frase "¿Qué traes allí?" + Código Secreto de 4 dígitos de la víctima'
  },

  'Asesino': {
    type: 'Asesino',
    family: 'Las Sombras Supremos',
    team: 'Sombras (Asesinos)',
    badgeColor: 'rose',
    tagline: 'Alias de El Asesino Líder',
    description: 'Alias de El Asesino Líder.',
    rules: ['Susurra "¿Qué traes allí?" e ingresa el código de 4 dígitos de noche.'],
    winCondition: 'Igualar número de inocentes.',
    phaseDependence: 'Solo Noche',
    abilityName: 'Consola de Asesinato',
    abilityDescription: 'Eliminación nocturna con código de 4 dígitos.',
    pactRequirement: 'Pacto Presencial: Código Secreto de 4 dígitos'
  },

  'El Padrino Silencioso': {
    type: 'El Padrino Silencioso',
    family: 'Las Sombras Supremos',
    team: 'Sombras (Asesinos)',
    badgeColor: 'rose',
    tagline: 'El ejecutor paciente (Po)',
    description: 'Eres un depredador paciente. Si durante una noche entera decides contener tu sed y NO cometer ningún asesinato ("Carga Silenciosa"), en la noche siguiente se desbloquea una ráfaga mortal con la que puedes cobrar hasta 3 víctimas.',
    rules: [
      'Puedes matar normalmente a 1 persona cada noche con el código de 4 dígitos.',
      'CARGA SILENCIOSA: Si pasas una noche entera sin matar, acumulas poder.',
      'En la noche siguiente, tu consola te permite ejecutar hasta 3 códigos de víctimas consecutivas en una sola ráfaga nocturna.'
    ],
    winCondition: 'Diezmar a la fiesta en ráfagas letales impredecibles.',
    phaseDependence: 'Solo Noche (Carga o Ráfaga de 3)',
    abilityName: 'Ráfaga de la Noche Silenciosa',
    abilityDescription: 'Si no matas una noche, la siguiente noche puedes eliminar hasta a 3 víctimas.',
    pactRequirement: 'Pacto Presencial: Código Secreto de 4 dígitos'
  },

  'El Titiritero': {
    type: 'El Titiritero',
    family: 'Las Sombras Supremos',
    team: 'Sombras (Asesinos)',
    badgeColor: 'purple',
    tagline: 'Cerebro corruptor y maestro de la locura (Cerenovus / Fang Gu)',
    description: 'No solo matas, sino que corrompes mentes ajenas. Puedes imponer la "Regla de la Locura" a un invitado forzándolo a convencer a otros de que es otro rol bajo pena de muerte súbita; además, si atacas a un Forastero, lo conviertes en Sombra.',
    rules: [
      'Cada noche puedes elegir matar o infectar la mente de un invitado con la "Regla de la Locura".',
      'MECÁNICA DE LOCURA: El afectado recibe la orden en su teléfono: «Debes convencer a 2 personas de que eres [Rol asignado] pidiéndoles su código social». Si confiesa o rompe personaje, cualquier invitado puede pulsar "Delatar Ruptura de Locura" para ejecutarlo.',
      'CONVERSIÓN DE FORASTERO: Si atacas a un Forastero (Borracho, Santo, Recluso), en vez de morir se transforma en secreto al bando de las Sombras.'
    ],
    winCondition: 'Reclutar a los forasteros y desquiciar al pueblo con manipulación mental.',
    phaseDependence: 'Solo Noche (Asesinato / Infusión de Locura)',
    abilityName: 'Imposición de Locura y Corrupción',
    abilityDescription: 'Obliga a un jugador a fingir un rol específico mediante misión social o corrompe forasteros.',
    pactRequirement: 'Pacto Presencial: Código Secreto de 4 dígitos'
  },

  // ==========================================
  // ULTRATUMBA
  // ==========================================
  'Alma Atormentadora': {
    type: 'Alma Atormentadora',
    family: 'Ultratumba',
    team: 'Caos (Independiente)',
    badgeColor: 'slate',
    tagline: 'Espíritu incorpóreo de la fiesta',
    description: 'Has sido eliminado de los vivos, pero tu presencia espectral sigue flotando en la casa. No puedes hablar durante las asambleas de emergencia, pero tus tareas de ultratumba y susurros nocturnos pueden cambiar el destino de la fiesta.',
    rules: [
      'No puedes votar en asambleas populares.',
      'Recibes tareas espectrales que aportan fichas o alteran la percepción de los vivos.',
      'Puedes enviar susurros crípticos a través del chat nocturno.'
    ],
    winCondition: 'Cumplir tus desafíos espirituales para influir en el desenlace final de la fiesta.',
    phaseDependence: 'Ambos (Más activo de Noche)',
    abilityName: 'Susurro del Más Allá',
    abilityDescription: 'Cumple misiones de ultratumba para desorientar o guiar a los vivos.'
  }
};
