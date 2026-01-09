import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useReducedMotion } from './useReducedMotion'

export interface TableOfContent {
    index: number
    text: string
    marginLeft: number
    element: HTMLElement
}

const useTableOfContents = (selector: string) => {
    const intersectingListRef = useRef<boolean[]>([]) // isIntersecting array
    const [tableOfContents, setTableOfContents] = useState<TableOfContent[]>([])
    const [activeIndex, setActiveIndex] = useState(0)
    const { t } = useTranslation()
    const prefersReducedMotion = useReducedMotion()
    const io = useRef<IntersectionObserver | null>(null);
    const [ref, setRef] = useState("-1")
    const lastRef = useRef("")

    useEffect(() => {
        if (lastRef.current === ref) return
        const content = document.querySelector(selector)
        if (!content) return
        const intersectingList = intersectingListRef.current
        const headers = content.querySelectorAll<HTMLElement>(
            'h1, h2, h3, h4, h5, h6'
        ) // all headers

        // set TableOfContents
        const tocData = Array.from(headers).map<TableOfContent>((header, i) => ({
            index: i,
            text: header.textContent || '',
            marginLeft: (Number(header.tagName.charAt(1)) - 1) * 10,
            element: header, // have to down little bit
        }))
        setTableOfContents(tocData)

        // create IntersectionObserver
        if (io.current) io.current.disconnect()
        io.current = new IntersectionObserver(
            (entries) => {
                // save isIntersecting info to array using data-id
                entries.forEach(({ target, isIntersecting }) => {
                    const idx = Number((target as HTMLElement).dataset.id || 0)
                    intersectingList[idx] = isIntersecting
                })
                // get activeIndex
                const currentIndex = intersectingList.findIndex((item) => item)
                let activeIndex = currentIndex - 1
                if (currentIndex === -1) {
                    activeIndex = intersectingList.length - 1
                } else if (currentIndex === 0) {
                    activeIndex = 0
                }
                setActiveIndex(activeIndex)
            },
            { rootMargin: "-20% 0px 10000px 0px", threshold: 0 }
        )
        intersectingList.length = 0 // reset array
        headers.forEach((header, i) => {
            if (header.getAttribute('data-id') !== null) return
            header.setAttribute('data-id', i.toString()) // set data-id
            intersectingList.push(false) // increase array length
            io.current!.observe(header) // register to observe
        })
        lastRef.current = ref
        return () => {
            if (io.current) io.current.disconnect()
        }
    }, [ref])

    const cleanup = (newId: string) => {
        if (lastRef.current === newId) return
        setRef(newId)
        if (io.current) io.current.disconnect()
    }

    return {
        TOC: () => (
            <div className={`glass-medium rounded-2xl py-4 px-4 t-primary shadow-light ${!prefersReducedMotion ? 'animate-fade-in' : ''}`}>
                <h2 className="text-lg font-heading font-bold mb-3 flex items-center gap-2">
                    <i className="ri-list-check text-cyber-green"></i>
                    {t("index.title")}
                </h2>
                <ul className="max-h-[calc(100vh-10.25rem)] overflow-auto space-y-1" style={{ scrollbarWidth: "none" }}>
                    {tableOfContents.length === 0 && (
                        <li className="t-muted text-sm py-2">{t("index.empty.title")}</li>
                    )}
                    {tableOfContents.map((item, idx) => (
                        <li
                            key={`toc${item.index}`}
                            className={`
                                cursor-pointer py-1.5 px-2 rounded-lg text-sm
                                transition-all duration-200
                                ${activeIndex === item.index 
                                    ? "text-cyber-green bg-cyber-green/10 font-medium shadow-glow-sm" 
                                    : "t-secondary hover:t-primary hover:bg-slate-100 dark:hover:bg-slate-800"
                                }
                            `}
                            style={{ 
                                marginLeft: item.marginLeft,
                                // 交错动画延迟
                                animationDelay: !prefersReducedMotion ? `${idx * 30}ms` : '0ms',
                            }}
                            onClick={() => {
                                item.element.scrollIntoView({
                                    behavior: prefersReducedMotion ? 'auto' : 'smooth'
                                });
                            }}
                        >
                            {item.text}
                        </li>
                    ))}
                </ul>
            </div>
        ), 
        cleanup
    }
}

export default useTableOfContents
