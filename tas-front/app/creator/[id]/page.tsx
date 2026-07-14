"use client";

import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { User, Loader2, ArrowLeft, Shield, Calendar } from "lucide-react";
import Link from "next/link";
import { usePublicProfile } from "@/hooks/useUsers";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";

export default function CreatorProfilePage() {
  const params = useParams();
  const id = params.id as string;
  
  const { profile, loading, error, is404 } = usePublicProfile(id);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-black">
        <Loader2 className="w-10 h-10 animate-spin text-zinc-400" />
      </div>
    );
  }

  if (is404) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
        {/* Abstract Background for 404 */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-500/10 rounded-full blur-[120px] pointer-events-none" />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full relative z-10"
        >
          <GlassCard className="p-10 text-center space-y-6 border-red-500/10">
            <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mx-auto border border-red-500/20">
              <User className="w-12 h-12 text-red-400" />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-white tracking-tight">Usuario no encontrado</h1>
              <p className="text-zinc-400 text-sm">
                El perfil que buscas no existe o ha sido eliminado. Verifica el enlace e inténtalo nuevamente.
              </p>
            </div>
            
            <div className="pt-4">
              <Link href="/">
                <Button className="w-full" variant="outline">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Volver al inicio
                </Button>
              </Link>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex h-screen items-center justify-center bg-black">
        <p className="text-red-400">{error || "Error al cargar el perfil."}</p>
      </div>
    );
  }

  const formattedDate = new Date(profile.createdAt).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long'
  });

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Subtle Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-white/5 rounded-full blur-[150px] pointer-events-none" />
      
      <div className="max-w-3xl mx-auto relative z-10">
        <Link href="/">
          <button className="flex items-center text-sm text-zinc-400 hover:text-white transition-colors mb-8 group">
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Volver
          </button>
        </Link>
        
        <GlassCard className="overflow-hidden">
          {/* Cover Area */}
          <div className="h-32 sm:h-48 bg-gradient-to-r from-zinc-900 to-zinc-800 relative">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
          </div>
          
          <div className="px-6 sm:px-10 pb-10">
            <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start -mt-16 sm:-mt-20 relative z-10">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden border-4 border-zinc-900 bg-zinc-800 flex items-center justify-center shrink-0 shadow-2xl"
              >
                {profile.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={profile.avatarUrl} alt={profile.firstName} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-16 h-16 text-zinc-500" />
                )}
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mt-2 sm:mt-24 text-center sm:text-left flex-1"
              >
                <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                  {profile.firstName} {profile.lastName}
                </h1>
                
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-3">
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-zinc-800 border border-zinc-700 flex items-center gap-1.5 capitalize text-zinc-300">
                    <Shield className="w-3 h-3 text-emerald-400" />
                    {profile.role === 'creator' ? 'Creador' : 'Inversor'}
                  </span>
                  
                  <span className="flex items-center text-xs text-zinc-400 gap-1.5">
                    <Calendar className="w-3 h-3" />
                    Miembro desde {formattedDate}
                  </span>
                </div>
              </motion.div>
            </div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-10"
            >
              <h3 className="text-lg font-medium text-white mb-3">Sobre mí</h3>
              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 text-zinc-300 leading-relaxed min-h-[100px]">
                {profile.bio ? (
                  <p>{profile.bio}</p>
                ) : (
                  <p className="text-zinc-500 italic">Este usuario aún no ha escrito una biografía.</p>
                )}
              </div>
            </motion.div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
