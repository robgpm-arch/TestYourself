import { useLocation, useNavigate } from 'react-router-dom';
import React from 'react';
import { useFlows } from './FlowProvider';

export function useFlowNav(opts?: {
  flow?: string; // force a particular flow key if you know it
  canProceed?: boolean; // gate Next until a page is valid
  preserveSearch?: boolean; // keep current ?query params
}) {
  const flows = useFlows();
  const nav = useNavigate();
  const loc = useLocation();

  const search = opts?.preserveSearch ? loc.search : '';
  const path = loc.pathname;

  // choose flow by hint or by prefix matching
  const flowKey = React.useMemo(() => {
    if (opts?.flow) return opts.flow;
    // simple heuristic
    if (path.startsWith('/quiz')) return 'quiz';
    if (path.startsWith('/onboarding')) return 'onboarding';
    return 'profile';
  }, [path, opts?.flow]);

  const steps = (flows as any)[flowKey] as string[] | undefined;
  const index = steps ? steps.findIndex(p => path.startsWith(p)) : -1;

  const prevPath = index > 0 ? steps![index - 1] : null;
  const nextPath = steps && index >= 0 && index < steps.length - 1 ? steps[index + 1] : null;

  function goBack() {
    if (prevPath) nav(prevPath + search);
    else nav(-1); // fall back to browser history (safe)
  }

  function goNext() {
    if (!opts?.canProceed) return;
    if (nextPath) nav(nextPath + search);
  }

  return {
    flowKey,
    index,
    hasPrev: !!prevPath,
    hasNext: !!nextPath,
    goBack,
    goNext,
  };
}
