/* =========================================================
   Joy Lapa · API de Conversões da Meta (CAPI)
   Recebe o lead do formulário e envia o evento "Lead" para a Meta
   pelo servidor. O token fica só na Netlify (variável de ambiente),
   nunca no site.

   Variáveis de ambiente (Netlify > Site configuration > Environment variables):
     META_CAPI_TOKEN        obrigatório · token da API de Conversões
     META_PIXEL_ID          opcional    · padrão: 2018343195510481
     META_TEST_EVENT_CODE   opcional    · ex.: TEST12345 (só para testar; apague depois)
   ========================================================= */
import { createHash } from 'node:crypto';

const GRAPH_VERSION = 'v26.0';
const DEFAULT_PIXEL_ID = '2018343195510481';

const env = (key) => (globalThis.Netlify?.env?.get(key) ?? process.env[key] ?? '').trim();
const sha256 = (value) => createHash('sha256').update(value).digest('hex');
const json = (body, status = 200) => Response.json(body, { status });

// Telefone no formato da Meta: só dígitos, com código do país (55)
const normalizePhone = (raw) => {
  let d = String(raw || '').replace(/\D/g, '').replace(/^0+/, '');
  if (d.length === 10 || d.length === 11) d = `55${d}`;
  return /^55\d{10,11}$/.test(d) ? d : '';
};

// Nome no formato da Meta: minúsculas, sem pontuação, acentos mantidos (UTF-8)
const normalizeName = (raw) => String(raw || '')
  .normalize('NFC')
  .toLowerCase()
  .replace(/[^\p{L}\s'-]/gu, '')
  .replace(/\s+/g, ' ')
  .trim();

const FBP_FBC = /^fb\.\d\.\d{10,13}\.[\w.-]{1,500}$/;

export default async (req, context) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405, headers: { Allow: 'POST' } });
  }

  // Aceita só chamadas vindas do próprio site
  const origin = req.headers.get('origin') || req.headers.get('referer') || '';
  const host = new URL(req.url).host;
  try {
    if (new URL(origin).host !== host) return json({ ok: false, error: 'origem não permitida' }, 403);
  } catch {
    return json({ ok: false, error: 'origem não permitida' }, 403);
  }

  const token = env('META_CAPI_TOKEN');
  const pixelId = env('META_PIXEL_ID') || DEFAULT_PIXEL_ID;
  if (!token) {
    console.error('[capi] META_CAPI_TOKEN não configurado na Netlify');
    return json({ ok: false, error: 'CAPI não configurada' }, 500);
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return json({ ok: false, error: 'JSON inválido' }, 400);
  }

  const eventId = String(body.event_id || '');
  const phone = normalizePhone(body.whatsapp);
  const name = normalizeName(body.nome);
  if (!/^[\w-]{8,64}$/.test(eventId) || !phone || name.length < 2) {
    return json({ ok: false, error: 'dados inválidos' }, 400);
  }

  const [firstName, ...rest] = name.split(' ');
  const lastName = rest.at(-1);

  const userData = {
    ph: [sha256(phone)],
    fn: [sha256(firstName)],
    country: [sha256('br')],
    external_id: [sha256(phone)],
    client_ip_address: context?.ip || undefined,
    client_user_agent: req.headers.get('user-agent') || undefined,
  };
  if (lastName) userData.ln = [sha256(lastName)];
  if (FBP_FBC.test(body.fbp || '')) userData.fbp = body.fbp;
  if (FBP_FBC.test(body.fbc || '')) userData.fbc = body.fbc;

  let sourceUrl = `https://${host}/`;
  try {
    const u = new URL(String(body.url || ''));
    if (u.host === host) sourceUrl = u.href;
  } catch { /* usa a raiz do site */ }

  const payload = {
    data: [{
      event_name: 'Lead',
      event_time: Math.floor(Date.now() / 1000),
      event_id: eventId,
      event_source_url: sourceUrl,
      action_source: 'website',
      user_data: userData,
      custom_data: {
        content_name: 'Joy Lapa',
        content_category: String(body.renda || '').slice(0, 60) || undefined,
      },
    }],
    access_token: token,
  };
  const testCode = env('META_TEST_EVENT_CODE');
  if (testCode) payload.test_event_code = testCode;

  try {
    const res = await fetch(`https://graph.facebook.com/${GRAPH_VERSION}/${pixelId}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const result = await res.json().catch(() => ({}));
    if (!res.ok) {
      console.error('[capi] erro da Meta:', res.status, JSON.stringify(result.error || result));
      return json({ ok: false, error: 'meta', status: res.status }, 502);
    }
    return json({ ok: true, events_received: result.events_received ?? null });
  } catch (err) {
    console.error('[capi] falha de rede:', err?.message || err);
    return json({ ok: false, error: 'rede' }, 502);
  }
};

export const config = {
  path: '/api/lead',
  method: 'POST',
  rateLimit: {
    windowLimit: 10,
    windowSize: 60,
    aggregateBy: ['ip', 'domain'],
  },
};
