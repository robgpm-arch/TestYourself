import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  className = '',
  type = 'button',
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'secondary':
        return 'bg-gray-100 text-gray-900 hover:bg-gray-200 border border-gray-300';
      case 'outline':
        return 'bg-transparent text-blue-600 border-2 border-blue-600 hover:bg-blue-50';
      case 'ghost':
        return 'bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900';
      case 'danger':
        return 'bg-red-600 text-white hover:bg-red-700 border border-red-600';
      default:
        return 'bg-blue-600 text-white hover:bg-blue-700 border border-blue-600';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'px-3 py-2 text-sm';
      case 'large':
        return 'px-8 py-4 text-lg';
      default:
        return 'px-6 py-3 text-base';
    }
  };

  const baseClasses = `
    inline-flex items-center justify-center
    font-medium rounded-lg
    transition-colors duration-200
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    ${fullWidth ? 'w-full' : ''}
    ${getVariantClasses()}
    ${getSizeClasses()}
    ${className}
  `;

  const buttonContent = (
    <>
      {loading ? (
        <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
      ) : (
        <>
          {icon && iconPosition === 'left' && <span className="mr-2">{icon}</span>}
          {children}
          {icon && iconPosition === 'right' && <span className="ml-2">{icon}</span>}
        </>
      )}
    </>
  );

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={baseClasses}
      whileHover={!(disabled || loading) ? { scale: 1.02 } : {}}
      whileTap={!(disabled || loading) ? { scale: 0.98 } : {}}
      transition={{ duration: 0.1 }}
    >
      {buttonContent}
    </motion.button>
  );
};

export default Button;
