# Plan Comercial, Presupuesto y Arquitectura: Juego Web Estilo Mario Bros — Heladería Malvinas (La Rioja)

## 1. Resumen del Proyecto y Nivel de Dificultad

El objetivo para **Heladería Malvinas** es desarrollar un **Advergame (juego promocional web)** estilo *Super Mario Bros* de **1 a 2 niveles**, con **personajes y elementos personalizados de la heladería** (cucuruchos, potes de 1 kg, enemigos como el "Calor Riojano de 45°C") y un **sistema de Ranking (Leaderboard)** para realizar promociones, sorteos semanales/mensuales de helado y entrega de cupones.

### ¿Qué tan difícil es hacerlo para la web?
Con tecnologías web HTML5/Canvas y apoyo de IA para código y sprites, la **dificultad es Baja-Media** y se puede entregar la primera versión lista para salir en redes en **10 a 15 días hábiles**:

| Componente | Dificultad | Tiempo Estimado | Cómo se resuelve |
| :--- | :--- | :--- | :--- |
| **Motor del Juego y Físicas (Salto, bloques `?`, enemigos, cucuruchos)** | 🟢 Baja | 8 a 12 hs | HTML5 Canvas / Phaser 3 / Kaplay.js. Físicas de plataformas 2D estilo Mario. |
| **Controles Web y Celular (Touch + Teclado)** | 🟢 Baja | 4 a 6 hs | Botones táctiles en pantalla (izquierda, derecha, salto) + teclado en PC. **Clave porque el 85%+ entrará desde historias de Instagram o WhatsApp en su celular.** |
| **Arte y Sprites (Personaje personalizado, helados, local)** | 🟡 Media | 10 a 16 hs | Generación con IA de *spritesheets* 2D + edición gráfica o reemplazo directo de imagen PNG. |
| **Ranking Promocional, Registro de Clientes y Panel Admin** | 🟡 Media | 6 a 10 hs | **Firebase (Firestore)** o **Supabase** (capa gratuita). Formulario al terminar la partida (*Nombre + Instagram/WhatsApp*), tabla Top 10 y exportación a Excel. |
| **Total Estimado (MVP 1-2 Niveles + Ranking)** | **Baja-Media** | **~30 a 45 horas** | **(Aprox. 10 a 15 días hábiles de entrega)** |

---

## 2. Presupuesto Sugerido para La Rioja, Argentina (ARS y Referencia USD)

Aquí tienes dos escalas pensadas para el mercado de **La Rioja**:
* **Escala A (Comercio / Pyme Local):** Ideal si Heladería Malvinas es un comercio local o familiar y quieres presentar un número muy competitivo para cerrar rápido.
* **Escala B (Empresa Mediana / Cadena con varias sucursales):** Ideal si tienen varias sucursales o presupuesto de marketing más amplio.

| Modalidad / Plan | Escala A: Comercio Local (La Rioja) | Escala B: Cadena / Empresa Mediana | Qué incluye principalmente |
| :--- | :--- | :--- | :--- |
| **Opción 1: Proyecto Completo (Entrega Llave en Mano)** | **$450.000 a $650.000 ARS**<br>*(~350 - 500 USD)* | **$850.000 a $1.200.000 ARS**<br>*(~650 - 950 USD)* | Juego completo (1-2 niveles), personaje personalizado, controles celular/PC, Ranking activo, panel de ganadores y entrega del proyecto. |
| **Opción 2: Plan Evolutivo a 4 Meses (Desarrollo + Escalado)** | **$160.000 a $220.000 ARS / mes**<br>*(x 4 meses = $640k - $880k ARS)* | **$280.000 a $380.000 ARS / mes**<br>*(x 4 meses = $1.12M - $1.52M ARS)* | Salida rápida en el Mes 1 (Nivel 1 + Ranking) y agregado mensual de niveles, nuevos sabores/poderes, campañas por fechas especiales y soporte incluido. |
| **Opción 3: Plan de Mantención Mensual (Post-Entrega)** | **$45.000 a $70.000 ARS / mes**<br>*(~35 - 55 USD / mes)* | **$80.000 a $120.000 ARS / mes**<br>*(~65 - 95 USD / mes)* | Hosting web, base de datos del Ranking, reinicio de sorteos semanales/mensuales, descarga de base de contactos (WhatsApp/Instagram) y cambios de premios. |

