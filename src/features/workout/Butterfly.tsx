import type { ButterflyState } from "./butterflyLogic";

export function Butterfly({ state, width, height }: { state: ButterflyState; width: number; height: number }) {
  return <g transform={`translate(${state.x * width} ${state.y * height})`} className="workout-butterfly" data-motion={state.motion} aria-hidden="true">
    <g className={`butterfly-body butterfly-${state.motion}`}>
      <g className="butterfly-perch" transform="rotate(-14)">
        <g className="butterfly-wing butterfly-wing-back">
          <path className="butterfly-upper" d="M-3 -7 C-18 -19 -28 -48 -13 -59 C0 -68 9 -45 7 -25 C6 -15 2 -9 -3 -7Z" />
          <path className="butterfly-lower" d="M-3 -7 C-17 -9 -24 -24 -16 -33 C-8 -41 5 -25 5 -13Z" />
        </g>
        <g className="butterfly-wing butterfly-wing-front">
          <path className="butterfly-upper" d="M1 -7 C-10 -20 -17 -49 -1 -60 C12 -67 20 -42 14 -24 C11 -14 6 -9 1 -7Z" />
          <path className="butterfly-lower" d="M1 -7 C-11 -9 -18 -23 -11 -32 C-3 -40 10 -24 9 -12Z" />
          <path className="butterfly-mark" d="M0 -18 Q-6 -38 1 -49 M4 -15 Q11 -31 9 -43 M-2 -12 Q-10 -19 -8 -26" />
        </g>
        <path className="butterfly-center" d="M-5 -5 Q0 -12 5 -25 Q7 -30 10 -30 Q12 -27 9 -23 Q4 -11 -2 -4Z" />
        <circle className="butterfly-head" cx="9" cy="-30" r="3" />
        <path className="butterfly-antennae" d="M9 -32 Q10 -40 16 -42 M8 -32 Q5 -40 9 -44 M-3 -5 L-8 0 M1 -8 L0 0" />
      </g>
    </g>
  </g>;
}