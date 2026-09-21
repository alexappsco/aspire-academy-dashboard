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
import EventRoundedIcon from '@mui/icons-material/EventRounded';

import Iconify from 'src/components/iconify';

interface Props {
  totalCourses: number;
  periodLabel: string;
}

export default function InstructorHeader({ totalCourses, periodLabel }: Props) {
  const t = useTranslations('InstructorAnalytics.header');

  const [coursesAnchor, setCoursesAnchor] = useState<null | HTMLElement>(null);
  const [periodAnchor, setPeriodAnchor] = useState<null | HTMLElement>(null);
  const [selectedCourses, setSelectedCourses] = useState(t('all_courses', { count: String(totalCourses) }));
  const [selectedPeriod, setSelectedPeriod] = useState(periodLabel);

  const openCourses = Boolean(coursesAnchor);
  const openPeriod = Boolean(periodAnchor);

  return (
    <Stack
      direction={{ xs: 'column', lg: 'row' }}
      spacing={2}
      sx={{
        justifyContent: 'space-between',
        alignItems: { xs: 'flex-start', lg: 'center' },
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
            maxWidth: 560,
            lineHeight: 1.5,
          }}
        >
          {t('subtitle')}
        </Typography>
      </Box>

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1}
        sx={{ alignItems: { xs: 'stretch', sm: 'center' }, flexShrink: 0 }}
      >
        <Button
          variant="contained"
          startIcon={<Iconify icon="solar:download-minimalistic-bold" width={18} />}
          sx={{
            bgcolor: '#0F172A',
            color: '#FFFFFF',
            fontWeight: 700,
            fontSize: 13,
            borderRadius: 2,
            px: 2,
            py: 0.85,
            height: 38,
            boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
            textTransform: 'none',
            '&:hover': { bgcolor: '#1E293B' },
          }}
        >
          {t('export')}
        </Button>

        <Button
          onClick={(e) => setCoursesAnchor(e.currentTarget)}
          endIcon={<KeyboardArrowDownIcon sx={{ fontSize: 18 }} />}
          sx={{
            border: '1px solid #E2E8F0',
            color: '#334155',
            bgcolor: '#FFFFFF',
            fontWeight: 600,
            fontSize: 13,
            borderRadius: 2,
            px: 2,
            py: 0.85,
            height: 38,
            boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
            textTransform: 'none',
            '&:hover': { borderColor: '#94A3B8', bgcolor: '#F8FAFC' },
          }}
        >
          {selectedCourses}
        </Button>
        <Menu
          anchorEl={coursesAnchor}
          open={openCourses}
          onClose={() => setCoursesAnchor(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          slotProps={{
            paper: { sx: { mt: 1, borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', minWidth: 180 } },
          }}
        >
          {[t('all_courses', { count: String(totalCourses) }), t('only_approved'), t('only_pending')].map((option) => (
            <MenuItem
              key={option}
              onClick={() => {
                setSelectedCourses(option);
                setCoursesAnchor(null);
              }}
              sx={{
                fontSize: 13,
                fontWeight: selectedCourses === option ? 700 : 500,
                color: selectedCourses === option ? '#00A980' : '#334155',
                px: 2,
                py: 1,
              }}
            >
              {option}
            </MenuItem>
          ))}
        </Menu>

        <Button
          onClick={(e) => setPeriodAnchor(e.currentTarget)}
          startIcon={<EventRoundedIcon sx={{ fontSize: 18, color: '#00A980' }} />}
          endIcon={<KeyboardArrowDownIcon sx={{ fontSize: 18 }} />}
          sx={{
            border: '1px solid #E2E8F0',
            color: '#334155',
            bgcolor: '#FFFFFF',
            fontWeight: 600,
            fontSize: 13,
            borderRadius: 2,
            px: 2,
            py: 0.85,
            height: 38,
            boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
            textTransform: 'none',
            whiteSpace: 'nowrap',
            '&:hover': { borderColor: '#94A3B8', bgcolor: '#F8FAFC' },
          }}
        >
          {selectedPeriod}
        </Button>
        <Menu
          anchorEl={periodAnchor}
          open={openPeriod}
          onClose={() => setPeriodAnchor(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          slotProps={{
            paper: { sx: { mt: 1, borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', minWidth: 200 } },
          }}
        >
          {[periodLabel, t('last_30_days'), t('last_90_days')].map((option) => (
            <MenuItem
              key={option}
              onClick={() => {
                setSelectedPeriod(option);
                setPeriodAnchor(null);
              }}
              sx={{
                fontSize: 13,
                fontWeight: selectedPeriod === option ? 700 : 500,
                color: selectedPeriod === option ? '#00A980' : '#334155',
                px: 2,
                py: 1,
              }}
            >
              {option}
            </MenuItem>
          ))}
        </Menu>
      </Stack>
    </Stack>
  );
}