'use client';

import { useState } from 'react';
import { Modal, Row, Col, Select, Slider, Steps, Button, Switch, notification } from 'antd';

interface CreateProjectProps {
  openCreate: boolean;
  setOpenCreate: (open: boolean) => void;
}

type NotificationType = 'success' | 'info' | 'warning' | 'error';

const SECTOR_OPTIONS = [
  { value: 1, label: '🎓 Educación' },
  { value: 2, label: '🏥 Salud' },
  { value: 3, label: '💳 Fintech' },
  { value: 4, label: '🛍️ Retail' },
  { value: 5, label: '🔧 Otro' },
];

const COMPLEXITY_OPTIONS = [
  { value: 'LOW',    label: 'Baja' },
  { value: 'MEDIUM', label: 'Media' },
  { value: 'HIGH',   label: 'Alta' },
];



const inputClass =
  'mt-1 text-white block w-full rounded-md bg-transparent border border-slate-600 shadow-sm p-2 focus:outline-none focus:border-indigo-400 placeholder-slate-500 text-sm';

const labelClass = 'block text-sm font-medium text-slate-300 mb-1';

// Componente toggle con label
const ToggleField = ({
  label,
  hint,
  name,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  name: string;
  value: boolean;
  onChange: (name: string, val: boolean) => void;
}) => (
  <div className="flex items-center justify-between py-3 border-b border-slate-700 last:border-0">
    <div className="flex-1 pr-4">
      <p className="text-sm font-medium text-slate-200">{label}</p>
      {hint && <p className="text-xs text-slate-500 mt-0.5">{hint}</p>}
    </div>
    <Switch
      checked={value}
      onChange={(checked) => onChange(name, checked)}
      className={value ? 'bg-indigo-500' : 'bg-slate-600'}
    />
  </div>
);

