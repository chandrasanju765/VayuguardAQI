import * as React from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  SearchIcon,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { Button } from "./button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from "./pagination";

// Base table components
const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
  <div className="relative w-full">
    <table
      ref={ref}
      className={cn("w-full caption-bottom text-sm", className)}
      {...props}
    />
  </div>
));
Table.displayName = "Table";

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn("[&_tr]:border-b", className)} {...props} />
));
TableHeader.displayName = "TableHeader";

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn("[&_tr:last-child]:border-0", className)}
    {...props}
  />
));
TableBody.displayName = "TableBody";

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn(
      "border-t bg-muted/50 font-medium [&>tr]:last:border-b-0",
      className
    )}
    {...props}
  />
));
TableFooter.displayName = "TableFooter";

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
      className
    )}
    {...props}
  />
));
TableRow.displayName = "TableRow";

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      "h-10 px-2 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
      className
    )}
    {...props}
  />
));
TableHead.displayName = "TableHead";

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn(
      "p-2 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
      className
    )}
    {...props}
  />
));
TableCell.displayName = "TableCell";

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn("mt-4 text-sm text-muted-foreground", className)}
    {...props}
  />
));
TableCaption.displayName = "TableCaption";

// Column definition type
export interface ColumnDef<T = any> {
  key: keyof T | string;
  title: string;
  sortable?: boolean;
  searchable?: boolean;
  render?: (value: any, row: T, index: number) => React.ReactNode;
  width?: string;
  className?: string;
  headerClassName?: string;
}

// Data table props
export interface DataTableProps<T = any> {
  data: T[];
  columns?: ColumnDef<T>[];
  itemsPerPage?: number;
  searchable?: boolean;
  sortable?: boolean;
  highlightRowKey?: string;
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
  tableClassName?: string;
  showPagination?: boolean;
  showItemCount?: boolean;
  variant?: "default" | "compact" | "bordered";
  onRowClick?: (row: T, index: number) => void;
  actions?: (row: T, index: number) => React.ReactNode;
}

