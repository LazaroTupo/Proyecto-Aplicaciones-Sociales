'use client'

import React, { useEffect, useState } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import { useProjects } from '@/hooks/useProjects'
import { ProjectStats } from '@/services/projects'

const STATUS_COLORS: Record<string, string> = {
  draft: '#94a3b8',
  review: '#facc15',
  funding: '#3b82f6',
  funded: '#22c55e',
  closed: '#ef4444',
}

const STATUS_LABELS: Record<string, string> = {
  draft: 'En revision',
  funding: 'Activos',
  review: 'Revisando',
  funded: 'Financiados',
  closed: 'Cerrados',
};

const ResumeProjects = () => {

  const { getProjectStats, } = useProjects();
  const [stats, setStats] = useState<ProjectStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getProjectStats()
      .then(setStats)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className='px-10 py-24'>Cargando estadísticas...</div>
  }

  if (error || !stats) {
    return (
      <div className='px-10 py-24 text-red-500'>
        Error cargando estadísticas: {error}
      </div>
    )
  }

  return (
    <div className='px-10 py-24 flex flex-col gap-16'>
      <h1 className='text-2xl font-bold'>Resumen de Proyectos</h1>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-10 '>
        <div className='h-80'>
          <div className='text-lg mb-3 w-full font-semibold '>
            <span className='bg-[#6d28d9] p-1 rounded rounded-3'>Categorías registradas</span>
          </div>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.byCategory}>
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis
                dataKey="category"
                angle={-20}
                textAnchor="end"
                height={60}
                tick={{
                  fill: '#cbd5e1',
                  fontSize: 12,
                }}
                axisLine={{ stroke: '#475569' }}
                tickLine={false}
              />

              <YAxis
                allowDecimals={false}
                tick={{
                  fill: '#cbd5e1',
                  fontSize: 12,
                }}
                axisLine={{ stroke: '#475569' }}
                tickLine={false}
              />

              <Tooltip
                formatter={(value) => [value, null]}
                labelStyle={{
                  color: '#000',
                }}
              />

              <Bar
                dataKey="count"
                fill="#6366f1"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className='h-80'>
          <div className='text-lg mb-3 w-full font-semibold '>
            <span className='bg-[#6d28d9] p-1 rounded rounded-3'>Proyectos registrados</span>
          </div>

          <ResponsiveContainer width='100%' height='100%'>
            <PieChart>
              <Pie
                data={stats.byStatus}
                dataKey='count'
                nameKey='status'
                cx='50%'
                cy='50%'
                outerRadius={90}
                label={(entry) => {
                  const status = typeof entry.name === 'string' ? entry.name : ''
                  const labels: Record<string, string> = {
                    draft: 'En revision',
                    funding: 'Activos',
                    review: 'Revisando',
                    funded: 'Financiados',
                    closed: 'Cerrados',
                  }

                  return labels[status] ?? status
                }}
              >
                {stats.byStatus.map((entry: any) => (
                  <Cell
                    key={entry.status}
                    fill={STATUS_COLORS[entry.status] || '#8884d8'}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, name) => [
                  value,
                  STATUS_LABELS[name as string] ?? name,
                ]}
              />
              <Legend
                formatter={(value) => STATUS_LABELS[value] ?? value}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className='h-80'>

          <div className='text-lg mb-3 w-full font-semibold '>
            <span className='bg-[#6d28d9] p-1 rounded rounded-3'>Probabilidad de éxito segun IA</span>
          </div>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.byAiSuccessProbability}>
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis
                dataKey="range"
                tick={{
                  fill: '#cbd5e1',
                  fontSize: 12,
                }}
                axisLine={{ stroke: '#475569' }}
                tickLine={false}
              />

              <YAxis
                allowDecimals={false}
                tick={{
                  fill: '#cbd5e1',
                  fontSize: 12,
                }}
                axisLine={{ stroke: '#475569' }}
                tickLine={false}
              />

              <Tooltip
                formatter={(value) => [value, null]}
                labelStyle={{
                  color: '#000',
                }}
              />

              <Bar
                dataKey="count"
                fill="#10b981"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

export default ResumeProjects