const CreateProject = ({ openCreate, setOpenCreate }: CreateProjectProps) => {

  const [api, contextHolder] = notification.useNotification();

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    // Paso 1 — datos básicos
    titulo: '',
    descripcion: '',
    montoObjetivo: '',
    fechaLimite: '',
    sector: 5,
    duracionEstimada: '',
    tamanioEquipo: '',
    complejidad: 'MEDIUM',

    // Paso 2 — predicción
    tienePatentes: false,
    tieneVideoPitch: false,
    tieneDocumentacion: false,
    estadoDesarrollo: 'IDEA',
    estudioMercado: false,
    tieneMonetizacion: false,
    tieneCompetidores: false,
    experienciaSupervisor: '',
    proyectosSimilares: '',
  });

  const handleInput = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? '' : Number(value)) : value,
    }));
  };

  const handleSelect = (name: string, value: number | string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleToggle = (name: string, value: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Validación del paso 1
  const paso1Valido =
    formData.titulo.trim() !== '' &&
    formData.montoObjetivo !== '' &&
    formData.fechaLimite !== '' &&
    formData.duracionEstimada !== '' &&
    formData.tamanioEquipo !== '';

  const handleSubmit = async () => {
    setError('');
    setLoading(true);

    const token = localStorage.getItem('token');
    if (!token) {
      setError('No estás autenticado. Inicia sesión primero.');
      setLoading(false);
      return;
    }

    // Cálculo combinado de TRL (Opción 1 + Opción 2)
    let trlCalculated = 1;
    if (formData.estadoDesarrollo === 'IDEA') trlCalculated = 1;
    if (formData.estadoDesarrollo === 'PROTOTIPO_LAB') trlCalculated = 4;
    if (formData.estadoDesarrollo === 'ENTORNO_REAL') trlCalculated = 7;

    if (formData.tieneDocumentacion) trlCalculated += 1;
    if (formData.tienePatentes) {
      trlCalculated = trlCalculated < 3 ? 3 : trlCalculated + 1;
    }
    trlCalculated = Math.min(trlCalculated, 9);

    const body = {
      title:                formData.titulo,
      description:          formData.descripcion,
      budget:               Number(formData.montoObjetivo),
      deadLine:             formData.fechaLimite,
      sector:               formData.sector,
      durationMonths:       Number(formData.duracionEstimada),
      teamSize:             Number(formData.tamanioEquipo),
      complexity:           formData.complejidad,
      hasPatents:           formData.tienePatentes,
      hasVideoPitch:        formData.tieneVideoPitch,
      hasTechnicalDoc:      formData.tieneDocumentacion,
      trlLevel:             trlCalculated,
      hasMarketStudy:       formData.estudioMercado,
      hasMonetizationModel: formData.tieneMonetizacion,
      hasDirectCompetitors: formData.tieneCompetidores,
      supervisorExperience: formData.experienciaSupervisor !== '' ? Number(formData.experienciaSupervisor) : null,
      priorSimilarProjects: formData.proyectosSimilares !== '' ? Number(formData.proyectosSimilares) : null,
    };

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al crear el proyecto');

      openNotificationWithIcon('success')
      setOpenCreate(false);
      resetForm();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStep(0);
    setFormData({
      titulo: '', descripcion: '', montoObjetivo: '', fechaLimite: '',
      sector: 5, duracionEstimada: '', tamanioEquipo: '', complejidad: 'MEDIUM',
      tienePatentes: false, tieneVideoPitch: false, tieneDocumentacion: false, estadoDesarrollo: 'IDEA',
      estudioMercado: false, tieneMonetizacion: false, tieneCompetidores: false,
      experienciaSupervisor: '', proyectosSimilares: '',
    });
  };

  const openNotificationWithIcon = (type: NotificationType) => {
    api[type]({
      title: 'Exito',
      description: 'Proyecto registrado con exito.',
      className: 'custom-notification',
    });
  };
  
  return (
    <Modal
      open={openCreate}
      closable
      onCancel={() => { setOpenCreate(false); resetForm(); }}
      footer={null}
      width={640}
      // styles={{ content: { background: '#0f172a', padding: '32px', borderRadius: '16px' } }}
    >
      {contextHolder}
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white tracking-tight">
          Registrar Nuevo Proyecto
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          Completa la información para registrar y predecir el éxito de tu propuesta.
        </p>
      </div>

      {/* Steps */}
      <Steps
        current={step}
        size="small"
        className="mb-6!"
        items={[
          { title: <span className="text-slate-300 text-xs">Datos básicos</span> },
          { title: <span className="text-slate-300 text-xs">Evaluación</span> },
        ]}
      />

      {/* ── PASO 1: DATOS BÁSICOS ── */}
      {step === 0 && (
        <div className="flex flex-col gap-4">
          {/* Título */}
          <div>
            <label className={labelClass}>Título del proyecto *</label>
            <input
              type="text"
              name="titulo"
              value={formData.titulo}
              onChange={handleInput}
              required
              placeholder="Ej: Sistema de monitoreo de salud con IA"
              className={inputClass}
            />
          </div>

          {/* Descripción */}
          <div>
            <label className={labelClass}>Descripción</label>
            <textarea
              name="descripcion"
              value={formData.descripcion}
              onChange={handleInput}
              rows={3}
              placeholder="Describe el problema que resuelve tu proyecto..."
              className={inputClass + ' resize-none'}
            />
          </div>

          <Row gutter={16}>
            {/* Sector */}
            <Col span={12}>
              <label className={labelClass}>Sector *</label>
              <Select
                className="w-full"
                value={formData.sector}
                onChange={(val) => handleSelect('sector', val)}
                options={SECTOR_OPTIONS}
                styles={{ popup: { root: { background: '#1e293b' } } }}
              />
            </Col>

            {/* Complejidad */}
            <Col span={12}>
              <label className={labelClass}>Complejidad técnica *</label>
              <Select
                className="w-full"
                value={formData.complejidad}
                onChange={(val) => handleSelect('complejidad', val)}
                options={COMPLEXITY_OPTIONS}
                styles={{ popup: { root: { background: '#1e293b' } } }}
              />
            </Col>
          </Row>

          <Row gutter={16}>
            {/* Presupuesto */}
            <Col span={12}>
              <label className={labelClass}>Presupuesto objetivo (USD) *</label>
              <input
                type="number"
                name="montoObjetivo"
                value={formData.montoObjetivo}
                onChange={handleInput}
                min={0}
                placeholder="50000"
                className={inputClass}
              />
            </Col>

            {/* Fecha límite */}
            <Col span={12}>
              <label className={labelClass}>Fecha límite *</label>
              <input
                type="date"
                name="fechaLimite"
                value={formData.fechaLimite}
                onChange={handleInput}
                className={inputClass}
              />
            </Col>
          </Row>

          <Row gutter={16}>
            {/* Duración */}
            <Col span={12}>
              <label className={labelClass}>Duración estimada (meses) *</label>
              <input
                type="number"
                name="duracionEstimada"
                value={formData.duracionEstimada}
                onChange={handleInput}
                min={1}
                placeholder="6"
                className={inputClass}
              />
            </Col>

            {/* Tamaño equipo */}
            <Col span={12}>
              <label className={labelClass}>Tamaño del equipo *</label>
              <input
                type="number"
                name="tamanioEquipo"
                value={formData.tamanioEquipo}
                onChange={handleInput}
                min={1}
                placeholder="3"
                className={inputClass}
              />
            </Col>
          </Row>
        </div>
      )}

      {/* ── PASO 2: EVALUACIÓN PARA PREDICCIÓN ── */}
      {step === 1 && (
        <div className="flex flex-col gap-5">

          {/* Sección: Estado del proyecto */}
          <div>
            <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-2">
              Estado del proyecto
            </p>
            <div className="bg-slate-800/50 rounded-xl px-4 py-1">
              <ToggleField
                label="¿Tienen Patentes o Propiedad Intelectual?"
                hint="Registros formales de propiedad intelectual"
                name="tienePatentes"
                value={formData.tienePatentes}
                onChange={handleToggle}
              />
              <ToggleField
                label="¿Cuentan con un Video Pitch?"
                hint="Video corto explicando el proyecto y el equipo"
                name="tieneVideoPitch"
                value={formData.tieneVideoPitch}
                onChange={handleToggle}
              />
              <ToggleField
                label="¿Tienen documentación técnica?"
                hint="Especificaciones, arquitectura, requisitos escritos"
                name="tieneDocumentacion"
                value={formData.tieneDocumentacion}
                onChange={handleToggle}
              />
              <ToggleField
                label="¿Realizaron un estudio de mercado?"
                hint="Análisis de demanda, competencia o usuarios potenciales"
                name="estudioMercado"
                value={formData.estudioMercado}
                onChange={handleToggle}
              />
            </div>
          </div>

          {/* Sección: Negocio */}
          <div>
            <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-2">
              Viabilidad de negocio
            </p>
            <div className="bg-slate-800/50 rounded-xl px-4 py-1">
              <ToggleField
                label="¿Tienen modelo de monetización definido?"
                hint="Suscripción, comisión, licencia, publicidad, etc."
                name="tieneMonetizacion"
                value={formData.tieneMonetizacion}
                onChange={handleToggle}
              />
              <ToggleField
                label="¿Existen competidores directos en el mercado?"
                hint="Productos o servicios similares ya disponibles"
                name="tieneCompetidores"
                value={formData.tieneCompetidores}
                onChange={handleToggle}
              />
            </div>
          </div>

          {/* Estado de Desarrollo (TRL Calculado) */}
          <div>
            <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-2">
              Fase Actual del Proyecto
            </p>
            <div className="bg-slate-800/50 rounded-xl px-4 py-3">
              <label className="block text-sm text-slate-300 mb-2">¿En qué fase se encuentra tu proyecto?</label>
              <Select
                className="w-full"
                value={formData.estadoDesarrollo}
                onChange={(val) => handleSelect('estadoDesarrollo', val)}
                options={[
                  { value: 'IDEA', label: 'Solo en idea / Documentación teórica' },
                  { value: 'PROTOTIPO_LAB', label: 'Prototipo básico en entorno de prueba / Laboratorio' },
                  { value: 'ENTORNO_REAL', label: 'Probado en entorno real con usuarios finales' }
                ]}
                styles={{ popup: { root: { background: '#1e293b' } } }}
              />
            </div>
          </div>

          {/* Experiencia y proyectos previos */}
          <div>
            <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-2">
              Experiencia del equipo
            </p>
            <Row gutter={16}>
              <Col span={12}>
                <label className={labelClass}>Años de experiencia del líder</label>
                <input
                  type="number"
                  name="experienciaSupervisor"
                  value={formData.experienciaSupervisor}
                  onChange={handleInput}
                  min={0}
                  placeholder="0"
                  className={inputClass}
                />
              </Col>
              <Col span={12}>
                <label className={labelClass}>Proyectos similares previos</label>
                <input
                  type="number"
                  name="proyectosSimilares"
                  value={formData.proyectosSimilares}
                  onChange={handleInput}
                  min={0}
                  placeholder="0"
                  className={inputClass}
                />
              </Col>
            </Row>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="mt-4 text-sm text-red-400 bg-red-900/20 border border-red-800 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      {/* Footer botones */}
      <div className="flex justify-between mt-8">
        <Button
          onClick={() => {
            if (step === 0) { setOpenCreate(false); resetForm(); }
            else setStep(0);
          }}
          className="text-white! bg-black!"
        >
          {step === 0 ? 'Cancelar' : '← Atrás'}
        </Button>

        {step === 0 ? (
          <Button
            type="primary"
            disabled={!paso1Valido}
            onClick={() => setStep(1)}
            className="bg-indigo-600! hover:bg-indigo-500 border-none text-white!"
          >
            Siguiente →
          </Button>
        ) : (
          <Button
            type="primary"
            loading={loading}
            onClick={handleSubmit}
            className="bg-indigo-600! hover:bg-indigo-500 border-none"
          >
            Crear proyecto
          </Button>
        )}
      </div>
    </Modal>
  );
};

export default CreateProject;