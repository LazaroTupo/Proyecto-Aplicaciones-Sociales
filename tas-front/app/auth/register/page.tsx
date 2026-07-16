'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, User, ArrowRight, Briefcase } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';

import { GlassCard } from '@/components/ui/GlassCard';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { authService } from '@/services/authService';

const registerSchema = z.object({
  firstName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  lastName: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
  email: z.string().email('Correo electrónico inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  role: z.enum(['creator', 'backer'], {
    message: 'Selecciona un rol válido',
  }),
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'backer',
    }
  });

  const onSubmit = async (data: RegisterForm) => {
    setErrorMsg('');
    try {
      await authService.register(data);
      // Redirigir al login después del registro exitoso
      router.push('/auth/login?registered=true');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setErrorMsg(error.response?.data?.message || 'Error al registrar usuario. Inténtalo de nuevo.');
      } else {
        setErrorMsg('Error al registrar usuario. Inténtalo de nuevo.');
      }
    }
  };

  return (
    <GlassCard delay={0.1}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Crear Cuenta</h2>
        <p className="text-gray-400 text-sm">Únete a ImpulsaTec y empieza a crear o apoyar proyectos.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Nombre"
            placeholder="Juan"
            icon={<User className="w-5 h-5" />}
            error={errors.firstName?.message}
            {...register('firstName')}
          />
          <Input
            label="Apellido"
            placeholder="Pérez"
            icon={<User className="w-5 h-5" />}
            error={errors.lastName?.message}
            {...register('lastName')}
          />
        </div>

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

        <div className="flex flex-col gap-1.5 w-full">
          <label className="text-sm font-medium text-gray-200 ml-1">Rol en la plataforma</label>
          <div className="relative group">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-400 transition-colors">
              <Briefcase className="w-5 h-5" />
            </div>
            <select
              className={`
                w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white 
                backdrop-blur-md outline-none transition-all duration-300 appearance-none
                focus:bg-white/10 focus:border-purple-500 focus:shadow-[0_0_15px_rgba(168,85,247,0.15)]
                ${errors.role ? 'border-red-500/50 focus:border-red-500' : ''}
              `}
              {...register('role')}
            >
              <option value="backer" className="bg-gray-900 text-white">Inversor (Backer)</option>
              <option value="creator" className="bg-gray-900 text-white">Creador de Proyectos</option>
            </select>
            {/* Custom arrow for select */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
              ▼
            </div>
          </div>
          {errors.role && <p className="text-xs text-red-400 ml-1 mt-1">{errors.role.message}</p>}
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
            <p className="text-sm text-red-400">{errorMsg}</p>
          </div>
        )}

        <Button type="submit" className="w-full mt-4" isLoading={isSubmitting}>
          Registrarse
        </Button>
      </form>

      <div className="mt-6 text-center text-sm text-gray-400">
        ¿Ya tienes una cuenta?{' '}
        <Link href="/auth/login" className="text-purple-400 hover:text-purple-300 transition-colors font-medium inline-flex items-center gap-1 group">
          Inicia Sesión <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </GlassCard>
  );
}
