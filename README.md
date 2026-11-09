# 711 Taxi Rapa Nui

Prototipo de la central digital de taxis de Rapa Nui. Hoy es una sola página (`index.html`) con datos de ejemplo: no guarda reservas ni conecta teléfonos distintos.

## Uso

- Ver la app: abrir `index.html` en el navegador.
- Probar: `npm ci`, `npx playwright install chromium`, `npm test`.
- Probar un sitio publicado: `BASE_URL=https://... npm test`.

## Ramas

- `main`: versión publicada. Protegida; solo cambia por Pull Request con pruebas en verde.
- `develop`: integración.
- `fix/...`: una rama por reparación.

## Documentación

Todo está en `docs/`: arquitectura, reglas del negocio, problemas, integraciones y costos, y plan. El historial de cambios está en `CHANGELOG.md`.
