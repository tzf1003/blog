import { useLocation } from "wouter"

export function HashTag({ name }: { name: string }) {
    const [_, setLocation] = useLocation()
    return (
        <button onClick={(e) => { e.preventDefault(); setLocation(`/hashtag/${name}`) }}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 t-secondary hover:bg-theme/10 hover:text-theme transition-all duration-200 cursor-pointer text-sm font-medium" >
            <i className="ri-hashtag text-xs"></i>
            <span>{name}</span>
        </button >
    )
}