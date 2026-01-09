/**
 * useTheme Hook - 增强的主题系统
 * 
 * 功能：
 * - 支持 light, dark, system 三种模式
 * - 平滑颜色过渡动画
 * - localStorage 持久化
 * - 系统偏好检测和监听
 * 
 * Requirements: 9.1, 9.2, 9.3, 9.5
 */

import { useState, useEffect, useCallback, useMemo } from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

const THEME_STORAGE_KEY = 'theme';
const THEME_TRANSITION_CLASS = 'theme-transitioning';
const TRANSITION_DURATION = 300; // ms

interface UseThemeReturn {
  /** 当前主题模式 (light | dark | system) */
  mode: ThemeMode;
  /** 解析后的实际主题 (light | dark) */
  resolvedTheme: ResolvedTheme;
  /** 设置主题模式 */
  setMode: (mode: ThemeMode) => void;
  /** 切换到下一个主题 */
  toggleTheme: () => void;
  /** 是否为暗色模式 */
  isDark: boolean;
  /** 系统偏好的主题 */
  systemTheme: ResolvedTheme;
}

/**
 * 获取系统偏好的主题
 */
function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * 从 localStorage 获取保存的主题
 */
function getStoredTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'system';
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === 'light' || stored === 'dark' || stored === 'system') {
    return stored;
  }
  return 'system';
}

/**
 * 保存主题到 localStorage
 */
function saveTheme(mode: ThemeMode): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(THEME_STORAGE_KEY, mode);
  } catch (e) {
    // localStorage 不可用时静默失败
    console.warn('Failed to save theme to localStorage:', e);
  }
}

/**
 * 解析主题模式为实际主题
 */
function resolveTheme(mode: ThemeMode, systemTheme: ResolvedTheme): ResolvedTheme {
  if (mode === 'system') {
    return systemTheme;
  }
  return mode;
}

/**
 * 应用主题到 DOM，带平滑过渡
 */
function applyTheme(theme: ResolvedTheme, enableTransition: boolean = true): void {
  if (typeof document === 'undefined') return;
  
  const root = document.documentElement;
  
  // 添加过渡类以启用平滑过渡
  if (enableTransition) {
    root.classList.add(THEME_TRANSITION_CLASS);
  }
  
  // 设置主题属性
  root.setAttribute('data-color-mode', theme);
  
  // 触发自定义事件，通知其他组件主题已更改
  window.dispatchEvent(new CustomEvent('colorSchemeChange', { 
    detail: { theme } 
  }));
  
  // 移除过渡类
  if (enableTransition) {
    setTimeout(() => {
      root.classList.remove(THEME_TRANSITION_CLASS);
    }, TRANSITION_DURATION);
  }
}

/**
 * 增强的主题系统 Hook
 * 
 * @example
 * ```tsx
 * const { mode, resolvedTheme, setMode, toggleTheme, isDark } = useTheme();
 * 
 * // 设置特定模式
 * setMode('dark');
 * 
 * // 循环切换主题
 * toggleTheme();
 * ```
 */
export function useTheme(): UseThemeReturn {
  const [mode, setModeState] = useState<ThemeMode>(() => getStoredTheme());
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(() => getSystemTheme());
  
  // 计算解析后的主题
  const resolvedTheme = useMemo(
    () => resolveTheme(mode, systemTheme),
    [mode, systemTheme]
  );
  
  const isDark = resolvedTheme === 'dark';
  
  // 监听系统主题变化
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      const newSystemTheme: ResolvedTheme = e.matches ? 'dark' : 'light';
      setSystemTheme(newSystemTheme);
      
      // 如果当前是 system 模式，需要更新实际主题
      if (mode === 'system') {
        applyTheme(newSystemTheme);
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [mode]);
  
  // 初始化时应用主题（不带过渡）
  useEffect(() => {
    applyTheme(resolvedTheme, false);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  
  // 设置主题模式
  const setMode = useCallback((newMode: ThemeMode) => {
    setModeState(newMode);
    saveTheme(newMode);
    
    const newResolvedTheme = resolveTheme(newMode, systemTheme);
    applyTheme(newResolvedTheme, true);
  }, [systemTheme]);
  
  // 循环切换主题: light -> system -> dark -> light
  const toggleTheme = useCallback(() => {
    const nextMode: ThemeMode = 
      mode === 'light' ? 'system' : 
      mode === 'system' ? 'dark' : 
      'light';
    setMode(nextMode);
  }, [mode, setMode]);
  
  return {
    mode,
    resolvedTheme,
    setMode,
    toggleTheme,
    isDark,
    systemTheme,
  };
}

/**
 * 获取当前颜色模式（用于非 React 环境）
 */
export function getCurrentColorMode(): ResolvedTheme {
  if (typeof document === 'undefined') return 'light';
  const mode = document.documentElement.getAttribute('data-color-mode');
  return mode === 'dark' ? 'dark' : 'light';
}

/**
 * 初始化主题系统（在应用启动时调用）
 * 用于在 React 渲染前设置正确的主题，避免闪烁
 */
export function initializeTheme(): void {
  const storedMode = getStoredTheme();
  const systemTheme = getSystemTheme();
  const resolvedTheme = resolveTheme(storedMode, systemTheme);
  applyTheme(resolvedTheme, false);
}

export default useTheme;
