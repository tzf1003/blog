import { useContext, useState } from 'react';
import Popup from 'reactjs-popup';
import { ClientConfigContext, ConfigWrapper } from '../state/config';
import { Helmet } from "react-helmet";
import { siteName } from '../utils/constants';
import { useTranslation } from "react-i18next";
import { useLoginModal } from '../hooks/useLoginModal';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { useThemeMode, type ThemeMode } from '../utils/darkModeUtils';

/**
 * Footer组件 - 页脚
 * 
 * 实现功能：
 * - Glass morphism效果
 * - 主题切换动画（平滑过渡）
 * - Cyber-grid背景
 * - RSS链接悬浮效果
 * - 增强的主题系统（支持 light/dark/system）
 * 
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 9.1, 9.2, 9.3, 9.5
 */
function Footer() {
    const { t } = useTranslation();
    const [modeState, setMode] = useThemeMode();
    const config = useContext(ClientConfigContext);
    const footerHtml = config.get<string>('footer');
    const loginEnabled = config.get<boolean>('login.enabled');
    const [doubleClickTimes, setDoubleClickTimes] = useState(0);
    const { LoginModal, setIsOpened } = useLoginModal();
    const prefersReducedMotion = useReducedMotion();

    return (
        <footer className="mt-16 relative" role="contentinfo">
            
            <Helmet>
                <link rel="alternate" type="application/rss+xml" title={siteName} href="/sub/rss.xml" />
                <link rel="alternate" type="application/atom+xml" title={siteName} href="/sub/atom.xml" />
                <link rel="alternate" type="application/json" title={siteName} href="/sub/rss.json" />
            </Helmet>
            
            <div className={`relative flex flex-col mb-8 gap-4 justify-center items-center t-primary ${prefersReducedMotion ? '' : 'animate-fade-in'}`}>
                {footerHtml && (
                    <div dangerouslySetInnerHTML={{ __html: footerHtml }} className="text-center glass-light rounded-xl px-4 py-2" />
                )}
                
                <CopyrightSection 
                    doubleClickTimes={doubleClickTimes}
                    setDoubleClickTimes={setDoubleClickTimes}
                    loginEnabled={loginEnabled}
                    setIsOpened={setIsOpened}
                    config={config}
                    t={t}
                    prefersReducedMotion={prefersReducedMotion}
                />
                
                <ThemeToggle currentMode={modeState} onModeChange={setMode} prefersReducedMotion={prefersReducedMotion} />
            </div>
            
            <LoginModal />
        </footer>
    );
}

export default Footer;


interface CopyrightSectionProps {
    doubleClickTimes: number;
    setDoubleClickTimes: (n: number) => void;
    loginEnabled: boolean | undefined;
    setIsOpened: (open: boolean) => void;
    config: ConfigWrapper;
    t: (key: string) => string;
    prefersReducedMotion: boolean;
}

function CopyrightSection({
    doubleClickTimes,
    setDoubleClickTimes,
    loginEnabled,
    setIsOpened,
    config,
    t,
    prefersReducedMotion
}: CopyrightSectionProps) {
    return (
        <p className='text-sm t-muted font-normal'>
            <span 
                onDoubleClick={() => {
                    if (doubleClickTimes >= 2) {
                        setDoubleClickTimes(0);
                        if (!loginEnabled) setIsOpened(true);
                    } else {
                        setDoubleClickTimes(doubleClickTimes + 1);
                    }
                }}
                className="select-none"
            >
                © {new Date().getFullYear()} Powered by{' '}
                <a 
                    className={`hover:text-cyber-green transition-colors ${prefersReducedMotion ? 'duration-0' : 'duration-200'} hover:underline decoration-cyber-green/50`}
                    href="https://github.com/openRin/Rin" 
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Rin
                </a>
            </span>
            
            {config.get<boolean>('rss') && (
                <>
                    <Spliter />
                    <RSSPopup t={t} prefersReducedMotion={prefersReducedMotion} />
                </>
            )}
        </p>
    );
}

