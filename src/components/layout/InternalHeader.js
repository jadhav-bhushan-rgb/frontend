import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import NotificationCenter from '../NotificationCenter';
import { 
  Bars3Icon, 
  XMarkIcon, 
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  ClipboardDocumentListIcon,
  ShoppingCartIcon,
  BuildingOfficeIcon,
  PhoneIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';

const InternalHeader = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Role-based navigation
  const getRoleBasedNavigation = () => {
    if (!user) return [];

    const baseNavigation = [
      { name: 'Profile', href: '/profile', icon: UserCircleIcon },
      { name: 'Sign out', href: '#', icon: ArrowRightOnRectangleIcon, action: logout },
    ];

    if (user.role === 'admin') {
      return [
        { name: 'Admin Dashboard', href: '/admin/dashboard', icon: Cog6ToothIcon },
        { name: 'Order Management', href: '/admin/orders', icon: ClipboardDocumentListIcon },
        { name: 'All Inquiries', href: '/inquiries', icon: ClipboardDocumentListIcon },
        ...baseNavigation
      ];
    } else if (user.role === 'backoffice') {
      return [
        { name: 'Back Office Dashboard', href: '/admin/dashboard', icon: BuildingOfficeIcon },
        { name: 'Order Management', href: '/admin/orders', icon: ClipboardDocumentListIcon },
        { name: 'All Inquiries', href: '/inquiries', icon: ClipboardDocumentListIcon },
        ...baseNavigation
      ];
    } else if (user.role === 'subadmin') {
      return [
        { name: 'Sub Admin Dashboard', href: '/admin/dashboard', icon: Cog6ToothIcon },
        { name: 'All Inquiries', href: '/inquiries', icon: ClipboardDocumentListIcon },
        ...baseNavigation
      ];
    } else {
      // Customer navigation
      return [
        { name: 'Dashboard', href: '/dashboard', icon: Cog6ToothIcon },
        { name: 'New Inquiry', href: '/inquiry/new', icon: ClipboardDocumentListIcon },
        { name: 'My Inquiries', href: '/inquiries', icon: ClipboardDocumentListIcon },
        { name: 'My Orders', href: '/orders', icon: ShoppingCartIcon },
        ...baseNavigation
      ];
    }
  };

  const userNavigation = getRoleBasedNavigation();

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate('/');
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="w-full">
        {/* Top Bar - Contact Info & Social */}
        <div className="hidden lg:flex items-center justify-between py-3 bg-blue-900 text-white text-sm px-4 sm:px-6 lg:px-8">
         
        </div>

        {/* Main Navigation Bar */}
        <div className="flex items-center justify-between h-20 px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center">
              <img 
                src="https://www.247cutbend.in/assets/img/logo%20(2).png" 
                alt="247CUTBEND Logo" 
                className="h-16 w-auto mr-3"
              />
            </Link>
          </div>

          
          <div className="flex items-center space-x-4">
            {/* Notification Center */}
            <NotificationCenter />
            
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center space-x-3 text-sm font-medium text-gray-700 hover:text-blue-600 focus:outline-none rounded-lg px-3 py-2 border-2 border-solid bg-white  transition-all duration-200"
              >
                <UserCircleIcon className="h-5 w-5 text-gray-600" />
                <div className="flex flex-col items-start">
                  <span className="font-semibold">{user?.firstName} {user?.lastName}</span>
                  <span className="text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full font-medium">
                    {user?.role === 'admin' ? 'Admin' : user?.role === 'backoffice' ? 'Back Office' : user?.role === 'subadmin' ? 'Sub Admin' : 'Customer'}
                  </span>
                </div>
              </button>

              {userMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl py-2 z-50 border border-gray-200"
                  onMouseLeave={() => setUserMenuOpen(false)}
                >
                  {userNavigation.map((item) => (
                    <div key={item.name}>
                      {item.action ? (
                        <button
                          onClick={handleLogout}
                          className="flex w-full items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                        >
                          <item.icon className="mr-3 h-5 w-5 text-gray-500" />
                          {item.name}
                        </button>
                      ) : (
                        <Link
                          to={item.href}
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                        >
                          <item.icon className="mr-3 h-5 w-5 text-gray-500" />
                          {item.name}
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Mobile menu button */}
            <button
              type="button"
              className="lg:hidden -mr-2 inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              onClick={() => setMobileMenuOpen(true)}
            >
              <span className="sr-only">Open main menu</span>
              <Bars3Icon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {mobileMenuOpen && (
        <div className="lg:hidden">
          <div className="fixed inset-0 z-40 bg-black bg-opacity-25" onClick={() => setMobileMenuOpen(false)}></div>
          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-xs bg-white shadow-xl overflow-y-auto">
            <div className="px-3 pt-2 pb-2">
              <div className="flex items-center justify-between">
                <Link to="/" className="flex items-center" onClick={() => setMobileMenuOpen(false)}>
                  <img 
                    src="https://www.247cutbend.in/assets/img/logo%20(2).png" 
                    alt="247CUTBEND Logo" 
                    className="h-10 w-auto mr-2"
                  />
                </Link>
                <button
                  type="button"
                  className="-mr-2 inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="sr-only">Close menu</span>
                  <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>
              <div className="mt-6">
                <nav className="grid gap-y-8">
                  {userNavigation.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="-m-3 p-3 flex items-center rounded-md hover:bg-gray-50 transition-colors"
                    >
                      <item.icon className="mr-3 h-5 w-5" />
                      <span className="ml-3 text-base font-medium text-gray-900">{item.name}</span>
                    </Link>
                  ))}
                </nav>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default InternalHeader;
