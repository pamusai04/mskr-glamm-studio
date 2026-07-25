// import { memo, useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useSelector } from 'react-redux';
// import { Home, Calendar, Sparkles, Phone, AlertCircle, CheckCircle } from 'lucide-react';

// const FAB = memo(() => {
//   const navigate = useNavigate();
//   const { services } = useSelector((state) => state.landingPage);
//   const [showText, setShowText] = useState(true);
//   const shopClosureDates = services?.[0]?.shopClosureDates || [];
//   const timeSlots = services?.[0]?.timeSlots || [];
  
//   useEffect(() => {
//     const timer = setTimeout(() => {
//       setShowText(false);
//     }, 8000);
    
//     return () => clearTimeout(timer);
//   }, []);
  
//   const checkIfParlorClosed = () => {
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);
    
//     const isClosureDate = shopClosureDates.some(closure => {
//       const closureDate = new Date(closure.date);
//       closureDate.setHours(0, 0, 0, 0);
//       return closureDate.getTime() === today.getTime();
//     });
    
//     if (isClosureDate) return true;
    
//     const now = new Date();
//     const currentTime = now.getHours() * 60 + now.getMinutes();
    
//     const isWithinTimeSlot = timeSlots.some(slot => {
//       if (!slot.startTime || !slot.endTime) return false;
      
//       const parseTime = (timeStr) => {
//         const [time, period] = timeStr.split(' ');
//         let [hours, minutes] = time.split(':').map(Number);
        
//         if (period === 'PM' && hours !== 12) {
//           hours += 12;
//         } else if (period === 'AM' && hours === 12) {
//           hours = 0;
//         }
        
//         return hours * 60 + (minutes || 0);
//       };
      
//       const startMinutes = parseTime(slot.startTime);
//       const endMinutes = parseTime(slot.endTime);
      
//       return currentTime >= startMinutes && currentTime <= endMinutes;
//     });
    
//     return !isWithinTimeSlot;
//   };
  
//   const getTodayClosureReason = () => {
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);
    
//     const closure = shopClosureDates.find(closure => {
//       const closureDate = new Date(closure.date);
//       closureDate.setHours(0, 0, 0, 0);
//       return closureDate.getTime() === today.getTime();
//     });
    
//     if (closure) return closure?.reason || "Parlor Closed Today";
    
//     const now = new Date();
//     const currentTime = now.getHours() * 60 + now.getMinutes();
    
//     if (timeSlots.length > 0) {
//       const parseTime = (timeStr) => {
//         const [time, period] = timeStr.split(' ');
//         let [hours, minutes] = time.split(':').map(Number);
        
//         if (period === 'PM' && hours !== 12) {
//           hours += 12;
//         } else if (period === 'AM' && hours === 12) {
//           hours = 0;
//         }
        
//         return hours * 60 + (minutes || 0);
//       };
      
//       const firstSlot = timeSlots[0];
//       const lastSlot = timeSlots[timeSlots.length - 1];
      
//       if (firstSlot && lastSlot) {
//         const openTime = parseTime(firstSlot.startTime);
//         const closeTime = parseTime(lastSlot.endTime);
        
//         if (currentTime < openTime) {
//           return `Opens at ${firstSlot.startTime}`;
//         } else if (currentTime > closeTime) {
//           return `Closed - Opens tomorrow at ${firstSlot.startTime}`;
//         }
//       }
//     }
    
//     return "Parlor Closed Today";
//   };
  
//   const isParlorClosed = checkIfParlorClosed();
  
//   const scrollToContact = () => {
//     const contactSection = document.getElementById('contact');
//     if (contactSection) {
//       contactSection.scrollIntoView({ behavior: 'smooth' });
//     }
//   };
  
