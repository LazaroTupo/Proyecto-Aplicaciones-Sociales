import ProjectForm from "@/app/components/ProjectForm";

export default function NewProjectPage() {
  return (
    <div className=" p-8">
      <div className="w-full">
        <div className="text-left mb-8">
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">
            Registrar proyecto
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Completa la información requerida para registrar y predecir el éxito de tu propuesta académica.
          </p>
        </div>
        
        {/* Renderizado de tu componente de Canvas */}
        <div className="py-6 px-6 rounded-2xl bg-white">
          <ProjectForm isEditing={false} />
        </div>
      </div>
    </div>
  );
}