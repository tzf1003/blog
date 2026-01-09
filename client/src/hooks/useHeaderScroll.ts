import { useState, useEffect, useCallback, useRef } from 'react';
import { useReducedMotion } from './useReducedMotion';

/**
 * Header滚动行为配置选项
 */
export interface UseHeaderScrollOptions {
  /** 触发隐藏的滚动距离阈值 @default 100 */
  hideThreshold?: number;
  /** 触发样式变化的滚动距离 @default 50 */
  scrolledThreshold?: number;
  /** 滚动方向检测的灵敏度 @default 10 */
  sensitivity?: number;
}

/**
 * Header滚动状态
 */
export interface HeaderScrollState {
  /** Header是否可见 */
  isVisible: boolean;
  /** 是否已滚动（用于样式变化） */
  isScrolled: boolean;
  /** 当前滚动位置 */
  scrollY: number;
  /** 滚动进度 (0-1) */
  scrollProgress: number;
}

/**
 * Header滚动行为钩子
 * 实现滚动隐藏/显示、高度缩减和blur增强逻辑
 * 
 * Requirements: 5.2, 5.5
 */
export function useHeaderScroll(
  options: UseHeaderScrollOptions = {}
): HeaderScrollState {
  const {
    hideThreshold = 100,
    scrolledThreshold = 50,
    sensitivity = 10,
  } = options;

  const [state, setState] = useState<HeaderScrollState>({
    isVisible: true,
    isScrolled: false,
    scrollY: 0,
    scrollProgress: 0,
  });

  const lastScrollY = useRef(0);
  const ticking = useRef(false);
  const prefersReducedMotion = useReducedMotion();

  const updateScrollState = useCallback(() => {
    if (typeof window === 'undefined') return;

    const currentScrollY = window.scrollY;
    const scrollDelta = currentScrollY - lastScrollY.current;
    const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollProgress = documentHeight > 0 ? Math.min(currentScrollY / documentHeight, 1) : 0;

    setState(prevState => {
      let isVisible = prevState.isVisible;

      // 滚动方向检测逻辑
      if (currentScrollY <= hideThreshold) {
        // 在顶部区域始终显示
        isVisible = true;
      } else if (Math.abs(scrollDelta) > sensitivity) {
        // 向下滚动隐藏，向上滚动显示
        isVisible = scrollDelta < 0;
      }

      // 如果用户偏好减少动画，始终显示
      if (prefersReducedMotion) {
        isVisible = true;
      }

      return {
        isVisible,
        isScrolled: currentScrollY > scrolledThreshold,
        scrollY: currentScrollY,
        scrollProgress,
      };
    });

    lastScrollY.current = currentScrollY;
    ticking.current = false;
  }, [hideThreshold, scrolledThreshold, sensitivity, prefersReducedMotion]);

  const handleScroll = useCallback(() => {
    if (!ticking.current) {
      requestAnimationFrame(updateScrollState);
      ticking.current = true;
    }
  }, [updateScrollState]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 初始化状态
    updateScrollState();

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll, updateScrollState]);

  return state;
}
