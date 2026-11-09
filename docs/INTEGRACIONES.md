# Integraciones y costos

Estado al 2026-11-09. Presupuesto de automatización: 0 CLP.

| Servicio | Estado | Costo | Nota |
| --- | --- | --- | --- |
| GitHub | Sin conectar | Gratis | No hay repositorios accesibles. Falta que Jonathan conecte su cuenta. |
| Netlify | Cuenta conectada, sin sitio de 711 | Gratis | Hay 9 sitios de otros proyectos. |
| Supabase | Cuenta conectada, sin proyecto de 711 | Gratis | Hay 2 proyectos de otros negocios. Confirmar cuántos permite el plan gratuito antes de crear otro. |
| GitHub Actions | Preparado, sin activar | Gratis en repositorio público | En repositorio privado se descuenta del cupo mensual gratuito. |
| Monitor de disponibilidad | Preparado (`monitor.yml`) | Gratis | Necesita la variable `SITE_URL`. |
| Notificaciones al pasajero | Sin construir | Gratis | Notificaciones del teléfono. |
| WhatsApp automático | Descartado por ahora | De pago | Requiere aprobación. |

## Automatizaciones preparadas

| Archivo | Frecuencia | Qué hace |
| --- | --- | --- |
| `pruebas.yml` | En cada cambio | Corre las 25 pruebas |
| `monitor.yml` | Cada 30 minutos | Comprueba que la app responda y abre una incidencia si falla |
| `diario.yml` | Diaria | Pruebas completas y vulnerabilidades conocidas |
| `semanal.yml` | Semanal | Velocidad y accesibilidad con Lighthouse |
| `dependabot.yml` | Semanal | Propone actualizaciones de dependencias |

Ninguna está activa todavía: se activan al subir el repositorio a GitHub. No se guardan claves ni contraseñas en el repositorio.

## Sobre el costo del monitor

La comprobación cada 30 minutos son unas 1.440 ejecuciones al mes. En un repositorio público es gratis. En uno privado puede consumir buena parte del cupo gratuito; en ese caso conviene bajarla a una vez por hora o usar un monitor externo gratuito.
