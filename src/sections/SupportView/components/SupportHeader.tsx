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
          startIcon={<Iconify icon="solar:plain-bold" width={20} />}
          onClick={onCreateClick}
          sx={{
            bgcolor: '#1C252E',
            color: '#FFFFFF',
            borderRadius: 1.5,
            fontWeight: 700,
            px: 2.5,
            py: 1,
            height: 44,
            boxShadow: 'none',
            gap: 1.25,
            '&:hover': {
              bgcolor: '#2C353E',
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
