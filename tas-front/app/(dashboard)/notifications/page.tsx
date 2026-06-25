"use client"
import StatusApp from '@/app/components/StatusApp'
import { getNotifications } from '@/app/services/projects.service';
import { useAuthStore } from '@/app/store/auth.store';
import { Button } from 'antd';
import { Bell, EllipsisVertical } from 'lucide-react'
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react'

interface Notification {
  description: string;
  projectId: string;
}

const Notifications = () => {

  const router = useRouter();

  const [ notifications, setNotifications ] = useState<Notification[]>([])

  const getNotificationsData = async () => {
    try {

      const token = localStorage.getItem('token') ?? "";

      const data = await getNotifications(token)

      if (data) {
        setNotifications(data)
      }
    } catch (error) {
      console.log('Error al cargar proyectos o sesión expirada');
    }
  }

  useEffect(() => {
    getNotificationsData()
  }, []);

  return (
    <div className="w-full p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">
            Notificaciones
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Monitorera la recaudación, tiempos de campaña y edita.
          </p>
        </div>
        <StatusApp />
      </div>
      <div className='flex flex-col gap-3'>
        {
          notifications.map((noti, index) => {
            return (
              <div key={index} className='bg-white p-2 rounded-md flex justify-between py-6 shadow-sm'>
                <div>
                  <Bell className='text-slate-800 h-5' />
                </div>
                <div className='text-slate-800 text-left flex justify-start w-full px-4'>
                  {noti.description}
                </div>
                <div className='flex w-30 items-center justify-end'>
                  <Button onClick={() => router.push(`/project/${noti.projectId}`)}>Ver Proyecto</Button>
                </div>
              </div>
            )
          })
        }
      </div>

    </div>
  )
}

export default Notifications