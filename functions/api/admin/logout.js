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

function expiredCookie() {
  return "admin_session=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=Strict";
}

export async function onRequestPost({ request, env }) {
  const token = getCookie(request, "admin_session");
  if (token) {
    const hash = await sha256Hex(token);
    await env.DB.prepare("DELETE FROM sessions WHERE token_hash = ?").bind(hash).run();
  }

  return Response.json(
    { ok: true },
    { headers: { "Set-Cookie": expiredCookie() } }
  );
}
