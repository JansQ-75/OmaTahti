import simd from "@/assets/pose/vision_wasm_internal.wasm.asset.json";
import plain from "@/assets/pose/vision_wasm_nosimd_internal.wasm.asset.json";
// Imported only after an explicit camera action. No browser work at module scope.
export async function createPose() {
 const { FilesetResolver, PoseLandmarker } = await import("@mediapipe/tasks-vision");
 const supported = await FilesetResolver.isSimdSupported();
 return PoseLandmarker.createFromOptions({
  wasmLoaderPath: supported ? "/pose/vision_wasm_internal.js" : "/pose/vision_wasm_nosimd_internal.js",
  wasmBinaryPath: supported ? simd.url : plain.url,
 }, { baseOptions: { modelAssetPath: "/pose/pose_landmarker_lite.task", delegate: "CPU" }, runningMode: "VIDEO", numPoses:1, minPoseDetectionConfidence:.7, minPosePresenceConfidence:.7, minTrackingConfidence:.7 });
}
