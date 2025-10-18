import { useEffect, useRef, useState } from 'react';

interface TouchGestureConfig {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onPinch?: (scale: number) => void;
  onTap?: (e: TouchEvent) => void;
  onDoubleTap?: (e: TouchEvent) => void;
  swipeThreshold?: number;
  pinchThreshold?: number;
  doubleTapDelay?: number;
}

export const useTouchGestures = (config: TouchGestureConfig = {}) => {
  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onPinch,
    onTap,
    onDoubleTap,
    swipeThreshold = 50,
    pinchThreshold = 0.1,
    doubleTapDelay = 300,
  } = config;

  const elementRef = useRef<HTMLElement>(null);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [lastTap, setLastTap] = useState<number>(0);
  const [initialDistance, setInitialDistance] = useState<number>(0);

  const getTouchPosition = (touch: Touch) => ({
    x: touch.clientX,
    y: touch.clientY,
  });

  const getDistance = (touch1: Touch, touch2: Touch) => {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleTouchStart = (e: TouchEvent) => {
    if (e.touches.length === 1) {
      setTouchStart(getTouchPosition(e.touches[0]));
    } else if (e.touches.length === 2 && onPinch) {
      setInitialDistance(getDistance(e.touches[0], e.touches[1]));
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (e.touches.length === 2 && onPinch && initialDistance > 0) {
      const currentDistance = getDistance(e.touches[0], e.touches[1]);
      const scale = currentDistance / initialDistance;

      if (Math.abs(scale - 1) > pinchThreshold) {
        onPinch(scale);
      }
    }
  };

  const handleTouchEnd = (e: TouchEvent) => {
    if (!touchStart || e.changedTouches.length === 0) return;

    const touchEnd = getTouchPosition(e.changedTouches[0]);
    const deltaX = touchEnd.x - touchStart.x;
    const deltaY = touchEnd.y - touchStart.y;
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);

    // Handle swipe gestures
    if (absDeltaX > swipeThreshold || absDeltaY > swipeThreshold) {
      if (absDeltaX > absDeltaY) {
        // Horizontal swipe
        if (deltaX > 0 && onSwipeRight) {
          onSwipeRight();
        } else if (deltaX < 0 && onSwipeLeft) {
          onSwipeLeft();
        }
      } else {
        // Vertical swipe
        if (deltaY > 0 && onSwipeDown) {
          onSwipeDown();
        } else if (deltaY < 0 && onSwipeUp) {
          onSwipeUp();
        }
      }
    } else {
      // Handle tap gestures
      const now = Date.now();
      if (now - lastTap < doubleTapDelay && onDoubleTap) {
        onDoubleTap(e);
        setLastTap(0);
      } else {
        if (onTap) {
          onTap(e);
        }
        setLastTap(now);
      }
    }

    setTouchStart(null);
    setInitialDistance(0);
  };

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [touchStart, lastTap, initialDistance]);

  return elementRef;
};
