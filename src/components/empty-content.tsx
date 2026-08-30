'use client';

import Box, { BoxProps } from '@mui/material/Box';
import Typography from '@mui/material/Typography';

type EmptyContentProps = BoxProps & {
  filled?: boolean;
  title?: string;
};

export default function EmptyContent({ filled, title, sx, ...other }: EmptyContentProps) {
  return (
    <Box
      sx={{
        alignItems: 'center',
        bgcolor: filled ? 'background.neutral' : 'transparent',
        borderRadius: 1,
        display: 'flex',
        justifyContent: 'center',
        textAlign: 'center',
        ...sx,
      }}
      {...other}
    >
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        {title}
      </Typography>
    </Box>
  );
}
