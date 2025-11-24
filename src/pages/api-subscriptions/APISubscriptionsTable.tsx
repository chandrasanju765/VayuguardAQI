import { useSetAtom, useAtomValue } from "jotai";
import { DataTable } from "../../components/ui/table";
import {
  toggleAPISubscriptionSelectionAtom,
  selectedAPISubscriptionAtom,
} from "./jotai";
import { useGetAPISubscriptions } from "../../data/cachedQueries";
import { useMemo, useState } from "react";
import { Eye, EyeOff, Copy, Check } from "lucide-react";
import { Button } from "../../components/ui/button";
import toast from "react-hot-toast";
import type { APISubscription } from "../../models/APISubscriptions";

const APISubscriptionsTable = () => {
  const setToggleAPISubscriptionSelectionAtom = useSetAtom(
    toggleAPISubscriptionSelectionAtom
  );
  const selectedAPISubscription = useAtomValue(selectedAPISubscriptionAtom);

  // State to track which API keys are visible
  const [visibleApiKeys, setVisibleApiKeys] = useState<Set<string>>(new Set());
  const [copiedKeys, setCopiedKeys] = useState<Set<string>>(new Set());

  const { data } = useGetAPISubscriptions();
  const APISubscriptions = data?.data || [];
  const columns = data?.columns || {};

  const handleRowClick = (APISubscription: APISubscription) => {
    setToggleAPISubscriptionSelectionAtom(APISubscription);
  };

  const toggleApiKeyVisibility = (
    subscriptionId: string,
    event: React.MouseEvent
  ) => {
    event.stopPropagation(); // Prevent row click
    setVisibleApiKeys((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(subscriptionId)) {
        newSet.delete(subscriptionId);
      } else {
        newSet.add(subscriptionId);
      }
      return newSet;
    });
  };

  const copyApiKey = async (
    apiKey: string,
    subscriptionId: string,
    event: React.MouseEvent
  ) => {
    event.stopPropagation(); // Prevent row click
    try {
      await navigator.clipboard.writeText(apiKey);
      setCopiedKeys((prev) => new Set([...prev, subscriptionId]));
      toast.success("API key copied to clipboard!");

      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopiedKeys((prev) => {
          const newSet = new Set(prev);
          newSet.delete(subscriptionId);
          return newSet;
        });
      }, 2000);
    } catch (error) {
      toast.error("Failed to copy API key");
    }
  };

  const tableColumns = useMemo(() => {
    // Add radio button column at the beginning
    const radioColumn = {
      key: "selection" as const,
      title: "",
      render: (_value: any, row: APISubscription) => {
        const isSelected = selectedAPISubscription?._id === row._id;
        return (
          <div className="flex items-center justify-center">
            <input
              type="radio"
              name="apiSubscriptionSelection"
              checked={isSelected}
              onChange={() => setToggleAPISubscriptionSelectionAtom(row)}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 focus:ring-2"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        );
      },
      width: "w-[60px]",
    };

    const cols = Object.entries(columns).map(([key, title]) => {
      const typedKey = key as keyof APISubscription;
      return {
        key: typedKey,
        title: String(title),
        render: (
          value: APISubscription[keyof APISubscription],
          row: APISubscription
        ) => {
          if (typeof value === "boolean") {
            return <span>{value ? "Yes" : "No"}</span>;
          }
          if (typedKey === "deviceId" && typeof value === "object") {
            return <span>{value?.name || "-"}</span>;
          }
          if (typedKey === "apiKey" && typeof value === "string") {
            const isVisible = visibleApiKeys.has(row.subscriptionId);
            const isCopied = copiedKeys.has(row.subscriptionId);

            return (
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm">
                  {isVisible ? value : "••••••••••••••••"}
                </span>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={(e) =>
                      toggleApiKeyVisibility(row.subscriptionId, e)
                    }
                  >
                    {isVisible ? <EyeOff size={14} /> : <Eye size={14} />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={(e) => copyApiKey(value, row.subscriptionId, e)}
                  >
                    {isCopied ? (
                      <Check size={14} className="text-green-600" />
                    ) : (
                      <Copy size={14} />
                    )}
                  </Button>
                </div>
              </div>
            );
          }
          return <span>{value ? String(value) : "-"}</span>;
        },
      };
    });
    return [radioColumn, ...cols];
  }, [
    columns,
    visibleApiKeys,
    copiedKeys,
    selectedAPISubscription,
    setToggleAPISubscriptionSelectionAtom,
  ]);

  return (
    <div className="h-full flex flex-col">
      <DataTable
        data={APISubscriptions}
        searchable={false}
        onRowClick={handleRowClick}
        columns={tableColumns}
        className="h-full flex flex-col"
        emptyMessage="No API subscriptions found"
      />
    </div>
  );
};

export default APISubscriptionsTable;
