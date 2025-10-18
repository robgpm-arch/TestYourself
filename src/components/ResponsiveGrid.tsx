import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface ResponsiveGridProps {
  children: ReactNode;
  cols?: {
    default?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: number;
  className?: string;
}

const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({ 
  children, 
  cols = { default: 1, sm: 2, md: 2, lg: 3, xl: 4 },
  gap = 6,
  className = ''
}) => {
  const getGridClasses = () => {
    const { default: defaultCols, sm, md, lg, xl } = cols;
    let classes = `grid gap-${gap}`;
    
    if (defaultCols) classes += ` grid-cols-${defaultCols}`;
    if (sm) classes += ` sm:grid-cols-${sm}`;
    if (md) classes += ` md:grid-cols-${md}`;
    if (lg) classes += ` lg:grid-cols-${lg}`;
    if (xl) classes += ` xl:grid-cols-${xl}`;
    
    return classes;
  };

  return (
    <div className={`${getGridClasses()} ${className}`}>
      {React.Children.map(children, (child, index) => (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          className="w-full"
        >
          {child}
        </motion.div>
      ))}
    </div>
  );
};

export default ResponsiveGrid;