import React,{useRef,useState}from'react';
import{SafeAreaView,View,Text,Pressable,ScrollView,TextInput,StyleSheet,Alert,Image,ActivityIndicator,Linking}from'react-native';
import{StatusBar}from'expo-status-bar';
import{CameraView,useCameraPermissions}from'expo-camera';
import*as Speech from'expo-speech';
import QRCode from'react-native-qrcode-svg';
import{Ionicons}from'@expo/vector-icons';

const P='#b026ff',P2='#6d22ff',BG='#050309',CARD='#120b18',LINE='#3a2148',M='#b8a9c4',W='#ffffff',GREEN='#42ff7a',BLUE='#39baff';
const API='https://xp-ai-interface.vercel.app/api/tattie/chat';
const SHOP='https://tattie-tcg.myshopify.com';
const APK='https://github.com/davieping58-rgb/xp-ai-interface/releases/download/tattietcg-latest/TattieTCG.apk';
const speak=t=>{Speech.stop();Speech.speak(String(t),{language:'en-GB',rate:.92,pitch:.96})};

function Logo(){return <Image source={require('../assets/tattie-logo.jpg')} style={s.logo} resizeMode="contain"/>}
function Header({title}){return <View style={s.header}><Logo/><Text style={s.headerTitle}>{title||''}</Text></View>}
function Btn({children,onPress,outline=false,disabled=false}){return <Pressable disabled={disabled} onPress={onPress} style={[s.btn,outline&&s.btnOutline,disabled&&{opacity:.45}]}><Text style={s.btnText}>{children}</Text></Pressable>}

function Home({go}){
  return <ScrollView contentContainerStyle={s.home}>
    <View style={s.topRow}><Logo/><View style={s.bubble}><Text style={s.bubbleText}>HEY LEGEND!{`\n`}LET'S FIND SOME{`\n`}BANGERS! 🔊</Text></View></View>
    <Pressable onPress={()=>go('tattie')} style={s.hero}>
      <Image source={require('../assets/wee-tattie-home.jpg')} style={s.heroImg} resizeMode="cover"/>
      <View style={s.online}><View style={s.dot}/><Text style={s.onlineText}>WEE TATTIE AI ONLINE</Text></View>
    </Pressable>
    <Pressable style={s.mic} onPress={()=>{speak("Aye legend! I'm Wee Tattie. Fire away!");go('tattie')}}><Ionicons name="mic" size={34} color={W}/></Pressable>
    <View style={s.wave}><View style={s.waveShort}/><View style={s.waveTall}/><View style={s.waveShort}/></View>
    <Pressable style={s.scanHero} onPress={()=>go('scanner')}><Ionicons name="scan-circle" size={52} color={BLUE}/><View style={{flex:1}}><Text style={s.scanTitle}>CARD SCANNER</Text><Text style={s.scanSub}>Scan • Identify • Card info</Text></View><Ionicons name="chevron-forward" size={30} color={P}/></Pressable>
    <View style={s.quickRow}>
      <Quick icon="bag-handle" color="#59ff8e" title="SHOP" sub="TattieTCG" onPress={()=>go('shop')}/>
      <Quick icon="trending-up" color="#43b8ff" title="LAST 5" sub="Sold prices" onPress={()=>go('last5')}/>
      <Quick icon="people" color={P} title="COMMUNITY" sub="Chat & Share" onPress={()=>go('community')}/>
    </View>
    <Text style={s.powered}>♛ DOMHNALL ∞</Text><Text style={s.poweredSub}>POWERED BY XP AI</Text>
  </ScrollView>
}
function Quick({icon,color,title,sub,onPress}){return <Pressable onPress={onPress} style={[s.quick,{borderColor:color}]}><Ionicons name={icon} size={25} color={color}/><Text style={s.quickTitle}>{title}</Text><Text style={s.quickSub}>{sub}</Text></Pressable>}

