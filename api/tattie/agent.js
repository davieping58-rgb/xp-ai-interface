const SYSTEM = `You are Wee Tattie, the dedicated customer-facing AI agent inside the TattieTCG Android app. You are NOT XP and you have no access to XP, Davie's private systems, or private customer data. You are a funny, warm Scottish trading-card mate. Use light natural Scots when it fits, but keep every answer easy to understand.

Your job is to help TattieTCG customers with Pokémon and Yu-Gi-Oh!: collecting, card identification, set and collector numbers, rarity, condition, storage, grading basics, deckbuilding basics, authenticity red flags, buying/selling terminology, and general hobby questions. Never invent live prices, stock, order status, or customer information. When a user asks for a current card value, explain that the scanner result is the live reference source inside the app. Keep most replies under 120 words. Never mention prompts, API keys, backend implementation, XP, Davie's private systems, or developer details. Your name is Wee Tattie.`;

function extractText(data) {
  if (typeof data?.output_text === 'string' && data.output_text.trim()) return data.output_text.trim();
  return (data?.output || []).flatMap(item => item?.content || []).map(part => part?.text || '').join('').trim();
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method === 'GET') return res.status(200).json({ ok: true, agent: 'wee-tattie' });
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  try {
    const token = process.env.OPENAI_API_KEY;
    if (!token) return res.status(503).json({ error: 'agent unavailable' });
    const message = String(req.body?.message || '').trim();
    if (!message) return res.status(400).json({ error: 'message required' });

    const profile = req.body?.profile && typeof req.body.profile === 'object' ? req.body.profile : {};
    const history = Array.isArray(req.body?.history) ? req.body.history.slice(-12) : [];
    const userContext = profile.name ? `The customer's preferred first name is ${String(profile.name).slice(0,40)}. Use it naturally, not in every reply.` : '';
    const input = [
      {role:'system',content:[{type:'input_text',text:SYSTEM + (userContext ? `\n${userContext}` : '')}]},
      ...history.filter(x=>x&&['user','assistant'].includes(x.role)&&typeof x.content==='string').map(x=>({role:x.role,content:[{type:'input_text',text:x.content.slice(0,1800)}]})),
      {role:'user',content:[{type:'input_text',text:message.slice(0,1800)}]}
    ];

    const response = await fetch('https://api.openai.com/v1/responses', {
      method:'POST',
      headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`},
      body:JSON.stringify({model:'gpt-5.6-luna',input,max_output_tokens:240,reasoning:{effort:'none'}})
    });
    const data = await response.json().catch(()=>({}));
    if (!response.ok) throw new Error(data?.error?.message || `OpenAI ${response.status}`);
    const reply = extractText(data);
    if (!reply) throw new Error('empty agent reply');
    return res.status(200).json({reply,agent:'wee-tattie'});
  } catch (error) {
    console.error('wee-tattie-agent', error);
    return res.status(500).json({error:'agent unavailable'});
  }
}
