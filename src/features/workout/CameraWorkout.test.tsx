import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { CameraWorkout } from "./CameraWorkout";

const camera = vi.hoisted(() => ({ lifted: false, reliable: true, stop: vi.fn(), close: vi.fn() }));
vi.mock("./pose", () => ({ createPose: async () => ({ close: camera.close, detectForVideo: () => ({ landmarks: [Array.from({ length: 33 }, (_, i) => ({
  x: .5, y: i === 28 && camera.lifted ? .65 : .1 + i * .025, visibility: camera.reliable ? .9 : .1,
}))] }) }) }));

beforeEach(() => {
  vi.useFakeTimers(); camera.lifted = false; camera.reliable = true;
  vi.spyOn(performance, "now").mockImplementation(() => Date.now());
  vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue();
  vi.spyOn(HTMLMediaElement.prototype, "readyState", "get").mockReturnValue(2);
  vi.spyOn(HTMLMediaElement.prototype, "currentTime", "get").mockImplementation(() => Date.now() / 1000);
  Object.defineProperty(navigator, "mediaDevices", { configurable: true, value: { getUserMedia: vi.fn().mockResolvedValue({ getTracks: () => [{ stop: camera.stop }] }) } });
});
afterEach(() => { cleanup(); vi.useRealTimers(); vi.restoreAllMocks(); });
const advance = async (ms: number) => { await act(async () => { await vi.advanceTimersByTimeAsync(ms); }); };
const props = { name: "Yhden jalan seisonta", side: "vasen" as const, set: 0, sets: 3, done: 0, target: 30, suspended: false, onRep: vi.fn(), onTick: vi.fn(), onComplete: vi.fn(), onFallback: vi.fn(), onInterrupt: vi.fn(), onExit: vi.fn() };

it("shows the butterfly only during active balance on a lifted leg, and hides it during rest", async () => {
  const view = render(<CameraWorkout {...props} exercise="single-leg-balance" />);
  await act(async () => { fireEvent.click(screen.getByRole("button", { name: "Käytä kameraa" })); });
  await advance(7200);
  expect(view.container.querySelector(".workout-butterfly")).toBeNull();
  camera.lifted = true; await advance(100);
  expect(view.container.querySelector(".workout-butterfly")?.getAttribute("transform")).toBe("translate(320 372)");
  view.rerender(<CameraWorkout {...props} exercise="single-leg-balance" suspended />);
  expect(view.container.querySelector(".workout-butterfly")).toBeNull();
});

it("does not add butterfly feedback to ankle camera exercises", async () => {
  const view = render(<CameraWorkout {...props} exercise="ankle-flex" />);
  await act(async () => { fireEvent.click(screen.getByRole("button", { name: "Käytä kameraa" })); });
  camera.lifted = true; await advance(10000);
  expect(view.container.querySelector(".camera-butterfly")).toBeNull();
});