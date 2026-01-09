import { useMemo } from 'react';
import { useReducedMotion } from './useReducedMotion';

/**
 * useStaggerAnimation 钩子的配置选项
 */
export interface UseStaggerAnimationOptions {
  /**
   * 每个元素之间的延迟间隔（毫秒）
   * @default 50
   */
  delayInterval?: number;
  
  /**
   * 基础延迟时间（毫秒），所有元素的延迟都会加上这个值
   * @default 0
   */
  baseDelay?: number;
  
  /**
   * 最大延迟时间（毫秒），防止列表过长时延迟过大
   * @default 1000
   */
  maxDelay?: number;
}

/**
 * useStaggerAnimation 钩子的返回值
 */
export interface UseStaggerAnimationReturn {
  /** 计算后的动画延迟时间（毫秒） */
  delay: number;
  /** 格式化的 CSS 延迟值，如 "150ms" */
  delayStyle: string;
  /** 用于内联样式的对象 */
  style: React.CSSProperties;
  /** 用户是否偏好减少动画 */
  shouldReduceMotion: boolean;
}

/**
 * 交错动画钩子
 * 根据元素索引计算动画延迟，实现列表项的交错入场效果
 * 
 * @param index - 元素在列表中的索引（从0开始）
 * @param options - 配置选项
 * @returns 延迟时间和相关样式
 * 
 * Requirements: 3.5
 */
export function useStaggerAnimation(
  index: number,
  options: UseStaggerAnimationOptions = {}
): UseStaggerAnimationReturn {
  const {
    delayInterval = 50,
    baseDelay = 0,
    maxDelay = 1000,
  } = options;

  const prefersReducedMotion = useReducedMotion();

  const result = useMemo(() => {
    // 如果用户偏好减少动画，返回0延迟
    if (prefersReducedMotion) {
      return {
        delay: 0,
        delayStyle: '0ms',
        style: {
          animationDelay: '0ms',
          transitionDelay: '0ms',
        } as React.CSSProperties,
        shouldReduceMotion: true,
      };
    }

    // 计算延迟时间
    const calculatedDelay = baseDelay + (index * delayInterval);
    // 限制最大延迟
    const delay = Math.min(calculatedDelay, maxDelay);
    const delayStyle = `${delay}ms`;

    return {
      delay,
      delayStyle,
      style: {
        animationDelay: delayStyle,
        transitionDelay: delayStyle,
      } as React.CSSProperties,
      shouldReduceMotion: false,
    };
  }, [index, delayInterval, baseDelay, maxDelay, prefersReducedMotion]);

  return result;
}

/**
 * 批量计算交错动画延迟的工具函数
 * 适用于需要一次性计算多个元素延迟的场景
 * 
 * @param count - 元素数量
 * @param options - 配置选项
 * @returns 延迟时间数组
 */
export function calculateStaggerDelays(
  count: number,
  options: UseStaggerAnimationOptions = {}
): number[] {
  const {
    delayInterval = 50,
    baseDelay = 0,
    maxDelay = 1000,
  } = options;

  return Array.from({ length: count }, (_, index) => {
    const calculatedDelay = baseDelay + (index * delayInterval);
    return Math.min(calculatedDelay, maxDelay);
  });
}
