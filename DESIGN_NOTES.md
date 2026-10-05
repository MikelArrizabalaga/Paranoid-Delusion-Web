# Acabado de The Next Stop

## Dirección

Estación nocturna, arte original y lectura clara. Se conserva el recorrido con
cuatro puntos y el desplazamiento libre. El acento rosa ceniza orienta los controles;
el color del arte sostiene el tono del juego.

## Referencias consultadas

- https://www.playdead.com/games/inside/ — protagonismo del juego y acceso directo a su contenido.
- https://playdead.com/ — presentación breve del estudio y navegación contenida.
- https://www.alanwake.com/alan-wake-2/ — relación entre imagen, tráiler y acceso a la tienda.

Son referencias de jerarquía y contenido, no plantillas de composición.

## Decisiones

- CSS único con tokens y reglas por componente, sin cadenas de overrides.
- Noticias con alturas dictadas por el texto, cartel destacado completo y fechas legibles.
- Cuatro secciones reales; se elimina la sección duplicada oculta.
- Equipo presentado con los nombres y roles existentes, sin biografías inventadas.
- Enlaces del recorrido con puntos integrados: cada marcador y su texto comparten una acción.
- Animación sutil al entrar y salir, desactivada con prefers-reduced-motion.
- Vídeo sin precarga ni autoplay, pausado al abandonar su área visible.
- Imágenes optimizadas y dimensiones explícitas conservadas.

## Comprobación visual pendiente

El navegador de esta sesión ha denegado la inspección de 127.0.0.1:4173 mediante
una preferencia guardada. Revisar escritorio y móvil cuando se habilite el acceso.
Las comprobaciones estáticas no sustituyen esa inspección.

## Comprobaciones realizadas

- Sintaxis de JavaScript y diferencias de Git sin errores.
- IDs únicos, destinos de enlaces válidos y archivos locales presentes.
- Todas las imágenes incluyen dimensiones y texto alternativo.
- Simulación local de navegación: posiciones de secciones largas, estado activo,
  puntos, enlaces, movimiento reducido y ausencia de manejadores de rueda.
- Simulación local del servidor: GET, HEAD, rangos de vídeo y peticiones inválidas.
