import type { ButterflyState } from "./butterflyLogic";

export function Butterfly({ state, width, height }: { state: ButterflyState; width: number; height: number }) {
  return <g transform={`translate(${state.x * width} ${state.y * height})`} className="workout-butterfly" data-motion={state.motion} aria-hidden="true">
    <g className={`butterfly-body butterfly-${state.motion}`}>
      <g className="butterfly-wing butterfly-wing-left">
        <path className="butterfly-upper" d="M0 -18 C-12 -55 -46 -61 -40 -30 C-37 -17 -17 -12 0 -18Z" />
        <path className="butterfly-lower" d="M0 -17 C-26 -27 -37 -12 -25 -4 C-13 2 -6 -7 0 -17Z" />
        <path className="butterfly-mark" d="M-9 -25 Q-25 -42 -31 -34 M-9 -16 Q-22 -15 -23 -9" />
      </g>
      <g className="butterfly-wing butterfly-wing-right">
        <path className="butterfly-upper" d="M0 -18 C12 -55 46 -61 40 -30 C37 -17 17 -12 0 -18Z" />
        <path className="butterfly-lower" d="M0 -17 C26 -27 37 -12 25 -4 C13 2 6 -7 0 -17Z" />
        <path className="butterfly-mark" d="M9 -25 Q25 -42 31 -34 M9 -16 Q22 -15 23 -9" />
      </g>
      <path className="butterfly-center" d="M0 -32 Q-3 -20 0 -8 Q3 -20 0 -32Z" />
      <path className="butterfly-antennae" d="M0 -30 Q-3 -39 -7 -38 M0 -30 Q3 -39 7 -38" />
    </g>
  </g>;
}