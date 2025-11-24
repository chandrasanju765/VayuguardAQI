import {
  FolderIcon,
  LayoutIcon,
  MonitorIcon,
  PieChartIcon,
  UsersIcon,
  HistoryIcon,
  BookTextIcon,
  LogOutIcon,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Separator } from "../ui/seperator";
import { Button } from "../ui/button";
import { getAuthData, hasRouteAccess, logout } from "../../pages/login/utils";

const navigationSections = [
  {
    title: "Analytics",
    items: [
      {
        icon: PieChartIcon,
        label: "Dashboard",
        path: "/dashboard",
      },
      {
        icon: HistoryIcon,
        label: "History",
        path: "/history",
      },
      {
        icon: BookTextIcon,
        label: "Air Quality Log",
        path: "/aqi-logs",
      },
    ],
  },
  {
    title: "Hardware",
    items: [
      {
        icon: MonitorIcon,
        label: "Devices",
        path: "/devices",
      },
      {
        icon: LayoutIcon,
        label: "Templates",
        path: "/templates",
      },
    ],
  },
  {
    title: "Management",
    items: [
      {
        icon: UsersIcon,
        label: "Customers",
        path: "/customers",
      },
      {
        icon: FolderIcon,
        label: "API Subscriptions",
        path: "/api-subscriptions",
      },
    ],
  },
];

const LeftNavbar = () => {
  const location = useLocation();
  const authData = getAuthData();
  const navigate = useNavigate();
  const displayName = authData?.name ?? "User";
  const initials = displayName
    .split(" ")
    .map((n) => (n && n.length ? n[0] : ""))
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const getFilteredNavigationSections = () => {
    if (!authData) return [];

    return navigationSections
      .map((section) => ({
        ...section,
        items: section.items.filter((item) =>
          hasRouteAccess(authData, item.path)
        ),
      }))
      .filter((section) => section.items.length > 0);
  };

  const filteredNavigationSections = getFilteredNavigationSections();

  return (
    <nav className="flex flex-col w-[212px] h-full p-4 bg-gray-50 border-r border-gray-200 overflow-hidden">
      <header className="flex flex-col gap-1 pb-3 w-full">
        <div className="flex items-center gap-2 w-full">
          <div className="flex items-center gap-2 flex-1">
            <img src="/logo.png" alt="Vayuguard Logo" className="w-8 h-8" />
            <span className="text-black/80">Vayuguard AQI</span>
          </div>
        </div>
        <Separator className="opacity-0" />
      </header>

      <div className="flex-1 flex flex-col gap-1 w-full overflow-auto">
        {filteredNavigationSections.map((section, sectionIndex) => (
          <section
            key={sectionIndex}
            className="flex flex-col gap-1 pb-3 w-full"
          >
            <h3 className="px-2 py-1 text-sm text-gray-500">{section.title}</h3>

            {section.items.map((item, itemIndex) => {
              const isActive =
                location.pathname === item.path ||
                (location.pathname === "/" && item.path === "/dashboard");

              return (
                <Link key={itemIndex} to={item.path}>
                  <Button
                    variant="ghost"
                    className={`flex items-center gap-2 p-2 w-full justify-start h-auto text-sm font-light ${
                      isActive
                        ? "bg-[#04a9e7] hover:bg-[#04a9e7] text-white"
                        : "hover:bg-gray-200"
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Button>
                </Link>
              );
            })}
          </section>
        ))}
      </div>

      <footer className="mt-auto flex items-center justify-between w-full py-3 min-w-0">
        <div className="flex items-center gap-2 min-w-0 flex-1 overflow-hidden">
          <div className="relative flex-shrink-0">
            <Avatar className="w-8 h-8">
              <AvatarImage src="/ellipse-1.png" alt={displayName} />
              <AvatarFallback>{initials || "U"}</AvatarFallback>
            </Avatar>
          </div>
          <span className="font-medium text-sm truncate min-w-0 flex-1 block">
            {displayName}
          </span>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="w-8 h-8 p-1"
            onClick={() => logout((path: string) => navigate(path))}
            aria-label="Logout"
            title="Logout"
          >
            <LogOutIcon className="w-5 h-5" />
          </Button>
        </div>
      </footer>
    </nav>
  );
};

export default LeftNavbar;
