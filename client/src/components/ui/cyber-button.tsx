import React from 'react';
import ReactLoading from 'react-loading';
import { useReducedMotion } from '../../hooks/useReducedMotion';

/**
 * CyberButton组件 - 网络安全风格按钮
 * 
 * 实现霓虹发光效果、hover/active状态动画，确保最小44x44px触摸目标
 * 
 * Requirements: 4.7, 10.1, 10.5, 11.2
 */

export interface CyberButtonProps {
  children: React.ReactNode;
  /** 按钮变体: primary(主要), secondary(次要), ghost(幽灵) */
  variant?: 'primary' | 'secondary' | 'ghost';
  /** 按钮尺寸 */
  size?: 'sm' | 'md' | 'lg';
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否加载中 */
  loading?: boolean;
  /** 是否全宽 */
  fullWidth?: boolean;
  /** 点击事件 */
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  /** 按钮类型 */
  type?: 'button' | 'submit' | 'reset';
  /** 自定义类名 */
  className?: string;
}

// 变体样式映射
const variantClasses: Record<'primary' | 'secondary' | 'ghost', string> = {
  primary: `
    bg-cyber-green/10 hover:bg-cyber-green/20 active:bg-cyber-green/30
    text-cyber-green font-semibold
    border-2 border-cyber-green/50 hover:border-cyber-green/80
    shadow-glow hover:shadow-glow-md active:shadow-glow
  `,
  secondary: `
    bg-white/10 dark:bg-black/20 hover:bg-white/20 dark:hover:bg-black/30 active:bg-white/30 dark:active:bg-black/40
    text-slate-900 dark:text-slate-100 font-medium
    border border-white/30 dark:border-white/20 hover:border-white/50 dark:hover:border-white/30
    backdrop-blur-glass
    shadow-glass-light hover:shadow-glass-medium
  `,
  ghost: `
    bg-transparent hover:bg-cyber-green/10 active:bg-cyber-green/20
    text-cyber-green font-medium
    border border-transparent hover:border-cyber-green/30
  `,
};

// 尺寸样式映射 - 确保最小44x44px触摸目标 (Requirement 11.2)
const sizeClasses: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'min-h-[44px] min-w-[44px] px-4 py-2 text-sm',
  md: 'min-h-[44px] min-w-[44px] px-6 py-3 text-base',
  lg: 'min-h-[52px] min-w-[52px] px-8 py-4 text-lg',
};

export function CyberButton({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  onClick,
  type = 'button',
  className = '',
}: CyberButtonProps) {
  const prefersReducedMotion = useReducedMotion();
  
  // 基础样式
  const baseClasses = `
    relative inline-flex items-center justify-center gap-2
    rounded-lg font-heading tracking-wide
    cursor-pointer select-none
    transition-all duration-300
    focus:outline-none focus:ring-2 focus:ring-cyber-green/50 focus:ring-offset-2 focus:ring-offset-transparent
    disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none
  `;
  
  // 动画样式 - 尊重用户的减少动画偏好
  const animationClasses = !prefersReducedMotion
    ? 'hover:scale-[1.02] active:scale-[0.98]'
    : '';
  
  // 霓虹流光效果 (仅primary变体)
  const neonFlowClasses = variant === 'primary' && !prefersReducedMotion
    ? 'overflow-hidden'
    : '';

  const combinedClassName = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    animationClasses,
    neonFlowClasses,
    fullWidth ? 'w-full' : '',
    className,
  ].filter(Boolean).join(' ');

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || loading) return;
    onClick?.(e);
  };

  return (
    <button
      type={type}
      className={combinedClassName}
      disabled={disabled || loading}
      onClick={handleClick}
    >
      {/* 霓虹流光效果层 - 仅primary变体且非减少动画模式 */}
      {variant === 'primary' && !prefersReducedMotion && (
        <span 
          className="absolute inset-0 -translate-x-full hover:translate-x-full transition-transform duration-500 bg-gradient-to-r from-transparent via-cyber-green/20 to-transparent pointer-events-none"
          aria-hidden="true"
        />
      )}
      
      {/* 加载指示器 */}
      {loading && (
        <ReactLoading 
          type="spin" 
          color={variant === 'secondary' ? 'currentColor' : '#00FF41'} 
          width="1em" 
          height="1em" 
        />
      )}
      
      {/* 按钮内容 */}
      <span className={`relative z-10 ${loading ? 'opacity-70' : ''}`}>
        {children}
      </span>
    </button>
  );
}

export default CyberButton;
