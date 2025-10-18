import * as React from "react";
import { slugify, buildSlugSuggestions } from "@/admin/shared/slug";
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";

type Props = {
  name: string;                                // live course/subject name
  ctx?: { medium?: string; board?: string; examName?: string };
  value: string;
  onChange: (slug: string) => void;
  collectionToCheck?: string;                  // e.g., "courses" (uniqueness hint)
};

export function SlugSelect({ name, ctx, value, onChange, collectionToCheck = "courses" }: Props) {
  const [mode, setMode] = React.useState<"select"|"custom">("select");
  const suggestions = React.useMemo(() => buildSlugSuggestions(name, ctx), [name, ctx]);
  const [isTaken, setIsTaken] = React.useState(false);

  async function checkUnique(slug: string) {
    const db = getFirestore();
    const q = query(collection(db, collectionToCheck), where("slug", "==", slug));
    const s = await getDocs(q);
    setIsTaken(!s.empty);
  }

  React.useEffect(() => { if (value) checkUnique(value); }, [value]);

  return (
    <div>
      <label className="block mb-1 text-sm font-medium">Slug</label>
      {mode === "select" ? (
        <div className="flex gap-2">
          <select className="border rounded px-3 py-2 flex-1"
                  value={value || ""}
                  onChange={(e)=> onChange(e.target.value)}>
            <option value="">Choose a slug</option>
            {suggestions.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <button type="button" className="border rounded px-2"
                  onClick={()=> setMode("custom")}>Custom…</button>
        </div>
      ) : (
        <div className="flex gap-2">
          <input className="border rounded px-3 py-2 flex-1"
                 placeholder="your-custom-slug"
                 value={value}
                 onChange={(e)=> onChange(slugify(e.target.value))} />
          <button type="button" className="border rounded px-2"
                  onClick={()=> setMode("select")}>Back</button>
        </div>
      )}
      {!!value && (
        <div className={`mt-1 text-xs ${isTaken ? "text-red-600" : "text-green-600"}`}>
          {isTaken ? "This slug is already used." : "Slug looks available."}
        </div>
      )}
    </div>
  );
}