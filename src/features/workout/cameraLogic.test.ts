import { describe, expect, it } from "vitest";
import { calibrated, observe, readyElapsed, trackRep, validEstimate } from "./cameraLogic";
describe("camera safety", () => {
 it("only starts after one second steady and a five second countdown", () => {
  expect(readyElapsed(100,1099,true).countdown).toBeNull();
  expect(readyElapsed(100,1100,true).countdown).toBe(5);
  expect(readyElapsed(100,5100,true).countdown).toBe(1);
  expect(readyElapsed(100,6099,true).ready).toBe(false);
  expect(readyElapsed(100,6100,true).ready).toBe(true);
 });
 it("losing visibility resets the countdown", () => { expect(readyElapsed(100,4000,false)).toEqual({start:null,countdown:null,ready:false}); });
 it("missing landmarks cannot produce feedback or counts", () => { expect(observe([],"ankle-flex","vasen",640,480)).toEqual({reliable:false}); });
 it("asks to step back when a needed point is cut off at the edge", () => {
  const pts=Array.from({length:33},()=>({x:.5,y:.5,visibility:.9})); pts[31]={x:.5,y:.995,visibility:.9};
  expect(observe(pts,"ankle-flex","vasen",640,480).hint).toBe("KAUEMMAS");
 });
 it("asks for more light when points are in frame but faint", () => {
  const pts=Array.from({length:33},(_,i)=>({x:.3+i*.01,y:.2+i*.02,visibility:.5}));
  expect(observe(pts,"ankle-flex","vasen",640,480).hint).toBe("LISÄÄ VALOA");
 });
 it("accepts a small personal range instead of requiring 20–30 degrees", () => { expect(calibrated(90,96)).toBe(true); expect(calibrated(90,92)).toBe(false); });
 it("counts a full out and back movement within a personal six degree range", () => {
  let s = {min:90,max:96,smooth:90,phase:"low" as "low"|"high",lastRep:0}; let reps=0;
  for(let i=0;i<30;i++){ const r=trackRep(s,i<15?96:90,1000+i*100);s=r.state;if(r.rep)reps++; }
  expect(reps).toBe(1);
 });
 it("balance stays reliable when heels and toes are hidden in shadow", () => {
  const pts=Array.from({length:33},(_,i)=>({x:.5,y:.1+i*.025,visibility:.9})); [29,30,31,32].forEach(i=>pts[i]={x:.5,y:.95,visibility:.1});
  expect(observe(pts,"single-leg-balance","vasen",640,480).reliable).toBe(true);
 });
 it("withholds estimates when visibility coverage is unreliable", () => { expect(validEstimate(7000,10000)).toBe(false); expect(validEstimate(9000,10000)).toBe(true); });
});
