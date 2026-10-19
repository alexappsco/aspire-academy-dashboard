'use client';

import { useTranslations } from 'next-intl';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';

import Iconify from 'src/components/iconify';
import SelectField from 'src/components/SelectField/SelectField';
import type { AdminSessionRequestType } from 'src/types/admin-session-request';

type Props = {
  search: string;
  type: 'all' | AdminSessionRequestType;
  onSearchChange: (value: string) => void;
  onTypeChange: (value: 'all' | AdminSessionRequestType) => void;
};

export default function AdminSessionRequestFilters({
  search,
  type,
  onSearchChange,
  onTypeChange,
}: Props) {
  const t = useTranslations('AdminSessionRequests');

  return (
    <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} sx={{ p: 2 }}>
      <TextField
        fullWidth
        size="small"
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder={t('filters.search_placeholder')}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="solar:magnifer-linear" width={20} />
              </InputAdornment>
            ),
            endAdornment: search ? (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => onSearchChange('')}>
                  <Iconify icon="solar:close-circle-bold" width={18} />
                </IconButton>
              </InputAdornment>
            ) : null,
          },
        }}
      />

      <SelectField
        size="small"
        value={type}
        slotProps={{ select: { displayEmpty: true } }}
        onChange={(event) => onTypeChange(event.target.value as 'all' | AdminSessionRequestType)}
        sx={{ minWidth: { xs: '100%', md: 190 } }}
      >
        <MenuItem value="all">{t('filters.all_service_types')}</MenuItem>
        <MenuItem value="Live">{t('service_types.Live')}</MenuItem>
        <MenuItem value="Recorded">{t('service_types.Recorded')}</MenuItem>
      </SelectField>
    </Stack>
  );
}
