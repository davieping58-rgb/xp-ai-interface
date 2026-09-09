function textFromResponse(data){
  if(typeof data?.output_text==='string')return data.output_text.trim();
  return (data?.output||[]).flatMap(o=>o?.content||[]).map(c=>c?.text||'').join('').trim();
}
function cleanJson(text){const t=String(text||'').trim().replace(/^```json\s*/i,'').replace(/```$/,'').trim();const a=t.indexOf('{'),b=t.lastIndexOf('}');if(a<0||b<a)throw new Error('vision returned no JSON');return JSON.parse(t.slice(a,b+1));}
function norm(v){return String(v||'').toLowerCase().replace(/[^a-z0-9]/g,'')}
function cardNum(v){return String(v||'').split('/')[0].replace(/[^A-Za-z0-9]/g,'')}
async function identify(image,token){
  const prompt=`Identify the exact trading card printing in this photo. Focus on Pokémon and Yu-Gi-Oh!. Carefully read the card name, collector number, set code and set name. Return ONLY JSON: {"game":"pokemon|yugioh|unknown","name":"","number":"","setCode":"","setName":"","confidence":0}. Never invent unreadable text; empty string is better than guessing.`;
  const r=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`},body:JSON.stringify({model:'gpt-5.6-luna',input:[{role:'user',content:[{type:'input_text',text:prompt},{type:'input_image',image_url:image,detail:'high'}]}],max_output_tokens:220,reasoning:{effort:'none'}})});
  const data=await r.json().catch(()=>({}));if(!r.ok)throw new Error(data?.error?.message||`vision ${r.status}`);return cleanJson(textFromResponse(data));
}
function pokemonPrice(card){const cp=card?.cardmarket?.prices||{};if(Number.isFinite(cp.avg7))return{label:'Cardmarket 7-day average',amount:cp.avg7,currency:'EUR',updatedAt:card.cardmarket.updatedAt||''};if(Number.isFinite(cp.trendPrice))return{label:'Cardmarket trend',amount:cp.trendPrice,currency:'EUR',updatedAt:card.cardmarket.updatedAt||''};const groups=Object.values(card?.tcgplayer?.prices||{});const market=groups.map(x=>x?.market).find(Number.isFinite);if(Number.isFinite(market))return{label:'TCGplayer market',amount:market,currency:'USD',updatedAt:card.tcgplayer.updatedAt||''};return null;}
async function pokeSearch(query,headers){if(!query)return[];const r=await fetch(`https://api.pokemontcg.io/v2/cards?q=${encodeURIComponent(query)}&pageSize=40`,{headers});const d=await r.json().catch(()=>({}));return r.ok&&Array.isArray(d.data)?d.data:[];}
function scorePokemon(c,id){let s=0;if(norm(c.name)===norm(id.name))s+=100;else if(norm(c.name).includes(norm(id.name))||norm(id.name).includes(norm(c.name)))s+=45;if(cardNum(c.number)&&cardNum(c.number).toLowerCase()===cardNum(id.number).toLowerCase())s+=90;if(id.setName&&norm(c.set?.name)===norm(id.setName))s+=55;else if(id.setName&&(norm(c.set?.name).includes(norm(id.setName))||norm(id.setName).includes(norm(c.set?.name))))s+=25;if(id.setCode&&norm(c.set?.id)===norm(id.setCode))s+=35;return s;}
async function lookupPokemon(id){
  if(!id.name&&!id.number)return null;const headers={};if(process.env.POKEMON_TCG_API_KEY)headers['X-Api-Key']=process.env.POKEMON_TCG_API_KEY;
  const name=String(id.name||'').replace(/"/g,''),num=cardNum(id.number),set=String(id.setName||'').replace(/"/g,'');
  const queries=[];if(name&&num&&set)queries.push(`name:"${name}" number:${num} set.name:"${set}"`);if(name&&num)queries.push(`name:"${name}" number:${num}`);if(num)queries.push(`number:${num}`);if(name)queries.push(`name:"${name}"`);
  let candidates=[];for(const q of queries){candidates=await pokeSearch(q,headers);if(candidates.length)break;}
  if(!candidates.length)return null;candidates.sort((a,b)=>scorePokemon(b,id)-scorePokemon(a,id));const card=candidates[0];
  return{game:'Pokémon',name:card.name,setName:card.set?.name||id.setName||'',number:card.number||id.number||'',rarity:card.rarity||'',image:card.images?.large||card.images?.small||'',price:pokemonPrice(card)};
}
async function lookupYgo(id){
  if(!id.name&&!id.setCode)return null;let cards=[];
  if(id.name){const r=await fetch(`https://db.ygoprodeck.com/api/v7/cardinfo.php?fname=${encodeURIComponent(id.name)}`);const d=await r.json().catch(()=>({}));if(r.ok&&Array.isArray(d.data))cards=d.data;}
  if(!cards.length)return null;const wanted=norm(id.setCode);let best=cards[0],bestSet=null,bestScore=-1;
  for(const c of cards){for(const st of(c.card_sets||[])){let score=norm(c.name)===norm(id.name)?100:30;if(wanted&&norm(st.set_code)===wanted)score+=100;if(id.setName&&norm(st.set_name)===norm(id.setName))score+=50;if(score>bestScore){best=c;bestSet=st;bestScore=score}}}
  const card=best,set=bestSet||(card.card_sets||[])[0]||{},p=(card.card_prices||[])[0]||{},eur=parseFloat(p.cardmarket_price),usd=parseFloat(p.tcgplayer_price);const price=Number.isFinite(eur)&&eur>0?{label:'Cardmarket reference',amount:eur,currency:'EUR',updatedAt:''}:Number.isFinite(usd)&&usd>0?{label:'TCGplayer reference',amount:usd,currency:'USD',updatedAt:''}:null;
  return{game:'Yu-Gi-Oh!',name:card.name,setName:set.set_name||id.setName||'',number:set.set_code||id.setCode||'',rarity:set.set_rarity||'',image:card.card_images?.[0]?.image_url||'',price};
}
export default async function handler(req,res){
  res.setHeader('Access-Control-Allow-Origin','*');res.setHeader('Access-Control-Allow-Headers','Content-Type');res.setHeader('Access-Control-Allow-Methods','POST,OPTIONS');if(req.method==='OPTIONS')return res.status(204).end();if(req.method!=='POST')return res.status(405).json({error:'POST only'});
  try{const token=process.env.OPENAI_API_KEY;if(!token)return res.status(503).json({error:'Scanner temporarily unavailable'});const image=String(req.body?.image||'');if(!image.startsWith('data:image/'))return res.status(400).json({error:'image required'});if(image.length>12_000_000)return res.status(413).json({error:'image too large'});const id=await identify(image,token);let card=null;if(id.game==='pokemon')card=await lookupPokemon(id);else if(id.game==='yugioh')card=await lookupYgo(id);if(!card)card=await lookupPokemon(id).catch(()=>null)||await lookupYgo(id).catch(()=>null);if(!card)return res.status(404).json({error:'Card not recognised. Hold it flat, fill the frame and scan again.'});const easter=/^magikarp$/i.test(card.name||'');return res.status(200).json({card,easterEgg:easter?'magikarp':null,identified:id});}catch(err){console.error('tattie-scan',err);return res.status(500).json({error:'Could not identify that card. Scan it again in good light.'});}
}