function Tattie(){
  const[msg,setMsg]=useState([{role:'assistant',content:"Aye legend! I’m Wee Tattie. Pokémon, Yu-Gi-Oh!, collecting, card care or just a blether — fire away."}]);
  const[text,setText]=useState(''); const[busy,setBusy]=useState(false);
  const send=async preset=>{
    const value=String(preset||text).trim(); if(!value||busy)return;
    const before=[...msg]; const next=[...before,{role:'user',content:value}]; setMsg(next);setText('');setBusy(true);
    try{
      const r=await fetch(API,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:value,history:before.slice(-10)})});
      const data=await r.json().catch(()=>({})); if(!r.ok||!data.reply)throw new Error(data.error||'AI unavailable');
      const reply=String(data.reply).trim(); setMsg(m=>[...m,{role:'assistant',content:reply}]);speak(reply);
    }catch(e){const reply="Och, my AI line dropped for a second. Try me again in a wee moment.";setMsg(m=>[...m,{role:'assistant',content:reply}]);speak(reply)}finally{setBusy(false)}
  };
  return <ScrollView contentContainerStyle={s.page}><Header title="WEE TATTIE AI"/>
    <Pressable style={s.agentHero} onPress={()=>speak("Aye! I'm right here, legend.")}><Image source={require('../assets/wee-tattie-home.jpg')} style={s.agentImg} resizeMode="cover"/><View style={s.agentOverlay}/><View style={s.agentStatus}><View style={s.dot}/><Text style={s.onlineText}>{busy?'THINKING…':'READY TO TALK'}</Text></View><View style={s.agentCaption}><Text style={s.agentName}>WEE TATTIE</Text><Text style={s.agentSub}>YOUR TCG AI MATE • TAP ME 🔊</Text></View></Pressable>
    {msg.map((m,i)=><View key={i} style={[s.chat,m.role==='user'&&s.chatUser]}><Text style={s.body}>{m.content}</Text></View>)}
    {busy&&<View style={s.thinking}><ActivityIndicator color={P}/><Text style={s.muted}>Wee Tattie is thinking…</Text></View>}
    <View style={s.chips}>{['Help me identify a card','Pokémon collecting tips','Yu-Gi-Oh! deck basics','Tell me a Tattie joke'].map(x=><Pressable key={x} style={s.chip} onPress={()=>send(x)}><Text style={s.chipText}>{x}</Text></Pressable>)}</View>
    <View style={s.inputRow}><TextInput style={[s.input,{flex:1}]} value={text} onChangeText={setText} placeholder="Talk to Wee Tattie…" placeholderTextColor={M} returnKeyType="send" onSubmitEditing={()=>send()}/><Pressable onPress={()=>send()} disabled={busy} style={s.send}><Ionicons name="send" size={20} color={W}/></Pressable></View>
  </ScrollView>
}

function Scanner(){
  const[permission,requestPermission]=useCameraPermissions(); const cam=useRef(null); const[photo,setPhoto]=useState(null); const[name,setName]=useState('');
  if(!permission)return <View style={s.center}><Text style={s.body}>Loading camera…</Text></View>;
  if(!permission.granted)return <View style={s.center}><Header title="CARD SCANNER"/><Text style={s.body}>Allow camera access so Wee Tattie can scan your card.</Text><Btn onPress={requestPermission}>ALLOW CAMERA</Btn></View>;
  const snap=async()=>{try{const p=await cam.current?.takePictureAsync({quality:.8});if(p?.uri){setPhoto(p.uri);speak('Got it. Nice clear scan.')}}catch{Alert.alert('Scanner','Could not capture the card. Try again.')}};
  const ask=()=>{if(!name.trim())return Alert.alert('Card name','After the photo, type the card name or set number and Wee Tattie can help with the card info.');Linking.openURL('https://www.google.com/search?q='+encodeURIComponent(name.trim()+' trading card'))};
  return <ScrollView contentContainerStyle={s.page}><Header title="CARD SCANNER"/>
    {photo?<><Image source={{uri:photo}} style={s.preview}/><Btn outline onPress={()=>setPhoto(null)}>RETAKE</Btn></>:<View style={s.cameraShell}><CameraView ref={cam} style={s.camera} facing="back"/><View pointerEvents="none" style={s.scanFrame}/><Pressable onPress={snap} style={s.shutter}><Ionicons name="camera" size={30} color={W}/></Pressable></View>}
    <Text style={s.h2}>Scan • Price • Info</Text><Text style={s.body}>Take a clear photo. Type the card name or card number below. No fake prices are shown — live sold-price data will only appear once the live price feed is connected.</Text>
    <TextInput value={name} onChangeText={setName} placeholder="e.g. Pikachu VMAX 044/185" placeholderTextColor={M} style={s.input}/><Btn onPress={ask}>LOOK UP CARD INFO</Btn>
  </ScrollView>
}

