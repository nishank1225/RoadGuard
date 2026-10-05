import { cn } from '@/lib/utils';
import { IconLayoutNavbarCollapse } from '@tabler/icons-react';
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from 'motion/react';
import React, { useRef, useState, useEffect } from 'react';

export interface FloatingDockItem {
  title: string;
  icon: React.ReactNode;
  href: string;
  onClick?: () => void;
  active?: boolean;
}

export interface FloatingDockProps {
  items: FloatingDockItem[];
  desktopClassName?: string;
  mobileClassName?: string;
}

export function FloatingDock({
  items,
  desktopClassName,
  mobileClassName,
}: FloatingDockProps) {
  return (
    <>
      <FloatingDockDesktop items={items} className={desktopClassName} />
      <FloatingDockMobile items={items} className={mobileClassName} />
    </>
  );
}

function FloatingDockMobile({
  items,
  className,
}: {
  items: FloatingDockItem[];
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener('click', handleOutsideClick);
    }
    return () => document.removeEventListener('click', handleOutsideClick);
  }, [open]);

  return (
    <div
      ref={containerRef}
      className={cn('fixed bottom-6 right-6 z-50 md:hidden', className)}
    >
      <AnimatePresence>
        {open && (
          <motion.div
            layoutId="nav"
            className="absolute bottom-full mb-3 right-0 flex flex-col gap-2 items-end min-w-[140px]"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.18 }}
          >
            {items.map((item, idx) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{
                  opacity: 0,
                  y: 8,
                  transition: { duration: 0.12, delay: idx * 0.02 },
                }}
                transition={{
                  duration: 0.2,
                  delay: (items.length - 1 - idx) * 0.03,
                }}
              >
                <a
                  href={item.href}
                  onClick={(e) => {
                    if (item.onClick) {
                      e.preventDefault();
                      item.onClick();
                    }
                    setOpen(false);
                  }}
                  className={cn(
                    'h-11 px-4 rounded-full flex items-center justify-between gap-3 shadow-[0_4px_16px_-2px_rgba(0,0,0,0.12)] border transition-all duration-150 active:scale-95',
                    item.active
                      ? 'bg-[#ffffff] dark:bg-[#1f1f29] border-[#41a1cf] text-[#41a1cf] font-semibold'
                      : 'bg-[#ffffff] dark:bg-[#1f1f29] border-[#dee2de] dark:border-[#282834] text-[#171717] dark:text-[#f3f4f6] font-medium'
                  )}
                  aria-label={item.title}
                  role="button"
                >
                  <span className="text-xs tracking-tight">{item.title}</span>
                  <div className="w-5 h-5 flex items-center justify-center shrink-0">
                    {item.icon}
                  </div>
                </a>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          'w-12 h-12 rounded-full bg-[#ffffff] dark:bg-[#1f1f29] border border-[#dee2de] dark:border-[#282834] shadow-[0_4px_20px_-2px_rgba(0,0,0,0.12),0_1px_3px_0_rgba(0,0,0,0.06)] flex items-center justify-center text-[#171717] dark:text-[#ffffff] transition-transform duration-200 active:scale-90 focus-visible:ring-2 focus-visible:ring-[#41a1cf] outline-none',
          open && 'rotate-180 border-[#41a1cf]/50'
        )}
        aria-label="Toggle navigation dock"
        aria-expanded={open}
      >
        <IconLayoutNavbarCollapse className="w-5 h-5 text-[#444141] dark:text-[#dee2de]" />
      </button>
    </div>
  );
}

function FloatingDockDesktop({
  items,
  className,
}: {
  items: FloatingDockItem[];
  className?: string;
}) {
  const mouseX = useMotionValue(Infinity);

  return (
    <motion.nav
      onMouseMove={(e) => mouseX.set(e.pageX)}
      onMouseLeave={() => mouseX.set(Infinity)}
      role="navigation"
      aria-label="Main application dock"
      className={cn(
        'fixed bottom-6 left-1/2 -translate-x-1/2 z-40 hidden md:flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-[#ffffff]/95 dark:bg-[#1f1f29]/95 backdrop-blur-md border border-[#dee2de] dark:border-[#282834] shadow-[0_4px_24px_-2px_rgba(0,0,0,0.08),0_1px_3px_0_rgba(0,0,0,0.04)]',
        className
      )}
    >
      {items.map((item) => (
        <IconContainer mouseX={mouseX} key={item.title} {...item} />
      ))}
    </motion.nav>
  );
}

function IconContainer({
  mouseX,
  title,
  icon,
  href,
  onClick,
  active,
}: FloatingDockItem & {
  mouseX: any;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);

  // Check prefers-reduced-motion
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const media = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(media.matches);
      const listener = () => setPrefersReducedMotion(media.matches);
      media.addEventListener('change', listener);
      return () => media.removeEventListener('change', listener);
    }
  }, []);

  const distance = useTransform(mouseX, (val: number) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  const widthTransform = useTransform(distance, [-150, 0, 150], [42, 62, 42]);
  const heightTransform = useTransform(distance, [-150, 0, 150], [42, 62, 42]);
  const widthTransformIcon = useTransform(distance, [-150, 0, 150], [20, 30, 20]);
  const heightTransformIcon = useTransform(distance, [-150, 0, 150], [20, 30, 20]);

  const springConfig = { mass: 0.1, stiffness: 160, damping: 12 };
  const width = useSpring(widthTransform, springConfig);
  const height = useSpring(heightTransform, springConfig);
  const widthIcon = useSpring(widthTransformIcon, springConfig);
  const heightIcon = useSpring(heightTransformIcon, springConfig);

  return (
    <a
      href={href}
      onClick={(e) => {
        if (onClick) {
          e.preventDefault();
          onClick();
        }
      }}
      aria-label={title}
      title={title}
      className="focus-visible:ring-2 focus-visible:ring-[#41a1cf] rounded-full outline-none"
    >
      <motion.div
        ref={ref}
        style={prefersReducedMotion ? { width: 42, height: 42 } : { width, height }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={cn(
          'relative rounded-full flex items-center justify-center transition-colors duration-150',
          active
            ? 'bg-[#f0f8fc] dark:bg-[#1c2d3a] text-[#41a1cf] border border-[#41a1cf]/40 shadow-sm'
            : 'text-[#444141] dark:text-[#a1a1aa] hover:text-[#171717] dark:hover:text-[#ffffff] hover:bg-[#f9faf7] dark:hover:bg-[#282834]'
        )}
      >
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0, y: 6, x: '-50%' }}
              animate={{ opacity: 1, y: 0, x: '-50%' }}
              exit={{ opacity: 0, y: 2, x: '-50%' }}
              transition={{ duration: 0.14 }}
              className="px-2.5 py-1 whitespace-pre rounded-md bg-[#1f1f29] dark:bg-[#ffffff] text-[#ffffff] dark:text-[#171717] text-[11px] font-medium tracking-tight absolute left-1/2 -top-8 w-fit shadow-md border border-[#282834] dark:border-[#dee2de] pointer-events-none z-50"
            >
              {title}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          style={prefersReducedMotion ? { width: 20, height: 20 } : { width: widthIcon, height: heightIcon }}
          className="flex items-center justify-center"
        >
          {icon}
        </motion.div>

        {active && (
          <span className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-[#41a1cf]" />
        )}
      </motion.div>
    </a>
  );
}
