// src/components/ConfirmMoveSession.tsx
export async function confirmMoveSession(): Promise<boolean> {
  return Promise.resolve(
    window.confirm(
      'Your account is active on another device. Move it here? The other device will be signed out.'
    )
  );
}