function Shop(){const[q,setQ]=useState('');const cats=[['⚡','Pokémon','Singles • Sealed • Graded'],['🐉','Yu-Gi-Oh!','Singles • Sealed • Decks'],['💎','Graded Cards','PSA • CGC • Beckett'],['📦','Sealed','Boxes • Packs • Tins']];return <ScrollView contentContainerStyle={s.page}><Header title="SHOP"/><TextInput value={q} onChangeText={setQ} placeholder="Search categories…" placeholderTextColor={M} style={s.input}/><View style={s.grid}>{cats.filter(c=>c[1].toLowerCase().includes(q.toLowerCase())).map((c,i)=><Pressable key={i} style={s.tile} onPress={()=>Linking.openURL(SHOP)}><Text style={s.tileIcon}>{c[0]}</Text><Text style={s.bold}>{c[1]}</Text><Text style={s.muted}>{c[2]}</Text></Pressable>)}</View><Btn onPress={()=>Linking.openURL(SHOP)}>OPEN LIVE TATTIE SHOP</Btn></ScrollView>}

function Last5(){const[name,setName]=useState('');return <ScrollView contentContainerStyle={s.page}><Header title="LAST 5 SALES"/><View style={s.notice}><Ionicons name="shield-checkmark" size={28} color={GREEN}/><Text style={[s.body,{flex:1}]}>This screen will not invent prices. Enter a card to check live sold listings until the direct price feed is connected.</Text></View><TextInput value={name} onChangeText={setName} placeholder="Card name…" placeholderTextColor={M} style={s.input}/><Btn onPress={()=>{if(!name.trim())return Alert.alert('Card name','Enter a card first.');Linking.openURL('https://www.ebay.co.uk/sch/i.html?_nkw='+encodeURIComponent(name.trim())+'&LH_Sold=1&LH_Complete=1')}}>CHECK LIVE SOLD LISTINGS</Btn></ScrollView>}

function Community(){const[posts,setPosts]=useState([{id:1,user:'PokeMaster1',text:'Pulled a beauty today 🔥',likes:24},{id:2,user:'YugiFan99',text:'Rate the deck combo lads 😂',likes:18}]);return <ScrollView contentContainerStyle={s.page}><Header title="COMMUNITY"/>{posts.map(p=><View key={p.id} style={s.post}><Text style={s.bold}>{p.user}</Text><Text style={s.body}>{p.text}</Text><Pressable onPress={()=>setPosts(a=>a.map(x=>x.id===p.id?{...x,likes:x.likes+1}:x))}><Text style={s.muted}>💜 {p.likes}   💬 Reply</Text></Pressable></View>)}<Btn onPress={()=>setPosts(a=>[{id:Date.now(),user:'You',text:'New Tattie crew post 🥔🔥',likes:0},...a])}>+ NEW POST</Btn></ScrollView>}

function Menu({go}){return <ScrollView contentContainerStyle={s.page}><Header title="MENU"/>{['My Collection','Wishlist','Price Alerts','Trade List'].map(x=><Pressable key={x} style={s.menuLine} onPress={()=>Alert.alert(x,'This section is ready for your saved collection data.')}><Text style={s.bold}>{x}</Text><Ionicons name="chevron-forward" size={20} color={P}/></Pressable>)}<Btn onPress={()=>go('tattie')}>TALK TO WEE TATTIE AI</Btn><Btn outline onPress={()=>go('qr')}>QR DOWNLOAD</Btn><Text style={[s.muted,{textAlign:'center'}]}>DOMHNALL • Making Technology Available For All</Text></ScrollView>}
function QR(){return <ScrollView contentContainerStyle={[s.page,{alignItems:'center'}]}><Header title="GET THE APP"/><Text style={s.h2}>TattieTCG Android</Text><Text style={[s.body,{textAlign:'center'}]}>Scan this QR code for the current official APK.</Text><View style={s.qr}><QRCode value={APK} size={220}/></View><Btn onPress={()=>Linking.openURL(APK)}>DOWNLOAD APK</Btn></ScrollView>}

