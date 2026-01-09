import { useState, useEffect, useCallback, useRef } from 'react';
import { useReducedMotion } from '../../hooks/useReducedMotion';

/**
 * ScrollProgress组件 - 滚动进度指示器
 * 
 * 实现功能：
 * - 滚动进度指示器
 * - 使用cyber green颜色
 * - 添加glow效果
 * 
 * Requirements: 8.5
 */

export interface ScrollProgressProps {
  /** 进度条高度 @default 3 */
  height?: number;
  /** 是否显示glow效果 @default true */
  glow?: boolean;
  /** 自定义颜色 (默认cyber green) */
  color?: string;
  /** 固定位置 @default 'top' */
  position?: 'top' | 'bottom';
  /** z-index @default 50 */
  zIndex?: number;
  /** 自定义类名 */
  className?: string;
}

export function ScrollProgress({
  height = 3,
  glow = true,
  color,
  position = 'top',
  zIndex = 50,
  className = '',
}: ScrollProgressProps) {
  const [progress, setProgress] = useState(0);
  const ticking = useRef(false);
  const prefersReducedMotion = useReducedMotion();

  const updateProgress = useCallback(() => {
    if (typeof window === 'undefined') return;

    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollProgress = docHeight > 0 ? Math.min((scrollTop / docHeight) * 100, 100) : 0;
    
    setProgress(scrollProgress);
    ticking.current = false;
  }, []);

  const handleScroll = useCallback(() => {
    if (!ticking.current) {
      requestAnimationFrame(updateProgress);
      ticking.current = true;
    }
  }, [updateProgress]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 初始化
    updateProgress();

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', updateProgress, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', updateProgress);
    };
  }, [handleScroll, updateProgress]);

  // 位置样式
  const positionStyles: React.CSSProperties = {
    position: 'fixed',
    left: 0,
    right: 0,
    zIndex,
    height: `${height}px`,
    ...(position === 'top' ? { top: 0 } : { bottom: 0 }),
  };

  // 进度条样式
  const progressStyles: React.CSSProperties = {
    width: `${progress}%`,
    height: '100%',
    backgroundColor: color || '#00FF41',
    transition: prefersReducedMotion ? 'none' : 'width 100ms ease-out',
    ...(glow && {
      boxShadow: `
        0 0 10px ${color || '#00FF41'}80,
        0 0 20px ${color || '#00FF41'}40,
        0 0 30px ${color || '#00FF41'}20
      `,
    }),
  };

  // 背景样式
  const backgroundStyles: React.CSSProperties = {
    ...positionStyles,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  };

  return (
    <div 
      className={`scroll-progress-container ${className}`}
      style={backgroundStyles}
      role="progressbar"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Page scroll progress"
    >
      <div 
        className="scroll-progress-bar"
        style={progressStyles}
      />
    </div>
  );
}

export default ScrollProgress;
