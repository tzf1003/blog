import React from 'react';
import { useReducedMotion } from '../../hooks/useReducedMotion';

/**
 * GlassPanel组件 - 玻璃态UI面板
 * 
 * 实现玻璃态设计效果，支持多种强度级别、发光效果和入场动画
 * 
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5
 */

export interface GlassPanelProps {
  children: React.ReactNode;
  /** 玻璃效果强度: light(轻度), medium(中度), strong(强度) */
  intensity?: 'light' | 'medium' | 'strong';
  /** 是否启用发光效果 */
  glow?: boolean;
  /** 发光颜色 (默认为cyber green) */
  glowColor?: string;
  /** 圆角大小 */
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  /** 是否启用入场动画 */
  animate?: boolean;
  /** 自定义类名 */
  className?: string;
  /** 悬浮时增强效果 */
  hoverEffect?: boolean;
  /** HTML元素类型 */
  as?: keyof JSX.IntrinsicElements;
}

// 强度级别对应的CSS类
const intensityClasses: Record<'light' | 'medium' | 'strong', string> = {
  light: 'glass-light',
  medium: 'glass-medium',
  strong: 'glass-strong',
};

// 圆角大小对应的CSS类
const roundedClasses: Record<string, string> = {
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
  full: 'rounded-full',
};

export function GlassPanel({
  children,
  intensity = 'medium',
  glow = false,
  glowColor,
  rounded = 'lg',
  animate = false,
  className = '',
  hoverEffect = false,
  as: Component = 'div',
}: GlassPanelProps) {
  const prefersReducedMotion = useReducedMotion();
  
  // 构建类名
  const baseClasses = intensityClasses[intensity];
  const roundedClass = roundedClasses[rounded] || 'rounded-lg';
  
  // 发光效果类
  const glowClasses = glow ? 'glass-glow' : '';
  const hoverClasses = hoverEffect ? 'glass-glow-hover hover:scale-[1.02] active:scale-[0.98]' : '';
  
  // 动画类 - 尊重用户的减少动画偏好
  const animateClasses = animate && !prefersReducedMotion 
    ? 'animate-fade-in' 
    : '';
  
  // 自定义发光颜色样式
  const customGlowStyle = glow && glowColor 
    ? { 
        boxShadow: `0 0 20px ${glowColor}40, 0 0 40px ${glowColor}20`,
        borderColor: `${glowColor}50`,
      } 
    : {};

  const combinedClassName = [
    baseClasses,
    roundedClass,
    glowClasses,
    hoverClasses,
    animateClasses,
    'transition-all duration-300',
    className,
  ].filter(Boolean).join(' ');

  return React.createElement(
    Component,
    {
      className: combinedClassName,
      style: Object.keys(customGlowStyle).length > 0 ? customGlowStyle : undefined,
    },
    children
  );
}

export default GlassPanel;
