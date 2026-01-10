import { useContext, useEffect, useRef, useState } from "react"
import { Helmet } from 'react-helmet'
import { Link, useSearch } from "wouter"
import { FeedCard } from "../components/feed_card"
import { FeedCardSkeleton } from "../components/ui/loading-skeleton"
import { client } from "../main"
import { ProfileContext } from "../state/profile"
import { headersWithAuth } from "../utils/auth"
import { siteName } from "../utils/constants"
import { tryInt } from "../utils/int"
import { useTranslation } from "react-i18next"
import { useReducedMotion } from "../hooks/useReducedMotion"

type FeedItem = {
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
}

type FeedsData = {
    size: number,
    data: FeedItem[],
    hasNext: boolean
}

type FeedType = 'draft' | 'unlisted' | 'normal'

type FeedsMap = {
    [key in FeedType]: FeedsData
}

export function FeedsPage() {
    const { t } = useTranslation()
    const query = new URLSearchParams(useSearch());
    const profile = useContext(ProfileContext);
    const prefersReducedMotion = useReducedMotion()
    const [listState, _setListState] = useState<FeedType>(query.get("type") as FeedType || 'normal')
    const [status, setStatus] = useState<'loading' | 'idle'>('idle')
    const [feeds, setFeeds] = useState<FeedsMap>({
        draft: { size: 0, data: [], hasNext: false },
        unlisted: { size: 0, data: [], hasNext: false },
        normal: { size: 0, data: [], hasNext: false }
    })
    const page = tryInt(1, query.get("page"))
    const limit = tryInt(10, query.get("limit"), process.env.PAGE_SIZE)
    const ref = useRef("")
    function fetchFeeds(type: FeedType) {
        client.feed.index.get({
            query: {
                page: page,
                limit: limit,
                type: type
            },
            headers: headersWithAuth()
        }).then(({ data }) => {
            if (data && typeof data !== 'string') {
                setFeeds({
                    ...feeds,
                    [type]: data
                })
                setStatus('idle')
            }
        })
    }
    useEffect(() => {
        const key = `${query.get("page")} ${query.get("type")}`
        if (ref.current == key) return
        const type = query.get("type") as FeedType || 'normal'
        if (type !== listState) {
            _setListState(type)
        }
        setStatus('loading')
        fetchFeeds(type)
        ref.current = key
    }, [query.get("page"), query.get("type")])
    // 渲染加载骨架屏
    const renderLoadingSkeleton = () => (
        <div className="wauto flex flex-col gap-4">
            {Array.from({ length: 3 }).map((_, index) => (
                <FeedCardSkeleton key={index} />
            ))}
        </div>
    )

    return (
        <>
            <Helmet>
                <title>{`${t('article.title')} - ${process.env.NAME}`}</title>
                <meta property="og:site_name" content={siteName} />
                <meta property="og:title" content={t('article.title')} />
                <meta property="og:image" content={process.env.AVATAR} />
                <meta property="og:type" content="article" />
                <meta property="og:url" content={document.URL} />
            </Helmet>
            <main className={`w-full flex flex-col justify-center items-center mb-16 ${!prefersReducedMotion ? 'animate-fade-in' : ''}`}>
                {/* 页面标题区域 */}
                <div className="wauto text-start py-8">
                    <h1 className={`text-5xl font-heading font-bold t-primary mb-3 ${!prefersReducedMotion ? 'animate-slide-up' : ''}`}>
                        {listState === 'draft' ? t('draft_bin') : listState === 'normal' ? t('article.title') : t('unlisted')}
                    </h1>
                    <div className={`flex flex-wrap justify-between items-center gap-4 mt-6 ${!prefersReducedMotion ? 'animate-slide-up' : ''}`}
                        style={{ animationDelay: !prefersReducedMotion ? '50ms' : '0ms' }}>
                        <p className="text-base t-muted font-medium">
                            {t('article.total$count', { count: feeds[listState]?.size })}
                        </p>
                        {profile?.permission &&
                            <div className="flex gap-3">
                                <Link href={listState === 'draft' ? '/?type=normal' : '/?type=draft'} 
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer
                                        ${listState === 'draft' 
                                            ? "bg-cyber-green/10 text-cyber-green shadow-glow-sm" 
                                            : "t-secondary hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-cyber-green"
                                        }`}>
                                    {t('draft_bin')}
                                </Link>
                                <Link href={listState === 'unlisted' ? '/?type=normal' : '/?type=unlisted'} 
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer
                                        ${listState === 'unlisted' 
                                            ? "bg-cyber-green/10 text-cyber-green shadow-glow-sm" 
                                            : "t-secondary hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-cyber-green"
                                        }`}>
                                    {t('unlisted')}
                                </Link>
                            </div>
                        }
                    </div>
                </div>
                
                {/* 文章列表区域 - 优化加载状态 (Requirement 10.3) */}
                {status === 'loading' ? (
                    renderLoadingSkeleton()
                ) : feeds[listState].data.length > 0 ? (
                    <>
                        {/* 文章卡片列表 - stagger入场动画 (Requirement 3.5) */}
                        <div className="wauto flex flex-col gap-4">
                            {feeds[listState].data.map((feed, index: number) => (
                                <FeedCard key={feed.id} id={feed.id} index={index} {...feed} />
                            ))}
                        </div>
                        
                        {/* 分页导航 */}
                        <div className="wauto flex items-center justify-between mt-8 gap-4">
                            {page > 1 ? (
                                <Link href={`/?type=${listState}&page=${(page - 1)}`}
                                    className="btn-primary flex items-center gap-2 group">
                                    <i className="ri-arrow-left-line transition-transform duration-200 group-hover:-translate-x-1"></i>
                                    {t('previous')}
                                </Link>
                            ) : <div />}
                            
                            {feeds[listState]?.hasNext && (
                                <Link href={`/?type=${listState}&page=${(page + 1)}`}
                                    className="btn-primary flex items-center gap-2 group">
                                    {t('next')}
                                    <i className="ri-arrow-right-line transition-transform duration-200 group-hover:translate-x-1"></i>
                                </Link>
                            )}
                        </div>
                    </>
                ) : (
                    /* 空状态 */
                    <div className="wauto glass-medium rounded-2xl p-12 text-center">
                        <i className="ri-article-line text-4xl t-muted mb-4 block"></i>
                        <p className="t-muted text-lg">{t('article.empty', '暂无文章')}</p>
                    </div>
                )}
            </main>
        </>
    )
}
