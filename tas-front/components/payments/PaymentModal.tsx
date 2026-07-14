'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CreditCard, Loader2, DollarSign } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { paymentsService } from '@/services/payments';

const paymentSchema = z.object({
  amount: z.number().min(1, 'El monto debe ser mayor a 0').max(1000000, 'Monto máximo excedido'),
  rewardId: z.string().optional(),
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

interface Reward {
  id: string;
  amount: number;
  description: string;
}

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  rewards?: Reward[];
}

export function PaymentModal({ isOpen, onClose, projectId, rewards = [] }: PaymentModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      amount: 10,
    },
  });

  const selectedAmount = watch('amount');

  const onSubmit = async (data: PaymentFormValues) => {
    setIsProcessing(true);
    try {
      const response = await paymentsService.createPledge(projectId, data);
      
      toast.success('Iniciando pago seguro con PayPal...');
      
      // Redirigir a la URL de aprobación de PayPal
      if (response.approvalUrl) {
        window.location.href = response.approvalUrl;
      } else {
        throw new Error('No approval URL received');
      }
    } catch (error) {
      console.error(error);
      toast.error('Ocurrió un error al iniciar el pago. Inténtalo de nuevo.');
      setIsProcessing(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-md p-6 bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl pointer-events-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <CreditCard className="w-6 h-6 text-blue-400" />
                  Aportar al Proyecto
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Amount Input */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-300">
                    Monto de Aporte (PEN)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <DollarSign className="h-5 w-5 text-slate-500" />
                    </div>
                    <input
                      type="number"
                      step="1"
                      {...register('amount', { valueAsNumber: true })}
                      className="block w-full pl-10 pr-3 py-3 border border-slate-700 rounded-xl bg-slate-800/50 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="0.00"
                    />
                  </div>
                  {errors.amount && (
                    <p className="text-sm text-red-400">{errors.amount.message}</p>
                  )}
                </div>

                {/* Rewards Selection */}
                {rewards && rewards.length > 0 && (
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-slate-300">
                      Recompensas Disponibles
                    </label>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                      <div
                        onClick={() => setValue('rewardId', undefined)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all ${
                          !watch('rewardId')
                            ? 'border-blue-500 bg-blue-500/10'
                            : 'border-slate-700 hover:border-slate-500 bg-slate-800/30'
                        }`}
                      >
                        <p className="font-medium text-white text-sm">Sin recompensa</p>
                        <p className="text-xs text-slate-400 mt-1">Aporte libre</p>
                      </div>
                      
                      {rewards.map((reward) => {
                        const isEligible = selectedAmount >= reward.amount;
                        const isSelected = watch('rewardId') === reward.id;

                        return (
                          <div
                            key={reward.id}
                            onClick={() => {
                              if (isEligible) setValue('rewardId', reward.id);
                            }}
                            className={`p-3 rounded-xl border transition-all ${
                              isSelected
                                ? 'border-blue-500 bg-blue-500/10'
                                : isEligible
                                ? 'border-slate-700 hover:border-slate-500 bg-slate-800/30 cursor-pointer'
                                : 'border-slate-800 bg-slate-900/50 opacity-50 cursor-not-allowed'
                            }`}
                          >
                            <div className="flex justify-between items-center">
                              <p className="font-medium text-white text-sm">
                                Desde S/ {reward.amount}
                              </p>
                            </div>
                            <p className="text-xs text-slate-300 mt-1">{reward.description}</p>
                            {!isEligible && (
                              <p className="text-[10px] text-red-400 mt-2 font-medium">
                                Aumenta tu aporte a S/ {reward.amount} para desbloquear
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-slate-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    'Continuar con PayPal'
                  )}
                </button>
                <p className="text-center text-xs text-slate-500 mt-4">
                  Serás redirigido al entorno seguro de PayPal para completar tu pago.
                </p>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
