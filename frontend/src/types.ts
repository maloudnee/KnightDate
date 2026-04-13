export interface PageProps {
  onNavigate: (page: "landing" | "login" | "register" | "dashboard" | "edit-profile") => void;
}
