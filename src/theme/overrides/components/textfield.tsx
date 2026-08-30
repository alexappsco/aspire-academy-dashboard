import { inputBaseClasses } from '@mui/material/InputBase';
import { alpha, Theme, darken } from '@mui/material/styles';
import { inputLabelClasses } from '@mui/material/InputLabel';
import { filledInputClasses } from '@mui/material/FilledInput';
import { OutlinedInputProps, outlinedInputClasses } from '@mui/material/OutlinedInput';

// ----------------------------------------------------------------------

export function textField(theme: Theme) {
  const color = {
    focused: theme.palette.text.primary,
    active: theme.palette.text.secondary,
    placeholder: theme.palette.text.disabled,
  };

  const font = {
    label: theme.typography.body1,
    value: theme.typography.body2,
  };

  return {
    // HELPER
    MuiFormHelperText: {
      styleOverrides: {
        root: {
          marginTop: theme.spacing(1),
        },
      },
    },

    // LABEL
    MuiInputLabel: {
      styleOverrides: {
        root: {
          ...font.value,
          color: color.active,
          [`&.${inputLabelClasses.shrink}`]: {
            ...font.label,
            fontWeight: 600,
            color: color.active,
            [`&.${inputLabelClasses.focused}`]: {
              color: color.focused,
            },
            [`&.${inputLabelClasses.error}`]: {
              color: theme.palette.error.main,
            },
            [`&.${inputLabelClasses.disabled}`]: {
              color: theme.palette.text.disabled,
            },
            [`&.${inputLabelClasses.filled}`]: {
              transform: 'translate(12px, 6px) scale(0.75)',
            },
          },
        },
      },
    },

    // BASE
    MuiInputBase: {
      styleOverrides: {
        root: {
          [`&.${inputBaseClasses.disabled}`]: {
            '& svg': {
              color: theme.palette.text.disabled,
            },
          },
        },
        input: {
          ...font.value,
          '&::placeholder': {
            opacity: 1,
            color: color.placeholder,
          },
        },
      },
    },

    // STANDARD
    MuiInput: {
      styleOverrides: {
        underline: {
          '&:before': {
            borderBottomColor: alpha(theme.palette.grey[500], 0.32),
          },
          '&:after': {
            borderBottomColor: color.focused,
          },
        },
      },
    },

    // OUTLINED
    MuiOutlinedInput: {
      styleOverrides: {
        root: ({ ownerState }: { ownerState: OutlinedInputProps }) => {
          const { color: stateColor } = ownerState;

          return {
            backgroundColor:
              stateColor && stateColor !== ('default' as 'primary')
                ? alpha(theme.palette[stateColor].light, 0.4)
                : undefined,
            borderRadius: 16,
            [`&.${outlinedInputClasses.focused}`]: {
              [`& .${outlinedInputClasses.notchedOutline}`]: {
                borderColor: color.focused,
              },
            },
            [`&.${outlinedInputClasses.error}`]: {
              [`& .${outlinedInputClasses.notchedOutline}`]: {
                borderColor: theme.palette.error.main,
              },
            },
            [`&.${outlinedInputClasses.disabled}`]: {
              [`& .${outlinedInputClasses.notchedOutline}`]: {
                borderColor: theme.palette.action.disabledBackground,
              },
            },
          };
        },
        notchedOutline: {
          borderColor: alpha(theme.palette.grey[500], 0.2),
          transition: theme.transitions.create(['border-color'], {
            duration: theme.transitions.duration.shortest,
          }),
        },
      },
    },

    // FILLED
    MuiFilledInput: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          backgroundColor: 'white',
          '&:hover': {
            backgroundColor: theme.palette.primary.light,
          },
          [`&.${filledInputClasses.focused}`]: {
            backgroundColor: theme.palette.primary.light,
          },
          [`&.${filledInputClasses.error}`]: {
            backgroundColor: theme.palette.error.lighter,
            '&:hover': {
              backgroundColor: darken(theme.palette.error.lighter, 0.1),
            },
            [`&.${filledInputClasses.focused}`]: {
              backgroundColor: darken(theme.palette.error.lighter, 0.1),
            },
          },
          [`&.${filledInputClasses.disabled}`]: {
            backgroundColor: theme.palette.action.disabledBackground,
          },
        },
      },
    },
  };
}
