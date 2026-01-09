import { useLocation } from "wouter";
import { useReducedMotion } from "../hooks/useReducedMotion";

/**
 * HashTag组件 - Cyber风格标签
 * 
 * 实现网络安全风格的标签设计，包含hover glow效果
 * 
 * Requirements: 7.4
 */

export interface HashTagProps {
  name: string;
  /** 是否显示为紧凑模式 */
  compact?: boolean;
  /** 是否禁用点击 */
  disabled?: boolean;
}

export function HashTag({ name, compact = false, disabled = false }: HashTagProps) {
  const [, setLocation] = useLocation();
  const prefersReducedMotion = useReducedMotion();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setLocation(`/hashtag/${name}`);
    }
  };

  return (
    <button 
      onClick={handleClick}
      disabled={disabled}
      className={`
        inline-flex items-center gap-1.5
        ${compact ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm'}
        rounded-lg font-medium
        /* Cyber风格背景 */
        bg-cyber-green/5 dark:bg-cyber-green/10
        /* 文字颜色 */
        text-cyber-green/80 dark:text-cyber-green/90
        /* 边框 */
        border border-cyber-green/20 dark:border-cyber-green/30
        /* Hover效果 */
        hover:bg-cyber-green/15 dark:hover:bg-cyber-green/20
        hover:text-cyber-green hover:border-cyber-green/40
        hover:shadow-glow-sm
        /* Active效果 */
        active:scale-95
        /* 过渡动画 */
        ${!prefersReducedMotion ? 'transition-all duration-200' : 'transition-colors duration-200'}
        /* 交互状态 */
        cursor-pointer select-none
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none
      `}
    >
      <i className="ri-hashtag text-[0.7em] opacity-70" />
      <span>{name}</span>
    </button>
  );
}