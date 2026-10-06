import { getStore } from "@netlify/blobs";

const STORE = "cury-360pv";
const KEY = "dados";

export default async (req) => {
  const store = getStore({ name: STORE, consistency: "strong" });

  if (req.method === "GET") {
    const data = await store.get(KEY, { type: "json", consistency: "strong" });
    return Response.json(data ?? { states: {}, updatedAt: null }, {
      headers: { "Cache-Control": "no-store" }
    });
  }

  if (req.method === "POST") {
    try {
      const body = await req.json();
      if (!body || typeof body.states !== "object" || Array.isArray(body.states)) {
        return Response.json({ ok: false, error: "Dados inválidos" }, { status: 400 });
      }
      const payload = {
        states: body.states,
        updatedAt: new Date().toISOString()
      };
      await store.setJSON(KEY, payload);
      return Response.json({ ok: true, updatedAt: payload.updatedAt });
    } catch (error) {
      return Response.json({ ok: false, error: String(error?.message || error) }, { status: 500 });
    }
  }

  return new Response("Method Not Allowed", { status: 405, headers: { "Allow": "GET, POST" } });
};

export const config = {
  path: "/.netlify/functions/data"
};