// Enhanced DataTable component
export const DataTable = <T extends Record<string, any>>({
  data,
  columns,
  itemsPerPage = 10,
  searchable = true,
  sortable = true,
  highlightRowKey,
  loading = false,
  emptyMessage = "No data available",
  className,
  tableClassName,
  showPagination = true,
  showItemCount = true,
  variant = "default",
  onRowClick,
  actions,
}: DataTableProps<T>) => {
  const [currentPage, setCurrentPage] = React.useState(1);
  const [sortColumn, setSortColumn] = React.useState<string | null>(null);
  const [sortDirection, setSortDirection] = React.useState<"asc" | "desc">(
    "asc"
  );
  const [searchTerm, setSearchTerm] = React.useState("");

  // Auto-generate columns from data if not provided
  const autoColumns = React.useMemo(() => {
    if (!data.length) return [];

    const firstRow = data[0];
    return Object.keys(firstRow).map(
      (key): ColumnDef<T> => ({
        key,
        title:
          key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, " $1"),
        sortable: true,
        searchable: true,
        render: (value) => {
          // Handle complex objects with value and color (like your AQI data)
          if (typeof value === "object" && value !== null && "value" in value) {
            return (
              <span
                className={cn(
                  "text-sm truncate",
                  value.color || "text-gray-900"
                )}
              >
                {value.value}
              </span>
            );
          }

          // Handle regular values
          if (value === null || value === undefined) return "N/A";
          return String(value);
        },
      })
    );
  }, [data]);

  const finalColumns = columns || autoColumns;

  // Filter and sort data
  const processedData = React.useMemo(() => {
    let filtered = [...data];

    // Apply search filter
    if (searchTerm && searchable) {
      filtered = filtered.filter((item) =>
        finalColumns.some((col) => {
          if (!col.searchable) return false;
          const value = item[col.key as keyof T];
          if (typeof value === "object" && value !== null && "value" in value) {
            return String(value.value)
              .toLowerCase()
              .includes(searchTerm.toLowerCase());
          }
          return String(value).toLowerCase().includes(searchTerm.toLowerCase());
        })
      );
    }

    // Apply sorting
    if (sortColumn && sortable) {
      filtered.sort((a, b) => {
        let aValue = a[sortColumn];
        let bValue = b[sortColumn];

        // Handle complex objects with value property
        if (
          typeof aValue === "object" &&
          aValue !== null &&
          "value" in aValue
        ) {
          aValue = aValue.value;
        }
        if (
          typeof bValue === "object" &&
          bValue !== null &&
          "value" in bValue
        ) {
          bValue = bValue.value;
        }

        // Handle null/undefined values
        if (aValue === null || aValue === undefined) aValue = "";
        if (bValue === null || bValue === undefined) bValue = "";

        const result = String(aValue).localeCompare(String(bValue), undefined, {
          numeric: true,
        });
        return sortDirection === "asc" ? result : -result;
      });
    }

    return filtered;
  }, [
    data,
    finalColumns,
    searchTerm,
    sortColumn,
    sortDirection,
    searchable,
    sortable,
  ]);

  // Pagination
  const totalPages = showPagination
    ? Math.ceil(processedData.length / itemsPerPage)
    : 1;
  const paginatedData = showPagination
    ? processedData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
      )
    : processedData;

  // Handle sorting
  const handleSort = (columnKey: string) => {
    if (!sortable) return;

    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(columnKey);
      setSortDirection("asc");
    }
  };

  // Handle pagination
  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  };

  const handlePageClick = (page: number) => {
    setCurrentPage(page);
  };

  // Get visible page numbers
  const getVisiblePages = () => {
    const pages = [];
    const start = Math.max(1, currentPage - 2);
    const end = Math.min(totalPages, start + 4);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  const visiblePages = getVisiblePages();

  // Variant-specific styles
  const getContainerClasses = () => {
    const base = "w-full h-full flex flex-col";
    switch (variant) {
      case "compact":
        return cn(base, "p-2 border border-gray-200 rounded-lg");
      case "bordered":
        return cn(base, "p-4 border border-gray-200 rounded-lg shadow-sm");
      default:
        return cn(base, "p-4 border border-gray-200 rounded-lg");
    }
  };

  const getTableClasses = () => {
    const base = "table-auto";
    switch (variant) {
      case "compact":
        return cn(base, "text-xs min-w-full");
      default:
        return cn(base, "min-w-full w-max");
    }
  };

  return (
    <div className={cn(getContainerClasses(), className)}>
      {/* Search bar */}
      {searchable && (
        <div className="mb-4 flex items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Reset to first page when searching
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      )}

      {/* Table */}
      <div className="flex-1 overflow-x-auto overflow-y-auto min-h-0">
        <Table className={cn(getTableClasses(), tableClassName)}>
          <TableHeader>
            <TableRow>
              {finalColumns.map((column) => (
                <TableHead
                  key={String(column.key)}
                  className={cn(
                    variant === "compact" ? "px-1" : "px-2",
                    "text-left whitespace-nowrap",
                    column.sortable && sortable
                      ? "cursor-pointer hover:bg-gray-50"
                      : "",
                    column.headerClassName
                  )}
                  style={{ width: column.width, minWidth: column.width }}
                  onClick={() =>
                    column.sortable && handleSort(String(column.key))
                  }
                >
                  <div
                    className={cn(
                      "flex items-center gap-1",
                      variant === "compact" ? "text-xs" : "text-xs",
                      "text-gray-500 truncate"
                    )}
                  >
                    {column.title}
                    {column.sortable &&
                      sortable &&
                      sortColumn === column.key &&
                      (sortDirection === "asc" ? (
                        <ChevronUpIcon className="w-4 h-4" />
                      ) : (
                        <ChevronDownIcon className="w-4 h-4" />
                      ))}
                  </div>
                </TableHead>
              ))}
              {actions && (
                <TableHead className="w-[4%] px-2 whitespace-nowrap"></TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={finalColumns.length + (actions ? 1 : 0)}
                  className="text-center py-8 text-gray-500"
                >
                  Loading...
                </TableCell>
              </TableRow>
            ) : paginatedData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={finalColumns.length + (actions ? 1 : 0)}
                  className="text-center py-16 text-gray-500"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((row, rowIndex) => {
                const isHighlighted = highlightRowKey && row[highlightRowKey];
                return (
                  <TableRow
                    key={rowIndex}
                    className={cn(
                      isHighlighted ? "bg-gray-50" : "",
                      onRowClick ? "cursor-pointer hover:bg-gray-100" : "",
                      variant === "compact" ? "h-8" : ""
                    )}
                    onClick={() => onRowClick?.(row, rowIndex)}
                  >
                    {finalColumns.map((column) => (
                      <TableCell
                        key={String(column.key)}
                        className={cn(
                          variant === "compact" ? "px-1" : "px-2",
                          "whitespace-nowrap",
                          column.className
                        )}
                        style={{ width: column.width, minWidth: column.width }}
                      >
                        <div
                          className={cn(
                            variant === "compact" ? "text-xs" : "text-sm",
                            "truncate"
                          )}
                        >
                          {column.render
                            ? column.render(
                                row[column.key as keyof T],
                                row,
                                rowIndex
                              )
                            : (() => {
                                const value = row[column.key as keyof T];
                                // Handle complex objects with value and color
                                if (
                                  typeof value === "object" &&
                                  value !== null &&
                                  "value" in value
                                ) {
                                  return (
                                    <span
                                      className={cn(
                                        "text-sm truncate",
                                        value.color || "text-gray-900"
                                      )}
                                    >
                                      {value.value}
                                    </span>
                                  );
                                }

                                // Handle regular values
                                if (value === null || value === undefined)
                                  return (
                                    <span className="text-gray-400">N/A</span>
                                  );
                                return (
                                  <span className="text-gray-900">
                                    {String(value)}
                                  </span>
                                );
                              })()}
                        </div>
                      </TableCell>
                    ))}
                    {actions && (
                      <TableCell className="w-[4%] whitespace-nowrap">
                        {actions(row, rowIndex)}
                      </TableCell>
                    )}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {showPagination && (
        <div className="flex items-center justify-between w-full mt-4 flex-shrink-0">
          {showItemCount && (
            <div className="text-sm text-gray-500">
              Showing{" "}
              {processedData.length === 0
                ? 0
                : (currentPage - 1) * itemsPerPage + 1}{" "}
              to {Math.min(currentPage * itemsPerPage, processedData.length)} of{" "}
              {processedData.length} entries
            </div>
          )}

          {totalPages > 1 && (
            <Pagination className="flex items-center gap-2">
              <PaginationContent className="flex items-center gap-2">
                <PaginationItem>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-2"
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeftIcon className="w-4 h-4" />
                  </Button>
                </PaginationItem>

                {visiblePages.map((page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      href="#"
                      isActive={page === currentPage}
                      className={cn(
                        "px-3 py-1 rounded",
                        page === currentPage ? "bg-gray-100" : ""
                      )}
                      onClick={(e) => {
                        e.preventDefault();
                        handlePageClick(page);
                      }}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}

                <PaginationItem>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-2"
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRightIcon className="w-4 h-4" />
                  </Button>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      )}
    </div>
  );
};

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
};
