import ReactLoading from "react-loading";

export function Button({ title, onClick, secondary = false }: { title: string, secondary?: boolean, onClick: () => void }) {
    return (
        <button 
            onClick={onClick} 
            className={`text-nowrap rounded-lg px-4 py-2 h-min font-medium transition-all duration-200 cursor-pointer
                ${secondary 
                    ? "glass hover:bg-slate-100 dark:hover:bg-slate-800 t-primary" 
                    : "bg-theme hover:bg-theme-hover active:bg-theme-active text-slate-900 shadow-glow hover:shadow-lg hover:shadow-theme/30"
                }`}
        >
            {title}
        </button>
    );
}

export function ButtonWithLoading({ title, onClick, loading, secondary = false }: { title: string, secondary?: boolean, loading: boolean, onClick: () => void }) {
    return (
        <button 
            onClick={onClick} 
            disabled={loading}
            className={`text-nowrap rounded-lg px-4 py-2 h-min font-medium flex items-center gap-2 transition-all duration-200 cursor-pointer
                ${secondary 
                    ? "glass hover:bg-slate-100 dark:hover:bg-slate-800 t-primary" 
                    : "bg-theme hover:bg-theme-hover active:bg-theme-active text-slate-900 shadow-glow hover:shadow-lg hover:shadow-theme/30"
                } ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
        >
            {loading && <ReactLoading width="1em" height="1em" type="spin" color={secondary ? "currentColor" : "#0F172A"} />}
            <span>{title}</span>
        </button>
    );
}