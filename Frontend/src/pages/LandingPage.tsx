import { useState } from 'react';
import { toast } from 'sonner';
import { LoginModal } from '../components/auth/LoginModal';
import { RegisterModal } from '../components/auth/RegisterModal';
import { LandingNavbar } from '../components/landing/LandingNavbar';
import { HeroSection } from '../components/landing/HeroSection';
import { TrustSection } from '../components/landing/TrustSection';
import { ProblemSection } from '../components/landing/ProblemSection';
import { SolutionSection } from '../components/landing/SolutionSection';
import { HowItWorksSection } from '../components/landing/HowItWorksSection';
import { WhyBTBIZSection } from '../components/landing/WhyBTBIZSection';
import { ProductShowcaseSection } from '../components/landing/ProductShowcaseSection';
import { PricingSection } from '../components/landing/PricingSection';
import { TestimonialsSection } from '../components/landing/TestimonialsSection';
import { FAQSection } from '../components/landing/FAQSection';
import { FinalCTASection } from '../components/landing/FinalCTASection';
import { LandingFooter } from '../components/landing/LandingFooter';
import { FloatingWhatsAppButton } from '../components/landing/FloatingWhatsAppButton';
import { BackToTopButton } from '../components/landing/BackToTopButton';

export function LandingPage() {
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [darkMode, setDarkMode] = useState(true);

  const openLogin = (email = '') => {
    setLoginEmail(email);
    setLoginOpen(true);
  };

  const handleDemo = () => {
    toast.info('Demo request received! Our team will contact you shortly.', {
      description: 'Call +91 98108 87227 for immediate assistance.',
    });
  };

  const toggleDark = () => {
    setDarkMode((current) => {
      const next = !current;
      document.documentElement.classList.toggle('light', !next);
      return next;
    });
  };

  return (
    <div className="mesh-bg min-h-screen">
      <LandingNavbar
        onLogin={() => openLogin()}
        onRegister={() => setRegisterOpen(true)}
        darkMode={darkMode}
        onToggleDark={toggleDark}
      />

      <main>
        <HeroSection onRegister={() => setRegisterOpen(true)} onDemo={handleDemo} />
        <TrustSection />
        <ProblemSection />
        <SolutionSection />
        <HowItWorksSection />
        <WhyBTBIZSection />
        <ProductShowcaseSection />
        <PricingSection onContact={handleDemo} />
        <TestimonialsSection />
        <FAQSection />
        <FinalCTASection onRegister={() => setRegisterOpen(true)} onDemo={handleDemo} />
      </main>

      <LandingFooter />
      <FloatingWhatsAppButton />
      <BackToTopButton />

      <LoginModal open={loginOpen} onOpenChange={setLoginOpen} initialEmail={loginEmail} />
      <RegisterModal
        open={registerOpen}
        onOpenChange={setRegisterOpen}
        onLoginClick={openLogin}
      />
    </div>
  );
}
