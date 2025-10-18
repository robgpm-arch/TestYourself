import React from "react";
import { COLOR_PALETTE } from "./options";

export function ColorSelect({
  id, onChange
}: {
  id: string | null;
  onChange: (id: string | null, hex: string | null) => void;
}) {
  const current = COLOR_PALETTE.find(c => c.id === id) || null;

  return (
    <div>
      <label className="block mb-1 text-sm font-medium">Brand Color</label>
      <div className="flex items-center gap-3">
        <select
          className="border rounded px-3 py-2"
          value={id || ""}
          onChange={(e) => {
            const next = COLOR_PALETTE.find(c => c.id === e.target.value) || null;
            onChange(next?.id || null, next?.hex || null);
          }}
        >
          <option value="">— None —</option>
          {COLOR_PALETTE.map(c => (
            <option key={c.id} value={c.id}>
              {c.name} ({c.hex})
            </option>
          ))}
        </select>
        <div
          title={current?.hex || "—"}
          style={{ width: 28, height: 28, borderRadius: 6, background: current?.hex || "transparent", border: "1px solid #e5e7eb" }}
        />
      </div>
      <p className="mt-1 text-xs text-slate-500">Stores color id and hex; easy to theme later.</p>
    </div>
  );
}