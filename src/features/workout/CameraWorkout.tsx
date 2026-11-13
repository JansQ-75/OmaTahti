import { useEffect, useRef, useState } from "react";
import { Camera, Check, Plus, Volume2, VolumeX, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { calibrated, observe, readyElapsed, trackRep, validEstimate } from "./cameraLogic";
import type { CameraExercise, RepTracker, TrackingEstimate } from "./cameraLogic";
import type { createPose } from "./pose";

type Props = { exercise: CameraExercise; name: string; side: "vasen"|"oikea"; set: number; sets: number; done: number; target: number; suspended: boolean; onRep: () => void; onTick: () => void; onComplete: (estimate?: TrackingEstimate) => void; onFallback: () => void; onInterrupt: () => void };
export function CameraWorkout(props: Props) {
 const latest = useRef(props); latest.current = props;
 const video = useRef<HTMLVideoElement>(null);
 const audio = useRef<AudioContext | null>(null);
 const sound = useRef(true);
 const [mode,setMode] = useState<"setup"|"camera"|"simulated">("setup");
 const [status,setStatus] = useState("Aseta laite tukevasti ennen aloittamista.");
 const [error,setError] = useState("");
 const [phase,setPhase] = useState<"waiting"|"calibrating"|"active">("waiting");
 const [countdown,setCountdown] = useState<number|null>(null);
 const [muted,setMuted] = useState(false);
 const finish = useRef<() => void>(() => {});
 const beep = (frequency=660) => {
  const ctx=audio.current; if(!ctx || !sound.current || ctx.state!=="running")return;
  const osc=ctx.createOscillator(), gain=ctx.createGain();osc.frequency.value=frequency;gain.gain.setValueAtTime(.06,ctx.currentTime);gain.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+.16);osc.connect(gain);gain.connect(ctx.destination);osc.start();osc.stop(ctx.currentTime+.17);
 };
 const enable = (next: "camera"|"simulated") => {
  if(!audio.current) audio.current=new AudioContext();
  void audio.current.resume().catch(()=>{});setError("");setMode(next);
 };
 useEffect(()=>()=>{ void audio.current?.close(); },[]);
 useEffect(()=>{
  if(mode==="setup")return;
  let disposed=false, stream: MediaStream|undefined, model: Awaited<ReturnType<typeof createPose>>|undefined;
  let timer: ReturnType<typeof setInterval>|undefined;
  let start:number|null=null, calibrationStart=0, activeStart=0, last=0, second=0, previousCountdown:number|null=null;
  let min=Infinity,max=-Infinity, reliableMs=0,totalMs=0, touches=0,touchSince=0, wasTouching=false, centerMin=Infinity,centerMax=-Infinity;
  let rep:RepTracker|null=null, stage:"waiting"|"calibrating"|"active"="waiting", lastVideoTime=-1;
  setPhase("waiting");setCountdown(null);
  const complete = () => {
   const p=latest.current;
   const valid=validEstimate(reliableMs,totalMs);
   const estimate:TrackingEstimate|undefined = valid ? {source:mode,confidence:Math.round(reliableMs/totalMs*100)/100,view:p.exercise==="ankle-flex"?"sivulta":"edestä",side:p.side,
    ...(p.exercise==="ankle-flex" && Number.isFinite(min) && max-min>=3 ? {rangeDegrees:Math.round(max-min)} : {}),
    ...(p.exercise==="single-leg-balance" ? {groundTouches:touches,sway:Math.round((centerMax-centerMin)*1000)/1000} : {}),
   } : undefined;
   stage="waiting";beep(880);p.onComplete(estimate);
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
     let obs;
     if(mode==="simulated") obs={reliable:true,angle:90+6*Math.sin(now/900),lifted:true,touching:false,center:.5+.004*Math.sin(now/1000)};
     else {
      const v=video.current;if(!v||!model||v.readyState<2||v.currentTime===lastVideoTime)return;
      lastVideoTime=v.currentTime;
      try {obs=observe(model.detectForVideo(v,now).landmarks[0]??[],p.exercise,p.side,v.videoWidth,v.videoHeight);}catch{setError("Liikkeentunnistus ei onnistunut. Voit jatkaa ilman kameraa.");return;}
     }
     const dt=Math.min(250,last?now-last:0);last=now;
     if(stage==="waiting"){
      const ready=readyElapsed(start,now,obs.reliable && (p.exercise==="ankle-flex"||obs.lifted===true));start=ready.start;setCountdown(ready.countdown);
      setStatus(obs.reliable ? (p.exercise==="single-leg-balance"&&!obs.lifted ? "Nosta terve jalka. Ota tarvittaessa tukea." : "Asetu näkyviin ja pysy hetki paikallasi.") : "Kehonosa ei näy selkeästi. Tarkista kameran suunta ja valaistus.");
      if(ready.countdown!==previousCountdown&&ready.countdown!==null)beep();previousCountdown=ready.countdown;
      if(ready.ready){setCountdown(null);beep(880);stage=p.exercise==="ankle-flex"?"calibrating":"active";setPhase(stage);calibrationStart=now;activeStart=now;second=now;}
      return;
     }
     if(stage==="calibrating"){
      setStatus("Liikuta nilkkaa rauhallisesti kivuttomalla liikealueellasi. Sovitetaan laskuri sinulle.");
      if(!obs.reliable){start=null;stage="waiting";min=Infinity;max=-Infinity;setPhase("waiting");return;}
      if(obs.angle!==undefined){min=Math.min(min,obs.angle);max=Math.max(max,obs.angle);}
      if(now-calibrationStart>=6000){
       if(!calibrated(min,max)){setStatus("Pientä liikettä ei voida erottaa luotettavasti. Voit kuitata toistot itse tai jatkaa ilman kameraa.");return;}
       rep={min,max,smooth:obs.angle??min,phase:"low",lastRep:now};stage="active";setPhase("active");activeStart=now;second=now;beep(880);
      }return;
     }
     totalMs+=dt;if(obs.reliable)reliableMs+=dt;
     setStatus(obs.reliable ? "Harjoitus käynnissä – liiku omalla kivuttomalla liikealueellasi." : "Kehonosa ei näy selkeästi. Toistoja ja hallintaa ei arvioida nyt.");
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
  setStatus("Kamera ja liikkeentunnistus käynnistyvät…");void begin();
  return ()=>{disposed=true;if(timer)clearInterval(timer);stream?.getTracks().forEach(t=>t.stop());model?.close();};
 },[mode,props.exercise,props.set,props.side]);
 const hold=props.exercise==="single-leg-balance";
 return <section className="camera-workout" aria-label="Kameraharjoittelu">
  {mode!=="setup" && <video ref={video} muted playsInline className="camera-feed" aria-label="Oma kamerakuva" />}
  <div className="camera-ui">
   <header className="flex flex-wrap items-center justify-between gap-3"><div><p className="font-semibold">{props.name}</p><p className="text-sm">Sarja {props.set+1} / {props.sets} · {props.side} kuntoutettava puoli</p></div><div className="flex gap-2"><Button variant="secondary" size="icon" aria-label={muted?"Äänimerkit päälle":"Äänimerkit pois"} title={muted?"Äänimerkit päälle":"Äänimerkit pois"} onClick={()=>{sound.current=muted;setMuted(!muted);}}>{muted?<VolumeX/>:<Volume2/>}</Button><Button variant="secondary" onClick={props.onInterrupt}><X/> Keskeytä</Button></div></header>
   <main className="flex flex-1 flex-col items-center justify-center gap-5 text-center">
    {mode==="setup" ? <><Camera className="h-12 w-12"/><h2 className="text-2xl font-bold">Valmista kamera</h2><p className="max-w-lg text-lg">{hold?"Aseta laite tukevasti noin 2–3 metrin päähän, kuva edestä. Koko vartalon ja molempien jalkojen tulee näkyä. Seiso tukevan tuolin vieressä.":"Aseta laite sivullesi nilkan korkeudelle. Istu tuolilla: polven, nilkan ja koko jalkaterän tulee näkyä sivulta."}</p><p className="max-w-lg">Hyvä valaistus ja paljas jalkaterä helpottavat tunnistusta. Kamera ei arvioi, teetkö liikkeen oikein.</p><div className="flex flex-wrap justify-center gap-3"><Button size="lg" onClick={()=>enable("camera")}><Camera/> Käytä kameraa</Button><Button variant="secondary" onClick={()=>enable("simulated")}>Simuloitu tila</Button></div></> : <>
     {mode==="simulated"&&<p className="rounded-lg bg-warning-soft px-4 py-2 text-warning">Simuloitu tila – ei oikeaa mittausta</p>}
     <p className="camera-status" role="status">{error||status}</p>
     {countdown!==null?<p className="camera-count">{countdown}</p>:<p className="camera-count">{props.done}<span className="text-3xl"> / {props.target}{hold?" s":""}</span></p>}
     {phase==="calibrating"&&<p className="text-lg">Sovitusliikkeitä ei lasketa toistoiksi. Älä suurenna liikettä kivun läpi.</p>}
     <div className="camera-guide" aria-hidden />
    </>}
   </main>
   <footer className="space-y-3 text-center">
    {mode!=="setup"&&<div className="flex flex-wrap justify-center gap-2">{!hold&&<Button size="lg" onClick={()=>{props.onRep();if(props.done+1>=props.target)finish.current();}}><Plus/> Toisto tehty</Button>}<Button variant="secondary" size="lg" className="h-auto min-h-11 whitespace-normal" onClick={()=>finish.current()}><Check/> Kuittaa sarja ({props.done} / {props.target} {hold?"s":"toistoa"} tehty)</Button></div>}
    <Button variant="secondary" onClick={props.onFallback}>Tee ilman kameraa</Button>
    <p className="text-xs">Kamera-arvio ei ole kliininen mittaus eikä kerro voimasta, paranemisesta tai diagnoosista. Videota ei tallenneta.</p>
   </footer>
  </div>
 </section>;
}
