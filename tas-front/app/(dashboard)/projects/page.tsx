'use client';

import React, { useEffect, useState } from 'react';
import { Clock, Sparkles, FolderOpen, AlertCircle, CheckCircle2, User, UserRound, Trash, ArrowRight } from 'lucide-react';
import PaypalButton from '@/app/components/PaypalButton';
import { getAllProjects, getAllProjectsById } from '@/app/services/projects.service';
import { Project } from '@/app/types/projects.types';
import { Button, ConfigProvider, notification, Segmented } from 'antd';
import { useRouter } from 'next/navigation';
import { HeartFilled, HeartOutlined } from '@ant-design/icons';
import StatusApp from '@/app/components/StatusApp';
import EmptyProjects from '@/app/components/EmptyProjects';
import { useAuthStore } from '@/app/store/auth.store';

type NotificationType = 'success' | 'info' | 'warning' | 'error';

export default function Projects() {

  const [api, contextHolder] = notification.useNotification();

  const router = useRouter();
  const { token } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  const [projects, setProjects] = useState<Project[]>([]);
  const [filter, setFilter] = useState<string>("")

  const getDaysRemaining = (deadlineStr: string) => {

    const deadlineDate = new Date(deadlineStr);
    const today = new Date();

    const diffTime = deadlineDate.getTime() - today.getTime();

    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 0) {
      return `${diffDays} días restantes`;
    }

    if (diffDays === 0) {
      return 'Expira hoy';
    }

    return `Expirado hace ${Math.abs(diffDays)} días`;
  };

  const handleFavorite = (id: number) => {
    let favorite = false;

    setProjects((prev) =>
      prev.map((project) => {
        if (project.id === id) {
          favorite = !project.isFavorite;

          return {
            ...project,
            isFavorite: favorite,
          };
        }

        return project;
      })
    );

    openNotificationWithIcon("success", favorite);
  };

  const getProjects = async () => {
    try {
      const data = await getAllProjectsById()

      if (data) {
        setProjects(data)
      }
    } catch (error) {
      console.log('Error al cargar proyectos o sesión expirada');
    }
  }

  const openNotificationWithIcon = (type: NotificationType, added: boolean = true) => {
    api[type]({
      title: 'Interes actualizado',
      description: `El projecto ha sido ${added ? "agregado a" : "removido de"} favoritos`,
      className: 'custom-notification',
    });
  };



  useEffect(() => {
    setMounted(true);

    if (typeof window === "undefined") return;

    const localToken = localStorage.getItem("token");

    if (!token && !localToken) {
      router.push("/login");
    }

    getProjects()
  }, []);

  if (!mounted) return null; // Esperar a hidratación para evitar errores de CSS
  if (!token) return null; // Evitar renderizado mientras redirige

  return (
    <div className="w-full p-8">
      {contextHolder}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">
            Tus proyectos
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Mantente al tanto de las novedades de tus proyectos y contribuciones.
          </p>
        </div>
        <StatusApp />
      </div>

      {(() => {
        const now = new Date();
        const filteredProjects =
          filter === 'Alto potencial' ? projects.filter((p) => (p.feasibilityIndex ?? 0) > 79) :
            filter === 'Cerrados' ? projects.filter((p) => new Date(p.deadLine) < now) :
              filter === 'Complejos' ? projects.filter((p) => p.complexity === 'HIGH') :
                projects;


        return filteredProjects.length === 0 ? (
          <EmptyProjects />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => {
              const progressPercent = Math.min(
                Math.round((project.raised / project.budget) * 100),
                100
              );
              const daysLabel = getDaysRemaining(project.deadLine);

              return (
                <div
                  key={project.id}
                  className="bg-white border border-indigo-300/30 rounded-2xl px-5 pt-4 pb-3 hover:border-slate-400 transition duration-500 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-4 mb-4">
                      <span className="flex items-center gap-1 px-2.5 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 text-xs font-semibold rounded-lg">
                        <UserRound size={16} />
                        <span className='text-[14px]'>{project.teamSize ?? "?"}</span>
                      </span>
                      {project.status === "APPROVED" ? (
                        <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          {daysLabel}
                        </span>
                      ) : project.status === "PENDING" ? (
                        <span className="flex items-center gap-1 px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-600 text-xs font-semibold rounded-lg">
                          Pendiente
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 px-2.5 py-1 bg-red-500/10 border border-red-500/20 text-red-600 text-xs font-semibold rounded-lg">
                          Rechazado
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-lg text-slate-800 mb-2 line-clamp-1">
                      {project.title}
                    </h3>
                    <p className="text-xs text-slate-500 mb-6 line-clamp-3 leading-relaxed">
                      {project.resume}
                    </p>
                  </div>

                  <div className="space-y-2 pt-4 border-t border-slate-900">
                    <div>
                      <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                        <span className="text-slate-500 tracking-wider">
                          Recaudado
                        </span>
                        <span className="text-slate-500">
                          ${project.raised.toLocaleString()} / ${project.budget.toLocaleString()} ({progressPercent}%)
                        </span>
                      </div>
                      <div className="w-full bg-white rounded-full h-2 overflow-hidden border border-slate-200">
                        <div
                          className="bg-green-400 h-full rounded-full transition-all duration-500"
                          style={{ width: `${progressPercent}%` }}
                        ></div>
                      </div>
                    </div>

                    <button
                      onClick={() => router.push(`/analysis/${project.id}`)}
                      className="w-full py-2 bg-emerald-200 hover:bg-slate-850 text-slate-600 hover:text-slate-700 rounded-xl text-xs font-semibold  flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-slate-500" />
                      Ver Predicción de Éxito
                    </button>
                    <button
                      onClick={() => router.push(`/project/${project.id}`)}
                      className="group w-full py-2 bg-indigo-600 hover:bg-slate-850 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      Ver Detalle
                      <ArrowRight
                        className="w-3.5 h-3.5 text-white opacity-0 -translate-x-1 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0"
                      />
                    </button>
                    <div className='flex justify-end'>
                      <Button
                        color="danger" variant="solid" size='small'
                        className='!text-[14px]'
                      >Eliminar</Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        );
      })()}
    </div>
  );
}