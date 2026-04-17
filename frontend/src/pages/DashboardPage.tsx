import { motion, AnimatePresence } from "motion/react";
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
  Edit3,
  SlidersHorizontal,
  LogOut,
  Check
} from "lucide-react";
import { useState, useEffect } from "react";
import { PageProps } from "../types";
import { API_URL, MAJORS, COMMON_INTERESTS } from "../constants";
import { toast } from "sonner";

export const DashboardPage = ({ onNavigate }: PageProps) => {
  const [userData, setUserData] = useState<any>(null);
  const [showPreferences, setShowPreferences] = useState(false);
  const [isLoadingPrefs, setIsLoadingPrefs] = useState(false);
  const [preferences, setPreferences] = useState({
    interestedIn: "both", // male, female, both
    minAge: 18,
    maxAge: 30,
    interests: [] as string[]
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUserData(user);

      // Map InterestedIn back to choice
      const interestedInArray = user.InterestedIn || [];
      let choice = "both";
      if (interestedInArray.length === 1) {
        choice = interestedInArray[0].toLowerCase();
      }

      setPreferences({
        interestedIn: choice,
        minAge: user.MinDatingAge || 18,
        maxAge: user.MaxDatingAge || 30,
        interests: user.Interests || []
      });

      // Fetch latest profile data to ensure dashboard is up to date
      const syncProfile = async () => {
        try {
          const token = localStorage.getItem("token");
          const response = await fetch(`${API_URL}/api/profile/${user.username}`, {
            headers: {
              "Authorization": `Bearer ${token}`
            }
          });
          const data = await response.json();
          if (response.ok) {
            setUserData(data);
            localStorage.setItem("user", JSON.stringify(data));
          }
        } catch (error) {
          console.error("Dashboard sync error:", error);
        }
      };

      syncProfile();
    }
    
    const storedPrefs = localStorage.getItem("preferences");
    if (storedPrefs) {
      setPreferences(JSON.parse(storedPrefs));
    }
  }, []);

  const savePreferences = async () => {
    setIsLoadingPrefs(true);
    try {
      const token = localStorage.getItem("token");
      
      let interestedInData: string[] = [];
      if (preferences.interestedIn === "both") {
        interestedInData = ["male", "female"];
      } else {
        interestedInData = [preferences.interestedIn];
      }

      const response = await fetch(`${API_URL}/api/profile/update-preferences`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          minAge: preferences.minAge,
          maxAge: preferences.maxAge,
          interestedIn: interestedInData,
          interests: preferences.interests
        })
      });

      const data = await response.json();
      if (response.ok) {
        toast.success("Preferences saved!");
        // Update local storage user data as well
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const user = JSON.parse(storedUser);
          user.MinDatingAge = preferences.minAge;
          user.MaxDatingAge = preferences.maxAge;
          user.InterestedIn = interestedInData;
          user.Interests = preferences.interests;
          localStorage.setItem("user", JSON.stringify(user));
          setUserData(user);
        }
        setShowPreferences(false);
      } else {
        toast.error(data.msg || "Failed to save preferences");
      }
    } catch (error) {
      toast.error("Error saving preferences");
      console.error(error);
    } finally {
      setIsLoadingPrefs(false);
    }
  };

  const toggleInterest = (interest: string) => {
    setPreferences(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    onNavigate("landing");
  };

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

  const userImage = userData?.ProfilePicture && userData.ProfilePicture !== "/default.png"
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
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-outline hover:text-yellow-500 transition-colors font-bold uppercase tracking-widest text-[10px]"
          >
            <span className="hidden sm:inline">Log out</span>
          </button>
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
                <h2 className="text-on-surface font-bold text-sm">
                  {userData?.FirstName && userData?.LastName 
                    ? `${userData.FirstName} ${userData.LastName}` 
                    : userData?.FirstName || "My Profile"}
                </h2>
                <button 
                  onClick={() => onNavigate("edit-profile")}
                  className="text-primary text-[10px] uppercase tracking-widest font-black flex items-center gap-1 hover:opacity-80"
                >
                  <Edit3 className="w-3 h-3" /> Edit
                </button>
              </div>
            </div>
            <div className="mt-6">
              <div className="relative group">
                <button className="w-full flex items-center gap-3 bg-white/5 hover:bg-white/10 transition-all p-3 rounded-xl border border-white/5 pr-12">
                  <div className="w-8 h-8 rounded-full gradient-gold flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
                    <Compass className="text-background w-4 h-4" />
                  </div>
                  <span className="text-sm font-bold truncate">Discover New Matches</span>
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowPreferences(true);
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-outline hover:text-primary transition-colors z-10"
                  title="Preferences"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                </button>
              </div>
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

      {/* Preferences Modal */}
      <AnimatePresence>
        {showPreferences && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPreferences(false)}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-md bg-surface-container-low border border-primary/20 rounded-3xl p-8 shadow-2xl relative z-10"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-black italic tracking-tighter text-primary uppercase">Matching Preferences</h2>
                <button 
                  onClick={() => setShowPreferences(false)}
                  className="text-outline hover:text-primary transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 scrollbar-hide">
                {/* Interest Preference (Gender) */}
                <div className="group">
                  <label className="block text-[10px] uppercase tracking-widest font-semibold text-outline mb-3">Interested In</label>
                  <div className="grid grid-cols-3 gap-2">
                    {["male", "female", "both"].map((option) => (
                      <button
                        key={option}
                        onClick={() => setPreferences({ ...preferences, interestedIn: option })}
                        className={`py-2 px-1 rounded-xl border text-[10px] uppercase tracking-widest font-bold transition-all ${
                          preferences.interestedIn === option 
                            ? "border-primary bg-primary text-background shadow-[0_0_15px_rgba(242,204,0,0.3)]" 
                            : "border-outline/20 text-outline hover:border-primary/50"
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Age Preference */}
                <div className="group">
                  <label className="block text-[10px] uppercase tracking-widest font-semibold text-outline mb-3">Age Range</label>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <input 
                        type="number" 
                        min="18" 
                        max="99"
                        className="w-full bg-transparent border-0 border-b border-outline/30 focus:border-primary focus:ring-0 text-on-surface py-2 px-0 transition-all text-sm outline-none"
                        value={preferences.minAge}
                        onChange={(e) => setPreferences({...preferences, minAge: parseInt(e.target.value) || 18})}
                        placeholder="Min"
                      />
                      <span className="text-[8px] uppercase tracking-widest text-outline/50 mt-1 block">Min Age</span>
                    </div>
                    <div className="flex-1">
                      <input 
                        type="number" 
                        min="18" 
                        max="99"
                        className="w-full bg-transparent border-0 border-b border-outline/30 focus:border-primary focus:ring-0 text-on-surface py-2 px-0 transition-all text-sm outline-none"
                        value={preferences.maxAge}
                        onChange={(e) => setPreferences({...preferences, maxAge: parseInt(e.target.value) || 100})}
                        placeholder="Max"
                      />
                      <span className="text-[8px] uppercase tracking-widest text-outline/50 mt-1 block">Max Age</span>
                    </div>
                  </div>
                </div>

                {/* Interests Section */}
                <div className="group">
                  <label className="block text-[10px] uppercase tracking-widest font-semibold text-outline mb-3">Interests</label>
                  <div className="flex flex-wrap gap-2">
                    {COMMON_INTERESTS.map((interest) => (
                      <button
                        key={interest}
                        onClick={() => toggleInterest(interest)}
                        className={`px-3 py-1.5 rounded-full text-[10px] font-bold transition-all border ${
                          preferences.interests.includes(interest)
                            ? "bg-primary/20 border-primary text-primary"
                            : "bg-white/5 border-white/10 text-outline hover:border-white/20"
                        }`}
                      >
                        {interest}
                      </button>
                    ))}
                  </div>
                </div>

                <button 
                  onClick={savePreferences}
                  disabled={isLoadingPrefs}
                  className="gradient-gold w-full py-4 rounded-full text-background font-black text-xs tracking-[0.3em] uppercase hover:shadow-[0_0_20px_rgba(242,204,0,0.3)] transition-all active:scale-95 disabled:opacity-50 mt-4"
                >
                  {isLoadingPrefs ? "Saving..." : "Save Preferences"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
