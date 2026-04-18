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
  Check,
  Send,
  ChevronLeft
} from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import { PageProps } from "../types";
import { API_URL, MAJORS, COMMON_INTERESTS } from "../constants";
import { toast } from "sonner";

export const DashboardPage = ({ onNavigate }: PageProps) => {
  const [userData, setUserData] = useState<any>(null);
  const [showPreferences, setShowPreferences] = useState(false);
  const [isLoadingPrefs, setIsLoadingPrefs] = useState(false);
  const [viewState, setViewState] = useState<"default" | "discovery" | "chat">("default");
  const [potentialMatches, setPotentialMatches] = useState<any[]>([]);
  const [sidebarItems, setSidebarItems] = useState<any[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

            // Update preferences state as well
            const interestedInArray = data.InterestedIn || [];
            let choice = "both";
            if (interestedInArray.length === 1) {
              choice = interestedInArray[0].toLowerCase();
            }

            setPreferences({
              interestedIn: choice,
              minAge: data.MinDatingAge || 18,
              maxAge: data.MaxDatingAge || 30,
              interests: data.Interests || []
            });
          }
        } catch (error) {
          console.error("Dashboard sync error:", error);
        }
      };

      const fetchInboxAndMatches = async () => {
        try {
          const token = localStorage.getItem("token");
          
          // 1. Fetch Inbox
          const inboxRes = await fetch(`${API_URL}/api/messages/inbox/${user._id}`, {
            headers: { "Authorization": `Bearer ${token}` }
          });
          const inboxData = await inboxRes.json();

          // 2. Fetch Matches
          const matchesRes = await fetch(`${API_URL}/api/match/get-matches`, {
            headers: { "Authorization": `Bearer ${token}` }
          });
          const matchesData = await matchesRes.json();

          if (inboxRes.ok && matchesRes.ok) {
            // merge logic
            const merged = [...inboxData.map((item: any) => ({
              ...item._id,
              lastMessage: item.lastMessage,
              lastTimestamp: item.lastTimestamp,
              isFromInbox: true
            }))];

            // Add matches that aren't in inbox
            matchesData.forEach((match: any) => {
              const inInbox = merged.some(item => item._id === match._id);
              if (!inInbox) {
                merged.push({
                  ...match,
                  lastMessage: "New Match! Say hello 👋",
                  isFromInbox: false
                });
              }
            });

            setSidebarItems(merged);
          }
        } catch (error) {
          console.error("Fetch sidebar error:", error);
        }
      };

      syncProfile();
      fetchInboxAndMatches();
      
      // Initial fetch sidebar items interval
      const sidebarInterval = setInterval(fetchInboxAndMatches, 3000);
      return () => clearInterval(sidebarInterval);
    }
  }, []);

  // Polling for messages if in chat
  useEffect(() => {
    let interval: any;
    if (viewState === "chat" && selectedConversation && userData) {
      const fetchMessages = async () => {
        try {
          const token = localStorage.getItem("token");
          const response = await fetch(`${API_URL}/api/messages/conversation/${userData._id}/${selectedConversation._id}`, {
            headers: { "Authorization": `Bearer ${token}` }
          });
          const data = await response.json();
          if (response.ok) {
            setMessages(prev => {
              // Preserve optimistic messages that haven't been confirmed by the server yet
              const optimistic = prev.filter(m => String(m._id).startsWith('temp-'));
              const confirmed = data.map((msg: any) => ({ ...msg, isReal: true }));
              
              const stillPending = optimistic.filter(opt => 
                !confirmed.some((real: any) => 
                  real.messageText === opt.messageText && 
                  real.senderID._id === opt.senderID._id
                )
              );

              return [...confirmed, ...stillPending];
            });
          }
        } catch (error) {
          console.error("Fetch messages error:", error);
        }
      };

      fetchMessages();
      interval = setInterval(fetchMessages, 3000);
    }
    return () => clearInterval(interval);
  }, [viewState, selectedConversation, userData]);

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
    const lowerInterest = interest.toLowerCase();
    setPreferences(prev => ({
      ...prev,
      interests: prev.interests.some(i => i.toLowerCase() === lowerInterest)
        ? prev.interests.filter(i => i.toLowerCase() !== lowerInterest)
        : [...prev.interests, lowerInterest]
    }));
  };

  const handleDiscover = async () => {
    // Check if profile is complete
    if (userData) {
      const missingFields = [];
      if (!userData.Age) missingFields.push("Age");
      if (!userData.Gender) missingFields.push("Gender");
      if (!userData.SexualOrientation) missingFields.push("Sexual Orientation");

      if (missingFields.length > 0) {
        toast.warning(`Please complete your profile first! Missing: ${missingFields.join(", ")}`, {
          action: {
            label: "Edit Profile",
            onClick: () => onNavigate("edit-profile")
          }
        });
        return;
      }
    }

    setViewState("discovery");
    setIsDiscovering(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/match/discover`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setPotentialMatches(data);
        setCurrentIndex(0);
        if (data.length === 0) {
          toast.info("No new potential matches found. Try adjusting your preferences.");
        }
      } else {
        toast.error(data.msg || "Discovery failed");
      }
    } catch (error) {
      console.error("Discovery error:", error);
      toast.error("Could not load potential matches");
    } finally {
      setIsDiscovering(false);
    }
  };

  const handleInteraction = async (type: "like" | "dislike") => {
    if (potentialMatches.length === 0) return;
    const targetUser = potentialMatches[currentIndex];
    const token = localStorage.getItem("token");

    try {
      const endpoint = type === "like" ? "like-user" : "dislike-user";
      const response = await fetch(`${API_URL}/api/match/${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ targetID: targetUser._id })
      });

      if (response.ok) {
        if (type === "like") {
          // Check for match
          const matchResponse = await fetch(`${API_URL}/api/match/match-users`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ targetID: targetUser._id })
          });
          const matchData = await matchResponse.json();
          if (matchData.matched) {
            toast.success("It's a Match! check your messages.", {
              duration: 5000,
              icon: "🔥"
            });
          }
        }

        // Move to next card
        if (currentIndex < potentialMatches.length - 1) {
          setCurrentIndex(prev => prev + 1);
        } else {
          // End of list
          setPotentialMatches([]);
          setViewState("default");
          toast.info("You've seen all potential matches for now.");
        }
      } else {
        const data = await response.json();
        toast.error(data.msg || "Action failed");
      }
    } catch (error) {
      console.error("Interaction error:", error);
      toast.error("An error occurred");
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation || !userData) return;

    const messageContent = newMessage.trim();
    setNewMessage("");

    // Create optimistic message
    const optimisticMessage = {
      _id: `temp-${Date.now()}`,
      senderID: {
        _id: userData._id,
        username: userData.username,
        ProfilePicture: userData.ProfilePicture
      },
      recieverID: {
        _id: selectedConversation._id,
        username: selectedConversation.username,
        ProfilePicture: selectedConversation.ProfilePicture
      },
      messageText: messageContent,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, optimisticMessage]);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/messages/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          senderID: userData._id,
          recieverID: selectedConversation._id,
          messageText: messageContent
        })
      });

      if (!response.ok) {
        // Remove optimistic message if it failed
        setMessages(prev => prev.filter(m => m._id !== optimisticMessage._id));
        toast.error("Failed to send message");
        setNewMessage(messageContent); // Restore message text
      }
    } catch (error) {
      setMessages(prev => prev.filter(m => m._id !== optimisticMessage._id));
      toast.error("Error sending message");
      setNewMessage(messageContent);
    }
  };

  const handleSelectConversation = (conv: any) => {
    setSelectedConversation(conv);
    setViewState("chat");
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    onNavigate("landing");
  };

  const userImage = userData?.ProfilePicture && userData.ProfilePicture !== "/default.png"
    ? `${API_URL}${userData.ProfilePicture}` 
    : `${API_URL}/default.png`;

  const getMatchImage = (match: any) => {
    const pic = match.ProfilePicture || match.Profilepicture;
    return pic && pic !== "/default.png"
      ? `${API_URL}${pic}`
      : `${API_URL}/default.png`;
  };

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
                <button 
                  onClick={handleDiscover}
                  className={`w-full flex items-center gap-3 transition-all p-3 rounded-xl border pr-12 ${
                    viewState === "discovery" 
                      ? "bg-primary/10 border-primary/30" 
                      : "bg-white/5 hover:bg-white/10 border-white/5"
                  }`}
                >
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
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-primary text-[10px] uppercase tracking-[0.2em] font-black">Messages</h3>
              {viewState !== "default" && (
                <button 
                  onClick={() => setViewState("default")}
                  className="text-[10px] uppercase tracking-widest text-outline hover:text-primary transition-colors font-bold"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="space-y-6">
              {sidebarItems.length > 0 ? sidebarItems.map((item) => (
                <div 
                  key={item._id} 
                  onClick={() => handleSelectConversation(item)}
                  className={`flex items-center gap-4 cursor-pointer group p-2 rounded-xl transition-all ${
                    selectedConversation?._id === item._id ? "bg-primary/10" : "hover:bg-white/5"
                  }`}
                >
                  <div className="relative">
                    <div className={`w-12 h-12 rounded-full overflow-hidden border ${
                      selectedConversation?._id === item._id ? "border-primary" : "border-outline-variant/30 group-hover:border-primary/50"
                    } transition-colors`}>
                      <img 
                        src={getMatchImage(item)} 
                        alt={item.FirstName || item.username} 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex justify-between items-center">
                      <p className="text-on-surface text-sm font-bold truncate">{item.FirstName || item.username}</p>
                    </div>
                    <p className={`text-[11px] truncate opacity-70 ${
                      selectedConversation?._id === item._id ? "text-primary font-medium" : "text-on-surface-variant"
                    }`}>
                      {item.lastMessage || "Start chatting..."}
                    </p>
                  </div>
                </div>
              )) : (
                <p className="text-[10px] text-outline/30 uppercase tracking-[0.2em] text-center py-10">No messages yet</p>
              )}
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 bg-[#171717] flex flex-col items-center justify-center relative overflow-hidden">
          <AnimatePresence mode="wait">
            {viewState === "default" ? (
              <motion.div 
                key="default-view"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="text-center max-w-sm px-8"
              >
                <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8 prestige-border">
                  <Compass className="w-10 h-10 text-primary" />
                </div>
                <h2 className="text-2xl font-black italic tracking-tighter text-primary uppercase mb-4">Ready to find Love?</h2>
                <p className="text-outline text-sm leading-relaxed mb-10">
                  Begin your journey by discovering new students on campus or revisit your existing conversations.
                </p>
                <div className="flex flex-col gap-4">
                  <button 
                    onClick={handleDiscover}
                    className="gradient-gold py-4 rounded-full text-background font-black text-xs tracking-[0.2em] uppercase shadow-2xl hover:scale-105 active:scale-95 transition-all"
                  >
                    Start Discovering
                  </button>
                  <p className="text-[10px] text-outline/30 uppercase tracking-widest">or check your matches in the sidebar</p>
                </div>
              </motion.div>
            ) : viewState === "discovery" ? (
              <div key="discovery-view-container" className="flex flex-col items-center justify-center h-full w-full p-8">
                {isDiscovering ? (
                  <motion.div 
                    key="loading-discovery"
                    className="flex flex-col items-center gap-4"
                  >
                    <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                    <p className="text-[10px] uppercase tracking-widest font-bold text-primary">Searching for matches...</p>
                  </motion.div>
                ) : potentialMatches.length > 0 ? (
                  <div key="discovery-view" className="flex flex-col items-center gap-10">
                    {/* Discovery Card */}
                    <motion.div 
                      key={potentialMatches[currentIndex]._id}
                      initial={{ opacity: 0, x: 100, rotate: 5 }}
                      animate={{ opacity: 1, x: 0, rotate: 0 }}
                      exit={{ opacity: 0, x: -100, rotate: -5 }}
                      drag="x"
                      dragConstraints={{ left: 0, right: 0 }}
                      onDragEnd={(_, info) => {
                        if (info.offset.x > 100) handleInteraction("like");
                        else if (info.offset.x < -100) handleInteraction("dislike");
                      }}
                      className="w-full max-w-md bg-surface-container-high rounded-[2rem] overflow-hidden shadow-2xl relative prestige-border group cursor-grab active:cursor-grabbing"
                    >
                      <div className="relative aspect-[4/5] pointer-events-none">
                        <img 
                          src={potentialMatches[currentIndex].ProfilePicture && potentialMatches[currentIndex].ProfilePicture !== "/default.png"
                            ? `${API_URL}${potentialMatches[currentIndex].ProfilePicture}`
                            : `${API_URL}/default.png`
                          } 
                          alt={potentialMatches[currentIndex].FirstName} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
                        <div className="absolute bottom-0 left-0 p-8 w-full">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-3xl font-black text-white tracking-tight">
                              {potentialMatches[currentIndex].FirstName}, {potentialMatches[currentIndex].Age}
                            </h3>
                            <button className="text-white/60 hover:text-white transition-colors pointer-events-auto">
                              <Share2 className="w-5 h-5" />
                            </button>
                          </div>
                          <p className="text-primary text-[10px] font-bold uppercase tracking-[0.2em] mb-4">
                            {potentialMatches[currentIndex].Major}
                          </p>
                          <p className="text-on-surface-variant text-sm leading-relaxed mb-4 font-medium line-clamp-3 text-left">
                            {potentialMatches[currentIndex].Bio || "No bio yet."}
                          </p>
                          {/* Interests Chips */}
                          <div className="flex flex-wrap gap-2">
                            {(potentialMatches[currentIndex].Interests || []).slice(0, 3).map((interest: string) => (
                              <span key={interest} className="px-2 py-1 bg-white/10 rounded-lg text-[9px] uppercase font-bold text-outline">
                                {interest}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>

                    {/* Interaction Buttons */}
                    <div className="flex items-center gap-8">
                      {/* Skip */}
                      <button 
                        onClick={() => handleInteraction("dislike")}
                        className="w-16 h-16 rounded-full bg-surface-container-highest flex items-center justify-center text-red-500 shadow-xl hover:scale-110 active:scale-95 transition-all border border-outline-variant/10"
                      >
                        <X className="w-8 h-8" />
                      </button>
                      
                      {/* Like */}
                      <button 
                        onClick={() => handleInteraction("like")}
                        className="w-16 h-16 rounded-full gradient-gold flex items-center justify-center text-background shadow-xl hover:scale-110 active:scale-95 transition-all"
                      >
                        <Heart className="w-8 h-8 fill-background" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center"
                  >
                    <p className="text-outline text-sm">No more potential matches at the moment.</p>
                    <button onClick={handleDiscover} className="text-primary font-bold uppercase tracking-widest text-xs mt-4 hover:underline">
                      Refresh Discovery
                    </button>
                  </motion.div>
                )}
              </div>
            ) : viewState === "chat" && selectedConversation ? (
              <motion.div 
                key="chat-view"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col h-full w-full bg-[#121212]"
              >
                {/* Chat Header */}
                <div className="h-16 border-b border-white/5 flex items-center px-6 justify-between bg-surface/50 backdrop-blur-md">
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => setViewState("default")}
                      className="md:hidden text-outline hover:text-primary transition-colors"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <div className="w-10 h-10 rounded-full overflow-hidden border border-primary/30">
                      <img 
                        src={getMatchImage(selectedConversation)} 
                        alt={selectedConversation.FirstName} 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{selectedConversation.FirstName || selectedConversation.username}</h4>
                      <p className="text-[10px] text-primary uppercase tracking-widest font-black">Active Conversation</p>
                    </div>
                  </div>
                </div>

                {/* Messages Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide">
                  {messages.map((msg, idx) => {
                    const isMe = msg.senderID._id === userData?._id;
                    return (
                      <motion.div 
                        initial={msg.isReal ? false : { opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={msg._id}
                        className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                      >
                        <div 
                          className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm ${
                            isMe 
                              ? "bg-primary text-background font-medium rounded-tr-none" 
                              : "bg-white/5 text-on-surface border border-white/5 rounded-tl-none"
                          }`}
                        >
                          <p>{msg.messageText}</p>
                          <span className={`text-[8px] mt-1 block opacity-50 ${isMe ? "text-background" : "text-outline"}`}>
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="p-6 border-t border-white/5 bg-surface/30">
                  <form 
                    onSubmit={handleSendMessage}
                    className="flex items-center gap-4 bg-white/5 p-2 px-4 rounded-2xl border border-white/5 focus-within:border-primary/30 transition-all shadow-inner"
                  >
                    <input 
                      type="text" 
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 bg-transparent border-none focus:ring-0 focus:outline-none text-sm py-2"
                    />
                    <button 
                      type="submit"
                      disabled={!newMessage.trim()}
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                        newMessage.trim() ? "gradient-gold text-background shadow-lg shadow-primary/20" : "bg-white/5 text-outline opacity-50"
                      }`}
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </form>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
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
                          preferences.interests.some(i => i.toLowerCase() === interest.toLowerCase())
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
