import { motion } from "motion/react";
import { Heart, Loader2 } from "lucide-react";
import { useState, FormEvent } from "react";
import { toast } from "sonner";
import { PageProps } from "../types";
import { API_URL } from "../constants";

export const RegisterPage = ({ onNavigate }: PageProps) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();

    if (!username || !password || !email) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password, email }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMsg(data.msg || "Registered! Please verify your account using the link sent to your email.");
        setIsSuccess(true);
      } else {
        toast.error(data.msg || "Registration failed");
      }
    } catch (error) {
      toast.error("Server error. Please try again later.");
      console.error("Registration error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-20" 
             style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, #F2CC00 0%, transparent 100%)', filter: 'blur(100px)' }} />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md z-10 bg-surface-container-low border border-primary/10 rounded-2xl p-10 shadow-2xl backdrop-blur-sm text-center"
        >
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart className="w-8 h-8 text-primary fill-primary" />
          </div>
          <h2 className="text-2xl font-black italic tracking-tighter text-primary uppercase mb-4">Check Your Inbox</h2>
          <p className="text-on-surface-variant mb-8 text-sm leading-relaxed">
            {successMsg}
          </p>
          <button 
            onClick={() => onNavigate("login")}
            className="gradient-gold w-full py-4 rounded-full text-background font-bold text-xs tracking-[0.2em] uppercase hover:shadow-[0_0_25px_rgba(242,204,0,0.3)] transition-all active:scale-95"
          >
            Go to Login
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden">
      {/* Subtle background texture */}
      <div className="absolute inset-0 pointer-events-none opacity-20" 
           style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, #F2CC00 0%, transparent 100%)', filter: 'blur(100px)' }} />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md z-10"
      >
        {/* Logo Section */}
        <div className="text-center mb-12">
          <button 
            onClick={() => onNavigate("landing")}
            className="text-5xl font-black italic tracking-tighter text-primary hover:opacity-80 transition-opacity"
          >
            KnightDate
          </button>
        </div>

        {/* Register Card */}
        <div className="bg-surface-container-low border border-primary/10 rounded-2xl p-10 shadow-2xl relative overflow-hidden backdrop-blur-sm">
          <header className="mb-10 text-center">
            <h2 className="text-xl font-medium tracking-tight text-on-surface">Meet Someone New</h2>
          </header>

          <form className="space-y-8" onSubmit={handleRegister}>
            {/* Email Field */}
            <div className="group">
              <label className="block text-[10px] uppercase tracking-widest font-semibold text-outline mb-3" htmlFor="email">
                Email
              </label>
              <input 
                className="w-full bg-transparent border-0 border-b border-outline/30 focus:border-primary focus:ring-0 text-on-surface py-2 px-0 transition-all placeholder:text-outline/20 text-sm outline-none"
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>

            {/* Username Field */}
            <div className="group">
              <label className="block text-[10px] uppercase tracking-widest font-semibold text-outline mb-3" htmlFor="username">
                Username
              </label>
              <input 
                className="w-full bg-transparent border-0 border-b border-outline/30 focus:border-primary focus:ring-0 text-on-surface py-2 px-0 transition-all placeholder:text-outline/20 text-sm outline-none"
                id="username"
                placeholder=""
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
              />
            </div>

            {/* Password Field */}
            <div className="group">
              <div className="flex justify-between items-end mb-3">
                <label className="block text-[10px] uppercase tracking-widest font-semibold text-outline" htmlFor="password">
                  Password
                </label>
              </div>
              <input 
                className="w-full bg-transparent border-0 border-b border-outline/30 focus:border-primary focus:ring-0 text-on-surface py-2 px-0 transition-all placeholder:text-outline/20 text-sm outline-none"
                id="password"
                placeholder=""
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>

            {/* Register Button */}
            <div className="pt-6">
              <button 
                type="submit"
                disabled={isLoading}
                className="gradient-gold w-full py-4 rounded-full text-background font-bold text-xs tracking-[0.2em] uppercase hover:shadow-[0_0_25px_rgba(242,204,0,0.3)] transition-all flex items-center justify-center gap-2 group active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Heart className="w-4 h-4 fill-background group-hover:scale-110 transition-transform" />
                )}
                {isLoading ? "Creating Account..." : "Create Account"}
              </button>
            </div>
          </form>

          {/* Secondary Options */}
          <div className="mt-12 pt-8 border-t border-outline/10 text-center">
            <button 
              onClick={() => onNavigate("login")}
              className="text-primary hover:text-primary-dim font-bold text-[11px] uppercase tracking-widest transition-colors"
            >
              Already a member? Log in
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
