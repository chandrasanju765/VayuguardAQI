import { Card } from "../../components/ui/card";

interface StatCardProps {
  title: string;
  value: number;
  subtitle?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle }) => {
  return (
    <Card className="p-6">
      <div className="flex flex-col space-y-2">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
      </div>
    </Card>
  );
};

export default StatCard;
