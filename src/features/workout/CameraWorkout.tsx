import { useEffect, useRef, useState } from "react";
import { Camera, Check, Volume2, VolumeX, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BONES, calibrated, observe, readyElapsed, trackRep, validEstimate } from "./cameraLogic";
import type { CameraExercise, RepTracker, TrackingEstimate } from "./cameraLogic";
import type { createPose } from "./pose";

type Props = { exercise: CameraExercise; name: string; side: "vasen"|"oikea"; set: number; sets: number; done: number; target: number; suspended: boolean; onRep: () => void; onTick: () => void; onComplete: (estimate?: TrackingEstimate) => void; onFallback: () => void; onInterrupt: () => void; onExit: () => void };
export function CameraWorkout(props: Props) {
 const latest = useRef(props); latest.current = props;
 const video = useRef<HTMLVideoElement>(null);
 const audio = useRef<AudioContext | null>(null);
 const sound = useRef(true);
 const [mode,setMode] = useState<"setup"|"camera"|"simulated">("setup");

 const [error,setError] = useState("");
 const [phase,setPhase] = useState<"waiting"|"calibrating"|"active">("waiting");
 const [countdown,setCountdown] = useState<number|null>(null);
 const [muted,setMuted] = useState(false);
 const [word,setWord] = useState("ASETU KUVAAN");
 const [ok,setOk] = useState(false);
 const [dots,setDots] = useState<{x:number;y:number;i?:number}[]>([]);
 const finish = useRef<() => void>(() => {});
 const calib = useRef<{min:number;max:number}|null>(null);
 const beep = (frequency=660) => {
  const ctx=audio.current; if(!ctx || !sound.current || ctx.state!=="running")return;
  const osc=ctx.createOscillator(), gain=ctx.createGain();osc.frequency.value=frequency;gain.gain.setValueAtTime(.06,ctx.currentTime);gain.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+.16);osc.connect(gain);gain.connect(ctx.destination);osc.start();osc.stop(ctx.currentTime+.17);
 };
 const enable = (next: "camera"|"simulated") => {
  try { if(!audio.current) audio.current=new AudioContext(); void audio.current.resume().catch(()=>{}); } catch { sound.current=false;setMuted(true); }
  setError("");setMode(next);
 };
 useEffect(()=>()=>{ void audio.current?.close(); },[]);
 useEffect(()=>{
  if(mode==="setup")return;
  let disposed=false, stream: MediaStream|undefined, model: Awaited<ReturnType<typeof createPose>>|undefined;
  let timer: ReturnType<typeof setInterval>|undefined;
  let start:number|null=null, calibrationStart=0, announceUntil=0, activeStart=0, last=0, second=0, previousCountdown:number|null=null, previousCenter:number|undefined;
  let min=Infinity,max=-Infinity, reliableMs=0,totalMs=0, touches=0,touchSince=0, wasTouching=false, centerMin=Infinity,centerMax=-Infinity;
  let rep:RepTracker|null=null, stage:"waiting"|"calibrating"|"active"|"done"="waiting", lastVideoTime=-1, currentSet=latest.current.set;
  setPhase("waiting");setCountdown(null);
  const complete = () => {
   const p=latest.current;
   const valid=validEstimate(reliableMs,totalMs);
   const estimate:TrackingEstimate|undefined = valid ? {source:mode,confidence:Math.round(reliableMs/totalMs*100)/100,view:p.exercise==="ankle-flex"?"sivulta":"edestä",side:p.side,
    ...(p.exercise==="ankle-flex" && Number.isFinite(min) && max-min>=3 ? {rangeDegrees:Math.round(max-min)} : {}),
    ...(p.exercise==="single-leg-balance" && Number.isFinite(centerMin) ? {groundTouches:touches,sway:Math.round((centerMax-centerMin)*1000)/1000} : {}),
   } : undefined;
   stage="done";beep(880);p.onComplete(estimate);
  };
  finish.current=complete;
  async function begin() {
   try {
    if(mode==="camera"){
     if(!navigator.mediaDevices?.getUserMedia)throw new Error("unavailable");
     stream=await navigator.mediaDevices.getUserMedia({audio:false,video:{facingMode:"user",width:{ideal:640},height:{ideal:480}}});
     if(disposed){stream.getTracks().forEach(t=>t.stop());return;}
     if(video.current){video.current.srcObject=stream;await video.current.play();}
     const {createPose}=await import("./pose"); model=await createPose();
     if(disposed){model.close();return;}
    }
    timer=setInterval(()=>{
     if(disposed)return;
     const now=performance.now(),p=latest.current;
     if(p.suspended || document.hidden){start=null;last=now;second=now;return;}
     if(p.set!==currentSet){
      // New set after a rest: no new calibration or settling; start straight away.
      currentSet=p.set;reliableMs=0;totalMs=0;touches=0;touchSince=0;wasTouching=false;centerMin=Infinity;centerMax=-Infinity;
      if(stage!=="waiting"){
       const c=calib.current;
       if(p.exercise==="ankle-flex"&&c){min=c.min;max=c.max;rep={min:c.min,max:c.max,smooth:c.min,phase:"low",lastRep:now};}
       if(p.exercise!=="ankle-flex"||c){stage="active";setPhase("active");setCountdown(null);announceUntil=now+2000;activeStart=now;second=now;last=now;beep(880);}
      }
     }
     if(stage==="done")return;
     let obs;
     if(mode==="simulated") obs={reliable:true,angle:90+6*Math.sin(now/900),lifted:true,touching:false,center:.5+.004*Math.sin(now/1000)};
     else {
      const v=video.current;if(!v||!model||v.readyState<2||v.currentTime===lastVideoTime)return;
      lastVideoTime=v.currentTime;
      try {obs=observe(model.detectForVideo(v,now).landmarks[0]??[],p.exercise,p.side,v.videoWidth,v.videoHeight);}catch{setError("Liikkeentunnistus ei onnistunut. Voit jatkaa ilman kameraa.");return;}
     }
     setOk(obs.reliable);setDots(mode==="camera"?(obs.dots??[]):[]);
     setWord(!obs.reliable?(obs.hint??"ASETU KUVAAN"):stage==="calibrating"?"LIIKUTA NILKKAA":now<announceUntil?(p.exercise==="ankle-flex"?"ALOITA TOISTOT":"ALOITA"):stage==="active"?"":"HYVÄ ASENTO");
     const dt=Math.min(250,last?now-last:0);last=now;
     if(stage==="waiting"){
      const stationary = obs.center !== undefined && (previousCenter === undefined || Math.abs(obs.center-previousCenter)<.02);
      previousCenter=obs.center;
      const ready=readyElapsed(start,now,stationary && obs.reliable);start=ready.start;setCountdown(ready.countdown);
      if(ready.countdown!==previousCountdown&&ready.countdown!==null)beep();previousCountdown=ready.countdown;
      if(ready.ready){setCountdown(null);beep(880);stage=p.exercise==="ankle-flex"?"calibrating":"active";setPhase(stage);calibrationStart=now;activeStart=now;second=now;}
      return;
     }
     if(stage==="calibrating"){
      if(!obs.reliable){start=null;stage="waiting";setCountdown(null);min=Infinity;max=-Infinity;setPhase("waiting");return;}
      if(obs.angle!==undefined){min=Math.min(min,obs.angle);max=Math.max(max,obs.angle);}
      setCountdown(Math.max(1,Math.ceil((6000-(now-calibrationStart))/1000)));
      if(now-calibrationStart>=15000 && !calibrated(min,max)){setError("Pientä liikettä ei voida erottaa luotettavasti. Kuittaa toistot itse tai jatka ilman kameraa.");return;}
      if(now-calibrationStart>=6000){
       if(!calibrated(min,max)){setError("Pientä liikettä ei voida erottaa luotettavasti. Voit kuitata toistot itse tai jatkaa ilman kameraa.");return;}
       calib.current={min,max};setCountdown(null);announceUntil=now+2000;rep={min,max,smooth:obs.angle??min,phase:"low",lastRep:now};stage="active";setPhase("active");activeStart=now;second=now;beep(880);
      }return;
     }
     totalMs+=dt;if(obs.reliable)reliableMs+=dt;
     if(p.exercise==="ankle-flex" && obs.reliable && obs.angle!==undefined && rep){
      min=Math.min(min,obs.angle);max=Math.max(max,obs.angle);
      const r=trackRep(rep,obs.angle,now);rep=r.state;if(r.rep){beep(880);if(p.done+1>=p.target){p.onRep();complete();}else p.onRep();}
     }
     if(p.exercise==="single-leg-balance"){
      if(obs.reliable){
       if(obs.center!==undefined){centerMin=Math.min(centerMin,obs.center);centerMax=Math.max(centerMax,obs.center);}
       if(obs.touching){if(!touchSince)touchSince=now;if(!wasTouching&&now-touchSince>=400){touches++;wasTouching=true;}}
       else {touchSince=0;wasTouching=false;}
      }else {touchSince=0;wasTouching=false;}
      // Wall-clock duration continues on a ground touch AND loss of tracking.
      if(now-second>=1000){second+=1000;if(p.done+1>=p.target){p.onTick();complete();}else {p.onTick();if(p.done+1===15)beep();}}
     }
     if(now-activeStart>600000){setError("Seuranta on ollut pitkään käynnissä. Jatka ilman kameraa tai keskeytä.");}
    },100);
   }catch(e){
    stream?.getTracks().forEach(t=>t.stop());
    if(!disposed)setError(e instanceof DOMException && e.name==="NotAllowedError" ? "Kameran käyttöä ei sallittu. Voit jatkaa ilman kameraa." : "Kameraa tai liikkeentunnistusta ei saatu käynnistettyä. Voit jatkaa ilman kameraa.");
   }
  }
  void begin();
  return ()=>{disposed=true;if(timer)clearInterval(timer);stream?.getTracks().forEach(t=>t.stop());model?.close();};
 },[mode,props.exercise,props.side]);
 const hold=props.exercise==="single-leg-balance";
 return <section className="camera-workout" aria-label="Kameraharjoittelu">
  {mode!=="setup" && <video ref={video} muted playsInline className="camera-feed" aria-label="Oma kamerakuva" />}
   {mode==="camera" && <svg className="camera-dots" viewBox={`0 0 ${video.current?.videoWidth||640} ${video.current?.videoHeight||480}`} preserveAspectRatio="xMidYMid meet" aria-hidden>{BONES[props.exercise].map(([a,b])=>{const A=dots.find(d=>d.i===a),B=dots.find(d=>d.i===b);return A&&B?<line key={`${a}-${b}`} x1={A.x*(video.current?.videoWidth||640)} y1={A.y*(video.current?.videoHeight||480)} x2={B.x*(video.current?.videoWidth||640)} y2={B.y*(video.current?.videoHeight||480)} />:null;})}{dots.map((d,i)=><circle key={i} cx={d.x*(video.current?.videoWidth||640)} cy={d.y*(video.current?.videoHeight||480)} r="9" />)}</svg>}
  <div className="camera-ui">
   <header className="flex flex-wrap items-center justify-between gap-3"><div><p className="font-semibold">{props.name}</p><p className="text-sm">Sarja {props.set+1} / {props.sets} · {props.side} kuntoutettava puoli</p></div><div className="flex gap-2"><Button variant="secondary" size="icon" className="rounded-full" aria-label={muted?"Äänimerkit päälle":"Äänimerkit pois"} title={muted?"Äänimerkit päälle":"Äänimerkit pois"} onClick={()=>{sound.current=muted;setMuted(!muted);}}>{muted?<VolumeX/>:<Volume2/>}</Button>{phase==="active"?<Button variant="destructive" size="icon" className="rounded-full" aria-label="Keskeytä" title="Keskeytä" onClick={props.onInterrupt}><X/></Button>:<Button variant="secondary" className="rounded-full px-4 text-sm" onClick={props.onExit}>Poistu</Button>}</div></header>
   <main className="flex flex-1 flex-col items-center justify-center gap-5 text-center">
    {mode==="setup" ? <><Camera className="h-12 w-12"/><h2 className="text-2xl font-bold">Valmista kamera</h2><p className="max-w-lg text-lg">{hold?"Aseta laite tukevasti noin 2–3 metrin päähän, kuva edestä. Koko vartalon ja molempien jalkojen tulee näkyä. Seiso tukevan tuolin vieressä.":"Aseta laite sivullesi nilkan korkeudelle. Istu tuolilla: polven, nilkan ja koko jalkaterän tulee näkyä sivulta."}</p><p className="max-w-lg">Hyvä valaistus ja paljas jalkaterä helpottavat tunnistusta. Kamera ei arvioi, teetkö liikkeen oikein.</p><div className="flex flex-wrap justify-center gap-3"><Button size="lg" onClick={()=>enable("camera")}><Camera/> Käytä kameraa</Button><Button variant="secondary" onClick={()=>enable("simulated")}>Simuloitu tila</Button></div></> : <>
     {mode==="simulated"&&<p className="rounded-lg bg-warning-soft px-4 py-2 text-warning">Simuloitu tila – ei oikeaa mittausta</p>}
     {error?<p className="camera-status" role="alert">{error}</p>:word&&<p className={`camera-word ${ok?"is-ok":"is-wait"}`} role="status">{word}</p>}
     {countdown!==null?<p className="camera-count">{countdown}{phase==="calibrating"&&<span className="text-3xl"> s</span>}</p>:<p className="camera-count">{props.done}<span className="text-3xl"> / {props.target}{hold?" s":""}</span></p>}
     <div className={`camera-guide ${ok?"is-ok":"is-wait"}`} aria-hidden />
    </>}
   </main>
   <footer className="space-y-3 text-center">
    {mode!=="setup"&&!props.suspended&&(phase==="active"
     ? <Button size="lg" onClick={()=>finish.current()}><Check/> Valmis ({props.done}/{props.target}{hold?" s":""})</Button>
     : <Button variant="secondary" onClick={props.onFallback}>Tee ilman kameraa</Button>)}
    {mode==="setup"&&<><Button variant="secondary" onClick={props.onFallback}>Tee ilman kameraa</Button><p className="text-xs">Kamera-arvio ei ole kliininen mittaus eikä kerro voimasta, paranemisesta tai diagnoosista. Videota ei tallenneta.</p></>}
   </footer>
  </div>
 </section>;
}
