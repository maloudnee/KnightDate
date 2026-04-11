import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { PageProps } from "../types";

export const CTA = ({ onNavigate }: PageProps) => {
  return (
    <section className="py-24 px-6">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-5xl mx-auto bg-surface-container-high rounded-3xl p-12 md:p-24 text-center relative overflow-hidden prestige-border shadow-2xl"
      >
        <div className="relative z-10">
          <h2 className="text-4xl md:text-6xl font-extrabold mb-8 tracking-tight">
            Your intellectual soulmate is just a click away.
          </h2>
          <p className="text-xl text-on-surface-variant font-medium mb-12 max-w-2xl mx-auto">
            Don't leave your campus life to chance. Join the community built for the curious.
          </p>
          <button 
            onClick={() => onNavigate("register")}
            className="px-10 py-5 rounded-xl font-black text-xl gradient-gold text-background shadow-2xl shadow-primary/20 hover:scale-105 transition-all active:scale-95 uppercase tracking-widest flex items-center gap-3 mx-auto"
          >
            Create Your Free Account
            <ArrowRight className="w-6 h-6" />
          </button>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />
      </motion.div>
    </section>
  );
};
