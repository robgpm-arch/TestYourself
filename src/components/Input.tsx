import React, { forwardRef, ReactNode } from 'react';
import { motion } from 'framer-motion';

interface InputProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  error?: boolean;
  errorMessage?: string;
  label?: string;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  className?: string;
  name?: string;
  id?: string;
  required?: boolean;
  autoComplete?: string;
  autoFocus?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      type = 'text',
      placeholder,
      value,
      defaultValue,
      onChange,
      onFocus,
      onBlur,
      disabled = false,
      error = false,
      errorMessage,
      label,
      icon,
      iconPosition = 'left',
      size = 'medium',
      fullWidth = true,
      className = '',
      name,
      id,
      required = false,
      autoComplete,
      autoFocus = false,
    },
    ref
  ) => {
    const getSizeClasses = () => {
      switch (size) {
        case 'small':
          return 'px-3 py-2 text-sm';
        case 'large':
          return 'px-4 py-4 text-lg';
        default:
          return 'px-4 py-3 text-base';
      }
    };

    const getStateClasses = () => {
      if (error) {
        return 'border-red-300 focus:border-red-500 focus:ring-red-500';
      }
      return 'border-gray-300 focus:border-blue-500 focus:ring-blue-500';
    };

    const inputClasses = `
    ${fullWidth ? 'w-full' : ''}
    ${getSizeClasses()}
    ${getStateClasses()}
    bg-white border rounded-lg
    focus:outline-none focus:ring-2 focus:ring-opacity-50
    disabled:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50
    transition-colors duration-200
    ${icon && iconPosition === 'left' ? 'pl-10' : ''}
    ${icon && iconPosition === 'right' ? 'pr-10' : ''}
    ${className}
  `;

    return (
      <div className={`${fullWidth ? 'w-full' : ''}`}>
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-2">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          {icon && (
            <div
              className={`absolute inset-y-0 ${iconPosition === 'left' ? 'left-0 pl-3' : 'right-0 pr-3'} flex items-center pointer-events-none`}
            >
              <span className="text-gray-400">{icon}</span>
            </div>
          )}

          <motion.input
            ref={ref}
            type={type}
            id={id}
            name={name}
            value={value}
            defaultValue={defaultValue}
            placeholder={placeholder}
            onChange={onChange}
            onFocus={onFocus}
            onBlur={onBlur}
            disabled={disabled}
            required={required}
            autoComplete={autoComplete}
            autoFocus={autoFocus}
            className={inputClasses}
            whileFocus={{ scale: 1.01 }}
            transition={{ duration: 0.1 }}
          />
        </div>

        {error && errorMessage && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 text-sm text-red-600"
          >
            {errorMessage}
          </motion.p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
