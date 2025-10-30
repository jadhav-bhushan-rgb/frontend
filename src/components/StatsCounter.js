import React, { useState, useEffect, useRef } from 'react';
import { useInView } from 'react-intersection-observer';

const StatsCounter = ({ 
  number, 
  label, 
  icon: Icon, 
  suffix = '', 
  prefix = '', 
  duration = 2000,
  className = '',
  color = 'komacut'
}) => {
  const [count, setCount] = useState(0);
  const [isCounting, setIsCounting] = useState(false);
  const { ref, inView } = useInView({
    threshold: 0.5,
    triggerOnce: true
  });

  useEffect(() => {
    if (inView && !isCounting) {
      setIsCounting(true);
      animateCount();
    }
  }, [inView, isCounting]);

  const animateCount = () => {
    const startTime = Date.now();
    const startValue = 0;
    const endValue = parseFloat(number.toString().replace(/[^\d.]/g, ''));
    
    const timer = setInterval(() => {
      const currentTime = Date.now();
      const elapsed = currentTime - startTime;
      
      if (elapsed >= duration) {
        setCount(endValue);
        setIsCounting(false);
        clearInterval(timer);
      } else {
        const progress = elapsed / duration;
        const currentCount = startValue + (endValue - startValue) * easeOutQuart(progress);
        setCount(currentCount);
      }
    }, 16); // 60fps

    return () => clearInterval(timer);
  };

  const easeOutQuart = (t) => {
    return 1 - Math.pow(1 - t, 4);
  };

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return Math.floor(num).toString();
  };

  const getColorClasses = (colorName) => {
    const colorMap = {
      komacut: 'from-komacut-500 to-komacut-600',
      blue: 'from-blue-500 to-blue-600',
      green: 'from-green-500 to-green-600',
      purple: 'from-purple-500 to-purple-600',
      red: 'from-red-500 to-red-600',
      yellow: 'from-yellow-500 to-yellow-600',
      indigo: 'from-indigo-500 to-indigo-600',
      pink: 'from-pink-500 to-pink-600'
    };
    return colorMap[colorName] || colorMap.komacut;
  };

  return (
    <div 
      ref={ref}
      className={`text-center transform transition-all duration-1000 ${
        inView ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
      } ${className}`}
    >
      {/* Icon Container */}
      <div className="flex justify-center mb-4">
        <div className={`p-4 bg-gradient-to-r ${getColorClasses(color)} rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 group`}>
          <Icon className="h-8 w-8 text-white" />
        </div>
      </div>
      
      {/* Number Display */}
      <div className="mb-2">
        <span className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
          {prefix}{formatNumber(count)}{suffix}
        </span>
      </div>
      
      {/* Label */}
      <div className="text-sm text-gray-600 font-medium">
        {label}
      </div>
      
      {/* Animated Underline */}
      <div className="mt-3 flex justify-center">
        <div className={`w-16 h-1 bg-gradient-to-r ${getColorClasses(color)} rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-center`} />
      </div>
    </div>
  );
};

// Stats Grid Component
export const StatsGrid = ({ stats, className = '' }) => {
  return (
    <div className={`grid grid-cols-2 md:grid-cols-4 gap-8 ${className}`}>
      {stats.map((stat, index) => (
        <StatsCounter
          key={stat.label}
          number={stat.number}
          label={stat.label}
          icon={stat.icon}
          suffix={stat.suffix}
          prefix={stat.prefix}
          duration={stat.duration || 2000}
          color={stat.color || 'komacut'}
          className="transform transition-all duration-1000"
          style={{ transitionDelay: `${index * 200}ms` }}
        />
      ))}
    </div>
  );
};

export default StatsCounter;
