# 🍦 Cómo Modificar el Videojuego: MALVINAS ARCADE

El código del proyecto ahora está **completamente separado y modularizado en 3 partes principales**, para que puedas modificar cosas específicas en segundos sin perderte en miles de líneas de código:

---

## 📁 Estructura Modular de Archivos

| Archivo | Qué contiene | ¿Cuándo editarlo? |
| :--- | :--- | :--- |
| **[`edicion.js`](file:///C:/Users/david/Desktop/Heladeria%20Malvinas/Juego_Web/edicion.js)** | **PARTE DE EDICIÓN Y CONFIGURACIÓN** | ✏️ Para cambiar sabores del mostrador, cupones de descuento, puntos, vidas, saltos, textos y nombres de niveles. |
| **[`logica.js`](file:///C:/Users/david/Desktop/Heladeria%20Malvinas/Juego_Web/logica.js)** | **PARTE DE LÓGICA Y MOTOR DE FÍSICAS** | ⚙️ Para modificar físicas, gravedad, enemigos, Jefe Final, disparo de copos de nieve, sintetizador de sonido retro y dibujo en Canvas. |
| **[`juego.js`](file:///C:/Users/david/Desktop/Heladeria%20Malvinas/Juego_Web/juego.js)** | **PARTE DE JUEGO E INTERFAZ** | 🎮 Para ajustar el bucle de juego, la pantalla de carga con Analía, controles de PC y celular, modales de Ranking y aviso de rotación horizontal. |
| **[`styles.css`](file:///C:/Users/david/Desktop/Heladeria%20Malvinas/Juego_Web/styles.css)** | **HOJA DE ESTILOS CSS** | 🎨 Para cambiar colores, fuentes, sombras neón, botones transparentes o animaciones. |
| **[`index.html`](file:///C:/Users/david/Desktop/Heladeria%20Malvinas/Juego_Web/index.html)** | **ESTRUCTURA HTML PRINCIPAL** | 🏛️ Contenedores de pantallas, canvas 16:9, HUD, botones táctiles y modales. |

---

## ✏️ 1. Parte de Edición: ¿Qué podés cambiar en `edicion.js`?

Abrí [`edicion.js`](file:///C:/Users/david/Desktop/Heladeria%20Malvinas/Juego_Web/edicion.js) con cualquier editor de texto o bloc de notas:

### A. Cambiar los Sabores de Helado de la Pizarra
En la constante `CONFIG_SABORES_MOSTRADOR`:
```javascript
const CONFIG_SABORES_MOSTRADOR = [
  'DULCE DE LECHE GRANIZADO',
  'FRUTILLA A LA REINA',
  'CHOCOLATE MALVINAS',
  // ¡Podés agregar los sabores nuevos que quieras acá!
];
```

### B. Cambiar Códigos de Cupones y Descuentos
En la constante `CONFIG_CUPONES`:
```javascript
const CONFIG_CUPONES = [
  { minScore: 2000, badge: '🌟 ¡20% OFF!', codigo: 'MALVINAS-20VIP-1KG', descripcion: '...' },
  { minScore: 1500, badge: '🎁 ¡15% OFF!', codigo: 'MALVINAS-15OFF', descripcion: '...' },
  { minScore: 1000, badge: '🎁 ¡10% OFF!', codigo: 'MALVINAS-10OFF', descripcion: '...' },
  { minScore: 500,  badge: '🎁 ¡5% OFF!',  codigo: 'MALVINAS-5OFF',  descripcion: '...' }
];
```

### C. Cambiar Vidas, Velocidad y Salto de Analía
En `CONFIG_JUGADOR`:
```javascript
const CONFIG_JUGADOR = {
  vidasIniciales: 3,         // Cantidad de vidas
  velocidadMovimiento: 4.8,  // Velocidad al correr
  fuerzaSalto: -12.5,        // Altura del salto
  gravedad: 0.55             // Gravedad
};
```

### D. Cambiar Puntos por Acción
En `CONFIG_PUNTOS`:
```javascript
const CONFIG_PUNTOS = {
  cucurucho: 50,        // Puntos por agarrar un cono
  congelarEnemigo: 300, // Puntos por congelar un Solcito/Llamita
  superPote1KG: 500,    // Puntos por el pote súper de 1KG
  vencerBoss: 1000      // Puntos por derrotar al Robot en el Nivel 3
};
```

### E. Música Retro Chiptune (BGM)
En `CONFIG_MUSICA`:
```javascript
const CONFIG_MUSICA = {
  tempoNormal: 140,    // Ritmo normal de la melodía en BPM
  tempoSuperModo: 185, // Ritmo acelerado durante el Súper Modo 1KG
  volumenMelodia: 0.035,
  volumenBajo: 0.045
};
```

### F. Cartel QR Imprimible para Mesas
En `CONFIG_CARTEL_QR`:
```javascript
const CONFIG_CARTEL_QR = {
  titulo: '¡JUGÁ MIENTRAS DISFRUTÁS TU HELADO!',
  subtitulo: 'Escaneá con la cámara de tu celular y ganá descuentos en tu compra:',
  ubicacion: '📍 Heladería Las Malvinas — La Rioja, Argentina'
};
```

---

## 🕹️ 2. Pantalla de Carga Retro (Limpia y Auténtica)

- La pantalla de carga previa fue depurada: se eliminaron todos los textos y tags que se veían artificiales o tipo IA.
- Ahora muestra una estética arcade clásica y directa:
  - **MALVINAS ARCADE — NIVEL 1**
  - **Analía** alternando sus 6 poses sobre su plataforma iluminada.
  - Barra de carga retro y el texto clásico intermitente **`NOW LOADING...`**.

---

## 📱 3. Celular en Modo Horizontal Obligatorio

- Al entrar desde un móvil, el juego detecta la orientación.
- Si está en vertical, muestra el aviso retro **`¡GIRÁ TU CELULAR!`** invitando a rotarlo para disfrutar de la pantalla panorámica 16:9 y los botones a los lados.
- Apenas el usuario gira el teléfono, el aviso desaparece al instante y la partida queda lista para jugar.

---

## 🎮 4. Navegación Arcade por Teclado en la Pantalla de Inicio

- **Flechas [▲ / ▼] o [W / S]:** Moverse entre **JUGAR**, **OPCIONES**, **SALÓN DE LA FAMA** y **CARTEL MESAS**.
- **Flechas [◀ / ▶] o [A / D]:** Saltar entre las opciones principales de la izquierda y los botones rápidos de la barra superior.
- **[ENTER] o [ESPACIO]:** Abrir o activar la opción seleccionada (con sonido retro).
- **[ESCAPE]:** Cerrar cualquier modal abierto (Opciones, Ranking, Cartel QR) y volver de inmediato al inicio.
- **Cursor de Cucurucho (`🍦 ▶`):** Apunta y flota dinámicamente sobre la opción activa mientras la barra inferior muestra su descripción en tiempo real.
