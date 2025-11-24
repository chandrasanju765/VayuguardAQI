import React from "react";
import DevicesHeader from "./DevicesHeader";
import DevicesTable from "./DevicesTable";

const Devices: React.FC = () => {
  return (
    <div className="p-6">
      <DevicesHeader />
      <DevicesTable />
    </div>
  );
};

export default Devices;
