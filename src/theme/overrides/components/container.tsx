import { Theme } from '@mui/material/styles';

// ----------------------------------------------------------------------

export function container(_theme: Theme) {
  return {
    MuiContainer: {
      defaultProps: {
        maxWidth: 'xl',
      },
    },
  };
}
