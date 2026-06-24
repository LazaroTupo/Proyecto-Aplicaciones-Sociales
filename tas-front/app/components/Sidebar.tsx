'use client';

import React, { useEffect, useState } from 'react';
import { BrainCircuit, LayoutGrid, PlusCircle, Wallet, Sparkles, ChartColumnIncreasing, SquareChartGantt, Bell, LogOut } from 'lucide-react';
import ProjectForm from './ProjectForm';
import CreateProject from './CreateProject';
import { useAuthStore } from '../store/auth.store';
import { useRouter } from 'next/navigation';

export default function Sidebar() {
  const [pathname, setPathname] = useState('/');
  const [openCreate, setOpenCreate] = useState(false)
  const { logout, user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPathname(window.location.pathname);
    }
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const navItems = [
    {
      label: 'Inicio',
      href: '/dashboard',
      icon: LayoutGrid,
    },
    {
      label: 'Registrar Proyecto',
      href: '/projects/new',
      icon: PlusCircle,
    },
    {
      label: 'Analytics',
      href: '/analytics',
      icon: ChartColumnIncreasing,
    },
    {
      label: 'Mis proyectos',
      href: '/projects',
      icon: SquareChartGantt,
    },
    {
      label: 'Notificaciones',
      href: '/notifications',
      icon: Bell,
    },
    // {
    //   label: 'Registrar Aporte',
    //   href: '/contributions/new',
    //   icon: Wallet,
    // },
  ];

  return (
    <aside className="w-full md:w-64 bg-white py-6 px-4 flex flex-col justify-between shrink-0 md:h-screen md:sticky md:top-0 shadow-md shadow-r">
      <div>
        {/* Logo / Título del Sistema */}
        <div className="flex items-center gap-3 mb-8 select-none">
          <div className="p-2 bg-indigo-600 rounded-lg text-white">
            <BrainCircuit className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight text-slate-800">ImpulsaTec</h1>
            <span className="text-xs text-indigo-400 font-medium">Crowdfunding</span>
          </div>
        </div>

        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            // Evaluamos si el botón actual es la ruta activa
            const isActive = pathname === item.href;

            return (
              <a
                key={item.href}
                href={item.href}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/10'
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-500'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </a>
            );
          })}
        </nav>
      </div>

      {/* Footer de la barra lateral */}
      <div className="mt-8 pt-6 border-t border-slate-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold text-white uppercase">
              {user?.name ? user.name.substring(0, 2) : 'UI'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-slate-800 truncate" title={user?.name}>
                {user?.name || 'Cargando...'}
              </p>
              <p className="text-[10px] text-slate-500 truncate" title={user?.email}>
                {user?.email || 'UNMSM'}
              </p>
            </div>
          </div>
          
          <button 
            onClick={handleLogout}
            title="Cerrar sesión"
            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      <CreateProject
        openCreate={openCreate}
        setOpenCreate={setOpenCreate}
      />

      
    </aside>
  );
}