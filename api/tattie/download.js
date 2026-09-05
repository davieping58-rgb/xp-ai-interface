const APK='https://github.com/davieping58-rgb/xp-ai-interface/releases/download/tattietcg-latest/TattieTCG.apk';

export default function handler(req,res){
  res.setHeader('Cache-Control','no-store');
  return res.redirect(302,APK);
}
