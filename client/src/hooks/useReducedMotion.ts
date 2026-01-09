import { useState, useEffect } from 'react';

/**
 * 检测用户是否偏好减少动画
 * 通过监听 prefers-reduced-motion 媒体查询实现
 * 
 * @returns boolean - true 表示用户偏好减少动画，false 表示正常动画
 * 
 * Requirements: 3.4, 13.4
 */
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(() => {
    // SSR 安全检查
    if (typeof window === 'undefined') {
      return false;
    }
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    // SSR 安全检查
    if (typeof window === 'undefined') {
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    // 初始化状态
    setPrefersReducedMotion(mediaQuery.matches);

    // 监听媒体查询变化
    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    // 使用 addEventListener 以支持现代浏览器
    // 同时保持对旧版浏览器的兼容性
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      // 兼容旧版浏览器
      mediaQuery.addListener(handleChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        // 兼容旧版浏览器
        mediaQuery.removeListener(handleChange);
      }
    };
  }, []);

  return prefersReducedMotion;
}
