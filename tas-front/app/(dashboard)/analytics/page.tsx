"use client"

import StatusApp from '@/app/components/StatusApp';
import { Button } from 'antd';
import React from 'react'

import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const COLORS = ['#6366f1', '#22d3ee', '#34d399', '#f59e0b', '#f87171'];

const CHART_THEME = {
  background: 'transparent',
  textColor: '#000000',
  gridColor: '#1e293b',
  tooltipBg: '#FFFFFF',
  tooltipBorder: '#1e293b',
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: CHART_THEME.tooltipBg,
      border: `1px solid ${CHART_THEME.tooltipBorder}`,
      borderRadius: 10,
      padding: '10px 14px',
      fontSize: 13,
      color: '#000000',
    }}>
      <p style={{ color: '#000000', marginBottom: 4 }}>{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }}>
          {p.name}: <strong>{p.value}</strong>
        </p>
      ))}
    </div>
  );
};

const dataBarSector = [
  { sector: 'Educación', proyectos: 12 },
  { sector: 'Salud',     proyectos: 8  },
  { sector: 'Fintech',   proyectos: 15 },
  { sector: 'Retail',    proyectos: 6  },
  { sector: 'Otro',      proyectos: 9  },
];

export const GraficoSectores = () => (
  <div className="bg-white border border-slate-800 rounded-2xl p-5">
    <div className='flex justify-between'>
      <div>
        <h3 className="text-sm font-semibold text-slate-800 mb-1">Proyectos por sector</h3>
        <p className="text-xs text-slate-500 mb-4">Distribución según categoría</p>
      </div>
      <div>
        <Button className='bg-[#4F39F6]! text-white! border-none!'>Explorar</Button>
      </div>

    </div>
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={dataBarSector} barSize={28}>
        <CartesianGrid strokeDasharray="3 3" stroke={CHART_THEME.gridColor} vertical={false} />
        <XAxis dataKey="sector" tick={{ fill: CHART_THEME.textColor, fontSize: 12 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: CHART_THEME.textColor, fontSize: 12 }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#FFFFFF' }} />
        <Bar dataKey="proyectos" radius={[6, 6, 0, 0]}>
          {dataBarSector.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  </div>
);

const dataLineMeses = [
  { mes: 'Nov', proyectos: 3 },
  { mes: 'Dic', proyectos: 8 },
  { mes: 'Ene', proyectos: 1 },
  { mes: 'Feb', proyectos: 3 },
  { mes: 'Mar', proyectos: 4 },
  { mes: 'Abr', proyectos: 7 },
  { mes: 'May', proyectos: 4 },
];

export const GraficoTendencia = () => (
  <div className="bg-white border border-slate-800 rounded-2xl p-5">
    <h3 className="text-sm font-semibold text-slate-800 mb-1">Tendencia de publicaciones</h3>
    <p className="text-xs text-slate-500 mb-4">Proyectos nuevos por mes</p>
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={dataLineMeses}>
        <CartesianGrid strokeDasharray="3 3" stroke={CHART_THEME.gridColor} vertical={false} />
        <XAxis dataKey="mes" tick={{ fill: CHART_THEME.textColor, fontSize: 12 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: CHART_THEME.textColor, fontSize: 12 }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Line
          type="monotone"
          dataKey="proyectos"
          stroke="#6366f1"
          strokeWidth={2.5}
          dot={{ fill: '#6366f1', r: 4, strokeWidth: 0 }}
          activeDot={{ r: 6, fill: '#818cf8' }}
        />
      </LineChart>
    </ResponsiveContainer>
  </div>
);

const dataPie = [
  { name: 'Financiados',       value: 14 },
  { name: 'En financiamiento', value: 22 },
  { name: 'Sin financiamiento', value: 9 },
];

export const GraficoEstados = () => (
  <div className="bg-white border border-slate-800 rounded-2xl p-5">
    <h3 className="text-sm font-semibold text-slate-800 mb-1">Estado de proyectos</h3>
    <p className="text-xs text-slate-500 mb-4">Distribución por estado de financiamiento</p>
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={dataPie}
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={85}
          paddingAngle={3}
          dataKey="value"
        >
          {dataPie.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="transparent" />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          formatter={(value) => (
            <span style={{ color: '#94a3b8', fontSize: 12 }}>{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  </div>
);

const dataScore = [
  { rango: '0-20',   cantidad: 3,  etiqueta: 'No viable',      color: '#f87171' },
  { rango: '21-40',  cantidad: 7,  etiqueta: 'Riesgo alto',    color: '#fb923c' },
  { rango: '41-60',  cantidad: 14, etiqueta: 'Moderado',       color: '#facc15' },
  { rango: '61-80',  cantidad: 11, etiqueta: 'Prometedor',     color: '#34d399' },
  { rango: '81-100', cantidad: 5,  etiqueta: 'Alto potencial', color: '#6366f1' },
];

const TooltipScore = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div style={{
      background: '#FFFFFF',
      border: '1px solid #1e293b',
      borderRadius: 10,
      padding: '10px 14px',
      fontSize: 13,
      color: '#000000',
    }}>
      <p style={{ color: d.color, fontWeight: 600, marginBottom: 4 }}>{d.etiqueta}</p>
      <p style={{ color: '#000000' }}>Rango: {d.rango}</p>
      <p>Proyectos: <strong>{d.cantidad}</strong></p>
    </div>
  );
};

export const GraficoPredicciones = () => (
  <div className="bg-white border border-slate-800 rounded-2xl p-5">
    <h3 className="text-sm font-semibold text-slate-800 mb-1">Distribución de predicciones</h3>
    <p className="text-xs text-slate-500 mb-4">Proyectos agrupados por puntaje IA</p>
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={dataScore} barSize={32}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
        <XAxis
          dataKey="etiqueta"
          tick={{ fill: '#94a3b8', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
        <Tooltip content={<TooltipScore />} cursor={{ fill: '#FFFFFF' }} />
        <Bar dataKey="cantidad" name="Proyectos" radius={[6, 6, 0, 0]}>
          {dataScore.map((d, i) => (
            <Cell key={i} fill={d.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  </div>
);


const AnalyticsPage = () => {
  return (
    <div className="w-full p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">
            Análisis de proyectos
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Visualiza el rendimiento, distribución y predicciones de éxito de todos los proyectos en la plataforma
          </p>
        </div>
        <StatusApp/>
      </div>


      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <GraficoSectores />
        <GraficoTendencia />
        <GraficoEstados />
        <GraficoPredicciones />
      </div>

    </div>
  )
}

export default AnalyticsPage