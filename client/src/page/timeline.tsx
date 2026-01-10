import { useEffect, useRef, useState } from "react"
import { Helmet } from 'react-helmet'
import { Link } from "wouter"
import { Waiting } from "../components/loading"
import { client } from "../main"
import { headersWithAuth } from "../utils/auth"
import { siteName } from "../utils/constants"
import { useTranslation } from "react-i18next"
import { useReducedMotion } from "../hooks/useReducedMotion"
import { useScrollAnimation } from "../hooks/useScrollAnimation"

interface FeedItem {
    id: number;
    createdAt: Date;
    title: string | null;
}

export function TimelinePage() {
    const [feeds, setFeeds] = useState<Partial<Record<number, FeedItem[]>>>()
    const [length, setLength] = useState(0)
    const ref = useRef(false)
    const { t } = useTranslation()
    const prefersReducedMotion = useReducedMotion()
    
    function fetchFeeds() {
        client.feed.timeline.get({
            headers: headersWithAuth()
        })
        .then(({ data }) => {
            if (data && typeof data !== 'string') {
                const arr = Array.isArray(data) ? data : []
                setLength(arr.length)
                // 兼容的分组逻辑
                const groups = (Object.groupBy
                    ? Object.groupBy(arr, ({ createdAt }) => new Date(createdAt).getFullYear())
                    : arr.reduce<Record<number, FeedItem[]>>((acc, item) => {
                        const key = new Date(item.createdAt).getFullYear()
                        ;(acc[key] ||= []).push(item)
                        return acc
                    }, {})
                )

                setFeeds(groups)
            }
        })
        .catch(err => {
            console.error("fetchFeeds error:", err)
        })
    }

    useEffect(() => {
        if (ref.current) return
        fetchFeeds()
        ref.current = true
    }, [])
    
    return (
        <>
            <Helmet>
                <title>{`${t('timeline')} - ${process.env.NAME}`}</title>
                <meta property="og:site_name" content={siteName} />
                <meta property="og:title" content={t('timeline')} />
                <meta property="og:image" content={process.env.AVATAR} />
                <meta property="og:type" content="article" />
                <meta property="og:url" content={document.URL} />
            </Helmet>
            <Waiting for={feeds}>
                <main className={`w-full flex flex-col justify-center items-center mb-8 ${!prefersReducedMotion ? 'animate-fade-in' : ''}`}>
                    {/* 页面标题 */}
                    <div className="wauto text-start py-8">
                        <h1 className={`text-5xl font-heading font-bold t-primary mb-3 ${!prefersReducedMotion ? 'animate-slide-up' : ''}`}>
                            {t('timeline')}
                        </h1>
                        <p className={`text-base t-muted font-medium ${!prefersReducedMotion ? 'animate-slide-up' : ''}`}
                            style={{ animationDelay: !prefersReducedMotion ? '50ms' : '0ms' }}>
                            {t('article.total$count', { count: length })}
                        </p>
                    </div>
                    
                    {/* 时间线内容 */}
                    <div className="wauto relative">
                        {/* 时间线主轴 - cyber风格 */}
                        <div className="absolute left-4 md:left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-cyber-green via-cyber-green/50 to-transparent" 
                            aria-hidden="true" />
                        
                        {feeds && Object.keys(feeds).sort((a, b) => parseInt(b) - parseInt(a)).map((year, yearIndex) => (
                            <YearSection 
                                key={year} 
                                year={year} 
                                feeds={feeds[+year] || []} 
                                yearIndex={yearIndex}
                                t={t}
                            />
                        ))}
                    </div>
                </main>
            </Waiting>
        </>
    )
}

/**
 * 年份区块组件
 */
