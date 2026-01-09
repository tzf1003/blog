import { useTranslation } from "react-i18next";

/**
 * SkipLink组件 - 跳过导航链接
 * 
 * 为键盘用户提供快速跳转到主内容的功能
 * 视觉上隐藏，但在获得焦点时显示
 * 
 * Requirements: 13.5
 */
export function SkipLink() {
    const { t } = useTranslation();
    
    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
            mainContent.focus();
            mainContent.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <a
            href="#main-content"
            className="skip-link"
            onClick={handleClick}
        >
            {t('accessibility.skip_to_content', 'Skip to main content')}
        </a>
    );
}
