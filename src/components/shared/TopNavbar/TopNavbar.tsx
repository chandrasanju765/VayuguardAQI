import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../../ui/breadcrumbs";
import { Dropdown } from "../../ui/dropdown";
import { CircleQuestionMark, StarIcon } from "lucide-react";
import { Button } from "../../ui/button";
import { formatDate } from "../../../utils";
import { useAtom } from "jotai";
import {
  selectedAQIStandardAtom,
  type AQIStandardType,
} from "../../../atoms/aqiStandard";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

const TopNavbar = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedStandard, setSelectedStandard] = useAtom(
    selectedAQIStandardAtom
  );
  const location = useLocation();

  const options: AQIStandardType[] = ["WHO", "USEPA", "CPCB"];

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const pathnames = location.pathname.split("/").filter((x) => x);
    const breadcrumbs: BreadcrumbItem[] = [{ label: "Home", href: "/" }];

    const routeMap: Record<string, string> = {
      dashboard: "Dashboard",
      history: "History",
      "aqi-logs": "Air Quality Logs",
      devices: "Devices",
      templates: "Templates",
      customers: "Customers",
      "api-subscriptions": "API Subscriptions",
    };

    pathnames.forEach((pathname, index) => {
      const href = `/${pathnames.slice(0, index + 1).join("/")}`;
      const label =
        routeMap[pathname] ||
        pathname.charAt(0).toUpperCase() + pathname.slice(1);

      breadcrumbs.push({
        label,
        href: index === pathnames.length - 1 ? undefined : href, // Last item shouldn't be clickable
      });
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  // Use shared `formatDate` utility. Convert Date -> ISO string for reliable parsing.

  return (
    <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 flex justify-between items-center">
      <div className="flex items-center gap-4">
        <StarIcon width={16} height={16} fill="#1C1C1C1A" />
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbs.map((breadcrumb, index) => (
              <div key={index} className="flex items-center">
                <BreadcrumbItem>
                  {breadcrumb.href ? (
                    <BreadcrumbLink
                      href={breadcrumb.href}
                      className="text-gray-400"
                    >
                      {breadcrumb.label}
                    </BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage className="text-gray-600">
                      {breadcrumb.label}
                    </BreadcrumbPage>
                  )}
                </BreadcrumbItem>
                {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
              </div>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <div className="flex items-center">
        <Dropdown
          options={options}
          value={selectedStandard}
          onValueChange={(value) =>
            setSelectedStandard(value as AQIStandardType)
          }
          placeholder="Select standard"
          triggerClassName="w-48"
        />
      </div>{" "}
      <div className="text-sm text-gray-600 flex items-center gap-2">
        <p>{formatDate(currentTime.toISOString(), "MMMM D YYYY, HH:mm:ss")}</p>
        <span>|</span>
        <Button variant={"link"} className="p-0 font-normal cursor-pointer">
          <CircleQuestionMark width={20} height={20} className="text-black" />{" "}
          Help
        </Button>
      </div>
    </div>
  );
};

export default TopNavbar;
