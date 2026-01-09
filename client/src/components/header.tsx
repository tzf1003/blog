import { useContext, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import ReactModal from "react-modal";
import Popup from "reactjs-popup";
import { removeCookie } from "typescript-cookie";
import { Link, useLocation } from "wouter";
import { useLoginModal } from "../hooks/useLoginModal";
import { Profile, ProfileContext } from "../state/profile";
import { Button } from "./button";
import { IconSmall } from "./icon";
import { Input } from "./input";
import { Padding } from "./padding";
import { ClientConfigContext } from "../state/config";


export function Header({ children }: { children?: React.ReactNode }) {
    const profile = useContext(ProfileContext);
    const { t } = useTranslation()

    return useMemo(() => (
        <>
            <div className="fixed top-4 left-4 right-4 z-40 animate-fade-in">
                <div className="max-w-7xl mx-auto">
                    <div className="glass-strong rounded-2xl shadow-deep">
                        <div className="flex justify-between items-center px-4 py-3">
                            <Link aria-label={t('home')} href="/"
                                className="hidden md:flex flex-row items-center group transition-all duration-200 hover:scale-105">
                                <img src={process.env.AVATAR} alt="Avatar" 
                                    className="w-11 h-11 rounded-xl border-2 border-slate-200 dark:border-slate-700 transition-all duration-200 group-hover:border-theme" />
                                <div className="flex flex-col justify-center items-start ml-3">
                                    <p className="text-lg font-heading font-semibold t-primary">
                                        {process.env.NAME}
                                    </p>
                                    <p className="text-xs t-muted">
                                        {process.env.DESCRIPTION}
                                    </p>
                                </div>
                            </Link>
                            
                            <div className="flex-1 md:flex-none md:absolute md:left-1/2 md:-translate-x-1/2 flex justify-center">
                                <div className="flex flex-row items-center gap-1">
                                    <Link aria-label={t('home')} href="/"
                                        className="md:hidden flex flex-row items-center mr-auto group">
                                        <img src={process.env.AVATAR} alt="Avatar"
                                            className="w-9 h-9 rounded-lg border-2 border-slate-200 dark:border-slate-700 transition-all duration-200 group-hover:border-theme" />
                                        <div className="flex flex-col justify-center items-start ml-2">
                                            <p className="text-sm font-heading font-semibold t-primary">
                                                {process.env.NAME}
                                            </p>
                                            <p className="text-xs t-muted">
                                                {process.env.DESCRIPTION}
                                            </p>
                                        </div>
                                    </Link>
                                    <NavBar menu={false} />
                                    {children}
                                    <Menu />
                                </div>
                            </div>
                            
                            <div className="hidden md:flex flex-row items-center gap-2">
                                <SearchButton />
                                <LanguageSwitch />
                                <UserAvatar profile={profile} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="h-24"></div>
        </>
    ), [profile, children])
}

function NavItem({ menu, title, selected, href, when = true, onClick }: {
    title: string,
    selected: boolean,
    href: string,
    menu?: boolean,
    when?: boolean,
    onClick?: () => void
}) {
    return (
        <>
            {when &&
                <Link href={href}
                    className={`${menu ? "" : "hidden"} md:block cursor-pointer transition-all duration-200 px-3 py-2 rounded-lg text-sm font-medium
                        ${selected 
                            ? "text-theme bg-theme/10" 
                            : "t-primary hover:text-theme hover:bg-slate-100 dark:hover:bg-slate-800"
                        }`}
                    state={{ animate: true }}
                    onClick={onClick}
                >
                    {title}
                </Link>}
        </>
    )
}

function Menu() {
    const profile = useContext(ProfileContext);
    const [isOpen, setOpen] = useState(false)

    function onClose() {
        document.body.style.overflow = "auto"
        setOpen(false)
    }

    return (
        <div className="md:hidden flex flex-row items-center">
            <Popup
                arrow={false}
                trigger={<div>
                    <button onClick={() => setOpen(true)}
                        className="w-9 h-9 rounded-lg flex items-center justify-center t-primary hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200 cursor-pointer">
                        <i className="ri-menu-line ri-lg" />
                    </button>
                </div>
                }
                position="bottom right"
                open={isOpen}
                nested
                onOpen={() => document.body.style.overflow = "hidden"}
                onClose={onClose}
                closeOnDocumentClick
                closeOnEscape
                overlayStyle={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}
            >
                <div className="flex flex-col glass-strong rounded-2xl p-3 mt-4 w-[60vw] shadow-deep animate-slide-up">
                    <div className="flex flex-row justify-end gap-2 mb-2">
                        <SearchButton onClose={onClose} />
                        <LanguageSwitch />
                        <UserAvatar profile={profile} />
                    </div>
                    <div className="border-t border-slate-200 dark:border-slate-700 pt-2">
                        <NavBar menu={true} onClick={onClose} />
                    </div>
                </div>
            </Popup>
        </div>
    )
}

function NavBar({ menu, onClick }: { menu: boolean, onClick?: () => void }) {
    const profile = useContext(ProfileContext);
    const [location] = useLocation();
    const { t } = useTranslation()
    return (
        <>
            <NavItem menu={menu} onClick={onClick} title={t('article.title')}
                selected={location === "/" || location.startsWith('/feed')} href="/" />
            <NavItem menu={menu} onClick={onClick} title={t('timeline')} selected={location === "/timeline"} href="/timeline" />
            <NavItem menu={menu} onClick={onClick} title={t('moments.title')} selected={location === "/moments"} href="/moments" />
            <NavItem menu={menu} onClick={onClick} title={t('hashtags')} selected={location === "/hashtags"} href="/hashtags" />
            <NavItem menu={menu} onClick={onClick} when={profile?.permission == true} title={t('writing')}
                selected={location.startsWith("/writing")} href="/writing" />
            <NavItem menu={menu} onClick={onClick} title={t('friends.title')} selected={location === "/friends"} href="/friends" />
            <NavItem menu={menu} onClick={onClick} title={t('about.title')} selected={location === "/about"} href="/about" />
            <NavItem menu={menu} onClick={onClick} when={profile?.permission == true} title={t('settings.title')}
                selected={location === "/settings"}
                href="/settings" />
        </>
    )
}

function LanguageSwitch({ className }: { className?: string }) {
    const { i18n } = useTranslation()
    const label = 'Languages'
    const languages = [
        { code: 'en', name: 'English' },
        { code: 'zh-CN', name: '简体中文' },
        { code: 'zh-TW', name: '繁體中文' },
        { code: 'ja', name: '日本語' }
    ]
    return (
        <div className={className + " flex items-center"}>
            <Popup trigger={
                <button title={label} aria-label={label}
                    className="w-9 h-9 rounded-lg flex items-center justify-center t-primary hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200 cursor-pointer">
                    <i className="ri-translate-2"></i>
                </button>
            }
                position="bottom right"
                arrow={false}
                closeOnDocumentClick
            >
                <div className="glass-strong rounded-xl p-3 mt-2 shadow-deep min-w-[160px] animate-fade-in">
                    <p className='font-heading font-semibold t-primary mb-2 text-sm'>
                        Languages
                    </p>
                    <div className="space-y-1">
                        {languages.map(({ code, name }) => (
                            <button 
                                key={code} 
                                onClick={() => i18n.changeLanguage(code)}
                                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors duration-200 cursor-pointer
                                    ${i18n.language === code 
                                        ? 'bg-theme/10 text-theme font-medium' 
                                        : 't-primary hover:bg-slate-100 dark:hover:bg-slate-800'
                                    }`}
                            >
                                {name}
                            </button>
                        ))}
                    </div>
                </div>
            </Popup>
        </div>
    )
}

function SearchButton({ className, onClose }: { className?: string, onClose?: () => void }) {
    const { t } = useTranslation()
    const [isOpened, setIsOpened] = useState(false);
    const [_, setLocation] = useLocation()
    const [value, setValue] = useState('')
    const label = t('article.search.title')
    const onSearch = () => {
        const key = `${encodeURIComponent(value)}`
        setTimeout(() => {
            setIsOpened(false)
            if (value.length !== 0)
                onClose?.()
        }, 100)
        if (value.length !== 0)
            setLocation(`/search/${key}`)
    }
    return (<div className={className + " flex items-center"}>
        <button onClick={() => setIsOpened(true)} title={label} aria-label={label}
            className="w-9 h-9 rounded-lg flex items-center justify-center t-primary hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200 cursor-pointer">
            <i className="ri-search-line"></i>
        </button>
        <ReactModal
            isOpen={isOpened}
            style={{
                content: {
                    top: "20%",
                    left: "50%",
                    right: "auto",
                    bottom: "auto",
                    marginRight: "-50%",
                    transform: "translate(-50%, -50%)",
                    padding: "0",
                    border: "none",
                    borderRadius: "16px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    background: "none",
                    minWidth: "min(90vw, 500px)",
                },
                overlay: {
                    backgroundColor: "rgba(0, 0, 0, 0.4)",
                    backdropFilter: "blur(8px)",
                    zIndex: 1000,
                },
            }}
            onRequestClose={() => setIsOpened(false)}
        >
            <div className="glass-strong w-full flex flex-row items-center justify-between p-4 gap-3 shadow-deep animate-slide-up">
                <Input value={value} setValue={setValue} placeholder={t('article.search.placeholder')}
                    autofocus
                    onSubmit={onSearch} />
                <Button title={value.length === 0 ? t("close") : label} onClick={onSearch} />
            </div>
        </ReactModal>
    </div>
    )
}


function UserAvatar({ className, profile, onClose }: { className?: string, profile?: Profile, onClose?: () => void }) {
    const { t } = useTranslation()
    const { LoginModal, setIsOpened } = useLoginModal(onClose)
    const label = t('github_login')
    const config = useContext(ClientConfigContext);


    return (
        <> {config.get<boolean>('login.enabled') && <div className={className + " flex items-center"}>
            {profile?.avatar ? <>
                <div className="relative group">
                    <img src={profile.avatar} alt="Avatar" 
                        className="w-9 h-9 rounded-lg border-2 border-slate-200 dark:border-slate-700 transition-all duration-200 group-hover:border-theme cursor-pointer" />
                    <button
                        onClick={() => {
                            removeCookie("token")
                            window.location.reload()
                        }}
                        title={t('logout')}
                        aria-label={t('logout')}
                        className="absolute inset-0 flex items-center justify-center bg-slate-900/80 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer"
                    >
                        <i className="ri-logout-circle-line text-white text-lg" />
                    </button>
                </div>
            </> : <>
                <button onClick={() => setIsOpened(true)} title={label} aria-label={label}
                    className="w-9 h-9 rounded-lg flex items-center justify-center t-primary hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200 cursor-pointer">
                    <i className="ri-user-received-line"></i>
                </button>
            </>}
            <LoginModal />
        </div>
        }</>)
}