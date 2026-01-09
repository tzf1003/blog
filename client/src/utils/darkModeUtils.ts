/**
 * Dark Mode Utilities - 暗色模式工具
 * 
 * 提供主题系统的核心功能：
 * - 系统偏好检测和监听
 * - 主题持久化
 * - 平滑过渡
 * 
 * Requirements: 9.1, 9.2, 9.3, 9.5
 */

import { useState, useEffect } from "react";

export type ThemeMode = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

const THEME_STORAGE_KEY = 'theme';
const THEME_TRANSITION_CLASS = 'theme-transitioning';
const TRANSITION_DURATION = 300;

/**
 * 获取系统偏好的主题
 */
function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * 从 localStorage 获取保存的主题模式
 */
function getStoredThemeMode(): ThemeMode {
  if (typeof window === 'undefined') return 'system';
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === 'light' || stored === 'dark' || stored === 'system') {
    return stored;
  }
  return 'system';
}

/**
 * 解析主题模式为实际主题
 */
function resolveTheme(mode: ThemeMode): ResolvedTheme {
  if (mode === 'system') {
    return getSystemTheme();
  }
  return mode;
}

/**
 * 应用主题到 DOM
 */
function applyThemeToDOM(theme: ResolvedTheme, enableTransition: boolean = false): void {
  if (typeof document === 'undefined') return;
  
  const root = document.documentElement;
  
  // 添加过渡类以启用平滑过渡
  if (enableTransition) {
    root.classList.add(THEME_TRANSITION_CLASS);
  }
  
  // 设置主题属性
  root.setAttribute('data-color-mode', theme);
  
  // 触发自定义事件
  window.dispatchEvent(new Event('colorSchemeChange'));
  
  // 移除过渡类
  if (enableTransition) {
    setTimeout(() => {
      root.classList.remove(THEME_TRANSITION_CLASS);
    }, TRANSITION_DURATION);
  }
}

/**
 * 初始化并监听系统主题模式
 * 在应用启动时调用，设置初始主题并监听系统偏好变化
 */
export function listenSystemMode(): void {
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

  function applyCurrentTheme(enableTransition: boolean = false): void {
    const mode = getStoredThemeMode();
    const resolvedTheme = resolveTheme(mode);
    applyThemeToDOM(resolvedTheme, enableTransition);
  }

  function handleSystemThemeChange(): void {
    const mode = getStoredThemeMode();
    // 只有在 system 模式下才响应系统主题变化
    if (mode === 'system') {
      applyCurrentTheme(true);
    }
  }

  // 初始化时应用主题（不带过渡，避免闪烁）
  applyCurrentTheme(false);
  
  // 监听系统主题变化
  mediaQuery.addEventListener("change", handleSystemThemeChange);
}

/**
 * 获取当前解析后的颜色模式
 */
export function getCurrentColorMode(): ResolvedTheme {
  return (
    (document.documentElement.getAttribute("data-color-mode") as ResolvedTheme) || "light"
  );
}

/**
 * 获取当前主题模式（包括 system）
 */
export function getCurrentThemeMode(): ThemeMode {
  return getStoredThemeMode();
}

/**
 * 设置主题模式
 */
export function setThemeMode(mode: ThemeMode): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(THEME_STORAGE_KEY, mode);
  } catch (e) {
    console.warn('Failed to save theme to localStorage:', e);
  }
  
  const resolvedTheme = resolveTheme(mode);
  applyThemeToDOM(resolvedTheme, true);
}

/**
 * useColorMode Hook - 获取当前解析后的颜色模式
 * 
 * @returns 当前颜色模式 ('light' | 'dark')
 */
export function useColorMode(): ResolvedTheme {
  const [colorMode, setColorMode] = useState<ResolvedTheme>(
    getCurrentColorMode()
  );

  useEffect(() => {
    const updateColorMode = () => {
      setColorMode(getCurrentColorMode());
    };

    // 初始设置
    updateColorMode();

    // 监听颜色模式变化事件
    window.addEventListener("colorSchemeChange", updateColorMode);

    // 清理函数
    return () => {
      window.removeEventListener("colorSchemeChange", updateColorMode);
    };
  }, []);

  return colorMode;
}

/**
 * useThemeMode Hook - 获取和设置主题模式
 * 
 * @returns [当前模式, 设置模式函数, 解析后的主题]
 */
export function useThemeMode(): [ThemeMode, (mode: ThemeMode) => void, ResolvedTheme] {
  const [mode, setModeState] = useState<ThemeMode>(() => getStoredThemeMode());
  const colorMode = useColorMode();
  
  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode);
    setThemeMode(newMode);
  };
  
  return [mode, setMode, colorMode];
}
