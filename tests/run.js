// Pruebas de 711 Taxi Rapa Nui. Usan solo datos ficticios y no envían nada a nadie.
// Uso: npm test            -> prueba el index.html local
//      BASE_URL=https://... npm test -> prueba un sitio publicado (solo lectura y datos en memoria)
const { chromium } = require('playwright');
const path = require('path');

const BASE = process.env.BASE_URL || 'file://' + path.resolve(__dirname, '..', 'index.html');
const W = ms => new Promise(r => setTimeout(r, ms));
const rapaNuiDay = off => new Date(Date.now() + off * 864e5).toLocaleDateString('en-CA', { timeZone: 'Pacific/Easter' });
const tests = [];
const test = (name, fn, opts = {}) => tests.push({ name, fn, opts });
const assert = (cond, msg) => { if (!cond) throw new Error(msg || 'condición falsa'); };

// --- utilidades de página ---
const text = async (p, sel) => ((await p.textContent(sel)) || '').trim();
const submit = (p, form) => p.click(`${form} button[type=submit]`);
async function abrirReserva(p, tipo) {
  await p.click('#p-res');
  if (tipo) await p.click(`[data-type="${tipo}"]`);
}
async function reservarAeropuerto(p, { nombre = 'Pasajera Ficticia', hora = '14:30', vuelo = '', alojamiento = 'Hostal Ficticio', pax = '2', fecha } = {}) {
  await abrirReserva(p, 'airport');
  await p.fill('#r-name', nombre);
  await p.fill('#r-pax', pax);
  await p.fill('#r-time', hora);
  await p.fill('#r-flight', vuelo);
  await p.fill('#r-lodging', alojamiento);
  if (fecha) await p.fill('#r-date', fecha);
  await submit(p, '#r-form');
  await W(150);
}
async function taxistaTomaPrimera(p) {
  await p.click('#ag');
  await p.click('[data-take]');
  await W(150);
}

// --- portada ---
test('Portada carga, sin desplazamiento horizontal y con imagen', async p => {
  assert(await p.isVisible('#p-now') && await p.isVisible('#p-res'), 'faltan los botones principales');
  assert(await p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), 'hay desplazamiento horizontal');
  assert(await p.evaluate(() => { const i = document.querySelector('.hero img'); return i && i.naturalWidth > 0; }), 'la imagen de portada no cargó');
}, { iphone: true });

test('Idioma cambia y se recuerda al recargar', async p => {
  await p.click('[data-lang="en"]');
  assert((await text(p, '#p-now')).includes('Request a Taxi Now'), 'no cambió a inglés');
  await p.reload(); await W(300);
  assert((await text(p, '#p-now')).includes('Request a Taxi Now'), 'no recordó el idioma');
});

test('Botones táctiles principales miden al menos 44 px de alto', async p => {
  const h = await p.evaluate(() => ['.hero .langs button', '.tabs button', '.pnav button', '.hbtn'].map(s => [s, Math.round(document.querySelector(s).getBoundingClientRect().height)]));
  const chicos = h.filter(x => x[1] < 44);
  assert(chicos.length === 0, 'bajo 44 px: ' + JSON.stringify(chicos));
}, { iphone: true });

// --- tarifas (condiciones comerciales conocidas) ---
test('Anakena ida y vuelta mantiene $35.000', async p => {
  await p.click('#p-now');
  await p.selectOption('#n-from', 'Hotel en Hanga Roa'); await p.selectOption('#n-to', 'Anakena');
  assert((await text(p, '#n-price')).includes('35.000'), 'precio: ' + await text(p, '#n-price'));
  await p.click('#n-back'); await abrirReserva(p, 'anakena');
  assert((await text(p, '#r-price')).includes('35.000'), 'reserva: ' + await text(p, '#r-price'));
});

test('Aeropuerto a Anakena no cobra la tarifa de collares', async p => {
  await p.click('#p-now');
  await p.selectOption('#n-from', 'Aeropuerto Mataveri'); await p.selectOption('#n-to', 'Anakena');
  const pr = await text(p, '#n-price');
  assert(pr.includes('35.000'), 'muestra: ' + pr);
});

test('No permite el mismo origen y destino', async p => {
  await p.click('#p-now');
  await p.selectOption('#n-from', 'Centro de Hanga Roa'); await p.selectOption('#n-to', 'Centro de Hanga Roa');
  await submit(p, '#n-form'); await W(200);
  assert(await p.isVisible('#n-form'), 'aceptó el pedido con origen igual a destino');
});

