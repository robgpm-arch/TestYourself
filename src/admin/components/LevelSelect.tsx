import * as React from "react";
import { LEVEL_OPTIONS } from "@/admin/shared/options";

export function LevelSelect({
  value, onChange
}: {
  value: string; onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block mb-1 text-sm font-medium">Level</label>
      <select className="border rounded px-3 py-2 w-full"
              value={value || ""}
              onChange={(e)=> onChange(e.target.value)}>
        <option value="">Select a level</option>
        {LEVEL_OPTIONS.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
      </select>
    </div>
  );
}