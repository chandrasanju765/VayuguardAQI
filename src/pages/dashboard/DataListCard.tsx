import { Card } from "../../components/ui/card";

interface DataListCardProps {
  title: string;
  data: Array<{
    label: string;
    value: number;
    subtitle?: string;
  }>;
}

const DataListCard: React.FC<DataListCardProps> = ({ title, data }) => {
  return (
    <Card className="p-6">
      <div className="flex flex-col space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <div className="space-y-3">
          {data.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-900">
                  {item.label}
                </span>
                {item.subtitle && (
                  <span className="text-xs text-gray-500">{item.subtitle}</span>
                )}
              </div>
              <span className="text-sm font-semibold text-blue-600">
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default DataListCard;
