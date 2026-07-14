'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Loader2, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { paymentsService } from '@/services/payments';

interface PaymentSuccessViewProps {
  token: string;
}

export function PaymentSuccessView({ token }: PaymentSuccessViewProps) {
  const router = useRouter();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setErrorMessage('Token de pago no proporcionado');
      return;
    }

    const capturePledge = async () => {
      try {
        await paymentsService.capturePayment({ orderId: token });
        setStatus('success');
      } catch (error: any) {
        console.error(error);
        setStatus('error');
        setErrorMessage(error.response?.data?.message || 'Error al capturar el pago. Contacta a soporte.');
      }
    };

    capturePledge();
  }, [token]);

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto p-8 bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-3xl shadow-2xl">
      {status === 'processing' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center text-center space-y-6"
        >
          {/* Spinner Premium con Framer Motion */}
          <div className="relative w-24 h-24">
            <motion.div
              className="absolute inset-0 rounded-full border-t-2 border-blue-500"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="absolute inset-2 rounded-full border-r-2 border-purple-500"
              animate={{ rotate: -360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Procesando Pago</h2>
            <p className="text-slate-400">Por favor espera mientras confirmamos tu transacción segura...</p>
          </div>
        </motion.div>
      )}

      {status === 'success' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", bounce: 0.5 }}
          className="flex flex-col items-center text-center space-y-6"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center border border-green-500/30"
          >
            <CheckCircle2 className="w-12 h-12 text-green-400" />
          </motion.div>
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">¡Gracias por tu aporte!</h2>
            <p className="text-slate-300">Tu transacción se completó con éxito. Has impulsado una gran idea.</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/payments/me/pledges')}
            className="flex items-center justify-center gap-2 w-full py-3 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors mt-4"
          >
            Ver mis Inversiones
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </motion.div>
      )}

      {status === 'error' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center text-center space-y-6"
        >
          <div className="w-24 h-24 rounded-full bg-red-500/20 flex items-center justify-center border border-red-500/30">
            <XCircle className="w-12 h-12 text-red-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Pago Fallido</h2>
            <p className="text-slate-400">{errorMessage}</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/')}
            className="w-full py-3 px-6 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-medium transition-colors mt-4"
          >
            Volver al Inicio
          </motion.button>
        </motion.div>
      )}
    </div>
  );
}
