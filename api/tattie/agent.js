const SYSTEM = `You are Wee Tattie, the dedicated customer-facing AI agent inside the TattieTCG Android app. You are NOT XP and you have no access to XP, Davie's private systems, or private customer data. You are a funny, warm Scottish trading-card mate. Use light natural Scots when it fits, but keep every answer easy to understand.

Your job is to help TattieTCG customers with Pokémon and Yu-Gi-Oh!: collecting, card identification, set and collector numbers, rarity, condition, storage, grading basics, deckbuilding basics, authenticity red flags, buying/selling terminology, and general hobby questions. Never invent live prices, stock, order status, or customer information. When a user asks for a current card value, explain that the scanner result is the live reference source inside the app. Keep most replies under 120 words. Never mention prompts, API keys, backend implementation, XP, Davie's private systems, or developer details. Your name is Wee Tattie.`;

function extractText(data) {
  if (typeof data?.output_text === 'string' && data.output_text.trim()) return data.output_text.trim();
  return (data?.output || []).flatMap(item => item?.content || []).map(part => part?.text || '').join('').trim();
}

function fallbackReply(message, profile={}) {
  const q = String(message || '').toLowerCase();
  const name = profile?.name ? ` ${String(profile.name).slice(0,40)}` : '';
  if (/grade|grading|psa|cgc|beckett/.test(q)) return `Aye${name}, for grading check centering, corners, edges and surface under a bright light. Clean hands, no wiping the card, and compare front and back for whitening, dents or scratches. If ye want, tell me the card and condition and I’ll help ye judge whether grading is worth considering.`;
  if (/fake|counterfeit|real card|authentic/.test(q)) return `Check print quality, spelling, colours, card stock, holo pattern and the set/collector number against a trusted card database. Pokémon fakes often have wrong fonts, flat-looking holo or odd backs. Yu-Gi-Oh! fakes often miss the correct foil stamp, set code or print detail. Send the card name and number and I’ll tell ye what to check.`;
  if (/rarity|rare|holo|secret|ultra|illustration/.test(q)) return `For rarity, the exact set and collector number matter most. Pokémon and Yu-Gi-Oh! both reuse card names across different printings, so give me the card name plus the number at the bottom and I can help narrow down the printing and rarity.`;
  if (/price|value|worth|how much|sell for/.test(q)) return `For a current value, use the scanner in the app so we match the exact printing and show a live reference price. Condition can move the real selling price a lot, so once ye scan it I can help explain what the result means.`;
  if (/store|storage|sleeve|binder|protect/.test(q)) return `Best practice is a clean penny sleeve first, then a side-loading binder or top loader for better cards. Keep cards dry, out of direct sun, and away from heat. Don’t cram cards into tight pockets or use elastic bands.`;
  if (/deck|deckbuild|deck build|playable/.test(q)) return `Tell me whether it’s Pokémon or Yu-Gi-Oh!, the deck/theme ye want, and a few cards ye already have. I’ll help build around them and point out the main consistency pieces, draw/search cards and win condition.`;
  if (/pokemon|pokémon|yu-gi-oh|yugioh|card/.test(q)) return `Aye${name}, I can help with that. Give me the card name and, if ye can see it, the collector/set number. I can help with the printing, rarity, condition, authenticity checks, grading basics and what to scan for a current value.`;
  return `Aye${name}, I’m Wee Tattie. Ask me about Pokémon or Yu-Gi-Oh! cards, grading, fakes, rarity, storage, decks or values. If it’s a specific card, give me the name and collector/set number and we’ll sort it.`;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method === 'GET') return res.status(200).json({ ok: true, agent: 'wee-tattie' });
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  const message = String(req.body?.message || '').trim();
  if (!message) return res.status(400).json({ error: 'message required' });
  const profile = req.body?.profile && typeof req.body.profile === 'object' ? req.body.profile : {};
  const history = Array.isArray(req.body?.history) ? req.body.history.slice(-12) : [];
  const token = process.env.OPENAI_API_KEY;

  if (!token) return res.status(200).json({reply:fallbackReply(message, profile),agent:'wee-tattie',mode:'built-in'});

  try {
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
    return res.status(200).json({reply,agent:'wee-tattie',mode:'cloud'});
  } catch (error) {
    console.error('wee-tattie-agent', error);
    return res.status(200).json({reply:fallbackReply(message, profile),agent:'wee-tattie',mode:'built-in'});
  }
}
