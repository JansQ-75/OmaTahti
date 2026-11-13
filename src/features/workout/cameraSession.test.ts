import { expect, it } from "vitest";
import { initialWorkout, completeSet, buildSession, tick } from "./workoutLogic";
import { saveWorkoutSession } from "@/services/workout";
import { getData } from "@/services/storage";
it("stores reliable per-set camera estimates in both role views without video", () => {
 const ex=[{exerciseId:"ankle-flex",sets:1,reps:10}];
 const state=completeSet({...initialWorkout(),reps:6},ex,true);
 state.log[0]={exerciseId:"ankle-flex",done:6,target:10,unit:"reps",tracking:{source:"camera",confidence:.95,view:"sivulta",side:"vasen",rangeDegrees:6}};
 const session=buildSession(state,ex,{id:"camera-test",single:true});
 saveWorkoutSession(getData().activeClientId,session);
 const client=getData().clients.find(c=>c.id===getData().activeClientId);
 expect(client?.sessions.at(-1)?.sets?.[0]?.done).toBe(6);
 expect(client?.assessments.at(-1)).toMatchObject({movement:"nilkan liikealue",valueDegrees:6,source:"camera",confidence:.95});
 expect(JSON.stringify(client?.sessions.at(-1))).not.toContain("video");
});
it("ground contacts do not stop the 30-second timer and persist separately",()=>{
 const ex=[{exerciseId:"single-leg-balance",sets:1,holdSeconds:30}];let s=initialWorkout();
 for(let i=0;i<30;i++)s=tick(s,ex,true);
 s.log[0]={exerciseId:"single-leg-balance",done:30,target:30,unit:"seconds",tracking:{source:"camera",confidence:.96,view:"edestä",side:"vasen",groundTouches:2,sway:.03}};
 expect(buildSession(s,ex,{id:"balance",single:true})).toMatchObject({status:"completed",balance:{steadySeconds:30,groundTouches:2,sway:.03}});
});
