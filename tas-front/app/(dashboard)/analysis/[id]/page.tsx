import AnalysisDashboard from "../../../components/AnalysisDashboard";

interface AnalysisDashboardProps {
  params: {
    id: string;
  };
}

export default async function AnalysisPage({
  params,
}: AnalysisDashboardProps) {

  const { id } = await params;

  return (
    <div className="p-8">
      <AnalysisDashboard id={id} />
    </div>
  );
}