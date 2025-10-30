import React from 'react';
import useMobileDetection from '../hooks/useMobileDetection';
import MobileHeader from './MobileOptimized/MobileHeader';
import Header from './layout/Header';

const ResponsiveWrapper = ({ children }) => {
  const { isMobile } = useMobileDetection();

  return (
    <div className="min-h-screen bg-gray-50">
      {isMobile ? <MobileHeader /> : <Header />}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
};

export default ResponsiveWrapper;
