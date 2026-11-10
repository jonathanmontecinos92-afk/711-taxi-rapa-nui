# Integraciones y costos

Estado al 2026-11-09. Presupuesto de automatización: 0 CLP.

| Servicio | Estado | Costo | Nota |
| --- | --- | --- | --- |
| GitHub | Conectado | Gratis | Repositorio público `jonathanmontecinos92-afk/711-taxi-rapa-nui`. |
| Netlify | Sitio `711-taxi-rapa-nui` creado | Gratis | Dirección: https://711-taxi-rapa-nui.netlify.app. Falta enlazarlo al repositorio desde Netlify. |
| Supabase | Cuenta conectada, sin proyecto de 711 | Gratis | Hay 2 proyectos de otros negocios. Confirmar cuántos permite el plan gratuito antes de crear otro. |
| GitHub Actions | Activo | Gratis en repositorio público | En repositorio privado se descuenta del cupo mensual gratuito. |
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

Están activas desde el 2026-11-09. No se guardan claves ni contraseñas en el repositorio.

## Sobre el costo del monitor

La comprobación cada 30 minutos son unas 1.440 ejecuciones al mes. En un repositorio público es gratis. En uno privado puede consumir buena parte del cupo gratuito; en ese caso conviene bajarla a una vez por hora o usar un monitor externo gratuito.
