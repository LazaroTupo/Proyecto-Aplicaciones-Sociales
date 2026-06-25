"use client"
import { ContributionTiers } from '@/app/components/ContributionTiers';
import PaypalButton from '@/app/components/PaypalButton';
import { ContributionsTimeline } from '@/app/components/TimelineContributions';
import { Project } from '@/app/types/projects.types';
import { PayPalButtons } from '@paypal/react-paypal-js';
import { Button, Input, Tabs } from 'antd';
import React, { useEffect, useState } from 'react'

type Props = {
  project: Project;
};

const sectorOptions = [
  { value: 1, label: '🎓 Educación' },
  { value: 2, label: '🏥 Salud' },
  { value: 3, label: '💳 Fintech' },
  { value: 4, label: '🛍️ Retail' },
  { value: 5, label: '🔧 Otro' },
]

const DetailProyect = ({ project }: Props) => {

  const [pathname, setPathname] = useState('/');
  const [selectedTier, setSelectedTier] = useState<number | "free" | null>(null);
  const [user, setUser] = useState<{ name: string, role: string, id: number } | null>(null);
  const [customAmount, setCustomAmount] = useState<string>("");

  const onChange = (key: any) => {
    console.log(key);
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    setPathname(window.location.pathname);

    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);


  const sectorLabel = sectorOptions.find((sec) => sec.value == project.sector)

  const items = [
    {
      key: '1',
      label: 'Detalles',
      children: <div className='flex flex-col gap-3'>
        <div>Sector: {project.sector === 5 ? 'No especificado' : sectorLabel?.label}</div>
        <div>Tamaño del equipo: {project.teamSize}</div>
        <div>Duración estimada: {project.durationMonths} meses</div>
        <div>Experiencia del líder: {project.supervisorExperience} años</div>
        <div className='underline'>Detalles del proyecto:</div>
        <div
          className="
            [&_ul]:list-disc
            [&_ul]:pl-6
            [&_ol]:list-decimal
            [&_ol]:pl-6
          "
          dangerouslySetInnerHTML={{
            __html: project.description,
          }}
        />
      </div>,
    },
    {
      key: '2',
      label: 'Beneficios',
      children: <ContributionTiers allowFree={project.allowFree} tiers={project.tiers} />,
    },
    {
      key: '3',
      label: 'Contribuyentes',
      children: <ContributionsTimeline contributions={project.contributions} />,
    },
    {
      key: '4',
      label: 'Sustentos',
      children: <div className='flex flex-col gap-3'>
        {
          project.attachments.map((doc) => (
            <div className='flex flex-col p-5 rounded-md shadow-sm bg-slate-50'>
              <div className='flex justify-between items-center'>
                <div>
                  {doc.filename}
                </div>
                <Button
                  className='!bg-[#4F39F7] !text-white'
                  onClick={() => {
                    if (typeof window !== "undefined") {
                      window.open(
                        `${process.env.NEXT_PUBLIC_API_URL}${doc.url}`,
                        "_blank"
                      );
                    }
                  }}
                >Ver archivo</Button>
              </div>
              <div>Descripción: {doc.description}</div>
            </div>
          ))
        }
      </div>,
    },
  ];

  const getAmount = () => {
    if (project.allowFree) {
      return customAmount;
    }

    const tier = project.tiers.find(
      (t) => t.id === selectedTier
    );

    return tier?.amount || 0;
  };

  return (
    <div className='py-4'>

      <div className={`flex ${project.allowFree ? "" : "flex-col"} gap-2`}>
        {project.allowFree && (
          <div className='flex gap-2 items-center'>
            <div className='text-sm'>Aportar:</div>
            {project.allowFree && (
              <Input
                placeholder="Monto"
                value={customAmount}
                onChange={(e) =>
                  setCustomAmount(e.target.value)
                }
                className='!w-[200px]'
              />
            )}
          </div>
        )}

        {
          !project.allowFree && (
            <div className='flex flex-col'>
              <div>Elegir aporte:</div>
              {project.tiers.map((tier, index) => (
                <label key={index}>
                  <input
                    type="radio"
                    name="donation"
                    checked={selectedTier === tier.id}
                    onChange={() => setSelectedTier(tier.id)}
                  />

                  <span className='ml-2'>${tier.amount}</span>
                </label>
              ))}
            </div>
          )
        }

        {
          user?.id != project.ownerId && (
            <div className="w-1/3 flex items-center relative">
              {(!selectedTier && !project.allowFree) && (
                <div
                  className="absolute inset-0 z-10 cursor-not-allowed"
                  title="Selecciona un plan de aporte primero"
                />
              )}
              <div className={(!selectedTier && !project.allowFree) ? 'opacity-40 pointer-events-none w-full' : 'w-full'}>
                <PaypalButton
                  selectedTier={selectedTier}
                  amount={Number(getAmount())}
                  projectId={project.id}
                />
              </div>
            </div>
          )
        }


      </div>


      <Tabs defaultActiveKey="1" items={items} onChange={onChange} />
    </div>
  )
}

export default DetailProyect