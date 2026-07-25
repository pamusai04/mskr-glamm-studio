import { useEffect, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  HeroSection,
  PackagesSection,
  AboutSection,
  ContactSection,
  FeaturesSection,
  Navbar,
  FAB,
  QRCodeSection,
  Footer
} from '../../components/landing';

const LandingPage = memo(() => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.user);

  useEffect(() => {
    if (isAuthenticated) navigate('/home');
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const scrollToTop = () => {
      window.scrollTo({ top: 0, behavior: 'instant' });
    };
    
    scrollToTop();
    
    const timeout1 = setTimeout(scrollToTop, 10);
    const timeout2 = setTimeout(scrollToTop, 50);
    const timeout3 = setTimeout(scrollToTop, 100);
    
    return () => {
      clearTimeout(timeout1);
      clearTimeout(timeout2);
      clearTimeout(timeout3);
    };
  }, []);

  const scrollToSection = useCallback((sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
      const navbarHeight = 70;
      const offsetPosition = section.getBoundingClientRect().top + window.pageYOffset - navbarHeight;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  }, []);

  const handleGetStarted = useCallback(() => {
    isAuthenticated ? navigate('/home') : navigate('/login');
  }, [isAuthenticated, navigate]);

  const handleLogin = useCallback(() => navigate('/login'), [navigate]);
  const handleSignup = useCallback(() => navigate('/register'), [navigate]);
  const handleVerifyEmail = useCallback(() => navigate('/verify-otp'), [navigate]);

  if (isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-white w-full overflow-x-hidden">
      <Navbar 
        handleLogin={handleLogin}
        handleSignup={handleSignup}
        handleVerifyEmail={handleVerifyEmail}
        scrollToSection={scrollToSection}
      />
      
      <HeroSection handleGetStarted={handleGetStarted} />
      <PackagesSection />
      <AboutSection />
      <ContactSection />
      <FeaturesSection />
      <QRCodeSection />
      <Footer/>
      <FAB />
    </div>
  );
});

LandingPage.displayName = 'LandingPage';

export default LandingPage;