import React, { useEffect, useRef, useState } from 'react';

const ScrollReveal = ({ 
  children, 
  delay = 0, 
  duration = 800, 
  threshold = 0.1,
  type = '3d-flip' // '3d-flip', '3d-slide', 'fade-in', 'tilt'
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Once visible, we can unobserve if we only want it to animate once
          observer.unobserve(entry.target);
        }
      },
      {
        threshold,
        rootMargin: '0px 0px -50px 0px' // Trigger slightly before it fully rolls in
      }
    );

    const currentEl = elementRef.current;
    if (currentEl) {
      observer.observe(currentEl);
    }

    return () => {
      if (currentEl) {
        observer.unobserve(currentEl);
      }
    };
  }, [threshold]);

  // Determine transition styles based on type
  const getInitialStyles = () => {
    const baseTransition = `opacity ${duration}ms cubic-bezier(0.16, 1, 0.3, 1), transform ${duration}ms cubic-bezier(0.16, 1, 0.3, 1)`;
    
    let transform = 'none';
    let opacity = 0;

    if (!isVisible) {
      switch (type) {
        case '3d-flip':
          transform = 'perspective(1200px) rotateX(12deg) translateY(50px) scale(0.97)';
          break;
        case '3d-slide':
          transform = 'perspective(1200px) rotateY(-10deg) translateX(-60px) scale(0.98)';
          break;
        case 'tilt':
          transform = 'perspective(1200px) translateY(40px) rotateX(8deg)';
          break;
        case 'fade-in':
        default:
          transform = 'translateY(20px)';
          break;
      }
    } else {
      transform = 'perspective(1200px) rotateX(0deg) rotateY(0deg) translateY(0px) scale(1)';
      opacity = 1;
    }

    return {
      opacity,
      transform,
      transition: baseTransition,
      transitionDelay: `${delay}ms`,
      transformStyle: 'preserve-3d',
      willChange: 'transform, opacity'
    };
  };

  return (
    <div 
      ref={elementRef} 
      style={getInitialStyles()}
      className="w-full"
    >
      {children}
    </div>
  );
};

export default ScrollReveal;
