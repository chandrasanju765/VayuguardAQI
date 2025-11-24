import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { Card } from "../../components/ui/card";

interface SimpleBarChartProps {
  title: string;
  data: Array<{
    name: string;
    value: number;
  }>;
  color?: string;
}

interface SimplePieChartProps {
  title: string;
  data: Array<{
    name: string;
    value: number;
    color?: string;
  }>;
}

const COLORS = [
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#06B6D4",
  "#84CC16",
  "#F97316",
];

export const SimpleBarChart: React.FC<SimpleBarChartProps> = ({
  title,
  data,
  color = "#3B82F6",
}) => {
  const truncateLabel = (value: string) =>
    value && value.length > 14 ? `${value.slice(0, 14)}…` : value;
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 0, right: 16, left: 8, bottom: 72 }}
          >
            <XAxis
              dataKey="name"
              fontSize={12}
              angle={-45}
              textAnchor="end"
              height={88}
              interval={0}
              tickFormatter={truncateLabel}
            />
            <YAxis fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "6px",
              }}
              formatter={(value: number, name: string, props: any) => [
                value,
                (props && props.payload && props.payload.name) || name,
              ]}
            />
            <Bar dataKey="value" fill={color} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export const SimplePieChart: React.FC<SimplePieChartProps> = ({
  title,
  data,
}) => {
  const chartData = data.map((item, index) => ({
    ...item,
    color: item.color || COLORS[index % COLORS.length],
  }));

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "6px",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-3">
        {chartData.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-sm text-gray-600">
              {item.name} ({item.value})
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
};
