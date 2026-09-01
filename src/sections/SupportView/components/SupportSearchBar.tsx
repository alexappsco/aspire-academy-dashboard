'use client';

import { Box, InputAdornment, TextField } from '@mui/material';
import { useTranslations } from 'next-intl';
import Iconify from 'src/components/iconify';

type SupportSearchBarProps = {
  value: string;
  onChange: (value: string) => void;
};

export default function SupportSearchBar({ value, onChange }: SupportSearchBarProps) {
  const t = useTranslations("Support");

  return (
    <Box sx={{ display: 'flex', pt: 3 }}>
      <TextField
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={t("search_placeholder")}
        
        size="small"
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="solar:magnifer-linear" sx={{ color: 'text.disabled' }} />
              </InputAdornment>
            ),
          },
        }}
        sx={{
          flex: 1,
          '& .MuiOutlinedInput-root': {
            borderRadius: '12px',
            textAlign: 'right',
            fontFamily: 'inherit',
            backgroundColor: '#fff',
          },
        }}
      />
    </Box>
  );
}
