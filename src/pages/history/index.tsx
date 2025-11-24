import React from "react";
import HistoryHeader from "./HistoryHeader";
import AQIAveragesPieCharts from "./AQIAveragesPieCharts";
import HistoryBarChart from "./HistoryBarChart";
import {
  useGetAQILogsHistoryByDeviceID,
  useGetOutdoorAQIData,
} from "../../data/cachedQueries";
import { useAtomValue } from "jotai";
import { selectedDeviceAtom } from "../../atoms/selectedDevice";
import { selectedPeriodAtom } from "./jotai";
import { getRangeDates, transformAQICNDataToAverages } from "../../utils";

const History: React.FC = () => {
  const selectedDevice = useAtomValue(selectedDeviceAtom);

  const selectedPeriod = useAtomValue(selectedPeriodAtom);
  const { startDate, endDate } = getRangeDates(selectedPeriod);

  const { data: AQILogsHistory } = useGetAQILogsHistoryByDeviceID({
    deviceId: selectedDevice?.deviceId ?? null,
    startDate,
    endDate,
  });

  const { data: outdoorAQIData } = useGetOutdoorAQIData(
    selectedDevice?.outdoorAPIState ?? null
  );

  return (
    <>
      <HistoryHeader />

      {!selectedDevice ? (
        <div className="p-6 text-center">
          Please select a device to view history.
        </div>
      ) : (
        <>
          <AQIAveragesPieCharts
            indoorAverages={AQILogsHistory?.indoor_avg}
            outdoorAverages={transformAQICNDataToAverages(outdoorAQIData)}
          />
          <HistoryBarChart />
        </>
      )}
    </>
  );
};

export default History;
