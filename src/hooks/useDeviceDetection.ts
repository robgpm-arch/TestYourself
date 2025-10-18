import { useState, useEffect } from 'react';

interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  isWindows: boolean;
  isMac: boolean;
  isLinux: boolean;
  isTouchDevice: boolean;
  screenSize: {
    width: number;
    height: number;
  };
  orientation: 'portrait' | 'landscape';
  devicePixelRatio: number;
}

export const useDeviceDetection = (): DeviceInfo => {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    isIOS: false,
    isAndroid: false,
    isWindows: false,
    isMac: false,
    isLinux: false,
    isTouchDevice: false,
    screenSize: { width: 1920, height: 1080 },
    orientation: 'landscape',
    devicePixelRatio: 1
  });

  useEffect(() => {
    const detectDevice = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const width = window.innerWidth;
      const height = window.innerHeight;

      // Operating System Detection
      const isIOS = /ipad|iphone|ipod/.test(userAgent);
      const isAndroid = /android/.test(userAgent);
      const isWindows = /windows/.test(userAgent);
      const isMac = /mac/.test(userAgent) && !isIOS;
      const isLinux = /linux/.test(userAgent) && !isAndroid;

      // Device Type Detection
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const isMobile = width <= 768 || /mobile/.test(userAgent);
      const isTablet = (width > 768 && width <= 1024) || /tablet|ipad/.test(userAgent);
      const isDesktop = width > 1024 && !isTouchDevice;

      // Screen Information
      const orientation = width > height ? 'landscape' : 'portrait';
      const devicePixelRatio = window.devicePixelRatio || 1;

      setDeviceInfo({
        isMobile,
        isTablet,
        isDesktop,
        isIOS,
        isAndroid,
        isWindows,
        isMac,
        isLinux,
        isTouchDevice,
        screenSize: { width, height },
        orientation,
        devicePixelRatio
      });
    };

    // Initial detection
    detectDevice();

    // Listen for resize events
    const handleResize = () => {
      detectDevice();
    };

    // Listen for orientation change
    const handleOrientationChange = () => {
      // Delay to ensure dimensions are updated
      setTimeout(detectDevice, 100);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);

  return deviceInfo;
};

// Utility hook for responsive design
export const useBreakpoint = () => {
  const { screenSize } = useDeviceDetection();
  const { width } = screenSize;

  return {
    isXs: width < 480,
    isSm: width >= 480 && width < 768,
    isMd: width >= 768 && width < 1024,
    isLg: width >= 1024 && width < 1280,
    isXl: width >= 1280 && width < 1536,
    is2Xl: width >= 1536,
    current: width < 480 ? 'xs' : 
             width < 768 ? 'sm' :
             width < 1024 ? 'md' :
             width < 1280 ? 'lg' :
             width < 1536 ? 'xl' : '2xl'
  };
};