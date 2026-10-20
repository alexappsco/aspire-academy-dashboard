'use client';

import { useTranslations } from 'next-intl';
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';

import type { AdminSessionRequestStatusCounts } from 'src/types/admin-session-request';

import { SESSION_REQUEST_STATUSES, STATUS_STYLES } from '../constants';
import type { AdminSessionStatusFilter } from '../types';

type Props = {
  value: AdminSessionStatusFilter;
  counts: AdminSessionRequestStatusCounts;
  onChange: (value: AdminSessionStatusFilter) => void;
};

export default function AdminSessionRequestStatusTabs({ value, counts, onChange }: Props) {
  const t = useTranslations('AdminSessionRequests');
  const tabs: AdminSessionStatusFilter[] = ['all', ...SESSION_REQUEST_STATUSES];

  return (
    <Box sx={{ px: 2.5, borderBottom: '1px solid #EEF2F6', overflowX: 'auto' }}>
      <Tabs
        value={value}
        onChange={(_, nextValue: AdminSessionStatusFilter) => onChange(nextValue)}
        variant="scrollable"
        scrollButtons={false}
        sx={{
          '& .MuiTab-root + .MuiTab-root': { marginInlineStart: '60px' },
          '& .MuiTabs-indicator': { bgcolor: '#1E293B' },
        }}
      >
        {tabs.map((tab) => {
          const style = tab === 'all' ? null : STATUS_STYLES[tab];
          return (
            <Tab
              key={tab}
              value={tab}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box
                    component="span"
                    sx={{
                      minWidth: 24,
                      px: 0.75,
                      py: 0.25,
                      borderRadius: 1,
                      bgcolor: style?.backgroundColor || '#1E293B',
                      color: style?.color || '#FFFFFF',
                      fontSize: 11,
                      fontWeight: 800,
                    }}
                  >
                    {tab === 'all' ? counts.total : counts[tab]}
                  </Box>
                  <span>{t(`tabs.${tab === 'all' ? 'all' : tab}`)}</span>
                </Box>
              }
              sx={{ minHeight: 52, minWidth: 'auto', px: 0, fontWeight: 700, textTransform: 'none' }}
            />
          );
        })}
      </Tabs>
    </Box>
  );
}
