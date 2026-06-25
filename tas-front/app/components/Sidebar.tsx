'use client';

import React, { useEffect, useState } from 'react';
import {
  BrainCircuit,
  LayoutGrid,
  PlusCircle,
  ChartColumnIncreasing,
  SquareChartGantt,
  Bell,
  ArrowLeftRight,
  LogOut,
  UserRound
} from "lucide-react";
import { useRouter } from 'next/navigation';

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
];

export default function Sidebar() {

  const [pathname, setPathname] = useState('/');
  const [openCreate, setOpenCreate] = useState(false)
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [currentRole, setCurrentRole] = useState<"CREADOR" | "FINANCIADOR">(
    "CREADOR"
  );

  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPathname(window.location.pathname);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.replace("/login");
  };

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
            const isActive = pathname === item.href;

            return (
              <a
                key={item.href}
                href={item.href}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${isActive
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


      <div className="mt-8 pt-6 border-t border-slate-300 space-y-2">

        {/* Selector de rol */}
        <button
          onClick={() => setShowRoleMenu(!showRoleMenu)}
          className="w-full flex items-center justify-between px-2 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100 transition"
        >
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold text-white">
              <UserRound className="w-5 h-5" />
            </div>
            <span>
              Jose ({currentRole === "CREADOR" ? "Creador" : "Financiador"})
            </span>
          </div>
          <ArrowLeftRight size={18}/>
        </button>

        {showRoleMenu && (
          <div className="space-y-1">
            <button
              onClick={() => {
                setCurrentRole("CREADOR");
                setShowRoleMenu(false);
              }}
              className="w-full text-left px-4 py-2 rounded-lg text-sm hover:bg-slate-100"
            >
              Creador
            </button>

            <button
              onClick={() => {
                setCurrentRole("FINANCIADOR");
                setShowRoleMenu(false);
              }}
              className="w-full text-left px-4 py-2 rounded-lg text-sm hover:bg-slate-100"
            >
              Financiador
            </button>
          </div>
        )}

        <button
          onClick={handleLogout}
          className="w-full flex px-2 py-2 items-center gap-3 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 transition"
        >
          <LogOut className="w-5 h-5" />
          <span>Cerrar sesión</span>
        </button>
      </div>


    </aside>
  );
}