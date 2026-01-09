import ReactLoading from "react-loading";
import { useReducedMotion } from "../hooks/useReducedMotion";

/**
 * Button组件 - Cyber风格按钮
 * 
 * 集成CyberButton样式，包含loading状态和优化的focus状态
 * 
 * Requirements: 10.1, 10.2, 10.5
 */

export interface ButtonProps {
  title: string;
  onClick: () => void;
  /** 是否为次要按钮 */
  secondary?: boolean;
  /** 是否禁用 */
  disabled?: boolean;
  /** 按钮类型 */
  type?: 'button' | 'submit' | 'reset';
  /** 自定义类名 */
  className?: string;
}

export function Button({ 
  title, 
  onClick, 
  secondary = false,
  disabled = false,
  type = 'button',
  className = ''
}: ButtonProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <button 
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        text-nowrap rounded-lg px-4 py-2 h-min font-medium
        min-h-[44px] min-w-[44px]
        ${!prefersReducedMotion ? 'transition-all duration-200' : 'transition-colors duration-200'}
        cursor-pointer select-none
        /* Focus状态 (Requirement 10.2) */
        focus:outline-none focus:ring-2 focus:ring-cyber-green/50 focus:ring-offset-2 focus:ring-offset-transparent
        /* Disabled状态 */
        disabled:opacity-50 disabled:cursor-not-allowed
        ${secondary 
          ? `
            /* Secondary样式 - Glass效果 */
            glass-medium
            hover:bg-white/30 dark:hover:bg-black/30
            t-primary
            hover:border-white/30 dark:hover:border-white/20
          ` 
          : `
            /* Primary样式 - Cyber Glow效果 */
            bg-cyber-green/10 hover:bg-cyber-green/20 active:bg-cyber-green/30
            text-cyber-green font-semibold
            border-2 border-cyber-green/50 hover:border-cyber-green/80
            shadow-glow hover:shadow-glow-md
          `
        }
        /* Hover/Active动画 (Requirement 10.1, 10.5) */
        ${!prefersReducedMotion && !disabled ? 'hover:scale-[1.02] active:scale-[0.98]' : ''}
        ${className}
      `}
    >
      {title}
    </button>
  );
}

export interface ButtonWithLoadingProps extends ButtonProps {
  loading: boolean;
}

export function ButtonWithLoading({ 
  title, 
  onClick, 
  loading, 
  secondary = false,
  disabled = false,
  type = 'button',
  className = ''
}: ButtonWithLoadingProps) {
  const prefersReducedMotion = useReducedMotion();
  const isDisabled = disabled || loading;

  return (
    <button 
      type={type}
      onClick={onClick} 
      disabled={isDisabled}
      className={`
        text-nowrap rounded-lg px-4 py-2 h-min font-medium
        min-h-[44px] min-w-[44px]
        flex items-center justify-center gap-2
        ${!prefersReducedMotion ? 'transition-all duration-200' : 'transition-colors duration-200'}
        cursor-pointer select-none
        /* Focus状态 (Requirement 10.2) */
        focus:outline-none focus:ring-2 focus:ring-cyber-green/50 focus:ring-offset-2 focus:ring-offset-transparent
        /* Disabled/Loading状态 */
        disabled:cursor-not-allowed
        ${loading ? 'opacity-80' : ''}
        ${secondary 
          ? `
            /* Secondary样式 - Glass效果 */
            glass-medium
            hover:bg-white/30 dark:hover:bg-black/30
            t-primary
            hover:border-white/30 dark:hover:border-white/20
            disabled:opacity-50
          ` 
          : `
            /* Primary样式 - Cyber Glow效果 */
            bg-cyber-green/10 hover:bg-cyber-green/20 active:bg-cyber-green/30
            text-cyber-green font-semibold
            border-2 border-cyber-green/50 hover:border-cyber-green/80
            shadow-glow hover:shadow-glow-md
            disabled:opacity-70 disabled:shadow-none
          `
        }
        /* Hover/Active动画 (Requirement 10.1, 10.5) */
        ${!prefersReducedMotion && !isDisabled ? 'hover:scale-[1.02] active:scale-[0.98]' : ''}
        ${className}
      `}
    >
      {/* Loading指示器 (Requirement 10.3) */}
      {loading && (
        <ReactLoading 
          width="1em" 
          height="1em" 
          type="spin" 
          color={secondary ? "currentColor" : "#00FF41"} 
        />
      )}
      <span className={loading ? 'opacity-80' : ''}>{title}</span>
    </button>
  );
}