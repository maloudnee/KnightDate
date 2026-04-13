import { motion } from "motion/react";
import { ShieldCheck, BrainCircuit, GraduationCap, Lock } from "lucide-react";

export const Features = () => {
  return (
    <section className="py-24 bg-surface">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-16">
          <h2 className="text-4xl font-bold mb-4">Beyond the Swipe</h2>
          <p className="text-on-surface-variant max-w-2xl font-medium text-lg">
            We've redesigned the dating experience to prioritize intellectual compatibility and safe, on-campus interactions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Feature 1 */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="md:col-span-2 bg-surface-container-high p-8 rounded-2xl prestige-border flex flex-col justify-between min-h-[320px]"
          >
            <div>
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <ShieldCheck className="text-primary w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Verified EDU Access</h3>
              <p className="text-on-surface-variant text-lg">
                Only students with a valid university email can join. No bots, no fakes, just real scholars from your campus ecosystem.
              </p>
            </div>
            <div className="flex gap-3 mt-8">
              <span className="px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest border border-primary/20">Safe Space</span>
              <span className="px-4 py-1.5 rounded-full bg-primary/20 text-primary text-xs font-bold uppercase tracking-widest">Verified</span>
            </div>
          </motion.div>

          {/* Feature 2 */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="md:col-span-2 bg-surface-container-highest p-8 rounded-2xl prestige-border flex flex-col items-center justify-center text-center relative overflow-hidden"
          >
            <div className="relative z-10">
              <span className="text-6xl font-black text-primary italic mb-4 block">74%</span>
              <p className="text-on-surface font-bold uppercase tracking-wide text-sm max-w-xs">
                Higher match quality through our proprietary "Syllabus Sync" algorithm.
              </p>
            </div>
            <BrainCircuit className="absolute inset-0 w-full h-full text-primary/5 -z-0 p-12" />
          </motion.div>

          {/* Feature 3 */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="md:col-span-1 bg-surface-container p-6 rounded-2xl prestige-border"
          >
            <h4 className="text-xs font-bold text-primary uppercase tracking-widest mb-6">Interest Tags</h4>
            <div className="flex flex-wrap gap-2">
              {["Quantum Physics", "Post-Modernism", "Indie Rock", "Urban Farming"].map((tag) => (
                <span key={tag} className="px-3 py-1.5 rounded-lg bg-surface-container-high text-on-surface-variant text-sm font-semibold border border-outline/10">
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Feature 4 */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="md:col-span-3 gradient-gold p-8 rounded-2xl flex flex-col md:flex-row items-center gap-8 shadow-2xl"
          >
            <div className="flex-1 text-background">
              <h3 className="text-2xl font-black uppercase mb-4">University Partners</h3>
              <p className="font-bold text-lg leading-relaxed">
                We work directly with campus security and student unions to ensure KnightMatch remains a safe, respectful environment for everyone.
              </p>
            </div>
            <div className="flex gap-4">
              <div className="w-20 h-20 bg-background/10 rounded-2xl flex items-center justify-center border border-background/20">
                <GraduationCap className="text-background w-10 h-10" />
              </div>
              <div className="w-20 h-20 bg-background/10 rounded-2xl flex items-center justify-center border border-background/20">
                <Lock className="text-background w-10 h-10" />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
