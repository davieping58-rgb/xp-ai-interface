export const WEE_TATTIE_AGENT_API='https://xp-ai-interface.vercel.app/api/tattie/agent';

export async function askWeeTattie({message,history=[],profile={}}){
  const response=await fetch(WEE_TATTIE_AGENT_API,{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({message,history,profile})
  });
  const data=await response.json().catch(()=>({}));
  if(!response.ok||!data.reply)throw new Error(data.error||'Wee Tattie unavailable');
  return String(data.reply).trim();
}
