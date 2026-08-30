"use client";

import React, { useMemo, useState } from "react";
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Box,
  IconButton,
  CircularProgress,
  Typography,
  MenuItem,
  MenuList,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { useTranslations } from "next-intl";
import Iconify from "src/components/iconify";
import CustomPopover, { usePopover } from "src/components/custom-popover";
import TablePaginationCustom from "src/components/SharedTable/table-pagination-custom";
import { SimpleTableProps } from "./types";

function SimpleTable<T extends { id: string | number }>({
  data,
  headCells,
  actions,
  actionsHeaderLabel = "إجراءات",
  customRender,
  onRowClick,
  loading = false,
  emptyMessage = "لا توجد بيانات",
  serverPagination,
  hidePagination = false,
}: SimpleTableProps<T>) {
  const t = useTranslations();
  const popover = usePopover();
  const [selectedRowId, setSelectedRowId] = useState<string | number | null>(
    null,
  );
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [dense, setDense] = useState(false);

  const visibleHeadCells = useMemo(
    () => headCells.filter((cell) => cell.id !== "rowsActions"),
    [headCells],
  );

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    rowId: string | number,
  ) => {
    setSelectedRowId(rowId);
    popover.onOpen(event);
  };

  const selectedRow = useMemo(
    () => data.find((d) => d.id === selectedRowId),
    [data, selectedRowId],
  );

  const paginatedData = useMemo(() => {
    if (serverPagination) {
      return data;
    }

    return data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [data, page, rowsPerPage, serverPagination]);

  const handleChangePage = (
    event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number,
  ) => {
    if (serverPagination) {
      serverPagination.onPageChange(event, newPage);
      return;
    }

    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    if (serverPagination) {
      serverPagination.onRowsPerPageChange(event);
      return;
    }

    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginationCount = serverPagination?.count ?? data.length;
  const paginationPage = serverPagination?.page ?? page;
  const paginationRowsPerPage = serverPagination?.rowsPerPage ?? rowsPerPage;

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Box sx={{ width: "100%", overflowX: "auto", overflowY: "hidden" }}>
        <Table
          sx={{ minWidth: 700, borderCollapse: "collapse", width: "100%" }}
          size={dense ? "small" : "medium"}
        >
          <TableHead>
            <TableRow sx={{ backgroundColor: "#F4F6F8" }}>
              {visibleHeadCells.map((headCell) => (
                <TableCell
                  key={headCell.id}
                  sx={{
                    width: headCell.width,
                    fontWeight: 700,
                    color: "#6b7280",
                    whiteSpace: "nowrap",
                    verticalAlign: "middle",
                    // textAlign:
                    //   (headCell.align as React.CSSProperties["textAlign"]) ||
                    //   "left",
                            textAlign:
          (headCell.align as React.CSSProperties["textAlign"]) ||
          "center",
                    py: dense ? 0.5 : 1,
                    px: dense ? 1.5 : 2,
                    borderBottom: "1px solid #e5e7eb",
                    fontSize: "0.875rem",
                  }}
                >
                  {headCell.renderHeader
                    ? headCell.renderHeader()
                    : headCell.label}
                </TableCell>
              ))}
              {actions && actions.length > 0 && (
                <TableCell
                  align="center"
                  sx={{ fontWeight: 600, color: "#6b7280" }}
                >
                  {actionsHeaderLabel}
                </TableCell>
              )}
            </TableRow>
          </TableHead>

          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={
                    visibleHeadCells.length +
                    (actions && actions.length > 0 ? 1 : 0)
                  }
                  sx={{ textAlign: "center", py: 3 }}
                >
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    {emptyMessage}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((row) => (
                <TableRow
                  key={row.id}
                  hover
                  onClick={() => onRowClick?.(row)}
                  sx={{
                    cursor: onRowClick ? "pointer" : "default",
                    backgroundColor: "transparent",
                    transition: "background-color 0.2s ease",
                    "&:hover": {
                      backgroundColor: "rgba(249, 250, 251, 0.5)",
                    },
                  }}
                >
                  {visibleHeadCells.map((headCell, index) => (
                    <TableCell
                      key={`${row.id}-${headCell.id}`}
                      sx={{
                        whiteSpace: "nowrap",
                        verticalAlign: "middle",
                        textAlign:
                        (headCell.align as React.CSSProperties["textAlign"]) ||
                        "center",
                        py: dense ? 0.5 : 1,
                        px: dense ? 1.5 : 2,
                        color: index === 0 ? "#111827" : "#4b5563",
                        fontWeight: index === 0 ? 600 : 500,
                        fontSize: "0.9375rem",
                        borderBottom: "1px solid #f8fafc",
                      }}
                    >
                      {headCell.renderCell
                        ? headCell.renderCell(row)
                        : customRender && headCell.id in customRender
                          ? customRender[headCell.id as keyof T]?.(row)
                          : String(
                              (row as unknown as Record<string, unknown>)[
                                headCell.id
                              ],
                            )}
                    </TableCell>
                  ))}

                  {actions && actions.length > 0 && (
                    <TableCell
                      align="center"
                      sx={{
                        px: 1,
                        whiteSpace: "nowrap",
                        verticalAlign: "middle",
                        borderBottom: "1px solid #f8fafc",
                      }}
                    >
                      <IconButton
                        size="small"
                        onClick={(event) => {
                          event.stopPropagation();
                          handleMenuOpen(event, row.id);
                        }}
                        sx={{
                          p: 1.25,
                          borderRadius: 2,
                          "&:hover": {
                            backgroundColor: "#eef2ff",
                          },
                        }}
                        color={
                          popover.open && selectedRowId === row.id
                            ? "primary"
                            : "default"
                        }
                      >
                        <Iconify icon="eva:more-vertical-fill" />
                      </IconButton>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Box>

      {selectedRow && actions && actions.length > 0 && (
        <CustomPopover
          open={popover.open}
          onClose={popover.onClose}
          hiddenArrow
          sx={{
            width: "fit-content",
            minWidth: 180,
            boxShadow: "0 12px 24px rgba(0,0,0,0.12)",
          }}
        >
          <MenuList sx={{ py: 1, px: 0 }}>
            {actions
              .filter((action) =>
                action.hide ? !action.hide(selectedRow) : true,
              )
              .map((action, index) => (
                <MenuItem
                  key={index}
                  onClick={() => {
                    action.onClick(selectedRow);
                    popover.onClose();
                  }}
                  sx={{
                    px: 2.5,
                    py: 1.25,
                    minHeight: 48,
                    justifyContent: "flex-end",
                    gap: 1,
                    textAlign: "right",
                    color: "#111827",
                    borderRadius: 1,
                    transition: "background-color 0.2s ease",
                    "&:hover": {
                      backgroundColor: "rgba(59, 130, 246, 0.08)",
                    },
                    ...action.sx,
                  }}
                >
                  <ListItemText
                    primary={action.label}
                    sx={{
                      ml: 0,
                      mr: 0,
                      "& .MuiTypography-root": {
                        fontWeight: 600,
                        fontSize: "0.95rem",
                      },
                    }}
                  />
                  <ListItemIcon sx={{ minWidth: 28, color: "#6b7280" }}>
                    {action.icon}
                  </ListItemIcon>
                </MenuItem>
              ))}
          </MenuList>
        </CustomPopover>
      )}

      {!hidePagination && (
        <TablePaginationCustom
          count={paginationCount}
          page={paginationPage}
          rowsPerPage={paginationRowsPerPage}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 20]}
          dense={dense}
          onChangeDense={(event) => setDense(event.target.checked)}
          sx={{ mt: 2, px: 2 }}
          labelRowsPerPage={t("Global.Sections.Table.rows_per_page")}
          labelDisplayedRows={({ from, to, count: rows }) =>
            `${from}-${to} ${t("Global.Sections.Table.of")} ${rows !== -1 ? rows : `${t("Global.Sections.Table.more_than")} ${to}`}`
          }
        />
      )}
    </>
  );
}

export default React.memo(SimpleTable) as typeof SimpleTable;
