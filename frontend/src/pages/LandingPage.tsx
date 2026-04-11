import { Navbar } from "../components/Navbar";
import { Hero } from "../components/Hero";
import { Features } from "../components/Features";
import { CTA } from "../components/CTA";
import { PageProps } from "../types";

export const LandingPage = ({ onNavigate }: PageProps) => {
  return (
    <>
      <Navbar onNavigate={onNavigate} />
      <main>
        <Hero onNavigate={onNavigate} />
        <Features />
        <CTA onNavigate={onNavigate} />
      </main>
    </>
  );
};
