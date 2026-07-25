import React, { useState } from "react";
import { Menu, X, Star, Home, Info, Phone, ShoppingCart, Sparkles, Image, LogOut, Calendar, User, ChevronDown, LayoutDashboard, BarChart3 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logoutUser } from '../redux/slices/userSlice';
import toast from 'react-hot-toast';

function Navbar() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { cart } = useSelector((state) => state.cart);
  const { isAuthenticated, loading, user } = useSelector((state) => state.user);

  const handleLinkClick = () => {
    setIsDrawerOpen(false);
    setIsProfileOpen(false);
  };

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      navigate('/');
      setIsDrawerOpen(false);
      setIsProfileOpen(false);
    } catch (error) {
      toast.error('Logout failed. Please try again.');
    }
  };

  const handleProfileClick = () => {
    navigate('/profile');
    setIsProfileOpen(false);
    setIsDrawerOpen(false);
  };

  const handleBookingsClick = () => {
    navigate('/booking-history');
    setIsProfileOpen(false);
    setIsDrawerOpen(false);
  };

  const handleAdminClick = () => {
    navigate('/admin');
    setIsProfileOpen(false);
    setIsDrawerOpen(false);
  };

  if (loading) {
    return null;
  }

  if (!isAuthenticated) {
    return null;
  }

  const isAdmin = user?.role === 'MadhuriShivaKumar';
  const isUser = user?.role === 'user';

  return (
    <>
      <nav className="navbar bg-white  shadow-lg fixed top-0 left-0 right-0 z-40 min-h-20 py-2 ">
        <div className="container mx-auto px-2 sm:px-4">
          <div className="flex items-center justify-between w-full">
          
            <Link to="/home" className="flex flex-col shrink-0" onClick={handleLinkClick}>
              <span className="text-xl sm:text-2xl font-bold text-pink-400 text-center leading-tight">
                MSKR GLAMM STUDIO
              </span>
              <span className="text-[10px] sm:text-sm tracking-[0.2em] sm:tracking-[0.3em] text-[#8c7b73] leading-tight uppercase">
                Professional Makeup Artist
              </span>
            </Link>

            {isUser && (
              <div className="hidden lg:flex items-center gap-6 ml-auto">
                <Link 
                  to="/home" 
                  className="text-gray-700 hover:text-pink-400 transition-colors font-medium relative group whitespace-nowrap"
                >
                  Home
                  <span className="absolute left-1/2 bottom-0 w-0 h-0.5 bg-pink-400 transition-all duration-300 -translate-x-1/2 group-hover:w-full"></span>
                </Link>
                <Link 
                  to="/services" 
                  className="text-gray-700 hover:text-pink-400 transition-colors font-medium relative group whitespace-nowrap"
                >
                  Services
                  <span className="absolute left-1/2 bottom-0 w-0 h-0.5 bg-pink-400 transition-all duration-300 -translate-x-1/2 group-hover:w-full"></span>
                </Link>
                <Link 
                  to="/gallery" 
                  className="text-gray-700 hover:text-pink-400 transition-colors font-medium relative group whitespace-nowrap"
                >
                  Gallery
                  <span className="absolute left-1/2 bottom-0 w-0 h-0.5 bg-pink-400 transition-all duration-300 -translate-x-1/2 group-hover:w-full"></span>
                </Link>
                <Link 
                  to="/about" 
                  className="text-gray-700 hover:text-pink-400 transition-colors font-medium relative group whitespace-nowrap"
                >
                  About
                  <span className="absolute left-1/2 bottom-0 w-0 h-0.5 bg-pink-400 transition-all duration-300 -translate-x-1/2 group-hover:w-full"></span>
                </Link>
                <Link 
                  to="/reviews" 
                  className="text-gray-700 hover:text-pink-400 transition-colors font-medium relative group whitespace-nowrap"
                >
                  Reviews
                  <span className="absolute left-1/2 bottom-0 w-0 h-0.5 bg-pink-400 transition-all duration-300 -translate-x-1/2 group-hover:w-full"></span>
                </Link>
                <Link 
                  to="/contact" 
                  className="text-gray-700 hover:text-pink-400 transition-colors font-medium relative group whitespace-nowrap"
                >
                  Contact
                  <span className="absolute left-1/2 bottom-0 w-0 h-0.5 bg-pink-400 transition-all duration-300 -translate-x-1/2 group-hover:w-full"></span>
                </Link>
                <Link 
                  to="/cart" 
                  className="text-gray-700 hover:text-pink-400 transition-colors font-medium relative group whitespace-nowrap"
                >
                  Cart
                  {cart.length > 0 && (
                    <span className="absolute -top-2 -right-3 bg-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                      {cart.length}
                    </span>
                  )}
                  <span className="absolute left-1/2 bottom-0 w-0 h-0.5 bg-pink-400 transition-all duration-300 -translate-x-1/2 group-hover:w-full"></span>
                </Link>
                
                <div className="relative shrink-0">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-pink-400 transition-colors font-medium"
                  >
                    <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center">
                      {user?.profilePhoto?.url ? (
                        <img 
                          src={user.profilePhoto.url} 
                          alt={user.fullName}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <User className="w-5 h-5 text-pink-500" />
                      )}
                    </div>
                    <span className="hidden xl:inline">{user?.fullName?.split(' ')[0]}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isProfileOpen && (
                    <>
                      <div 
                        className="fixed inset-0 z-40"
                        onClick={() => setIsProfileOpen(false)}
                      />
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-100 py-2 z-50">
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="text-sm font-medium text-gray-900">{user?.fullName}</p>
                          <p className="text-xs text-gray-500 mt-1">{user?.emailId}</p>
                        </div>
                        
                        <button
                          onClick={handleProfileClick}
                          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-600 transition-colors"
                        >
                          <User className="w-4 h-4" />
                          My Profile
                        </button>
                        
                        <button
                          onClick={handleBookingsClick}
                          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-600 transition-colors"
                        >
                          <Calendar className="w-4 h-4" />
                          My Bookings
                        </button>
                        
                        <div className="border-t border-gray-100 my-1"></div>
                        
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Logout
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {isAdmin && (
              <div className="hidden lg:flex items-center gap-6 ml-auto">
                <Link 
                  to="/admin" 
                  className="text-gray-700 hover:text-purple-600 transition-colors font-medium relative group whitespace-nowrap"
                >
                  Dashboard
                  <span className="absolute left-1/2 bottom-0 w-0 h-0.5 bg-purple-600 transition-all duration-300 -translate-x-1/2 group-hover:w-full"></span>
                </Link>
                <Link 
                  to="/admin/analytics" 
                  className="text-gray-700 hover:text-purple-600 transition-colors font-medium relative group whitespace-nowrap"
                >
                  Analytics
                  <span className="absolute left-1/2 bottom-0 w-0 h-0.5 bg-purple-600 transition-all duration-300 -translate-x-1/2 group-hover:w-full"></span>
                </Link>
                
                <div className="relative shrink-0">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-purple-600 transition-colors font-medium"
                  >
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                      {user?.profilePhoto?.url ? (
                        <img 
                          src={user.profilePhoto.url} 
                          alt={user.fullName}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <User className="w-5 h-5 text-purple-500" />
                      )}
                    </div>
                    <span className="hidden xl:inline">{user?.fullName?.split(' ')[0]}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isProfileOpen && (
                    <>
                      <div 
                        className="fixed inset-0 z-40"
                        onClick={() => setIsProfileOpen(false)}
                      />
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-100 py-2 z-50">
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="text-sm font-medium text-gray-900">{user?.fullName}</p>
                          <p className="text-xs text-gray-500 mt-1">{user?.emailId}</p>
                        </div>
                        
                        <button
                          onClick={handleProfileClick}
                          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors"
                        >
                          <User className="w-4 h-4" />
                          My Profile
                        </button>
                        
                        <div className="border-t border-gray-100 my-1"></div>
                        
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Logout
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            <div className="flex items-center gap-1 sm:gap-2 lg:hidden">
              <button
                onClick={() => setIsDrawerOpen(!isDrawerOpen)}
                className="btn btn-circle btn-ghost btn-sm sm:btn-md text-gray-700 hover:text-pink-400"
                aria-label="Toggle menu"
              >
                {isDrawerOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div
        className={`
          fixed top-0 right-0 h-full w-64 bg-white shadow-xl z-50
          transform transition-transform duration-300 ease-in-out lg:hidden
          ${isDrawerOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
          <span className="text-lg font-bold text-gray-800">Menu</span>
          <button
            onClick={() => setIsDrawerOpen(false)}
            className="btn btn-circle btn-ghost btn-sm text-gray-700 hover:text-pink-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto h-[calc(100%-57px)]">
          <div className="p-4 border-b border-gray-200 bg-pink-50 sticky top-0">
            <div className="flex items-center gap-3">
              <div>
                <p className="text-sm font-medium text-gray-900">{user?.fullName}</p>
                <p className="text-xs text-gray-600">{user?.emailId}</p>
              </div>
            </div>
          </div>

          <div className="p-4 pb-20">
            <ul className="w-full gap-2">
              {isAdmin && (
                <>
                  <li className="mb-2">
                    <Link
                      to="/admin"
                      className="flex items-center gap-3 bg-purple-50 text-purple-600 hover:bg-purple-100 p-3 rounded-lg transition-colors"
                      onClick={handleLinkClick}
                    >
                      <LayoutDashboard className="w-5 h-5" />
                      Admin Panel
                    </Link>
                  </li>
                  
                  <li className="mb-2">
                    <Link
                      to="/admin/analytics"
                      className="flex items-center gap-3 bg-purple-50 text-purple-600 hover:bg-purple-100 p-3 rounded-lg transition-colors"
                      onClick={handleLinkClick}
                    >
                      <BarChart3 className="w-5 h-5" />
                      Analytics
                    </Link>
                  </li>
                </>
              )}
              
              {isUser && (
                <>
                  <li className="mb-2">
                    <Link
                      to="/home"
                      className="flex items-center gap-3 bg-purple-50 text-gray-700 hover:bg-pink-100 hover:text-pink-600 p-3 rounded-lg transition-colors"
                      onClick={handleLinkClick}
                    >
                      <Home className="w-5 h-5" />
                      Home
                    </Link>
                  </li>
                  <li className="mb-2">
                    <Link
                      to="/services"
                      className="flex items-center gap-3 bg-purple-50 text-gray-700 hover:bg-pink-100 hover:text-pink-600 p-3 rounded-lg transition-colors"
                      onClick={handleLinkClick}
                    >
                      <Sparkles className="w-5 h-5" />
                      Services
                    </Link>
                  </li>
                  <li className="mb-2">
                    <Link
                      to="/gallery"
                      className="flex items-center gap-3 bg-purple-50 text-gray-700 hover:bg-pink-100 hover:text-pink-600 p-3 rounded-lg transition-colors"
                      onClick={handleLinkClick}
                    >
                      <Image className="w-5 h-5" />
                      Gallery
                    </Link>
                  </li>
                  <li className="mb-2">
                    <Link
                      to="/about"
                      className="flex items-center gap-3 bg-purple-50 text-gray-700 hover:bg-pink-100 hover:text-pink-600 p-3 rounded-lg transition-colors"
                      onClick={handleLinkClick}
                    >
                      <Info className="w-5 h-5" />
                      About
                    </Link>
                  </li>  
                  <li className="mb-2">
                    <Link
                      to="/reviews"
                      className="flex items-center gap-3 bg-purple-50 text-gray-700 hover:bg-pink-100 hover:text-pink-600 p-3 rounded-lg transition-colors"
                      onClick={handleLinkClick}
                    >
                      <Star className="w-5 h-5" />
                      Reviews
                    </Link>
                  </li>
                  <li className="mb-2">
                    <Link
                      to="/contact"
                      className="flex items-center gap-3 bg-purple-50 text-gray-700 hover:bg-pink-100 hover:text-pink-600 p-3 rounded-lg transition-colors"
                      onClick={handleLinkClick}
                    >
                      <Phone className="w-5 h-5" />
                      Contact
                    </Link>
                  </li>
                  <li className="mb-2">
                    <Link
                      to="/cart"
                      className="flex items-center justify-between bg-purple-50 text-gray-700 hover:bg-pink-100 hover:text-pink-600 p-3 rounded-lg transition-colors"
                      onClick={handleLinkClick}
                    >
                      <div className="flex items-center gap-3">
                        <ShoppingCart className="w-5 h-5" />
                        <span>Cart</span>
                      </div>
                      {cart.length > 0 && (
                        <span className="bg-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {cart.length}
                        </span>
                      )}
                    </Link>
                  </li>
                  <li className="mb-2">
                    <Link
                      to="/booking-history"
                      className="flex items-center gap-3 bg-purple-50 text-gray-700 hover:bg-pink-100 hover:text-pink-600 p-3 rounded-lg transition-colors"
                      onClick={handleLinkClick}
                    >
                      <Calendar className="w-5 h-5" />
                      My Bookings
                    </Link>
                  </li>
                </>
              )}
              
              <li className="mb-2">
                <Link
                  to="/profile"
                  className="flex items-center gap-3 bg-purple-50 text-gray-700 hover:bg-pink-100 hover:text-pink-600 p-3 rounded-lg transition-colors"
                  onClick={handleLinkClick}
                >
                  <User className="w-5 h-5" />
                  My Profile
                </Link>
              </li>
              
              <li className="mt-4 pt-4 border-t border-gray-200">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 bg-red-50 text-red-600 hover:bg-red-100 w-full p-3 rounded-lg transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  Logout
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {isDrawerOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsDrawerOpen(false)}
        />
      )}

      {isUser && (
        
        <div className="btm-nav lg:hidden fixed bottom-0 left-0 right-0 z-40 h-16 bg-white border-t border-gray-200 flex flex-row items-center justify-around px-2">
          <Link 
            to="/home" 
            className="flex flex-col items-center justify-center flex-1 text-gray-700 hover:text-pink-400 active:text-pink-400 transition-all duration-300 "
            onClick={handleLinkClick}
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px] mt-1">Home</span>
          </Link>
          
          <Link 
            to="/services" 
            className="flex flex-col items-center justify-center flex-1 text-gray-700 hover:text-pink-400 active:text-pink-400 transition-all duration-300 "
            onClick={handleLinkClick}
          >
            <Sparkles className="w-5 h-5" />
            <span className="text-[10px] mt-1">Services</span>
          </Link>
          
          <Link 
            to="/cart" 
            className="flex flex-col items-center justify-center flex-1 text-gray-700 hover:text-pink-400 active:text-pink-400 transition-all duration-300"
            onClick={handleLinkClick}
          >
            <ShoppingCart className="w-5 h-5" />
            <span className="text-[10px] mt-1">Cart</span>
            
          </Link>
        </div>
      )}

      <div className="sm:h-20" />
      <div className="block sm:hidden h-16" />
    </>
  );
}

export default Navbar;