test('Caleta Hanga Roa existe como destino y cobra la mínima de $4.000 desde el centro', async p => {
  await p.click('#p-now');
  const ops = await p.$$eval('#n-to option', o => o.map(x => x.textContent));
  assert(ops.includes('Caleta Hanga Roa'), 'destinos: ' + ops.join(', '));
  await p.selectOption('#n-from', 'Centro de Hanga Roa'); await p.selectOption('#n-to', 'Caleta Hanga Roa');
  const pr = await text(p, '#n-price');
  const hora = Number(new Date().toLocaleString('en-GB', { timeZone: 'Pacific/Easter', hour: '2-digit', hour12: false })) % 24;
  if (hora >= 6 && hora < 20) assert(pr.includes('4.000'), 'muestra: ' + pr);
});

// --- viaje inmediato ---
test('Viaje inmediato completo: pedir, aceptar, llegar, a bordo, terminar', async p => {
  await p.click('#p-now'); await submit(p, '#n-form'); await W(1700);
  assert(await p.isVisible('#acc'), 'la alerta no llegó al taxista');
  await p.click('#acc'); await W(150);
  assert((await text(p, '#main')).includes('ABCD-12'), 'el pasajero no ve la patente');
  await p.click('#next'); await W(100);
  assert(await p.isVisible('#aboard') && await p.isVisible('#noshow'), 'falta la pantalla del punto de encuentro');
  await p.click('#aboard'); await W(100); await p.click('#next'); await W(150);
  assert(await p.isVisible('#p-up'), 'el pasajero no ve el viaje finalizado');
});

test('Doble solicitud accidental de taxi: la segunda se bloquea', async p => {
  await p.click('#p-now'); await submit(p, '#n-form'); await W(200);
  await p.click('#tab-h'); await p.click('#h-now'); await W(100);
  assert(await p.isDisabled('#n-form button[type=submit]'), 'permitió un segundo pedido con uno en curso');
});

test('Pérdida de conexión del taxista: el viaje pasa a otro conductor', async p => {
  await p.check('#off');
  await p.click('#p-now'); await submit(p, '#n-form'); await W(1800);
  assert(!(await p.isVisible('#acc')), 'ofreció el viaje a un taxista sin conexión');
  await W(2000);
  const t = await text(p, '#main');
  assert(t.includes('WXYZ-34') || t.includes('EFGH-56'), 'no se asignó a otro conductor');
});

test('Sin conductores disponibles: no deja pedir', async p => {
  await p.click('#disc');
  await p.click('#tab-a');
  await p.click('[data-act="suspend"][data-id="d2"]');
  await p.click('[data-act="suspend"][data-id="d3"]');
  await p.click('#tab-p'); await p.click('#p-now');
  assert(await p.isDisabled('#n-form button[type=submit]'), 'permitió pedir sin taxis disponibles');
});

// --- reservas anticipadas ---
test('Aeropuerto: vuelo por definir y alojamiento pendiente, 2 pasajeros, 12:00', async p => {
  await reservarAeropuerto(p, { hora: '12:00', vuelo: '', alojamiento: '', pax: '2' });
  const t = await text(p, '#main');
  assert(t.includes('Solicitud enviada'), 'no quedó como solicitud enviada');
  assert(t.includes('12:00'), 'no muestra las 12:00');
  assert(t.includes('Alojamiento por confirmar'), 'no marca el alojamiento como pendiente');
  assert(t.includes('20.000'), 'no muestra $20.000');
});

test('Confirmación no recibida: la reserva sigue pendiente y no se muestra confirmada', async p => {
  await reservarAeropuerto(p);
  await W(1500);
  const t = await text(p, '#main');
  assert(t.includes('Pendiente de conductor') && !t.includes('Reserva confirmada'), 'se mostró confirmada sin que un taxista la tomara');
});

test('Confirmación: el taxista toma la reserva y el pasajero la ve confirmada', async p => {
  await reservarAeropuerto(p);
  await taxistaTomaPrimera(p);
  assert((await text(p, '#main')).includes('Reserva confirmada'), 'el pasajero no ve la confirmación');
});

