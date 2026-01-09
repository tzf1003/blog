import { useContext, useEffect, useState } from 'react';
import Popup from 'reactjs-popup';
import { ClientConfigContext } from '../state/config';
import { Helmet } from "react-helmet";
import { siteName } from '../utils/constants';
import { useTranslation } from "react-i18next";
import { useLoginModal } from '../hooks/useLoginModal';

type ThemeMode = 'light' | 'dark' | 'system';
function Footer() {
    const { t } = useTranslation()
    const [modeState, setModeState] = useState<ThemeMode>('system');
    const config = useContext(ClientConfigContext);
    const footerHtml = config.get<string>('footer');
    const loginEnabled = config.get<boolean>('login.enabled');
    const [doubleClickTimes, setDoubleClickTimes] = useState(0);
    const { LoginModal, setIsOpened } = useLoginModal()
    useEffect(() => {
        const mode = localStorage.getItem('theme') as ThemeMode || 'system';
        setModeState(mode);
        setMode(mode);
    }, [])

    const setMode = (mode: ThemeMode) => {
        setModeState(mode);
        localStorage.setItem('theme', mode);


        if (mode !== 'system' || (!('theme' in localStorage) && window.matchMedia(`(prefers-color-scheme: ${mode})`).matches)) {
            document.documentElement.setAttribute('data-color-mode', mode);
        } else {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
            if (mediaQuery.matches) {
                document.documentElement.setAttribute('data-color-mode', 'dark');
            } else {
                document.documentElement.setAttribute('data-color-mode', 'light');
            }
        }
        window.dispatchEvent(new Event("colorSchemeChange"));
    };

    return (
        <footer className="mt-16">
            <Helmet>
                <link rel="alternate" type="application/rss+xml" title={siteName} href="/sub/rss.xml" />
                <link rel="alternate" type="application/atom+xml" title={siteName} href="/sub/atom.xml" />
                <link rel="alternate" type="application/json" title={siteName} href="/sub/rss.json" />
            </Helmet>
            <div className="flex flex-col mb-8 gap-4 justify-center items-center t-primary animate-fade-in">
                {footerHtml && <div dangerouslySetInnerHTML={{ __html: footerHtml }} className="text-center" />}
                <p className='text-sm t-muted font-normal link-line'>
                    <span onDoubleClick={() => {
                        if(doubleClickTimes >= 2){
                            setDoubleClickTimes(0)
                            if(!loginEnabled) {
                                setIsOpened(true)
                            }
                        } else {
                            setDoubleClickTimes(doubleClickTimes + 1)
                        }
                    }}>
                        © {new Date().getFullYear()} Powered by <a className='hover:underline hover:text-theme transition-colors duration-200' href="https://github.com/openRin/Rin" target="_blank">Rin</a>
                    </span>
                    {config.get<boolean>('rss') && <>
                        <Spliter />
                        <Popup trigger={
                            <button className="hover:underline hover:text-theme transition-colors duration-200 cursor-pointer" type="button">
                                RSS
                            </button>
                        }
                            position="top center"
                            arrow={false}
                            closeOnDocumentClick>
                            <div className="glass-strong rounded-xl p-4 shadow-deep min-w-[200px] animate-fade-in">
                                <p className='font-heading font-semibold t-primary mb-3 text-sm'>
                                    {t('footer.rss')}
                                </p>
                                <div className="flex gap-2 text-sm">
                                    <a href='/sub/rss.xml' className="hover:text-theme transition-colors duration-200">
                                        RSS
                                    </a> 
                                    <Spliter />
                                    <a href='/sub/atom.xml' className="hover:text-theme transition-colors duration-200">
                                        Atom
                                    </a> 
                                    <Spliter />
                                    <a href='/sub/rss.json' className="hover:text-theme transition-colors duration-200">
                                        JSON
                                    </a>
                                </div>
                            </div>
                        </Popup>
                    </>}
                </p>
                <div className="glass rounded-full p-1 shadow-light">
                    <div className="flex gap-1">
                        <ThemeButton mode='light' current={modeState} label="Toggle light mode" icon="ri-sun-line" onClick={setMode} />
                        <ThemeButton mode='system' current={modeState} label="Toggle system mode" icon="ri-computer-line" onClick={setMode} />
                        <ThemeButton mode='dark' current={modeState} label="Toggle dark mode" icon="ri-moon-line" onClick={setMode} />
                    </div>
                </div>
            </div>
            <LoginModal />
        </footer>
    );
}

function Spliter() {
    return (<span className='px-1'>
        |
    </span>
    )
}

function ThemeButton({ current, mode, label, icon, onClick }: { current: ThemeMode, label: string, mode: ThemeMode, icon: string, onClick: (mode: ThemeMode) => void }) {
    return (<button aria-label={label} type="button" onClick={() => onClick(mode)}
        className={`rounded-lg inline-flex h-9 w-9 items-center justify-center t-primary transition-all duration-200 cursor-pointer
            ${current === mode 
                ? "bg-theme text-slate-900 shadow-glow" 
                : "hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}>
        <i className={`${icon}`} />
    </button>)
}

export default Footer;