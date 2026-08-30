import type { ReactNode } from "react";
import { SxProps, Theme } from "@mui/material/styles";

export type HeadCell<T = unknown> = {
  id: string;
  label: string;
  align?: string;
  width?: string | number;
  renderHeader?: () => ReactNode;
  renderCell?: (row: T) => ReactNode;
};

export type TableAction<T> = {
  label: string;
  icon?: ReactNode;
  onClick: (row: T) => void;
  sx?: SxProps<Theme>;
  hide?: (row: T) => boolean;
};

export type CustomRender<T> = {
  [key: string]: ((row: T) => React.ReactNode) | undefined;
};

export type ServerPaginationProps = {
  count: number;
  page: number;
  rowsPerPage: number;
  onPageChange: (
    event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number
  ) => void;
  onRowsPerPageChange: (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
};

export interface SimpleTableProps<T extends { id: string | number }> {
  data: T[];
  headCells: HeadCell<T>[];
  actions?: TableAction<T>[];
  actionsHeaderLabel?: string;
  customRender?: CustomRender<T>;
  onRowClick?: (row: T) => void;
  loading?: boolean;
  emptyMessage?: string;
  serverPagination?: ServerPaginationProps;
  hidePagination?: boolean;
}
