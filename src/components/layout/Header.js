import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  Bars3Icon,
  XMarkIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
} from '@heroicons/react/24/outline';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-white shadow-lg fixed w-full top-0 z-50">
      {/* Top Bar */}
      <div className="bg-blue-900 text-white py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link to="/" className="flex items-center">
              <img 
                src="https://www.247cutbend.in/assets/img/logo%20(2).png" 
                alt="247CUTBEND Logo" 
                className="h-20 w-auto mr-3"
              />
              </Link>
            </div>

            {/* User Icon and Login Button */}
            <div className="flex items-center space-x-4">
              {/* User Icon on Left */}
              {/* <div className="flex items-center space-x-2">
                <UserIcon className="h-6 w-6 text-gray-600" />
                <span className="text-sm text-gray-700">User</span>
              </div> */}
              
              {/* Login Button on Right */}
              <Link
                to="/signup"
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded text-sm font-medium transition-colors flex items-center space-x-1"
              >
                <span>Login</span>
                
              </Link>
            </div>
          </div>
        </div>

      </nav>
    </header>
  );
};

export default Header;
