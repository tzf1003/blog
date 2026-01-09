import { useTranslation } from "react-i18next";
import { Markdown } from "./markdown";
import { timeago } from "../utils/timeago";

interface Moment {
    id: number;
    content: string;
    createdAt: Date;
    updatedAt: Date;
    user: {
        id: number;
        username: string;
        avatar: string;
    };
}

export function MomentItem({ 
    moment, 
    onDelete,
    onEdit,
    canManage
}: { 
    moment: Moment, 
    onDelete: (id: number) => void,
    onEdit: (moment: Moment) => void,
    canManage: boolean
}) {
    const { t } = useTranslation()
    const { createdAt, updatedAt } = moment;
    
    return (
        <div className="glass rounded-xl p-5 transition-all duration-300 hover:shadow-deep animate-fade-in">
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                    <img 
                        src={moment.user.avatar} 
                        alt={moment.user.username} 
                        className="w-10 h-10 rounded-lg object-cover border-2 border-slate-200 dark:border-slate-700"
                        loading="lazy"
                    />
                    <div>
                        <p className="t-primary font-medium">
                            {moment.user.username}
                        </p>
                        <p className="flex gap-2 t-muted text-sm"> 
                            <span title={new Date(createdAt).toLocaleString()}> 
                                {createdAt === updatedAt ? timeago(createdAt) : t('feed_card.published$time', { time: timeago(createdAt) })} 
                            </span> 
                            {createdAt !== updatedAt && 
                                <span title={new Date(updatedAt).toLocaleString()}> 
                                    {t('feed_card.updated$time', { time: timeago(updatedAt) })} 
                                </span> 
                            } 
                        </p>
                    </div>
                </div>
                {canManage && (
                    <div className="flex gap-2">
                        <button
                            aria-label={t("edit")}
                            onClick={() => onEdit(moment)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200 cursor-pointer"
                        >
                            <i className="ri-edit-2-line t-secondary" />
                        </button>
                        <button
                            aria-label={t("delete.title")}
                            onClick={() => onDelete(moment.id)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200 cursor-pointer"
                        >
                            <i className="ri-delete-bin-7-line text-red-500" />
                        </button>
                    </div>
                )}
            </div>
            <div className="t-primary prose prose-slate dark:prose-invert max-w-none">
                <Markdown content={moment.content} />
            </div>
        </div>
    )
}