const wave=document.getElementById('wave'),caption=document.getElementById('caption'),options=document.getElementById('options'),panel=document.getElementById('panel'),title=document.getElementById('panelTitle'),body=document.getElementById('panelBody');
let listening=false;
const templates={
 modes:`<div class="control"><label>ACTIVE MODE</label><select id="mode"><option>Idle</option><option>Engineering</option><option>Boat</option><option>Camping</option><option>Exploration</option><option>Thinking</option><option>Listening</option><option>Alert</option></select></div><div class="control">XP confirms mode changes aloud when speech is connected.</div>`,
 memory:`<div class="control"><label>SHARED XP MEMORY</label><textarea id="memory" placeholder="Persistent shared memory / mothership connection"></textarea><button onclick="save('memory')">SAVE MEMORY</button></div>`,
 voice:`<div class="control"><label>SCOTTISH VOICE</label><input type="range" min="0.7" max="1.4" step="0.05" value="1"><div>Voice speed</div></div>`,
 vision:`<div class="control"><label>VISION</label><button onclick="setCaption('VISION READY')">ENABLE CAMERA INTERFACE</button></div>`,
 text:`<div class="control"><label>TEXT INPUT</label><textarea id="textInput" placeholder="Talk to XP by text..."></textarea><button onclick="sendText()">SEND TO XP</button></div>`,
 settings:`<div class="control"><label>XP SETTINGS</label><button onclick="setCaption('SETTINGS SAVED')">SAVE SETTINGS</button></div>`,
 system:`<div class="control"><label>MOTHERSHIP</label><div>PC interface: ONLINE</div><div>XP identity: SHARED</div><div>Face asset: XP</div></div>`
};
function setCaption(v){caption.textContent=v}window.setCaption=setCaption;
function save(k){localStorage.setItem('xp-'+k,document.getElementById(k)?.value||'');setCaption('SAVED')}window.save=save;
function sendText(){const v=document.getElementById('textInput').value.trim();if(v)setCaption('XP RECEIVED: '+v.slice(0,40))}window.sendText=sendText;
wave.onclick=()=>{listening=!listening;wave.classList.toggle('listening',listening);setCaption(listening?'XP LISTENING':'XP READY')};
document.getElementById('brainButton').onclick=()=>options.classList.toggle('hidden');
document.querySelectorAll('[data-panel]').forEach(b=>b.onclick=()=>{const k=b.dataset.panel;title.textContent=k.toUpperCase();body.innerHTML=templates[k];panel.classList.remove('hidden');options.classList.add('hidden');if(k==='memory'){const m=document.getElementById('memory');m.value=localStorage.getItem('xp-memory')||''}if(k==='modes'){document.getElementById('mode').onchange=e=>{localStorage.setItem('xp-mode',e.target.value);setCaption('MODE: '+e.target.value.toUpperCase())}}});
document.getElementById('close').onclick=()=>panel.classList.add('hidden');
document.getElementById('fullscreen').onclick=async()=>{await window.xpDesktop.toggleFullscreen();options.classList.add('hidden')};
document.addEventListener('keydown',e=>{if(e.key==='Escape'){panel.classList.add('hidden');options.classList.add('hidden')}if(e.key==='F11')window.xpDesktop.toggleFullscreen()});
