import { act, cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { BaselineCamera } from "./BaselineCamera";
import { BASELINE_TESTS } from "@/data/baselineTests";

const camera = vi.hoisted(() => ({ lifted: false, reliable: true, close: vi.fn(), stop: vi.fn() }));
vi.mock("@/features/workout/pose", () => ({
  createPose: async () => ({
    close: camera.close,
    detectForVideo: () => ({ landmarks: [Array.from({ length: 33 }, (_, i) => ({
      x: .5, y: i === 28 && camera.lifted ? .65 : .1 + i * .025,
      visibility: camera.reliable ? .9 : .1,
    }))] }),
  }),
}));

beforeEach(() => {
  vi.useFakeTimers(); camera.lifted = false; camera.reliable = true;
  vi.spyOn(performance, "now").mockImplementation(() => Date.now());
  vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue();
  vi.spyOn(HTMLMediaElement.prototype, "readyState", "get").mockReturnValue(2);
  vi.spyOn(HTMLMediaElement.prototype, "currentTime", "get").mockImplementation(() => Date.now() / 1000);
  Object.defineProperty(navigator, "mediaDevices", { configurable: true, value: {
    getUserMedia: vi.fn().mockResolvedValue({ getTracks: () => [{ stop: camera.stop }] }),
  } });
});
afterEach(() => { cleanup(); vi.useRealTimers(); vi.restoreAllMocks(); });

async function start() {
  const test = BASELINE_TESTS.ankle?.find(t => t.exercise === "single-leg-balance");
  if (!test) throw new Error("Missing balance test");
  const onComplete = vi.fn();
  await act(async () => { render(<BaselineCamera audioContext={null} test={test} bodyArea="ankle" side="vasen" onComplete={onComplete} onExit={vi.fn()} />); });
  return onComplete;
}
const advance = async (ms: number) => { await act(async () => { await vi.advanceTimersByTimeAsync(ms); }); };

it("starts after 2 seconds settling and 5 seconds countdown with both feet grounded", async () => {
  const complete = await start();
  await advance(7000);
  expect(complete).not.toHaveBeenCalled();
  camera.lifted = true;
  await advance(30100);
  expect(complete).toHaveBeenCalledTimes(1);
  expect(complete.mock.calls[0]?.[0]).toMatchObject({ durationSeconds: 30, groundTouches: 0, source: "camera" });
});

it("finishes the 30-second measurement despite a ground contact and brief tracking loss", async () => {
  const complete = await start();
  await advance(7100);
  camera.lifted = true;
  await advance(10000);
  camera.lifted = false;
  await advance(1000);
  camera.lifted = true; camera.reliable = false;
  await advance(1000);
  camera.reliable = true;
  await advance(18000);
  expect(complete).toHaveBeenCalledTimes(1);
  expect(complete.mock.calls[0]?.[0]).toMatchObject({ durationSeconds: 30, groundTouches: 1 });
});

it("does not save a measurement when tracking is unreliable for over 20 percent", async () => {
  const complete = await start();
  await advance(7100);
  camera.lifted = true;
  await advance(22000);
  camera.reliable = false;
  await advance(8000);
  expect(complete).not.toHaveBeenCalled();
});