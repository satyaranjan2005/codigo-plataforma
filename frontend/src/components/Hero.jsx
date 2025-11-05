'use client';

import { useState, useEffect } from 'react';
import { motion, animate, useMotionValue, useTransform } from 'framer-motion';

function Hero() {
  const [messageIndex, setMessageIndex] = useState(0);
  const messages = ["Counting down to the event", "Something big is coming", "Stay tuned"];

  // Days left until 13 Nov 2025
  const [daysLeft, setDaysLeft] = useState(0);

  // Motion value for smooth number animation
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.max(0, Math.round(v)));

  // Rotate message every 2 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 120000);
    return () => clearInterval(interval);
  }, [messages.length]);

  // Calculate days left (updates hourly)
  useEffect(() => {
    const msInDay = 1000 * 60 * 60 * 24;
    const calculate = () => {
      const now = new Date();
      const target = new Date('2025-11-13T00:00:00'); // 13 Nov 2025
      const diff = target.getTime() - now.getTime();
      const days = diff > 0 ? Math.ceil(diff / msInDay) : 0;
      setDaysLeft(days);
    };
    calculate();
    const tid = setInterval(calculate, 60 * 60 * 1000);
    return () => clearInterval(tid);
  }, []);

  // Animate the number whenever daysLeft changes (slower now)
  useEffect(() => {
    const controls = animate(count, daysLeft, { duration: 2, ease: "easeOut" });
    return controls.stop;
  }, [daysLeft, count]);

  // Slower variants & stagger
  const page = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { when: "beforeChildren", staggerChildren: 0.25 } },
  };

  const slideUp = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { duration: 0.7, ease: "easeOut" } } };
  const slideLeft = { hidden: { x: -24, opacity: 0 }, visible: { x: 0, opacity: 1, transition: { duration: 0.7, ease: "easeOut" } } };
  const slideRight = { hidden: { x: 24, opacity: 0 }, visible: { x: 0, opacity: 1, transition: { duration: 0.7, ease: "easeOut" } } };

  return (
    <motion.div
      className="flex flex-col lg:flex-row gap-6"
      variants={page}
      initial="hidden"
      animate="visible"
    >
      {/* Left large panel */}
      <motion.div
        variants={slideLeft}
        className="lg:flex-[3] bg-white rounded-2xl p-8 lg:p-10 flex flex-col justify-between min-h-[400px] relative overflow-hidden shadow-sm border border-gray-200"
      >
        {/* Soft gradient blob background */}
        <motion.div
          aria-hidden
          className="absolute -top-16 -left-16 w-72 h-72 rounded-full bg-orange-100 blur-3xl opacity-60"
          animate={{ x: [0, 10, -8, 0], y: [0, -8, 6, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        />

        {/* Badge */}
        <motion.div
          className="inline-flex items-center gap-2 self-start px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full shadow-md"
          animate={{ scale: [1, 1.03, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"/>
          </svg>
          <span className="text-xs font-bold text-white">Next event: Nov 13, 2025</span>
        </motion.div>

        {/* Hero Text */}
        <div className="mt-8 mb-8 relative z-10">
          <motion.h1
            className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-tight"
            variants={slideUp}
          >
            Build. Learn. Ship.<br />
            <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">Together.</span>
          </motion.h1>
          <motion.p
            className="mt-4 text-lg text-slate-600 max-w-xl"
            variants={slideUp}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
          >
            Join Codigo, a student-led coding club where innovation meets collaboration. Work on real projects, attend workshops, and grow with a community of passionate developers.
          </motion.p>
          <motion.div
            className="mt-6 flex items-center gap-4"
            variants={slideUp}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.15 }}
          >
            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-3 bg-slate-900 text-white rounded-full font-semibold hover:bg-slate-800 transition shadow-lg"
            >
              Join the club
            </motion.button>
            <motion.a
              href="/event"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-full font-semibold hover:border-slate-400 transition"
            >
              Latest event
            </motion.a>
          </motion.div>
        </div>

        {/* Illustration (slower float) */}
        <motion.div
          className="absolute bottom-0 right-0 w-[280px] md:w-[360px] lg:w-[420px] opacity-90"
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        >
          <img src="/hero.svg" alt="Coding illustration" className="w-full h-auto" />
        </motion.div>
      </motion.div>

      {/* Right side column */}
      <motion.div className="lg:flex-1 flex flex-col gap-6" variants={slideRight}>
        {/* Logo Card */}
        <motion.div
          variants={slideUp}
          whileHover={{ scale: 1.02 }}
          className="flex-1 bg-white rounded-2xl rounded-br-none p-6 border-4 border-orange-500 relative overflow-hidden min-h-[180px] shadow-lg flex items-center justify-center"
        >
          <img src="/logo.svg" alt="Codigo Logo" className="w-40 h-40 object-contain" />
        </motion.div>

        {/* Countdown Card */}
        <motion.div
          variants={slideUp}
          className="flex-1 bg-black rounded-2xl rounded-tr-none p-6 text-white flex items-center justify-center min-h-[180px] shadow-lg"
        >
          <div className="text-center">
            <motion.div
              key={messageIndex}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: "easeOut" }}
              className="text-sm text-gray-300 mb-2"
            >
              {messages[messageIndex]}
            </motion.div>

            {/* Animated number (slower) */}
            <motion.div
              key={daysLeft}
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="text-4xl md:text-5xl font-extrabold text-orange-400 tabular-nums"
            >
              {rounded}
            </motion.div>

            <div className="text-sm text-gray-400 mt-2">November 13, 2025</div>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

export default Hero;
