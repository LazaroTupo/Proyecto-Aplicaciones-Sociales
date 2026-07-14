"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import { User, Mail, Shield, CheckCircle, XCircle, Camera, Loader2, Save, LayoutDashboard, FolderKanban, CreditCard, Sparkles, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@/hooks/useUsers";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { GlassCard } from "@/components/ui/GlassCard";
import { UpdateUserPayload } from "@/services/users";

const profileSchema = z.object({
  firstName: z.string().max(100, "Máximo 100 caracteres").optional(),
  lastName: z.string().max(100, "Máximo 100 caracteres").optional(),
  bio: z.string().max(500, "Máximo 500 caracteres").optional(),
  avatarUrl: z.string().url("Debe ser una URL válida").optional().or(z.literal('')),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { user, loading, error, updateProfile } = useUser();
  const [isUpdating, setIsUpdating] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { name: "Mi Perfil", href: "/profile", icon: Settings },
    { name: "Mis Proyectos", href: "/projects/me", icon: FolderKanban },
    { name: "Mis Inversiones", href: "/payments/me/pledges", icon: CreditCard },
    { name: "Evaluaciones IA", href: "/predictions", icon: Sparkles },
  ];

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      bio: "",
      avatarUrl: "",
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        bio: user.bio || "",
        avatarUrl: user.avatarUrl || "",
      });
    }
  }, [user, form]);

  const onSubmit = async (data: ProfileFormValues) => {
    setIsUpdating(true);
    // Filtrar campos vacíos o no modificados para enviar solo lo necesario
    const payload: UpdateUserPayload = {};
    if (data.firstName && data.firstName !== user?.firstName) payload.firstName = data.firstName;
    if (data.lastName && data.lastName !== user?.lastName) payload.lastName = data.lastName;
    if (data.bio !== user?.bio) payload.bio = data.bio;
    if (data.avatarUrl !== user?.avatarUrl) payload.avatarUrl = data.avatarUrl;
    
    await updateProfile(payload);
    setIsUpdating(false);
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-80px)] items-center justify-center bg-black">
        <Loader2 className="w-10 h-10 animate-spin text-zinc-400" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex h-[calc(100vh-80px)] items-center justify-center bg-black">
        <p className="text-red-400">{error || "No se pudo cargar el perfil"}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Sidebar Navigation */}
        <div className="md:col-span-1 space-y-2">
          <GlassCard className="p-4 flex flex-col gap-2">
            <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 px-3">Navegación</h2>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                    isActive 
                      ? "bg-white/10 text-white font-medium" 
                      : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
                  }`}>
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </div>
                </Link>
              );
            })}
          </GlassCard>
        </div>

        {/* Main Content */}
        <div className="md:col-span-3 space-y-8">
          
          {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row items-center gap-6"
        >
          <div className="relative group">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-zinc-800 bg-zinc-900 flex items-center justify-center">
              {user.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="w-16 h-16 text-zinc-500" />
              )}
            </div>
            <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              <Camera className="w-8 h-8 text-white" />
            </div>
          </div>
          
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">
              {user.firstName} {user.lastName}
            </h1>
            <div className="flex items-center gap-2 mt-2 justify-center md:justify-start text-zinc-400">
              <Mail className="w-4 h-4" />
              <span>{user.email}</span>
            </div>
            <div className="flex flex-wrap items-center gap-3 mt-3 justify-center md:justify-start">
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-zinc-800/50 border border-zinc-700/50 flex items-center gap-1.5 capitalize">
                <Shield className="w-3 h-3 text-emerald-400" />
                {user.role}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1.5 ${
                user.isVerified 
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                  : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
              }`}>
                {user.isVerified ? (
                  <><CheckCircle className="w-3 h-3" /> Verificado</>
                ) : (
                  <><XCircle className="w-3 h-3" /> No Verificado</>
                )}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Edit Form Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <GlassCard className="p-8">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-white">Información Personal</h2>
              <p className="text-sm text-zinc-400">Actualiza tus datos y cuéntanos un poco sobre ti.</p>
            </div>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Input 
                    label="Nombre"
                    {...form.register("firstName")}
                    placeholder="Tu nombre"
                    error={form.formState.errors.firstName?.message}
                  />
                </div>
                <div>
                  <Input 
                    label="Apellido"
                    {...form.register("lastName")}
                    placeholder="Tu apellido"
                    error={form.formState.errors.lastName?.message}
                  />
                </div>
              </div>

              <div>
                <Input 
                  label="Avatar URL (Opcional)"
                  {...form.register("avatarUrl")}
                  placeholder="https://ejemplo.com/avatar.jpg"
                  error={form.formState.errors.avatarUrl?.message}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Biografía</label>
                <textarea
                  {...form.register("bio")}
                  className={`w-full px-4 py-3 rounded-xl bg-white/5 border text-white placeholder-zinc-500 transition-all focus:outline-none focus:ring-2 focus:ring-white/20 ${
                    form.formState.errors.bio ? 'border-red-500' : 'border-white/10'
                  }`}
                  rows={4}
                  placeholder="Cuéntanos un poco sobre ti, tu experiencia y tus proyectos..."
                />
                {form.formState.errors.bio && (
                  <p className="mt-1 text-sm text-red-500">{form.formState.errors.bio.message}</p>
                )}
              </div>

              <div className="flex justify-end pt-4 border-t border-white/5">
                <Button 
                  type="submit" 
                  disabled={isUpdating || !form.formState.isDirty}
                  className="w-full sm:w-auto"
                >
                  {isUpdating ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Guardando...</>
                  ) : (
                    <><Save className="w-4 h-4 mr-2" /> Guardar Cambios</>
                  )}
                </Button>
              </div>
            </form>
          </GlassCard>
        </motion.div>

        </div>
      </div>
    </div>
  );
}
