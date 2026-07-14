'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, DollarSign, Calendar, Target, Gift, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { paymentsService, PledgeHistoryResponse } from '@/services/payments';

export function InvestmentHistoryTable() {
  const [pledges, setPledges] = useState<PledgeHistoryResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPledges = async () => {
      try {
        const data = await paymentsService.getMyPledges();
        setPledges(data);
      } catch (error) {
        console.error('Error fetching investments:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPledges();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-4" />
        <p>Cargando historial de inversiones...</p>
      </div>
    );
  }

  if (pledges.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-slate-900/50 backdrop-blur-md rounded-2xl border border-slate-800">
        <div className="w-16 h-16 rounded-full bg-slate-800/80 flex items-center justify-center mb-4 border border-slate-700">
          <DollarSign className="w-8 h-8 text-slate-500" />
        </div>
        <h3 className="text-xl font-medium text-white mb-2">Aún no tienes inversiones</h3>
        <p className="text-slate-400 text-center max-w-md">
          Explora proyectos innovadores y conviértete en parte de su éxito respaldándolos.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 text-sm font-medium text-slate-400 uppercase tracking-wider">
        <div className="col-span-4">Proyecto</div>
        <div className="col-span-2">Aporte</div>
        <div className="col-span-2">Fecha</div>
        <div className="col-span-3">Recompensa</div>
        <div className="col-span-1 text-right">Estado</div>
      </div>

      <div className="space-y-4">
        {pledges.map((pledge, index) => (
          <motion.div
            key={pledge.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="group grid grid-cols-1 md:grid-cols-12 gap-4 p-4 md:px-6 md:py-5 bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl hover:border-blue-500/50 transition-all items-center shadow-lg hover:shadow-blue-900/20"
          >
            {/* Proyecto */}
            <div className="col-span-1 md:col-span-4 flex flex-col">
              <span className="text-xs text-slate-500 md:hidden mb-1 uppercase font-semibold">Proyecto</span>
              <Link href={`/projects/${pledge.project.id}`} className="flex items-center gap-2 group-hover:text-blue-400 transition-colors">
                <span className="font-semibold text-white group-hover:text-blue-400 line-clamp-2">
                  {pledge.project.title}
                </span>
                <ExternalLink className="w-3 h-3 text-slate-500 hidden md:block" />
              </Link>
              <div className="flex items-center gap-1 text-xs text-slate-400 mt-1">
                <Target className="w-3 h-3" />
                <span>Meta: S/ {pledge.project.targetAmount}</span>
              </div>
            </div>

            {/* Aporte */}
            <div className="col-span-1 md:col-span-2 flex flex-col">
              <span className="text-xs text-slate-500 md:hidden mb-1 uppercase font-semibold">Aporte</span>
              <span className="font-bold text-green-400 text-lg md:text-base">S/ {Number(pledge.amount).toFixed(2)}</span>
            </div>

            {/* Fecha */}
            <div className="col-span-1 md:col-span-2 flex flex-col">
              <span className="text-xs text-slate-500 md:hidden mb-1 uppercase font-semibold">Fecha</span>
              <div className="flex items-center gap-2 text-slate-300">
                <Calendar className="w-4 h-4 text-slate-500 hidden md:block" />
                <span>{new Date(pledge.createdAt).toLocaleDateString()}</span>
              </div>
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
                <span className="text-sm text-slate-500 italic">Sin recompensa (Aporte libre)</span>
              )}
            </div>

            {/* Estado */}
            <div className="col-span-1 md:col-span-1 flex items-center md:justify-end mt-2 md:mt-0">
              <span className="text-xs text-slate-500 md:hidden mr-2 uppercase font-semibold">Estado:</span>
              {pledge.status === 'success' ? (
                <span className="px-3 py-1 bg-green-500/10 border border-green-500/20 text-green-400 rounded-full text-xs font-medium tracking-wide">
                  Completado
                </span>
              ) : (
                <span className="px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 rounded-full text-xs font-medium tracking-wide">
                  Pendiente
                </span>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
