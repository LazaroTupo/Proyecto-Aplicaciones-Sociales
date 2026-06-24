'use client';

import React, { useState } from 'react';
import { Loader2, UserPlus, AlertCircle, CheckCircle2, Mail, Lock, User } from 'lucide-react';

export default function RegisterForm() {
  const [formData, setFormData] = useState({ email: '', password: '', name: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string, type: 'error' | 'success' } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await fetch('http://localhost:3001/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Error al crear la cuenta');

      setMessage({ text: '¡Cuenta creada! Redirigiendo...', type: 'success' });
      setTimeout(() => window.location.href = '/login', 2000);
    } catch (err: any) {
      setMessage({ text: err.message, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md bg-white rounded-2xl p-8 shadow-md">
        <h2 className="text-2xl font-bold text-slate-800 mb-6">Crear Cuenta</h2>
        
        {message && (
          <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${message.type === 'error' ? 'bg-rose-500/10 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
            {message.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
            <p className="text-sm">{message.text}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Nombre Completo</label>
            <div className="relative">
              <User className="absolute left-3 top-4 text-slate-500" size={18} />
              <input required className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-slate-800 outline-none focus:border-indigo-500"
                onChange={(e) => setFormData({...formData, name: e.target.value})} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Correo Electrónico</label>
            <div className="relative">
              <Mail className="absolute left-3 top-4 text-slate-500" size={18} />
              <input required type="email" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-slate-800 outline-none focus:border-indigo-500"
                onChange={(e) => setFormData({...formData, email: e.target.value})} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-3 top-4 text-slate-500" size={18} />
              <input required type="password" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-slate-800 outline-none focus:border-indigo-500"
                onChange={(e) => setFormData({...formData, password: e.target.value})} />
            </div>
          </div>

          <button disabled={isLoading} className="w-full bg-indigo-600 hover:bg-indigo-500 py-3 rounded-xl font-bold text-white transition flex justify-center items-center gap-2">
            {isLoading ? <Loader2 className="animate-spin" /> : <UserPlus size={18} />}
            Registrarse
          </button>
        </form>
        <div className="mt-3">
          <a 
            href="/login" 
            className="text-slate-700 hover:text-indigo-400 transition-colors cursor-pointer"
          >
            ¿Ya tienes cuenta? <span className="underline font-semibold">Iniciar sesion</span>
          </a>
        </div>
      </div>
    </div>
  );
}