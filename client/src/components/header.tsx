import { useContext, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import ReactModal from "react-modal";
import Popup from "reactjs-popup";
import { removeCookie } from "typescript-cookie";
import { Link, useLocation } from "wouter";
import { useLoginModal } from "../hooks/useLoginModal";
import { useHeaderScroll } from "../hooks/useHeaderScroll";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { Profile, ProfileContext } from "../state/profile";
import { Button } from "./button";
import { Input } from "./input";
import { ClientConfigContext } from "../state/config";

/**
 * Header组件 - 顶部导航栏
 * 
 * 实现功能：
 * - Glass morphism效果
 * - 滚动隐藏/显示逻辑
 * - 滚动时高度缩减和blur增强
 * - Logo发光效果
 * - 移动端hamburger菜单
 * 
 * 性能优化：
 * - 使用transform/opacity进行动画（GPU加速）
 * - 使用transform-gpu强制GPU合成
 * - 支持减少动画偏好
 * 
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 11.4, 12.2
 */
export function Header({ children }: { children?: React.ReactNode }) {
    const profile = useContext(ProfileContext);
    useTranslation(); // 确保i18n初始化
    const { isVisible, isScrolled } = useHeaderScroll({
        hideThreshold: 100,
        scrolledThreshold: 50,
        sensitivity: 10,
    });
    const prefersReducedMotion = useReducedMotion();

    // 动态类名计算
    const headerClasses = useMemo(() => {
        const baseClasses = [
            "fixed top-4 left-4 right-4 z-40",
            "transition-all",
            prefersReducedMotion ? "duration-0" : "duration-300",
            // GPU加速 (Requirement 12.2)
            "transform-gpu",
        ];

        // 可见性控制 - 使用transform实现GPU加速
        if (!isVisible) {
            baseClasses.push("opacity-0 -translate-y-full pointer-events-none");
        } else {
            baseClasses.push("opacity-100 translate-y-0");
        }

        return baseClasses.join(" ");
    }, [isVisible, prefersReducedMotion]);

    // Glass容器动态类名 - 使用基础glass类 + 动态样式实现平滑过渡
    const glassClasses = useMemo(() => {
        const classes = [
            "rounded-2xl",
            // 基础玻璃效果样式
            "backdrop-blur-glass bg-white/20 dark:bg-black/25",
            // 过渡动画 - 包含所有需要过渡的属性
            "transition-[backdrop-filter,background-color,border-color,box-shadow,opacity]",
            prefersReducedMotion ? "duration-0" : "duration-300",
            "ease-out",
        ];

        // 滚动时增强效果 - 使用细粒度类名控制
        if (isScrolled) {
            classes.push(
                "backdrop-blur-glass-strong bg-white/30 dark:bg-black/35",
                "border border-white/30 dark:border-white/20",
                "shadow-glow-md"
            );
        } else {
            classes.push(
                "border border-transparent",
                "shadow-deep"
            );
        }

        return classes.join(" ");
    }, [isScrolled, prefersReducedMotion]);

    // 内容区域动态padding
    const contentClasses = useMemo(() => {
        const classes = [
            "flex justify-between items-center px-4",
            "transition-all",
            prefersReducedMotion ? "duration-0" : "duration-300",
        ];

        // 滚动时缩减高度
        if (isScrolled) {
            classes.push("py-2");
        } else {
            classes.push("py-3");
        }

        return classes.join(" ");
    }, [isScrolled, prefersReducedMotion]);

    return useMemo(() => (
        <>
            <header className={headerClasses} role="banner">
                <div className="max-w-7xl mx-auto">
                    <div className={glassClasses}>
                        <div className={contentClasses}>
                            {/* Desktop Logo */}
                            <Logo isScrolled={isScrolled} className="hidden md:flex" />
                            
                            {/* Navigation Center */}
                            <div className="flex-1 md:flex-none md:absolute md:left-1/2 md:-translate-x-1/2 flex justify-center">
                                <div className="flex flex-row items-center gap-1">
                                    {/* Mobile Logo */}
                                    <Logo isScrolled={isScrolled} className="md:hidden" mobile />
                                    <NavBar menu={false} />
                                    {children}
                                    <Menu />
                                </div>
                            </div>
                            
                            {/* Desktop Actions */}
                            <div className="hidden md:flex flex-row items-center gap-2">
                                <SearchButton />
                                <LanguageSwitch />
                                <UserAvatar profile={profile} />
                            </div>
                        </div>
                    </div>
                </div>
            </header>
            {/* Spacer */}
            <div className="h-24" aria-hidden="true"></div>
        </>
    ), [profile, children, headerClasses, glassClasses, contentClasses, isScrolled]);
}


/**
 * Logo组件 - 带发光效果的Logo
 * Requirements: 5.3
 */
function Logo({ 
    isScrolled, 
    className = "", 
    mobile = false 
}: { 
    isScrolled: boolean; 
    className?: string; 
    mobile?: boolean;
}) {
    const { t } = useTranslation();
    const prefersReducedMotion = useReducedMotion();

    const logoSizeClasses = mobile 
        ? "w-9 h-9 rounded-lg" 
        : "w-11 h-11 rounded-xl";
    
    const textSizeClasses = mobile
        ? "text-sm"
        : "text-lg";

    return (
        <Link 
            aria-label={t('home')} 
            href="/"
            className={`${className} flex-row items-center group transition-all ${prefersReducedMotion ? 'duration-0' : 'duration-200'} hover:scale-105`}
        >
            <div className="relative">
                <img 
                    src={process.env.AVATAR} 
                    alt="Avatar" 
                    className={`${logoSizeClasses} border-2 border-slate-200 dark:border-slate-700 
                        transition-all ${prefersReducedMotion ? 'duration-0' : 'duration-300'}
                        group-hover:border-cyber-green group-hover:shadow-glow
                        ${isScrolled ? 'shadow-glow-sm' : ''}`}
                />
                {/* Glow overlay on hover */}
                <div 
                    className={`absolute inset-0 ${logoSizeClasses} opacity-0 group-hover:opacity-100 
                        transition-opacity ${prefersReducedMotion ? 'duration-0' : 'duration-300'}
                        bg-cyber-green/10 pointer-events-none`}
                    aria-hidden="true"
                />
            </div>
            <div className={`flex flex-col justify-center items-start ${mobile ? 'ml-2' : 'ml-3'}`}>
                <p className={`${textSizeClasses} font-heading font-semibold t-primary 
                    transition-colors ${prefersReducedMotion ? 'duration-0' : 'duration-200'} 
                    group-hover:text-cyber-green`}>
                    {process.env.NAME}
                </p>
                <p className="text-xs t-muted">
                    {process.env.DESCRIPTION}
                </p>
            </div>
        </Link>
    );
}

/**
 * NavItem组件 - 导航项
 */
function NavItem({ menu, title, selected, href, when = true, onClick }: {
    title: string,
    selected: boolean,
    href: string,
    menu?: boolean,
    when?: boolean,
    onClick?: () => void
}) {
    const prefersReducedMotion = useReducedMotion();
    
    return (
        <>
            {when &&
                <Link href={href}
                    className={`${menu ? "" : "hidden"} md:block cursor-pointer 
                        transition-all ${prefersReducedMotion ? 'duration-0' : 'duration-200'} 
                        px-3 py-2 rounded-lg text-sm font-medium
                        ${selected 
                            ? "text-cyber-green bg-cyber-green/10 shadow-glow-sm" 
                            : "t-primary hover:text-cyber-green hover:bg-slate-100 dark:hover:bg-slate-800"
                        }`}
                    state={{ animate: true }}
                    onClick={onClick}
                >
                    {title}
                </Link>}
        </>
    );
}

/**
 * Menu组件 - 移动端汉堡菜单
 * Requirements: 5.4
 */
function Menu() {
    const profile = useContext(ProfileContext);
    const [isOpen, setOpen] = useState(false);
    const prefersReducedMotion = useReducedMotion();

    function onClose() {
        document.body.style.overflow = "auto";
        setOpen(false);
    }

    return (
        <div className="md:hidden flex flex-row items-center">
            <Popup
                arrow={false}
                trigger={
                    <div>
                        <button 
                            onClick={() => setOpen(true)}
                            aria-label="Open menu"
                            aria-expanded={isOpen}
                            className={`w-10 h-10 rounded-lg flex items-center justify-center t-primary 
                                hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-cyber-green
                                transition-all ${prefersReducedMotion ? 'duration-0' : 'duration-200'} cursor-pointer
                                active:scale-95`}
                        >
                            <i className="ri-menu-line ri-lg" aria-hidden="true" />
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
                overlayStyle={{ 
                    background: "rgba(0,0,0,0.5)", 
                    backdropFilter: "blur(8px)",
                    WebkitBackdropFilter: "blur(8px)",
                }}
            >
                <nav 
                    className={`flex flex-col glass-strong rounded-2xl p-3 mt-4 w-[65vw] 
                        shadow-glow ${prefersReducedMotion ? '' : 'animate-slide-up'}`}
                    role="navigation"
                    aria-label="Mobile navigation"
                >
                    <div className="flex flex-row justify-end gap-2 mb-2">
                        <SearchButton onClose={onClose} />
                        <LanguageSwitch />
                        <UserAvatar profile={profile} />
                    </div>
                    <div className="border-t border-white/10 pt-2">
                        <NavBar menu={true} onClick={onClose} />
                    </div>
                </nav>
            </Popup>
        </div>
    );
}

/**
 * NavBar组件 - 导航栏
 */
function NavBar({ menu, onClick }: { menu: boolean, onClick?: () => void }) {
    const profile = useContext(ProfileContext);
    const [location] = useLocation();
    const { t } = useTranslation();
    
    return (
        <>
            <NavItem menu={menu} onClick={onClick} title={t('article.title')}
                selected={location === "/" || location.startsWith('/feed')} href="/" />
            <NavItem menu={menu} onClick={onClick} title={t('timeline')} 
                selected={location === "/timeline"} href="/timeline" />
            <NavItem menu={menu} onClick={onClick} title={t('moments.title')} 
                selected={location === "/moments"} href="/moments" />
            <NavItem menu={menu} onClick={onClick} title={t('hashtags')} 
                selected={location === "/hashtags"} href="/hashtags" />
            <NavItem menu={menu} onClick={onClick} when={profile?.permission == true} title={t('writing')}
                selected={location.startsWith("/writing")} href="/writing" />
            <NavItem menu={menu} onClick={onClick} title={t('friends.title')} 
                selected={location === "/friends"} href="/friends" />
            <NavItem menu={menu} onClick={onClick} title={t('about.title')} 
                selected={location === "/about"} href="/about" />
            <NavItem menu={menu} onClick={onClick} when={profile?.permission == true} title={t('settings.title')}
                selected={location === "/settings"} href="/settings" />
        </>
    );
}


/**
 * LanguageSwitch组件 - 语言切换
 */
function LanguageSwitch({ className }: { className?: string }) {
    const { i18n } = useTranslation();
    const prefersReducedMotion = useReducedMotion();
    const label = 'Languages';
    const languages = [
        { code: 'en', name: 'English' },
        { code: 'zh-CN', name: '简体中文' },
        { code: 'zh-TW', name: '繁體中文' },
        { code: 'ja', name: '日本語' }
    ];
    
    return (
        <div className={`${className || ''} flex items-center`}>
            <Popup 
                trigger={
                    <button 
                        title={label} 
                        aria-label={label}
                        className={`w-10 h-10 rounded-lg flex items-center justify-center t-primary 
                            hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-cyber-green
                            transition-all ${prefersReducedMotion ? 'duration-0' : 'duration-200'} cursor-pointer
                            active:scale-95`}
                    >
                        <i className="ri-translate-2" aria-hidden="true" />
                    </button>
                }
                position="bottom right"
                arrow={false}
                closeOnDocumentClick
                modal
                overlayStyle={{
                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)'
                }}
            >
                <div className={`glass-strong rounded-xl p-4 shadow-glow min-w-[200px] 
                    ${prefersReducedMotion ? '' : 'animate-fade-in'}`}>
                    <p className='font-heading font-semibold t-primary mb-3 text-base'>
                        Languages
                    </p>
                    <div className="space-y-1">
                        {languages.map(({ code, name }) => (
                            <button 
                                key={code} 
                                onClick={() => i18n.changeLanguage(code)}
                                className={`w-full text-left px-3 py-2 rounded-lg text-sm 
                                    transition-all ${prefersReducedMotion ? 'duration-0' : 'duration-200'} cursor-pointer
                                    ${i18n.language === code 
                                        ? 'bg-cyber-green/10 text-cyber-green font-medium shadow-glow-sm' 
                                        : 't-primary hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-cyber-green'
                                    }`}
                            >
                                {name}
                            </button>
                        ))}
                    </div>
                </div>
            </Popup>
        </div>
    );
}

/**
 * SearchButton组件 - 搜索按钮
 * Requirements: 5.6
 */
function SearchButton({ className, onClose }: { className?: string, onClose?: () => void }) {
    const { t } = useTranslation();
    const [isOpened, setIsOpened] = useState(false);
    const [, setLocation] = useLocation();
    const [value, setValue] = useState('');
    const prefersReducedMotion = useReducedMotion();
    const label = t('article.search.title');
    
    const onSearch = () => {
        const key = `${encodeURIComponent(value)}`;
        setTimeout(() => {
            setIsOpened(false);
            if (value.length !== 0) onClose?.();
        }, 100);
        if (value.length !== 0) setLocation(`/search/${key}`);
    };
    
    return (
        <div className={`${className || ''} flex items-center`}>
            <button 
                onClick={() => setIsOpened(true)} 
                title={label} 
                aria-label={label}
                className={`w-10 h-10 rounded-lg flex items-center justify-center t-primary 
                    hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-cyber-green
                    transition-all ${prefersReducedMotion ? 'duration-0' : 'duration-200'} cursor-pointer
                    active:scale-95`}
            >
                <i className="ri-search-line" aria-hidden="true" />
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
                        backgroundColor: "rgba(0, 0, 0, 0.5)",
                        backdropFilter: "blur(8px)",
                        WebkitBackdropFilter: "blur(8px)",
                        zIndex: 1000,
                    },
                }}
                onRequestClose={() => setIsOpened(false)}
            >
                <div className={`glass-strong w-full flex flex-row items-center justify-between 
                    p-4 gap-3 shadow-glow ${prefersReducedMotion ? '' : 'animate-slide-up'}`}>
                    <Input 
                        value={value} 
                        setValue={setValue} 
                        placeholder={t('article.search.placeholder')}
                        autofocus
                        onSubmit={onSearch} 
                    />
                    <Button 
                        title={value.length === 0 ? t("close") : label} 
                        onClick={onSearch} 
                    />
                </div>
            </ReactModal>
        </div>
    );
}

