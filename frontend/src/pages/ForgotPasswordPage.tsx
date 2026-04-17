import { motion } from "motion/react";
import { ArrowLeft, Loader2, Mail, Send } from "lucide-react";
import { useState, FormEvent } from "react";
import { toast } from "sonner";
import { PageProps } from "../types";
import { API_URL } from "../constants";

export const ForgotPasswordPage = ({ onNavigate }: PageProps) => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSubmitted(true);
      } else {
        toast.error(data.msg || "Something went wrong. Please try again.");
      }
    } catch (error) {
      toast.error("Server error. Please try again later.");
      console.error("Forgot password error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-20" 
           style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, #F2CC00 0%, transparent 100%)', filter: 'blur(100px)' }} />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md z-10"
      >
        <div className="mb-8">
          <button 
            onClick={() => onNavigate("login")}
            className="flex items-center gap-2 text-outline hover:text-primary transition-colors uppercase tracking-[0.2em] text-[10px] font-bold"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Login
          </button>
        </div>

        <div className="bg-surface-container-low border border-primary/10 rounded-2xl p-10 shadow-2xl relative overflow-hidden backdrop-blur-sm">
          <header className="mb-10 text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-xl font-medium tracking-tight text-on-surface">Forgot Password?</h2>
            <p className="text-outline text-xs mt-2 line-height-relaxed px-4">
              Enter your email and we'll send you a link to reset your password.
            </p>
          </header>

          {isSubmitted ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 mb-8">
                <p className="text-sm text-on-surface">
                  Success! If an account exists for <span className="text-primary font-bold">{email}</span>, you will receive a reset link shortly.
                </p>
              </div>
              <button 
                onClick={() => onNavigate("login")}
                className="text-primary hover:text-primary-dim font-bold text-[11px] uppercase tracking-widest transition-colors"
              >
                Return to login
              </button>
            </motion.div>
          ) : (
            <form className="space-y-8" onSubmit={handleSubmit}>
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

              <div className="pt-6">
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="gradient-gold w-full py-4 rounded-full text-background font-bold text-xs tracking-[0.2em] uppercase hover:shadow-[0_0_25px_rgba(242,204,0,0.3)] transition-all flex items-center justify-center gap-2 group active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  )}
                  {isLoading ? "Sending Link..." : "Send Reset Link"}
                </button>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
};
