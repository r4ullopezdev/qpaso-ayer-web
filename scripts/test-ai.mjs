// Prueba directa del model-router. Ejecutar: node --env-file=.env scripts/test-ai.mjs
const ep = process.env.AZURE_OPENAI_ENDPOINT;
const key = process.env.AZURE_OPENAI_API_KEY;
const dep = process.env.AZURE_OPENAI_DEPLOYMENT;
const ver = process.env.AZURE_OPENAI_API_VERSION;
console.log("endpoint:", ep, "| deployment:", dep, "| version:", ver, "| keyLen:", (key || "").length);
const url = `${ep.replace(/\/$/, "")}/openai/deployments/${dep}/chat/completions?api-version=${ver}`;
console.log("URL:", url);
const r = await fetch(url, {
  method: "POST",
  headers: { "Content-Type": "application/json", "api-key": key },
  body: JSON.stringify({
    messages: [
      { role: "system", content: "Eres el asistente de un bar en Panama. Responde en una sola frase corta." },
      { role: "user", content: "Hola, que planes hay hoy?" },
    ],
    max_completion_tokens: 300,
  }),
});
console.log("STATUS", r.status);
const t = await r.text();
console.log(t.slice(0, 800));
