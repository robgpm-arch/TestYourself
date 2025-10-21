export function navigateSafe(
  navigate: (to: string, opts?: { replace?: boolean; state?: any }) => void,
  to: string,
  opts: { replace?: boolean; state?: any } = { replace: true }
) {
  try {
    navigate(to, opts);
    setTimeout(() => {
      if (typeof window !== 'undefined' && window.location?.pathname !== to) {
        console.warn('[nav] router did not change, hard-redirecting →', to);
        window.location.assign(to);
      }
    }, 50);
  } catch (e) {
    console.warn('[nav] navigate threw, hard-redirecting →', to, e);
    if (typeof window !== 'undefined') window.location.assign(to);
  }
}

