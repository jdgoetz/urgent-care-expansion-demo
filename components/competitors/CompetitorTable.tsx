"use client";

import { flexRender, getCoreRowModel, useReactTable, type ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";

import type { DemoCompetitor } from "@/lib/types";

export default function CompetitorTable({ competitors }: { competitors: DemoCompetitor[] }) {
  const columns = useMemo<ColumnDef<DemoCompetitor>[]>(() => [
    { accessorKey: "name", header: "Competitor" },
    { accessorKey: "rating", header: "Rating" },
    { accessorKey: "reviewCount", header: "Reviews" },
    { accessorKey: "weeklyHours", header: "Weekly hours" },
    { accessorKey: "operatorType", header: "Operator / type" },
    {
      id: "links",
      header: "Links",
      cell: ({ row }) => (
        <span className="table-links">
          {row.original.websiteUrl && <a href={row.original.websiteUrl} target="_blank" rel="noreferrer">Website</a>}
          <a href={row.original.mapUrl} target="_blank" rel="noreferrer">Map</a>
        </span>
      ),
    },
  ], []);
  const table = useReactTable({ data: competitors, columns, getCoreRowModel: getCoreRowModel() });
  return (
    <div className="table-scroll">
      <table className="data-table">
        <thead>
          {table.getHeaderGroups().map((group) => (
            <tr key={group.id}>
              {group.headers.map((header) => <th key={header.id}>{flexRender(header.column.columnDef.header, header.getContext())}</th>)}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

