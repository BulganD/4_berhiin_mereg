const names=["馬","羊","ヤギ","キャメル"];
const files={"馬":"mori.png","羊":"honi.png","ヤギ":"yamaa.png","キャメル":"temee.png"};
const fortuneEl=document.getElementById("fortune");
const hintEl=document.getElementById("hint");
const button=document.getElementById("draw");
let fortunes={};
let motionReady=false;
let previous=null;
let lastShake=0;

fetch("fortune-data.json").then(r=>r.json()).then(data=>{fortunes=data;});

function drawFortune(){
  if(!Object.keys(fortunes).length){fortuneEl.textContent="読み込み中です。少し待ってからもう一度押してください。";return;}
  const result=Array.from({length:4},()=>names[Math.floor(Math.random()*names.length)]);
  result.forEach((animal,i)=>{document.getElementById(`piece-${i}`).src=`assets/${files[animal]}`;});
  fortuneEl.textContent=fortunes[result.join("|")]||"今日は新しい発見がありそうです。";
  if(navigator.vibrate) navigator.vibrate(35);
}

async function enableMotionFromTap(){
  if(motionReady)return true;
  if(typeof DeviceMotionEvent==="undefined"){
    hintEl.textContent="このブラウザでは振動検知に対応していません。ボタンで占えます。";return false;
  }
  if(typeof DeviceMotionEvent.requestPermission==="function"){
    try{
      const permission=await DeviceMotionEvent.requestPermission();
      if(permission!=="granted"){
        hintEl.textContent="振動センサーは許可されませんでした。ボタンは使えます。";return false;
      }
    }catch(e){hintEl.textContent="振動センサーを開始できません。ボタンは使えます。";return false;}
  }
  window.addEventListener("devicemotion",onMotion,{passive:true});
  motionReady=true;
  hintEl.textContent="準備OK！スマホを振っても占えます";
  return true;
}

function onMotion(event){
  const a=event.accelerationIncludingGravity;
  if(!a||a.x==null||a.y==null||a.z==null)return;
  const now=Date.now();
  const current=[a.x,a.y,a.z];
  if(previous){
    const delta=Math.hypot(current[0]-previous[0],current[1]-previous[1],current[2]-previous[2]);
    if(delta>14&&now-lastShake>1200){lastShake=now;drawFortune();}
  }
  previous=current;
}

button.addEventListener("click",async()=>{
  drawFortune();
  await enableMotionFromTap();
});

if("serviceWorker" in navigator){window.addEventListener("load",()=>navigator.serviceWorker.register("service-worker.js").catch(()=>{}));}
