async function sha256Hex(text) {
  const data = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(hash)].map(b => b.toString(16).padStart(2, "0")).join("");
}

function getCookie(request, name) {
  const value = request.headers.get("Cookie") || "";
  const match = value.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return match ? match[1] : null;
}

async function requireAdmin(request, env) {
  const token = getCookie(request, "admin_session");
  if (!token) return false;
  const hash = await sha256Hex(token);
  const row = await env.DB.prepare(`
    SELECT token_hash FROM sessions
    WHERE token_hash = ? AND expires_at > ?
  `).bind(hash, Date.now()).first();
  return !!row;
}

export async function onRequestGet({ request, env }) {
  if (!await requireAdmin(request, env)) {
    return Response.json({ message: "Neprihlásený." }, { status: 401 });
  }

  const result = await env.DB.prepare(`
    SELECT id, line, direction, stop, type, created_at
    FROM reports
    ORDER BY created_at DESC
    LIMIT 500
  `).all();

  return Response.json({ reports: result.results || [] });
}