/**
 * UserAvatar组件 - 用户头像
 * Requirements: 5.8
 */
function UserAvatar({ className, profile, onClose }: { 
    className?: string, 
    profile?: Profile, 
    onClose?: () => void 
}) {
    const { t } = useTranslation();
    const { LoginModal, setIsOpened } = useLoginModal(onClose);
    const prefersReducedMotion = useReducedMotion();
    const label = t('github_login');
    const config = useContext(ClientConfigContext);

    return (
        <>
            {config.get<boolean>('login.enabled') && (
                <div className={`${className || ''} flex items-center`}>
                    {profile?.avatar ? (
                        <div className="relative group">
                            <img 
                                src={profile.avatar} 
                                alt="User avatar" 
                                className={`w-10 h-10 rounded-lg border-2 border-slate-200 dark:border-slate-700 
                                    transition-all ${prefersReducedMotion ? 'duration-0' : 'duration-300'}
                                    group-hover:border-cyber-green group-hover:shadow-glow cursor-pointer`}
                            />
                            <button
                                onClick={() => {
                                    removeCookie("token");
                                    window.location.reload();
                                }}
                                title={t('logout')}
                                aria-label={t('logout')}
                                className={`absolute inset-0 flex items-center justify-center 
                                    bg-slate-900/80 rounded-lg opacity-0 group-hover:opacity-100 
                                    transition-opacity ${prefersReducedMotion ? 'duration-0' : 'duration-200'} cursor-pointer`}
                            >
                                <i className="ri-logout-circle-line text-cyber-green text-lg" aria-hidden="true" />
                            </button>
                        </div>
                    ) : (
                        <button 
                            onClick={() => setIsOpened(true)} 
                            title={label} 
                            aria-label={label}
                            className={`w-10 h-10 rounded-lg flex items-center justify-center t-primary 
                                hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-cyber-green
                                transition-all ${prefersReducedMotion ? 'duration-0' : 'duration-200'} cursor-pointer
                                active:scale-95`}
                        >
                            <i className="ri-user-received-line" aria-hidden="true" />
                        </button>
                    )}
                    <LoginModal />
                </div>
            )}
        </>
    );
}
