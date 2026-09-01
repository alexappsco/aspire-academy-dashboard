'use client';

import { Box, Button, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import Iconify from 'src/components/iconify';

type SupportHeaderProps = {
  onCreateClick?: () => void;
  canAdd?: boolean;
};

export default function SupportHeader({ onCreateClick, canAdd = true }: SupportHeaderProps) {
  const t = useTranslations("Support");

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 4,
        gap: 2,
      }}
    >
      <Box sx={{ textAlign: { xs: 'center', sm: 'right' } }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          {t("title")}
        </Typography>
      </Box>

      {canAdd && (
        <Button
          variant="contained"
          startIcon={<Iconify icon="solar:plain-bold" />}
          onClick={onCreateClick}
          sx={{
            bgcolor: '#886ce8',
            color: '#fff',
            borderRadius: '12px',
            fontWeight: 700,
            px: 3,
            height: 48,
            gap: 1.5,
            boxShadow: '0 8px 16px 0 rgba(136, 108, 232, 0.24)',
            '&:hover': {
              bgcolor: '#7758e6',
            },
            textTransform: 'none',
            whiteSpace: 'nowrap',
          }}
        >
          {t("send_ticket")}
        </Button>
      )}
    </Box>
  );
}
