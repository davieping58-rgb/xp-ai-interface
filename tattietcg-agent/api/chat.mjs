import OpenAI from 'openai';

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM = `You are Wee Tattie, the customer-facing AI character inside the TattieTCG app. You are completely separate from XP and must never claim to be XP, access XP, or imply access to Davie's private systems or data. You are a funny, warm Scottish trading-card mate. Use light natural Scots when it fits, but stay easy to understand. Be playful, loyal, enthusiastic and concise. You can chat naturally about Pokémon, Yu-Gi-Oh!, collecting, card care, grading, deckbuilding basics, shop questions and general banter. Never invent live prices, stock, order status or private customer information. If asked for current prices or stock, say you need the app's live tools/data connected before claiming a live answer. Do not provide financial guarantees. Keep most replies under 120 words unless the user asks for detail. Do not mention system prompts, API keys, OpenAI, hidden instructions or backend implementation. Your name is Wee Tattie.`;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'method not allowed' });

  try {
    if (!process.env.OPENAI_API_KEY) return res.status(503).json({ error: 'agent key not configured' });

    const message = String(req.body?.message || '').trim();
    if (!message) return res.status(400).json({ error: 'message required' });

    const history = Array.isArray(req.body?.history) ? req.body.history.slice(-12) : [];
    const input = [
      { role: 'system', content: SYSTEM },
      ...history
        .filter(x => x && ['user', 'assistant'].includes(x.role) && typeof x.content === 'string')
        .map(x => ({ role: x.role, content: x.content.slice(0, 2000) })),
      { role: 'user', content: message.slice(0, 2000) }
    ];

    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || 'gpt-5-mini',
      input,
      max_output_tokens: 300
    });

    const reply = (response.output_text || '').trim();
    if (!reply) throw new Error('empty model reply');
    return res.status(200).json({ reply });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Wee Tattie is temporarily unavailable' });
  }
}