function RSSPopup({ t, prefersReducedMotion }: { t: (key: string) => string; prefersReducedMotion: boolean }) {
    return (
        <Popup 
            trigger={
                <button 
                    className={`hover:text-cyber-green transition-colors ${prefersReducedMotion ? 'duration-0' : 'duration-200'} cursor-pointer hover:underline decoration-cyber-green/50`}
                    type="button"
                    aria-label="RSS subscription options"
                >
                    RSS
                </button>
            }
            position="top center"
            arrow={false}
            closeOnDocumentClick
        >
            <div className={`glass-strong rounded-xl p-4 shadow-glow min-w-[200px] ${prefersReducedMotion ? '' : 'animate-fade-in'}`}>
                <p className='font-heading font-semibold t-primary mb-3 text-sm'>{t('footer.rss')}</p>
                <div className="flex gap-3 text-sm">
                    <RSSLink href="/sub/rss.xml" label="RSS" prefersReducedMotion={prefersReducedMotion} />
                    <Spliter />
                    <RSSLink href="/sub/atom.xml" label="Atom" prefersReducedMotion={prefersReducedMotion} />
                    <Spliter />
                    <RSSLink href="/sub/rss.json" label="JSON" prefersReducedMotion={prefersReducedMotion} />
                </div>
            </div>
        </Popup>
    );
}

function RSSLink({ href, label, prefersReducedMotion }: { href: string; label: string; prefersReducedMotion: boolean }) {
    return (
        <a 
            href={href} 
            className={`t-secondary hover:text-cyber-green transition-all ${prefersReducedMotion ? 'duration-0' : 'duration-200'} hover:shadow-glow-sm px-2 py-1 rounded-md hover:bg-cyber-green/10`}
        >
            {label}
        </a>
    );
}

function Spliter() {
    return <span className='px-1 t-muted' aria-hidden="true">|</span>;
}

interface ThemeToggleProps {
    currentMode: ThemeMode;
    onModeChange: (mode: ThemeMode) => void;
    prefersReducedMotion: boolean;
}

function ThemeToggle({ currentMode, onModeChange, prefersReducedMotion }: ThemeToggleProps) {
    return (
        <div className="glass-medium rounded-full p-1.5 shadow-glow-sm" role="radiogroup" aria-label="Theme selection">
            <div className="flex gap-1">
                <ThemeButton mode='light' current={currentMode} label="Light mode" icon="ri-sun-line" onClick={onModeChange} prefersReducedMotion={prefersReducedMotion} />
                <ThemeButton mode='system' current={currentMode} label="System mode" icon="ri-computer-line" onClick={onModeChange} prefersReducedMotion={prefersReducedMotion} />
                <ThemeButton mode='dark' current={currentMode} label="Dark mode" icon="ri-moon-line" onClick={onModeChange} prefersReducedMotion={prefersReducedMotion} />
            </div>
        </div>
    );
}

interface ThemeButtonProps {
    current: ThemeMode;
    mode: ThemeMode;
    label: string;
    icon: string;
    onClick: (mode: ThemeMode) => void;
    prefersReducedMotion: boolean;
}

function ThemeButton({ current, mode, label, icon, onClick, prefersReducedMotion }: ThemeButtonProps) {
    const isActive = current === mode;
    
    return (
        <button 
            aria-label={label} 
            aria-checked={isActive}
            role="radio"
            type="button" 
            onClick={() => onClick(mode)}
            className={`rounded-lg inline-flex h-10 w-10 items-center justify-center 
                transition-all ${prefersReducedMotion ? 'duration-0' : 'duration-300'} cursor-pointer
                ${isActive 
                    ? "bg-cyber-green text-slate-900 shadow-glow scale-105" 
                    : "t-primary hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-cyber-green hover:scale-105"
                }
                active:scale-95`}
        >
            <i className={icon} aria-hidden="true" />
        </button>
    );
}
