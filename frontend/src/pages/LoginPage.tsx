import { motion } from "motion/react";
import { Heart, Loader2 } from "lucide-react";
import { useState, FormEvent } from "react";
import { toast } from "sonner";
import { PageProps } from "../types";
import { API_URL } from "../constants";

export const LoginPage = ({ onNavigate }: PageProps) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();

    if (!username || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        onNavigate("dashboard");
      } else {
        toast.error(data.msg || "Invalid credentials");
      }
    } catch (error) {
      toast.error("Server error. Please try again later.");
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

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

        {/* Login Card */}
        <div className="bg-surface-container-low border border-primary/10 rounded-2xl p-10 shadow-2xl relative overflow-hidden backdrop-blur-sm">
          <header className="mb-10 text-center">
            <h2 className="text-xl font-medium tracking-tight text-on-surface">Welcome Back</h2>
          </header>

          <form className="space-y-8" onSubmit={handleLogin}>
            {/* Username Field */}
            <div className="group">
              <label className="block text-[10px] uppercase tracking-widest font-semibold text-outline mb-3" htmlFor="identity">
                Username
              </label>
              <input 
                className="w-full bg-transparent border-0 border-b border-outline/30 focus:border-primary focus:ring-0 text-on-surface py-2 px-0 transition-all placeholder:text-outline/20 text-sm outline-none"
                id="identity"
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
                <button type="button" className="text-[10px] uppercase tracking-widest font-semibold text-primary/70 hover:text-primary transition-colors">
                  Forgot?
                </button>
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

            {/* Login Button */}
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
                {isLoading ? "Authenticating..." : "Log in"}
              </button>
            </div>
          </form>

          {/* Secondary Options */}
          <div className="mt-12 pt-8 border-t border-outline/10 text-center">
            <button 
              onClick={() => onNavigate("register")}
              className="text-primary hover:text-primary-dim font-bold text-[11px] uppercase tracking-widest transition-colors"
            >
              Create Account
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
