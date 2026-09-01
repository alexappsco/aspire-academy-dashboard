import { Box, Button } from '@mui/material';
import type { StatusFilter } from '../types';

type TabItem = {
  label: string;
  value: StatusFilter;
  count: number;
  bgColor: string;
  textColor: string;
};

type SupportStatusTabsProps = {
  tabs: TabItem[];
  activeFilter: StatusFilter;
  onFilterChange: (filter: StatusFilter) => void;
};

export default function SupportStatusTabs({
  tabs,
  activeFilter,
  onFilterChange,
}: SupportStatusTabsProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        gap: 3,
        borderBottom: '1px solid #f3f4f6',
        pb: 2,
        overflowX: 'auto',
        '&::-webkit-scrollbar': {
          height: 4,
        },
        '&::-webkit-scrollbar-track': {
          background: 'transparent',
        },
        '&::-webkit-scrollbar-thumb': {
          background: '#d1d5db',
          borderRadius: 2,
        },
      }}
    >
      {tabs.map((tab) => (
        <Button
          key={tab.value}
          onClick={() => onFilterChange(tab.value)}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            pb: 1,
            px: 0,
            color: activeFilter === tab.value ? '#111827' : '#6b7280',
            fontWeight: 600,
            textTransform: 'none',
            fontSize: '0.95rem',
            borderBottom: activeFilter === tab.value ? '2px solid #111827' : 'none',
            borderRadius: 0,
            mb: '-1px',
            whiteSpace: 'nowrap',
            '&:hover': {
              backgroundColor: 'transparent',
              color: '#886ce8',
            },
          }}
        >
          <Box
            sx={{
              backgroundColor: tab.bgColor,
              color: tab.textColor,
              fontSize: '0.75rem',
              fontWeight: 600,
              px: 1.5,
              py: 0.5,
              borderRadius: '6px',
            }}
          >
            {tab.count}
          </Box>
          {tab.label}
        </Button>
      ))}
    </Box>
  );
}
