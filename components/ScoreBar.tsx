import type { CSSProperties } from "react";

export default function ScoreBar({
  score,
  label,
}: {
  score: number;
  label?: string;
}) {
  return (
    <span>
      {label ?? `${score}/100`}{" "}
      <i style={{ "--score": `${score}%` } as CSSProperties}></i>
    </span>
  );
}
