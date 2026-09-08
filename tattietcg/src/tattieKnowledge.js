const RULES=[
  {keys:['hello','hi','hey','hiya','alright'],reply:"Aye legend! Wee Tattie reporting for card duty 🥔 What are we hunting today?"},
  {keys:['sleeve','protect','storage','store card'],reply:'For everyday protection: penny sleeve first, then a side-loading binder or rigid holder. Keep cards dry, cool, flat and out of direct sunlight. For valuable cards, use a fresh sleeve plus a semi-rigid or top loader.'},
  {keys:['condition','near mint','lightly played','moderately played','heavily played'],reply:'Condition matters massively. Check corners, edges, surface scratches, whitening, dents, creases and centering under good light. A dent or crease is a major defect even if the front looks tidy.'},
  {keys:['grading','psa','cgc','beckett','bgs'],reply:'Before grading, compare likely grade, raw value and grading cost. Inspect centering, corners, edges and surface under strong angled light. Grading can protect and authenticate a card, but it never guarantees a profit or a particular grade.'},
  {keys:['centering'],reply:'For centering, compare the border widths left-to-right and top-to-bottom on the front, then check the back too. Strongly uneven borders can cap a grade even when corners and surface are clean.'},
  {keys:['surface'],reply:'Surface checks catch scratches, print lines, dents, stains, clouding and roller marks. Tilt the card slowly under a bright light; many flaws disappear when viewed straight-on.'},
  {keys:['corners','whitening'],reply:'Corner whitening and tiny chips are common grade killers. Check all four front and back corners under good light and avoid judging from a sleeve alone.'},
  {keys:['fake','counterfeit','real card','authentic'],reply:'Red flags include wrong fonts, odd colours, blurry text, incorrect holo pattern, poor card stock, bad borders and a back that does not match genuine examples. Compare set number, symbol, copyright line and known scans. For expensive cards, get a second opinion before buying.'},
  {keys:['pokemon set number','pokémon set number','collector number'],reply:'On Pokémon cards the collector number is usually near the bottom, shown like 044/185. The first part identifies the card within the set and the second is the printed set size. Special cards can exceed the printed set total.'},
  {keys:['pokemon rarity','pokémon rarity','rarity symbol'],reply:'Pokémon rarity changes by era. Older cards commonly use circle/common, diamond/uncommon and star/rare; modern sets add categories such as Illustration Rare and Special Illustration Rare. Identify the exact set before judging rarity.'},
  {keys:['first edition pokemon','1st edition pokemon','first edition pokémon','1st edition pokémon'],reply:'For older Pokémon releases, a genuine 1st Edition stamp can matter a lot, but not every set or language used the same system. Check exact set, language, stamp placement and printing before paying a premium.'},
  {keys:['shadowless'],reply:'Shadowless usually refers to early English Base Set Pokémon cards without the drop shadow beside the artwork frame. 1st Edition and Shadowless overlap, but they are not the same label.'},
  {keys:['reverse holo','reverse holographic'],reply:'A reverse holo normally foils an area that is not the standard artwork-window holo treatment. Exact appearance varies by set, so match the card to the correct set before deciding which variant you have.'},
  {keys:['holo','holographic'],reply:'Holo patterns vary hugely by set and era. A card name alone is not enough to identify the printing; set number, set symbol, language and foil treatment all matter.'},
  {keys:['promo','promotional card'],reply:'Promos often use their own numbering or promo symbols and can have multiple printings with similar artwork. Always match the promo number, language and release version rather than relying on the picture alone.'},
  {keys:['japanese pokemon','japanese pokémon','japanese card'],reply:'Japanese Pokémon cards can differ from English releases in set numbering, rarity, print quality and release timing. Compare against the Japanese set specifically; do not assume an English card with the same artwork is the same printing.'},
  {keys:['pokemon deck','pokémon deck'],reply:'For a Pokémon deck, build around a clear attacker or strategy, then add enough draw/search support and the energy the deck actually needs. Format legality changes, so check the current official rules before tournament play.'},
  {keys:['pokemon energy','pokémon energy'],reply:'Energy balance depends on the deck. Too much energy can make hands clunky; too little can stall attacks. Start from the needs of your main attackers and test repeated opening hands rather than using a fixed one-size-fits-all number.'},
  {keys:['pokemon evolution','pokémon evolution'],reply:'Evolution lines need consistency: enough Basics to start, then sensible counts of Stage 1/Stage 2 pieces and search support. Some decks skip stages through card effects, so build around the specific strategy.'},
  {keys:['yugioh code','yu-gi-oh code','set code'],reply:'Yu-Gi-Oh! cards normally show a set code such as LOB-001 or a regional variant beneath the artwork area. That code is one of the quickest ways to identify the exact printing, set and rarity.'},
  {keys:['yugioh rarity','yu-gi-oh rarity'],reply:'Yu-Gi-Oh! rarity is identified by foil treatment, name colour and printing details. Common examples include Common, Rare, Super Rare, Ultra Rare and Secret Rare, plus many specialty rarities. Exact set code matters because the same card can appear in many rarities.'},
  {keys:['first edition yugioh','1st edition yugioh','first edition yu-gi-oh','1st edition yu-gi-oh'],reply:'Yu-Gi-Oh! 1st Edition markings indicate a particular print run, but value depends on set, region, rarity and condition. Always pair the edition mark with the exact set code.'},
  {keys:['unlimited yugioh','unlimited yu-gi-oh'],reply:'An Unlimited Yu-Gi-Oh! printing is not automatically worthless; some older or scarce printings remain collectible. Identify the exact set code and compare the correct edition rather than a generic card-name price.'},
  {keys:['ocg','tcg yugioh','tcg yu-gi-oh'],reply:'Yu-Gi-Oh! OCG and TCG releases can differ in card pool, set codes, rarities and legality. Make sure you are checking the market and rules for the region/version printed on the card.'},
  {keys:['banlist','forbidden','limited yugioh','limited yu-gi-oh'],reply:'Yu-Gi-Oh! banlists change, so I will not pretend an old list is current. Check the latest official Forbidden & Limited list for tournament legality.'},
  {keys:['extra deck'],reply:'The Extra Deck holds Fusion, Synchro, Xyz and Link monsters, plus Pendulum monsters when rules place them there. Exact deck-building limits and legality should be checked against the current official rules.'},
  {keys:['deck basics','build a deck','deckbuilding'],reply:'Start with a clear win condition, then maximise consistency. Use enough copies of key starters, keep situational cards under control, and test hands repeatedly. Tournament formats and legality change, so verify current official rules.'},
  {keys:['worth','value','price','how much'],reply:'For value, exact printing and condition matter. Use the scanner so I can identify the card and show a real reference value from connected card data. I will not make up a current price from memory.'},
  {keys:['market price','trend price','average price'],reply:'A market, trend or average figure is a reference, not a guaranteed sale price. Real value can move with condition, edition, language, demand, fees and how quickly you want to sell.'},
  {keys:['clean card','cleaning'],reply:'Do not use household cleaners, alcohol or abrasive cloths on trading cards. For ordinary dust, use clean dry hands and a very gentle approach. Aggressive cleaning can permanently damage a card and reduce value.'},
  {keys:['binder'],reply:'A good side-loading, acid-free binder with no metal rings pressing on cards is a solid choice. Sleeve cards before pocketing them, avoid overfilling pages and keep the binder dry and away from heat or sunlight.'},
  {keys:['top loader','toploader'],reply:'Put the card in a soft penny sleeve before a top loader. Never push an unsleeved card straight into rigid plastic because the surface and edges can scuff.'},
  {keys:['semi rigid','card saver'],reply:'Semi-rigid holders are popular for submissions because they protect the card while allowing careful removal. Always sleeve first and avoid forcing a thick card into a holder that is too tight.'},
  {keys:['magnetic holder','one touch'],reply:'Magnetic one-touch holders can look great for display. Use the correct thickness, make sure the card is not pinched, and consider an inner sleeve only if the holder is designed to accommodate one.'},
  {keys:['humidity','damp','moisture'],reply:'Humidity is bad news for card stock. Store cards in a stable, dry room away from sheds, loft extremes and direct heat. Silica packs can help in storage boxes, but do not let them rub directly against cards.'},
  {keys:['sunlight','uv'],reply:'Direct sunlight and UV can fade inks and damage display pieces over time. Keep valuable cards away from sunny windows; UV-resistant display cases help but do not make sunlight harmless.'},
  {keys:['ship card','post card','mail card'],reply:'For shipping: sleeve the card, use a rigid or semi-rigid holder, protect it from moisture, stop it sliding around and use a sturdy mailer. Do not tape directly across the card or leave adhesive where it can catch an edge.'},
  {keys:['trade safely','safe trade','trading safely'],reply:'For trades, agree the exact card, printing and condition first. Use clear photos, keep payment/address details private, and for valuable deals use tracked delivery or a trusted in-person venue.'},
  {keys:['booster box','sealed box','sealed product'],reply:'With sealed product, check factory seals, shrink wrap, box condition and seller reputation. Reseals and tampering can be subtle, so compare with known genuine examples before paying a premium.'},
  {keys:['weigh packs','weighed pack'],reply:'Pack weighing can sometimes correlate with contents in certain products or eras, but it is not universal and packaging variation can make it unreliable. Treat claims about “heavy” packs cautiously unless the exact product is well documented.'},
  {keys:['misprint','error card'],reply:'A true misprint is different from ordinary damage. Off-centering, ink errors, crimps or print defects may interest collectors, but value depends on severity, authenticity and demand. Do not assume every factory flaw is valuable.'},
  {keys:['crease','bent card'],reply:'A crease or bend is a serious condition issue. Flattening may improve appearance but can leave fibre damage and does not restore the original grade. Avoid heat, moisture or pressing experiments on valuable cards.'},
  {keys:['language','foreign card'],reply:'Language can materially affect demand and price. Always compare the same language, set, edition and condition rather than using the highest price you see for the artwork.'},
  {keys:['set symbol'],reply:'Set symbols and set codes are key identifiers. If two cards share artwork but have different symbols or codes, treat them as different printings for rarity and value purposes.'},
  {keys:['card number'],reply:'The card number is one of the best identification clues. Pair it with the card name, set symbol/code, language and visible rarity treatment to avoid matching the wrong printing.'},
  {keys:['magikarp'],reply:'Magikarp? Absolute powerhouse. Clearly the final boss of the hobby. 😂'}
];

export function localAnswer(input){
  const q=String(input||'').toLowerCase();
  for(const rule of RULES){if(rule.keys.some(k=>q.includes(k)))return rule.reply;}
  return null;
}

export function extractName(input){
  const s=String(input||'').trim();
  const patterns=[/\bmy name is\s+([a-z][a-z' -]{1,24})(?:[.!?]|$)/i,/\bcall me\s+([a-z][a-z' -]{1,24})(?:[.!?]|$)/i,/^\s*i(?:'m| am)\s+([a-z][a-z'-]{1,20})\s*[.!?]?$/i];
  for(const p of patterns){const m=s.match(p);if(m)return m[1].trim().replace(/\b\w/g,c=>c.toUpperCase());}
  return null;
}
