import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

interface SplashScreen3DProps {
  onComplete: () => void;
  brandName?: string;
  tagline?: string;
}

export const SplashScreen3D: React.FC<SplashScreen3DProps> = ({
  onComplete,
  brandName = 'ShiTest',
  tagline = 'Practice Like Board. Perform Like Topper.',
}) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(onComplete, 250);
          return 100;
        }
        return prev + 4;
      });
    }, 70);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, scale: 1.04 }}
        transition={{ duration: 0.45, ease: 'easeInOut' }}
        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#070b14] text-white overflow-hidden px-4 select-none"
        style={{ perspective: 1400 }}
      >
        {/* Dynamic Multi-layered Ambient Light Falloff */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(249,115,22,0.16),transparent_65%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(59,130,246,0.08),transparent_50%)] pointer-events-none" />
        
        {/* Subtle Architectural Precision Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b18_1px,transparent_1px),linear-gradient(to_bottom,#1e293b18_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_50%,#000_60%,transparent_100%)] pointer-events-none" />

        {/* Floating 3D Geometric Emblem Centerpiece */}
        <div className="relative flex items-center justify-center mb-8" style={{ transformStyle: 'preserve-3d' }}>
          {/* Ambient Specular Halo */}
          <div className="absolute -inset-10 rounded-full bg-gradient-to-tr from-orange-600/30 via-amber-500/20 to-transparent blur-3xl animate-pulse pointer-events-none" />

          {/* Orbiting Subtle Glow Rings */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 24, repeat: Infinity, ease: 'linear' }}
            className="absolute -inset-8 rounded-full border border-orange-500/15 pointer-events-none"
            style={{ transformStyle: 'preserve-3d' }}
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 32, repeat: Infinity, ease: 'linear' }}
            className="absolute -inset-14 rounded-full border border-slate-700/30 border-dashed pointer-events-none"
            style={{ transformStyle: 'preserve-3d' }}
          />

          {/* 3D Rotating Monogram Cube */}
          <motion.div
            initial={{ rotateX: 55, rotateY: -45, scale: 0.6, z: -150, opacity: 0 }}
            animate={{
              rotateX: [55, 0, 10, 0],
              rotateY: [-45, 360, 370, 360],
              scale: [0.6, 1.05, 1],
              z: [-150, 30, 0],
              opacity: 1,
            }}
            transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-3xl bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 p-1 shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-slate-700/80 flex items-center justify-center"
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* Inner Metallic Bevel Core */}
            <div className="w-full h-full rounded-[22px] bg-gradient-to-b from-[#0f172a] via-[#090d16] to-[#020617] flex flex-col items-center justify-center relative overflow-hidden border border-orange-500/30 shadow-inner">
              {/* Gold Top-Right Corner Wedge */}
              <div className="absolute top-0 right-0 w-9 h-9 bg-gradient-to-bl from-orange-400 via-orange-500 to-amber-600 rounded-bl-2xl shadow-md" />
              
              {/* Glass Glare Sweep Line */}
              <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/12 to-transparent pointer-events-none" />

              <span className="font-mono font-black text-4xl sm:text-5xl tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-100 to-slate-400 drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)]">
                ST
              </span>

              <div className="flex items-center gap-1 mt-1 text-[10px] tracking-widest font-mono font-bold text-orange-400 uppercase">
                <Sparkles className="w-2.5 h-2.5 text-orange-400" />
                <span>UPMSP</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Brand Information & Typographic Composition */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.7 }}
          className="text-center max-w-sm sm:max-w-md z-10"
        >
          {/* Unboxed Metadata Header (Anti-AI Slop Compliant) */}
          <div className="flex items-center justify-center gap-2 text-xs text-slate-400 font-medium mb-3">
            <ShieldCheck className="w-3.5 h-3.5 text-orange-500" />
            <span>UP Board Examination Authority</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>Class 10 & 12</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-2">
            {brandName.slice(0, 3)}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-400 to-orange-500">
              {brandName.slice(3)}
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 font-medium mb-1 px-4 leading-relaxed">
            {tagline}
          </p>

          <p className="text-xs text-slate-400 font-mono mb-6">
            Developed by Shivam · High School & Intermediate
          </p>

          {/* Precision Loading Progress Track */}
          <div className="w-48 sm:w-64 mx-auto bg-slate-900 h-1.5 rounded-full overflow-hidden p-0.5 border border-slate-800 shadow-inner mb-6">
            <motion.div
              className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full"
              style={{ width: `${progress}%` }}
              transition={{ ease: 'easeOut' }}
            />
          </div>

          {/* Primary Action: Skip to portal */}
          <button
            onClick={onComplete}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-semibold text-xs sm:text-sm shadow-[0_4px_16px_rgba(234,88,12,0.35)] active:scale-95 transition-all"
          >
            <span>Enter Examination Portal</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

