import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { FileUp, Loader2, Award, ArrowRight } from 'lucide-react';

const DemoSection: React.FC = () => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((prev) => (prev + 1) % 3);
    }, 3500); // Change step every 3.5 seconds
    return () => clearInterval(interval);
  }, []);

  const steps = [
    {
      id: 0,
      title: "Upload & Scan",
      icon: FileUp,
      color: "text-blue-500",
      description: "Faculty uploads scanned answer sheets. The system identifies student ID and questions."
    },
    {
      id: 1,
      title: "AI Processing",
      icon: Loader2,
      color: "text-teal-500",
      description: "Gemini analyzes handwriting context, comparing it against the model answer key."
    },
    {
      id: 2,
      title: "Instant Grading",
      icon: Award,
      color: "text-indigo-500",
      description: "Final grade is generated with annotated feedback. Ready for faculty review."
    }
  ];

  const stepsContainerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.2
      }
    }
  };

  const stepItemVariants: Variants = {
    hidden: { opacity: 0, x: -30 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  return (
    <section id="demo" className="py-24 bg-slate-50 dark:bg-slate-900 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-primary dark:text-blue-400 font-semibold text-sm uppercase tracking-wide mb-2">Live Workflow</h2>
          <h3 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">Watch It in Action</h3>
          <p className="mt-4 text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            The system handles the heavy lifting, moving from raw paper to final grade in seconds.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Left: Interactive Step Indicator */}
          <motion.div 
            className="space-y-8"
            variants={stepsContainerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            {steps.map((s, index) => (
              <motion.div 
                key={s.id}
                variants={stepItemVariants}
              >
                <motion.div
                  className={`flex items-start p-4 rounded-xl transition-colors duration-300 ${
                    step === index 
                      ? 'bg-white dark:bg-slate-800 shadow-lg border border-slate-100 dark:border-slate-700' 
                      : 'opacity-50'
                  }`}
                  animate={{ scale: step === index ? 1.02 : 1 }}
                >
                  <div className={`p-3 rounded-lg mr-4 ${step === index ? 'bg-slate-100 dark:bg-slate-700' : 'bg-transparent'}`}>
                    <s.icon className={`h-6 w-6 ${s.color}`} />
                  </div>
                  <div>
                    <h4 className={`text-lg font-bold ${step === index ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-500'}`}>
                      {s.title}
                    </h4>
                    <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
                      {s.description}
                    </p>
                  </div>
                  {step === index && (
                    <motion.div 
                      layoutId="active-indicator"
                      className="ml-auto self-center"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                    >
                      <ArrowRight className="h-5 w-5 text-primary dark:text-blue-400" />
                    </motion.div>
                  )}
                </motion.div>
              </motion.div>
            ))}
          </motion.div>

          {/* Right: The Loop Animation Window */}
          <div className="relative mx-auto w-full max-w-md aspect-square bg-white dark:bg-slate-950 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-center p-8 overflow-hidden">
            
            {/* Background Grid */}
            <div className="absolute inset-0 opacity-10" 
                 style={{ backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
            </div>

            <AnimatePresence mode="wait">
              {step === 0 && (
                <motion.div
                  key="step0"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20, scale: 0.9 }}
                  className="flex flex-col items-center"
                >
                  <motion.div 
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="mb-6 relative"
                  >
                    <FileUp className="h-24 w-24 text-blue-500" />
                    <motion.div 
                        className="absolute bottom-0 right-0 bg-green-500 rounded-full p-1"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.5 }}
                    >
                        <ArrowRight className="h-4 w-4 text-white -rotate-45" />
                    </motion.div>
                  </motion.div>
                  <div className="h-2 w-32 bg-slate-100 dark:bg-slate-800 rounded overflow-hidden">
                    <motion.div 
                        className="h-full bg-blue-500"
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 2.5 }}
                    />
                  </div>
                  <p className="mt-4 text-sm font-mono text-slate-500">Uploading Exam_01.pdf...</p>
                </motion.div>
              )}

              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.1 }}
                  className="flex flex-col items-center relative"
                >
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="relative z-10"
                  >
                    <Loader2 className="h-24 w-24 text-teal-500" />
                  </motion.div>
                   {/* Binary/Data Background Effect */}
                   <div className="absolute inset-0 flex items-center justify-center opacity-20">
                      <span className="text-4xl font-mono text-teal-500 animate-pulse">10101</span>
                   </div>
                  <p className="mt-6 text-sm font-mono text-teal-600 dark:text-teal-400">Analysing Syntax...</p>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, rotateX: 90 }}
                  animate={{ opacity: 1, rotateX: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ type: "spring", stiffness: 100 }}
                  className="flex flex-col items-center"
                >
                  <div className="relative">
                    <Award className="h-28 w-28 text-indigo-500" />
                    <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.3, type: "spring" }}
                        className="absolute -top-2 -right-4 bg-white dark:bg-slate-800 shadow-lg rounded-lg px-3 py-1 border border-indigo-100 dark:border-indigo-900"
                    >
                        <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">A+</span>
                    </motion.div>
                  </div>
                  <div className="mt-6 flex gap-2">
                     <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-xs rounded">Grades Saved</span>
                     <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs rounded">Notified</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>
    </section>
  );
};

export default DemoSection;