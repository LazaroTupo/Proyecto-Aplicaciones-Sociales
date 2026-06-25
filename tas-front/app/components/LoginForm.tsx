'use client';

import { Lock, Mail } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../store/auth.store';

export default function LoginForm() {

  const router = useRouter();
  const { setAuth } = useAuthStore();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Error al iniciar sesión');
      localStorage.setItem('user', JSON.stringify(data.user));
      setAuth(data.access_token, data.user);
      document.cookie = `token=${data.access_token}; path=/; max-age=86400`;
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-[90%] lg:w-[30%] mx-auto px-6 py-12 bg-white rounded-lg shadow-md space-y-4">
      <h2 className="text-2xl font-bold text-slate-800  text-left">Iniciar Sesión</h2>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      
      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Correo Electrónico</label>
        <div className="relative">
          <Mail className="absolute left-3 top-4 text-slate-500" size={18} />
          <input required type="email" name="email" 
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-slate-800 outline-none focus:border-indigo-500"
            onChange={handleChange} 
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Contraseña</label>
        <div className="relative">
          <Lock className="absolute left-3 top-4 text-slate-500" size={18} />
          <input required type="password" name="password" 
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-slate-800 outline-none focus:border-indigo-500"
            onChange={handleChange} 
          />
        </div>
      </div>

      <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white p-2 rounded-md  transition font-bold">
        Ingresar
      </button>
      <div className="">
        <a 
          href="/register" 
          className="text-slate-700 hover:text-indigo-400 transition-colors cursor-pointer"
        >
          ¿No tienes cuenta? <span className="underline font-semibold">Regístrate</span>
        </a>
      </div>
    </form>
  );
}