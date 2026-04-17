import { motion } from "motion/react";
import { Lock, Loader2, CheckCircle, ArrowRight } from "lucide-react";
import { useState, FormEvent } from "react";
import { toast } from "sonner";
import { API_URL } from "../constants";

interface ResetPasswordProps {
  onNavigate: (page: any) => void;
  token: string;
}

export const ResetPasswordPage = ({ onNavigate, token }: ResetPasswordProps) => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/reset-password/${token}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSuccess(true);
        toast.success("Password reset successful!");
      } else {
        toast.error(data.msg || "Link expired or invalid.");
      }
    } catch (error) {
      toast.error("Server error. Please try again later.");
      console.error("Reset password error:", error);
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
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md z-10 bg-surface-container-low border border-primary/10 rounded-2xl p-10 shadow-2xl backdrop-blur-sm text-center"
        >
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-black italic tracking-tighter text-primary uppercase mb-4">Password Reset</h2>
          <p className="text-on-surface-variant mb-8 text-sm leading-relaxed">
            Your password has been successfully updated. You can now log in with your new credentials.
          </p>
          <button 
            onClick={() => onNavigate("login")}
            className="gradient-gold w-full py-4 rounded-full text-background font-bold text-xs tracking-[0.2em] uppercase hover:shadow-[0_0_25px_rgba(242,204,0,0.3)] transition-all flex items-center justify-center gap-2 group active:scale-95"
          >
            Go to Login <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-20" 
           style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, #F2CC00 0%, transparent 100%)', filter: 'blur(100px)' }} />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md z-10"
      >
        <div className="bg-surface-container-low border border-primary/10 rounded-2xl p-10 shadow-2xl relative overflow-hidden backdrop-blur-sm">
          <header className="mb-10 text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-xl font-medium tracking-tight text-on-surface">Secure Your Account</h2>
            <p className="text-outline text-xs mt-2">Enter your new password below.</p>
          </header>

          <form className="space-y-8" onSubmit={handleSubmit}>
            <div className="group">
              <label className="block text-[10px] uppercase tracking-widest font-semibold text-outline mb-3" htmlFor="password">
                New Password
              </label>
              <input 
                className="w-full bg-transparent border-0 border-b border-outline/30 focus:border-primary focus:ring-0 text-on-surface py-2 px-0 transition-all placeholder:text-outline/20 text-sm outline-none"
                id="password"
                placeholder="Min 6 characters"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="group">
              <label className="block text-[10px] uppercase tracking-widest font-semibold text-outline mb-3" htmlFor="confirm">
                Confirm New Password
              </label>
              <input 
                className="w-full bg-transparent border-0 border-b border-outline/30 focus:border-primary focus:ring-0 text-on-surface py-2 px-0 transition-all placeholder:text-outline/20 text-sm outline-none"
                id="confirm"
                placeholder="Re-enter password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
                  <Lock className="w-4 h-4" />
                )}
                {isLoading ? "Updating..." : "Update Password"}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};
