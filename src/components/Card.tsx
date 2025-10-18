import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'outlined' | 'gradient';
  padding?: 'none' | 'small' | 'medium' | 'large';
  rounded?: 'none' | 'small' | 'medium' | 'large' | 'full';
  onClick?: () => void;
  hover?: boolean;
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  variant = 'default',
  padding = 'medium',
  rounded = 'medium',
  onClick,
  hover = true,
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'elevated':
        return 'bg-white shadow-lg border border-gray-100';
      case 'outlined':
        return 'bg-white border-2 border-gray-200';
      case 'gradient':
        return 'bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-200';
      default:
        return 'bg-white shadow-sm border border-gray-200';
    }
  };

  const getPaddingClasses = () => {
    switch (padding) {
      case 'none':
        return '';
      case 'small':
        return 'p-3';
      case 'large':
        return 'p-8';
      default:
        return 'p-6';
    }
  };

  const getRoundedClasses = () => {
    switch (rounded) {
      case 'none':
        return '';
      case 'small':
        return 'rounded-md';
      case 'large':
        return 'rounded-2xl';
      case 'full':
        return 'rounded-full';
      default:
        return 'rounded-xl';
    }
  };

  const cardClasses = `
    ${getVariantClasses()}
    ${getPaddingClasses()}
    ${getRoundedClasses()}
    ${onClick ? 'cursor-pointer' : ''}
    ${className}
  `;

  const hoverEffects = hover
    ? {
        whileHover: { scale: 1.02, y: -2 },
        whileTap: { scale: 0.98 },
      }
    : {};

  return (
    <motion.div
      className={cardClasses}
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      {...hoverEffects}
    >
      {children}
    </motion.div>
  );
};

export default Card;
