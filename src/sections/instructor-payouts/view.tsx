'use client';

import React, { useState, useMemo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useTranslations } from 'next-intl';
import Iconify from 'src/components/iconify';

import { INITIAL_INSTRUCTORS, INITIAL_SUMMARY } from './mock-data';
import PayoutKpiCards from './components/PayoutKpiCards';
import PayoutFilterBar from './components/PayoutFilterBar';
import PayoutTable from './components/PayoutTable';

export default function InstructorPayoutsView() {
  const t = useTranslations('InstructorPayouts');

  const [instructors] = useState(INITIAL_INSTRUCTORS);
  const [summary] = useState(INITIAL_SUMMARY);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [periodFilter, setPeriodFilter] = useState('all');
  const [universityFilter, setUniversityFilter] = useState('all');
  const [countryFilter, setCountryFilter] = useState('all');

  // Pagination State
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(8);

  // Available Filter Options derived from data
  const availableUniversities = useMemo(() => {
    const unis = new Set<string>();
    instructors.forEach((i) => {
      if (i.university) unis.add(i.university);
    });
    return Array.from(unis);
  }, [instructors]);

  const availableCountries = useMemo(() => {
    const countries = new Set<string>();
    instructors.forEach((i) => {
      if (i.country) countries.add(i.country);
    });
    return Array.from(countries);
  }, [instructors]);

  // Client-side filtering
  const filteredInstructors = useMemo(() => {
    return instructors.filter((item) => {
      // Search by name or email
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        const matchesName = item.name.toLowerCase().includes(query);
        const matchesEmail = item.bankDetails?.email?.toLowerCase().includes(query);
        if (!matchesName && !matchesEmail) return false;
      }

      // Filter by university
      if (universityFilter !== 'all' && item.university !== universityFilter) {
        return false;
      }

      // Filter by country
      if (countryFilter !== 'all' && item.country !== countryFilter) {
        return false;
      }

      return true;
    });
  }, [instructors, searchQuery, universityFilter, countryFilter]);

  // Paginated Slice
  const paginatedInstructors = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredInstructors.slice(start, start + rowsPerPage);
  }, [filteredInstructors, page, rowsPerPage]);

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
      <PayoutKpiCards summary={summary} />

      {/* 4. Filter Bar */}
      <PayoutFilterBar
        searchQuery={searchQuery}
        onSearchChange={(val) => {
          setSearchQuery(val);
          setPage(0);
        }}
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
        availableUniversities={availableUniversities}
        availableCountries={availableCountries}
      />

      {/* 5. Main Instructors Payout Table */}
      <PayoutTable
        items={paginatedInstructors}
        totalCount={filteredInstructors.length}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={setPage}
        onRowsPerPageChange={setRowsPerPage}
      />
    </Box>
  );
}
