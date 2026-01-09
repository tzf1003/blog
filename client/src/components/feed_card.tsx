import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { timeago } from "../utils/timeago";
import { HashTag } from "./hashtag";
import { useMemo, useState } from "react";
import { useStaggerAnimation } from "../hooks/useStaggerAnimation";
import { useReducedMotion } from "../hooks/useReducedMotion";

/**
 * FeedCard组件 - 文章卡片
 * 
 * 实现glass morphism卡片设计，包含hover lift效果、border glow、
 * 图片zoom动画、标题gradient效果和stagger入场动画
 * 
 * 性能优化：
 * - 使用transform/opacity进行动画（GPU加速）
 * - 仅在悬浮时启用will-change
 * - 支持减少动画偏好
 * 
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 11.4, 12.2
 */

export interface FeedCardProps {
  id: string;
  title: string;
  summary: string;
  avatar?: string;
  hashtags: { id: number; name: string }[];
  createdAt: Date;
  updatedAt: Date;
  draft?: number;
  listed?: number;
  top?: number;
  /** 列表索引，用于stagger动画 */
  index?: number;
}

export function FeedCard({ 
  id, 
  title, 
  avatar, 
  draft, 
  listed, 
  top, 
  summary, 
  hashtags, 
  createdAt, 
  updatedAt,
  index = 0 
}: FeedCardProps) {
  const { t } = useTranslation();
  const prefersReducedMotion = useReducedMotion();
  const [isHovered, setIsHovered] = useState(false);
  
  // 交错动画延迟 (Requirement 7.5)
  const { style: staggerStyle, shouldReduceMotion } = useStaggerAnimation(index, {
    delayInterval: 50,
    baseDelay: 0,
    maxDelay: 500,
  });

  // 性能优化：仅在悬浮时启用will-change (Requirement 12.2)
  const performanceStyle = useMemo(() => ({
    willChange: isHovered && !prefersReducedMotion ? 'transform, opacity' : 'auto',
  }), [isHovered, prefersReducedMotion]);

  return useMemo(() => (
    <Link 
      href={`/feed/${id}`} 
      target="_blank" 
      className={`
        block w-full rounded-2xl p-6 sm:p-8
        /* Glass Morphism效果 (Requirement 7.1) */
        glass-medium
        /* Hover lift效果和border glow - 使用transform实现GPU加速 (Requirement 7.1, 7.7, 12.2) */
        transition-all duration-300 ease-out
        hover:scale-[1.02] hover:shadow-glow-md
        hover:border-cyber-green/30
        active:scale-[0.99]
        /* 入场动画 */
        ${!shouldReduceMotion ? 'animate-fade-in opacity-0' : ''}
        cursor-pointer group
        /* GPU加速层 */
        transform-gpu
      `}
      style={{
        ...staggerStyle,
        ...performanceStyle,
        animationFillMode: 'forwards',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 特色图片区域 (Requirement 7.2) */}
      {avatar && (
        <div className="relative mb-6 rounded-xl overflow-hidden">
          {/* 扫描线效果覆盖层 */}
          <div className="absolute inset-0 scan-overlay pointer-events-none z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <img 
            src={avatar} 
            alt=""
            loading="lazy"
            decoding="async"
            className={`
              object-cover object-center w-full max-h-96
              transition-transform duration-500 ease-out
              transform-gpu
              ${!prefersReducedMotion ? 'group-hover:scale-110' : ''}
            `}
          />
        </div>
      )}

      {/* 标题区域 (Requirement 7.3) */}
      <h1 className={`
        text-xl sm:text-2xl font-heading font-semibold 
        t-primary text-pretty overflow-hidden mb-3
        transition-all duration-300
        group-hover:text-transparent group-hover:bg-clip-text
        group-hover:bg-gradient-to-r group-hover:from-cyber-green group-hover:to-cyan-400
      `}>
        {title}
      </h1>

      {/* 元数据区域 (Requirement 7.4, 7.6) */}
      <div className="flex flex-wrap gap-2 sm:gap-3 mb-3">
        {/* 发布时间 */}
        <span 
          className="t-muted text-sm flex items-center gap-1.5 transition-colors duration-200 group-hover:text-slate-400" 
          title={new Date(createdAt).toLocaleString()}
        >
          <i className="ri-calendar-line text-xs" />
          {createdAt === updatedAt 
            ? timeago(createdAt) 
            : t('feed_card.published$time', { time: timeago(createdAt) })
          }
        </span>

        {/* 更新时间 */}
        {createdAt !== updatedAt && (
          <span 
            className="t-muted text-sm flex items-center gap-1.5 transition-colors duration-200 group-hover:text-slate-400" 
            title={new Date(updatedAt).toLocaleString()}
          >
            <i className="ri-refresh-line text-xs" />
            {t('feed_card.updated$time', { time: timeago(updatedAt) })}
          </span>
        )}

        {/* 草稿状态指示器 (Requirement 7.6) */}
        {draft === 1 && (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 text-sm font-medium border border-amber-500/20">
            <i className="ri-draft-line text-xs" />
            {t("draft")}
          </span>
        )}

        {/* 未列出状态指示器 (Requirement 7.6) */}
        {listed === 0 && (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-500/10 t-muted text-sm border border-slate-500/20">
            <i className="ri-eye-off-line text-xs" />
            {t("unlisted")}
          </span>
        )}

        {/* 置顶状态指示器 (Requirement 7.6) */}
        {top === 1 && (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-cyber-green/10 text-cyber-green text-sm font-medium border border-cyber-green/20 shadow-glow-sm">
            <i className="ri-pushpin-fill text-xs" />
            {t('article.top.title')}
          </span>
        )}
      </div>

      {/* 摘要区域 */}
      <p className="text-pretty overflow-hidden t-secondary leading-relaxed mb-4 line-clamp-3">
        {summary}
      </p>

      {/* 标签区域 (Requirement 7.4) */}
      {hashtags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {hashtags.map(({ name }, idx) => (
            <HashTag key={idx} name={name} />
          ))}
        </div>
      )}
    </Link>
  ), [id, title, avatar, draft, listed, top, summary, hashtags, createdAt, updatedAt, staggerStyle, shouldReduceMotion, prefersReducedMotion, performanceStyle, t]);
}