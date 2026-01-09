import React from "react";

/**
 * Padding组件 - 页面内容容器
 * 
 * 提供响应式边距和主内容区域标识
 * Requirements: 8.2, 13.5
 */
export function Padding({ className = "mx-4", children }: { className?: string, children?: React.ReactNode }) {
    return (
        <main 
            id="main-content" 
            className={`${className} sm:mx-6 md:mx-8 lg:mx-12 xl:mx-16 2xl:mx-24 transition-all duration-300 outline-none`}
            role="main"
            tabIndex={-1}
        >
            {children}
        </main>
    );
}