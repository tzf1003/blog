import {Link} from "wouter";
import {useTranslation} from "react-i18next";
import {timeago} from "../utils/timeago";
import {HashTag} from "./hashtag";
import {useMemo} from "react";

export function FeedCard({ id, title, avatar, draft, listed, top, summary, hashtags, createdAt, updatedAt }:
    {
        id: string, avatar?: string,
        draft?: number, listed?: number, top?: number,
        title: string, summary: string,
        hashtags: { id: number, name: string }[],
        createdAt: Date, updatedAt: Date
    }) {
    const { t } = useTranslation()
    return useMemo(() => (
        <>
            <Link href={`/feed/${id}`} target="_blank" 
                className="block w-full glass rounded-2xl p-8 transition-all duration-300 hover:shadow-deep hover:scale-[1.01] cursor-pointer group animate-fade-in">
                {avatar &&
                    <div className="flex items-center mb-6 rounded-xl overflow-hidden">
                        <img src={avatar} alt=""
                            className="object-cover object-center w-full max-h-96 transition-transform duration-500 group-hover:scale-105" />
                    </div>}
                <h1 className="text-2xl font-heading font-semibold t-primary text-pretty overflow-hidden mb-3 group-hover:text-theme transition-colors duration-200">
                    {title}
                </h1>
                <div className="flex flex-wrap gap-3 mb-3">
                    <span className="t-muted text-sm flex items-center gap-1" title={new Date(createdAt).toLocaleString()}>
                        <i className="ri-calendar-line text-xs"></i>
                        {createdAt === updatedAt ? timeago(createdAt) : t('feed_card.published$time', { time: timeago(createdAt) })}
                    </span>
                    {createdAt !== updatedAt &&
                        <span className="t-muted text-sm flex items-center gap-1" title={new Date(updatedAt).toLocaleString()}>
                            <i className="ri-refresh-line text-xs"></i>
                            {t('feed_card.updated$time', { time: timeago(updatedAt) })}
                        </span>
                    }
                    {draft === 1 && <span className="text-amber-600 dark:text-amber-400 text-sm font-medium flex items-center gap-1">
                        <i className="ri-draft-line text-xs"></i>
                        {t("draft")}
                    </span>}
                    {listed === 0 && <span className="t-muted text-sm flex items-center gap-1">
                        <i className="ri-eye-off-line text-xs"></i>
                        {t("unlisted")}
                    </span>}
                    {top === 1 && <span className="text-theme text-sm font-medium flex items-center gap-1">
                        <i className="ri-pushpin-fill text-xs"></i>
                        {t('article.top.title')}
                    </span>}
                </div>
                <p className="text-pretty overflow-hidden t-secondary leading-relaxed mb-4">
                    {summary}
                </p>
                {hashtags.length > 0 &&
                    <div className="mt-4 flex flex-wrap gap-2">
                        {hashtags.map(({ name }, index) => (
                            <HashTag key={index} name={name} />
                        ))}
                    </div>
                }
            </Link>
        </>
    ), [id, title, avatar, draft, listed, top, summary, hashtags, createdAt, updatedAt])
}