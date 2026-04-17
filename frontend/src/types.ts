export interface PageProps {
  onNavigate: (page: "landing" | "login" | "register" | "dashboard" | "edit-profile" | "forgot-password" | "reset-password") => void;
}
