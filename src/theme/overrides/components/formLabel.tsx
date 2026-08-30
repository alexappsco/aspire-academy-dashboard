import { Theme } from '@mui/material/styles';

// ----------------------------------------------------------------------

export function formLabel(theme: Theme) {
  return {
    MuiFormLabel: {
      styleOverrides: {
        root: {
          display: 'block',
          marginBottom: theme.spacing(1),
          color: theme.palette.primary.main,
          fontWeight: 400,
        },
      },
    },
  };
}
