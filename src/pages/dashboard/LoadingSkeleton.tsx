import { Card } from "../../components/ui/card";

interface LoadingSkeletonProps {
  type: "stat" | "chart" | "list";
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ type }) => {
  if (type === "stat") {
    return (
      <Card className="p-6 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-8 bg-gray-200 rounded w-1/2 mb-1"></div>
        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
      </Card>
    );
  }

  if (type === "chart") {
    return (
      <Card className="p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
      </Card>
    );
  }

  if (type === "list") {
    return (
      <Card className="p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex justify-between items-center">
              <div className="flex flex-col gap-1">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-3 bg-gray-200 rounded w-16"></div>
              </div>
              <div className="h-4 bg-gray-200 rounded w-8"></div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  return null;
};

export const DashboardSkeleton = () => {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
      </div>

      {/* Summary Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <LoadingSkeleton key={i} type="stat" />
        ))}
      </div>

      {/* Charts Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LoadingSkeleton type="chart" />
        <LoadingSkeleton type="chart" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LoadingSkeleton type="chart" />
        <LoadingSkeleton type="list" />
      </div>

      {/* Data Lists Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LoadingSkeleton type="list" />
        <LoadingSkeleton type="list" />
      </div>
    </div>
  );
};

export default LoadingSkeleton;
