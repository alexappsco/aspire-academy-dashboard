'use client';

import { useMemo } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';

import SharedTable from 'src/components/SharedTable/SharedTable';
import { cellAlignment } from 'src/components/SharedTable/types';
import { useRouter } from 'src/i18n/routing';
import { paths } from 'src/routes/paths';
import type { CountryDto } from 'src/sections/countries/types';
import type { HoursChargeRequest } from 'src/types/hours-charge-request';

import { STATUS_STYLES } from '../constants';
import type { HoursChargeRequestRow } from '../types';
import { formatRequestDate, toRequestRow } from '../utils';

type Props = {
  requests: HoursChargeRequest[];
  countries: CountryDto[];
  totalCount: number;
  loading: boolean;
};

export default function HoursChargeRequestsTable({
  requests,
  countries,
  totalCount,
  loading,
}: Props) {
  const t = useTranslations('HoursChargeRequests');
  const locale = useLocale();
  const router = useRouter();

  const countryById = useMemo(
    () => new Map(countries.map((country) => [country.id, country])),
    [countries]
  );
  const rows = useMemo(() => requests.map(toRequestRow), [requests]);

  const tableHead = [
    { id: 'requestNumber', label: t('columns.request_number'), align: cellAlignment.center },
    { id: 'student', label: t('columns.student'), align: cellAlignment.center },
    { id: 'country', label: t('columns.country'), align: cellAlignment.center },
    { id: 'hoursValue', label: t('columns.hours'), align: cellAlignment.center },
    { id: 'hourPrice', label: t('columns.price_per_hour'), align: cellAlignment.center },
    { id: 'total', label: t('columns.total'), align: cellAlignment.center },
    { id: 'receipt', label: t('columns.receipt'), align: cellAlignment.center },
    { id: 'submittedAt', label: t('columns.submitted_at'), align: cellAlignment.center },
    { id: 'statusValue', label: t('columns.status'), align: cellAlignment.center },
  ];

  const renderAmount = (row: HoursChargeRequestRow, amount: number) => {
    const country = countryById.get(row.countryId);
    const currency = country?.currency?.code || country?.currency?.symbol || '';

    return (
      <Typography sx={{ fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap' }}>
        {amount.toLocaleString(locale === 'ar' ? 'ar-EG' : 'en-US')} {currency}
      </Typography>
    );
  };

  const customRender = {
    requestNumber: (row: HoursChargeRequestRow) => (
      <Typography sx={{ fontSize: 13, fontWeight: 800 }}>
        {row.id.slice(0, 8).toUpperCase()}
      </Typography>
    ),
    student: (row: HoursChargeRequestRow) => (
      <Typography sx={{ fontSize: 13, fontWeight: 600 }}>{row.userName || '-'}</Typography>
    ),
    country: (row: HoursChargeRequestRow) => (
      <Typography sx={{ fontSize: 13 }}>{row.countryName || '-'}</Typography>
    ),
    hoursValue: (row: HoursChargeRequestRow) => (
      <Typography sx={{ fontSize: 13 }}>{row.hours}</Typography>
    ),
    hourPrice: (row: HoursChargeRequestRow) => renderAmount(row, row.pricePerHour),
    total: (row: HoursChargeRequestRow) => renderAmount(row, row.totalAmount),
    receipt: (row: HoursChargeRequestRow) => (
      <Typography
        component="button"
        type="button"
        onClick={() => router.push(paths.hoursChargeRequests.details(row.id))}
        sx={{
          border: 0,
          p: 0,
          bgcolor: 'transparent',
          color: '#2563EB',
          fontSize: 13,
          fontWeight: 700,
          textDecoration: 'underline',
          cursor: 'pointer',
        }}
      >
        {t('view_receipt')}
      </Typography>
    ),
    submittedAt: (row: HoursChargeRequestRow) => (
      <Typography sx={{ fontSize: 13 }}>
        {formatRequestDate(row.creationTime, locale)}
      </Typography>
    ),
    statusValue: (row: HoursChargeRequestRow) => (
      <Box
        component="span"
        sx={{
          display: 'inline-flex',
          px: 1.25,
          py: 0.5,
          borderRadius: 1,
          bgcolor: STATUS_STYLES[row.status].backgroundColor,
          color: STATUS_STYLES[row.status].color,
          fontSize: 12,
          fontWeight: 700,
          whiteSpace: 'nowrap',
        }}
      >
        {t('statuses.' + row.status.toLowerCase())}
      </Box>
    ),
  };

  return (
    <Box sx={{ position: 'relative', minHeight: 220 }}>
      {loading && (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            zIndex: 2,
            display: 'grid',
            placeItems: 'center',
            bgcolor: 'rgba(255,255,255,0.72)',
          }}
        >
          <CircularProgress size={32} />
        </Box>
      )}

      <SharedTable
        data={rows}
        tableHead={tableHead}
        customRender={customRender}
        count={totalCount}
        serverPagination
      />
    </Box>
  );
}