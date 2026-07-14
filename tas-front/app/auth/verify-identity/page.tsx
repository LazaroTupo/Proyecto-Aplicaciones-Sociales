'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';

import { GlassCard } from '@/components/ui/GlassCard';
import { FileInput } from '@/components/ui/FileInput';
import { Button } from '@/components/ui/Button';
import { authService } from '@/services/authService';

export default function VerifyIdentityPage() {
  const router = useRouter();
  const [documentFront, setDocumentFront] = useState<File | null>(null);
  const [documentBack, setDocumentBack] = useState<File | null>(null);
  const [selfie, setSelfie] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!documentFront || !documentBack || !selfie) {
      setErrorMsg('Por favor, sube todos los documentos requeridos.');
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('documentFront', documentFront);
      formData.append('documentBack', documentBack);
      formData.append('selfie', selfie);

      await authService.verifyIdentity(formData);
      
      // Expected HTTP 202 Accepted
      setSuccess(true);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setErrorMsg(error.response?.data?.message || 'Hubo un error al enviar tus documentos. Inténtalo de nuevo.');
      } else {
        setErrorMsg('Hubo un error al enviar tus documentos. Inténtalo de nuevo.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <GlassCard delay={0.1} className="text-center py-12">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', bounce: 0.5 }}
          className="flex justify-center mb-6"
        >
          <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center border-2 border-emerald-500/50">
            <ShieldCheck className="w-10 h-10 text-emerald-400" />
          </div>
        </motion.div>
        
        <h2 className="text-2xl font-bold text-white mb-4">Verificación en Proceso</h2>
        <p className="text-gray-400 text-sm mb-8 px-4">
          Hemos recibido tus documentos. Nuestro equipo los está revisando (KYC).
          Te notificaremos en cuanto tu cuenta esté completamente verificada.
        </p>
        
        <Button onClick={() => router.push('/profile')} className="w-full sm:w-auto">
          Ir al Inicio <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </GlassCard>
    );
  }

  return (
    <GlassCard delay={0.1}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Verifica tu Identidad</h2>
        <p className="text-gray-400 text-sm">
          Para garantizar la seguridad de nuestra comunidad, necesitamos validar tu identidad (KYC).
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <FileInput
          label="Documento de Identidad (Frente)"
          accept="image/*,.pdf"
          onChange={(file) => setDocumentFront(file)}
        />

        <FileInput
          label="Documento de Identidad (Reverso)"
          accept="image/*,.pdf"
          onChange={(file) => setDocumentBack(file)}
        />

        <FileInput
          label="Selfie (Foto de tu rostro)"
          accept="image/*"
          onChange={(file) => setSelfie(file)}
        />

        {errorMsg && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
            <p className="text-sm text-red-400">{errorMsg}</p>
          </div>
        )}

        <Button type="submit" className="w-full mt-4" isLoading={isSubmitting}>
          Enviar Documentos
        </Button>
      </form>
    </GlassCard>
  );
}
