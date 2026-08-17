export async function onRequestPost({ request, env }) {
  try {
    const body = await request.json();
    const line = String(body.line || "").trim();
    const direction = String(body.direction || "").trim();
    const stop = String(body.stop || "").trim();
    const type = String(body.type || "").trim();

    const allowedTypes = new Set(["Slabá Wi-Fi", "Revízor"]);
    if (!line || !direction || !stop || !allowedTypes.has(type)) {
      return Response.json({ message: "Neplatné hlásenie." }, { status: 400 });
    }

    // Server sets the timestamp so the browser cannot fake the report time.
    const createdAt = new Date().toISOString();

    await env.DB.prepare(`
      INSERT INTO reports (line, direction, stop, type, created_at)
      VALUES (?, ?, ?, ?, ?)
    `).bind(line, direction, stop, type, createdAt).run();

    return Response.json({ ok: true }, { status: 201 });
  } catch {
    return Response.json({ message: "Serverová chyba." }, { status: 500 });
  }
}
