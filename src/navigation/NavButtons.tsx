import React from "react";
import { useFlowNav } from "./useFlowNav";

export function BackButton({
  flow,
  className = "px-3 py-2 rounded border hover:bg-slate-50"
}: { flow?: string; className?: string }) {
  const { goBack } = useFlowNav({ flow, preserveSearch: true });
  return (
    <button type="button" onClick={goBack} className={className} aria-label="Go back">
      ← Back
    </button>
  );
}

export function NextButton({
  flow,
  canProceed = true,
  label = "Next",
  className = "px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
}: { flow?: string; canProceed?: boolean; label?: string; className?: string }) {
  const { goNext, hasNext } = useFlowNav({ flow, canProceed, preserveSearch: true });
  return (
    <button type="button" onClick={goNext} disabled={!hasNext || !canProceed} className={className}>
      {label} →
    </button>
  );
}