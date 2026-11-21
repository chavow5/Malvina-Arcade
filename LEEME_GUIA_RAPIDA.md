# 🍦 Heladería Malvinas — MALVINAS ARCADE: La Aventura del Sabor

¡Bienvenido! Esta carpeta contiene todo el desarrollo del videojuego oficial **MALVINAS ARCADE — La Aventura del Sabor**, junto a su Escenario Principal interactivo, propuestas comerciales y documentación estratégica para el cliente **Heladería Las Malvinas** (La Rioja, Argentina).

---

## 🌟 Novedades de la Versión Oficial (Real)

1. **🏛️ Escenario Principal (Lobby & Portal del Juego):**
   - Página principal que explica la historia, la misión del verano, los personajes (**Analía** y **Malvi**), los **3 Mundos de La Rioja**, la tabla de beneficios comerciales y los controles de juego.
   - Navegación instantánea entre el Lobby y el Juego mediante botones directos.
2. **👩‍🍳 Personaje Principal en Alta Definición:**
   - **Analía — Maestra Heladera**, renderizada con máxima nitidez y suavizado (`imageSmoothingQuality = 'high'`), vestida con el uniforme real de Heladería Las Malvinas.
   - **Malvi — Mascota Oficial**, flotando a su lado con animación de oscilación y aura de frío.
3. **🗺️ Los 3 Mundos del Documento Oficial:**
   - **Nivel 1:** *Dique Los Sauces & Mostrador Heladero* (Sabor 1: Frutilla a la Reina).
   - **Nivel 2:** *Parque de la Ciudad* (Sabor 2: Dulce de Leche Granizado).
   - **Nivel 3:** *Microcentro Riojano & Batalla Final* (Sabor 3: Chocolate Malvinas).
4. **🤖 Jefe Final (Boss Fight):**
   - **Maestro Heladero Industrial**, un robot gigante que patrulla y dispara químicos industriales, a quien Analía y Malvi deben derrotar con copos de nieve para desbloquear la victoria.
5. **❄️ Poder Malvi (Copos de Nieve Funcionales):**
   - Disparo continuo con teclas `X`, `Z`, `C`, `F`, `Shift`, `E` en PC o botón táctil celeste en celulares para congelar Solcitos a 45°C y vencer al robot industrial.
6. **🎁 Sistema de Cupones Comerciales (Sección 7 del PDF):**
   - Menos de 500 pts: Sin descuento.
   - 500 a 999 pts: **5% OFF** (`MALVINAS-5OFF`).
   - 1.000 a 1.499 pts: **10% OFF** (`MALVINAS-10OFF`).
   - 1.500 a 1.999 pts: **15% OFF** (`MALVINAS-15OFF`).
   - 2.000+ pts: **20% OFF** (`MALVINAS-20VIP-1KG`) + **Participa en el Sorteo Semanal de 1 KG de Helado**.

---

## 📁 Mapa de Carpetas y Contenido

```
Heladeria Malvinas/
│
├── 📁 Juego_Web/                  -> Código fuente del juego y portal interactivo
│   ├── index.html                    -> Escenario Principal + Juego de 3 Niveles con Boss
│   ├── 📁 sprites/                   -> Poses de Analía (quieto, correr 1 y 2, salto, disparo, victoria)
│   ├── personaje_heladera_malvinas.png -> Sprite oficial HD de Analía (Maestra Heladera)
│   ├── logo_heladeria_malvinas.png   -> Logo oficial fucsia "Las Malvinas"
│   ├── referencia_interior_local_malvinas.jpg -> Foto arquitectónica de referencia del local
│   └── COMO_MODIFICAR_EL_JUEGO.md    -> Guía para ajustar mundos, cupones y parámetros
│
├── 📁 Propuestas_Cliente/         -> Páginas interactivas y PDF para presentar al cliente
│   ├── 01_Propuesta_Visual_Cliente.html -> Propuesta comercial interactiva (editable y para PDF)
│   ├── 02_Detalle_Presupuesto_Plan_4Meses.html -> Plan evolutivo a 4 meses ($180.000 ARS/mes)
│   ├── Presentacion_Las_Malvinas_Arcade.pdf -> Documento PDF de presentación original (16 págs)
│   └── COMO_EDITAR_LAS_PROPUESTAS.md -> Cómo cambiar precios en vivo y generar PDF
│
├── 📁 Documentacion_y_Estrategia/ -> Planes comerciales, análisis de costos y WhatsApp
│   ├── 01_Plan_y_Presupuesto_Completo.md -> Comparativa Llave en mano vs Plan 4 meses
│   ├── 02_Detalle_Presupuesto_Plan_4Meses.md -> Desglose técnico (Hosting y base de datos $0)
│   └── 03_Historial_y_Plantilla_WhatsApp.md -> Registro del proyecto + Mensaje para el cliente
│
└── 📁 Disenos_y_Personajes/       -> Sprites, diseños conceptuales y fotos de referencia
    ├── 📁 sprites_analia/            -> Poses individuales en alta resolución recortadas
    ├── personaje_heladera_malvinas.png -> Sprite recortado con fondo transparente (577x880)
    ├── logo_heladeria_malvinas.png   -> Logo oficial fucsia "Las Malvinas"
    ├── diseno_personaje_maestra_heladera.jpg -> Ilustración de la Maestra Heladera
    ├── foto_referencia_original.jpg  -> Foto del heladero real en el local
    └── COMO_CAMBIAR_PERSONAJES.md    -> Instrucciones para reemplazar o sumar nuevos sprites
```

---

## 🚀 Cómo Probar el Videojuego

1. Hacé doble clic en [`Juego_Web/index.html`](file:///C:/Users/david/Desktop/Heladeria%20Malvinas/Juego_Web/index.html).
2. Se abrirá directamente en el **Escenario Principal**:
   - Podés explorar la historia del Freezer Legendario y el Maestro Industrial.
   - Conocer a Analía y Malvi.
   - Ver los 3 Mundos y elegir con cuál nivel comenzar.
   - Revisar la tabla de premios y los controles.
3. Hacé clic en **"¡COMENZAR LA AVENTURA!"** o en **"▶ Jugar Nivel 1"** para entrar a jugar.
4. En cualquier momento podés volver al Escenario Principal con el botón **"🏠 Escenario Principal"**.
