import React from 'react';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';
import { useReducedMotion } from '../../hooks/useReducedMotion';

/**
 * PageContainer组件 - 页面容器
 * 
 * 实现功能：
 * - 响应式max-width约束
 * - 页面入场动画
 * - 支持full-width和contained模式
 * 
 * Requirements: 8.1, 8.2, 8.3, 8.4
 */

export type ContainerSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
export type ContainerMode = 'contained' | 'full-width';

export interface PageContainerProps {
  children: React.ReactNode;
  /** 容器最大宽度 @default 'xl' */
  size?: ContainerSize;
  /** 布局模式 @default 'contained' */
  mode?: ContainerMode;
  /** 是否启用入场动画 @default true */
  animate?: boolean;
  /** 自定义类名 */
  className?: string;
  /** 内边距大小 @default 'default' */
  padding?: 'none' | 'sm' | 'default' | 'lg';
  /** HTML元素类型 @default 'main' */
  as?: 'main' | 'section' | 'article' | 'div';
}

// 响应式max-width约束映射
const sizeClasses: Record<ContainerSize, string> = {
  sm: 'max-w-screen-sm',   // 640px
  md: 'max-w-screen-md',   // 768px
  lg: 'max-w-screen-lg',   // 1024px
  xl: 'max-w-screen-xl',   // 1280px
  '2xl': 'max-w-screen-2xl', // 1536px
  full: 'max-w-full',
};

// 内边距映射
const paddingClasses: Record<string, string> = {
  none: '',
  sm: 'px-3 py-4',
  default: 'px-4 py-6 md:px-6 md:py-8',
  lg: 'px-6 py-8 md:px-8 md:py-12',
};

export function PageContainer({
  children,
  size = 'xl',
  mode = 'contained',
  animate = true,
  className = '',
  padding = 'default',
  as: Component = 'main',
}: PageContainerProps) {
  const prefersReducedMotion = useReducedMotion();
  const { ref, isVisible } = useScrollAnimation<HTMLElement>({
    threshold: 0.05,
    triggerOnce: true,
  });

  // 构建容器类名
  const containerClasses = [
    'w-full mx-auto',
    mode === 'contained' ? sizeClasses[size] : 'max-w-full',
    paddingClasses[padding],
    'transition-all',
    prefersReducedMotion ? 'duration-0' : 'duration-500',
  ];

  // 动画类名
  if (animate && !prefersReducedMotion) {
    containerClasses.push(
      isVisible 
        ? 'opacity-100 translate-y-0' 
        : 'opacity-0 translate-y-4'
    );
  }

  if (className) {
    containerClasses.push(className);
  }

  return React.createElement(
    Component,
    {
      ref: ref as React.RefObject<HTMLElement>,
      className: containerClasses.join(' '),
    },
    children
  );
}

export default PageContainer;
