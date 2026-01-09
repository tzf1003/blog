import ReactLoading from "react-loading";

export function Waiting({ for: wait, children }: { for?: any, children?: React.ReactNode }) {
    return (
        <>
            {!wait ?
                <div className="w-full h-96 flex flex-col justify-center items-center mb-8 animate-fade-in">
                    <div className="glass-strong rounded-2xl p-8 shadow-deep">
                        <ReactLoading type="spin" color="#00FF41" width={48} height={48} />
                    </div>
                </div>
                : children}
        </>
    )
}