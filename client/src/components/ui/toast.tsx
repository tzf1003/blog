import React, { useEffect, useState, useCallback, createContext, useContext } from 'react';
import { useReducedMotion } from '../../hooks/useReducedMotion';

/**
 * Toast通知组件 - 交互反馈系统
 * 
 * 实现success/error/info变体，入场/退场动画，支持自动消失
 * 
 * Requirements: 10.4
 */

export type ToastVariant = 'success' | 'error' | 'info' | 'warning';

export interface ToastData {
  id: string;
  message: string;
  variant: ToastVariant;
  duration?: number;
  title?: string;
}

export interface ToastProps extends ToastData {
  onClose: (id: string) => void;
}

// 变体样式映射
const variantStyles: Record<ToastVariant, {
  bg: string;
  border: string;
  icon: string;
  iconColor: string;
  glow: string;
}> = {
  success: {
    bg: 'bg-cyber-green/10 dark:bg-cyber-green/15',
    border: 'border-cyber-green/30 dark:border-cyber-green/40',
    icon: '✓',
    iconColor: 'text-cyber-green',
    glow: 'shadow-[0_0_20px_rgba(0,255,65,0.2)]',
  },
  error: {
    bg: 'bg-red-500/10 dark:bg-red-500/15',
    border: 'border-red-500/30 dark:border-red-500/40',
    icon: '✕',
    iconColor: 'text-red-500',
    glow: 'shadow-[0_0_20px_rgba(239,68,68,0.2)]',
  },
  info: {
    bg: 'bg-blue-500/10 dark:bg-blue-500/15',
    border: 'border-blue-500/30 dark:border-blue-500/40',
    icon: 'ℹ',
    iconColor: 'text-blue-500',
    glow: 'shadow-[0_0_20px_rgba(59,130,246,0.2)]',
  },
  warning: {
    bg: 'bg-amber-500/10 dark:bg-amber-500/15',
    border: 'border-amber-500/30 dark:border-amber-500/40',
    icon: '⚠',
    iconColor: 'text-amber-500',
    glow: 'shadow-[0_0_20px_rgba(245,158,11,0.2)]',
  },
};

// 单个Toast组件
export function Toast({ id, message, variant, duration = 4000, title, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  
  const styles = variantStyles[variant];

  const handleClose = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      onClose(id);
    }, prefersReducedMotion ? 0 : 300);
  }, [id, onClose, prefersReducedMotion]);

  // 入场动画
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  // 自动消失
  useEffect(() => {
    if (duration <= 0) return;
    
    const timer = setTimeout(() => {
      handleClose();
    }, duration);
    
    return () => clearTimeout(timer);
  }, [duration, handleClose]);

  // 动画类
  const animationClasses = prefersReducedMotion
    ? ''
    : `transition-all duration-300 ease-out ${
        isExiting
          ? 'opacity-0 translate-x-full'
          : isVisible
          ? 'opacity-100 translate-x-0'
          : 'opacity-0 translate-x-full'
      }`;

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`
        relative flex items-start gap-3 p-4 rounded-lg
        backdrop-blur-glass border
        ${styles.bg} ${styles.border} ${styles.glow}
        ${animationClasses}
        min-w-[280px] max-w-[400px]
      `}
    >
      {/* 图标 */}
      <span 
        className={`
          flex-shrink-0 w-6 h-6 flex items-center justify-center
          rounded-full ${styles.bg} ${styles.iconColor}
          font-bold text-sm
        `}
        aria-hidden="true"
      >
        {styles.icon}
      </span>
      
      {/* 内容 */}
      <div className="flex-1 min-w-0">
        {title && (
          <p className={`font-semibold text-sm ${styles.iconColor} mb-1`}>
            {title}
          </p>
        )}
        <p className="text-sm text-slate-700 dark:text-slate-200 break-words">
          {message}
        </p>
      </div>
      
      {/* 关闭按钮 */}
      <button
        onClick={handleClose}
        className={`
          flex-shrink-0 w-6 h-6 flex items-center justify-center
          rounded-full hover:bg-white/20 dark:hover:bg-black/20
          text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200
          transition-colors duration-200
          focus:outline-none focus:ring-2 focus:ring-cyber-green/50
        `}
        aria-label="关闭通知"
      >
        <span aria-hidden="true">×</span>
      </button>
      
      {/* 进度条 - 显示剩余时间 */}
      {duration > 0 && !prefersReducedMotion && (
        <div 
          className="absolute bottom-0 left-0 right-0 h-1 rounded-b-lg overflow-hidden"
          aria-hidden="true"
        >
          <div 
            className={`h-full ${styles.iconColor.replace('text-', 'bg-')} opacity-30`}
            style={{
              animation: `toast-progress ${duration}ms linear forwards`,
            }}
          />
        </div>
      )}
    </div>
  );
}


