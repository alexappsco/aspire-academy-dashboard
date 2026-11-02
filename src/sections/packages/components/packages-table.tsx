'use client';

import { useState } from 'react';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import { useLocale, useTranslations } from 'next-intl';

import Iconify from 'src/components/iconify';
import { deletePackage } from 'src/actions/packages';
import { useToast } from 'src/components/toast';
import SharedTable from 'src/components/SharedTable/SharedTable';
import { cellAlignment, type headCellType } from 'src/components/SharedTable/types';
import type { PackageSummary } from 'src/types/package';
import { useRouter } from 'src/i18n/routing';
import DeletePackageDialog from './delete-package-dialog';

type PackageRow = PackageSummary & {
  packageName: string;
  coursesValue: number;
  subscribersValue: number;
  originalPriceValue: number;
  priceValue: number;
  statusValue: boolean;
  creationDateValue: string;
};

type Props = { packages: PackageSummary[]; totalCount: number; onDeleted: () => void };

function formatMoney(value: number, item: PackageSummary, locale: string) {
  const amount = new Intl.NumberFormat(locale === 'ar' ? 'ar-EG' : 'en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
  return `${amount} ${item.currencySymbol || item.currencyCode || ''}`.trim();
}

function formatDate(value: string, locale: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-EG' : 'en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export default function PackagesTable({ packages, totalCount, onDeleted }: Props) {
  const t = useTranslations('Packages');
  const locale = useLocale();
  const router = useRouter();
  const toast = useToast();
  const [deleting, setDeleting] = useState<PackageRow | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const align = locale === 'ar' ? cellAlignment.right : cellAlignment.left;
  const tableHead: headCellType[] = [
    { id: 'packageName', label: t('columns.name'), align },
    { id: 'coursesValue', label: t('columns.courses'), align },
    { id: 'subscribersValue', label: t('columns.subscribers'), align },
    { id: 'originalPriceValue', label: t('columns.old_price'), align },
    { id: 'priceValue', label: t('columns.price'), align },
    { id: 'statusValue', label: t('columns.status'), align },
    { id: 'creationDateValue', label: t('columns.creation_date'), align },
  ];
  const rows: PackageRow[] = packages.map((item) => ({
    ...item,
    packageName: (locale === 'ar' ? item.nameAr : item.nameEn) || item.nameAr || item.nameEn || '—',
    coursesValue: item.coursesCount,
    subscribersValue: item.subscribersCount,
    originalPriceValue: item.originalPrice,
    priceValue: item.price,
    statusValue: item.isActive,
    creationDateValue: item.creationTime,
  }));

  const handleDelete = async () => {
    if (!deleting) return;
    setDeleteLoading(true);
    const response = await deletePackage(deleting.id);
    setDeleteLoading(false);
    if (!response.success) {
      toast.error(response.error || t('messages.delete_error'));
      return;
    }
    toast.success(t('messages.delete_success'));
    setDeleting(null);
    onDeleted();
  };

  return (
    <>
    <SharedTable
      data={rows}
      tableHead={tableHead}
      count={totalCount}
      serverPagination
      actions={[
        {
          label: t('actions.view'),
          icon: <Iconify icon="solar:eye-bold" />,
          onClick: (row) => router.push(`/packages/${row.id}`),
        },
        {
          label: t('actions.edit'),
          icon: <Iconify icon="solar:pen-bold" />,
          onClick: (row) => router.push(`/packages/${row.id}/edit`),
        },
        {
          label: t('actions.delete'),
          icon: <Iconify icon="solar:trash-bin-trash-bold" />,
          sx: { color: 'error.main' },
          onClick: (row) => setDeleting(row),
        },
      ]}
      customRender={{
        packageName: (row) => <Typography variant="body2" sx={{ fontWeight: 600 }}>{row.packageName}</Typography>,
        coursesValue: (row) => t('columns.courses_count', { count: row.coursesValue }),
        originalPriceValue: (row) => (
          <Box component="span" sx={{ color: '#F59E0B', fontWeight: 600 }}>
            {formatMoney(row.originalPriceValue, row, locale)}
          </Box>
        ),
        priceValue: (row) => formatMoney(row.priceValue, row, locale),
        statusValue: (row) => (
          <Chip
            size="small"
            label={t(row.statusValue ? 'status.active' : 'status.inactive')}
            sx={{
              bgcolor: row.statusValue ? '#DCFCE7' : '#F1F5F9',
              color: row.statusValue ? '#15803D' : '#64748B',
              fontWeight: 700,
            }}
          />
        ),
        creationDateValue: (row) => formatDate(row.creationDateValue, locale),
      }}
    />
    <DeletePackageDialog open={Boolean(deleting)} loading={deleteLoading} name={deleting?.packageName || ''} onClose={() => setDeleting(null)} onConfirm={handleDelete} />
    </>
  );
}
