'use client';

import { HTMLMotionProps, motion } from 'framer-motion';
import { ReactNode } from 'react';
import { Spinner } from './Spinner';

interface ButtonProps extends HTMLMotionProps<"button"> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = 'relative inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed rounded-xl overflow-hidden';
  
  const variants = {
    primary: 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-500 hover:to-indigo-500 border border-white/10 shadow-[0_0_15px_rgba(124,58,237,0.3)]',
    secondary: 'bg-white/10 text-white hover:bg-white/20 backdrop-blur-md border border-white/5',
    outline: 'bg-transparent text-white border border-white/20 hover:bg-white/5',
    ghost: 'bg-transparent text-gray-300 hover:text-white hover:bg-white/5',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <motion.button
      whileHover={{ scale: disabled || isLoading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {/* Shine effect on hover for primary */}
      {variant === 'primary' && !disabled && !isLoading && (
        <motion.div
          className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
          whileHover={{ translateX: '200%' }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
        />
      )}
      
      <span className="flex items-center gap-2 relative z-10">
        {isLoading && <Spinner size={size === 'lg' ? 'md' : 'sm'} />}
        <span className={isLoading ? 'opacity-80' : ''}>{children}</span>
      </span>
    </motion.button>
  );
}
