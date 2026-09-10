'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

export default function ReportsHeader() {
  const t = useTranslations('Reports');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedFilter, setSelectedFilter] = useState(t('filter'));
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelect = (value: string) => {
    setSelectedFilter(value);
    handleClose();
  };

  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={2}
      sx={{
        justifyContent: 'space-between',
        alignItems: { xs: 'flex-start', sm: 'center' },
        mb: 2.5,
      }}
    >
      <Box>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 800,
            color: '#1E293B',
            fontSize: { xs: 22, md: 24 },
            mb: 0.25,
          }}
        >
          {t('title')}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: '#64748B',
            fontSize: 12,
            fontWeight: 500,
            maxWidth: 500,
            lineHeight: 1.5,
          }}
        >
          {t('subtitle')}
        </Typography>
      </Box>

      <Button
        variant="outlined"
        onClick={handleClick}
        endIcon={<KeyboardArrowDownIcon sx={{ fontSize: 18 }} />}
        sx={{
          borderColor: '#CBD5E1',
          color: '#334155',
          bgcolor: '#FFFFFF',
          fontWeight: 600,
          fontSize: 13,
          borderRadius: 2,
          px: 2,
          py: 0.85,
          height: 36,
          boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
          textTransform: 'none',
          '&:hover': {
            borderColor: '#94A3B8',
            bgcolor: '#F8FAFC',
          },
        }}
      >
        {selectedFilter}
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: {
            sx: {
              mt: 1,
              borderRadius: 2,
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              minWidth: 160,
            },
          },
        }}
      >
        {['Last 30 Days', 'Last 90 Days', 'This Year'].map((option) => (
          <MenuItem
            key={option}
            onClick={() => handleSelect(option)}
            sx={{
              fontSize: 13,
              fontWeight: selectedFilter === option ? 700 : 500,
              color: selectedFilter === option ? '#00A980' : '#334155',
              px: 2,
              py: 1,
            }}
          >
            {option}
          </MenuItem>
        ))}
      </Menu>
    </Stack>
  );
}
