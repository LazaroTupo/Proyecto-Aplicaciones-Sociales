"use client"
import { approveProject, getAllProjects, rejectProject } from '@/app/services/projects.service';
import { useAuthStore } from '@/app/store/auth.store';
import { Project } from '@/app/types/projects.types';
import { Table, Tag, Button, Space, message, Popconfirm } from "antd";
import { CheckOutlined, CloseOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react'

const statusColors: Record<Project["status"], string> = {
  PENDING: "gold",
  APPROVED: "green",
  REJECTED: "red",
};

const statusLabels: Record<Project["status"], string> = {
  PENDING: "Pendiente",
  APPROVED: "Aprobado",
  REJECTED: "Rechazado",
};

const ReviewProjects = () => {

  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  const router = useRouter();
  const { token } = useAuthStore();
  
  const [projects, setProjects] = useState<Project[]>([]);

  const getProjects = async () => {
    try {
      const data = await getAllProjects()

      if (data) {
        setProjects(data)
      }
    } catch (error) {
      // El interceptor de Axios ya maneja el 401 y redirige
      console.log('Error al cargar proyectos o sesión expirada');
    }
  }

  const handleApprove = async (project: Project) => {
    try {
      setActionLoadingId(project.id);
      await approveProject(project.id);
      message.success(`Proyecto "${project.title}" aprobado`);
      setProjects((prev) =>
        prev.map((p) =>
          p.id === project.id ? { ...p, status: "APPROVED" } : p
        )
      );
    } catch (error) {
      message.error("No se pudo aprobar el proyecto");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (project: Project) => {
    try {
      setActionLoadingId(project.id);
      await rejectProject(project.id);
      message.success(`Proyecto "${project.title}" rechazado`);
      setProjects((prev) =>
        prev.map((p) =>
          p.id === project.id ? { ...p, status: "REJECTED" } : p
        )
      );
    } catch (error) {
      message.error("No se pudo rechazar el proyecto");
    } finally {
      setActionLoadingId(null);
    }
  };

  const columns: ColumnsType<Project> = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 60,
    },
    {
      title: "Título",
      dataIndex: "title",
      key: "title",
      render: (title: string) => <span className="font-medium">{title}</span>,
    },
    {
      title: "Dominio",
      dataIndex: "domain",
      key: "domain",
      render: (domain: string | null) => domain ?? "—",
    },
    {
      title: "Complejidad",
      dataIndex: "complexity",
      key: "complexity",
    },
    {
      title: "Equipo",
      dataIndex: "teamSize",
      key: "teamSize",
      width: 80,
    },
    {
      title: "Presupuesto",
      dataIndex: "budget",
      key: "budget",
      render: (budget: number) =>
        budget?.toLocaleString("es-PE", {
          style: "currency",
          currency: "PEN",
        }),
    },
    {
      title: "Estado",
      dataIndex: "status",
      key: "status",
      render: (status: Project["status"]) => (
        <Tag color={statusColors[status]}>{statusLabels[status]}</Tag>
      ),
    },
    {
      title: "Acciones",
      key: "actions",
      fixed: "right",
      width: 200,
      render: (_, project) => (
        <Space>
          <Popconfirm
            title="Aprobar proyecto"
            description={`¿Confirmas aprobar "${project.title}"?`}
            okText="Sí, aprobar"
            cancelText="Cancelar"
            onConfirm={() => handleApprove(project)}
            disabled={project.status === "APPROVED"}
          >
            <Button
              type="primary"
              icon={<CheckOutlined />}
              size="small"
              disabled={project.status === "APPROVED"}
              loading={actionLoadingId === project.id}
            >
              Aprobar
            </Button>
          </Popconfirm>

          <Popconfirm
            title="Rechazar proyecto"
            description={`¿Confirmas rechazar "${project.title}"?`}
            okText="Sí, rechazar"
            cancelText="Cancelar"
            onConfirm={() => handleReject(project)}
            disabled={project.status === "REJECTED"}
          >
            <Button
              danger
              icon={<CloseOutlined />}
              size="small"
              disabled={project.status === "REJECTED"}
              loading={actionLoadingId === project.id}
            >
              Rechazar
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  useEffect(() => {
    setMounted(true);

    if (typeof window === "undefined") return;

    const localToken = localStorage.getItem("token");

    if (!token && !localToken) {
      router.push("/login");
    }

    getProjects()
  }, []);

  return (
    <div className="w-full p-8">
      <Table<Project>
        rowKey="id"
        columns={columns}
        dataSource={projects}
        loading={loading}
        pagination={false}
        scroll={{ x: "max-content" }}
      />
    </div>
  )
}

export default ReviewProjects