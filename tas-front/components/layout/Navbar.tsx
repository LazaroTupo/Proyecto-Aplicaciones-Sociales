'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Cookies from 'js-cookie';
import { NotificationDropdown } from './NotificationDropdown';
import { authService } from '@/services/authService';

import { usePathname } from 'next/navigation';

export const Navbar = () => {
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setIsAuthenticated(!!Cookies.get('accessToken'));
  }, [pathname]);

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="fixed w-full top-0 z-50 glass-nav"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="text-2xl font-bold text-gradient">
              ImpulsaTec
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/projects" className="text-gray-300 hover:text-white transition-colors duration-200">
              Explorar Proyectos
            </Link>
            <Link href="/how-it-works" className="text-gray-300 hover:text-white transition-colors duration-200">
              Cómo Funciona
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {isClient && isAuthenticated ? (
              <>
                <NotificationDropdown />
                <Link 
                  href="/profile"
                  className="bg-brand-600 hover:bg-brand-500 text-white px-5 py-2 rounded-full font-medium transition-all duration-200 text-sm shadow-[0_0_15px_rgba(109,40,217,0.5)]"
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => authService.logout()}
                  className="text-gray-300 hover:text-red-400 transition-colors duration-200 font-medium text-sm ml-2"
                >
                  Cerrar Sesión
                </button>
              </>
            ) : isClient && !isAuthenticated ? (
              <>
                <Link 
                  href="/auth/login" 
                  className="text-gray-300 hover:text-white transition-colors duration-200 font-medium"
                >
                  Iniciar Sesión
                </Link>
                <Link 
                  href="/auth/register"
                  className="bg-brand-600 hover:bg-brand-500 text-white px-5 py-2.5 rounded-full font-medium transition-all duration-200 shadow-[0_0_15px_rgba(109,40,217,0.5)] hover:shadow-[0_0_25px_rgba(109,40,217,0.8)]"
                >
                  Regístrate
                </Link>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </motion.nav>
  );
};
