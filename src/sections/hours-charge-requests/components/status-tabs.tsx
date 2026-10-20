'use client';

import { useTranslations } from 'next-intl';
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';

import type { HoursChargeRequestStatusCounts } from 'src/types/hours-charge-request';

import { STATUS_STYLES } from '../constants';
import type { StatusFilter } from '../types';

type Props = {
  value: StatusFilter;
  counts: HoursChargeRequestStatusCounts;
  onChange: (value: StatusFilter) => void;
};

export default function HoursChargeRequestStatusTabs({ value, counts, onChange }: Props) {
  const t = useTranslations('HoursChargeRequests');

  const tabs: Array<{ value: StatusFilter; count: number }> = [
    { value: 'all', count: counts.total },
    { value: 'Pending', count: counts.pending },
    { value: 'Approved', count: counts.approved },
    { value: 'Rejected', count: counts.rejected },
  ];

  return (
    <Box sx={{ px: 2.5, borderBottom: '1px solid #EEF2F6', overflowX: 'auto' }}>
      <Tabs
        value={value}
        onChange={(_, nextValue: StatusFilter) => onChange(nextValue)}
        sx={{
          '& .MuiTab-root + .MuiTab-root': { marginInlineStart: '60px' },
          '& .MuiTabs-indicator': { bgcolor: '#1E293B' },
        }}
      >
        {tabs.map((tab) => {
          const statusStyle = tab.value === 'all' ? null : STATUS_STYLES[tab.value];

          return (
            <Tab
              key={tab.value}
              value={tab.value}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                  <Box
                    component="span"
                    sx={{
                      minWidth: 24,
                      px: 0.75,
                      py: 0.25,
                      borderRadius: 1,
                      bgcolor: statusStyle?.backgroundColor || '#1E293B',
                      color: statusStyle?.color || '#FFFFFF',
                      fontSize: 11,
                      fontWeight: 800,
                    }}
                  >
                    {tab.count}
                  </Box>
                  <span>
                    {t('tabs.' + (tab.value === 'all' ? 'all' : tab.value.toLowerCase()))}
                  </span>
                </Box>
              }
              sx={{
                minHeight: 52,
                minWidth: 'auto',
                px: 0,
                fontWeight: 700,
                textTransform: 'none',
              }}
            />
          );
        })}
      </Tabs>
    </Box>
  );
}