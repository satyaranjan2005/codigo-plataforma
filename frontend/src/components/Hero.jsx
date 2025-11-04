'use client';

import { useState, useEffect } from 'react';

function Hero() {
    const [messageIndex, setMessageIndex] = useState(0);
    const messages = ["14 days left", "something going to happen", "stay tuned"];
    // days left until Nov 15, 2025
    const [daysLeft, setDaysLeft] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setMessageIndex((prevIndex) => (prevIndex + 1) % messages.length);
        }, 120000); // 2 minutes in milliseconds

        return () => clearInterval(interval);
    }, [messages.length]);

    // compute days left (update every hour)
    useEffect(() => {
        const msInDay = 1000 * 60 * 60 * 24;
        const calculate = () => {
            const now = new Date();
            const target = new Date('2025-11-15T00:00:00');
            const diff = target - now;
            const days = diff > 0 ? Math.ceil(diff / msInDay) : 0;
            setDaysLeft(days);
        };

        calculate();
        const tid = setInterval(calculate, 60 * 60 * 1000); // update hourly
        return () => clearInterval(tid);
    }, []);

    return (
            <div className="flex flex-col lg:flex-row gap-6">

                {/* Left large panel with illustration and headline */}
                <div className="lg:flex-[3] bg-white rounded-2xl p-8 lg:p-10 flex flex-col justify-between min-h-[400px] relative overflow-hidden shadow-sm border border-gray-200">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 self-start px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full shadow-md">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"/>
                        </svg>
                        <span className="text-xs font-bold text-white">Next event: Nov 15, 2025</span>
                    </div>

                    {/* Headline */}
                    <div className="mt-8 mb-8 relative z-10">
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-tight">
                            Build. Learn. Ship.<br />
                            <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">Together.</span>
                        </h1>
                        <p className="mt-4 text-lg text-slate-600 max-w-xl">
                            Join Codigo, a student-led coding club where innovation meets collaboration. Work on real projects, attend workshops, and grow with a community of passionate developers.
                        </p>
                        <div className="mt-6 flex items-center gap-4">
                            <button className="px-6 py-3 bg-slate-900 text-white rounded-full font-semibold hover:bg-slate-800 transition shadow-lg">
                                Join the club
                            </button>
                            <a href="/event" className="px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-full font-semibold hover:border-slate-400 transition">
                                Latest event
                            </a>
                        </div>
                    </div>

                    {/* Illustration */}
                    <div className="absolute bottom-0 right-0 w-[280px] md:w-[360px] lg:w-[420px] opacity-90">
                        <img src="/hero.svg" alt="Coding illustration" className="w-full h-auto" />
                    </div>
                </div>

                {/* Right column with two stacked cards */}
                <div className="lg:flex-1 flex flex-col gap-6">
                    {/* Top card - Active Projects */}
                    <div className="flex-1 bg-white rounded-2xl rounded-br-none p-6 border-4 border-orange-500 relative overflow-hidden min-h-[180px] shadow-lg flex items-center justify-center">
                        <img src="/logo.svg" alt="Codigo Logo" className="w-40 h-40 object-contain" />
                    </div>

                    {/* Bottom card - days left until Nov 15 */}
                    <div className="flex-1 bg-black rounded-2xl rounded-tr-none p-6 text-white flex items-center justify-center min-h-[180px] shadow-lg">
                        <div className="text-center">
                            <div className="text-sm text-gray-300 mb-2">Days until</div>
                            <div className="text-4xl md:text-5xl font-extrabold text-orange-400 tabular-nums">{daysLeft}</div>
                            <div className="text-sm text-gray-400 mt-2">November 15, 2025</div>
                        </div>
                    </div>
                </div>
            </div>
    );
}

export default Hero;