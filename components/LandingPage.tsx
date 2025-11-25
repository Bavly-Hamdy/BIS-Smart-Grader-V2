import React from 'react';
import { motion } from 'framer-motion';
import { 
  ScanLine, 
  BarChart3, 
  ShieldCheck, 
} from 'lucide-react';
import Navbar from './Navbar';
import Button from './Button';
import Hero from './Hero';
import DemoSection from './DemoSection';
import NewsCard from './NewsCard';
import ScrollToTop from './ScrollToTop';
import { useNavigate } from 'react-router-dom';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-100px" },
    transition: { duration: 0.7 }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300 overflow-hidden selection:bg-primary/20 selection:text-primary">
      <Navbar />
      
      {/* Scroll To Top Button */}
      <ScrollToTop />

      {/* --- HERO SECTION (NEW) --- */}
      <Hero />

      {/* --- FEATURES SECTION --- */}
      <section id="features" className="py-24 bg-white dark:bg-slate-900/50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            {...fadeInUp}
            className="text-center mb-16"
          >
            <h2 className="text-primary dark:text-blue-400 font-semibold text-sm uppercase tracking-wide mb-2">Why Choose Smart Grader?</h2>
            <h3 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">Advanced features for modern faculty</h3>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <motion.div 
              {...fadeInUp}
              transition={{ delay: 0.1 }}
              className="group p-8 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:shadow-xl dark:hover:shadow-cyan-900/10 hover:border-blue-200 dark:hover:border-cyan-500/30 transition-all duration-300 hover:-translate-y-1 h-full"
            >
              <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <ScanLine className="h-7 w-7 text-primary dark:text-blue-400" />
              </div>
              <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-3">AI-Powered OCR</h4>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
                Reads complex student handwriting instantly using Google Gemini's multimodal capabilities, converting physical papers to digital data.
              </p>
            </motion.div>

            {/* Feature 2 */}
            <motion.div 
              {...fadeInUp}
              transition={{ delay: 0.2 }}
              className="group p-8 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:shadow-xl dark:hover:shadow-teal-900/10 hover:border-teal-200 dark:hover:border-teal-500/30 transition-all duration-300 hover:-translate-y-1 h-full"
            >
              <div className="w-14 h-14 bg-teal-100 dark:bg-teal-900/30 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <BarChart3 className="h-7 w-7 text-secondary dark:text-teal-400" />
              </div>
              <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Smart Analytics</h4>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
                Visualize class performance with automatic grade distribution charts. Identify weak points in curriculum based on student answers.
              </p>
            </motion.div>

            {/* Feature 3 */}
            <motion.div 
              {...fadeInUp}
              transition={{ delay: 0.3 }}
              className="group p-8 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:shadow-xl dark:hover:shadow-indigo-900/10 hover:border-indigo-200 dark:hover:border-indigo-500/30 transition-all duration-300 hover:-translate-y-1 h-full"
            >
              <div className="w-14 h-14 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <ShieldCheck className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Secure & Private</h4>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
                Built with strict enterprise security standards. Student data is encrypted and processed securely within the university's private cloud.
              </p>
            </motion.div>

            {/* News Card */}
            <NewsCard />
          </div>
        </div>
      </section>

      {/* --- DEMO SECTION (NEW REPLACEMENT FOR HOW IT WORKS) --- */}
      <DemoSection />

      {/* --- CTA SECTION --- */}
      <section className="py-20 bg-primary-gradient bg-gradient-to-br from-primary to-blue-900 dark:from-slate-900 dark:to-blue-950 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="max-w-4xl mx-auto text-center px-4 relative z-10">
          <h2 className="text-3xl font-bold mb-6">Ready to modernize your grading process?</h2>
          <p className="text-blue-100 dark:text-slate-300 text-lg mb-10">Join the BIS Faculty early access program and start saving hours on grading today.</p>
          <Button variant="secondary" size="lg" className="shadow-xl hover:shadow-2xl transition-shadow" onClick={() => navigate('/login')}>
            Access Portal
          </Button>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-slate-900 dark:bg-slate-950 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <span className="font-bold text-xl text-white tracking-tight">
              BIS <span className="text-primary dark:text-blue-400">Smart Grader</span>
            </span>
          </div>
          <div className="text-sm">
            &copy; 2025 BIS Faculty, Assiut University. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;