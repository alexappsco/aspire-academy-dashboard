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
import { InstructorDueDetailsResponse } from 'src/types/instructor-payout';

interface Props {
  instructor: InstructorDueDetailsResponse;
  onOpenTransferDialog: () => void;
}

export default function InstructorBankInfoCard({
  instructor,
  onOpenTransferDialog,
}: Props) {
  const t = useTranslations('InstructorPayouts.details.bank_card');
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

  const rawUpdatedDate = instructor.bankDetailsUpdatedAt || instructor.lastUpdated;
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

  const customFields = [...(instructor.customFields || [])].sort(
    (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
  );

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
      {/* Top Header: Instructor Identity + Register Button */}
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
        {/* Instructor Info (Far Right in RTL) */}
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

        {/* Action Button: Register Bank Transfer (Far Left in RTL) */}
        <Button
          variant="contained"
          onClick={onOpenTransferDialog}
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
            <Iconify icon="solar:buildings-2-linear" width={18} />
            <Box component="span">{t('register_transfer_btn')}</Box>
          </Stack>
        </Button>
      </Stack>

      <Divider sx={{ mb: 2.5, borderColor: '#F1F5F9' }} />

      {/* Bank & Contact Details Grid (3 columns, 2 rows matching design) */}
      <Grid container spacing={2.5} sx={{ textAlign: 'start' }}>
        {/* Row 1, Col 1 (Far Right): Bank Name */}
        <Grid size={{ xs: 12, sm: 4 }}>
          <Typography sx={{ fontSize: 11.5, color: '#94A3B8', fontWeight: 600, mb: 0.5 }}>
            {t('bank_name')}
          </Typography>
          <Typography sx={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>
            {bankName}
          </Typography>
        </Grid>

        {/* Row 1, Col 2 (Center): Account Holder */}
        <Grid size={{ xs: 12, sm: 4 }}>
          <Typography sx={{ fontSize: 11.5, color: '#94A3B8', fontWeight: 600, mb: 0.5 }}>
            {t('account_holder')}
          </Typography>
          <Typography sx={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>
            {accountHolder}
          </Typography>
        </Grid>

        {/* Row 1, Col 3 (Far Left): IBAN */}
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

        {/* Row 2, Col 1 (Far Right): Phone */}
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

        {/* Row 2, Col 2 (Center): Email */}
        <Grid size={{ xs: 12, sm: 4 }}>
          <Typography sx={{ fontSize: 11.5, color: '#94A3B8', fontWeight: 600, mb: 0.5 }}>
            {t('email')}
          </Typography>
          <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: '#0F172A' }}>
            {email}
          </Typography>
        </Grid>

        {/* Row 2, Col 3 (Far Left): Last Bank Update */}
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

      {/* Additional custom fields from backend (key / value only) */}
      {customFields.length > 0 && (
        <Box sx={{ mt: 2.5 }}>
          <Divider sx={{ mb: 2, borderColor: '#F1F5F9' }} />

          <Stack
            direction="row"
            spacing={1}
            sx={{ alignItems: 'center', gap: 1, mb: 1.75, textAlign: 'start' }}
          >
            <Iconify icon="solar:user-id-bold" width={18} sx={{ color: '#64748B' }} />
            <Typography sx={{ fontSize: 13.5, fontWeight: 800, color: '#0F172A' }}>
              {t('additional_data')}
            </Typography>
          </Stack>

          <Grid container spacing={2.5} sx={{ textAlign: 'start' }}>
            {customFields.map((field) => (
              <Grid key={field.id} size={{ xs: 12, sm: 4 }}>
                <Typography
                  sx={{ fontSize: 11.5, color: '#94A3B8', fontWeight: 600, mb: 0.5 }}
                >
                  {field.key || '—'}
                </Typography>
                <Typography
                  sx={{
                    fontSize: 13.5,
                    fontWeight: 700,
                    color: '#0F172A',
                    direction: 'ltr',
                    display: 'inline-block',
                    wordBreak: 'break-word',
                  }}
                >
                  {field.value || '—'}
                </Typography>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Card>
  );
}
