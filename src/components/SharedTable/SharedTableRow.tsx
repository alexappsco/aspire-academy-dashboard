import React from 'react';
import { IconButton } from '@mui/material';
import Iconify from 'src/components/iconify';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import { MenuItem, ListItemIcon, ListItemText, MenuList } from '@mui/material';

import CustomPopover from '../custom-popover';
import { usePopover } from '../custom-popover';
import { SxStyle, SharedTableRowProps } from './types';

function SharedTableRow<T extends { id: string }>({
  row,
  actions,
  customRender,
  headIds,
  tableHead,
}: SharedTableRowProps<T>) {
  let rowStyle: SxStyle = {};

  if (Object.hasOwn(row, 'rowSx')) {
    rowStyle = (row as unknown as { rowSx: SxStyle }).rowSx;
  }
  const popover = usePopover();

  return (
    <>
      <TableRow hover sx={rowStyle}>
        {headIds.map((x, index) => {
          const headCell = tableHead.find((h) => h.id === x);
          const align = headCell?.align || 'left';
          return (
            <TableCell key={index} align={align} sx={{ whiteSpace: 'nowrap', borderBottom: 'none' }}>
              {customRender && x in customRender ? customRender[x]!(row) : String((row as Record<string, unknown>)[x as string] ?? '')}
            </TableCell>
          );
        })}

        {!!actions?.length && (
          <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap', borderBottom: 'none' }}>
            <IconButton color={popover.open ? 'inherit' : 'default'} onClick={popover.onOpen}>
              <Iconify icon="eva:more-vertical-fill" />
            </IconButton>
          </TableCell>
        )}
      </TableRow>

      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="right-top"
        sx={{ minWidth: 140 }}
      >
        <MenuList>
          {actions
            ?.filter((action) => (action.hide ? !action.hide(row) : true))
            .map((action, index) => (
              <MenuItem
                key={index}
                onClick={() => {
                  action.onClick(row);
                  popover.onClose();
                }}
                sx={action.sx}
              >
                <ListItemIcon>{action.icon}</ListItemIcon>
                <ListItemText>{action.label}</ListItemText>
              </MenuItem>
            ))}
        </MenuList>
      </CustomPopover>
    </>
  );
}

export default React.memo(SharedTableRow) as typeof SharedTableRow;
