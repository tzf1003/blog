import { useState, useRef, useEffect, ImgHTMLAttributes } from 'react';
import { useReducedMotion } from '../../hooks/useReducedMotion';

/**
 * LazyImage组件 - 懒加载图片
 * 
 * 实现原生loading="lazy"属性，并提供Intersection Observer备选方案
 * 支持加载状态显示和错误处理
 * 
 * Requirements: 12.1
 */

export interface LazyImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  /** 图片源地址 */
  src: string;
  /** 替代文本 */
  alt: string;
  /** 占位符图片或背景色 */
  placeholder?: string;
  /** 是否显示加载骨架 */
  showSkeleton?: boolean;
  /** 加载失败时的回退图片 */
  fallbackSrc?: string;
  /** 根元素边距，用于提前加载 */
  rootMargin?: string;
  /** 触发加载的阈值 */
  threshold?: number;
}

/**
 * 检测浏览器是否原生支持loading="lazy"
 */
const supportsNativeLazyLoading = (): boolean => {
  if (typeof window === 'undefined') return false;
  return 'loading' in HTMLImageElement.prototype;
};

export function LazyImage({
  src,
  alt,
  placeholder,
  showSkeleton = true,
  fallbackSrc,
  rootMargin = '200px',
  threshold = 0,
  className = '',
  style,
  ...props
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState<string | undefined>(undefined);
  const imgRef = useRef<HTMLImageElement>(null);
  const prefersReducedMotion = useReducedMotion();

  // 使用原生懒加载或Intersection Observer
  useEffect(() => {
    const element = imgRef.current;
    if (!element) return;

    // 如果支持原生懒加载，直接设置src
    if (supportsNativeLazyLoading()) {
      setCurrentSrc(src);
      return;
    }

    // 使用Intersection Observer作为备选方案
    if (!('IntersectionObserver' in window)) {
      // 不支持IO的浏览器直接加载
      setCurrentSrc(src);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setCurrentSrc(src);
          observer.unobserve(element);
        }
      },
      {
        rootMargin,
        threshold,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [src, rootMargin, threshold]);

  // 处理图片加载完成
  const handleLoad = () => {
    setIsLoaded(true);
    setHasError(false);
  };

  // 处理图片加载错误
  const handleError = () => {
    setHasError(true);
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
    }
  };

  // 骨架屏样式
  const skeletonClass = showSkeleton && !isLoaded && !hasError
    ? 'animate-pulse bg-slate-200 dark:bg-slate-700'
    : '';

  // 图片淡入动画
  const fadeInClass = !prefersReducedMotion && isLoaded
    ? 'opacity-100'
    : isLoaded ? 'opacity-100' : 'opacity-0';

  return (
    <div 
      className={`relative overflow-hidden ${className}`}
      style={style}
    >
      {/* 占位符/骨架屏 */}
      {showSkeleton && !isLoaded && !hasError && (
        <div 
          className={`absolute inset-0 ${skeletonClass}`}
          style={placeholder ? { backgroundImage: `url(${placeholder})`, backgroundSize: 'cover' } : undefined}
          aria-hidden="true"
        />
      )}
      
      {/* 实际图片 */}
      <img
        ref={imgRef}
        src={currentSrc}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={handleLoad}
        onError={handleError}
        className={`
          transition-opacity duration-300 ease-out
          ${fadeInClass}
          ${hasError && !fallbackSrc ? 'hidden' : ''}
        `}
        {...props}
      />

      {/* 错误状态显示 */}
      {hasError && !fallbackSrc && (
        <div 
          className="absolute inset-0 flex items-center justify-center bg-slate-100 dark:bg-slate-800 cyber-grid"
          aria-label={`Failed to load image: ${alt}`}
        >
          <i className="ri-image-line text-2xl t-muted" />
        </div>
      )}
    </div>
  );
}

export default LazyImage;
