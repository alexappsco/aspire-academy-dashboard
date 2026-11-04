'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import { useTranslations } from 'next-intl';

import Iconify from 'src/components/iconify';
import SelectField from 'src/components/SelectField/SelectField';

interface Props {
  search: string;
  type: string;
  status: string;
  onSearchChange: (value: string) => void;
  onTypeChange: (value: string) => void;
  onStatusChange: (value: string) => void;
}

export default function InvoicesFilters({
  search,
  type,
  status,
  onSearchChange,
  onTypeChange,
  onStatusChange,
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
          flexDirection: { xs: 'column', md: 'row' },
          gap: 2,
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* 1. Search Bar (Far Right in RTL) */}
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
          sx={{ flex: { xs: 1, md: 1.6 } }}
        />

        {/* 2. Invoice Type (Middle in RTL) */}
        <Box sx={{ width: { xs: '100%', md: 220 } }}>
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
            <MenuItem value="course_purchase" sx={{ fontSize: 13 }}>
              {t('types.course_purchase')}
            </MenuItem>
            <MenuItem value="private_charge" sx={{ fontSize: 13 }}>
              {t('types.private_charge')}
            </MenuItem>
          </SelectField>
        </Box>

        {/* 3. Invoice Status (Far Left in RTL) */}
        <Box sx={{ width: { xs: '100%', md: 220 } }}>
          <SelectField
            fullWidth
            size="small"
            value={status}
            onChange={(e) => onStatusChange(e.target.value)}
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
              {t('status_label')}
            </MenuItem>
            <MenuItem value="all" sx={{ fontSize: 13 }}>
              {t('all')}
            </MenuItem>
            <MenuItem value="issued" sx={{ fontSize: 13 }}>
              {t('statuses.issued')}
            </MenuItem>
            <MenuItem value="cancelled" sx={{ fontSize: 13 }}>
              {t('statuses.cancelled')}
            </MenuItem>
          </SelectField>
        </Box>
      </Box>
    </Card>
  );
}
