import {useEffect, useState} from "react";
import {client} from "../main";
import {timeago} from "../utils/timeago.ts";
import {Link} from "wouter";
import {useTranslation} from "react-i18next";

export type AdjacentFeed = {
    id: number;
    title: string | null;
    summary: string;
    hashtags: {
        id: number;
        name: string;
    }[];
    createdAt: Date;
    updatedAt: Date;
};
export type AdjacentFeeds = {
    nextFeed: AdjacentFeed | null;
    previousFeed: AdjacentFeed | null;
};

export function AdjacentSection({id, setError}: { id: string, setError: (error: string) => void }) {
    const [adjacentFeeds, setAdjacentFeeds] = useState<AdjacentFeeds>();

    useEffect(() => {
        client.feed
            .adjacent({id})
            .get()
            .then(({data, error}) => {
                if (error) {
                    setError(error.value as string);
                } else if (data && typeof data !== "string") {
                    setAdjacentFeeds(data);
                }
            });
    }, [id, setError]);
    return (
        <div className="glass rounded-2xl m-4 grid grid-cols-1 sm:grid-cols-2 overflow-hidden shadow-light animate-fade-in">
            <AdjacentCard data={adjacentFeeds?.previousFeed} type="previous"/>
            <AdjacentCard data={adjacentFeeds?.nextFeed} type="next"/>
        </div>
    )
}

export function AdjacentCard({data, type}: { data: AdjacentFeed | null | undefined, type: "previous" | "next" }) {
    const direction = type === "previous" ? "text-start" : "text-end"
    const {t} = useTranslation()
    if (!data) {
        return (<div className="w-full p-8 transition-colors duration-200">
            <p className={`t-muted w-full text-sm font-medium mb-2 ${direction}`}>
                {type === "previous" ? "← Previous" : "Next →"}
            </p>
            <h1 className={`text-lg t-secondary text-pretty truncate ${direction}`}>
                {t('no_more')}
            </h1>
        </div>);
    }
    return (
        <Link href={`/feed/${data.id}`} target="_blank"
              className={`block w-full p-8 transition-all duration-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer group
                  ${type === "previous" ? "sm:border-r border-slate-200 dark:border-slate-700" : ""}`}>
            <p className={`t-muted w-full text-sm font-medium mb-3 group-hover:text-theme transition-colors duration-200 ${direction}`}>
                {type === "previous" ? "← Previous" : "Next →"}
            </p>
            <h1 className={`text-xl font-heading font-semibold t-primary text-pretty truncate group-hover:text-theme transition-colors duration-200 mb-2 ${direction}`}>
                {data.title}
            </h1>
            <div className={`flex gap-2 mt-2 ${type === "next" ? "justify-end" : ""}`}>
                <span className="t-muted text-sm" title={new Date(data.createdAt).toLocaleString()}>
                    {data.createdAt === data.updatedAt ? timeago(data.createdAt) : t('feed_card.published$time', {time: timeago(data.createdAt)})}
                </span>
                {data.createdAt !== data.updatedAt &&
                    <span className="t-muted text-sm" title={new Date(data.updatedAt).toLocaleString()}>
                        {t('feed_card.updated$time', {time: timeago(data.updatedAt)})}
                    </span>
                }
            </div>
        </Link>
    )
}