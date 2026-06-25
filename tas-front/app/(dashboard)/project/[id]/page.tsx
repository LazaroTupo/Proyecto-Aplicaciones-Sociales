import React from 'react'

import { cookies } from 'next/headers';
import { getProjectById } from '@/app/services/projects.service';
import { Col, Row, Tabs } from 'antd';
import { Project } from '@/app/types/projects.types';
import DetailProyect from '../components/DetailProyect';

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function Page({ params }: Props) {
  const { id } = await params;

  const token = (await cookies()).get("token")?.value;

  const project: Project = await getProjectById(id, token);
  console.log('project');
  console.log(project);

  const progressPercent = Math.min(
    Math.round((project.raised / project.budget) * 100),
    100
  );


  return (
    <div className='p-8'>
      <div className='flex flex-col bg-white p-5 rounded-md shadow-sm'>
        <div className='flex flex-col gap-3'>
          <div className='text-4xl font-medium'>{project.title}</div>
          <div className=' leading-relaxed line-clamp-5 break-words'>{project.resume}</div>
          <div>
            <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
              <span className="text-slate-500 tracking-wider">
                Recaudado
              </span>
              <span className="text-slate-500">
                ${project.raised.toLocaleString()} / ${project.budget.toLocaleString()} ({progressPercent}%)
              </span>
            </div>
            <div className="w-full bg-white rounded-full h-4 overflow-hidden border border-slate-200">
              <div
                className="bg-green-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>
        </div>
        <DetailProyect project={project}/>
      </div>
    </div>
  );
}