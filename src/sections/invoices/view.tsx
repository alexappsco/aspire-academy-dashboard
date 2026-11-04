'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { useLocale, useTranslations } from 'next-intl';

import { getCurrenciesAction } from 'src/actions/currencies';
import { getInvoicesAction } from 'src/actions/invoices';
import { useToast } from 'src/components/toast';
import { useRouter } from 'src/i18n/routing';
import { paths } from 'src/routes/paths';
import type { InvoiceItem } from 'src/types/invoice';

import InvoicesFilters from './components/invoices-filters';
import InvoicesTable from './components/invoices-table';

export default function InvoicesView() {
  const t = useTranslations('Invoices');
  const router = useRouter();
  const toast = useToast();

  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filters matching backend Swagger parameters
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [type, setType] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [currencyId, setCurrencyId] = useState('');
  const [currencies, setCurrencies] = useState<{ id: string; name: string; code: string }[]>([]);

  // Debounce search (400ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const locale = useLocale();

  // Load currencies lookup for filter
  useEffect(() => {
    let mounted = true;
    getCurrenciesAction({ MaxResultCount: 100 })
      .then((res) => {
        if (mounted && res.success && res.data) {
          const list = (res.data.items || []).map((c) => ({
            id: c.id,
            name: locale === 'ar' ? c.nameAr : c.nameEn,
            code: c.code || c.symbol,
          }));
          setCurrencies(list);
        }
      })
      .catch(() => {});

    return () => {
      mounted = false;
    };
  }, [locale]);

  // Fetch invoices from backend
  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getInvoicesAction({
        Filter: debouncedSearch.trim() || undefined,
        Type: type && type !== 'all' ? type : undefined,
        FromDate: fromDate || undefined,
        ToDate: toDate || undefined,
        CurrencyId: currencyId && currencyId !== 'all' ? currencyId : undefined,
        SkipCount: 0,
        MaxResultCount: 1000,
      });

      if (res.success && res.data) {
        setInvoices(res.data.items || []);
        setTotalCount(res.data.totalCount || 0);
      } else {
        toast.error(res.error || t('table.load_error'));
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('table.load_error'));
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, type, fromDate, toDate, currencyId, t, toast]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const handleViewInvoice = (invoice: InvoiceItem) => {
    router.push(paths.invoices.details(invoice.id));
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* 1. Header (Title and Subtitle in RTL on the Right) */}
      <Box sx={{ mb: 3, textAlign: 'right' }}>
        <Typography sx={{ fontSize: 28, fontWeight: 800, color: '#0F172A', mb: 0.5 }}>
          {t('title')}
        </Typography>
        <Typography sx={{ fontSize: 14, color: '#64748B', fontWeight: 500 }}>
          {t('subtitle')}
        </Typography>
      </Box>

      {/* 2. Filters Bar (Matching Backend Parameters) */}
      <InvoicesFilters
        search={search}
        type={type}
        fromDate={fromDate}
        toDate={toDate}
        currencyId={currencyId}
        currencies={currencies}
        onSearchChange={setSearch}
        onTypeChange={setType}
        onFromDateChange={setFromDate}
        onToDateChange={setToDate}
        onCurrencyChange={setCurrencyId}
      />

      {/* 3. Invoices Shared Table */}
      <InvoicesTable
        invoices={invoices}
        totalCount={totalCount}
        loading={loading}
        onViewInvoice={handleViewInvoice}
      />
    </Container>
  );
}
