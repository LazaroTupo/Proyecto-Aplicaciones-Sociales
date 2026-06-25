'use client';

import { Button, Col, Divider, Input, notification, Row, Select, Slider, Switch, Upload } from 'antd';
import { useState } from 'react';
import RichTextEditor from './RichTextEditor';

type NotificationType = 'success' | 'info' | 'warning' | 'error';

const SECTOR_OPTIONS = [
  { value: 1, label: '🎓 Educación' },
  { value: 2, label: '🏥 Salud' },
  { value: 3, label: '💳 Fintech' },
  { value: 4, label: '🛍️ Retail' },
  { value: 5, label: '🔧 Otro' },
];

const COMPLEXITY_OPTIONS = [
  { value: 'LOW', label: 'Baja' },
  { value: 'MEDIUM', label: 'Media' },
  { value: 'HIGH', label: 'Alta' },
];

interface ProjectFormProps {
  initialData?: {
    id?: number;
    titulo: string;
    descripcion: string;
    montoObjetivo: number;
    fechaLimite: string;
    sector: string;
    duracionEstimada: string;
    tamanioEquipo: string;
    complejidad: string;
    tieneMvp: boolean;
    tieneDocumentacion: boolean;
    objetivosClaros: string;
    estudioMercado: boolean;
    tieneMonetizacion: boolean;
    tieneCompetidores: boolean;
    experienciaSupervisor: string;
    proyectosSimilares: string;
  };
  isEditing?: boolean;
}

type FileItem = {
  file: any;
  description: string;
};


const labelClass = 'block text-sm text-slate-800 mb-1';

const inputClass =
  'mt-1 text-slate-800 block w-full rounded-md bg-transparent border border-slate-300 shadow-sm p-2 focus:outline-none focus:border-indigo-400 placeholder-slate-500 text-sm';

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
      <p className="text-sm font-medium text-slate-800">{label}</p>
      {hint && <p className="text-xs text-slate-500 mt-0.5">{hint}</p>}
    </div>
    <Switch
      checked={value}
      onChange={(checked) => onChange(name, checked)}
      className={value ? 'bg-indigo-500' : 'bg-slate-600'}
    />
  </div>
);

