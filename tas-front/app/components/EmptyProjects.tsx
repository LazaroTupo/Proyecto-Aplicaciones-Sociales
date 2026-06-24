import { FolderOpen } from 'lucide-react'
import React from 'react'

const EmptyProjects = () => {
  return (
    <div className="w-full bg-white border border-slate-800 rounded-2xl p-12 text-center">
      <FolderOpen className="w-12 h-12 text-slate-600 mx-auto mb-4" />
      <p className="text-slate-800 font-medium">No tienes proyectos registrados en este momento.</p>
      <p className="text-xs text-slate-500 mt-1">Registra en la sección correspondiente para comenzar.</p>
    </div>
  )
}

export default EmptyProjects