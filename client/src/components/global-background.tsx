import { useEffect, useRef, useMemo, useState } from 'react';
import { useReducedMotion } from '../hooks/useReducedMotion';

/**
 * GlobalBackground组件 - 全局背景效果
 * 
 * 实现功能：
 * - 网格背景图案
 * - 动态粒子效果（多类型粒子）
 * - 粒子连线网络
 * - 流动光线
 * - 浅色/暗色模式自适应
 * - 支持减少动画偏好
 */

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    opacity: number;
    life: number;
    maxLife: number;
    type: 'normal' | 'glow' | 'spark';
}

interface FlowLine {
    x: number;
    y: number;
    length: number;
    speed: number;
    opacity: number;
    angle: number;
}

export function GlobalBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const particlesRef = useRef<Particle[]>([]);
    const flowLinesRef = useRef<FlowLine[]>([]);
    const animationRef = useRef<number>(0);
    const timeRef = useRef<number>(0);
    const prefersReducedMotion = useReducedMotion();
    // 初始值从 DOM 读取，避免首次渲染闪烁
    const [isDark, setIsDark] = useState(() => {
        if (typeof document !== 'undefined') {
            return document.documentElement.getAttribute('data-color-mode') === 'dark';
        }
        return false;
    });

    // 监听主题变化
    useEffect(() => {
        const checkTheme = () => {
            const colorMode = document.documentElement.getAttribute('data-color-mode');
            setIsDark(colorMode === 'dark');
        };
        
        checkTheme();
        
        const observer = new MutationObserver(checkTheme);
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-color-mode']
        });
        
        return () => observer.disconnect();
    }, []);

    // 根据主题获取颜色配置
    const colors = useMemo(() => ({
        // 暗色模式：亮绿色
        // 浅色模式：使用更深更饱和的颜色以保证可见性
        primary: isDark ? 'rgba(0, 255, 65,' : 'rgba(0, 140, 60,',
        secondary: isDark ? 'rgba(0, 200, 100,' : 'rgba(0, 120, 50,',
        particleOpacity: isDark ? 0.7 : 0.85,
        connectionOpacity: isDark ? 0.25 : 0.35,
        flowLineOpacity: isDark ? 0.3 : 0.45,
    }), [isDark]);

    // 粒子配置
    const config = useMemo(() => ({
        particleCount: 70,
        particleMinSize: 1,
        particleMaxSize: 3.5,
        particleSpeed: 0.5,
        connectionDistance: 160,
        flowLineCount: 6,
        flowLineSpeed: 1.5,
        pulseSpeed: 0.015,
    }), []);

    useEffect(() => {
        if (prefersReducedMotion) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // 创建流动光线（需要在 resizeCanvas 之前定义）
        const createFlowLine = (): FlowLine => {
            const side = Math.floor(Math.random() * 4);
            let x, y, angle;
            const length = 80 + Math.random() * 150;
            
            switch (side) {
                case 0: // 上
                    x = Math.random() * canvas.width;
                    y = -length;
                    angle = Math.PI / 4 + Math.random() * Math.PI / 2;
                    break;
                case 1: // 右
                    x = canvas.width + length;
                    y = Math.random() * canvas.height;
                    angle = Math.PI * 0.75 + Math.random() * Math.PI / 2;
                    break;
                case 2: // 下
                    x = Math.random() * canvas.width;
                    y = canvas.height + length;
                    angle = -Math.PI * 0.75 + Math.random() * Math.PI / 2;
                    break;
                default: // 左
                    x = -length;
                    y = Math.random() * canvas.height;
                    angle = -Math.PI / 4 + Math.random() * Math.PI / 2;
                    break;
            }
            
            return {
                x,
                y,
                length,
                speed: config.flowLineSpeed + Math.random() * 1.5,
                opacity: 0.15 + Math.random() * 0.2,
                angle,
            };
        };

        // 初始化流动光线（需要在 resizeCanvas 之前定义）
        const initFlowLines = () => {
            flowLinesRef.current = [];
            for (let i = 0; i < config.flowLineCount; i++) {
                flowLinesRef.current.push(createFlowLine());
            }
        };

        // 设置canvas尺寸
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            initFlowLines();
        };
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // 创建粒子
        const createParticle = (width: number, height: number): Particle => {
            const types: Particle['type'][] = ['normal', 'normal', 'normal', 'glow', 'spark'];
            const type = types[Math.floor(Math.random() * types.length)];
            
            return {
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * config.particleSpeed * (type === 'spark' ? 2.5 : 1),
                vy: (Math.random() - 0.5) * config.particleSpeed * (type === 'spark' ? 2.5 : 1),
                size: type === 'glow' 
                    ? config.particleMaxSize + Math.random() * 1.5
                    : config.particleMinSize + Math.random() * (config.particleMaxSize - config.particleMinSize),
                opacity: type === 'spark' ? 0.95 : Math.random() * 0.5 + 0.4,
                life: Math.random() * 100,
                maxLife: 350 + Math.random() * 350,
                type,
            };
        };

        // 初始化粒子
        const initParticles = () => {
            particlesRef.current = [];
            for (let i = 0; i < config.particleCount; i++) {
                particlesRef.current.push(createParticle(canvas.width, canvas.height));
            }
        };

        // 更新粒子
        const updateParticles = () => {
            particlesRef.current.forEach((p, index) => {
                p.x += p.vx;
                p.y += p.vy;
                p.life++;

                // 边界检测 - 平滑穿越
                if (p.x < -20) p.x = canvas.width + 20;
                if (p.x > canvas.width + 20) p.x = -20;
                if (p.y < -20) p.y = canvas.height + 20;
                if (p.y > canvas.height + 20) p.y = -20;

                // 生命周期结束，重新生成
                if (p.life > p.maxLife) {
                    particlesRef.current[index] = createParticle(canvas.width, canvas.height);
                }
            });
        };

        // 更新流动光线
        const updateFlowLines = () => {
            flowLinesRef.current.forEach((line, index) => {
                line.x += Math.cos(line.angle) * line.speed;
                line.y += Math.sin(line.angle) * line.speed;

                // 检测是否离开屏幕
                const margin = line.length * 2;
                if (line.x < -margin || line.x > canvas.width + margin ||
                    line.y < -margin || line.y > canvas.height + margin) {
                    flowLinesRef.current[index] = createFlowLine();
                }
            });
        };

        // 绘制
        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            timeRef.current += config.pulseSpeed;

            const particles = particlesRef.current;
            const pulse = Math.sin(timeRef.current) * 0.2 + 0.8;

            // 绘制流动光线
            flowLinesRef.current.forEach(line => {
                const gradient = ctx.createLinearGradient(
                    line.x, line.y,
                    line.x - Math.cos(line.angle) * line.length,
                    line.y - Math.sin(line.angle) * line.length
                );
                const lineOpacity = line.opacity * colors.flowLineOpacity * 3;
                gradient.addColorStop(0, `${colors.primary} ${lineOpacity})`);
                gradient.addColorStop(0.4, `${colors.primary} ${lineOpacity * 0.5})`);
                gradient.addColorStop(1, `${colors.primary} 0)`);

                ctx.beginPath();
                ctx.strokeStyle = gradient;
                ctx.lineWidth = 1.5;
                ctx.lineCap = 'round';
                ctx.moveTo(line.x, line.y);
                ctx.lineTo(
                    line.x - Math.cos(line.angle) * line.length,
                    line.y - Math.sin(line.angle) * line.length
                );
                ctx.stroke();
            });

            // 绘制连线
            const connOpacity = colors.connectionOpacity * pulse;
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < config.connectionDistance) {
                        const opacity = (1 - distance / config.connectionDistance) * connOpacity;
                        ctx.beginPath();
                        ctx.strokeStyle = `${colors.primary} ${opacity})`;
                        ctx.lineWidth = 0.6;
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }

            // 绘制粒子
            particles.forEach(p => {
                const lifeRatio = p.life / p.maxLife;
                const fadeOpacity = lifeRatio < 0.1 
                    ? lifeRatio * 10 
                    : lifeRatio > 0.9 
                        ? (1 - lifeRatio) * 10 
                        : 1;

                const finalOpacity = p.opacity * fadeOpacity * pulse * colors.particleOpacity;

                if (p.type === 'glow') {
                    // 发光粒子 - 带光晕
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.size * 2.5, 0, Math.PI * 2);
                    ctx.fillStyle = `${colors.primary} ${finalOpacity * 0.2})`;
                    ctx.fill();
                    
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                    ctx.fillStyle = `${colors.primary} ${finalOpacity})`;
                    ctx.fill();
                } else if (p.type === 'spark') {
                    // 火花粒子 - 带尾迹
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.size * 0.8, 0, Math.PI * 2);
                    ctx.fillStyle = `${colors.primary} ${finalOpacity})`;
                    ctx.fill();

                    // 尾迹
                    const tailLength = 12;
                    const gradient = ctx.createLinearGradient(
                        p.x, p.y,
                        p.x - p.vx * tailLength, p.y - p.vy * tailLength
                    );
                    gradient.addColorStop(0, `${colors.primary} ${finalOpacity * 0.6})`);
                    gradient.addColorStop(1, `${colors.primary} 0)`);
                    
                    ctx.beginPath();
                    ctx.strokeStyle = gradient;
                    ctx.lineWidth = p.size * 0.6;
                    ctx.lineCap = 'round';
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(p.x - p.vx * tailLength, p.y - p.vy * tailLength);
                    ctx.stroke();
                } else {
                    // 普通粒子
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                    ctx.fillStyle = `${colors.primary} ${finalOpacity})`;
                    ctx.fill();
                }
            });
        };

        // 动画循环
        const animate = () => {
            updateParticles();
            updateFlowLines();
            draw();
            animationRef.current = requestAnimationFrame(animate);
        };

        initParticles();
        initFlowLines();
        animate();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            cancelAnimationFrame(animationRef.current);
        };
    }, [prefersReducedMotion, config, colors]);

    return (
        <div className="fixed inset-0 pointer-events-none z-0" aria-hidden="true">
            {/* 渐变背景层 - 为 backdrop-blur 提供可模糊的内容 */}
            <div 
                className="absolute inset-0"
                style={{
                    background: isDark 
                        ? 'radial-gradient(ellipse at 20% 20%, rgba(0, 255, 65, 0.08) 0%, transparent 50%), radial-gradient(ellipse at 80% 80%, rgba(0, 200, 100, 0.06) 0%, transparent 50%), radial-gradient(ellipse at 50% 50%, rgba(0, 150, 80, 0.04) 0%, transparent 70%)'
                        : 'radial-gradient(ellipse at 20% 20%, rgba(0, 180, 80, 0.12) 0%, transparent 50%), radial-gradient(ellipse at 80% 80%, rgba(0, 150, 100, 0.08) 0%, transparent 50%), radial-gradient(ellipse at 50% 50%, rgba(200, 230, 210, 0.15) 0%, transparent 70%)'
                }}
            />
            
            {/* 网格背景 */}
            <div className="absolute inset-0 cyber-grid-global" />
            
            {/* 粒子Canvas */}
            {!prefersReducedMotion && (
                <canvas
                    ref={canvasRef}
                    className="absolute inset-0 w-full h-full"
                />
            )}
        </div>
    );
}
