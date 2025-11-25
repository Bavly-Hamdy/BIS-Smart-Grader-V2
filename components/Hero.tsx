import React from 'react';
import { motion, Variants } from 'framer-motion';
import { ChevronRight, FileText, CheckCircle2 } from 'lucide-react';
import Button from './Button';
import { useNavigate } from 'react-router-dom';

const Hero: React.FC = () => {
  const navigate = useNavigate();

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  return (
    <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
      {/* Background Decorative Blobs */}
      <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-96 h-96 bg-primary/10 dark:bg-primary/20 rounded-full blur-3xl opacity-70 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 translate-y-20 -translate-x-20 w-80 h-80 bg-secondary/10 dark:bg-secondary/20 rounded-full blur-3xl opacity-70"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Content */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="text-center lg:text-left"
          >
            <motion.div variants={itemVariants} className="inline-flex items-center px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 text-primary dark:text-blue-300 font-medium text-sm mb-6">
              <span className="flex h-2 w-2 rounded-full bg-secondary mr-2 animate-pulse"></span>
              v2.0 AI Engine Active
            </motion.div>
            
            <motion.h1 variants={itemVariants} className="text-4xl md:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-6 leading-tight">
              The AI That Grades <br />
              Like a <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary dark:from-blue-400 dark:to-teal-400">Professor</span>.
            </motion.h1>

            <motion.p variants={itemVariants} className="text-lg md:text-xl text-slate-600 dark:text-slate-300 mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Automate assessment with the BIS Smart Grader. We combine Gemini's reasoning with OCR to grade handwritten English exams with 99% accuracy.
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Button 
                variant="primary" 
                size="lg" 
                className="w-full sm:w-auto min-w-[160px] group shadow-blue-500/20"
                onClick={() => navigate('/login')}
              >
                Get Started
                <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button 
                variant="ghost" 
                size="lg" 
                className="w-full sm:w-auto min-w-[160px]"
                onClick={() => {
                  const el = document.getElementById('demo');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Live Demo
              </Button>
            </motion.div>
          </motion.div>

          {/* Right Visual: AI Scanner Animation */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative flex items-center justify-center lg:justify-end"
          >
            {/* Floating Wrapper that holds Card + Bubbles */}
            <motion.div 
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="relative"
            >
              {/* The Card (Overflow Hidden for scanner bar) */}
              <div className="relative w-72 h-96 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transform rotate-3 transition-transform duration-500 hover:rotate-0">
                {/* Paper Lines */}
                <div className="p-8 space-y-4 opacity-80">
                  <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-1/3 mb-6"></div>
                  <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded w-full"></div>
                  <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded w-full"></div>
                  <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded w-5/6"></div>
                  <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded w-full mt-6"></div>
                  <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded w-4/5"></div>
                  <div className="h-32 bg-slate-50 dark:bg-slate-800/50 rounded border border-dashed border-slate-200 dark:border-slate-700 mt-6 flex items-center justify-center">
                      <span className="text-xs text-slate-400">Handwritten Answer Area</span>
                  </div>
                </div>

                {/* Laser Scanner Bar */}
                <motion.div 
                  className="absolute left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_20px_rgba(34,211,238,0.6)] z-20"
                  animate={{ top: ['0%', '100%', '0%'] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                />
                
                {/* Scan Overlay Effect */}
                <motion.div 
                  className="absolute inset-0 bg-cyan-400/5 dark:bg-cyan-400/10 pointer-events-none"
                  animate={{ opacity: [0, 0.5, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                />
              </div>

              {/* Floating Data Bubbles - Outside the card wrapper to avoid clipping */}
              <motion.div 
                className="absolute top-12 -right-12 bg-white dark:bg-slate-800 p-3 rounded-lg shadow-xl border border-slate-100 dark:border-slate-700 flex items-center gap-3 text-xs font-bold text-emerald-600 dark:text-emerald-400 z-30"
                initial={{ opacity: 0, scale: 0.8, x: -10 }}
                animate={{ opacity: [0, 1, 1, 0], scale: [0.8, 1, 1, 0.8], x: [-10, 0, 0, -10] }}
                transition={{ duration: 4, repeat: Infinity, times: [0, 0.1, 0.8, 1], delay: 1 }}
              >
                <div className="bg-emerald-100 dark:bg-emerald-900/50 p-1.5 rounded-full">
                  <CheckCircle2 size={16} />
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider">Confidence</div>
                  <div>98.5% Match</div>
                </div>
              </motion.div>

              <motion.div 
                className="absolute bottom-20 -left-12 bg-white dark:bg-slate-800 p-3 rounded-lg shadow-xl border border-slate-100 dark:border-slate-700 flex items-center gap-3 text-xs font-bold text-primary dark:text-blue-400 z-30"
                initial={{ opacity: 0, scale: 0.8, x: 10 }}
                animate={{ opacity: [0, 1, 1, 0], scale: [0.8, 1, 1, 0.8], x: [10, 0, 0, 10] }}
                transition={{ duration: 4, repeat: Infinity, times: [0, 0.1, 0.8, 1], delay: 2.5 }}
              >
                <div className="bg-blue-100 dark:bg-blue-900/50 p-1.5 rounded-full">
                  <FileText size={16} />
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider">Analysis</div>
                  <div>Handwriting OCR</div>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;