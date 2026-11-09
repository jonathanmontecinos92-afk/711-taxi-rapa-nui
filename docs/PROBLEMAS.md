# Problemas conocidos

Resultado de la auditoría técnica 1 (2026-11-09).

## Abiertos: se resuelven al construir la versión real

1. Crítico. Las reservas se pierden al recargar la página.
2. Crítico. Pasajero y taxista comparten la misma página.
3. Crítico. El panel de administrador no pide clave.
4. Crítico. No hay reloj del sistema; reasignación y avisos se simulan con un botón.
5. Crítico. No es instalable: faltan manifiesto y servicio en segundo plano.
6. Alto. Solo admite un viaje activo en toda la app.
7. Alto. La reasignación elige al taxista conectado en ese instante y no le pide aceptar.

## Abiertos: menores

- "No llegó" actúa con un toque. Falta definir los minutos de espera.
- Textos sin traducir en inglés y francés: frase de la portada, nombres de lugares y algunos avisos.
- En iPhone la vibración no existe en Safari y el sonido exige un toque previo. Sin probar en un equipo real.
- Código sin uso: portada antigua y tres funciones de versiones previas.
- El QR del hotel depende de una librería externa; no se pudo verificar en el entorno de pruebas.

## Corregidos en la rama fix/auditoria-1

Hora pasada, tarifa aeropuerto a Anakena, origen igual a destino, caleta como destino, fecha en Anakena y tamaño de botones.
