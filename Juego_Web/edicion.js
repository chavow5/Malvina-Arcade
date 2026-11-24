/**
 * ==============================================================
 * 🍦 MALVINAS ARCADE — PARTE DE EDICIÓN Y CONFIGURACIÓN (edicion.js)
 * ==============================================================
 * Este archivo fue diseñado para que puedas cambiar cosas específicas
 * fácilmente sin tener que tocar la lógica ni el código del juego.
 *
 * Podés modificar:
 * 1. Sabores del mostrador de helados
 * 2. Cupones de descuento y premios
 * 3. Nombres de los niveles y mundos
 * 4. Vidas, salto y velocidad del jugador
 * 5. Puntos por cucurucho o enemigo
 * 6. Vida del jefe final (Boss)
 * ==============================================================
 */

// 1. PIZARRA DE SABORES DE LA HELADERÍA (Se muestran en el Nivel 1)
// Cambiá o agregá los sabores que vende Heladería Las Malvinas:
const CONFIG_SABORES_MOSTRADOR = [
  'DULCE DE LECHE GRANIZADO',
  'FRUTILLA A LA REINA',
  'CHOCOLATE MALVINAS',
  'VAINILLA',
  'LIMÓN AL AGUA',
  'TRAMONTANA ESPECIAL',
  'MENTA GRANIZADA',
  'CREMA AMERICANA',
  'BANANA SPLIT',
  'SAMBAYÓN ARTESANAL',
  'SÚPER DULCE DE LECHE',
  'CEREZA A LA CREMA',
  'MARACUYÁ AL AGUA',
  'FRUTOS DEL BOSQUE',
  'CHOCOLATE BLANCO',
  'FLAN CASERO'
];

// 2. CONFIGURACIÓN DE LOS 3 NIVELES
const CONFIG_NIVELES = {
  1: {
    numero: 1,
    titulo: 'NIVEL 1',
    nombreMundo: 'Dique Los Sauces & Mostrador',
    saborRecuperar: 'Frutilla a la Reina',
    icono: '🍓'
  },
  2: {
    numero: 2,
    titulo: 'NIVEL 2',
    nombreMundo: 'Parque de la Ciudad & Costanera',
    saborRecuperar: 'Dulce de Leche Granizado',
    icono: '🍮'
  },
  3: {
    numero: 3,
    titulo: 'NIVEL 3',
    nombreMundo: 'Microcentro & Batalla Final',
    saborRecuperar: 'Chocolate Malvinas',
    icono: '🍫'
  }
};

// 3. MENSAJE DE FIN DE PARTIDA (CARGA DE PUNTOS SEMANALES)
const CONFIG_MENSAJE_FIN_PARTIDA = {
  titulo: '🏆 ¡CARGÁ TUS PUNTOS SEMANALES!',
  descripcion: 'Podés cargar tus puntos de la semana para participar y ganar increíbles premios solo por jugar.'
};

// 4. AJUSTES DEL PERSONAJE (ANALÍA)
const CONFIG_JUGADOR = {
  vidasIniciales: 3,
  velocidadMovimiento: 4.0,
  fuerzaSalto: -10.8,
  gravedad: 0.48,
  cooldownDisparo: 12,       // Pausa mínima en modo normal (1 copo por vez, más ágil)
  duracionSuperPoder: 360,   // Duración corta de Súper Modo 1KG (~6 segundos a 60 FPS)
  tirosSuperPoder: 4         // Máximo de ráfagas locas permitidas por cada Pote de 1KG
};

// 5. PUNTOS POR ACCIÓN
const CONFIG_PUNTOS = {
  cucurucho: 50,             // Puntos por agarrar un cono
  congelarEnemigo: 300,      // Puntos por congelar con Malvi a un Solcito/Llamita
  superPote1KG: 500,         // Puntos al agarrar el pote legendario de 1KG
  vencerBoss: 1000           // Puntos por derrotar al Maestro Industrial
};

// 6. ENEMIGOS Y JEFE FINAL
const CONFIG_ENEMIGOS = {
  vidaEnemigo: 3,            // Golpes de copos de nieve necesarios para congelar a cada Solcito/Llamita
  vidaBoss: 12,              // Vida del Jefe Final del Nivel 3 (cabeza: -2/-3, costados blindados: mínimo daño)
  velocidadSolcito: 1.1,
  velocidadLlama: 1.5
};

// 7. RANKING POR DEFECTO
const CONFIG_RANKING = {
  claveStorage: 'malvinas_ranking_v1',
  inicialesPorDefecto: [
    { name: 'Sofi_LR', contact: '@sofi.larioja', score: 2850, verified: true },
    { name: 'Mateo_Helados', contact: '3804-123456', score: 2420, verified: true },
    { name: 'Lucia_Malvi', contact: '@lucia.rioja', score: 1980, verified: false },
    { name: 'Tomi_Arcade', contact: '3804-987654', score: 1650, verified: false },
    { name: 'Gaby_Dique', contact: '@gaby_dique', score: 1200, verified: false }
  ]
};

// 8. TEXTOS DE ORIENTACIÓN Y EXPERIENCIA MOBILE
const CONFIG_TEXTOS = {
  tituloJuego: 'MALVINAS ARCADE',
  avisoGirarCelular: '¡GIRÁ TU CELULAR!',
  mensajeGirar: 'Para tener una mejor experiencia de juego, jugá en modo horizontal.',
  submensajeGirar: 'Disfrutá la pantalla completa panorámica y los controles arcade a los lados.',
  toastHorizontal: '📱 Para una mejor experiencia de juego, jugá en <strong>modo horizontal</strong>.'
};

// 9. CONFIGURACIÓN DE MÚSICA CHIPTUNE RETRO (8-bit)
const CONFIG_MUSICA = {
  activaPorDefecto: true,
  volumenMelodia: 0.04,
  volumenBajo: 0.05,
  tempoNormal: 140,          // BPM de la música de fondo
  tempoSuperModo: 185        // BPM acelerado cuando agarrás el Pote de 1KG
};

// 10. CONFIGURACIÓN DEL CARTEL IMPRIMIBLE CON QR PARA MESAS
const CONFIG_CARTEL_QR = {
  titulo: 'HELADERÍA LAS MALVINAS',
  subtitulo: '¡JUGÁ MIENTRAS DISFRUTÁS TU HELADO!',
  instrucciones: 'Escaneá con la cámara de tu celular, jugá y cargá tus puntos semanales:',
  promo1: '🎮 Jugá gratis desde tu celular',
  promo2: '📊 Cargá tus puntos en el ranking semanal',
  promo3: '🏆 ¡Ganá increíbles premios solo por jugar!',
  pie: '📍 Heladería Las Malvinas — La Rioja, Argentina'
};
