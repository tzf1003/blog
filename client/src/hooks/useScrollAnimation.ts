import { useRef, useState, useEffect, useCallback } from 'react';
import { useReducedMotion } from './useReducedMotion';

/**
 * useScrollAnimation 钩子的配置选项
 */
export interface UseScrollAnimationOptions {
  /** 
   * 触发可见性的阈值 (0-1)
   * 0 表示元素刚进入视口就触发
   * 1 表示元素完全可见才触发
   * @default 0.1
   */
  threshold?: number;
  
  /**
   * 根元素的边距，用于扩展或收缩触发区域
   * 格式同 CSS margin: "10px 20px 30px 40px"
   * @default "0px"
   */
  rootMargin?: string;
  
  /**
   * 是否只触发一次
   * true: 元素进入视口后不再监听
   * false: 元素每次进入/离开视口都会更新状态
   * @default true
   */
  triggerOnce?: boolean;
}

/**
 * useScrollAnimation 钩子的返回值
 */
export interface UseScrollAnimationReturn<T extends HTMLElement> {
  /** 需要绑定到目标元素的 ref */
  ref: React.RefObject<T>;
  /** 元素当前是否可见 */
  isVisible: boolean;
  /** 元素是否已经触发过动画（用于 triggerOnce 场景） */
  hasAnimated: boolean;
}

/**
 * 滚动动画钩子
 * 使用 Intersection Observer 检测元素是否进入视口
 * 
 * @param options - 配置选项
 * @returns ref、可见性状态和动画触发状态
 * 
 * Requirements: 3.2, 12.5
 */
export function useScrollAnimation<T extends HTMLElement = HTMLDivElement>(
  options: UseScrollAnimationOptions = {}
): UseScrollAnimationReturn<T> {
  const {
    threshold = 0.1,
    rootMargin = '0px',
    triggerOnce = true,
  } = options;

  const ref = useRef<T>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  // 如果用户偏好减少动画，直接设置为可见状态
  useEffect(() => {
    if (prefersReducedMotion) {
      setIsVisible(true);
      setHasAnimated(true);
    }
  }, [prefersReducedMotion]);

  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[], observer: IntersectionObserver) => {
      const [entry] = entries;
      
      if (entry.isIntersecting) {
        setIsVisible(true);
        setHasAnimated(true);
        
        // 如果只触发一次，停止观察
        if (triggerOnce && ref.current) {
          observer.unobserve(ref.current);
        }
      } else if (!triggerOnce) {
        // 如果不是只触发一次，元素离开视口时更新状态
        setIsVisible(false);
      }
    },
    [triggerOnce]
  );

  useEffect(() => {
    // SSR 安全检查
    if (typeof window === 'undefined') {
      return;
    }

    // 如果用户偏好减少动画，跳过 Observer 设置
    if (prefersReducedMotion) {
      return;
    }

    const element = ref.current;
    if (!element) {
      return;
    }

    // 检查浏览器是否支持 Intersection Observer
    if (!('IntersectionObserver' in window)) {
      // 降级处理：直接设置为可见
      setIsVisible(true);
      setHasAnimated(true);
      return;
    }

    const observer = new IntersectionObserver(handleIntersection, {
      threshold,
      rootMargin,
    });

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin, handleIntersection, prefersReducedMotion]);

  return {
    ref,
    isVisible,
    hasAnimated,
  };
}
