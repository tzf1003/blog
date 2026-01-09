import { useRef, useState, useEffect, useCallback } from 'react';

/**
 * useLazyLoad 钩子的配置选项
 */
export interface UseLazyLoadOptions {
  /**
   * 根元素边距，用于提前触发加载
   * @default "200px"
   */
  rootMargin?: string;
  
  /**
   * 触发加载的阈值 (0-1)
   * @default 0
   */
  threshold?: number;
  
  /**
   * 是否只触发一次
   * @default true
   */
  triggerOnce?: boolean;
}

/**
 * useLazyLoad 钩子的返回值
 */
export interface UseLazyLoadReturn<T extends HTMLElement> {
  /** 需要绑定到目标元素的 ref */
  ref: React.RefObject<T>;
  /** 元素是否应该加载 */
  shouldLoad: boolean;
  /** 元素是否在视口内 */
  isInView: boolean;
}

/**
 * 检测浏览器是否支持Intersection Observer
 */
const supportsIntersectionObserver = (): boolean => {
  if (typeof window === 'undefined') return false;
  return 'IntersectionObserver' in window;
};

/**
 * 懒加载钩子
 * 使用 Intersection Observer 检测元素是否接近视口
 * 用于延迟加载图片、组件等资源
 * 
 * @param options - 配置选项
 * @returns ref、加载状态
 * 
 * Requirements: 12.1, 12.5
 */
export function useLazyLoad<T extends HTMLElement = HTMLDivElement>(
  options: UseLazyLoadOptions = {}
): UseLazyLoadReturn<T> {
  const {
    rootMargin = '200px',
    threshold = 0,
    triggerOnce = true,
  } = options;

  const ref = useRef<T>(null);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [isInView, setIsInView] = useState(false);

  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[], observer: IntersectionObserver) => {
      const [entry] = entries;
      
      if (entry.isIntersecting) {
        setIsInView(true);
        setShouldLoad(true);
        
        // 如果只触发一次，停止观察
        if (triggerOnce && ref.current) {
          observer.unobserve(ref.current);
        }
      } else if (!triggerOnce) {
        setIsInView(false);
      }
    },
    [triggerOnce]
  );

  useEffect(() => {
    // SSR 安全检查
    if (typeof window === 'undefined') {
      return;
    }

    const element = ref.current;
    if (!element) {
      return;
    }

    // 检查浏览器是否支持 Intersection Observer
    if (!supportsIntersectionObserver()) {
      // 降级处理：直接设置为应该加载
      setShouldLoad(true);
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(handleIntersection, {
      rootMargin,
      threshold,
    });

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [rootMargin, threshold, handleIntersection]);

  return {
    ref,
    shouldLoad,
    isInView,
  };
}

export default useLazyLoad;