test('Doble solicitud accidental de reserva: la segunda se rechaza', async p => {
  await reservarAeropuerto(p);
  await p.click('#p-home');
  await reservarAeropuerto(p);
  assert(await p.isVisible('#r-err'), 'aceptó dos reservas iguales');
});

test('Rechaza reservas con hora ya pasada', async p => {
  await reservarAeropuerto(p, { fecha: rapaNuiDay(0), hora: '00:01', nombre: 'Hora Pasada' });
  assert(await p.isVisible('#r-err'), 'aceptó una reserva para una hora que ya pasó');
});

test('Modificación de fecha y hora: pide reconfirmación al taxista', async p => {
  await reservarAeropuerto(p);
  await taxistaTomaPrimera(p);
  await p.click('#ra-chg');
  await p.fill('#ra-t1', '16:10'); await p.fill('#ra-d', rapaNuiDay(2));
  await p.click('#ra-save'); await W(150);
  const t = await text(p, '#main');
  assert(t.includes('Pendiente de reconfirmación'), 'no pidió reconfirmación');
  assert(t.includes('16:10'), 'no muestra la nueva hora');
  if (await p.isVisible('#ag')) await p.click('#ag');
  await p.click('[data-reconf]'); await W(150);
  assert((await text(p, '#main')).includes('Reserva confirmada'), 'no volvió a confirmada');
});

test('Anakena permite cambiar también la fecha', async p => {
  await abrirReserva(p, 'anakena'); await p.fill('#r-name', 'Familia Ficticia');
  await p.fill('#r-date', rapaNuiDay(3)); await submit(p, '#r-form'); await W(150);
  await p.click('#ra-chg');
  assert(await p.isVisible('#ra-d'), 'no hay campo de fecha al cambiar una reserva de Anakena');
});

test('Cancelación por el pasajero, con confirmación previa', async p => {
  await reservarAeropuerto(p);
  await taxistaTomaPrimera(p);
  await p.click('#ra-can'); await p.click('#ra-yes'); await W(150);
  assert((await text(p, '#main')).includes('Reserva cancelada'), 'no quedó cancelada');
  await p.click('#tab-a');
  assert((await text(p, '#main')).includes('Cancelación'), 'no quedó registrada en incidencias');
});

test('Prevención de choque de horario del conductor', async p => {
  await abrirReserva(p, 'anakena'); await p.fill('#r-name', 'Choque Ficticio');
  await submit(p, '#r-form'); await W(150);
  await taxistaTomaPrimera(p);
  assert((await text(p, '#dphone .toast')).includes('choca'), 'permitió tomar dos reservas que chocan');
});

test('Taxista no inicia a tiempo: reasignación automática y multa registrada', async p => {
  await reservarAeropuerto(p);
  await taxistaTomaPrimera(p);
  await p.click('#tab-a');
  const botones = await p.$$('[data-act="absent"]');
  await botones[botones.length - 1].click(); await W(150);
  const t = await text(p, '#main');
  assert(t.includes('Reasignación automática'), 'no se reasignó');
  assert(t.includes('Multa') && t.includes('5.000'), 'no registró la multa de $5.000');
});

test('Hotel: plan Gratis solo ve; plan Pro puede cambiar o cancelar', async p => {
  await p.click('#tab-h'); await p.click('#h-res');
  await p.fill('#r-name', 'Huésped Ficticio'); await submit(p, '#r-form'); await W(150);
  assert((await text(p, '#main')).includes('Huésped Ficticio'), 'la reserva no aparece en la lista del hotel');
  assert(!(await p.isVisible('[data-hm]')), 'el plan Gratis permite gestionar');
  await p.click('#h-plan');
  assert(await p.isVisible('[data-hm]'), 'el plan Pro no permite gestionar');
});

// --- envíos de productos (alianza Tari Kai) ---
async function pedirEnvio(p, { moto = true } = {}) {
  await p.click('#p-env');
  await p.fill('#e-from', 'Restaurante Ficticio'); await p.fill('#e-to', 'Hostal Ficticio'); await p.fill('#e-item', '2 cajas de comida');
  if (!moto) await p.click('[data-size="auto"]');
  await submit(p, '#e-form');
}

