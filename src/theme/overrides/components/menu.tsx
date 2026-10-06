import { Theme } from '@mui/material/styles';

import { menuItem } from '../../css';

// ----------------------------------------------------------------------

export function menu(theme: Theme) {
  return {
    MuiMenuItem: {
      styleOverrides: {
        root: {
          ...menuItem(theme),
          '&.Mui-selected': {
            backgroundColor: 'transparent !important',
            '&:hover': {
              backgroundColor: `${theme.palette.action.hover} !important`,
            },
            '&.Mui-focusVisible': {
              backgroundColor: `${theme.palette.action.hover} !important`,
            },
          },
        },
      },
    },
  };
}
