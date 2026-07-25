
import { memo, useEffect, useRef } from 'react';
import Hero from "../../components/Hero";
import Footer from "../../components/Footer";

const Home = memo(() => {
  const homeRef = useRef(null);
  const hasScrolled = useRef(false);

  useEffect(() => {
    if (!hasScrolled.current && homeRef.current) {
      hasScrolled.current = true;
      setTimeout(() => {
        if (homeRef.current) {
          const navbar = document.querySelector('nav');
          const navbarHeight = navbar ? navbar.offsetHeight : 80;
          
          const elementPosition = homeRef.current.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - navbarHeight - 15;
          
          window.scrollTo({
            top: Math.max(0, offsetPosition),
            behavior: 'smooth'
          });
        }
      }, 100);
    }
  }, []);

  return (
    <div ref={homeRef} className="relative w-full overflow-x-hidden bg-white">
      <Hero />
      <Footer />
    </div>
  );
});

export default Home;