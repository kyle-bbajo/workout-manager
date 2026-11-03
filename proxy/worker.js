// AI 운동 매니저 시험판용 Gemini 중계 (Cloudflare Workers, 무료 요금제로 충분)
// - Gemini API 키는 Worker의 비밀 변수(GEMINI_API_KEY)에만 있고, 앱 코드·저장소에는 들어가지 않습니다.
// - 허용한 사이트(ALLOWED_ORIGINS)에서 온 요청만 받습니다.
// - 하루 요청 수를 제한해 키가 남용되지 않게 합니다(DAILY_LIMIT, 기본 300).
export default {
  async fetch(req, env) {
    const allowed = (env.ALLOWED_ORIGINS || 'https://kyle-bbajo.github.io').split(',').map(s => s.trim());
    const origin = req.headers.get('Origin') || '';
    const ok = allowed.includes(origin);
    const cors = {
      'Access-Control-Allow-Origin': ok ? origin : allowed[0],
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'content-type',
      'Access-Control-Max-Age': '86400',
      'Vary': 'Origin',
    };
    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    if (req.method !== 'POST' || !ok) return new Response('forbidden', { status: 403, headers: cors });
    if (!env.GEMINI_API_KEY) return json({ error: { message: 'Worker에 GEMINI_API_KEY가 없어요' } }, 500, cors);

    // 하루 요청 수 제한 (Worker 인스턴스별 대략적 제한)
    const day = new Date().toISOString().slice(0, 10);
    globalThis.__count = globalThis.__day === day ? (globalThis.__count || 0) + 1 : 1;
    globalThis.__day = day;
    if (globalThis.__count > Number(env.DAILY_LIMIT || 300)) return json({ error: { message: '오늘 시험판 사용량을 다 썼어요' } }, 429, cors);

    const url = new URL(req.url);
    const model = (url.searchParams.get('model') || 'gemini-flash-latest').replace(/[^a-zA-Z0-9.\-]/g, '');
    const body = await req.text();
    if (body.length > 25 * 1024 * 1024) return json({ error: { message: '보낸 파일이 너무 커요' } }, 413, cors);

    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-goog-api-key': env.GEMINI_API_KEY },
      body,
    });
    return new Response(r.body, { status: r.status, headers: { ...cors, 'content-type': 'application/json' } });
  },
};
function json(o, status, headers) { return new Response(JSON.stringify(o), { status, headers: { ...headers, 'content-type': 'application/json' } }); }
