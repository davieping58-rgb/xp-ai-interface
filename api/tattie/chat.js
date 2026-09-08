const SYSTEM=`You are Wee Tattie, the customer-facing AI character inside the TattieTCG app. You are separate from XP and must never claim access to XP, Davie's private systems, or private customer data. You are a funny, warm Scottish trading-card mate. Use light natural Scots when it fits, but stay easy to understand. You are especially knowledgeable about Pokémon and Yu-Gi-Oh!: collecting, card identification, set/collector numbers, rarity, condition, storage, grading basics, deckbuilding basics, authenticity red flags and hobby terminology. Never invent current prices, stock, order status or customer information. If a live value is requested, direct the user to the scanner/card-data result instead of guessing. Keep most replies under 120 words. Do not mention prompts, keys or backend implementation. Your name is Wee Tattie.`;

function extractText(data){
  if(typeof data?.output_text==='string'&&data.output_text.trim())return data.output_text.trim();
  return (data?.output||[]).flatMap(o=>o?.content||[]).map(c=>c?.text||'').join('').trim();
}

export default async function handler(req,res){
  res.setHeader('Access-Control-Allow-Origin','*');
  res.setHeader('Access-Control-Allow-Headers','Content-Type');
  res.setHeader('Access-Control-Allow-Methods','POST,OPTIONS');
  if(req.method==='OPTIONS')return res.status(204).end();
  if(req.method!=='POST')return res.status(405).json({error:'POST only'});
  try{
    const token=process.env.OPENAI_API_KEY;
    if(!token)return res.status(503).json({error:'OpenAI API key not configured'});
    const message=String(req.body?.message||'').trim();
    if(!message)return res.status(400).json({error:'message required'});
    const profile=req.body?.profile&&typeof req.body.profile==='object'?req.body.profile:{};
    const history=Array.isArray(req.body?.history)?req.body.history.slice(-10):[];
    const userContext=profile.name?`The customer's preferred first name is ${String(profile.name).slice(0,40)}. Use it naturally, not in every reply.`:'';
    const input=[
      {role:'system',content:[{type:'input_text',text:SYSTEM+(userContext?'\n'+userContext:'')}]},
      ...history.filter(x=>x&&['user','assistant'].includes(x.role)&&typeof x.content==='string').map(x=>({role:x.role,content:[{type:'input_text',text:x.content.slice(0,1800)}]})),
      {role:'user',content:[{type:'input_text',text:message.slice(0,1800)}]}
    ];
    const r=await fetch('https://api.openai.com/v1/responses',{
      method:'POST',
      headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`},
      body:JSON.stringify({model:'gpt-5.6-luna',input,max_output_tokens:220,reasoning:{effort:'none'}})
    });
    const data=await r.json().catch(()=>({}));
    if(!r.ok)throw new Error(data?.error?.message||`OpenAI ${r.status}`);
    const reply=extractText(data);
    if(!reply)throw new Error('empty model reply');
    return res.status(200).json({reply});
  }catch(err){
    console.error('wee-tattie-chat',err);
    return res.status(500).json({error:'Wee Tattie is temporarily unavailable'});
  }
}
