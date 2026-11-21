# 🍦 Cómo Modificar el Videojuego: MALVINAS ARCADE — La Aventura del Sabor

Todo el videojuego y el escenario principal se encuentran en el archivo [`index.html`](file:///C:/Users/david/Desktop/Heladeria%20Malvinas/Juego_Web/index.html).  
Está desarrollado en **HTML5 Canvas puro + JavaScript moderno + CSS responsivo**, sin dependencias ni librerías externas pesadas. Funciona inmediatamente al abrirlo en cualquier navegador (Chrome, Edge, Firefox, Safari en PC, tablet o celular).

---

## 🏛️ 1. Estructura del Videojuego: Escenario Principal y Juego

El proyecto cuenta con dos vistas principales conectadas:
1. **Escenario Principal (Lobby / Portal Informativo):**
   - Presentación oficial de la marca: *Heladería Las Malvinas (La Rioja)*.
   - Historia y lore completo del documento oficial: El Freezer Legendario, la explosión de frío provocada por Malvi y la amenaza del *Maestro Heladero Industrial*.
   - Presentación de los protagonistas: **Analía** (Maestra Heladera) y **Malvi** (Mascota oficial).
   - Mapa interactivo de los **3 Mundos de La Rioja** con botones para iniciar cada nivel.
   - Tabla oficial de beneficios comerciales y cupones de descuento (Sección 7 del PDF).
   - Guía visual de controles para PC y Celulares.
2. **Pantalla de Juego (Arcade Canvas):**
   - Canvas interactivo de 960x480 (escalable automáticamente a pantallas de celulares).
   - HUD superior con vidas, cucuruchos, puntaje, nivel y sabor a recuperar.
   - Controles táctiles en pantalla para dispositivos móviles.

Para alternar entre el Lobby y el Juego, los botones de navegación superiores ("🏠 Escenario Principal" y "🎮 Jugar Ahora") cambian de pantalla al instante sin recargar la página.

---

## 🗺️ 2. Los 3 Mundos y el Boss Final

Basado en la propuesta oficial del cliente (`Propuestas_Cliente/Presentacion_Las_Malvinas_Arcade.pdf`):

1. **Nivel 1: Dique Los Sauces & Mostrador Heladero**
   - Paisaje de montañas riojanas y agua cristalina combinado con el emblemático mostrador de mármol Carrara y vitrina de helados.
   - **Sabor Esencial a recuperar:** 🍓 *Frutilla a la Reina*.
2. **Nivel 2: Parque de la Ciudad**
   - Noche estrellada riojana, árboles, farolas y mayor velocidad en las plataformas y obstáculos.
   - **Sabor Esencial a recuperar:** 🍮 *Dulce de Leche Granizado*.
3. **Nivel 3: Microcentro Riojano & Batalla Final**
   - Calles del microcentro, skyline de la ciudad iluminada y la fachada con marquesina de *Heladería Las Malvinas (Casa Central)*.
   - **Jefe Final (Boss):** **Maestro Heladero Industrial** (Robot gris de 3 puntos de vida que patrulla y dispara proyectiles industriales).
   - Al derrotar al robot con los copos de nieve de Malvi, se desbloquea la meta y se recupera el sabor definitivo: 🍫 *Chocolate Malvinas*.

---

## 🎁 3. Tabla Oficial de Premios y Cupones de Descuento

La función `openEndModal(isVictory)` calcula automáticamente el descuento y cupón según el puntaje alcanzado en la partida (siguiendo estrictamente la Sección 7 del PDF):

| Puntaje Final | Descuento Obtenido | Código de Cupón | Beneficio Extra |
| :--- | :---: | :---: | :--- |
| **Menos de 500 pts** | Sin descuento | — | Continuar practicando |
| **500 a 999 pts** | **5% OFF** | `MALVINAS-5OFF` | Cupón digital en mostrador |
| **1.000 a 1.499 pts** | **10% OFF** | `MALVINAS-10OFF` | Cupón digital en mostrador |
| **1.500 a 1.999 pts** | **15% OFF** | `MALVINAS-15OFF` | Cupón digital en mostrador |
| **2.000 o más pts** | **20% OFF** | `MALVINAS-20VIP-1KG` | 🏆 **Participa por el 1 KG de Helado Semanal** |

Si querés cambiar los porcentajes o códigos de cupón, buscalos en la función `openEndModal` dentro de [`index.html`](file:///C:/Users/david/Desktop/Heladeria%20Malvinas/Juego_Web/index.html).

---

## ❄️ 4. Disparo de Copos de Nieve (Poder Malvi)

- **Compañero Malvi:** Malvi flota junto al hombro de Analía con una suave animación oscilante y destellos de escarcha.
- **Controles de disparo:**
  - **Teclado en PC:** Tecla **X**, **Z**, **C**, **F**, **Shift** o **E**.
  - **Celular / Tablet:** Botón táctil celeste **[❄️ TIRO]**.
- **Mecánica:**
  - Los copos de nieve giran con animación fractal de 6 brazos de cristal y núcleo brillante.
  - Al impactar a los Solcitos de 45°C o Llamitas, los congela al instante y otorga **+300 pts**.
  - Al impactar al *Maestro Heladero Industrial* en el Nivel 3, le resta vida (`HP: 2/3`, `HP: 1/3`) hasta vencerlo, otorgando **+1000 pts extra**.
- **Modo Súper 1KG:** Al recoger el pote de 1KG de los bloques sorpresa, Analía y Malvi disparan ráfagas dobles en abanico con escarcha fucsia.

---

## 👤 5. Poses y Sprites de Analía (Animación Desacoplada)

El juego cuenta con un controlador de animación que utiliza sprites individuales de alta definición ubicados en la carpeta [`sprites/`](file:///C:/Users/david/Desktop/Heladeria%20Malvinas/Juego_Web/sprites/):

* [`analia_quieto.png`](file:///C:/Users/david/Desktop/Heladeria%20Malvinas/Juego_Web/sprites/analia_quieto.png): Pose idle de reposo con sutil respiración.
* [`analia_correr_1.png`](file:///C:/Users/david/Desktop/Heladeria%20Malvinas/Juego_Web/sprites/analia_correr_1.png): Paso 1 de carrera.
* [`analia_correr_2.png`](file:///C:/Users/david/Desktop/Heladeria%20Malvinas/Juego_Web/sprites/analia_correr_2.png): Paso 2 de carrera (ciclo dinámico).
* [`analia_salto.png`](file:///C:/Users/david/Desktop/Heladeria%20Malvinas/Juego_Web/sprites/analia_salto.png): Pose acrobática en el aire.
* [`analia_disparo.png`](file:///C:/Users/david/Desktop/Heladeria%20Malvinas/Juego_Web/sprites/analia_disparo.png): Lanzamiento de ráfaga de hielo junto a Malvi.
* [`analia_victoria.png`](file:///C:/Users/david/Desktop/Heladeria%20Malvinas/Juego_Web/sprites/analia_victoria.png): Celebración en la meta con brazos en alto.

Todas las imágenes tienen fondo transparente, proporción exacta y renderizado suavizado en alta calidad (`imageSmoothingQuality = 'high'`). Si querés retocar cualquier pose, podés editar directamente el archivo correspondiente dentro de `sprites/` sin afectar la física del salto ni las colisiones.

---

## 🔐 6. Panel de Dueño / Administrador y Base de Datos de Clientes

- Hacé clic en el botón superior derecho **"🔐 Panel Dueño / Admin"**.
- Características:
  - Registro de participantes: Nombre, Teléfono / Instagram, Puntaje alcanzado, Cupón obtenido y Fecha.
  - Botón **"📥 Descargar Clientes en Excel (.CSV)"**: genera un archivo compatible con Excel para campañas de WhatsApp Marketing y fidelización.
  - Botón **"🔄 Reiniciar Sorteo"**: limpia los registros de la semana para comenzar una nueva edición del concurso.
