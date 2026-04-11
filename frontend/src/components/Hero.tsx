import { motion } from "motion/react";
import { Sparkles } from "lucide-react";
import { PageProps } from "../types";

export const Hero = ({ onNavigate }: PageProps) => {
  return (
    <section className="relative pt-20 pb-20 md:pt-32 md:pb-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1] mb-8">
            Meet Your <br />
            <span className="text-yellow-300">Campus Match</span>
          </h1>
          <p className="text-lg md:text-xl text-on-surface-variant font-medium leading-relaxed mb-10 max-w-lg">
            A better way to meet people on campus-find people you actually click with.
          </p>
          <div className="flex flex-wrap gap-4 mb-12">
            <button 
              onClick={() => onNavigate("login")}
              className="px-8 py-4 rounded-xl font-extrabold text-lg gradient-gold text-background shadow-xl shadow-primary/20 hover:scale-105 transition-transform active:scale-95"
            >
              Get Started
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative grid grid-cols-2 gap-4"
        >
          <div className="space-y-4 pt-12">
            <div className="rounded-2xl overflow-hidden h-64 shadow-2xl prestige-border">
              <img 
                src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=600&h=800&q=80" 
                alt="Campus Couple" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-surface-container p-6 rounded-2xl shadow-xl prestige-border relative translate-x-4"
            >
              <Sparkles className="text-primary w-10 h-10 mb-4" />
              <h3 className="text-xl font-bold mb-1">Smart Sync</h3>
              <p className="text-sm text-on-surface-variant">Match based on shared organizations and personal interests</p>
            </motion.div>
          </div>
          
          <div className="space-y-4">
            <div className="rounded-2xl overflow-hidden h-80 shadow-2xl prestige-border">
              <img 
                src="https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=600&h=800&q=80" 
                alt="Coffee Date" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="rounded-2xl overflow-hidden h-48 shadow-lg prestige-border">
              <img 
                src="https://images.unsplash.com/photo-1523240715630-9918c1381e5b?auto=format&fit=crop&w=600&h=400&q=80" 
                alt="Students Laughing" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