//   return (
//     <div className="fab fab-flower fixed bottom-6 right-6 z-50">
//       <div className="relative">
//         <div className="absolute inset-0 rounded-full border-4 border-green-300 animate-ping opacity-75"></div>
//         <div tabIndex={0} role="button" className="btn btn-lg btn-circle bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 border-none shadow-lg relative z-10 transition-all duration-300">
//           {showText ? (
//             <span className="loading loading-spinner loading-md text-white"></span>
//           ) : (
//             (isParlorClosed ? <AlertCircle className="w-6 h-6 text-white" /> : <CheckCircle className="w-6 h-6 text-white" />)
//           )}
//         </div>
//       </div>

//       <button className="fab-main-action btn btn-circle btn-lg bg-white hover:bg-gray-100 text-green-500 border-none shadow-lg hover:shadow-xl transition-all duration-300">
//         <Sparkles className="w-6 h-6" />
//       </button>

//       <div 
//         className={`tooltip tooltip-top  ${isParlorClosed ? 'tooltip-error' : 'tooltip-success'}`} 
//         data-tip={isParlorClosed ? `Closed : ${getTodayClosureReason()}` : "Parlor Open - Book Now"}
//       >
//         <button 
//           onClick={() => navigate('/home')}
//           className={`btn btn-lg btn-circle bg-white hover:bg-gray-100 border-none shadow-lg hover:shadow-xl transition-all duration-300 ${isParlorClosed ? 'text-red-500' : 'text-green-500'}`}
//         >
//           {isParlorClosed ? <AlertCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
//         </button>
//       </div>

//       <div 
//         className="tooltip tooltip-left" 
//         data-tip="Home Service Available"
//       >
//         <button 
//           onClick={scrollToContact}
//           className="btn btn-lg btn-circle bg-white hover:bg-gray-100 text-purple-500 border-none shadow-lg hover:shadow-xl transition-all duration-300"
//         >
//           <Home className="w-5 h-5" />
//         </button>
//       </div>

//       <div 
//         className="tooltip tooltip-left " 
//         data-tip="Contact Us"
//       >
//         <button 
//           onClick={scrollToContact}
//           className="btn btn-lg btn-circle bg-white hover:bg-gray-100 text-blue-500 border-none shadow-lg hover:shadow-xl transition-all duration-300"
//         >
//           <Phone className="w-5 h-5" />
//         </button>
//       </div>

//       <div 
//         className="tooltip tooltip-left" 
//         data-tip="Book Appointment"
//       >
//         <button 
//           onClick={() => navigate('/cart')}
//           className="btn btn-lg btn-circle bg-white hover:bg-gray-100 text-orange-500 border-none shadow-lg hover:shadow-xl transition-all duration-300"
//         >
//           <Calendar className="w-5 h-5" />
//         </button>
//       </div>
//     </div>
//   );
// });

// FAB.displayName = 'FAB';
// export default FAB;

import { memo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Home, Calendar, Sparkles, Phone, AlertCircle, CheckCircle, Share2 } from 'lucide-react';