---

## 3. Detalle de los 3 Planes Comerciales para Heladería Malvinas

### Plan 1: "Proyecto Llave en Mano" (Pago Único)
Ideal si el dueño prefiere pagar el proyecto una sola vez y tener el juego terminado.
* **Forma de pago:** 50% de anticipo al iniciar y 50% al entregar el juego funcionando online.
* **Incluye:**
  * 1 o 2 niveles estilo Mario Bros ambientados en **Heladería Malvinas**.
  * 1 personaje principal personalizado + ítems recolectables (cucuruchos, bochas, potes de 1 kg).
  * Funciona desde cualquier celular (sin descargar apps, directo desde un link en Instagram o código QR en el mostrador de la heladería) y en PC.
  * **Sistema de Ranking Top 10** en vivo + captura de datos (*Nombre + WhatsApp/Instagram*) para sorteos.
  * **30 días de hosting y soporte incluidos** para la campaña de lanzamiento (luego puede activar el Plan de Mantención los meses que haga sorteos).

### Plan 2: "Plan Evolutivo 4 Meses — Temporada Heladería Malvinas" (Recomendado)
Ideal para que la heladería invierta un monto mensual más bajo y tenga una campaña de marketing distinta cada mes durante 4 meses:
* **Mes 1 (Lanzamiento + 1° Sorteo en Redes):** Publicación del Nivel 1, personaje principal, controles móviles, código QR para poner en las mesas/mostrador del local y Ranking activo para el primer sorteo de 1 Kg de helado.
* **Mes 2 (Nuevo Nivel + Nuevos Obstáculos):** Se suma el Nivel 2 con más dificultad, nuevos enemigos ("El Calor Riojano") y reinicio del Ranking para la segunda campaña mensual.
* **Mes 3 (Sistema de Cupones Automáticos + Power-Ups):** Se agregan poderes especiales con productos de la heladería y generación automática de un cupón en pantalla (ej. *10% OFF o 2x1 en cucuruchos*) al superar determinado puntaje.
* **Mes 4 (Edición Fecha Especial + Entrega de Base de Clientes):** Nivel o temática especial (Verano / Aniversario / Día del Helado), entrega de toda la base de datos de clientes en Excel para mandarles promos por WhatsApp, y opción de seguir solo con mantención.

### Plan 3: "Plan de Mantención y Gestión de Sorteos" (Mensual)
Se aplica una vez terminado el Plan 1 o al finalizar los 4 meses del Plan 2:
* Mantiene el juego y la base de datos del Ranking online 24/7.
* Reinicio de la tabla de posiciones cada semana o cada mes para nuevos sorteos.
* Entrega de la lista de participantes y ganadores verificados (sin puntajes con trampa).
* Actualización de banners o textos de premios dentro del juego.

---

## 4. Consejos Clave para Negociar con el Cliente en La Rioja

1. **Llevá la Demo en el celular y en la notebook:** Mostrarle el juego funcionando con el nombre **"Heladería Malvinas"** cambia por completo la reunión. Cuando vea los cucuruchos, el ranking con nombres y el panel para descargar los WhatsApp de los clientes, va a entender inmediatamente cómo le sirve para vender más helado.
2. **Vendé el beneficio comercial (Marketing + Base de Contactos):** No es solo "un jueguito"; es una máquina de conseguir seguidores en Instagram y números de WhatsApp de clientes de La Rioja que quieren ganarse 1 Kg de helado, además de un código QR para que la gente juegue mientras espera su pedido en el local.
3. **Cláusula de ajuste si elige los 4 meses:** Si pactas el Plan de 4 Meses en Pesos Argentinos, puedes ofrecerle precio fijo los primeros 2 meses y actualización en el mes 3, o dejar la referencia en USD.
