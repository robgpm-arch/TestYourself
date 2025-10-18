import React from "react";
import { FALLBACK_FLOWS, FlowKey } from "./flows";

// OPTIONAL Firestore loading
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

type FlowMap = Partial<Record<FlowKey, string[]>>;

type Ctx = {
  flows: FlowMap;
  setFlows: React.Dispatch<React.SetStateAction<FlowMap>>;
};
const FlowCtx = React.createContext<Ctx | null>(null);

export function FlowProvider({ children }: { children: React.ReactNode }) {
  const [flows, setFlows] = React.useState<FlowMap>(FALLBACK_FLOWS);

  // Optional: try to hydrate from Firestore /screens (flow + path + order)
  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const keys: FlowKey[] = ["onboarding", "quiz", "profile"];
        const loaded: FlowMap = {};
        for (const fk of keys) {
          const qy = query(
            collection(db, "screens"),
            where("flow", "==", fk),
            orderBy("order", "asc")
          );
          const snap = await getDocs(qy);
          if (!cancelled && !snap.empty) {
            loaded[fk] = snap.docs.map(d => (d.data() as any).path).filter(Boolean);
          }
        }
        if (!cancelled && Object.keys(loaded).length) setFlows(p => ({ ...p, ...loaded }));
      } catch {
        // silently keep FALLBACK_FLOWS
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return <FlowCtx.Provider value={{ flows, setFlows }}>{children}</FlowCtx.Provider>;
}

export function useFlows() {
  const ctx = React.useContext(FlowCtx);
  if (!ctx) throw new Error("useFlows must be used inside <FlowProvider/>");
  return ctx.flows;
}