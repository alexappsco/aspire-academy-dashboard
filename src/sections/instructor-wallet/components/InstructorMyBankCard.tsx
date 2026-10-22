'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Divider from '@mui/material/Divider';
import { useLocale, useTranslations } from 'next-intl';
import Iconify from 'src/components/iconify';
import { InstructorWalletDetailsResponse } from 'src/types/instructor-wallet';

interface Props {
  instructor: InstructorWalletDetailsResponse;
  onOpenEditDialog: () => void;
}

export default function InstructorMyBankCard({
  instructor,
  onOpenEditDialog,
}: Props) {
  const t = useTranslations('InstructorWallet.bank_card');
  const locale = useLocale();

  const isComplete = Boolean(instructor.hasCompleteBankDetails);
  const name = instructor.instructorName || '';
  const title = instructor.instructorTitle || '';
  const avatar = instructor.instructorImageUrl || '';
  const bankName = instructor.bankName || '—';
  const accountHolder = instructor.bankAccountHolderName || '—';
  const iban = instructor.iban || '—';
  const phone = instructor.instructorPhoneNumber || '—';
  const email = instructor.instructorEmail || '—';

  const rawUpdatedDate = instructor.bankDetailsUpdatedAt;
  const lastUpdated = rawUpdatedDate
    ? (() => {
        try {
          const d = new Date(rawUpdatedDate);
          if (Number.isNaN(d.getTime())) return rawUpdatedDate;
          return d.toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
          });
        } catch {
          return rawUpdatedDate;
        }
      })()
    : '—';

  return (
    <Card
      sx={{
        p: { xs: 2.5, md: 3 },
        borderRadius: 3,
        bgcolor: '#FFFFFF',
        border: '1px solid #F1F5F9',
        boxShadow: '0 1px 4px rgba(0, 0, 0, 0.03)',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Top Header: Instructor Identity + Edit Bank Details Button */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: 2,
          mb: 2.5,
        }}
      >
        {/* Instructor Info */}
        <Stack
          direction="row"
          spacing={2}
          sx={{
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Avatar
            src={avatar}
            alt={name}
            sx={{
              width: 56,
              height: 56,
              bgcolor: '#A7F3D0',
              color: '#065F46',
              fontWeight: 800,
              fontSize: 20,
            }}
          >
            {(name[0] || 'I').toUpperCase()}
          </Avatar>

          <Box sx={{ textAlign: 'start' }}>
            <Typography sx={{ fontWeight: 800, fontSize: 18, color: '#0F172A' }}>
              {name}
            </Typography>
            {title && (
              <Typography sx={{ fontSize: 13, color: '#64748B', mb: 0.75 }}>
                {title}
              </Typography>
            )}
            <Chip
              label={isComplete ? t('bank_data_complete') : t('bank_data_incomplete')}
              size="small"
              sx={{
                bgcolor: isComplete ? '#DCFCE7' : '#FEE2E2',
                color: isComplete ? '#15803D' : '#DC2626',
                fontWeight: 700,
                fontSize: 11.5,
                height: 24,
                borderRadius: 1.5,
                px: 0.5,
                mt: title ? 0 : 0.5,
              }}
            />
          </Box>
        </Stack>

        {/* Action Button: Edit Bank Details */}
        <Button
          variant="contained"
          onClick={onOpenEditDialog}
          sx={{
            bgcolor: '#0F172A',
            color: '#FFFFFF',
            fontWeight: 700,
            fontSize: 13.5,
            borderRadius: 2,
            px: 2.5,
            py: 1.25,
            boxShadow: 'none',
            '&:hover': { bgcolor: '#1E293B', boxShadow: 'none' },
          }}
        >
          <Stack
            direction="row"
            spacing={1.25}
            sx={{
              alignItems: 'center',
              gap: 1.25,
            }}
          >
            <Iconify icon="solar:pen-new-square-linear" width={18} />
            <Box component="span">{t('edit_bank_details_btn')}</Box>
          </Stack>
        </Button>
      </Stack>

      <Divider sx={{ mb: 2.5, borderColor: '#F1F5F9' }} />

      {/* Bank & Contact Details Grid (3 columns, 2 rows matching design) */}
      <Grid container spacing={2.5} sx={{ textAlign: 'start' }}>
        {/* Row 1, Col 1: Bank Name */}
        <Grid size={{ xs: 12, sm: 4 }}>
          <Typography sx={{ fontSize: 11.5, color: '#94A3B8', fontWeight: 600, mb: 0.5 }}>
            {t('bank_name')}
          </Typography>
          <Typography sx={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>
            {bankName}
          </Typography>
        </Grid>

        {/* Row 1, Col 2: Account Holder */}
        <Grid size={{ xs: 12, sm: 4 }}>
          <Typography sx={{ fontSize: 11.5, color: '#94A3B8', fontWeight: 600, mb: 0.5 }}>
            {t('account_holder')}
          </Typography>
          <Typography sx={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>
            {accountHolder}
          </Typography>
        </Grid>

        {/* Row 1, Col 3: IBAN */}
        <Grid size={{ xs: 12, sm: 4 }}>
          <Typography sx={{ fontSize: 11.5, color: '#94A3B8', fontWeight: 600, mb: 0.5 }}>
            {t('iban')}
          </Typography>
          <Typography
            sx={{
              fontSize: 13.5,
              fontWeight: 700,
              color: '#0F172A',
              fontFamily: 'monospace',
              letterSpacing: 0.5,
              direction: 'ltr',
              display: 'inline-block',
            }}
          >
            {iban}
          </Typography>
        </Grid>

        {/* Row 2, Col 1: Phone */}
        <Grid size={{ xs: 12, sm: 4 }}>
          <Typography sx={{ fontSize: 11.5, color: '#94A3B8', fontWeight: 600, mb: 0.5 }}>
            {t('phone')}
          </Typography>
          <Typography
            sx={{
              fontSize: 13.5,
              fontWeight: 700,
              color: '#0F172A',
              direction: 'ltr',
              display: 'inline-block',
            }}
          >
            {phone}
          </Typography>
        </Grid>

        {/* Row 2, Col 2: Email */}
        <Grid size={{ xs: 12, sm: 4 }}>
          <Typography sx={{ fontSize: 11.5, color: '#94A3B8', fontWeight: 600, mb: 0.5 }}>
            {t('email')}
          </Typography>
          <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: '#0F172A' }}>
            {email}
          </Typography>
        </Grid>

        {/* Row 2, Col 3: Last Bank Update */}
        <Grid size={{ xs: 12, sm: 4 }}>
          <Typography sx={{ fontSize: 11.5, color: '#94A3B8', fontWeight: 600, mb: 0.5 }}>
            {t('last_bank_update')}
          </Typography>
          <Typography
            sx={{
              fontSize: 13.5,
              fontWeight: 700,
              color: '#0F172A',
              direction: 'ltr',
              display: 'inline-block',
            }}
          >
            {lastUpdated}
          </Typography>
        </Grid>
      </Grid>
    </Card>
  );
}
