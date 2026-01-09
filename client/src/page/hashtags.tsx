import { useEffect, useRef, useState } from "react";
import { Helmet } from 'react-helmet';
import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import { Waiting } from "../components/loading";
import { client } from "../utils/api";
import { siteName } from "../utils/constants";
import { useReducedMotion } from "../hooks/useReducedMotion";

type Hashtag = {
    id: number;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    feeds: number;
}

export function HashtagsPage() {
    const { t } = useTranslation();
    const [hashtags, setHashtags] = useState<Hashtag[]>();
    const prefersReducedMotion = useReducedMotion();
    const ref = useRef(false);
    
    useEffect(() => {
        if (ref.current) return;
        client.tag.index.get().then(({ data }) => {
            if (data && typeof data !== 'string') {
                setHashtags(data);
            }
        });
        ref.current = true;
    }, []);

    const filteredHashtags = hashtags?.filter(({ feeds }) => feeds > 0) || [];

    return (
        <>
            <Helmet>
                <title>{`${t('hashtags')} - ${process.env.NAME}`}</title>
                <meta property="og:site_name" content={siteName} />
                <meta property="og:title" content={t('hashtags')} />
                <meta property="og:image" content={process.env.AVATAR} />
                <meta property="og:type" content="article" />
                <meta property="og:url" content={document.URL} />
            </Helmet>
            <Waiting for={hashtags}>
                <main className={`w-full flex flex-col justify-center items-center mb-8 t-primary ${!prefersReducedMotion ? 'animate-fade-in' : ''}`}>
                    {/* 页面标题 */}
                    <div className="wauto text-start py-8">
                        <h1 className={`text-5xl font-heading font-bold t-primary mb-3 ${!prefersReducedMotion ? 'animate-slide-up' : ''}`}>
                            <i className="ri-hashtag text-cyber-green mr-2"></i>
                            {t('hashtags')}
                        </h1>
                        <p className="t-muted text-sm">
                            {t('article.total_short$count', { count: filteredHashtags.length })}
                        </p>
                    </div>

                    {/* 标签列表 */}
                    <div className="wauto flex flex-col gap-2">
                        {filteredHashtags.map((hashtag, index) => (
                            <div 
                                key={hashtag.id}
                                className={!prefersReducedMotion ? 'animate-fade-in' : ''}
                                style={{ 
                                    animationDelay: !prefersReducedMotion ? `${index * 50}ms` : '0ms',
                                    animationFillMode: 'forwards',
                                }}
                            >
                                <Link 
                                    href={`/hashtag/${hashtag.name}`} 
                                    className={`
                                        group glass-medium w-full rounded-xl p-4
                                        flex flex-row items-center justify-between
                                        transition-all duration-300
                                        hover:shadow-glow-sm hover:border-cyber-green/20 hover:scale-[1.01]
                                    `}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className={`
                                            w-10 h-10 rounded-lg glass
                                            flex items-center justify-center
                                            text-cyber-green
                                            transition-all duration-300
                                            group-hover:shadow-glow-sm group-hover:bg-cyber-green/10
                                        `}>
                                            <i className="ri-hashtag text-lg"></i>
                                        </span>
                                        <span className="text-base font-medium t-primary group-hover:text-cyber-green transition-colors duration-200">
                                            {hashtag.name}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="px-3 py-1 rounded-full glass text-sm t-secondary">
                                            {t("article.total_short$count", { count: hashtag.feeds })}
                                        </span>
                                        <i className="ri-arrow-right-s-line t-muted group-hover:text-cyber-green group-hover:translate-x-1 transition-all duration-200"></i>
                                    </div>
                                </Link>
                            </div>
                        ))}
                    </div>

                    {/* 空状态 */}
                    {filteredHashtags.length === 0 && hashtags && (
                        <div className="wauto glass-medium rounded-2xl p-8 text-center">
                            <i className="ri-hashtag text-4xl text-cyber-green/50 mb-4"></i>
                            <p className="t-muted">{t('empty')}</p>
                        </div>
                    )}
                </main>
            </Waiting>
        </>
    );
}
