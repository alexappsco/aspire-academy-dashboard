'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { useTranslations } from 'next-intl';
import Iconify from 'src/components/iconify';

interface Props {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  periodFilter: string;
  onPeriodChange: (value: string) => void;
  universityFilter: string;
  onUniversityChange: (value: string) => void;
  countryFilter: string;
  onCountryChange: (value: string) => void;
  availableUniversities: string[];
  availableCountries: string[];
}

export default function PayoutFilterBar({
  searchQuery,
  onSearchChange,
  periodFilter,
  onPeriodChange,
  universityFilter,
  onUniversityChange,
  countryFilter,
  onCountryChange,
  availableUniversities,
  availableCountries,
}: Props) {
  const t = useTranslations('InstructorPayouts.filters');

  return (
    <Box
      sx={{
        p: 2,
        bgcolor: '#FFFFFF',
        borderRadius: 2.5,
        border: '1px solid #F1F5F9',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)',
        mb: 2.5,
      }}
    >
      <Stack
        direction={{ xs: 'column', lg: 'row' }}
        spacing={1.5}
        sx={{
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 1.5,
        }}
      >
        {/* Search input (Right side in RTL) */}
        <TextField
          size="small"
          placeholder={t('search_placeholder')}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="solar:magnifer-linear" width={18} sx={{ color: '#94A3B8' }} />
                </InputAdornment>
              ),
            },
          }}
          sx={{
            width: { xs: '100%', lg: 360 },
            '& .MuiOutlinedInput-root': { borderRadius: 2, fontSize: 13.5 },
          }}
        />

        {/* Filters Group (Left side in RTL) */}
        <Stack
          direction="row"
          spacing={1.5}
          sx={{
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: 1.5,
            width: { xs: '100%', lg: 'auto' },
          }}
        >
          {/* Period Filter */}
          <FormControl size="small" sx={{ minWidth: 140, flex: { xs: 1, sm: 'none' } }}>
            <Select
              value={periodFilter}
              onChange={(e) => onPeriodChange(e.target.value)}
              displayEmpty
              sx={{ borderRadius: 2, bgcolor: '#FFFFFF', fontSize: 13 }}
            >
              <MenuItem value="all">{t('all_periods')}</MenuItem>
              <MenuItem value="this_month">{t('this_month')}</MenuItem>
              <MenuItem value="last_month">{t('last_month')}</MenuItem>
              <MenuItem value="quarter">{t('this_quarter')}</MenuItem>
            </Select>
          </FormControl>

          {/* University Filter */}
          <FormControl size="small" sx={{ minWidth: 150, flex: { xs: 1, sm: 'none' } }}>
            <Select
              value={universityFilter}
              onChange={(e) => onUniversityChange(e.target.value)}
              displayEmpty
              sx={{ borderRadius: 2, bgcolor: '#FFFFFF', fontSize: 13 }}
            >
              <MenuItem value="all">{t('all_universities')}</MenuItem>
              {availableUniversities.map((uni) => (
                <MenuItem key={uni} value={uni}>
                  {uni}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Country Filter */}
          <FormControl size="small" sx={{ minWidth: 130, flex: { xs: 1, sm: 'none' } }}>
            <Select
              value={countryFilter}
              onChange={(e) => onCountryChange(e.target.value)}
              displayEmpty
              sx={{ borderRadius: 2, bgcolor: '#FFFFFF', fontSize: 13 }}
            >
              <MenuItem value="all">{t('all_countries')}</MenuItem>
              {availableCountries.map((c) => (
                <MenuItem key={c} value={c}>
                  {c}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </Stack>
    </Box>
  );
}
