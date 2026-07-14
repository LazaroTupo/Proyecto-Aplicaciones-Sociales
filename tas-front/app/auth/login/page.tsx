'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import axios from 'axios';

import { GlassCard } from '@/components/ui/GlassCard';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { authService } from '@/services/authService';

const loginSchema = z.object({
  email: z.string().email('Correo electrónico inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState('');
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setErrorMsg('');
    try {
      const res = await authService.login(data);
      if (res.accessToken) {
        Cookies.set('accessToken', res.accessToken, { secure: true, sameSite: 'strict' });
      }
      if (res.refreshToken) {
        Cookies.set('refreshToken', res.refreshToken, { secure: true, sameSite: 'strict' });
      }
      router.push('/profile'); // Ajusta según la ruta real del proyecto
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setErrorMsg(error.response?.data?.message || 'Error al iniciar sesión. Verifica tus credenciales.');
      } else {
        setErrorMsg('Error al iniciar sesión. Verifica tus credenciales.');
      }
    }
  };

  return (
    <GlassCard delay={0.1}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Bienvenido de nuevo</h2>
        <p className="text-gray-400 text-sm">Ingresa a tu cuenta para continuar</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Correo Electrónico"
          type="email"
          placeholder="tu@correo.com"
          icon={<Mail className="w-5 h-5" />}
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          label="Contraseña"
          type="password"
          placeholder="••••••••"
          icon={<Lock className="w-5 h-5" />}
          error={errors.password?.message}
          {...register('password')}
        />

        {errorMsg && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
            <p className="text-sm text-red-400">{errorMsg}</p>
          </div>
        )}

        <Button type="submit" className="w-full mt-2" isLoading={isSubmitting}>
          Iniciar Sesión
        </Button>
      </form>

      <div className="mt-6 text-center text-sm text-gray-400">
        ¿No tienes cuenta?{' '}
        <Link href="/auth/register" className="text-purple-400 hover:text-purple-300 transition-colors font-medium inline-flex items-center gap-1 group">
          Regístrate <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </GlassCard>
  );
}
