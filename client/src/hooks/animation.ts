/**
 * 动画系统钩子统一导出
 * 
 * 包含以下钩子：
 * - useReducedMotion: 检测用户是否偏好减少动画
 * - useScrollAnimation: 滚动触发动画
 * - useStaggerAnimation: 交错动画延迟计算
 * - useAnimationPerformance: 动画性能优化
 * - useLazyLoad: 懒加载
 */

export { useReducedMotion } from './useReducedMotion';

export { 
  useScrollAnimation,
  type UseScrollAnimationOptions,
  type UseScrollAnimationReturn,
} from './useScrollAnimation';

export {
  useStaggerAnimation,
  calculateStaggerDelays,
  type UseStaggerAnimationOptions,
  type UseStaggerAnimationReturn,
} from './useStaggerAnimation';

export {
  useAnimationPerformance,
  type AnimationPerformanceOptions,
  type AnimationPerformanceReturn,
} from './useAnimationPerformance';

export {
  useLazyLoad,
  type UseLazyLoadOptions,
  type UseLazyLoadReturn,
} from './useLazyLoad';
