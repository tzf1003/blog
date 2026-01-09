import { useEffect, useState, useCallback, useRef } from 'react';
import { useReducedMotion } from './useReducedMotion';

/**
 * 动画性能优化钩子
 * 
 * 提供性能监测和动画降级逻辑
 * 确保所有动画使用transform/opacity以获得GPU加速
 * 
 * Requirements: 11.4, 12.2, 12.3
 */

export interface AnimationPerformanceOptions {
  /** 是否启用性能监测 */
  enableMonitoring?: boolean;
  /** FPS阈值，低于此值触发降级 */
  fpsThreshold?: number;
  /** 采样时间（毫秒） */
  sampleDuration?: number;
}

export interface AnimationPerformanceReturn {
  /** 是否应该使用简化动画 */
  shouldReduceAnimations: boolean;
  /** 当前性能等级 */
  performanceLevel: 'high' | 'medium' | 'low';
  /** 推荐的动画时长倍数 */
  durationMultiplier: number;
  /** 是否启用will-change */
  enableWillChange: boolean;
  /** 获取优化后的动画样式 */
  getOptimizedStyle: (isAnimating: boolean) => React.CSSProperties;
}

/**
 * 检测设备是否为低性能设备
 */
const isLowEndDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  // 检查硬件并发数（CPU核心数）
  const hardwareConcurrency = navigator.hardwareConcurrency || 4;
  if (hardwareConcurrency <= 2) return true;
  
  // 检查设备内存（如果可用）
  const deviceMemory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  if (deviceMemory && deviceMemory <= 2) return true;
  
  // 检查是否为移动设备
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
  
  // 移动设备默认使用中等性能设置
  if (isMobile) return false; // 不直接返回true，让FPS检测决定
  
  return false;
};

/**
 * 检测是否支持高性能动画
 */
const supportsHighPerformanceAnimations = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  // 检查是否支持CSS will-change
  const supportsWillChange = CSS.supports('will-change', 'transform');
  
  // 检查是否支持CSS transform
  const supportsTransform = CSS.supports('transform', 'translateX(0)');
  
  return supportsWillChange && supportsTransform;
};

/**
 * 动画性能优化钩子
 */
export function useAnimationPerformance(
  options: AnimationPerformanceOptions = {}
): AnimationPerformanceReturn {
  const {
    enableMonitoring = true,
    fpsThreshold = 30,
    sampleDuration = 1000,
  } = options;

  const prefersReducedMotion = useReducedMotion();
  const [performanceLevel, setPerformanceLevel] = useState<'high' | 'medium' | 'low'>('high');
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const rafIdRef = useRef<number | null>(null);

  // 初始化性能等级
  useEffect(() => {
    if (prefersReducedMotion) {
      setPerformanceLevel('low');
      return;
    }

    if (isLowEndDevice()) {
      setPerformanceLevel('medium');
    }
  }, [prefersReducedMotion]);

  // FPS监测
  useEffect(() => {
    if (!enableMonitoring || prefersReducedMotion) return;
    if (typeof window === 'undefined') return;

    let isMonitoring = true;

    const measureFPS = () => {
      if (!isMonitoring) return;

      frameCountRef.current++;
      const currentTime = performance.now();
      const elapsed = currentTime - lastTimeRef.current;

      if (elapsed >= sampleDuration) {
        const fps = (frameCountRef.current / elapsed) * 1000;
        
        // 根据FPS调整性能等级
        if (fps < fpsThreshold) {
          setPerformanceLevel('low');
        } else if (fps < 50) {
          setPerformanceLevel('medium');
        } else {
          setPerformanceLevel('high');
        }

        frameCountRef.current = 0;
        lastTimeRef.current = currentTime;
      }

      rafIdRef.current = requestAnimationFrame(measureFPS);
    };

    // 延迟启动监测，避免影响初始加载
    const timeoutId = setTimeout(() => {
      rafIdRef.current = requestAnimationFrame(measureFPS);
    }, 2000);

    return () => {
      isMonitoring = false;
      clearTimeout(timeoutId);
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [enableMonitoring, fpsThreshold, sampleDuration, prefersReducedMotion]);

  // 计算是否应该减少动画
  const shouldReduceAnimations = prefersReducedMotion || performanceLevel === 'low';

  // 计算动画时长倍数
  const durationMultiplier = 
    performanceLevel === 'low' ? 0 :
    performanceLevel === 'medium' ? 0.7 :
    1;

  // 是否启用will-change
  const enableWillChange = 
    supportsHighPerformanceAnimations() && 
    performanceLevel !== 'low';

  // 获取优化后的动画样式
  const getOptimizedStyle = useCallback(
    (isAnimating: boolean): React.CSSProperties => {
      if (shouldReduceAnimations) {
        return {};
      }

      const style: React.CSSProperties = {};

      // 只在动画进行时添加will-change，避免内存占用
      if (isAnimating && enableWillChange) {
        style.willChange = 'transform, opacity';
      }

      // 确保使用GPU加速
      style.transform = 'translateZ(0)';

      return style;
    },
    [shouldReduceAnimations, enableWillChange]
  );

  return {
    shouldReduceAnimations,
    performanceLevel,
    durationMultiplier,
    enableWillChange,
    getOptimizedStyle,
  };
}

export default useAnimationPerformance;
