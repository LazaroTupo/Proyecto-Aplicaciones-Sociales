import StatusApp from '@/app/components/StatusApp'
import { Bell, EllipsisVertical } from 'lucide-react'
import React from 'react'

const Notifications = () => {

  const notifications = [
    {
      text: "Tu proyecto Sistema de prediccion de proyectos ha recibido un nuevo porcentaje de exito",
      date: "2:30pm"
    },
    {
      text: "El usuario proyecto@gmail.com ha realizado un aporte de 40$ al proyecto EduBot AI",
      date: "Hace 3 dias"
    },
    {
      text: "El proyecto MediConnect ha llegado a su total de financiamiento",
      date: "Hace 5 dias"
    },
  ]

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
        <StatusApp/>
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
                  {noti.text}
                </div>
                <div className='flex w-30 items-center justify-end'>
                  <span className='text-slate-500 text-xs'>{noti.date}</span>
                  <EllipsisVertical className='text-slate-500 cursor-pointer' />
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