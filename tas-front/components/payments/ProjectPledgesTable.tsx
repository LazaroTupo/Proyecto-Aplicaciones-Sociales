'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, DollarSign, Calendar, Gift, Mail, User } from 'lucide-react';
import { paymentsService, ProjectPledgeResponse } from '@/services/payments';

interface ProjectPledgesTableProps {
  projectId: string;
}

export function ProjectPledgesTable({ projectId }: ProjectPledgesTableProps) {
  const [pledges, setPledges] = useState<ProjectPledgeResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPledges = async () => {
      try {
        const data = await paymentsService.getProjectPledges(projectId);
        setPledges(data);
      } catch (error) {
        console.error('Error fetching project pledges:', error);
      } finally {
        setIsLoading(false);
      }
    };
    if (projectId) {
      fetchPledges();
    }
  }, [projectId]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-4" />
        <p>Cargando aportes recibidos...</p>
      </div>
    );
  }

  if (pledges.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-slate-900/50 backdrop-blur-md rounded-2xl border border-slate-800">
        <div className="w-16 h-16 rounded-full bg-slate-800/80 flex items-center justify-center mb-4 border border-slate-700">
          <DollarSign className="w-8 h-8 text-slate-500" />
        </div>
        <h3 className="text-xl font-medium text-white mb-2">Sin aportes aún</h3>
        <p className="text-slate-400 text-center max-w-md">
          Comparte tu proyecto con la comunidad para empezar a recibir respaldo.
        </p>
      </div>
    );
  }

  // Calculate totals
  const totalAmount = pledges.reduce((acc, curr) => acc + Number(curr.amount), 0);
  const totalBackers = pledges.length;

  return (
    <div className="w-full space-y-6">
      {/* Resumen de Aportes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 bg-gradient-to-br from-blue-900/40 to-slate-900/80 backdrop-blur-xl border border-blue-500/20 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
            <DollarSign className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-400">Total Recaudado</p>
            <p className="text-2xl font-bold text-white">S/ {totalAmount.toFixed(2)}</p>
          </div>
        </div>
        
        <div className="p-5 bg-gradient-to-br from-purple-900/40 to-slate-900/80 backdrop-blur-xl border border-purple-500/20 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
            <User className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-400">Total de Inversores</p>
            <p className="text-2xl font-bold text-white">{totalBackers}</p>
          </div>
        </div>
      </div>

      {/* Header Tabla */}
      <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 text-sm font-medium text-slate-400 uppercase tracking-wider bg-slate-900/40 rounded-xl border border-slate-800">
        <div className="col-span-3">Inversor</div>
        <div className="col-span-3">Contacto</div>
        <div className="col-span-2">Monto</div>
        <div className="col-span-3">Recompensa</div>
        <div className="col-span-1 text-right">Fecha</div>
      </div>

      <div className="space-y-4">
        {pledges.map((pledge, index) => (
          <motion.div
            key={pledge.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="group grid grid-cols-1 md:grid-cols-12 gap-4 p-4 md:px-6 md:py-5 bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl hover:border-blue-500/50 transition-all items-center shadow-lg hover:shadow-blue-900/20"
          >
            {/* Inversor */}
            <div className="col-span-1 md:col-span-3 flex flex-col">
              <span className="text-xs text-slate-500 md:hidden mb-1 uppercase font-semibold">Inversor</span>
              <span className="font-semibold text-white">
                {pledge.user.firstName} {pledge.user.lastName}
              </span>
            </div>

            {/* Contacto */}
            <div className="col-span-1 md:col-span-3 flex flex-col">
              <span className="text-xs text-slate-500 md:hidden mb-1 uppercase font-semibold">Contacto</span>
              <a href={`mailto:${pledge.user.email}`} className="flex items-center gap-2 text-slate-400 hover:text-blue-400 transition-colors text-sm">
                <Mail className="w-4 h-4" />
                <span className="truncate">{pledge.user.email}</span>
              </a>
            </div>

            {/* Monto */}
            <div className="col-span-1 md:col-span-2 flex flex-col">
              <span className="text-xs text-slate-500 md:hidden mb-1 uppercase font-semibold">Monto</span>
              <span className="font-bold text-green-400 text-lg md:text-base">S/ {Number(pledge.amount).toFixed(2)}</span>
            </div>

            {/* Recompensa */}
            <div className="col-span-1 md:col-span-3 flex flex-col">
              <span className="text-xs text-slate-500 md:hidden mb-1 uppercase font-semibold">Recompensa</span>
              {pledge.reward ? (
                <div className="flex items-start gap-2">
                  <Gift className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-300 line-clamp-2">{pledge.reward.description}</span>
                </div>
              ) : (
                <span className="text-sm text-slate-500 italic">Sin recompensa</span>
              )}
            </div>

            {/* Fecha */}
            <div className="col-span-1 md:col-span-1 flex flex-col md:items-end">
              <span className="text-xs text-slate-500 md:hidden mb-1 uppercase font-semibold">Fecha</span>
              <div className="flex items-center gap-1 text-slate-400 text-sm">
                <Calendar className="w-3 h-3 md:hidden" />
                <span>{new Date(pledge.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
