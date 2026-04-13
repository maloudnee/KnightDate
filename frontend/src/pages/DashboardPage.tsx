import { motion } from "motion/react";
import { 
  Search, 
  Compass, 
  MessageCircle, 
  Heart, 
  Star, 
  X, 
  Settings, 
  Shield, 
  Share2,
  Edit3
} from "lucide-react";
import { useState, useEffect } from "react";
import { PageProps } from "../types";
import { API_URL } from "../constants";

export const DashboardPage = ({ onNavigate }: PageProps) => {
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUserData(JSON.parse(storedUser));
    }
  }, []);

  const conversations = [
    {
      id: 1,
      name: "Sarah",
      lastMessage: "New Match! Say hello 👋",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80",
      online: true,
      superMatch: true
    },
    {
      id: 2,
      name: "James",
      lastMessage: "See you in the library later?",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80",
      online: false,
      superMatch: false
    },
    {
      id: 3,
      name: "David",
      lastMessage: "No, the exam was actually okay.",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80",
      online: false,
      superMatch: false
    }
  ];

  const userImage = userData?.ProfilePicture 
    ? `${API_URL}${userData.ProfilePicture}` 
    : "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&h=150&q=80";

  return (
    <div className="h-screen flex flex-col text-on-surface overflow-hidden">
      {/* Top Navigation */}
      <header className="h-16 flex items-center justify-between px-6 bg-surface z-50">
        <button 
          onClick={() => onNavigate("landing")}
          className="text-2xl font-black tracking-tighter text-primary uppercase italic hover:opacity-80 transition-opacity"
        >
          KnightDate
        </button>
        <div className="flex items-center gap-6">
          <button className="text-on-surface-variant hover:text-primary transition-colors">
            <Search className="w-5 h-5" />
          </button>
          <div className="w-8 h-8 rounded-full overflow-hidden border border-primary/50 cursor-pointer hover:scale-105 transition-transform">
            <img 
              src={userImage} 
              alt="My Profile" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-80 bg-surface-container-low flex flex-col hidden md:flex">
          {/* My Profile Section */}
          <div className="p-6 bg-gradient-to-r from-primary/5 to-transparent">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary shadow-lg shadow-primary/10">
                <img 
                  src={userImage} 
                  alt={userData?.FirstName || "User"} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <h2 className="text-on-surface font-bold text-sm">{userData?.FirstName || "My Profile"}</h2>
                <button 
                  onClick={() => onNavigate("edit-profile")}
                  className="text-primary text-[10px] uppercase tracking-widest font-black flex items-center gap-1 hover:opacity-80"
                >
                  <Edit3 className="w-3 h-3" /> Edit
                </button>
              </div>
            </div>
            <div className="mt-6">
              <button className="w-full flex items-center gap-3 bg-white/5 hover:bg-white/10 transition-all p-3 rounded-xl border border-white/5 group">
                <div className="w-8 h-8 rounded-full gradient-gold flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Compass className="text-background w-4 h-4" />
                </div>
                <span className="text-sm font-bold">Discover New Matches</span>
              </button>
            </div>
          </div>

          {/* Messages List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
            <h3 className="text-primary text-[10px] uppercase tracking-[0.2em] font-black mb-4">Messages</h3>
            <div className="space-y-6">
              {conversations.map((conv) => (
                <div key={conv.id} className="flex items-center gap-4 cursor-pointer group">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full overflow-hidden border border-outline-variant/30 group-hover:border-primary/50 transition-colors">
                      <img 
                        src={conv.image} 
                        alt={conv.name} 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    {conv.online && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-primary border-2 border-surface-container-low rounded-full" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <p className="text-on-surface text-sm font-bold truncate">{conv.name}</p>
                      {conv.superMatch && (
                        <Star className="w-3 h-3 text-blue-400 fill-blue-400" />
                      )}
                    </div>
                    <p className="text-on-surface-variant text-[11px] truncate opacity-70">{conv.lastMessage}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 bg-[#171717] flex flex-col items-center justify-center p-8 relative overflow-y-auto">
          {/* Discovery Card */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-surface-container-high rounded-[2rem] overflow-hidden shadow-2xl relative mb-10 prestige-border group"
          >
            <div className="relative aspect-[4/5]">
              <img 
                src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80" 
                alt="Discovery match profile" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 p-8 w-full">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-3xl font-black text-white tracking-tight">Evelyn, 22</h3>
                  <button className="text-white/60 hover:text-white transition-colors">
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-primary text-[10px] font-bold uppercase tracking-[0.2em] mb-4">Doctoral Candidate • 2 miles away</p>
                <p className="text-on-surface-variant text-sm leading-relaxed mb-4 font-medium">
                  Doctoral Candidate in Post-Modernism. Looking for someone to debate Foucault at 2 AM over cold espresso and vinyl records.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Interaction Buttons */}
          <div className="flex items-center gap-8">
            {/* Skip */}
            <button className="w-16 h-16 rounded-full bg-surface-container-highest flex items-center justify-center text-red-500 shadow-xl hover:scale-110 active:scale-95 transition-all border border-outline-variant/10">
              <X className="w-8 h-8" />
            </button>
            {/* Like */}
            <button className="w-16 h-16 rounded-full gradient-gold flex items-center justify-center text-background shadow-xl hover:scale-110 active:scale-95 transition-all">
              <Heart className="w-8 h-8 fill-background" />
            </button>
          </div>

        </main>
      </div>

      {/* Mobile Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 w-full bg-surface-container-low px-8 py-4 flex justify-between items-center z-50 border-t border-outline-variant/10">
        <Compass className="w-6 h-6 text-primary" />
        <MessageCircle className="w-6 h-6 text-on-surface-variant" />
        <Heart className="w-6 h-6 text-on-surface-variant" />
        <div className="w-8 h-8 rounded-full border border-primary p-0.5">
          <img 
            src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&h=150&q=80" 
            alt="Profile" 
            className="w-full h-full object-cover rounded-full"
            referrerPolicy="no-referrer"
          />
        </div>
      </nav>
    </div>
  );
};
