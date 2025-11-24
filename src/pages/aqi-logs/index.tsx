import AQILogsHeader from "./AQILogsHeader";
import AQILogsTable from "./AQILogsTable";

const AQILogs = () => {
  return (
    <div className="h-full flex flex-col overflow-hidden">
      <AQILogsHeader />
      <div className="flex-1 overflow-hidden">
        <AQILogsTable />
      </div>
    </div>
  );
};

export default AQILogs;