// Toast容器组件
export interface ToastContainerProps {
  toasts: ToastData[];
  onClose: (id: string) => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
}

const positionClasses: Record<string, string> = {
  'top-right': 'top-4 right-4',
  'top-left': 'top-4 left-4',
  'bottom-right': 'bottom-4 right-4',
  'bottom-left': 'bottom-4 left-4',
  'top-center': 'top-4 left-1/2 -translate-x-1/2',
  'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
};

export function ToastContainer({ 
  toasts, 
  onClose, 
  position = 'top-right' 
}: ToastContainerProps) {
  return (
    <div 
      className={`fixed z-50 flex flex-col gap-3 ${positionClasses[position]}`}
      aria-label="通知区域"
    >
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} onClose={onClose} />
      ))}
    </div>
  );
}

// Toast Context - 全局状态管理
interface ToastContextValue {
  toasts: ToastData[];
  addToast: (toast: Omit<ToastData, 'id'>) => string;
  removeToast: (id: string) => void;
  clearAll: () => void;
  // 便捷方法
  success: (message: string, options?: Partial<Omit<ToastData, 'id' | 'message' | 'variant'>>) => string;
  error: (message: string, options?: Partial<Omit<ToastData, 'id' | 'message' | 'variant'>>) => string;
  info: (message: string, options?: Partial<Omit<ToastData, 'id' | 'message' | 'variant'>>) => string;
  warning: (message: string, options?: Partial<Omit<ToastData, 'id' | 'message' | 'variant'>>) => string;
}

const ToastContext = createContext<ToastContextValue | null>(null);

// 生成唯一ID
let toastIdCounter = 0;
const generateId = () => `toast-${++toastIdCounter}-${Date.now()}`;

// Toast Provider组件
export interface ToastProviderProps {
  children: React.ReactNode;
  position?: ToastContainerProps['position'];
  maxToasts?: number;
}

export function ToastProvider({ 
  children, 
  position = 'top-right',
  maxToasts = 5 
}: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const addToast = useCallback((toast: Omit<ToastData, 'id'>) => {
    const id = generateId();
    setToasts((prev) => {
      const newToasts = [...prev, { ...toast, id }];
      // 限制最大数量，移除最旧的
      if (newToasts.length > maxToasts) {
        return newToasts.slice(-maxToasts);
      }
      return newToasts;
    });
    return id;
  }, [maxToasts]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setToasts([]);
  }, []);

  // 便捷方法
  const success = useCallback((message: string, options?: Partial<Omit<ToastData, 'id' | 'message' | 'variant'>>) => {
    return addToast({ message, variant: 'success', ...options });
  }, [addToast]);

  const error = useCallback((message: string, options?: Partial<Omit<ToastData, 'id' | 'message' | 'variant'>>) => {
    return addToast({ message, variant: 'error', ...options });
  }, [addToast]);

  const info = useCallback((message: string, options?: Partial<Omit<ToastData, 'id' | 'message' | 'variant'>>) => {
    return addToast({ message, variant: 'info', ...options });
  }, [addToast]);

  const warning = useCallback((message: string, options?: Partial<Omit<ToastData, 'id' | 'message' | 'variant'>>) => {
    return addToast({ message, variant: 'warning', ...options });
  }, [addToast]);

  const contextValue: ToastContextValue = {
    toasts,
    addToast,
    removeToast,
    clearAll,
    success,
    error,
    info,
    warning,
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ToastContainer toasts={toasts} onClose={removeToast} position={position} />
    </ToastContext.Provider>
  );
}

// useToast Hook
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export default Toast;
