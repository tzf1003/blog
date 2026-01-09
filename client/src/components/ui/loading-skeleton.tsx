import React from 'react';
import { useReducedMotion } from '../../hooks/useReducedMotion';

/**
 * LoadingSkeleton组件 - 加载骨架屏
 * 
 * 实现pulse动画效果，支持不同形状和自定义尺寸
 * 
 * Requirements: 3.6, 10.3
 */

export interface LoadingSkeletonProps {
  /** 形状: text(文本行), circle(圆形), rect(矩形), card(卡片) */
  shape?: 'text' | 'circle' | 'rect' | 'card';
  /** 宽度 (支持CSS值，如 '100%', '200px', '12rem') */
  width?: string | number;
  /** 高度 (支持CSS值) */
  height?: string | number;
  /** 圆角大小 */
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  /** 是否启用动画 */
  animate?: boolean;
  /** 动画类型: pulse(脉冲), shimmer(闪烁) */
  animationType?: 'pulse' | 'shimmer';
  /** 重复行数 (仅text形状有效) */
  lines?: number;
  /** 自定义类名 */
  className?: string;
}

// 圆角大小映射
const roundedClasses: Record<string, string> = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
  full: 'rounded-full',
};

// 形状默认配置
const shapeDefaults: Record<string, { width: string; height: string; rounded: string }> = {
  text: { width: '100%', height: '1rem', rounded: 'rounded-md' },
  circle: { width: '48px', height: '48px', rounded: 'rounded-full' },
  rect: { width: '100%', height: '120px', rounded: 'rounded-lg' },
  card: { width: '100%', height: '200px', rounded: 'rounded-xl' },
};

export function LoadingSkeleton({
  shape = 'rect',
  width,
  height,
  rounded,
  animate = true,
  animationType = 'shimmer',
  lines = 1,
  className = '',
}: LoadingSkeletonProps) {
  const prefersReducedMotion = useReducedMotion();
  
  // 获取形状默认值
  const defaults = shapeDefaults[shape];
  
  // 计算最终尺寸
  const finalWidth = width ?? defaults.width;
  const finalHeight = height ?? defaults.height;
  const finalRounded = rounded ? roundedClasses[rounded] : defaults.rounded;
  
  // 动画类 - 尊重用户的减少动画偏好
  const shouldAnimate = animate && !prefersReducedMotion;
  
  // 基础样式
  const baseClasses = `
    bg-slate-200 dark:bg-slate-700
    ${finalRounded}
  `;
  
  // 动画样式
  const animationClasses = shouldAnimate
    ? animationType === 'shimmer'
      ? 'animate-skeleton bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700 bg-[length:200%_100%]'
      : 'animate-pulse'
    : '';

  const combinedClassName = [
    baseClasses,
    animationClasses,
    className,
  ].filter(Boolean).join(' ');

  // 尺寸样式
  const sizeStyle: React.CSSProperties = {
    width: typeof finalWidth === 'number' ? `${finalWidth}px` : finalWidth,
    height: typeof finalHeight === 'number' ? `${finalHeight}px` : finalHeight,
  };

  // 如果是text形状且有多行
  if (shape === 'text' && lines > 1) {
    return (
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={combinedClassName}
            style={{
              ...sizeStyle,
              // 最后一行宽度减少，模拟真实文本
              width: index === lines - 1 ? '75%' : sizeStyle.width,
            }}
            aria-hidden="true"
          />
        ))}
      </div>
    );
  }

  // 如果是card形状，渲染复合骨架
  if (shape === 'card') {
    return (
      <div 
        className={`${combinedClassName} p-4 space-y-4`}
        style={sizeStyle}
        aria-hidden="true"
      >
        {/* 图片区域 */}
        <div 
          className={`${animationClasses} bg-slate-300 dark:bg-slate-600 rounded-lg`}
          style={{ height: '50%' }}
        />
        {/* 标题 */}
        <div 
          className={`${animationClasses} bg-slate-300 dark:bg-slate-600 rounded-md`}
          style={{ height: '1.25rem', width: '80%' }}
        />
        {/* 描述文本 */}
        <div className="space-y-2">
          <div 
            className={`${animationClasses} bg-slate-300 dark:bg-slate-600 rounded-md`}
            style={{ height: '0.875rem', width: '100%' }}
          />
          <div 
            className={`${animationClasses} bg-slate-300 dark:bg-slate-600 rounded-md`}
            style={{ height: '0.875rem', width: '60%' }}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      className={combinedClassName}
      style={sizeStyle}
      aria-hidden="true"
    />
  );
}

/**
 * 预设骨架屏组合 - 文章卡片骨架
 */
export function FeedCardSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`glass-medium rounded-xl p-4 space-y-4 ${className}`}>
      {/* 头像和元信息 */}
      <div className="flex items-center gap-3">
        <LoadingSkeleton shape="circle" width={40} height={40} />
        <div className="flex-1 space-y-2">
          <LoadingSkeleton shape="text" width="40%" height={14} />
          <LoadingSkeleton shape="text" width="25%" height={12} />
        </div>
      </div>
      {/* 标题 */}
      <LoadingSkeleton shape="text" width="90%" height={20} />
      {/* 描述 */}
      <LoadingSkeleton shape="text" lines={2} height={14} />
      {/* 标签 */}
      <div className="flex gap-2">
        <LoadingSkeleton shape="rect" width={60} height={24} rounded="full" />
        <LoadingSkeleton shape="rect" width={80} height={24} rounded="full" />
        <LoadingSkeleton shape="rect" width={50} height={24} rounded="full" />
      </div>
    </div>
  );
}

/**
 * 预设骨架屏组合 - 页面内容骨架
 */
export function PageContentSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`space-y-6 ${className}`}>
      {/* 页面标题 */}
      <LoadingSkeleton shape="text" width="60%" height={32} />
      {/* 内容段落 */}
      <div className="space-y-4">
        <LoadingSkeleton shape="text" lines={4} height={16} />
        <LoadingSkeleton shape="rect" height={200} rounded="lg" />
        <LoadingSkeleton shape="text" lines={3} height={16} />
      </div>
    </div>
  );
}

export default LoadingSkeleton;
