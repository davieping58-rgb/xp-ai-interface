const RULES=[
  {keys:['hello','hi','hey','hiya','alright'],reply:"Aye legend! Wee Tattie reporting for card duty 🥔 What are we hunting today?"},
  {keys:['sleeve','protect','storage','store card','binder'],reply:'For everyday protection: penny sleeve first, then a side-loading binder or rigid holder. Keep cards dry, cool, flat and out of direct sunlight. For valuable cards, use a fresh sleeve plus semi-rigid or top loader.'},
  {keys:['condition','near mint','nm','lightly played','lp','moderately played','mp'],reply:'Condition matters massively. Check corners, edges, surface scratches, whitening, dents, creases and centering under good light. Near Mint should have only tiny manufacturing-level imperfections; bends, dents or creases push it well below NM.'},
  {keys:['grading','psa','cgc','beckett','bgs'],reply:'Before grading, compare the likely grade against the raw value and grading cost. Inspect centering, corners, edges and surface carefully. A high-value card with a realistic shot at a strong grade is usually the best candidate; grading never guarantees a profit.'},
  {keys:['fake','counterfeit','real card','authentic'],reply:'Red flags include wrong fonts, odd colours, blurry text, incorrect holo pattern, poor card stock, bad borders and a back that does not match genuine examples. Compare the set number, symbol, copyright line and known scans. If value is high, get a second opinion before buying.'},
  {keys:['pokemon set number','pokémon set number','card number'],reply:'On Pokémon cards the collector number is usually at the bottom, shown like 044/185. The first number is the card number and the second is the printed set size. Secret or special cards can have a first number higher than the printed set total.'},
  {keys:['pokemon rarity','pokémon rarity','rarity symbol'],reply:'Pokémon rarity markers vary by era. Modern sets may use symbols and rarity labels such as Illustration Rare, Special Illustration Rare and Hyper Rare. Older cards often use circle/common, diamond/uncommon and star/rare. Always identify the exact set before judging rarity.'},
  {keys:['first edition pokemon','1st edition pokemon','first edition pokémon','1st edition pokémon'],reply:'For older Pokémon releases, a genuine 1st Edition stamp can matter a lot, but availability depends on the set and language. Check the exact printing, set symbol and stamp placement against trusted references before paying a premium.'},
  {keys:['shadowless'],reply:'Shadowless usually refers to early English Base Set Pokémon cards lacking the drop shadow beside the artwork frame. Not every early card is shadowless, and 1st Edition and Shadowless are related but not identical categories.'},
  {keys:['yugioh code','yu-gi-oh code','set code'],reply:'Yu-Gi-Oh! cards normally show a set code such as LOB-001 or a regional variant beneath the artwork area. That code is one of the quickest ways to identify the exact printing, set and rarity.'},
  {keys:['yugioh rarity','yu-gi-oh rarity'],reply:'Yu-Gi-Oh! rarity is identified by foil treatment, name colour and printing details. Common examples include Common, Rare, Super Rare, Ultra Rare, Secret Rare and many newer specialty rarities. Exact set code is essential because the same card can appear in many rarities.'},
  {keys:['deck basics','build a deck','deckbuilding'],reply:'Start with a clear win condition, then maximise consistency. Use enough copies of your key starters, keep situational cards under control, and test hands repeatedly. In Yu-Gi-Oh!, legal deck size and banlist matter; in Pokémon, follow current format and energy/trainer balance for the deck you are building.'},
  {keys:['worth','value','price','how much'],reply:'For value, the exact printing and condition matter. Use the scanner so I can identify the card and show a real reference value from the connected card data. I will not make up a price from memory.'},
  {keys:['clean card','cleaning'],reply:'Do not use household cleaners, alcohol or abrasive cloths on trading cards. For ordinary dust, use clean dry hands and very gentle air or a soft non-abrasive approach. If a valuable card has residue, aggressive cleaning can reduce value.'},
  {keys:['binder'],reply:'A good side-loading, acid-free binder with no metal rings pressing on cards is a solid choice. Sleeve cards before putting them in pockets, avoid overfilling pages, and store the binder upright in a dry place.'},
  {keys:['top loader','toploader'],reply:'Put the card in a soft penny sleeve before a top loader. Never push an unsleeved card straight into rigid plastic because the surface and edges can scuff.'},
  {keys:['magikarp'],reply:'Magikarp? Absolute powerhouse. Clearly the final boss of the hobby. 😂'}
];

export function localAnswer(input){
  const q=String(input||'').toLowerCase();
  for(const rule of RULES){if(rule.keys.some(k=>q.includes(k)))return rule.reply;}
  return null;
}

export function extractName(input){
  const s=String(input||'').trim();
  const patterns=[/\bmy name is\s+([a-z][a-z' -]{1,24})/i,/\bi(?:'m| am)\s+([a-z][a-z' -]{1,24})/i,/\bcall me\s+([a-z][a-z' -]{1,24})/i];
  for(const p of patterns){const m=s.match(p);if(m)return m[1].trim().replace(/\s+(and|but|because).*$/i,'').replace(/\b\w/g,c=>c.toUpperCase());}
  return null;
}
