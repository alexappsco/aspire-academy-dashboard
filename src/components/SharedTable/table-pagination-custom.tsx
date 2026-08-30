import Box from '@mui/material/Box';
import Switch from '@mui/material/Switch';
import { useTranslations } from 'next-intl';
import { Theme, SxProps } from '@mui/material/styles';
import FormControlLabel from '@mui/material/FormControlLabel';
import TablePagination, { TablePaginationProps } from '@mui/material/TablePagination';

import { tableRowsPerPageOptions } from '../constant';

// ----------------------------------------------------------------------

type Props = {
  dense?: boolean;
  onChangeDense?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  sx?: SxProps<Theme>;
};

export default function TablePaginationCustom({
  dense,
  onChangeDense,
  rowsPerPageOptions = tableRowsPerPageOptions,
  sx,
  ...other
}: Props & TablePaginationProps) {
  const t = useTranslations();
  return (
    <Box sx={{ position: 'relative', ...sx }}>
      <TablePagination
        {...other}
        rowsPerPageOptions={rowsPerPageOptions}
        component="div"
        sx={{
          borderTopColor: 'transparent',
        }}
      />

      {onChangeDense && (
        <FormControlLabel
          label="Dense"
          control={<Switch checked={dense} onChange={onChangeDense} />}
          sx={{
            pl: 2,
            py: 1.5,
            top: 0,
            position: {
              sm: 'absolute',
            },
          }}
        />
      )}
    </Box>
  );
}
