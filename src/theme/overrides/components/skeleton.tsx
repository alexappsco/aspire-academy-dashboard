import { Theme } from '@mui/material/styles';

import { borderRadius } from '../../css';

// ----------------------------------------------------------------------

export function skeleton(theme: Theme) {
  return {
    MuiSkeleton: {
      styleOverrides: {
        root: {
          backgroundColor: theme.palette.background.neutral,
        },
        rounded: {
          borderRadius: borderRadius(theme, 2),
        },
      },
    },
  };
}
