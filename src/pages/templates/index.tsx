import TemplatesHeader from "./TemplatesHeader";
import TemplatesTable from "./TemplatesTable";
import { Outlet, useMatch } from "react-router-dom";

const TemplatesPage = () => {
  const isIndex = !!useMatch({ path: "/templates", end: true });
  const isSetup = !!useMatch({ path: "/templates/setup" });

  return (
    <div className={isSetup ? "h-full" : "p-6"}>
      {isIndex && (
        <>
          <TemplatesHeader />
          <TemplatesTable />
        </>
      )}
      <Outlet />
    </div>
  );
};

export default TemplatesPage;
