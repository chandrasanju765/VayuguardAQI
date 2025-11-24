import React from "react";
import CustomersHeader from "./CustomersHeader";
import CustomersTable from "./CustomersTable";

const Customers: React.FC = () => {
  return (
    <div className="p-6">
      <CustomersHeader />
      <CustomersTable />
    </div>
  );
};

export default Customers;
