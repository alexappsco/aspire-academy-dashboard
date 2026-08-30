import { ReactNode } from 'react';
import { Theme, SxProps } from '@mui/material';

export enum cellAlignment {
  left = 'left',
  center = 'center',
  right = 'right',
}

export type headCellType = {
  id: string;
  align?: cellAlignment;
  label?: ReactNode;
  width?: number;
};
export type Action<T> = {
  label: React.ReactNode;
  icon: React.ReactNode;
  sx?: SxStyle;
  onClick: (row: T) => void;
  hide?: (row: T) => boolean;
};
export interface SharedTableProps<T> {
  tableHead: headCellType[];
  data: T[];
  actions?: Action<T>[];
  disablePagination?: boolean;
  customRender?: Partial<Record<keyof T, (row: T) => ReactNode>>;
  count: number;
  maxHeight?: number;
}
export interface SharedTableRowProps<T> {
  row: T;
  actions?: Action<T>[];
  customRender?:
    | Partial<Record<keyof T, (row: T) => ReactNode>>
    | Record<keyof T, (row: T) => ReactNode>;
  headIds: (keyof T)[];
  tableHead: headCellType[];
}
export type SxStyle = SxProps<Theme>;

// ----------------------------------------------------------------------

export type TableProps = {
  dense: boolean;
  //
  selected: string[];
  onSelectRow: (id: string) => void;
  onSelectAllRows: (checked: boolean, newSelecteds: string[]) => void;
  //
  onChangePage: (event: unknown, newPage: number) => void;
  onChangeRowsPerPage: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onChangeDense: (event: React.ChangeEvent<HTMLInputElement>) => void;
  //
  setDense: React.Dispatch<React.SetStateAction<boolean>>;
};
