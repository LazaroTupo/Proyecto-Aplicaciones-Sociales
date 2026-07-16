'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, CheckCircle2 } from 'lucide-react';
import { useNotificationsStore } from '@/hooks/useNotificationsStore';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';

export const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();
  
  const { 
    notifications, 
    unreadCount, 
    initializeSocket, 
    fetchNotifications, 
    markAsRead, 
    markAllAsRead 
  } = useNotificationsStore();

  const isAuthenticated = !!Cookies.get('accessToken');

  useEffect(() => {
    setIsClient(true);
    if (isAuthenticated) {
      initializeSocket();
      fetchNotifications();
    }
  }, [isAuthenticated, initializeSocket, fetchNotifications]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isClient || !isAuthenticated) return null;

  const handleNotificationClick = (notification: any) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    setIsOpen(false);
    
    if (notification.type === 'new_pledge') {
      router.push('/profile');
    } else if (notification.type === 'project_status') {
      router.push('/profile');
    } else {
      router.push('/profile');
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-300 hover:text-white transition-colors focus:outline-none rounded-full hover:bg-white/5 cursor-pointer"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-red-500 rounded-full border border-[#0f172a]"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.div>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl glass-panel border border-white/10 shadow-2xl overflow-hidden z-50 bg-zinc-900/95 backdrop-blur-2xl"
          >
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
              <h3 className="font-semibold text-white">Notificaciones</h3>
              {unreadCount > 0 && (
                <button 
                  onClick={() => markAllAsRead()}
                  className="text-xs text-brand-400 hover:text-brand-300 transition-colors flex items-center gap-1"
                >
                  <CheckCircle2 className="w-3 h-3" />
                  Marcar todo leído
                </button>
              )}
            </div>
            
            <div className="max-h-[400px] overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-white/20">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-400">
                  <Bell className="w-10 h-10 mx-auto mb-3 opacity-20" />
                  <p className="text-sm">No tienes notificaciones</p>
                </div>
              ) : (
                <div className="flex flex-col">
                  {notifications.map((notification) => (
                    <motion.div 
                      key={notification.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`p-4 border-b border-white/5 cursor-pointer hover:bg-white/5 transition-colors flex gap-3 ${
                        !notification.isRead ? 'bg-brand-500/10' : ''
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex-shrink-0 mt-1">
                        {!notification.isRead ? (
                          <div className="w-2 h-2 rounded-full bg-brand-500 shadow-[0_0_8px_rgba(109,40,217,0.8)]" />
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-transparent" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm ${!notification.isRead ? 'text-white font-medium' : 'text-gray-300'}`}>
                          {notification.message}
                        </p>
                        <span className="text-xs text-gray-500 mt-1 block">
                          {new Date(notification.createdAt).toLocaleDateString('es-ES', { 
                            hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short'
                          })}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="p-3 border-t border-white/10 text-center bg-black/20 hover:bg-black/40 transition-colors cursor-pointer">
              <span className="text-xs text-brand-400 font-medium">Ver historial completo</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
