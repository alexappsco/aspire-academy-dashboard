'use client';

import { useTranslations } from 'next-intl';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';

import Iconify from 'src/components/iconify';
import SelectField from 'src/components/SelectField/SelectField';

import type { OrderStatusFilter } from '../hooks/use-orders';

type Props = {
  search: string;
  status: OrderStatusFilter;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: OrderStatusFilter) => void;
};

export default function OrdersFilters({ search, status, onSearchChange, onStatusChange }: Props) {
  const t = useTranslations('StudentOrders');

  return (
    <Stack direction={{ xs: 'column', lg: 'row' }} spacing={1.5} sx={{ p: 2 }}>
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
        value={status}
        onChange={(event) => onStatusChange(event.target.value as OrderStatusFilter)}
        sx={{ minWidth: { xs: '100%', lg: 170 } }}
      >
        <MenuItem value="all">{t('filters.all_statuses')}</MenuItem>
        <MenuItem value="Pending">{t('statuses.pending')}</MenuItem>
        <MenuItem value="Paid">{t('statuses.paid')}</MenuItem>
        <MenuItem value="Cancelled">{t('statuses.cancelled')}</MenuItem>
      </SelectField>
    </Stack>
  );
}
