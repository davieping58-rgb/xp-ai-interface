export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method !== 'GET') return res.status(405).json({ error: 'method not allowed' });
  return res.status(200).json({ ok: true, name: 'wee-tattie-agent', model: process.env.OPENAI_MODEL || 'gpt-5-mini' });
}
