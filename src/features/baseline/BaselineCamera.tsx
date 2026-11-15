import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BONES, observe, readyElapsed, validEstimate } from "@/features/workout/cameraLogic";
import type { Point } from "@/features/workout/cameraLogic";
import type { createPose } from "@/features/workout/pose";
import type { BaselineTest } from "@/data/baselineTests";
import type { BaselineResult, BodyArea } from "@/types";

type Props = { audioContext: AudioContext | null; test: BaselineTest; bodyArea: BodyArea; side: "vasen" | "oikea"; onComplete: (result: BaselineResult) => void; onExit: () => void };
export function BaselineCamera({ audioContext, test, bodyArea, side, onComplete, onExit }: Props) {
  const video = useRef<HTMLVideoElement>(null);
  const audio = useRef<AudioContext | null>(audioContext);
  const mutedRef = useRef(false);
  const [muted, setMuted] = useState(!audioContext);
  const [state, setState] = useState({ word: "ASETU KUVAAN", count: null as number | null, reliable: false, active: false, dots: [] as Point[], width: 640, height: 480 });
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const callback = useRef(onComplete); callback.current = onComplete;
  const beep = () => {
    const ctx = audio.current;
    if (!ctx || mutedRef.current || ctx.state !== "running") return;
    const tone = ctx.createOscillator(), gain = ctx.createGain();
    tone.frequency.value = 880; gain.gain.setValueAtTime(.06, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(.001, ctx.currentTime + .16);
    tone.connect(gain); gain.connect(ctx.destination); tone.start(); tone.stop(ctx.currentTime + .17);
  };
  useEffect(() => {
    let disposed = false, stream: MediaStream | undefined, model: Awaited<ReturnType<typeof createPose>> | undefined;
    let timer: ReturnType<typeof setInterval> | undefined;
    let readyStart: number | null = null, active = false, done = false, last = 0, lastVideoTime = -1, previousCenter: number | undefined, announceUntil = 0;
    let total = 0, reliable = 0, min = Infinity, max = -Infinity, swayMin = Infinity, swayMax = -Infinity, touches = 0, touchingMs = 0, touching = false;
    let previousCount: number | null = null;
    let lastObservation = { reliable: false } as ReturnType<typeof observe>;
    setError("");
    setState({ word: "ASETU KUVAAN", count: null, reliable: false, active: false, dots: [], width: 640, height: 480 });
    async function start() {
      try {
        if (!navigator.mediaDevices?.getUserMedia) throw new Error("camera");
        stream = await navigator.mediaDevices.getUserMedia({ audio: false, video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } } });
        if (disposed) { stream.getTracks().forEach(t => t.stop()); return; }
        if (video.current) { video.current.srcObject = stream; await video.current.play(); }
        const { createPose } = await import("@/features/workout/pose");
        model = await createPose();
        if (disposed) { model.close(); return; }
        timer = setInterval(() => {
          if (disposed || done) return;
          const now = performance.now();
          if (document.hidden) { readyStart = null; last = now; return; }
          const dt = Math.min(200, last ? now - last : 0); last = now;
          const v = video.current;
          if (!v || !model) return;
          // Keep the latest detection until the camera delivers a new frame, so dots,
          // countdown and reliability do not reset between frames.
          if (v.readyState >= 2 && v.currentTime !== lastVideoTime) {
            lastVideoTime = v.currentTime;
            try { lastObservation = observe(model.detectForVideo(v, now).landmarks[0] ?? [], test.exercise, side, v.videoWidth, v.videoHeight); }
            catch { done = true; setError("Liikkeentunnistus ei onnistunut. Kokeile uudelleen tai jatka myöhemmin."); return; }
          }
          const observation = lastObservation;
          let count: number | null = null;
          let word = observation.reliable ? "HYVÄ ASENTO" : observation.hint ?? "ASETU KUVAAN";
          if (!active) {
            const stationary = observation.center !== undefined && (previousCenter === undefined || Math.abs(observation.center - previousCenter) < .02);
            previousCenter = observation.center;
            const ready = readyElapsed(readyStart, now, stationary && observation.reliable); readyStart = ready.start; count = ready.countdown;
            if (ready.ready) {
              active = true; last = now; announceUntil = now + 2000; beep();
              count = test.durationSeconds;
              word = test.exercise === "single-leg-balance" ? "ALOITA · NOSTA TOINEN JALKA" : "LIIKUTA NILKKAA";
            }
          } else {
            total += dt;
            if (observation.reliable) {
              reliable += dt;
              if (observation.angle !== undefined) { min = Math.min(min, observation.angle); max = Math.max(max, observation.angle); }
              if (observation.center !== undefined) { swayMin = Math.min(swayMin, observation.center); swayMax = Math.max(swayMax, observation.center); }
              if (observation.touching) { touchingMs += dt; if (!touching && touchingMs >= 400) { touches++; touching = true; } }
              else { touchingMs = 0; touching = false; }
              word = test.exercise === "ankle-flex" ? "LIIKUTA NILKKAA" : now < announceUntil ? "ALOITA · NOSTA TOINEN JALKA" : "PIDÄ ASENTO";
            } else { touchingMs = 0; touching = false; }
            count = Math.max(0, Math.ceil(test.durationSeconds - total / 1000));
            if (total >= test.durationSeconds * 1000) {
              done = true;
              stream?.getTracks().forEach(t => t.stop());
              if (!validEstimate(reliable, total) || (test.exercise === "ankle-flex" ? !Number.isFinite(min) : !Number.isFinite(swayMin))) {
                setError("Kuva ei pysynyt riittävän luotettavana. Tulosta ei tallennettu. Kokeile uudelleen tai jatka myöhemmin.");
              } else {
                beep();
                callback.current({ testId: test.id, bodyArea, side, date: new Date().toISOString(), source: "camera", view: test.view, confidence: Math.round(reliable / total * 100) / 100,
                  ...(test.exercise === "ankle-flex" ? { rangeDegrees: Math.round(max - min) } : { durationSeconds: test.durationSeconds, groundTouches: touches, sway: Math.round((swayMax - swayMin) * 1000) / 1000 }) });
              }
            }
          }
          if (count !== previousCount && count !== null && !active) beep(); previousCount = count;
          setState({ word, count, reliable: observation.reliable, active, dots: observation.dots ?? [], width: v.videoWidth || 640, height: v.videoHeight || 480 });
        }, 100);
      } catch (e) {
        stream?.getTracks().forEach(t => t.stop());
        if (!disposed) setError(e instanceof DOMException && e.name === "NotAllowedError" ? "Kameran käyttöä ei sallittu. Salli kamera laitteen asetuksissa ja kokeile uudelleen." : "Kameraa ei saatu käynnistettyä. Kokeile uudelleen tai jatka myöhemmin.");
      }
    }
    void start();
    return () => { disposed = true; if (timer) clearInterval(timer); stream?.getTracks().forEach(t => t.stop()); model?.close(); };
  }, [test, bodyArea, side, attempt]);
  useEffect(() => () => { const ctx = audio.current; if (ctx && ctx.state !== "closed") void ctx.close().catch(() => {}); }, []);
  return <section className="camera-workout fixed inset-0 z-50 overflow-y-auto" aria-label="Alkukartoituksen kameratesti">
    <video ref={video} className="camera-feed" muted playsInline aria-label="Oma kamerakuva" />
    <svg className="camera-dots" viewBox={`0 0 ${state.width} ${state.height}`} preserveAspectRatio="xMidYMid meet" aria-hidden>
      {BONES[test.exercise].map(([a, b]) => { const A = state.dots.find(p => p.i === a), B = state.dots.find(p => p.i === b); return A && B ? <line key={`${a}-${b}`} x1={A.x * state.width} y1={A.y * state.height} x2={B.x * state.width} y2={B.y * state.height} /> : null; })}
      {state.dots.map(p => <circle key={p.i} cx={p.x * state.width} cy={p.y * state.height} r="9" />)}
    </svg>
    <div className="camera-ui">
      <header className="flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-xl font-bold">{test.name}</h1><p>{side} puoli</p></div><div className="flex gap-2">
        <Button variant="secondary" size="icon" title={muted ? "Äänimerkit päälle" : "Äänimerkit pois"} aria-label={muted ? "Äänimerkit päälle" : "Äänimerkit pois"} onClick={() => {
          if (!audio.current) { try { audio.current = new AudioContext(); } catch { return; } }
          void audio.current.resume(); mutedRef.current = !muted; setMuted(!muted);
        }}>{muted ? <VolumeX /> : <Volume2 />}</Button>
        <Button variant="secondary" onClick={onExit}>Jatka myöhemmin</Button>
      </div></header>
      <main className="flex flex-1 flex-col items-center justify-center gap-5 text-center">
        {error ? <><p role="alert" className="camera-status">{error}</p><Button size="lg" onClick={() => setAttempt(n => n + 1)}>Kokeile uudelleen</Button></> : <>
          <p role="status" className={`camera-word ${state.reliable ? "is-ok" : "is-wait"}`}>{state.word}</p>
          {state.count !== null && <p className="camera-count">{state.count}<span className="text-3xl">{state.active ? " s" : ""}</span></p>}
          <div className={`camera-guide ${state.reliable ? "is-ok" : "is-wait"}`} aria-hidden />
        </>}
      </main>
    </div>
  </section>;
}