const FAB = memo(() => {
  const navigate = useNavigate();
  const { services } = useSelector((state) => state.landingPage);
  const [showText, setShowText] = useState(true);
  const shopClosureDates = services?.[0]?.shopClosureDates || [];
  const timeSlots = services?.[0]?.timeSlots || [];
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowText(false);
    }, 8000);
    
    return () => clearTimeout(timer);
  }, []);
  
  const checkIfParlorClosed = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const isClosureDate = shopClosureDates.some(closure => {
      const closureDate = new Date(closure.date);
      closureDate.setHours(0, 0, 0, 0);
      return closureDate.getTime() === today.getTime();
    });
    
    if (isClosureDate) return true;
    
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const isWithinTimeSlot = timeSlots.some(slot => {
      if (!slot.startTime || !slot.endTime) return false;
      
      const parseTime = (timeStr) => {
        const [time, period] = timeStr.split(' ');
        let [hours, minutes] = time.split(':').map(Number);
        
        if (period === 'PM' && hours !== 12) {
          hours += 12;
        } else if (period === 'AM' && hours === 12) {
          hours = 0;
        }
        
        return hours * 60 + (minutes || 0);
      };
      
      const startMinutes = parseTime(slot.startTime);
      const endMinutes = parseTime(slot.endTime);
      
      return currentTime >= startMinutes && currentTime <= endMinutes;
    });
    
    return !isWithinTimeSlot;
  };
  
  const getTodayClosureReason = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const closure = shopClosureDates.find(closure => {
      const closureDate = new Date(closure.date);
      closureDate.setHours(0, 0, 0, 0);
      return closureDate.getTime() === today.getTime();
    });
    
    if (closure) return closure?.reason || "Parlor Closed Today";
    
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    if (timeSlots.length > 0) {
      const parseTime = (timeStr) => {
        const [time, period] = timeStr.split(' ');
        let [hours, minutes] = time.split(':').map(Number);
        
        if (period === 'PM' && hours !== 12) {
          hours += 12;
        } else if (period === 'AM' && hours === 12) {
          hours = 0;
        }
        
        return hours * 60 + (minutes || 0);
      };
      
      const firstSlot = timeSlots[0];
      const lastSlot = timeSlots[timeSlots.length - 1];
      
      if (firstSlot && lastSlot) {
        const openTime = parseTime(firstSlot.startTime);
        const closeTime = parseTime(lastSlot.endTime);
        
        if (currentTime < openTime) {
          return `Opens at ${firstSlot.startTime}`;
        } else if (currentTime > closeTime) {
          return `Closed - Opens tomorrow at ${firstSlot.startTime}`;
        }
      }
    }
    
    return "Parlor Closed Today";
  };
  
  const isParlorClosed = checkIfParlorClosed();
  
  const scrollToContact = () => {
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToQR = () => {
    const qrSection = document.getElementById('qr-section');
    if (qrSection) {
      qrSection.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  return (
    <div className="fab fab-flower fixed bottom-6 right-6 z-50">
      <div className="relative">
        <div className="absolute inset-0 rounded-full border-4 border-green-300 animate-ping opacity-75"></div>
        <div tabIndex={0} role="button" className="btn btn-lg btn-circle bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 border-none shadow-lg relative z-10 transition-all duration-300">
          {showText ? (
            <span className="loading loading-spinner loading-md text-white"></span>
          ) : (
            (isParlorClosed ? <AlertCircle className="w-6 h-6 text-white" /> : <CheckCircle className="w-6 h-6 text-white" />)
          )}
        </div>
      </div>

      <button className="fab-main-action btn btn-circle btn-lg bg-white hover:bg-gray-100 text-green-500 border-none shadow-lg hover:shadow-xl transition-all duration-300">
        <Sparkles className="w-6 h-6" />
      </button>

      <div 
        className={`tooltip tooltip-top  ${isParlorClosed ? 'tooltip-error' : 'tooltip-success'}`} 
        data-tip={isParlorClosed ? `Closed : ${getTodayClosureReason()}` : "Parlor Open - Book Now"}
      >
        <button 
          onClick={() => navigate('/home')}
          className={`btn btn-lg btn-circle bg-white hover:bg-gray-100 border-none shadow-lg hover:shadow-xl transition-all duration-300 ${isParlorClosed ? 'text-red-500' : 'text-green-500'}`}
        >
          {isParlorClosed ? <AlertCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
        </button>
      </div>

      <div 
        className="tooltip tooltip-left" 
        data-tip="Home Service Available"
      >
        <button 
          onClick={scrollToContact}
          className="btn btn-lg btn-circle bg-white hover:bg-gray-100 text-purple-500 border-none shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <Home className="w-5 h-5" />
        </button>
      </div>

      <div 
        className="tooltip tooltip-left " 
        data-tip="Contact Us"
      >
        <button 
          onClick={scrollToContact}
          className="btn btn-lg btn-circle bg-white hover:bg-gray-100 text-blue-500 border-none shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <Phone className="w-5 h-5" />
        </button>
      </div>

      <div 
        className="tooltip tooltip-left" 
        data-tip="Share QR"
      >
        <button 
          onClick={scrollToQR}
          className="btn btn-lg btn-circle bg-white hover:bg-gray-100 text-orange-500 border-none shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <Share2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
});

FAB.displayName = 'FAB';
export default FAB;