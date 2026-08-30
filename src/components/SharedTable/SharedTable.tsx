'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import { useTranslations } from 'next-intl';
import TableBody from '@mui/material/TableBody';
import { useSearchParams } from 'next/navigation';
import TableContainer from '@mui/material/TableContainer';

import useTable from './use-table';
import TableNoData from './table-no-data';
import { SharedTableProps } from './types';
import { DEFAULT_LIMIT } from '../constant';
import SharedTableRow from './SharedTableRow';
import TableHeadCustom from './table-head-custom';
import TablePaginationCustom from './table-pagination-custom';
// ----------------------------------------------------------------------
function SharedTable<T extends { id: string }>({
  data,
  actions,
  tableHead,
  disablePagination,
  customRender,
  count,
  maxHeight,
}: SharedTableProps<T>) {
  const table = useTable();
  const searchParams = useSearchParams();
  const t = useTranslations();

  const hasPage = searchParams.get('page');

  const page = hasPage ? Number(searchParams.get('page')) - 1 : 0;
  const limit = Number(searchParams.get('limit')) || DEFAULT_LIMIT;
  const paginatedData = data.slice(page * limit, page * limit + limit);
  return (
    <Box>
      <TableContainer
        sx={{
          position: 'relative',
          overflow: 'auto',
          ...(maxHeight && { maxHeight: `${maxHeight}px` }),
        }}
      >
          <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 960 }}>
            <TableHeadCustom headLabel={tableHead} enableActions={!!actions?.length} />

            <TableBody>
              {paginatedData.map((row) => (
                <SharedTableRow<T>
                  key={row.id}
                  row={row}
                  actions={actions}
                  customRender={customRender}
                  tableHead={tableHead}
                  headIds={
                    tableHead
                      .map((x) => x.id)
                      .filter((x) => x !== '' && x !== 'rowsActions') as (keyof T)[]
                  }
                />
              ))}

              <TableNoData notFound={!data.length} />
            </TableBody>
          </Table>
      </TableContainer>

      {!disablePagination && (
        <TablePaginationCustom
          count={count}
          page={page}
          rowsPerPage={limit}
          onPageChange={table.onChangePage!}
          onRowsPerPageChange={table.onChangeRowsPerPage!}
          labelRowsPerPage={t('Global.Sections.Table.rows_per_page')}
          labelDisplayedRows={({ from, to, count: rows }) =>
            `${from}-${to} ${t('Global.Sections.Table.of')} ${
              rows !== -1 ? rows : `${t('Global.Sections.Table.more_than')} ${to}`
            }`
          }
          //
          dense={table.dense!}
          onChangeDense={table.onChangeDense!}
        />
      )}
    </Box>
  );
}

export default React.memo(SharedTable) as typeof SharedTable;
