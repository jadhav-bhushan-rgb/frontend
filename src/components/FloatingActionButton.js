import React, { useState } from 'react';
import { PlusIcon, XMarkIcon, ChatBubbleLeftRightIcon, PhoneIcon, EnvelopeIcon } from '@heroicons/react/24/outline';

const FloatingActionButton = ({ 
  mainIcon = PlusIcon,
  actions = [],
  position = 'bottom-right',
  className = '',
  size = 'large'
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const getPositionClasses = (pos) => {
    const positions = {
      'bottom-right': 'bottom-6 right-6',
      'bottom-left': 'bottom-6 left-6',
      'top-right': 'top-6 right-6',
      'top-left': 'top-6 left-6',
      'center-right': 'top-1/2 right-6 transform -translate-y-1/2',
      'center-left': 'top-1/2 left-6 transform -translate-y-1/2'
    };
    return positions[pos] || positions['bottom-right'];
  };

  const getSizeClasses = (size) => {
    const sizes = {
      'small': 'w-12 h-12',
      'medium': 'w-14 h-14',
      'large': 'w-16 h-16'
    };
    return sizes[size] || sizes['large'];
  };

  const getIconSize = (size) => {
    const sizes = {
      'small': 'h-5 w-5',
      'medium': 'h-6 w-6',
      'large': 'h-7 w-7'
    };
    return sizes[size] || sizes['large'];
  };

  const defaultActions = [
    {
      icon: ChatBubbleLeftRightIcon,
      label: 'Live Chat',
      action: () => console.log('Live Chat clicked'),
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: PhoneIcon,
      label: 'Call Us',
      action: () => window.open('tel:+15551234567'),
      color: 'from-green-500 to-green-600'
    },
    {
      icon: EnvelopeIcon,
      label: 'Email',
      action: () => window.open('mailto:info@komacut.com'),
      color: 'from-purple-500 to-purple-600'
    }
  ];

  const actionsToShow = actions.length > 0 ? actions : defaultActions;

  return (
    <div className={`fixed ${getPositionClasses(position)} z-50 ${className}`}>
      {/* Action Menu Items */}
      <div className={`absolute bottom-full right-0 mb-4 space-y-3 transition-all duration-300 ease-in-out ${
        isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}>
        {actionsToShow.map((action, index) => (
          <div
            key={action.label}
            className={`flex items-center space-x-3 transform transition-all duration-300 ${
              isOpen ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'
            }`}
            style={{ transitionDelay: `${index * 100}ms` }}
          >
            {/* Action Label */}
            <div className="bg-white px-3 py-2 rounded-lg shadow-lg text-sm font-medium text-gray-700 whitespace-nowrap">
              {action.label}
            </div>
            
            {/* Action Button */}
            <button
              onClick={action.action}
              className={`${getSizeClasses('small')} bg-gradient-to-r ${action.color} rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-transparent`}
              aria-label={action.label}
            >
              <action.icon className={`h-5 w-5 text-white mx-auto`} />
            </button>
          </div>
        ))}
      </div>

      {/* Main FAB Button */}
      <button
        onClick={toggleMenu}
        className={`${getSizeClasses(size)} bg-gradient-to-r from-komacut-600 to-komacut-700 rounded-full shadow-2xl hover:shadow-komacut-500/25 transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-transparent group`}
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
      >
        <div className={`transition-transform duration-300 ${isOpen ? 'rotate-45' : 'rotate-0'}`}>
          {isOpen ? (
            <XMarkIcon className={`${getIconSize(size)} text-white mx-auto`} />
          ) : (
            <mainIcon className={`${getIconSize(size)} text-white mx-auto`} />
          )}
        </div>
        
        {/* Ripple Effect */}
        <div className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
      </button>

      {/* Background Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default FloatingActionButton;
