import { Theme } from '@mui/material/styles';

// ----------------------------------------------------------------------

export function cssBaseline(_theme: Theme) {
  return {
    MuiCssBaseline: {
      styleOverrides: {
        '*': {
          boxSizing: 'border-box',
        },
        '::-webkit-scrollbar': {
          width: 10,
          height: 10,
        },
        '::-webkit-scrollbar-track': {
          bgcolor: '#F3F4F6',
        },
        '::-webkit-scrollbar-thumb': {
          bgcolor: '#B5D2C3',
          borderRadius: 8,
        },
        '::-webkit-scrollbar-thumb:hover': {
          bgcolor: '#86B79D',
        },
        html: {
          margin: 0,
          padding: 0,
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'thin',
          scrollbarColor: '#B5D2C3 #F3F4F6',
        },
        body: {
          margin: 0,
          padding: 0,
        },
        '#root, #__next': {
          width: '100%',
          height: '100%',
        },
        input: {
          '&[type=number]': {
            MozAppearance: 'textfield',
            '&::-webkit-outer-spin-button': {
              margin: 0,
              WebkitAppearance: 'none',
            },
            '&::-webkit-inner-spin-button': {
              margin: 0,
              WebkitAppearance: 'none',
            },
          },
        },
        img: {
          maxWidth: '100%',
          display: 'inline-block',
          verticalAlign: 'bottom',
        },
      },
    },
  };
}
