import React from "react";
import { EMOJI_OPTIONS, EmojiOpt } from "./options";

export function EmojiSelect({
  value, onChange
}: {
  value: EmojiOpt | null;
  onChange: (v: EmojiOpt | null) => void;
}) {
  return (
    <div>
      <label className="block mb-1 text-sm font-medium">Icon Emoji</label>
      <div className="flex items-center gap-3">
        <select
          className="border rounded px-3 py-2"
          value={value?.id || ""}
          onChange={(e) => {
            const opt = EMOJI_OPTIONS.find(o => o.id === e.target.value) || null;
            onChange(opt);
          }}
        >
          <option value="">— None —</option>
          {EMOJI_OPTIONS.map(o => (
            <option key={o.id} value={o.id}>
              {o.char} {o.name}
            </option>
          ))}
        </select>
        <div className="text-2xl">{value?.char || "—"}</div>
      </div>
      <p className="mt-1 text-xs text-slate-500">Pick one by name; saved as both name and emoji.</p>
    </div>
  );
}