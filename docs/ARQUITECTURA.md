# Arquitectura

## Hoy

- `index.html`: toda la app (HTML, CSS y JavaScript sin compilación). Estado en memoria; se pierde al recargar.
- `hero-711.jpg`: imagen de portada. Incluye el logo dentro de la foto; falta el logo en archivo aparte.
- Librerías externas: tipografías de Google Fonts y `qrcode-generator` 1.4.4 desde cdnjs (solo para el QR del hotel).
- Almacenamiento en el teléfono: idioma y perfil del pasajero (`localStorage`).
- Zona horaria: todas las fechas se calculan en `Pacific/Easter`.

## Lo que falta para ser una app real

1. Base de datos con acceso por rol (pasajero, taxista, hotel, administrador).
2. Tiempo real entre teléfonos distintos.
3. Acceso protegido para taxistas y administrador.
4. Reloj del servidor para reasignar reservas y enviar avisos.
5. Manifiesto y servicio en segundo plano para instalarla y recibir notificaciones.

Tecnología prevista: React con TypeScript, Supabase y Netlify, todos en plan gratuito al inicio.
