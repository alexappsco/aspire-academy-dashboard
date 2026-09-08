'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';

import Iconify from 'src/components/iconify';
import { useRouter } from 'src/i18n/routing';
import type { DashboardRecentAccount } from 'src/types/dashboard';

interface Props {
  recentAccounts?: DashboardRecentAccount[];
}

export default function LatestUsersList({ recentAccounts }: Props) {
  const t = useTranslations('Home.latest_users');
  const router = useRouter();

  const users = recentAccounts || [];
  const hasData = recentAccounts !== undefined && recentAccounts.length > 0;

  const getRoleLabel = (role: string | number | undefined | null) => {
    const r = String(role || '').toLowerCase();
    if (r.includes('lectur') || r.includes('instruct') || r.includes('محاضر')) return 'محاضر';
    if (r.includes('stud') || r.includes('طالب')) return 'طالب';
    if (r.includes('admin') || r.includes('مسؤول')) return 'مسؤول';
    return String(role || '');
  };

  return (
    <Card
      sx={{
        p: 2.5,
        borderRadius: 3,
        bgcolor: '#FFFFFF',
        border: '1px solid #F1F5F9',
        boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
      }}
    >
      {/* Header */}
      <Box sx={{ mb: 2.5 }}>
        <Stack
          direction="row"
          spacing={1}
          sx={{
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          {/* Right in RTL: Icon & Title */}
          <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: 2,
                bgcolor: '#EFF6FF',
                color: '#2563EB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Iconify icon="solar:users-group-two-rounded-bold" width={18} />
            </Box>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 800, color: '#0F172A', fontSize: 16 }}
            >
              {t('title')}
            </Typography>
          </Stack>

          {/* Left in RTL: View Accounts */}
          <Button
            size="small"
            onClick={() => router.push('/instructors')}
            sx={{ color: '#2563EB', fontWeight: 700, fontSize: 13, p: 0, minWidth: 'auto' }}
          >
            {t('view_accounts')}
          </Button>
        </Stack>
      </Box>

      {/* Users Grid */}
      {hasData ? (
        <Grid container spacing={2}>
          {users.map((user) => {
            const roleLabel = getRoleLabel(user.role);
            const isLecturer = roleLabel === 'محاضر';
            const statusStr = String(user.status || '');
            const isActive = statusStr.toLowerCase().includes('act') || !user.status;

            return (
              <Grid key={user.userId} size={{ xs: 12, sm: 6, md: 4 }}>
                <Box
                  sx={{
                    p: 1.75,
                    borderRadius: 2.5,
                    bgcolor: '#F8FAFC',
                    border: '1px solid #F1F5F9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 1.5,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      bgcolor: '#FFFFFF',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                      borderColor: '#E2E8F0',
                    },
                  }}
                >
                  {/* Right in RTL: Avatar + Info */}
                  <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', minWidth: 0, gap: 1.5 }}>
                    <Avatar
                      src={user.imageUrl || undefined}
                      alt={user.name}
                      sx={{ width: 44, height: 44, borderRadius: 2, flexShrink: 0 }}
                    />

                    <Box sx={{ minWidth: 0 }}>
                      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', gap: 0.75, mb: 0.25 }}>
                        <Typography
                          noWrap
                          sx={{ fontSize: 13.5, fontWeight: 700, color: '#0F172A' }}
                        >
                          {user.name}
                        </Typography>
                        <Chip
                          label={roleLabel}
                          size="small"
                          sx={{
                            bgcolor: isLecturer ? '#1E293B' : '#EFF6FF',
                            color: isLecturer ? '#FFFFFF' : '#2563EB',
                            fontWeight: 700,
                            fontSize: 10.5,
                            height: 20,
                            borderRadius: 1,
                            flexShrink: 0,
                          }}
                        />
                      </Stack>

                      <Typography
                        noWrap
                        sx={{ fontSize: 11.5, color: '#64748B' }}
                      >
                        {user.affiliation || (user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '')}
                      </Typography>
                    </Box>
                  </Stack>

                  {/* Left in RTL: Status Text */}
                  <Typography
                    sx={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: isActive ? '#10B981' : '#94A3B8',
                      flexShrink: 0,
                    }}
                  >
                    {statusStr || 'نشط'}
                  </Typography>
                </Box>
              </Grid>
            );
          })}
        </Grid>
      ) : (
        <Box
          sx={{
            py: 5,
            textAlign: 'center',
            bgcolor: '#F8FAFC',
            borderRadius: 2,
            my: 2,
          }}
        >
          <Typography sx={{ color: '#64748B', fontSize: 13, fontWeight: 600 }}>
            No data from backend
          </Typography>
        </Box>
      )}

      {/* Footer */}
      <Box
        sx={{
          pt: 2,
          mt: 2.5,
          borderTop: '1px solid #F1F5F9',
          textAlign: 'center',
        }}
      >
        <Typography
          variant="caption"
          sx={{ color: '#64748B', fontSize: 12.5, fontWeight: 600 }}
        >
          {hasData
            ? `إجمالي الحسابات المعروضة: ${users.length}`
            : 'No data from backend'}
        </Typography>
      </Box>
    </Card>
  );
}
