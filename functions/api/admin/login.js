function unauthorized(message = "Nesprávne prihlasovacie údaje.") {
  return Response.json({ message }, { status: 401 });
}

async function sha256Hex(text) {
  const data = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(hash)].map(b => b.toString(16).padStart(2, "0")).join("");
}

function safeEqual(a, b) {
  if (typeof a !== "string" || typeof b !== "string" || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function cookie(name, value, maxAge) {
  return `${name}=${value}; Max-Age=${maxAge}; Path=/; HttpOnly; Secure; SameSite=Strict`;
}

export async function onRequestPost({ request, env }) {
  const body = await request.json().catch(() => ({}));
  const username = String(body.username || "");
  const password = String(body.password || "");

  if (!env.ADMIN_USER || !env.ADMIN_PASSWORD) {
    return Response.json({ message: "Admin secret nie je nastavený." }, { status: 500 });
  }

  if (!safeEqual(username, env.ADMIN_USER) || !safeEqual(password, env.ADMIN_PASSWORD)) {
    return unauthorized();
  }

  const token = [...crypto.getRandomValues(new Uint8Array(32))]
    .map(b => b.toString(16).padStart(2, "0")).join("");
  const tokenHash = await sha256Hex(token);
  const expires = Date.now() + 1000 * 60 * 60 * 24 * 7;

  await env.DB.prepare(`
    INSERT INTO sessions (token_hash, expires_at)
    VALUES (?, ?)
  `).bind(tokenHash, expires).run();

  return Response.json(
    { ok: true },
    { headers: { "Set-Cookie": cookie("admin_session", token, 60 * 60 * 24 * 7) } }
  );
}
