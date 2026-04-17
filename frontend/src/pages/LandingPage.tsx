import { Navbar } from "../components/Navbar";
import { Hero } from "../components/Hero";
import { PageProps } from "../types";

export const LandingPage = ({ onNavigate }: PageProps) => {
  return (
    <>
      <Navbar onNavigate={onNavigate} />
      <main>
        <Hero onNavigate={onNavigate} />
      </main>
    </>
  );
};