export default function ProjectForm({ initialData, isEditing = false }: ProjectFormProps) {

  const [api, contextHolder] = notification.useNotification();

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [allowFree, setAllowFree] = useState(true);

  const [tiers, setTiers] = useState<
    { amount: number; benefit: string }[]
  >([
    { amount: 5, benefit: "" },
  ]);

  const addTier = () => {
    setTiers((prev) => [
      ...prev,
      { amount: 0, benefit: "" },
    ]);
  };

  const removeTier = (index: number) => {
    setTiers((prev) =>
      prev.filter((_, i) => i !== index)
    );
  };

  const updateTier = (
    index: number,
    field: "amount" | "benefit",
    value: string | number
  ) => {
    setTiers((prev) =>
      prev.map((tier, i) =>
        i === index
          ? { ...tier, [field]: value }
          : tier
      )
    );
  };

  const [items, setItems] = useState<FileItem[]>([]);

  const addItem = () => {
    if (items.length >= 3) return;
    setItems([...items, { file: null, description: "" }]);
  };

  const updateItem = (index: number, data: Partial<FileItem>) => {
    const copy = [...items];
    copy[index] = { ...copy[index], ...data };
    setItems(copy);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };


  const [formData, setFormData] = useState({
    // Paso 1 — datos básicos
    titulo: '',
    descripcion: '',
    resumen: '',
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

    const formDataToSend = new FormData();

    formDataToSend.append('title', formData.titulo);
    formDataToSend.append('description', formData.descripcion);
    formDataToSend.append('resume', formData.resumen);
    formDataToSend.append('budget', String(formData.montoObjetivo));
    formDataToSend.append('deadLine', formData.fechaLimite);
    formDataToSend.append('sector', String(formData.sector));
    formDataToSend.append('durationMonths', String(formData.duracionEstimada));
    formDataToSend.append('teamSize', String(formData.tamanioEquipo));
    formDataToSend.append('complexity', String(formData.complejidad));
    formDataToSend.append('hasPatents', String(formData.tienePatentes));
    formDataToSend.append('hasVideoPitch', String(formData.tieneVideoPitch));
    formDataToSend.append('hasTechnicalDoc', String(formData.tieneDocumentacion));
    formDataToSend.append('trlLevel', String(trlCalculated));
    formDataToSend.append('hasMarketStudy', String(formData.estudioMercado));
    formDataToSend.append('hasMonetizationModel', String(formData.tieneMonetizacion));
    formDataToSend.append('hasDirectCompetitors', String(formData.tieneCompetidores));


    if (formData.experienciaSupervisor !== '') {
      formDataToSend.append('supervisorExperience', String(formData.experienciaSupervisor));
    }
    if (formData.proyectosSimilares !== '') {
      formDataToSend.append('priorSimilarProjects', String(formData.proyectosSimilares));
    }

    formDataToSend.append(
      "allowFree",
      String(allowFree)
    );
    if(!allowFree){
      formDataToSend.append(
        "tiers",
        JSON.stringify(tiers)
      );
    }

    const filesToSend = items.slice(0, 3);

    filesToSend.forEach((item) => {
      formDataToSend.append('files', item.file.originFileObj);
    });

    formDataToSend.append(
      'fileDescriptions',
      JSON.stringify(filesToSend.map((item) => item.description)),
    );

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al crear el proyecto');

      openNotificationWithIcon('success')
      // resetForm();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStep(0);
    setFormData({
      titulo: '', resumen: '', descripcion: '', montoObjetivo: '', fechaLimite: '',
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
    <>
      {contextHolder}

      <div className="flex flex-col gap-2">
        <div className='py-3'>
          <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
            Información básica
          </p>

          <Row gutter={16} className='py-3'>

            <Col span={24} className='mb-5'>
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
            </Col>

            <Col span={24} className='mb-5'>
              <label className={labelClass}>Resumen del proyecto *</label>
              <input
                type="text"
                name="resumen"
                value={formData.resumen}
                onChange={handleInput}
                required
                placeholder="Describe tu proyecto en pocas palabras"
                className={inputClass}
              />
            </Col>

            <Col span={24}>
              <label className={labelClass}>Descripción</label>
              <RichTextEditor
                value={formData.descripcion}
                onChange={(value) => {
                  setFormData((prev) => ({
                    ...prev,
                    descripcion: value,
                  }));
                }}
              />
            </Col>
          </Row>


          <Row gutter={16} className='py-3'>
            <Col span={12}>
              <label className={labelClass}>Sector *</label>
              <Select
                className="w-full"
                value={formData.sector}
                onChange={(val) => handleSelect('sector', val)}
                options={SECTOR_OPTIONS}
              />
            </Col>

            <Col span={12}>
              <label className={labelClass}>Complejidad técnica *</label>
              <Select
                className="w-full"
                value={formData.complejidad}
                onChange={(val) => handleSelect('complejidad', val)}
                options={COMPLEXITY_OPTIONS}
              />
            </Col>
          </Row>

          <Row gutter={16} className='py-3'>
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

          <Row gutter={16} className='py-3'>
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

        <div>
          <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-2">
            Estado del proyecto
          </p>
          <div className="rounded-xl py-1">
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

        <div>
          <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-2">
            Viabilidad de negocio
          </p>
          <div className="rounded-xl py-1">
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
          <div className="rounded-xl pt-3">
            <label className="block text-sm text-slate-800 mb-2">¿En qué fase se encuentra tu proyecto?</label>
            <Select
              className="w-full"
              value={formData.estadoDesarrollo}
              onChange={(val) => handleSelect('estadoDesarrollo', val)}
              options={[
                { value: 'IDEA', label: 'Solo en idea / Documentación teórica' },
                { value: 'PROTOTIPO_LAB', label: 'Prototipo básico en entorno de prueba / Laboratorio' },
                { value: 'ENTORNO_REAL', label: 'Probado en entorno real con usuarios finales' }
              ]}
            />
          </div>
        </div>

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


        <div className='mt-6'>
          <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-2">
            Documentos de sustentación
          </p>

          <div className='flex flex-col gap-2'>
            {items.map((item, index) => (
              <div key={index} className="p-4 flex flex-col gap-2 border border-slate-200 rounded-lg space-y-3 w-full">

                <Upload
                  beforeUpload={() => false}
                  maxCount={1}
                  fileList={item.file ? [item.file] : []}
                  onChange={(info) =>
                    updateItem(index, { file: info.fileList[0] })
                  }
                  className='upload-file-form'
                >
                  <Button
                  >Seleccionar archivo</Button>
                </Upload>

                <Input
                  placeholder="Descripción"
                  value={item.description}
                  onChange={(e) =>
                    updateItem(index, { description: e.target.value })
                  }
                />

                <Button danger onClick={() => removeItem(index)}>
                  Eliminar
                </Button>
              </div>
            ))}
          </div>

          {items.length < 3 && (
            <Button type="dashed" onClick={addItem} block>
              + Agregar archivo
            </Button>
          )}
        </div>

        <div className='mt-6'>
          <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-2">
            Sistema de aportes
          </p>

          <label className="flex items-center gap-2 mb-3 text-sm">
            <input
              type="checkbox"
              checked={allowFree}
              onChange={(e) =>
                setAllowFree(e.target.checked)
              }
            />
            Permitir aporte libre
          </label>

          {
            !allowFree && (
              <div className="space-y-4">

                {tiers.map((tier, index) => (
                  <div
                    key={index}
                    className="flex gap-3 items-center"
                  >
                    {/* monto */}
                    <Input
                      type="number"
                      placeholder="Monto"
                      value={tier.amount}
                      onChange={(e) =>
                        updateTier(
                          index,
                          "amount",
                          Number(e.target.value)
                        )
                      }
                      className="border p-2 rounded !w-[100px]"
                    />

                    {/* beneficio */}
                    <Input
                      type="text"
                      placeholder="Beneficio"
                      value={tier.benefit}
                      onChange={(e) =>
                        updateTier(
                          index,
                          "benefit",
                          e.target.value
                        )
                      }
                      className="border p-2 rounded flex-1"
                    />

                    <button
                      type="button"
                      onClick={() => removeTier(index)}
                      className="text-red-500 cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                ))}

                {/* agregar */}
                <Button
                  variant="solid"
                  onClick={addTier}
                  className="flex items-center bg-blue-500 text-white rounded"
                >
                  + Añadir nivel de aporte
                </Button>
              </div>
            )
          }

        </div>



        <div className='py-3'>
          <Button
            type="primary"
            loading={loading}
            onClick={handleSubmit}
            className="bg-indigo-600! w-full hover:bg-indigo-500 border-none"
          >
            Crear proyecto
          </Button>
        </div>
      </div>
    </>
  );
}