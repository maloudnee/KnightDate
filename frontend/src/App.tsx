/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { Toaster } from "sonner";
import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { DashboardPage } from "./pages/DashboardPage";
import { EditProfilePage } from "./pages/EditProfilePage";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { ResetPasswordPage } from "./pages/ResetPasswordPage";

type Page = "landing" | "login" | "register" | "dashboard" | "edit-profile" | "forgot-password" | "reset-password";

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("landing");
  const [resetToken, setResetToken] = useState<string>("");

  useEffect(() => {
    // Check for direct URL resets
    const path = window.location.pathname;
    const resetMatch = path.match(/^\/reset-password\/(.+)$/);
    if (resetMatch) {
      setResetToken(resetMatch[1]);
      setCurrentPage("reset-password");
      return;
    }

    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (storedUser && token) {
      setCurrentPage("dashboard");
    }
  }, []);

  const handleNavigate = (page: Page) => {
    setCurrentPage(page);
    // Update URL without reloading if needed (optional for this simple routing)
    if (page === "landing") window.history.pushState({}, "", "/");
    else window.history.pushState({}, "", `/${page}`);
    window.scrollTo(0, 0);
  };

  return (
    <div className="min-h-screen selection:bg-primary/30 selection:text-primary">
      <Toaster position="top-center" richColors />
      {currentPage === "landing" && <LandingPage onNavigate={handleNavigate} />}
      {currentPage === "login" && <LoginPage onNavigate={handleNavigate} />}
      {currentPage === "register" && <RegisterPage onNavigate={handleNavigate} />}
      {currentPage === "dashboard" && <DashboardPage onNavigate={handleNavigate} />}
      {currentPage === "edit-profile" && <EditProfilePage onNavigate={handleNavigate} />}
      {currentPage === "forgot-password" && <ForgotPasswordPage onNavigate={handleNavigate} />}
      {currentPage === "reset-password" && <ResetPasswordPage onNavigate={handleNavigate} token={resetToken} />}
    </div>
  );
}



