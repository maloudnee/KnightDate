/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { Toaster } from "sonner";
import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { DashboardPage } from "./pages/DashboardPage";
import { EditProfilePage } from "./pages/EditProfilePage";

export default function App() {
  const [currentPage, setCurrentPage] = useState<"landing" | "login" | "register" | "dashboard" | "edit-profile">("landing");

  const handleNavigate = (page: "landing" | "login" | "register" | "dashboard" | "edit-profile") => {
    setCurrentPage(page);
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
    </div>
  );
}



