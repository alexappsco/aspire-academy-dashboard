'use client';

import { useMemo } from 'react';
import { deepmerge } from '@mui/utils';
import CssBaseline from '@mui/material/CssBaseline';
import { useSettingsContext } from 'src/components/settings';
import { createTheme, ThemeOptions, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';

// system
import { palette } from './palette';
import { shadows } from './shadows';
import { typography } from './typography';
// options
import RTL from './options/right-to-left';
import { customShadows } from './custom-shadows';
import { componentsOverrides } from './overrides';
import { createPresets } from './options/presets';
import { createContrast } from './options/contrast';
import NextAppDirEmotionCacheProvider from './next-emotion-cache';

// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode;
};

export default function ThemeProvider({ children }: Props) {
  const settings = useSettingsContext();

  const presets = createPresets(settings.themeColorPresets);

  const contrast = createContrast(settings.themeContrast, settings.themeMode);

  const memoizedValue = useMemo(
    () => ({
      palette: {
        ...palette(settings.themeMode),
        ...presets.palette,
        ...contrast.palette,
      },
      customShadows: {
        ...customShadows(settings.themeMode),
        ...presets.customShadows,
      },
      direction: settings.themeDirection,
      shadows: shadows(settings.themeMode),
      shape: { borderRadius: 8 },
      typography,
    }),
    [
      settings.themeMode,
      settings.themeDirection,
      presets.palette,
      presets.customShadows,
      contrast.palette,
    ]
  );

  const theme = createTheme({
    ...memoizedValue,
    components: deepmerge(
      componentsOverrides(createTheme(memoizedValue as ThemeOptions)),
      contrast.components
    ),
  } as ThemeOptions);

  return (
    <NextAppDirEmotionCacheProvider options={{ key: 'css' }}>
      <MuiThemeProvider theme={theme}>
        <RTL themeDirection={settings.themeDirection}>
          <CssBaseline />
          {children}
        </RTL>
      </MuiThemeProvider>
    </NextAppDirEmotionCacheProvider>
  );
}
