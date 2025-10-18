// src/lib/deviceId.ts
import { getInstallations, getId as getInstallId } from 'firebase/installations';

export async function getDeviceId(app: import('firebase/app').FirebaseApp): Promise<string> {
  try {
    const installations = getInstallations(app);
    const id = await getInstallId(installations); // stable for this browser profile
    return id;
  } catch {
    // Fallback UUID if installations fails
    let id = localStorage.getItem('ty_device_id');
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem('ty_device_id', id);
    }
    return id;
  }
}