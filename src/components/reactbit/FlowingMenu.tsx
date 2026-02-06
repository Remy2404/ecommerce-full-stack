"use client";

import React, { useRef, useMemo, useEffect } from 'react';
import { gsap } from 'gsap';
import Link from 'next/link';

import './FlowingMenu.css';

interface MenuItemProps {
    link: string;
    text: string;
    image: string;
}

interface FlowingMenuProps {
    items?: MenuItemProps[];
}

const defaultItems = [
    { link: '/products?category=electronics', text: 'Electronics', image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800&q=80' },
    { link: '/products?category=accessories', text: 'Accessories', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80' },
    { link: '/products?category=clothing', text: 'Clothing', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80' },
    { link: '/products?category=home-living', text: 'Home & Living', image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&q=80' },
    { link: '/products?category=sports-fitness', text: 'Sports & Fitness', image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80' },
];

const FlowingMenu: React.FC<FlowingMenuProps> = ({ items = defaultItems }) => {
    return (
        <div className="flowing-menu-container bg-white dark:bg-black transition-colors duration-500">
            <nav className="flowing-menu">
                {items.map((item, idx) => (
                    <MenuItem key={idx} {...item} />
                ))}
            </nav>
        </div>
    );
};

const MenuItem: React.FC<MenuItemProps> = ({ link, text, image }) => {
    const itemRef = useRef<HTMLDivElement>(null);
    const marqueeRef = useRef<HTMLDivElement>(null);
    const marqueeInnerRef = useRef<HTMLDivElement>(null);
    const imagesRef = useRef<(HTMLDivElement | null)[]>([]);

    // GSAP high-performance quickTo setters for lagging effect
    const xTo = useRef<((value: number) => void) | null>(null);
    const yTo = useRef<((value: number) => void) | null>(null);

    useEffect(() => {
        // Simple hover animation for the whole marquee
        gsap.set(marqueeRef.current, { y: '101%' });
    }, []);

    const handleMouseEnter = (ev: React.MouseEvent) => {
        const tl = gsap.timeline();
        // Reveal marquee with vertical slide
        tl.to(marqueeRef.current, {
            y: '0%',
            duration: 0.6,
            ease: 'expo.out'
        });

        // Initialize quickTo for the smooth lagging effect
        imagesRef.current.forEach((img) => {
            if (img) {
                xTo.current = gsap.quickTo(img, "x", { duration: 0.8, ease: "expo.out" });
                yTo.current = gsap.quickTo(img, "y", { duration: 0.2, ease: "power2.out" });
            }
        });
    };

    const handleMouseMove = (ev: React.MouseEvent) => {
        if (!itemRef.current) return;
        const rect = itemRef.current.getBoundingClientRect();

        // Calculate relative position within the menu item
        const x = ev.clientX - rect.left;
        const y = ev.clientY - rect.top;

        // Apply lagging effect to images
        if (xTo.current && yTo.current) {
            // Offset the image so it centers on cursor
            // We use a percentage of the width to make it dynamic
            xTo.current(x - 100);
            yTo.current(y - 50);
        }
    };

    const handleMouseLeave = () => {
        gsap.to(marqueeRef.current, {
            y: '101%',
            duration: 0.6,
            ease: 'expo.in'
        });
    };

    const repeatedMarqueeContent = useMemo(() => {
        return Array.from({ length: 8 }).map((_, idx) => (
            <React.Fragment key={idx}>
                <span className="marquee__text">{text}</span>
                <div
                    className="marquee__img-container"
                    ref={(el) => { imagesRef.current[idx] = el; }}
                >
                    <div
                        className="marquee__img"
                        style={{ backgroundImage: `url(${image})` }}
                    />
                </div>
            </React.Fragment>
        ));
    }, [text, image]);

    return (
        <div className="flowing-menu__item border-b border-gray-200 dark:border-gray-800" ref={itemRef}>
            <Link
                href={link}
                className="flowing-menu__item-link"
                onMouseEnter={handleMouseEnter}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
            >
                {text}
            </Link>
            <div className="marquee-wrapper pointer-events-none" ref={marqueeRef}>
                <div className="marquee__inner-wrap" ref={marqueeInnerRef}>
                    <div className="marquee__inner" aria-hidden="true">
                        {repeatedMarqueeContent}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FlowingMenu;