test('Envío completo: pedir, aceptar, retirar, entregar', async p => {
  await pedirEnvio(p); await W(1700);
  assert((await text(p, '#dphone')).includes('ENVÍO'), 'la tarjeta del conductor no dice ENVÍO');
  assert((await text(p, '#dphone')).includes('Restaurante Ficticio'), 'no muestra dónde retirar');
  await p.click('#acc'); await W(150);
  await p.click('#next'); await W(100);
  assert((await text(p, '#aboard')).includes('Tengo el pedido'), 'falta el paso de retiro');
  await p.click('#aboard'); await W(100); await p.click('#next'); await W(150);
  assert((await text(p, '#main')).includes('Pedido entregado'), 'el cliente no ve la entrega');
});

test('Envío que cabe en moto: si el taxista rechaza, pasa a la flota aliada', async p => {
  await pedirEnvio(p); await W(1700);
  await p.click('#rej'); await W(3600);
  assert((await text(p, '#main')).includes('MOTO-0'), 'no se asignó a una moto de la flota aliada');
});

test('Envío que necesita auto nunca se asigna a una moto', async p => {
  await pedirEnvio(p, { moto: false }); await W(1700);
  await p.click('#rej'); await W(3600);
  const t = await text(p, '#main');
  assert(!t.includes('MOTO-0') && (t.includes('WXYZ-34') || t.includes('EFGH-56')), 'se asignó mal');
});

test('Envío exige retiro, entrega y descripción', async p => {
  await p.click('#p-env'); await submit(p, '#e-form');
  assert(await p.isVisible('#e-err'), 'aceptó un envío vacío');
});

test('Pedido entrante de Tari Kai llega al conductor y queda registrado con su origen', async p => {
  await p.click('#tab-a'); await p.click('#a-tk'); await W(1700);
  assert(await p.isVisible('#acc'), 'el pedido no llegó al conductor');
  assert((await text(p, '#main')).includes('Tari Kai'), 'no quedó registrado el origen Tari Kai');
});

// --- zona horaria ---
test('Fechas usan la hora de Rapa Nui aunque el teléfono esté en otra zona (Tokio)', async p => {
  await abrirReserva(p, 'airport');
  const v = await p.inputValue('#r-date');
  assert(v === rapaNuiDay(1), `formulario: ${v}, esperado: ${rapaNuiDay(1)}`);
}, { timezoneId: 'Asia/Tokyo' });

test('Pacific/Easter aplica cambio de horario (verano e invierno difieren)', async () => {
  const off = d => new Intl.DateTimeFormat('en-US', { timeZone: 'Pacific/Easter', timeZoneName: 'shortOffset' }).formatToParts(new Date(d)).find(x => x.type === 'timeZoneName').value;
  assert(off('2026-01-15T12:00:00Z') !== off('2026-07-15T12:00:00Z'), 'mismo desfase todo el año: ' + off('2026-01-15T12:00:00Z'));
}, { noPage: true });

test('Sin errores de JavaScript en un recorrido por las cuatro vistas', async (p, errs) => {
  for (const t of ['d', 'h', 'a', 'p']) { await p.click('#tab-' + t).catch(() => {}); await W(80); }
  for (const n of ['mine', 'dest', 'profile', 'home']) { await p.click(`.pnav [data-nav="${n}"]`); await W(80); }
  assert(errs.length === 0, errs.join(' | '));
});

// --- ejecución ---
(async () => {
  const browser = await chromium.launch();
  let pass = 0; const fallas = [];
  for (const t of tests) {
    let ctx;
    try {
      if (t.opts.noPage) { await t.fn(); }
      else {
        ctx = await browser.newContext(t.opts.iphone
          ? { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, timezoneId: 'Pacific/Easter' }
          : { viewport: { width: 1280, height: 900 }, timezoneId: t.opts.timezoneId || 'Pacific/Easter' });
        const p = await ctx.newPage(); p.setDefaultTimeout(4000);
        const errs = []; p.on('pageerror', e => errs.push(e.message));
        await p.goto(BASE); await W(400);
        await t.fn(p, errs);
      }
      pass++; console.log('PASA   ' + t.name);
    } catch (e) {
      fallas.push(t.name); console.log('FALLA  ' + t.name + '\n       ' + String(e.message).split('\n')[0]);
    } finally { if (ctx) await ctx.close(); }
  }
  await browser.close();
  console.log(`\n${pass} de ${tests.length} pruebas pasan` + (fallas.length ? `; fallan ${fallas.length}` : ''));
  process.exit(fallas.length ? 1 : 0);
})();
