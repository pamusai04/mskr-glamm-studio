import { Toaster } from 'react-hot-toast';
import Contact from '../../components/user/contact/Contact';
import Footer from '../../components/Footer';

const ContactPage = () => {

  return (
    <div className="min-h-screen bg-white bg-background text-foreground font-sans selection:bg-secondary/30">
      <Contact />

      <Footer />
     
    </div>
  );
};

export default ContactPage;