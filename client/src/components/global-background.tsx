import { useEffect, useRef, useMemo } from 'react';
import { useReducedMotion } from '../hooks/useReducedMotion';

/**
 * GlobalBackground组件 - 全局背景效果
 * 
 * 实现功能：
 * - 网格背景图案
 * - 动态粒子效果（多类型粒子）
 * - 粒子连线网络
 * - 流动光线
 * - 脉冲光晕
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
    hue: number; // 色相偏移，用于颜色变化
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

    // 粒子配置 - 增强版
    const config = useMemo(() => ({
        particleCount: 80,
        particleMinSize: 1,
        particleMaxSize: 4,
        particleSpeed: 0.4,
        particleOpacity: 0.7,
        connectionDistance: 180,
        connectionOpacity: 0.2,
        flowLineCount: 5,
        flowLineSpeed: 2,
        pulseSpeed: 0.02,
    }), []);

    useEffect(() => {
        if (prefersReducedMotion) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

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
                vx: (Math.random() - 0.5) * config.particleSpeed * (type === 'spark' ? 2 : 1),
                vy: (Math.random() - 0.5) * config.particleSpeed * (type === 'spark' ? 2 : 1),
                size: type === 'glow' 
                    ? config.particleMaxSize + Math.random() * 2
                    : config.particleMinSize + Math.random() * (config.particleMaxSize - config.particleMinSize),
                opacity: type === 'spark' ? 0.9 : Math.random() * config.particleOpacity + 0.3,
                life: Math.random() * 100,
                maxLife: 300 + Math.random() * 400,
                type,
                hue: Math.random() * 30 - 15, // -15 到 15 的色相偏移
            };
        };

        // 初始化粒子
        const initParticles = () => {
            particlesRef.current = [];
            for (let i = 0; i < config.particleCount; i++) {
                particlesRef.current.push(createParticle(canvas.width, canvas.height));
            }
        };

        // 初始化流动光线
        const initFlowLines = () => {
            flowLinesRef.current = [];
            for (let i = 0; i < config.flowLineCount; i++) {
                flowLinesRef.current.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    length: 100 + Math.random() * 200,
                    speed: config.flowLineSpeed + Math.random() * 2,
                    opacity: 0.1 + Math.random() * 0.2,
                    angle: Math.random() * Math.PI * 2,
                });
            }
        };

        // 更新粒子
        const updateParticles = () => {
            particlesRef.current.forEach((p, index) => {
                p.x += p.vx;
                p.y += p.vy;
                p.life++;

                // 边界检测 - 平滑穿越
                if (p.x < -10) p.x = canvas.width + 10;
                if (p.x > canvas.width + 10) p.x = -10;
                if (p.y < -10) p.y = canvas.height + 10;
                if (p.y > canvas.height + 10) p.y = -10;

                // 生命周期结束，重新生成
                if (p.life > p.maxLife) {
                    particlesRef.current[index] = createParticle(canvas.width, canvas.height);
                }
            });
        };

        // 更新流动光线
        const updateFlowLines = () => {
            flowLinesRef.current.forEach(line => {
                line.x += Math.cos(line.angle) * line.speed;
                line.y += Math.sin(line.angle) * line.speed;

                // 边界检测
                if (line.x < -line.length || line.x > canvas.width + line.length ||
                    line.y < -line.length || line.y > canvas.height + line.length) {
                    // 从边缘重新进入
                    const side = Math.floor(Math.random() * 4);
                    switch (side) {
                        case 0: // 上
                            line.x = Math.random() * canvas.width;
                            line.y = -line.length;
                            line.angle = Math.PI / 4 + Math.random() * Math.PI / 2;
                            break;
                        case 1: // 右
                            line.x = canvas.width + line.length;
                            line.y = Math.random() * canvas.height;
                            line.angle = Math.PI * 0.75 + Math.random() * Math.PI / 2;
                            break;
                        case 2: // 下
                            line.x = Math.random() * canvas.width;
                            line.y = canvas.height + line.length;
                            line.angle = -Math.PI / 4 - Math.random() * Math.PI / 2;
                            break;
                        case 3: // 左
                            line.x = -line.length;
                            line.y = Math.random() * canvas.height;
                            line.angle = -Math.PI / 4 + Math.random() * Math.PI / 2;
                            break;
                    }
                }
            });
        };

        // 绘制流动光线
        const drawFlowLines = () => {
            flowLinesRef.current.forEach(line => {
                const gradient = ctx.createLinearGradient(
                    line.x, line.y,
                    line.x - Math.cos(line.angle) * line.length,
                    line.y - Math.sin(line.angle) * line.length
                );
                gradient.addColorStop(0, `rgba(0, 255, 65, ${line.opacity})`);
                gradient.addColorStop(0.5, `rgba(0, 255, 65, ${line.opacity * 0.5})`);
                gradient.addColorStop(1, 'rgba(0, 255, 65, 0)');

                ctx.beginPath();
                ctx.strokeStyle = gradient;
                ctx.lineWidth = 2;
                ctx.moveTo(line.x, line.y);
                ctx.lineTo(
                    line.x - Math.cos(line.angle) * line.length,
                    line.y - Math.sin(line.angle) * line.length
                );
                ctx.stroke();
            });
        };

        // 绘制粒子和连线
        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            timeRef.current += config.pulseSpeed;

            const particles = particlesRef.current;
            const pulse = Math.sin(timeRef.current) * 0.3 + 0.7; // 0.4 - 1.0 脉冲

            // 绘制流动光线
            drawFlowLines();

            // 绘制连线
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < config.connectionDistance) {
                        const opacity = (1 - distance / config.connectionDistance) * config.connectionOpacity * pulse;
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(0, 255, 65, ${opacity})`;
                        ctx.lineWidth = 0.5;
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

                const finalOpacity = p.opacity * fadeOpacity * pulse;
                const hue = 140 + p.hue; // 基础绿色 + 偏移

                if (p.type === 'glow') {
                    // 发光粒子 - 更大的光晕
                    const glowGradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 4);
                    glowGradient.addColorStop(0, `hsla(${hue}, 100%, 50%, ${finalOpacity})`);
                    glowGradient.addColorStop(0.5, `hsla(${hue}, 100%, 50%, ${finalOpacity * 0.3})`);
                    glowGradient.addColorStop(1, `hsla(${hue}, 100%, 50%, 0)`);
                    
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2);
                    ctx.fillStyle = glowGradient;
                    ctx.fill();
                } else if (p.type === 'spark') {
                    // 火花粒子 - 带尾迹
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.size * 0.8, 0, Math.PI * 2);
                    ctx.fillStyle = `hsla(${hue}, 100%, 70%, ${finalOpacity})`;
                    ctx.fill();

                    // 尾迹
                    const tailLength = 15;
                    const gradient = ctx.createLinearGradient(
                        p.x, p.y,
                        p.x - p.vx * tailLength, p.y - p.vy * tailLength
                    );
                    gradient.addColorStop(0, `hsla(${hue}, 100%, 70%, ${finalOpacity * 0.5})`);
                    gradient.addColorStop(1, `hsla(${hue}, 100%, 70%, 0)`);
                    
                    ctx.beginPath();
                    ctx.strokeStyle = gradient;
                    ctx.lineWidth = p.size * 0.5;
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(p.x - p.vx * tailLength, p.y - p.vy * tailLength);
                    ctx.stroke();
                } else {
                    // 普通粒子
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                    ctx.fillStyle = `hsla(${hue}, 100%, 50%, ${finalOpacity})`;
                    ctx.fill();

                    // 小光晕
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
                    ctx.fillStyle = `hsla(${hue}, 100%, 50%, ${finalOpacity * 0.2})`;
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
    }, [prefersReducedMotion, config]);

    return (
        <div className="fixed inset-0 pointer-events-none z-0" aria-hidden="true">
            {/* 网格背景 */}
            <div className="absolute inset-0 cyber-grid-global opacity-30 dark:opacity-50" />
            
            {/* 脉冲光晕 - CSS动画 */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyber-green/5 rounded-full blur-3xl animate-pulse-slow" />
                <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-cyber-green/5 rounded-full blur-3xl animate-pulse-slow animation-delay-1000" />
                <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-cyber-green/3 rounded-full blur-2xl animate-pulse-slow animation-delay-2000" />
            </div>
            
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
