'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useLocale, useTranslations } from 'next-intl';
import Iconify from 'src/components/iconify';
import { useToast } from 'src/components/toast';

import { getInstructorDuesSummary, getInstructorDues } from 'src/actions/instructor-dues';
import { getCountriesAction } from 'src/actions/countries';
import { getUniversitiesAction } from 'src/actions/unversity';
import {
  InstructorDuesSummaryResponse,
  InstructorDueItem,
} from 'src/types/instructor-payout';

import PayoutKpiCards from './components/PayoutKpiCards';
import PayoutFilterBar from './components/PayoutFilterBar';
import PayoutTable from './components/PayoutTable';

// Helper to compute ISO date range for period filter
function getDateRangeForPeriod(period: string): { FromDate?: string; ToDate?: string } {
  if (period === 'all') return {};

  const now = new Date();
  if (period === 'this_month') {
    const from = new Date(now.getFullYear(), now.getMonth(), 1);
    return { FromDate: from.toISOString(), ToDate: now.toISOString() };
  }
  if (period === 'last_month') {
    const from = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const to = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
    return { FromDate: from.toISOString(), ToDate: to.toISOString() };
  }
  if (period === 'quarter') {
    const from = new Date(now.getFullYear(), now.getMonth() - 3, 1);
    return { FromDate: from.toISOString(), ToDate: now.toISOString() };
  }
  return {};
}

export default function InstructorPayoutsView() {
  const t = useTranslations('InstructorPayouts');
  const locale = useLocale();
  const toast = useToast();

  // Summary State
  const [summary, setSummary] = useState<InstructorDuesSummaryResponse | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(true);

  // Table Data State
  const [items, setItems] = useState<InstructorDueItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [tableLoading, setTableLoading] = useState(true);

  // Dropdown Options
  const [countries, setCountries] = useState<{ id: string; name: string }[]>([]);
  const [universities, setUniversities] = useState<{ id: string; name: string }[]>([]);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [periodFilter, setPeriodFilter] = useState('all');
  const [universityFilter, setUniversityFilter] = useState('all');
  const [countryFilter, setCountryFilter] = useState('all');

  // Pagination State
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(8);

  // Handle Search Debounce (400ms)
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      setDebouncedQuery(value);
      setPage(0);
    }, 400);
  };

  // Fetch Countries & Universities on Mount for Dropdowns
  useEffect(() => {
    async function loadDropdowns() {
      try {
        const [countriesRes, unisRes] = await Promise.all([
          getCountriesAction({ MaxResultCount: 1000 }),
          getUniversitiesAction({ MaxResultCount: 1000 }),
        ]);

        if (countriesRes.success && countriesRes.data?.items) {
          setCountries(
            countriesRes.data.items.map((c) => ({
              id: c.id,
              name: locale === 'ar' ? (c.nameAr || c.nameEn) : (c.nameEn || c.nameAr),
            }))
          );
        }

        if (unisRes.success && unisRes.data?.items) {
          setUniversities(
            unisRes.data.items.map((u) => ({
              id: u.id,
              name: locale === 'ar' ? (u.nameAr || u.nameEn) : (u.nameEn || u.nameAr),
            }))
          );
        }
      } catch (err) {
        console.error('Failed to load filter dropdowns', err);
      }
    }

    loadDropdowns();
  }, []);

  // Fetch KPI Summary
  const fetchSummary = useCallback(async () => {
    setSummaryLoading(true);
    try {
      const { FromDate, ToDate } = getDateRangeForPeriod(periodFilter);
      const res = await getInstructorDuesSummary({ FromDate, ToDate });
      if (res.success && res.data) {
        setSummary(res.data);
      } else if (res.error) {
        toast.error(res.error);
      }
    } catch {
      toast.error('Failed to load summary');
    } finally {
      setSummaryLoading(false);
    }
  }, [periodFilter, toast]);

  // Fetch Instructors List
  const fetchDuesList = useCallback(async () => {
    setTableLoading(true);
    try {
      const { FromDate, ToDate } = getDateRangeForPeriod(periodFilter);
      const res = await getInstructorDues({
        Filter: debouncedQuery || undefined,
        CountryId: countryFilter !== 'all' ? countryFilter : undefined,
        UniversityId: universityFilter !== 'all' ? universityFilter : undefined,
        FromDate,
        ToDate,
        SkipCount: page * rowsPerPage,
        MaxResultCount: rowsPerPage,
      });

      if (res.success && res.data) {
        setItems(res.data.items || []);
        setTotalCount(res.data.totalCount || 0);
      } else if (res.error) {
        toast.error(res.error);
        setItems([]);
        setTotalCount(0);
      }
    } catch {
      toast.error('Failed to load instructor dues');
      setItems([]);
      setTotalCount(0);
    } finally {
      setTableLoading(false);
    }
  }, [debouncedQuery, countryFilter, universityFilter, periodFilter, page, rowsPerPage, toast]);

  // Re-fetch Summary when Period changes
  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  // Re-fetch List when any filter or page changes
  useEffect(() => {
    fetchDuesList();
  }, [fetchDuesList]);

  // Determine active currency from first list item or fallback to 'EGP'
  const activeCurrency = items[0]?.currencySymbol || items[0]?.currencyCode || 'EGP';

  return (
    <Box sx={{ py: 3, px: { xs: 2, sm: 3, md: 4 } }}>
      {/* 1. Page Title */}
      <Typography
        variant="h4"
        sx={{
          fontWeight: 900,
          color: '#0F172A',
          fontSize: { xs: 22, md: 26 },
          mb: 2.5,
          textAlign: 'start',
        }}
      >
        {t('title')}
      </Typography>

      {/* 2. Platform Off-site Bank Notice Banner */}
      <Box
        sx={{
          p: 2,
          px: 2.5,
          mb: 3,
          borderRadius: 2.5,
          bgcolor: '#EFF6FF',
          border: '1px solid #DBEAFE',
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          textAlign: 'start',
        }}
      >
        <Iconify
          icon="solar:info-circle-bold"
          width={22}
          sx={{ color: '#2563EB', flexShrink: 0 }}
        />
        <Typography sx={{ fontSize: 13, color: '#1E40AF', fontWeight: 600, lineHeight: 1.6 }}>
          {t('off_platform_notice')}
        </Typography>
      </Box>

      {/* 3. Top 3 KPI Summary Cards */}
      <PayoutKpiCards
        summary={summary}
        currency={activeCurrency}
        loading={summaryLoading}
      />

      {/* 4. Full-width Filter Bar */}
      <PayoutFilterBar
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        periodFilter={periodFilter}
        onPeriodChange={(val) => {
          setPeriodFilter(val);
          setPage(0);
        }}
        universityFilter={universityFilter}
        onUniversityChange={(val) => {
          setUniversityFilter(val);
          setPage(0);
        }}
        countryFilter={countryFilter}
        onCountryChange={(val) => {
          setCountryFilter(val);
          setPage(0);
        }}
        availableUniversities={universities}
        availableCountries={countries}
      />

      {/* 5. Main Instructors Payout Table */}
      <PayoutTable
        items={items}
        totalCount={totalCount}
        page={page}
        rowsPerPage={rowsPerPage}
        loading={tableLoading}
        onPageChange={setPage}
        onRowsPerPageChange={(newRows) => {
          setRowsPerPage(newRows);
          setPage(0);
        }}
      />
    </Box>
  );
}
