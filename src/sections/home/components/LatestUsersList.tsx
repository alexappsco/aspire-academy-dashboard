'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';

import Iconify from 'src/components/iconify';
import SharedTable from 'src/components/SharedTable/SharedTable';
import { cellAlignment } from 'src/components/SharedTable/types';
import { useRouter } from 'src/i18n/routing';
import type { DashboardRecentAccount } from 'src/types/dashboard';

interface Props {
  recentAccounts?: DashboardRecentAccount[];
}

type FormattedRecentAccount = DashboardRecentAccount & { id: string };

export default function LatestUsersList({ recentAccounts }: Props) {
  const t = useTranslations('Home.latest_users');
  const router = useRouter();

  const formattedData: FormattedRecentAccount[] = (recentAccounts || []).map((account, index) => ({
    ...account,
    id: account.userId || `user-${index}`,
  }));

  const hasData = formattedData.length > 0;

  const getRoleLabel = (role: string | number | undefined | null) => {
    const r = String(role || '').toLowerCase();
    if (r.includes('lectur') || r.includes('instruct') || r.includes('محاضر')) return 'محاضر';
    if (r.includes('stud') || r.includes('طالب')) return 'طالب';
    if (r.includes('admin') || r.includes('مسؤول')) return 'مسؤول';
    return String(role || '-');
  };

  const tableHead = [
    { id: 'user', label: 'المستخدم', align: cellAlignment.right },
    { id: 'role', label: 'نوع الحساب', align: cellAlignment.center, width: 130 },
    { id: 'affiliation', label: 'الجامعة / الكلية', align: cellAlignment.center },
    { id: 'created_at', label: 'تاريخ الانضمام', align: cellAlignment.center, width: 140 },
    { id: 'status', label: 'الحالة', align: cellAlignment.center, width: 120 },
    { id: 'actions', label: '', align: cellAlignment.center, width: 60 },
  ];

  const customRender = {
    user: (row: FormattedRecentAccount) => (
      <Stack
        direction="row"
        spacing={1.5}
        sx={{
          alignItems: 'center',
          gap: 1.5,
        }}
      >
        <Avatar
          src={row.imageUrl || undefined}
          alt={row.name}
          sx={{ width: 38, height: 38, borderRadius: 2 }}
        />
        <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: '#0F172A' }}>
          {row.name}
        </Typography>
      </Stack>
    ),
    role: (row: FormattedRecentAccount) => {
      const roleLabel = getRoleLabel(row.role);
      const isLecturer = roleLabel === 'محاضر';
      return (
        <Chip
          label={roleLabel}
          size="small"
          sx={{
            bgcolor: isLecturer ? '#1E293B' : '#EFF6FF',
            color: isLecturer ? '#FFFFFF' : '#2563EB',
            fontWeight: 700,
            fontSize: 11.5,
            height: 24,
            borderRadius: 1.5,
          }}
        />
      );
    },
    affiliation: (row: FormattedRecentAccount) => (
      <Typography sx={{ fontSize: 13, color: '#475569', fontWeight: 600 }}>
        {row.affiliation || '-'}
      </Typography>
    ),
    created_at: (row: FormattedRecentAccount) => (
      <Typography sx={{ fontSize: 12.5, color: '#64748B', fontWeight: 500 }}>
        {row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '-'}
      </Typography>
    ),
    status: (row: FormattedRecentAccount) => {
      const statusStr = String(row.status || '');
      const isActive = statusStr.toLowerCase().includes('act') || statusStr === '1' || !row.status;
      return (
        <Chip
          label={statusStr || (isActive ? 'Active' : 'Pending')}
          size="small"
          sx={{
            bgcolor: isActive ? '#ECFDF5' : '#F1F5F9',
            color: isActive ? '#059669' : '#64748B',
            fontWeight: 700,
            fontSize: 12,
            height: 24,
            borderRadius: 1,
          }}
        />
      );
    },
    actions: () => (
      <IconButton
        size="small"
        sx={{ color: '#94A3B8' }}
        onClick={() => router.push('/instructors')}
      >
        <Iconify icon="solar:menu-dots-bold" width={18} />
      </IconButton>
    ),
  };

  return (
    <Card
      sx={{
        borderRadius: 3,
        bgcolor: '#FFFFFF',
        border: '1px solid #F1F5F9',
        boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
      }}
    >
      {/* Header */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{
          p: 2.5,
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          borderBottom: '1px solid #F1F5F9',
        }}
      >
        {/* Right in RTL: Icon & Title */}
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: 2,
              bgcolor: '#EFF6FF',
              color: '#2563EB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Iconify icon="solar:users-group-two-rounded-bold" width={22} />
          </Box>

          <Box>
            <Typography
              variant="h6"
              sx={{ fontWeight: 800, color: '#0F172A', fontSize: 17 }}
            >
              {t('title')}
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: '#64748B', fontSize: 12, fontWeight: 500 }}
            >
              {hasData
                ? `عرض أحدث ${formattedData.length} حسابات تم تسجيلها في المنصة`
                : 'قائمة المستخدمين الجدد'}
            </Typography>
          </Box>
        </Stack>

        {/* Left in RTL: View Accounts */}
        <Button
          variant="outlined"
          onClick={() => router.push('/instructors')}
          endIcon={<Iconify icon="solar:arrow-left-linear" width={16} sx={{ ml: 0.5 }} />}
          sx={{
            borderRadius: 2,
            borderColor: '#E2E8F0',
            color: '#2563EB',
            fontWeight: 700,
            fontSize: 13,
            px: 2,
            py: 0.75,
            gap: 1,
            '&:hover': {
              borderColor: '#BFDBFE',
              bgcolor: '#EFF6FF',
            },
          }}
        >
          {t('view_accounts')}
        </Button>
      </Stack>

      {/* Table Section */}
      <Box sx={{ p: 1 }}>
        {hasData ? (
          <SharedTable<FormattedRecentAccount>
            data={formattedData}
            count={formattedData.length}
            tableHead={tableHead}
            customRender={customRender}
            disablePagination={true}
          />
        ) : (
          <Box
            sx={{
              py: 6,
              textAlign: 'center',
              bgcolor: '#F8FAFC',
              borderRadius: 2,
              m: 1,
            }}
          >
            <Typography sx={{ color: '#64748B', fontSize: 13, fontWeight: 600 }}>
              No data from backend
            </Typography>
          </Box>
        )}
      </Box>
    </Card>
  );
}
