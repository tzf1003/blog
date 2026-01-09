import React from 'react';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { FeedCardSkeleton, PageContentSkeleton } from './loading-skeleton';
import { GlassPanel } from './glass-panel';

/**
 * PageLoading组件 - 页面级加载状态
 * 
 * 为异步操作添加loading指示器，实现页面级loading骨架
 * 
 * Requirements: 10.3, 10.6
 */

export interface PageLoadingProps {
  /** 加载类型 */
  type?: 'spinner' | 'skeleton' | 'overlay';
  /** 骨架类型 (仅skeleton类型有效) */
  skeletonType?: 'feed' | 'content' | 'list' | 'grid';
  /** 骨架数量 (仅list/grid类型有效) */
  count?: number;
  /** 加载文本 */
  text?: string;
  /** 是否全屏 */
  fullScreen?: boolean;
  /** 自定义类名 */
  className?: string;
}

// Cyber风格Spinner
function CyberSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const prefersReducedMotion = useReducedMotion();
  
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
  };
  
  const borderSizes = {
    sm: 'border-2',
    md: 'border-3',
    lg: 'border-4',
  };

  return (
    <div 
      className={`
        ${sizeClasses[size]}
        ${borderSizes[size]}
        border-cyber-green/20
        border-t-cyber-green
        rounded-full
        ${!prefersReducedMotion ? 'animate-spin' : ''}
        shadow-[0_0_10px_rgba(0,255,65,0.3)]
      `}
      role="status"
      aria-label="加载中"
    />
  );
}

// 加载覆盖层
function LoadingOverlay({ text, className = '' }: { text?: string; className?: string }) {
  return (
    <div 
      className={`
        fixed inset-0 z-50
        flex flex-col items-center justify-center gap-4
        bg-black/50 backdrop-blur-sm
        ${className}
      `}
      role="alert"
      aria-busy="true"
      aria-live="polite"
    >
      <GlassPanel intensity="medium" rounded="xl" className="p-8 flex flex-col items-center gap-4">
        <CyberSpinner size="lg" />
        {text && (
          <p className="text-cyber-green font-medium text-lg animate-pulse">
            {text}
          </p>
        )}
      </GlassPanel>
    </div>
  );
}

// 列表骨架
function ListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <FeedCardSkeleton key={index} />
      ))}
    </div>
  );
}

// 网格骨架
function GridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <FeedCardSkeleton key={index} />
      ))}
    </div>
  );
}

export function PageLoading({
  type = 'spinner',
  skeletonType = 'content',
  count = 3,
  text,
  fullScreen = false,
  className = '',
}: PageLoadingProps) {
  // Overlay类型
  if (type === 'overlay') {
    return <LoadingOverlay text={text} className={className} />;
  }

  // Skeleton类型
  if (type === 'skeleton') {
    const skeletonContent = {
      feed: <FeedCardSkeleton />,
      content: <PageContentSkeleton />,
      list: <ListSkeleton count={count} />,
      grid: <GridSkeleton count={count} />,
    };

    return (
      <div 
        className={`${fullScreen ? 'min-h-screen' : ''} ${className}`}
        role="status"
        aria-label="内容加载中"
      >
        {skeletonContent[skeletonType]}
      </div>
    );
  }

  // Spinner类型 (默认)
  return (
    <div 
      className={`
        flex flex-col items-center justify-center gap-4
        ${fullScreen ? 'min-h-screen' : 'py-12'}
        ${className}
      `}
      role="status"
      aria-label="加载中"
    >
      <CyberSpinner size="lg" />
      {text && (
        <p className="text-slate-600 dark:text-slate-400 font-medium">
          {text}
        </p>
      )}
    </div>
  );
}

/**
 * AsyncBoundary组件 - 异步操作边界
 * 
 * 包装异步内容，自动显示loading状态
 */
export interface AsyncBoundaryProps {
  /** 是否加载中 */
  loading: boolean;
  /** 加载类型 */
  loadingType?: PageLoadingProps['type'];
  /** 骨架类型 */
  skeletonType?: PageLoadingProps['skeletonType'];
  /** 加载文本 */
  loadingText?: string;
  /** 子内容 */
  children: React.ReactNode;
  /** 自定义类名 */
  className?: string;
}

export function AsyncBoundary({
  loading,
  loadingType = 'skeleton',
  skeletonType = 'content',
  loadingText,
  children,
  className = '',
}: AsyncBoundaryProps) {
  if (loading) {
    return (
      <PageLoading 
        type={loadingType} 
        skeletonType={skeletonType}
        text={loadingText}
        className={className}
      />
    );
  }

  return <>{children}</>;
}

/**
 * InlineLoading组件 - 内联加载指示器
 * 
 * 用于小型异步操作的内联loading显示
 */
export interface InlineLoadingProps {
  /** 尺寸 */
  size?: 'sm' | 'md' | 'lg';
  /** 加载文本 */
  text?: string;
  /** 自定义类名 */
  className?: string;
}

export function InlineLoading({ 
  size = 'sm', 
  text,
  className = '' 
}: InlineLoadingProps) {
  return (
    <span 
      className={`inline-flex items-center gap-2 ${className}`}
      role="status"
      aria-label={text || '加载中'}
    >
      <CyberSpinner size={size} />
      {text && (
        <span className="text-slate-600 dark:text-slate-400 text-sm">
          {text}
        </span>
      )}
    </span>
  );
}

export { CyberSpinner };
export default PageLoading;
