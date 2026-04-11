import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Menu, X } from "lucide-react";
import { PageProps } from "../types";

export const Navbar = ({ onNavigate }: PageProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-surface/80 backdrop-blur-md border-b border-outline/10">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-12">
          <button 
            onClick={() => onNavigate("landing")}
            className="text-2xl font-extrabold tracking-tighter text-primary italic hover:opacity-80 transition-opacity"
          >
            KnightDate
          </button>
        </div>
        
        <div className="hidden md:flex items-center gap-4">
          <button 
            onClick={() => onNavigate("login")}
            className="px-6 py-2.5 font-semibold text-primary-dim hover:text-primary transition-colors"
          >
            Log In
          </button>
          <button 
            onClick={() => onNavigate("register")}
            className="px-6 py-2.5 font-bold bg-primary text-background rounded-lg hover:bg-primary-dim transition-all active:scale-95 shadow-lg shadow-primary/10"
          >
            Create Account
          </button>
        </div>

        <button 
          className="md:hidden text-on-surface"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden bg-surface border-b border-outline/10 px-6 py-8 flex flex-col gap-6"
          >
            <button onClick={() => { onNavigate("landing"); setIsMenuOpen(false); }} className="text-left text-lg font-bold text-primary">Discover</button>
            <button className="text-left text-lg font-medium text-on-surface-variant">Campus Safety</button>
            <button className="text-left text-lg font-medium text-on-surface-variant">Academics</button>
            <hr className="border-outline/10" />
            <button onClick={() => { onNavigate("login"); setIsMenuOpen(false); }} className="w-full py-4 font-bold text-primary border border-primary/20 rounded-xl">Log In</button>
            <button onClick={() => { onNavigate("register"); setIsMenuOpen(false); }} className="w-full py-4 font-bold bg-primary text-background rounded-xl">Create Account</button>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
