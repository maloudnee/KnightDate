import { motion } from "motion/react";
import { ArrowLeft, Camera, Loader2, Save } from "lucide-react";
import { useState, useEffect, FormEvent, ChangeEvent } from "react";
import { toast } from "sonner";
import { PageProps } from "../types";
import { API_URL, MAJORS } from "../constants";

export const EditProfilePage = ({ onNavigate }: PageProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    age: "",
    major: "",
    bio: "",
    sexualOrientation: "",
    gender: "",
  });

  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUsername(user.username);
      
      // Initial pre-fill from localStorage for immediate feedback
      setFormData({
        firstName: user.FirstName || "",
        lastName: user.LastName || "",
        email: user.Email || "",
        age: user.Age || "",
        major: user.Major || "",
        bio: user.Bio || "",
        sexualOrientation: user.SexualOrientation || "",
        gender: user.Gender || "",
      });
      setProfilePicture(user.ProfilePicture && user.ProfilePicture !== "/default.png" ? `${API_URL}${user.ProfilePicture}` : null);

      // Fetch fresh data from backend
      const fetchFullProfile = async () => {
        try {
          const token = localStorage.getItem("token");
          const response = await fetch(`${API_URL}/api/profile/${user.username}`, {
            headers: {
              "Authorization": `Bearer ${token}`
            }
          });
          const data = await response.json();
          if (response.ok) {
            setFormData({
              firstName: data.FirstName || "",
              lastName: data.LastName || "",
              email: data.Email || "",
              age: data.Age || "",
              major: data.Major || "",
              bio: data.Bio || "",
              sexualOrientation: data.SexualOrientation || "",
              gender: data.Gender || "",
            });
            setProfilePicture(data.ProfilePicture && data.ProfilePicture !== "/default.png" ? `${API_URL}${data.ProfilePicture}` : null);
            
            // Sync local storage to keep it updated
            localStorage.setItem("user", JSON.stringify(data));
          }
        } catch (error) {
          console.error("Error fetching full profile:", error);
        }
      };

      fetchFullProfile();
    }
  }, []);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !username) return;

    const formData = new FormData();
    formData.append("profilePicture", file);
    formData.append("username", username);

    setIsUploading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/profile/upload-picture`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        setProfilePicture(`${API_URL}${data.path}`);
        toast.success("Profile picture updated!");
        
        // Update local storage
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const user = JSON.parse(storedUser);
          user.ProfilePicture = data.path;
          localStorage.setItem("user", JSON.stringify(user));
        }
      } else {
        toast.error(data.message || "Upload failed");
      }
    } catch (error) {
      toast.error("Error uploading image");
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!username) return;

    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/profile/register-profile`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ ...formData, username }),
      });

      const data = await response.json();
      if (response.ok) {
        toast.success("Profile updated successfully!");
        
        // Update local storage with new data
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const user = JSON.parse(storedUser);
          const updatedUser = { 
            ...user, 
            FirstName: formData.firstName,
            LastName: formData.lastName,
            Email: formData.email,
            Age: formData.age,
            Major: formData.major,
            Bio: formData.bio,
            SexualOrientation: formData.sexualOrientation,
            Gender: formData.gender
          };
          localStorage.setItem("user", JSON.stringify(updatedUser));
        }
        
        onNavigate("dashboard");
      } else {
        toast.error(data.message || "Update failed");
      }
    } catch (error) {
      toast.error("Server error");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface text-on-surface p-6 md:p-12">
      <div className="max-w-2xl mx-auto">
        <header className="flex items-center justify-between mb-12">
          <button 
            onClick={() => onNavigate("dashboard")}
            className="flex items-center gap-2 text-primary hover:opacity-80 transition-opacity font-bold uppercase tracking-widest text-xs"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </button>
          <h1 className="text-2xl font-black italic tracking-tighter text-primary uppercase">Edit Profile</h1>
        </header>

        <div className="bg-surface-container-low border border-primary/10 rounded-3xl p-8 md:p-12 shadow-2xl backdrop-blur-sm">
          {/* Profile Picture Upload */}
          <div className="flex flex-col items-center mb-12">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-primary/20 group-hover:border-primary transition-colors shadow-2xl">
                {profilePicture ? (
                  <img src={profilePicture} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-full h-full bg-surface-container-high flex items-center justify-center">
                    <Camera className="w-8 h-8 text-outline/30" />
                  </div>
                )}
              </div>
              <label className="absolute bottom-0 right-0 bg-primary text-background p-2 rounded-full cursor-pointer hover:scale-110 transition-transform shadow-lg">
                <Camera className="w-4 h-4" />
                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} disabled={isUploading} />
              </label>
              {isUploading && (
                <div className="absolute inset-0 bg-surface/60 rounded-full flex items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              )}
            </div>
            <p className="mt-4 text-[10px] uppercase tracking-[0.2em] font-black text-outline">Profile Picture</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* First Name */}
              <div className="group">
                <label className="block text-[10px] uppercase tracking-widest font-semibold text-outline mb-3" htmlFor="firstName">First Name</label>
                <input 
                  className="w-full bg-transparent border-0 border-b border-outline/30 focus:border-primary focus:ring-0 text-on-surface py-2 px-0 transition-all text-sm outline-none"
                  id="firstName" type="text" value={formData.firstName} onChange={handleInputChange} placeholder="Enter your first name"
                />
              </div>
              {/* Last Name */}
              <div className="group">
                <label className="block text-[10px] uppercase tracking-widest font-semibold text-outline mb-3" htmlFor="lastName">Last Name</label>
                <input 
                  className="w-full bg-transparent border-0 border-b border-outline/30 focus:border-primary focus:ring-0 text-on-surface py-2 px-0 transition-all text-sm outline-none"
                  id="lastName" type="text" value={formData.lastName} onChange={handleInputChange} placeholder="Enter your last name"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Email */}
              <div className="group">
                <label className="block text-[10px] uppercase tracking-widest font-semibold text-outline mb-3" htmlFor="email">University Email</label>
                <input 
                  className="w-full bg-transparent border-0 border-b border-outline/30 focus:border-primary focus:ring-0 text-on-surface py-2 px-0 transition-all text-sm outline-none"
                  id="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="yourname@university.edu"
                />
              </div>
              {/* Age */}
              <div className="group">
                <label className="block text-[10px] uppercase tracking-widest font-semibold text-outline mb-3" htmlFor="age">Age</label>
                <input 
                  className="w-full bg-transparent border-0 border-b border-outline/30 focus:border-primary focus:ring-0 text-on-surface py-2 px-0 transition-all text-sm outline-none"
                  id="age" type="number" value={formData.age} onChange={handleInputChange} placeholder="e.g. 21"
                />
              </div>
            </div>

            {/* Major */}
            <div className="group">
              <label className="block text-[10px] uppercase tracking-widest font-semibold text-outline mb-3" htmlFor="major">Academic Major</label>
              <select 
                className="w-full bg-transparent border-0 border-b border-outline/30 focus:border-primary focus:ring-0 text-on-surface py-2 px-0 transition-all text-sm outline-none appearance-none"
                id="major" value={formData.major} onChange={handleInputChange}
              >
                <option value="" className="bg-surface">Select Major</option>
                {MAJORS.map((major) => (
                  <option key={major} value={major} className="bg-surface">{major}</option>
                ))}
              </select>
            </div>

            {/* Bio */}
            <div className="group">
              <label className="block text-[10px] uppercase tracking-widest font-semibold text-outline mb-3" htmlFor="bio">Bio / Personal Statement</label>
              <textarea 
                className="w-full bg-transparent border-0 border-b border-outline/30 focus:border-primary focus:ring-0 text-on-surface py-2 px-0 transition-all text-sm outline-none min-h-[100px] resize-none"
                id="bio" value={formData.bio} onChange={handleInputChange} placeholder="Tell us about yourself..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Gender */}
              <div className="group">
                <label className="block text-[10px] uppercase tracking-widest font-semibold text-outline mb-3" htmlFor="gender">Gender</label>
                <select 
                  className="w-full bg-transparent border-0 border-b border-outline/30 focus:border-primary focus:ring-0 text-on-surface py-2 px-0 transition-all text-sm outline-none appearance-none"
                  id="gender" value={formData.gender} onChange={handleInputChange}
                >
                  <option value="" className="bg-surface">Select Gender</option>
                  <option value="male" className="bg-surface">Male</option>
                  <option value="female" className="bg-surface">Female</option>
                </select>
              </div>
              {/* Sexual Orientation */}
              <div className="group">
                <label className="block text-[10px] uppercase tracking-widest font-semibold text-outline mb-3" htmlFor="sexualOrientation">Sexual Orientation</label>
                <select 
                  className="w-full bg-transparent border-0 border-b border-outline/30 focus:border-primary focus:ring-0 text-on-surface py-2 px-0 transition-all text-sm outline-none appearance-none"
                  id="sexualOrientation" value={formData.sexualOrientation} onChange={handleInputChange}
                >
                  <option value="" className="bg-surface">Select Orientation</option>
                  <option value="Straight" className="bg-surface">Straight</option>
                  <option value="Gay" className="bg-surface">Gay</option>
                  <option value="Bi" className="bg-surface">Bi</option>
                </select>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-8">
              <button 
                type="submit"
                disabled={isLoading}
                className="gradient-gold w-full py-5 rounded-full text-background font-black text-xs tracking-[0.3em] uppercase hover:shadow-[0_0_30px_rgba(242,204,0,0.4)] transition-all flex items-center justify-center gap-3 group active:scale-95 disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5 group-hover:scale-110 transition-transform" />}
                {isLoading ? "Saving Changes..." : "Save Profile"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
