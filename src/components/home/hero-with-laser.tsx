"use client";

import React, { useRef } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import LaserFlow from '@/components/reactbit/LaserFlow';
import GlitchText from '@/components/reactbit/GlitchText';
import { Button } from '@/components/ui/button';

export default function HeroWithLaser() {
    const containerRef = useRef<HTMLDivElement>(null);
    const revealImgRef = useRef<HTMLImageElement>(null);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!containerRef.current || !revealImgRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const el = revealImgRef.current;
        el.style.setProperty('--mx', `${x}px`);
        el.style.setProperty('--my', `${y}px`);
    };

    const handleMouseLeave = () => {
        if (!revealImgRef.current) return;
        const el = revealImgRef.current;
        el.style.setProperty('--mx', '-9999px');
        el.style.setProperty('--my', '-9999px');
    };

    return (
        <section
            ref={containerRef}
            className="relative min-h-[600px] w-full overflow-hidden bg-slate-50 py-20 dark:bg-[#060010] lg:min-h-[800px] lg:py-32 group"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >
            {/* Laser Flow Background */}
            <div className="absolute inset-0 z-0 opacity-40 dark:opacity-100">
                <LaserFlow
                    horizontalBeamOffset={0.1}
                    verticalBeamOffset={0.0}
                    color="#FF79C6"
                    wispDensity={1.5}
                    fogIntensity={0.6}
                />
            </div>

            {/* Content Box with "Hero Border" Effect */}
            <div className="container relative z-20 mx-auto px-4 sm:px-6 lg:px-8">
                <div className="relative mx-auto max-w-5xl rounded-[2rem] border-2 border-slate-200 bg-white/70 p-8 backdrop-blur-xl transition-all duration-500 hover:border-[#FF79C6]/60 dark:border-[#FF79C6]/30 dark:bg-black/40 sm:p-12 lg:p-16">
                    {/* Inner Glow/Border Effect */}
                    <div className="absolute inset-px rounded-[1.9rem] bg-gradient-to-b from-slate-100 to-transparent pointer-events-none dark:from-white/5" />

                    <div className="relative z-10 text-center">
                        <GlitchText
                            speed={1}
                            enableShadows={true}
                            enableOnHover={true}
                            className="mx-auto max-w-[15ch] text-5xl font-extrabold tracking-tight text-slate-900 sm:max-w-[18ch] sm:text-7xl dark:text-white lg:max-w-[20ch] lg:text-8xl"
                        >
                            Discover Premium Products
                        </GlitchText>

                        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-600 dark:text-gray-400">
                            Experience our curated collection of premium products.
                            Quality craftsmanship meets modern design in every piece.
                        </p>

                        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                            <Button size="lg" asChild className="rounded-full bg-[#FF79C6] px-8 text-white hover:bg-[#FF79C6]/90 border-0 shadow-lg shadow-pink-500/20">
                                <Link href="/products">
                                    Shop Now
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                            <Button variant="outline" size="lg" asChild className="rounded-full border-slate-200 bg-white px-8 text-slate-900 hover:bg-slate-50 dark:border-[#FF79C6]/50 dark:bg-transparent dark:text-white dark:hover:bg-[#FF79C6]/10">
                                <Link href="/products?featured=true">
                                    View Featured
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Interactive Reveal Image (Optional Premium Touch) */}
            <Image
                ref={revealImgRef as any}
                src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=1920"
                alt="Premium Product Reveal"
                fill
                className="absolute inset-0 z-10 object-cover opacity-20 transition-all duration-700 filter group-hover:opacity-50 group-hover:brightness-[0.75] pointer-events-none dark:opacity-40 dark:group-hover:opacity-100"
                style={{
                    '--mx': '-9999px',
                    '--my': '-9999px',
                    WebkitMaskImage: 'radial-gradient(circle at var(--mx) var(--my), rgba(255,255,255,1) 0px, rgba(255,255,255,0.95) 80px, rgba(255,255,255,0.6) 160px, rgba(255,255,255,0.25) 240px, rgba(255,255,255,0) 320px)',
                    maskImage: 'radial-gradient(circle at var(--mx) var(--my), rgba(255,255,255,1) 0px, rgba(255,255,255,0.95) 80px, rgba(255,255,255,0.6) 160px, rgba(255,255,255,0.25) 240px, rgba(255,255,255,0) 320px)',
                    WebkitMaskRepeat: 'no-repeat',
                    maskRepeat: 'no-repeat'
                } as any}
            />

            {/* Floating Decorative Orbs */}
            <div className="absolute -left-20 top-1/4 h-96 w-96 rounded-full bg-pink-500/10 blur-[120px] animate-pulse dark:bg-[#FF79C6]/10" />
            <div className="absolute -right-20 bottom-1/4 h-96 w-96 rounded-full bg-blue-500/10 blur-[120px] animate-pulse delay-700 dark:bg-blue-500/10" />
        </section>
    );
}
