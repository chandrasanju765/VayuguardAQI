import { useState } from "react";
import { useAtom } from "jotai";
import { aqiLogsSearchTextAtom } from "./jotai";
import { Button } from "../../components/ui/button";
import { useGetAQILogsByRole } from "../../data/cachedQueries";
import { getAuthData } from "../login/utils";

const AQILogsSearchbar = () => {
  const [searchText, setSearchText] = useAtom(aqiLogsSearchTextAtom);

  const authData = getAuthData();
  const userRole = authData?.role || "customer";
  const roleOrUserId = userRole === "admin" ? "admin" : authData?._id || "";

  const { mutate: mutateByRole } = useGetAQILogsByRole(roleOrUserId);

  const [isApplying, setIsApplying] = useState(false);

  const handleApply = async () => {
    setIsApplying(true);
    try {
      await mutateByRole();
    } catch (e) {
      // noop
    } finally {
      setIsApplying(false);
    }
  };

  const handleClear = async () => {
    setSearchText("");
    await mutateByRole();
  };

  return (
    <div className="flex items-center gap-3">
      <input
        type="text"
        placeholder="Search logs..."
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        className="border border-gray-200 rounded px-2 py-1 w-60"
      />

      <Button
        variant="outline"
        size="sm"
        onClick={handleApply}
        disabled={isApplying}
        className="px-3"
      >
        {isApplying ? "Applying..." : "Apply"}
      </Button>

      <Button variant="ghost" size="sm" onClick={handleClear} className="px-2">
        Clear
      </Button>
    </div>
  );
};

export default AQILogsSearchbar;
