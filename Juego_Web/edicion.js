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

// 3. TABLA DE PREMIOS Y CUPONES DE DESCUENTO
// Ajustá los puntos mínimos y códigos de cupón según tus promociones:
const CONFIG_CUPONES = [
  {
    minScore: 2000,
    badge: '🌟 ¡MÁXIMO PREMIO: 20% OFF + ENTRADA AL SORTEO!',
    codigo: 'MALVINAS-20VIP-1KG',
    descripcion: '¡20% OFF en Heladería Las Malvinas y participás automáticamente por el 1 KG Semanal!'
  },
  {
    minScore: 1500,
    badge: '🎁 ¡CUPÓN GANADO: 15% OFF!',
    codigo: 'MALVINAS-15OFF',
    descripcion: 'Presentá este cupón en el mostrador para obtener un 15% de descuento.'
  },
  {
    minScore: 1000,
    badge: '🎁 ¡CUPÓN GANADO: 10% OFF!',
    codigo: 'MALVINAS-10OFF',
    descripcion: 'Presentá este cupón en el mostrador para obtener un 10% de descuento.'
  },
  {
    minScore: 500,
    badge: '🎁 ¡CUPÓN GANADO: 5% OFF!',
    codigo: 'MALVINAS-5OFF',
    descripcion: 'Presentá este cupón en el mostrador para obtener un 5% de descuento.'
  }
];

// 4. AJUSTES DEL PERSONAJE (ANALÍA)
const CONFIG_JUGADOR = {
  vidasIniciales: 3,
  velocidadMovimiento: 4.8,
  fuerzaSalto: -12.5,
  gravedad: 0.55,
  cooldownDisparo: 18,       // Frecuencia de disparo de bolas de helado
  duracionSuperPoder: 600    // Duración de Súper Modo (en cuadros de juego)
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
  vidaBoss: 3,               // Golpes necesarios para vencer al Boss del Nivel 3
  velocidadSolcito: 1.4,
  velocidadLlama: 2.0
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
  instrucciones: 'Escaneá con la cámara de tu celular y jugá gratis sin descargar nada:',
  promo1: '500 pts ➔ 5% OFF',
  promo2: '1.000 pts ➔ 10% OFF',
  promo3: '1.500 pts ➔ 15% OFF',
  promo4: '2.000 pts ➔ 20% OFF + Sorteo de 1 KG Semanal',
  pie: '📍 Heladería Las Malvinas — La Rioja, Argentina'
};
