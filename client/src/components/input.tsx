import { useReducedMotion } from "../hooks/useReducedMotion";

/**
 * Input组件 - Glass风格输入框
 * 
 * 实现玻璃态风格输入框，包含focus glow效果和优化的placeholder样式
 * 
 * Requirements: 10.2
 */

export interface InputProps {
  value: string;
  setValue: (v: string) => void;
  placeholder: string;
  /** 自动聚焦 */
  autofocus?: boolean;
  /** 自定义类名 */
  className?: string;
  /** 输入框ID */
  id?: string | number;
  /** 提交回调 */
  onSubmit?: () => void;
  /** 是否禁用 */
  disabled?: boolean;
  /** 输入类型 */
  type?: 'text' | 'email' | 'password' | 'search' | 'url';
}

export function Input({ 
  autofocus, 
  value, 
  setValue, 
  className = '', 
  placeholder, 
  onSubmit,
  disabled = false,
  type = 'text',
  id
}: InputProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <input
      id={id !== undefined ? String(id) : undefined}
      type={type}
      autoFocus={autofocus}
      placeholder={placeholder}
      value={value}
      disabled={disabled}
      onKeyDown={(event) => {
        if (event.key === 'Enter' && onSubmit) {
          onSubmit();
        }
      }}
      onChange={(event) => {
        setValue(event.target.value);
      }}
      className={`
        w-full py-2.5 px-4 rounded-lg
        min-h-[44px]
        /* Glass风格背景 */
        glass-medium
        /* 文字颜色 */
        t-primary
        /* Placeholder样式 */
        placeholder:text-slate-400 dark:placeholder:text-slate-500
        placeholder:font-normal
        /* Focus状态 - Glow效果 (Requirement 10.2) */
        focus:outline-none
        focus:ring-2 focus:ring-cyber-green/40
        focus:border-cyber-green/50
        focus:shadow-glow-sm
        focus:bg-white/25 dark:focus:bg-black/25
        /* Hover状态 */
        hover:border-white/30 dark:hover:border-white/20
        /* 过渡动画 */
        ${!prefersReducedMotion ? 'transition-all duration-200' : 'transition-colors duration-200'}
        /* Disabled状态 */
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
    />
  );
}

export interface CheckboxProps {
  value: boolean;
  setValue: React.Dispatch<React.SetStateAction<boolean>>;
  placeholder: string;
  id: string;
  className?: string;
  disabled?: boolean;
}

export function Checkbox({ 
  value, 
  setValue, 
  className = '', 
  placeholder,
  id,
  disabled = false
}: CheckboxProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <input 
      type='checkbox'
      id={id}
      placeholder={placeholder}
      checked={value}
      disabled={disabled}
      onChange={(event) => {
        setValue(event.target.checked);
      }}
      className={`
        w-5 h-5 rounded
        min-w-[44px] min-h-[44px]
        /* 边框和背景 */
        border-2 border-slate-300 dark:border-slate-600
        bg-white/10 dark:bg-black/10
        /* Checked状态 - Cyber Green */
        checked:bg-cyber-green checked:border-cyber-green
        checked:hover:bg-cyber-green-dark checked:hover:border-cyber-green-dark
        /* Focus状态 */
        focus:ring-2 focus:ring-cyber-green/50 focus:ring-offset-2 focus:ring-offset-transparent
        /* Hover状态 */
        hover:border-cyber-green/50
        /* 过渡动画 */
        ${!prefersReducedMotion ? 'transition-all duration-200' : 'transition-colors duration-200'}
        cursor-pointer
        /* Disabled状态 */
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
    />
  );
}