import React from 'react';
import { useReducedMotion } from '../../hooks/useReducedMotion';

/**
 * GlowText组件 - 发光文字效果
 * 
 * 实现文字发光效果，支持渐变色和glitch动画
 * 
 * Requirements: 4.4
 */

export interface GlowTextProps {
  children: React.ReactNode;
  /** 是否启用发光效果 */
  glow?: boolean;
  /** 发光颜色 (默认为cyber green) */
  glowColor?: string;
  /** 是否启用渐变效果 */
  gradient?: boolean;
  /** 渐变起始颜色 */
  gradientFrom?: string;
  /** 渐变结束颜色 */
  gradientTo?: string;
  /** 是否启用glitch动画 */
  glitch?: boolean;
  /** glitch动画强度: subtle(轻微), normal(正常), intense(强烈) */
  glitchIntensity?: 'subtle' | 'normal' | 'intense';
  /** 是否启用脉冲动画 */
  pulse?: boolean;
  /** HTML元素类型 */
  as?: 'span' | 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'div';
  /** 自定义类名 */
  className?: string;
}

// Glitch强度对应的CSS类
const glitchClasses: Record<'subtle' | 'normal' | 'intense', string> = {
  subtle: 'glitch-subtle',
  normal: 'glitch-text',
  intense: 'glitch-text glitch-hover',
};

export function GlowText({
  children,
  glow = true,
  glowColor = '#00FF41',
  gradient = false,
  gradientFrom = '#00FF41',
  gradientTo = '#00FFFF',
  glitch = false,
  glitchIntensity = 'subtle',
  pulse = false,
  as: Component = 'span',
  className = '',
}: GlowTextProps) {
  const prefersReducedMotion = useReducedMotion();
  
  // 基础样式
  const baseClasses = 'inline-block';
  
  // 发光效果样式
  const glowStyle = glow && !gradient ? {
    color: glowColor,
    textShadow: `
      0 0 5px ${glowColor}80,
      0 0 10px ${glowColor}50,
      0 0 20px ${glowColor}30
    `,
  } : {};
  
  // 渐变效果样式
  const gradientStyle = gradient ? {
    background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})`,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  } : {};
  
  // 渐变发光效果 (渐变文字 + 发光阴影)
  const gradientGlowStyle = gradient && glow ? {
    filter: `drop-shadow(0 0 8px ${gradientFrom}50) drop-shadow(0 0 16px ${gradientTo}30)`,
  } : {};
  
  // Glitch效果类 - 尊重用户的减少动画偏好
  const glitchClass = glitch && !prefersReducedMotion 
    ? glitchClasses[glitchIntensity] 
    : '';
  
  // 脉冲动画类
  const pulseClass = pulse && !prefersReducedMotion 
    ? 'neon-text-pulse' 
    : '';

  const combinedClassName = [
    baseClasses,
    glitchClass,
    pulseClass,
    'transition-all duration-300',
    className,
  ].filter(Boolean).join(' ');

  const combinedStyle = {
    ...glowStyle,
    ...gradientStyle,
    ...gradientGlowStyle,
  };

  // 对于glitch效果，需要data-text属性
  const dataAttributes = glitch && !prefersReducedMotion ? {
    'data-text': typeof children === 'string' ? children : '',
  } : {};

  return React.createElement(
    Component,
    {
      className: combinedClassName,
      style: Object.keys(combinedStyle).length > 0 ? combinedStyle : undefined,
      ...dataAttributes,
    },
    children
  );
}

export default GlowText;
