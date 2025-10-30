import { useState, useEffect } from 'react';

const useMobileDetection = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [screenSize, setScreenSize] = useState('desktop');
console.log("HHHH")
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      
      if (width < 640) {
        setIsMobile(true);
        setIsTablet(false);
        setScreenSize('mobile');
      } else if (width < 1024) {
        setIsMobile(false);
        setIsTablet(true);
        setScreenSize('tablet');
      } else {
        setIsMobile(false);
        setIsTablet(false);
        setScreenSize('desktop');
      }
    };

    // Check on mount
    checkScreenSize();

    // Add event listener
    window.addEventListener('resize', checkScreenSize);

    // Cleanup
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  return {
    isMobile,
    isTablet,
    screenSize,
    isMobileOrTablet: isMobile || isTablet
  };
};

export default useMobileDetection;