export default function App(){const[screen,setScreen]=useState('home');const pages={home:<Home go={setScreen}/>,scanner:<Scanner/>,shop:<Shop/>,last5:<Last5/>,community:<Community/>,menu:<Menu go={setScreen}/>,tattie:<Tattie/>,qr:<QR/>};const special=['tattie','qr'].includes(screen);const tabs=[['home','home','Home'],['scanner','scan','Scanner'],['shop','bag-handle','Shop'],['last5','trending-up','Last 5'],['community','people','Community'],['menu','menu','Menu']];return <SafeAreaView style={s.safe}><StatusBar style="light"/><View style={{flex:1}}>{pages[screen]}</View>{special?<View style={s.backDock}><Btn onPress={()=>setScreen('home')}>‹ BACK HOME</Btn></View>:<View style={s.nav}>{tabs.map(t=><Pressable key={t[0]} onPress={()=>setScreen(t[0])} style={s.navItem}><Ionicons name={t[1]} size={20} color={screen===t[0]?P:M}/><Text style={[s.navText,screen===t[0]&&{color:P}]}>{t[2]}</Text></Pressable>)}</View>}</SafeAreaView>}

const s=StyleSheet.create({
 safe:{flex:1,backgroundColor:BG},home:{padding:12,paddingBottom:22,gap:11},page:{padding:16,paddingBottom:34,gap:14},center:{flex:1,backgroundColor:BG,padding:20,justifyContent:'center',gap:16},
 header:{minHeight:62,flexDirection:'row',alignItems:'center',justifyContent:'space-between'},logo:{width:158,height:56,borderRadius:10},headerTitle:{color:W,fontSize:18,fontWeight:'900',maxWidth:170,textAlign:'right'},topRow:{flexDirection:'row',justifyContent:'space-between',alignItems:'flex-start'},bubble:{backgroundColor:'#0b0710',borderColor:P,borderWidth:2,borderRadius:20,padding:10},bubbleText:{color:W,fontWeight:'900',fontSize:12,textAlign:'center'},
 hero:{height:320,borderRadius:27,overflow:'hidden',borderWidth:2,borderColor:'#5d197b',backgroundColor:'#170920'},heroImg:{width:'100%',height:'100%'},online:{position:'absolute',right:10,bottom:10,flexDirection:'row',gap:7,alignItems:'center',backgroundColor:'#050309dd',borderWidth:1,borderColor:'#777',borderRadius:18,paddingHorizontal:10,paddingVertical:6},dot:{width:11,height:11,borderRadius:6,backgroundColor:GREEN},onlineText:{color:W,fontWeight:'900',fontSize:10},
 mic:{alignSelf:'center',marginTop:-35,width:74,height:74,borderRadius:37,borderWidth:5,borderColor:P,backgroundColor:'#08050b',alignItems:'center',justifyContent:'center'},wave:{height:16,flexDirection:'row',justifyContent:'center',alignItems:'center',gap:5},waveShort:{width:70,height:3,borderRadius:2,backgroundColor:P},waveTall:{width:20,height:11,borderRadius:5,backgroundColor:P},scanHero:{flexDirection:'row',alignItems:'center',gap:12,borderWidth:2,borderColor:P,borderRadius:23,padding:14,backgroundColor:CARD},scanTitle:{color:W,fontSize:20,fontWeight:'900'},scanSub:{color:M,fontSize:12,marginTop:2},
 quickRow:{flexDirection:'row',gap:8},quick:{flex:1,minHeight:102,borderWidth:1.5,borderRadius:18,padding:10,backgroundColor:CARD,justifyContent:'center'},quickTitle:{color:W,fontWeight:'900',fontSize:13,marginTop:7},quickSub:{color:M,fontSize:10,marginTop:2},powered:{color:W,textAlign:'center',fontWeight:'900',marginTop:4},poweredSub:{color:P,textAlign:'center',fontSize:10,letterSpacing:2},
 btn:{minHeight:48,borderRadius:15,backgroundColor:P,alignItems:'center',justifyContent:'center',paddingHorizontal:18},btnOutline:{backgroundColor:'transparent',borderWidth:1.5,borderColor:P},btnText:{color:W,fontWeight:'900',letterSpacing:.5},input:{minHeight:50,borderWidth:1,borderColor:LINE,borderRadius:14,backgroundColor:'#0c0711',color:W,paddingHorizontal:14,fontSize:15},body:{color:W,fontSize:15,lineHeight:21},muted:{color:M,fontSize:13,lineHeight:19},bold:{color:W,fontWeight:'900',fontSize:16},h2:{color:W,fontWeight:'900',fontSize:21},
 agentHero:{height:280,borderRadius:25,overflow:'hidden',borderWidth:2,borderColor:P},agentImg:{width:'100%',height:'100%'},agentOverlay:{...StyleSheet.absoluteFillObject,backgroundColor:'#00000022'},agentStatus:{position:'absolute',top:10,right:10,flexDirection:'row',alignItems:'center',gap:7,backgroundColor:'#050309dd',paddingHorizontal:10,paddingVertical:6,borderRadius:18},agentCaption:{position:'absolute',left:15,bottom:14},agentName:{color:W,fontSize:25,fontWeight:'900'},agentSub:{color:'#e3c7ff',fontSize:11,fontWeight:'700'},chat:{alignSelf:'flex-start',maxWidth:'88%',backgroundColor:'#17101f',borderRadius:17,padding:12,borderWidth:1,borderColor:'#352340'},chatUser:{alignSelf:'flex-end',backgroundColor:'#56117d',borderColor:P},thinking:{flexDirection:'row',alignItems:'center',gap:9},chips:{flexDirection:'row',flexWrap:'wrap',gap:8},chip:{borderWidth:1,borderColor:'#5f3672',borderRadius:18,paddingHorizontal:11,paddingVertical:8,backgroundColor:'#0d0812'},chipText:{color:'#e9d9f3',fontSize:12},inputRow:{flexDirection:'row',gap:8,alignItems:'center'},send:{width:50,height:50,borderRadius:16,backgroundColor:P,alignItems:'center',justifyContent:'center'},
 cameraShell:{height:480,borderRadius:24,overflow:'hidden',backgroundColor:'#000'},camera:{flex:1},scanFrame:{position:'absolute',left:34,right:34,top:55,bottom:90,borderWidth:3,borderColor:P,borderRadius:18},shutter:{position:'absolute',bottom:20,alignSelf:'center',left:'43%',width:58,height:58,borderRadius:29,backgroundColor:P,alignItems:'center',justifyContent:'center'},preview:{height:440,width:'100%',borderRadius:22,backgroundColor:'#111'},
 grid:{flexDirection:'row',flexWrap:'wrap',gap:10},tile:{width:'48%',minHeight:145,borderRadius:20,borderWidth:1,borderColor:LINE,backgroundColor:CARD,padding:14,justifyContent:'center'},tileIcon:{fontSize:31,marginBottom:8},notice:{flexDirection:'row',gap:10,alignItems:'center',padding:13,borderRadius:16,borderWidth:1,borderColor:'#285c38',backgroundColor:'#07130c'},post:{borderWidth:1,borderColor:LINE,borderRadius:18,backgroundColor:CARD,padding:14,gap:8},menuLine:{minHeight:55,borderBottomWidth:1,borderBottomColor:LINE,flexDirection:'row',alignItems:'center',justifyContent:'space-between'},qr:{backgroundColor:W,padding:16,borderRadius:16},
 nav:{height:66,borderTopWidth:1,borderTopColor:'#2a1a33',backgroundColor:'#09060c',flexDirection:'row'},navItem:{flex:1,alignItems:'center',justifyContent:'center',gap:3},navText:{fontSize:9,color:M},backDock:{padding:10,borderTopWidth:1,borderTopColor:LINE,backgroundColor:'#09060c'}
});
