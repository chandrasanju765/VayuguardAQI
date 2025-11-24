import React from "react";
import APISubscriptionsHeader from "./APISubscriptionsHeader";
import APISubscriptionsTable from "./APISubscriptionsTable";

const APISubscriptions: React.FC = () => {
  return (
    <div className="p-6">
      <APISubscriptionsHeader />
      <APISubscriptionsTable />
    </div>
  );
};

export default APISubscriptions;