function YearSection({ 
    year, 
    feeds, 
    yearIndex,
    t 
}: { 
    year: string; 
    feeds: FeedItem[]; 
    yearIndex: number;
    t: (key: string, options?: Record<string, unknown>) => string;
}) {
    const prefersReducedMotion = useReducedMotion()
    const { ref, isVisible } = useScrollAnimation<HTMLDivElement>({
        threshold: 0.1,
        triggerOnce: true,
    })

    return (
        <div 
            ref={ref}
            className={`relative mb-8 transition-all duration-500 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
            style={{ 
                transitionDelay: !prefersReducedMotion ? `${yearIndex * 100}ms` : '0ms' 
            }}
        >
            {/* 年份标题 */}
            <div className="flex items-center gap-4 mb-6">
                {/* 年份节点 - cyber风格，绝对定位对齐到时间线主轴 */}
                <div className="absolute left-4 md:left-8 z-10 flex items-center justify-center -translate-x-1/2">
                    <div className="w-4 h-4 rounded-full bg-cyber-green shadow-glow animate-pulse" />
                    <div className="absolute w-8 h-8 rounded-full bg-cyber-green/20 animate-ping" 
                        style={{ animationDuration: '2s' }} />
                </div>
                
                <div className="flex items-center gap-3 pl-10 md:pl-16">
                    <span className="text-2xl md:text-3xl font-heading font-bold text-cyber-green">
                        {t('year$year', { year: year })}
                    </span>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-cyber-green/10 text-cyber-green border border-cyber-green/20">
                        {t('article.total_short$count', { count: feeds.length })}
                    </span>
                </div>
            </div>
            
            {/* 该年份的文章列表 */}
            <div className="space-y-2 pl-4 md:pl-8">
                {feeds.map((feed, index) => (
                    <TimelineItem 
                        key={feed.id} 
                        feed={feed} 
                        index={index}
                        t={t}
                    />
                ))}
            </div>
        </div>
    )
}

/**
 * 时间线项目组件
 */
function TimelineItem({ 
    feed, 
    index,
    t 
}: { 
    feed: FeedItem; 
    index: number;
    t: (key: string, options?: Record<string, unknown>) => string;
}) {
    const prefersReducedMotion = useReducedMotion()
    const formatter = new Intl.DateTimeFormat('en-US', { day: '2-digit', month: '2-digit' });
    
    return (
        <div 
            className={`
                group relative flex items-center gap-4 py-3 px-4 ml-4 md:ml-8
                glass rounded-xl
                transition-all duration-300
                hover:bg-cyber-green/5 hover:shadow-glow-sm hover:border-cyber-green/20
                ${!prefersReducedMotion ? 'animate-fade-in' : ''}
            `}
            style={{ 
                animationDelay: !prefersReducedMotion ? `${index * 50}ms` : '0ms',
                animationFillMode: 'forwards',
            }}
        >
            {/* 连接线到主轴 */}
            <div className="absolute -left-4 md:-left-8 top-1/2 w-4 md:w-8 h-0.5 bg-gradient-to-r from-cyber-green/50 to-transparent"
                aria-hidden="true" />
            
            {/* 节点 */}
            <div className="absolute -left-4 md:-left-8 top-1/2 -translate-y-1/2 -translate-x-1/2">
                <div className={`
                    w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-600
                    transition-all duration-300
                    group-hover:bg-cyber-green group-hover:shadow-glow-sm group-hover:scale-150
                `} />
            </div>
            
            {/* 日期 */}
            <span 
                className="flex-shrink-0 w-14 text-sm font-mono t-muted group-hover:text-cyber-green transition-colors duration-200" 
                title={new Date(feed.createdAt).toLocaleString()}
            >
                {formatter.format(new Date(feed.createdAt))}
            </span>
            
            {/* 标题 */}
            <Link 
                href={`/feed/${feed.id}`} 
                target="_blank" 
                className={`
                    flex-1 text-base t-primary 
                    transition-all duration-200
                    group-hover:text-cyber-green
                    text-pretty overflow-hidden
                    hover:underline underline-offset-2
                `}
            >
                {feed.title || t('unlisted')}
            </Link>
            
            {/* 箭头指示器 */}
            <i className={`
                ri-arrow-right-up-line t-muted
                transition-all duration-200
                opacity-0 -translate-x-2
                group-hover:opacity-100 group-hover:translate-x-0 group-hover:text-cyber-green
            `} />
        </div>
    )
}
