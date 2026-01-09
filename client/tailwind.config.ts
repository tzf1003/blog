/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: ['selector','[data-color-mode="dark"]'],
  theme: {
    extend: {
      colors: {
        // Legacy theme colors (保持向后兼容)
        'theme': '#00FF41',
        'theme-hover': '#00CC34',
        'theme-active': '#00AA2B',
        'dark': "#0F172A",
        
        // Cyber颜色系统 - 网络安全主题核心色
        'cyber': {
          'green': '#00FF41',      // Matrix Green - 主色调
          'green-dark': '#00CC34', // 深色变体
          'green-light': '#33FF66', // 浅色变体
          'dark': '#0D0D0D',       // Deep Black
          'light': '#E0E0E0',      // 浅色文字
        },
        
        // Glass颜色系统 - 玻璃态效果
        'glass': {
          'light': 'rgba(255, 255, 255, 0.1)',
          'medium': 'rgba(255, 255, 255, 0.2)',
          'strong': 'rgba(255, 255, 255, 0.3)',
          'border': 'rgba(255, 255, 255, 0.2)',
          // 暗色模式变体
          'dark-light': 'rgba(0, 0, 0, 0.1)',
          'dark-medium': 'rgba(0, 0, 0, 0.2)',
          'dark-strong': 'rgba(0, 0, 0, 0.3)',
          'dark-border': 'rgba(0, 0, 0, 0.2)',
        },
        
        // 背景颜色系统
        'background': {
          'primary': '#F8FAFC',     // 浅色模式主背景
          'secondary': '#F1F5F9',   // 浅色模式次背景
          'tertiary': '#E2E8F0',    // 浅色模式第三背景
          // 暗色模式
          'dark-primary': '#0D0D0D',   // 深色模式主背景
          'dark-secondary': '#1F1F1F', // Terminal Grey
          'dark-tertiary': '#2D2D2D',  // 深色模式第三背景
          // Legacy
          'light': '#F8FAFC',
          'dark': '#0D0D0D',
        },
        
        // 文字颜色系统 - 优化对比度 (WCAG AA)
        'text': {
          'primary': '#0F172A',     // 浅色模式主文字
          'secondary': '#475569',   // 浅色模式次文字
          'muted': '#64748B',       // 静音文字
          // 暗色模式 - 增强对比度
          'dark-primary': '#F8FAFC',   // 更亮的主文字
          'dark-secondary': '#CBD5E1', // 更亮的次文字
          'dark-muted': '#94A3B8',     // 更亮的静音文字
        },
      },
      fontFamily: {
        'heading': ['Space Grotesk', 'sans-serif'],
        'body': ['DM Sans', 'sans-serif'],
        'mono': ['JetBrains Mono', 'Fira Code', 'monospace'], // 终端/代码字体
      },
      fontSize: {
        // 排版比例系统 (基于1.25倍比例)
        'xs': ['0.75rem', { lineHeight: '1rem' }],        // 12px
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],    // 14px
        'base': ['1rem', { lineHeight: '1.5rem' }],       // 16px
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],    // 18px
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],     // 20px
        '2xl': ['1.5rem', { lineHeight: '2rem' }],        // 24px
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],   // 30px
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],     // 36px
        '5xl': ['3rem', { lineHeight: '1' }],             // 48px
        '6xl': ['3.75rem', { lineHeight: '1' }],          // 60px
      },
      fontWeight: {
        'light': '300',
        'normal': '400',
        'medium': '500',
        'semibold': '600',
        'bold': '700',
        'extrabold': '800',
      },
      lineHeight: {
        'tight': '1.1',
        'snug': '1.25',
        'normal': '1.5',
        'relaxed': '1.625',
        'loose': '2',
      },
      letterSpacing: {
        'tighter': '-0.05em',
        'tight': '-0.025em',
        'normal': '0',
        'wide': '0.025em',
        'wider': '0.05em',
        'widest': '0.1em',
      },
      // 间距系统 - 基于4px基础单位
      spacing: {
        '0': '0',
        '1': '4px',      // 4px
        '2': '8px',      // 8px
        '3': '12px',     // 12px
        '4': '16px',     // 16px
        '5': '20px',     // 20px
        '6': '24px',     // 24px
        '8': '32px',     // 32px
        '10': '40px',    // 40px
        '12': '48px',    // 48px
        '16': '64px',    // 64px
        '20': '80px',    // 80px
        '24': '96px',    // 96px
        '32': '128px',   // 128px
      },
      // 阴影令牌 - Glass效果阴影
      boxShadow: {
        'none': 'none',
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'DEFAULT': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        'inner': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
        // Glass阴影变体 - 浅色模式
        'glass-light': '0 4px 16px rgba(0, 0, 0, 0.1)',
        'glass-medium': '0 8px 32px rgba(0, 0, 0, 0.15)',
        'glass-strong': '0 12px 48px rgba(0, 0, 0, 0.2)',
        // Glass阴影变体 - 暗色模式（增强对比度）
        'glass-dark-light': '0 4px 16px rgba(0, 0, 0, 0.3), 0 0 1px rgba(255, 255, 255, 0.05)',
        'glass-dark-medium': '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 1px rgba(255, 255, 255, 0.08)',
        'glass-dark-strong': '0 12px 48px rgba(0, 0, 0, 0.5), 0 0 2px rgba(255, 255, 255, 0.1)',
        // Glow效果阴影
        'glow-sm': '0 0 10px rgba(0, 255, 65, 0.2)',
        'glow': '0 0 20px rgba(0, 255, 65, 0.3)',
        'glow-md': '0 0 30px rgba(0, 255, 65, 0.4)',
        'glow-lg': '0 0 40px rgba(0, 255, 65, 0.5)',
        'glow-intense': '0 0 60px rgba(0, 255, 65, 0.6)',
        // Cyber边框发光
        'cyber-border': '0 0 0 1px rgba(0, 255, 65, 0.3), 0 0 20px rgba(0, 255, 65, 0.2)',
        'cyber-border-hover': '0 0 0 1px rgba(0, 255, 65, 0.5), 0 0 30px rgba(0, 255, 65, 0.3)',
      },
      transitionProperty: {
        'height': 'height',
        'width': 'width',
        'spacing': 'margin, padding',
        'colors': 'color, background-color, border-color, text-decoration-color, fill, stroke',
        'opacity': 'opacity',
        'shadow': 'box-shadow',
        'transform': 'transform',
      },
      // 动画时长令牌
      transitionDuration: {
        '0': '0ms',
        '75': '75ms',
        '100': '100ms',
        '150': '150ms',     // fast
        '200': '200ms',
        '300': '300ms',     // normal
        '500': '500ms',     // slow
        '700': '700ms',     // slower
        '1000': '1000ms',
      },
      // 缓动函数变体
      transitionTimingFunction: {
        'DEFAULT': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'linear': 'linear',
        'in': 'cubic-bezier(0.4, 0, 1, 1)',
        'out': 'cubic-bezier(0, 0, 0.2, 1)',
        'in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'bounce': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'elastic': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'cyber': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      },
      backdropBlur: {
        'none': '0',
        'sm': '4px',
        'DEFAULT': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '24px',
        '2xl': '40px',
        '3xl': '64px',
        // Glass效果专用
        'glass': '12px',
        'glass-light': '8px',
        'glass-strong': '20px',
      },
      animation: {
        // 基础动画
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'fade-out': 'fadeOut 0.3s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-down': 'slideDown 0.4s ease-out',
        'slide-left': 'slideLeft 0.4s ease-out',
        'slide-right': 'slideRight 0.4s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'scale-out': 'scaleOut 0.3s ease-in',
        // Cyber特效动画
        'glow': 'glow 2s ease-in-out infinite',
        'glow-pulse': 'glowPulse 1.5s ease-in-out infinite',
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        // Glitch效果
        'glitch': 'glitch 0.5s ease-in-out infinite',
        'glitch-slow': 'glitch 1s ease-in-out infinite',
        // 扫描线效果
        'scan-line': 'scanLine 8s linear infinite',
        // 骨架屏加载
        'skeleton': 'skeleton 1.5s ease-in-out infinite',
        // 悬浮效果
        'float': 'float 3s ease-in-out infinite',
        // 打字机效果
        'typing': 'typing 3.5s steps(40, end)',
        // 边框流动
        'border-flow': 'borderFlow 2s linear infinite',
      },
      keyframes: {
        // 基础淡入淡出
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        // 滑动动画
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideLeft: {
          '0%': { transform: 'translateX(20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideRight: {
          '0%': { transform: 'translateX(-20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        // 缩放动画
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        scaleOut: {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '100%': { transform: 'scale(0.95)', opacity: '0' },
        },
        // Glow发光效果
        glow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(0, 255, 65, 0.3)' },
          '50%': { boxShadow: '0 0 30px rgba(0, 255, 65, 0.6)' },
        },
        glowPulse: {
          '0%, 100%': { 
            boxShadow: '0 0 5px rgba(0, 255, 65, 0.2), 0 0 20px rgba(0, 255, 65, 0.2)',
            borderColor: 'rgba(0, 255, 65, 0.3)',
          },
          '50%': { 
            boxShadow: '0 0 10px rgba(0, 255, 65, 0.4), 0 0 40px rgba(0, 255, 65, 0.3)',
            borderColor: 'rgba(0, 255, 65, 0.6)',
          },
        },
        // 脉冲动画
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        // Glitch故障效果
        glitch: {
          '0%': { 
            transform: 'translate(0)',
            textShadow: '-2px 0 #ff0000, 2px 0 #00ffff',
          },
          '20%': { 
            transform: 'translate(-2px, 2px)',
            textShadow: '2px 0 #ff0000, -2px 0 #00ffff',
          },
          '40%': { 
            transform: 'translate(-2px, -2px)',
            textShadow: '-2px 0 #ff0000, 2px 0 #00ffff',
          },
          '60%': { 
            transform: 'translate(2px, 2px)',
            textShadow: '2px 0 #ff0000, -2px 0 #00ffff',
          },
          '80%': { 
            transform: 'translate(2px, -2px)',
            textShadow: '-2px 0 #ff0000, 2px 0 #00ffff',
          },
          '100%': { 
            transform: 'translate(0)',
            textShadow: '-2px 0 #ff0000, 2px 0 #00ffff',
          },
        },
        // 扫描线效果
        scanLine: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        // 骨架屏加载
        skeleton: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        // 悬浮效果
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        // 打字机效果
        typing: {
          '0%': { width: '0' },
          '100%': { width: '100%' },
        },
        // 边框流动效果
        borderFlow: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}

