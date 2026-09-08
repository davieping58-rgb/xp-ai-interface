function textFromResponse(data){
  if(typeof data?.output_text==='string')return data.output_text.trim();
  return (data?.output||[]).flatMap(o=>o?.content||[]).map(c=>c?.text||'').join('').trim();
}

function cleanJson(text){
  const t=String(text||'').trim().replace(/^```json\s*/i,'').replace(/```$/,'').trim();
  const a=t.indexOf('{'),b=t.lastIndexOf('}');
  if(a<0||b<a)throw new Error('vision returned no JSON');
  return JSON.parse(t.slice(a,b+1));
}

async function identify(image,token){
  const prompt=`Identify the trading card in this photo. Focus on Pokémon and Yu-Gi-Oh!. Read the visible card name, collector/set number and set code where possible. Return ONLY JSON with keys: game (pokemon|yugioh|unknown), name, number, setCode, setName, confidence (0-1). Never invent unreadable details; use empty strings.`;
  const r=await fetch('https://api.openai.com/v1/responses',{
    method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`},
    body:JSON.stringify({model:'gpt-5.6-luna',input:[{role:'user',content:[{type:'input_text',text:prompt},{type:'input_image',image_url:image,detail:'high'}]}],max_output_tokens:180,reasoning:{effort:'none'}})
  });
  const data=await r.json().catch(()=>({}));
  if(!r.ok)throw new Error(data?.error?.message||`vision ${r.status}`);
  return cleanJson(textFromResponse(data));
}

function pokemonPrice(card){
  const cp=card?.cardmarket?.prices||{};
  if(Number.isFinite(cp.avg7))return {label:'Cardmarket 7-day average',amount:cp.avg7,currency:'EUR',updatedAt:card.cardmarket.updatedAt||''};
  if(Number.isFinite(cp.trendPrice))return {label:'Cardmarket trend',amount:cp.trendPrice,currency:'EUR',updatedAt:card.cardmarket.updatedAt||''};
  const groups=Object.values(card?.tcgplayer?.prices||{});
  const market=groups.map(x=>x?.market).find(Number.isFinite);
  if(Number.isFinite(market))return {label:'TCGplayer market',amount:market,currency:'USD',updatedAt:card.tcgplayer.updatedAt||''};
  return null;
}

async function lookupPokemon(id){
  const terms=[];
  if(id.name)terms.push(`name:\"${String(id.name).replace(/\"/g,'')}\"`);
  if(id.number)terms.push(`number:${String(id.number).split('/')[0].replace(/[^A-Za-z0-9]/g,'')}`);
  if(id.setName)terms.push(`set.name:\"${String(id.setName).replace(/\"/g,'')}\"`);
  const q=encodeURIComponent(terms.join(' '));
  const headers={}; if(process.env.POKEMON_TCG_API_KEY)headers['X-Api-Key']=process.env.POKEMON_TCG_API_KEY;
  const r=await fetch(`https://api.pokemontcg.io/v2/cards?q=${q}&pageSize=10`,{headers});
  const data=await r.json().catch(()=>({}));
  if(!r.ok||!Array.isArray(data.data)||!data.data.length)return null;
  const num=String(id.number||'').split('/')[0].toLowerCase();
  const card=data.data.find(c=>String(c.name).toLowerCase()===String(id.name||'').toLowerCase()&&(!num||String(c.number).toLowerCase()===num))||data.data[0];
  return {game:'Pokémon',name:card.name,setName:card.set?.name||id.setName||'',number:card.number||id.number||'',rarity:card.rarity||'',image:card.images?.large||card.images?.small||'',price:pokemonPrice(card)};
}

async function lookupYgo(id){
  if(!id.name)return null;
  const r=await fetch(`https://db.ygoprodeck.com/api/v7/cardinfo.php?name=${encodeURIComponent(id.name)}`);
  const data=await r.json().catch(()=>({}));
  if(!r.ok||!Array.isArray(data.data)||!data.data.length)return null;
  const card=data.data[0];
  const wanted=String(id.setCode||'').toLowerCase();
  const set=(card.card_sets||[]).find(s=>String(s.set_code||'').toLowerCase()===wanted)||(card.card_sets||[])[0]||{};
  const p=(card.card_prices||[])[0]||{};
  const eur=parseFloat(p.cardmarket_price);
  const usd=parseFloat(p.tcgplayer_price);
  const price=Number.isFinite(eur)&&eur>0?{label:'Cardmarket lowest listed reference',amount:eur,currency:'EUR',updatedAt:''}:Number.isFinite(usd)&&usd>0?{label:'TCGplayer lowest listed reference',amount:usd,currency:'USD',updatedAt:''}:null;
  return {game:'Yu-Gi-Oh!',name:card.name,setName:set.set_name||id.setName||'',number:set.set_code||id.setCode||'',rarity:set.set_rarity||'',image:'',price};
}

export default async function handler(req,res){
  res.setHeader('Access-Control-Allow-Origin','*');
  res.setHeader('Access-Control-Allow-Headers','Content-Type');
  res.setHeader('Access-Control-Allow-Methods','POST,OPTIONS');
  if(req.method==='OPTIONS')return res.status(204).end();
  if(req.method!=='POST')return res.status(405).json({error:'POST only'});
  try{
    const token=process.env.OPENAI_API_KEY;if(!token)return res.status(503).json({error:'OpenAI API key not configured'});
    const image=String(req.body?.image||'');
    if(!image.startsWith('data:image/'))return res.status(400).json({error:'image required'});
    if(image.length>9_000_000)return res.status(413).json({error:'image too large'});
    const id=await identify(image,token);
    let card=null;
    if(id.game==='pokemon')card=await lookupPokemon(id);
    else if(id.game==='yugioh')card=await lookupYgo(id);
    if(!card){card=await lookupPokemon(id).catch(()=>null)||await lookupYgo(id).catch(()=>null);}
    if(!card)return res.status(404).json({error:'I could not match that card confidently. Try a brighter, straight-on photo.'});
    const easter=/^magikarp$/i.test(card.name||'');
    return res.status(200).json({card,easterEgg:easter?'magikarp':null,identified:id});
  }catch(err){console.error('tattie-scan',err);return res.status(500).json({error:'Card scan failed. Try another clear photo.'});}
}
