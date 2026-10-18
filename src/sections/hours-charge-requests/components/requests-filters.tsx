'use client';

import { useLocale, useTranslations } from 'next-intl';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';

import DateInput from 'src/components/DateInput/DateInput';
import Iconify from 'src/components/iconify';
import SelectField from 'src/components/SelectField/SelectField';
import type { CountryDto } from 'src/sections/countries/types';

import type { StatusFilter } from '../types';

type Props = {
  search: string;
  fromDate: string;
  countryId: string;
  status: StatusFilter;
  countries: CountryDto[];
  onSearchChange: (value: string) => void;
  onDateChange: (value: string) => void;
  onCountryChange: (value: string) => void;
  onStatusChange: (value: StatusFilter) => void;
};

export default function HoursChargeRequestFilters({
  search,
  fromDate,
  countryId,
  status,
  countries,
  onSearchChange,
  onDateChange,
  onCountryChange,
  onStatusChange,
}: Props) {
  const t = useTranslations('HoursChargeRequests');
  const locale = useLocale();

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

      <Box sx={{ minWidth: { xs: '100%', lg: 170 } }}>
        <DateInput
          fullWidth
          size="small"
          value={fromDate}
          placeholder={t('filters.date_placeholder')}
          onChange={onDateChange}
        />
      </Box>

      <SelectField
        size="small"
        value={countryId}
        slotProps={{ select: { displayEmpty: true } }}
        onChange={(event) => onCountryChange(event.target.value)}
        sx={{ minWidth: { xs: '100%', lg: 170 } }}
      >
        <MenuItem value="all">{t('filters.all_countries')}</MenuItem>
        {countries.map((country) => (
          <MenuItem key={country.id} value={country.id}>
            {locale === 'ar' ? country.nameAr : country.nameEn}
          </MenuItem>
        ))}
      </SelectField>

      <SelectField
        size="small"
        value={status}
        onChange={(event) => onStatusChange(event.target.value as StatusFilter)}
        sx={{ minWidth: { xs: '100%', lg: 170 } }}
      >
        <MenuItem value="all">{t('filters.all_statuses')}</MenuItem>
        <MenuItem value="Pending">{t('statuses.pending')}</MenuItem>
        <MenuItem value="Approved">{t('statuses.approved')}</MenuItem>
        <MenuItem value="Rejected">{t('statuses.rejected')}</MenuItem>
      </SelectField>
    </Stack>
  );
}