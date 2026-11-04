'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import { useTranslations } from 'next-intl';

import DateInput from 'src/components/DateInput/DateInput';
import Iconify from 'src/components/iconify';
import SelectField from 'src/components/SelectField/SelectField';

interface Props {
  search: string;
  type: string;
  fromDate: string;
  toDate: string;
  currencyId: string;
  currencies: { id: string; name: string; code: string }[];
  onSearchChange: (value: string) => void;
  onTypeChange: (value: string) => void;
  onFromDateChange: (value: string) => void;
  onToDateChange: (value: string) => void;
  onCurrencyChange: (value: string) => void;
}

export default function InvoicesFilters({
  search,
  type,
  fromDate,
  toDate,
  currencyId,
  currencies,
  onSearchChange,
  onTypeChange,
  onFromDateChange,
  onToDateChange,
  onCurrencyChange,
}: Props) {
  const t = useTranslations('Invoices.filters');

  return (
    <Card
      sx={{
        p: 2,
        mb: 3,
        borderRadius: 2.5,
        border: '1px solid #E2E8F0',
        boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
        bgcolor: '#FFFFFF',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 1.5,
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* 1. Search Bar (Right in RTL) */}
        <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 260px' } }}>
          <TextField
            fullWidth
            size="small"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t('search_placeholder')}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconify icon="solar:magnifer-linear" width={20} sx={{ color: '#94A3B8' }} />
                  </InputAdornment>
                ),
                endAdornment: search ? (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => onSearchChange('')}>
                      <Iconify icon="solar:close-circle-bold" width={18} sx={{ color: '#94A3B8' }} />
                    </IconButton>
                  </InputAdornment>
                ) : null,
                sx: {
                  borderRadius: 2,
                  bgcolor: '#FFFFFF',
                  fontSize: 13,
                },
              },
            }}
          />
        </Box>

        {/* 2. Type Select */}
        <Box sx={{ width: { xs: '100%', sm: 'auto' }, minWidth: { sm: 160 }, flex: { sm: '1 1 160px' } }}>
          <SelectField
            fullWidth
            size="small"
            value={type}
            onChange={(e) => onTypeChange(e.target.value)}
            slotProps={{
              select: {
                displayEmpty: true,
              },
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                fontSize: 13,
              },
            }}
          >
            <MenuItem value="" sx={{ fontSize: 13 }}>
              {t('type_label')}
            </MenuItem>
            <MenuItem value="all" sx={{ fontSize: 13 }}>
              {t('all')}
            </MenuItem>
            <MenuItem value="Purchase" sx={{ fontSize: 13 }}>
              {t('types.purchase')}
            </MenuItem>
            <MenuItem value="WalletCharge" sx={{ fontSize: 13 }}>
              {t('types.wallet_charge')}
            </MenuItem>
          </SelectField>
        </Box>

        {/* 3. From Date */}
        <Box sx={{ width: { xs: '100%', sm: 'auto' }, minWidth: { sm: 150 }, flex: { sm: '1 1 150px' } }}>
          <DateInput
            fullWidth
            size="small"
            value={fromDate}
            placeholder={t('from_date')}
            onChange={onFromDateChange}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                fontSize: 13,
              },
            }}
          />
        </Box>

        {/* 4. To Date */}
        <Box sx={{ width: { xs: '100%', sm: 'auto' }, minWidth: { sm: 150 }, flex: { sm: '1 1 150px' } }}>
          <DateInput
            fullWidth
            size="small"
            value={toDate}
            placeholder={t('to_date')}
            onChange={onToDateChange}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                fontSize: 13,
              },
            }}
          />
        </Box>

        {/* 5. Currency Select */}
        <Box sx={{ width: { xs: '100%', sm: 'auto' }, minWidth: { sm: 140 }, flex: { sm: '1 1 140px' } }}>
          <SelectField
            fullWidth
            size="small"
            value={currencyId}
            onChange={(e) => onCurrencyChange(e.target.value)}
            slotProps={{
              select: {
                displayEmpty: true,
              },
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                fontSize: 13,
              },
            }}
          >
            <MenuItem value="" sx={{ fontSize: 13 }}>
              {t('currency_label')}
            </MenuItem>
            <MenuItem value="all" sx={{ fontSize: 13 }}>
              {t('all_currencies')}
            </MenuItem>
            {currencies.map((curr) => (
              <MenuItem key={curr.id} value={curr.id} sx={{ fontSize: 13 }}>
                {curr.code || curr.name}
              </MenuItem>
            ))}
          </SelectField>
        </Box>
      </Box>
    </Card>
  );
}
