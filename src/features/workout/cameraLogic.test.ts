import { describe, expect, it } from "vitest";
import { calibrated, observe, readyElapsed, trackRep, validEstimate } from "./cameraLogic";
describe("camera safety", () => {
 it("only starts after two seconds visible and a three second countdown", () => {
  expect(readyElapsed(100,2099,true).countdown).toBeNull();
  expect(readyElapsed(100,2100,true).countdown).toBe(3);
  expect(readyElapsed(100,5100,true).ready).toBe(true);
 });
 it("losing visibility resets the countdown", () => { expect(readyElapsed(100,4000,false)).toEqual({start:null,countdown:null,ready:false}); });
 it("missing landmarks cannot produce feedback or counts", () => { expect(observe([],"ankle-flex","vasen",640,480)).toEqual({reliable:false}); });
 it("accepts a small personal range instead of requiring 20–30 degrees", () => { expect(calibrated(90,96)).toBe(true); expect(calibrated(90,92)).toBe(false); });
 it("counts a full out and back movement within a personal six degree range", () => {
  let s = {min:90,max:96,smooth:90,phase:"low" as "low"|"high",lastRep:0}; let reps=0;
  for(let i=0;i<30;i++){ const r=trackRep(s,i<15?96:90,1000+i*100);s=r.state;if(r.rep)reps++; }
  expect(reps).toBe(1);
 });
 it("withholds estimates when visibility coverage is unreliable", () => { expect(validEstimate(7000,10000)).toBe(false); expect(validEstimate(9000,10000)).toBe(true); });
});
