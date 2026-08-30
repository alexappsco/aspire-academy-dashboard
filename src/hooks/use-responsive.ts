import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme, Breakpoint } from '@mui/material/styles';

// ----------------------------------------------------------------------

type ReturnType = boolean;

export type Query = 'up' | 'down' | 'between' | 'only';

export type Value = Breakpoint | number;

export function useResponsive(query: Query, start?: Value, end?: Value): ReturnType {
  const theme = useTheme();

  const mediaUp = useMediaQuery(theme.breakpoints.up(start as Value));

  const mediaDown = useMediaQuery(theme.breakpoints.down(start as Value));

  const mediaBetween = useMediaQuery(theme.breakpoints.between(start as Value, end as Value));

  const mediaOnly = useMediaQuery(theme.breakpoints.only(start as Breakpoint));

  if (query === 'up') {
    return mediaUp;
  }

  if (query === 'down') {
    return mediaDown;
  }

  if (query === 'between') {
    return mediaBetween;
  }

  return mediaOnly;
}

// ----------------------------------------------------------------------

type BreakpointOrNull = Breakpoint | null;

export function useWidth() {
  const theme = useTheme();

  const keys = [...theme.breakpoints.keys].reverse() as Breakpoint[];

  const isXl = useMediaQuery(theme.breakpoints.up('xl'));
  const isLg = useMediaQuery(theme.breakpoints.up('lg'));
  const isMd = useMediaQuery(theme.breakpoints.up('md'));
  const isSm = useMediaQuery(theme.breakpoints.up('sm'));
  const isXs = useMediaQuery(theme.breakpoints.up('xs'));

  const matches = [isXl, isLg, isMd, isSm, isXs];

  return (
    matches.reduce((output: BreakpointOrNull, match, index) => {
      return !output && match ? keys[index] : output;
    }, null) || 'xs'
  );
}
