'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { useTranslations } from 'next-intl';

import Iconify from 'src/components/iconify';
import { Link } from 'src/i18n/routing';
import { paths } from 'src/routes/paths';
import type { InvoiceItem } from 'src/types/invoice';

interface Props {
  invoice: InvoiceItem;
}

export default function InvoicePreviewView({ invoice }: Props) {
  const t = useTranslations('Invoices');

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {/* Print Stylesheet */}
      <style global jsx>{`
        @media print {
          body {
            background: #ffffff !important;
            color: #000000 !important;
          }
          header,
          nav,
          aside,
          .no-print,
          #header,
          #sidebar {
            display: none !important;
          }
          .printable-card {
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
          }
        }
      `}</style>

      {/* 1. Header with Breadcrumb & Action Buttons */}
      <Box
        className="no-print"
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'flex-start', sm: 'center' },
          justifyContent: 'space-between',
          gap: 2,
          mb: 2.5,
        }}
      >
        {/* Right side in RTL: Title & Breadcrumb */}
        <Box sx={{ textAlign: 'right' }}>
          <Typography sx={{ fontSize: 24, fontWeight: 800, color: '#0F172A', mb: 0.5 }}>
            {t('preview.title')}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <Link
              href={paths.invoices.root}
              style={{
                fontSize: 13,
                color: '#64748B',
                textDecoration: 'none',
                fontWeight: 600,
              }}
            >
              {t('preview.breadcrumb_root')}
            </Link>
            <Typography sx={{ fontSize: 13, color: '#94A3B8' }}>/</Typography>
            <Typography sx={{ fontSize: 13, color: '#0F172A', fontWeight: 700 }}>
              {invoice.invoiceNumber}
            </Typography>
          </Box>
        </Box>

        {/* Left side in RTL: Action Buttons */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Button
            variant="outlined"
            onClick={handlePrint}
            startIcon={<Iconify icon="solar:file-download-bold" width={18} />}
            sx={{
              borderRadius: 2,
              borderColor: '#E2E8F0',
              color: '#1C252E',
              bgcolor: '#FFFFFF',
              fontWeight: 700,
              fontSize: 13,
              px: 2,
              py: 1,
              '&:hover': {
                bgcolor: '#F8FAFC',
                borderColor: '#CBD5E1',
              },
            }}
          >
            {t('preview.download_pdf')}
          </Button>

          <Button
            variant="contained"
            onClick={handlePrint}
            startIcon={<Iconify icon="solar:printer-minimalistic-bold" width={18} />}
            sx={{
              borderRadius: 2,
              bgcolor: '#1C252E',
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: 13,
              px: 2,
              py: 1,
              boxShadow: 'none',
              '&:hover': {
                bgcolor: '#0F172A',
                boxShadow: 'none',
              },
            }}
          >
            {t('preview.print')}
          </Button>
        </Box>
      </Box>

      {/* 2. Advisory / Warning Banner */}
      <Box
        className="no-print"
        sx={{
          p: 1.75,
          mb: 3,
          borderRadius: 2,
          bgcolor: '#FFFBEB',
          border: '1px solid #FDE68A',
          color: '#92400E',
          fontSize: 13,
          fontWeight: 600,
          textAlign: 'right',
        }}
      >
        {t('preview.warning_banner')}
      </Box>

      {/* 3. The Tax Invoice White Paper Card */}
      <Card
        className="printable-card"
        sx={{
          p: { xs: 3, md: 5 },
          borderRadius: 3,
          border: '1px solid #E2E8F0',
          boxShadow: '0 4px 20px rgba(15, 23, 42, 0.04)',
          bgcolor: '#FFFFFF',
        }}
      >
        {/* Invoice Top Section */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column-reverse', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 3,
            mb: 4,
          }}
        >
          {/* Left in RTL: Brand Logo & Subtitle */}
          <Box sx={{ textAlign: { xs: 'right', sm: 'left' } }}>
            <Box
              component="img"
              src="/logo.svg"
              alt="Aspire Academy"
              sx={{ height: 48, width: 'auto', mb: 0.5 }}
            />
            <Typography sx={{ fontSize: 12, color: '#64748B', fontWeight: 600 }}>
              {t('preview.platform_name')}
            </Typography>
          </Box>

          {/* Right in RTL: Invoice Title & Meta Details */}
          <Box sx={{ textAlign: 'right' }}>
            <Typography sx={{ fontSize: 26, fontWeight: 800, color: '#0F172A', lineHeight: 1.1 }}>
              {t('preview.invoice_title')}
            </Typography>
            <Typography
              sx={{
                fontSize: 11,
                fontWeight: 700,
                color: '#64748B',
                letterSpacing: 1.5,
                mb: 2.5,
              }}
            >
              {t('preview.invoice_title_en')}
            </Typography>

            <Grid container spacing={3} sx={{ textAlign: 'right' }}>
              <Grid size="auto">
                <Typography sx={{ fontSize: 11, color: '#94A3B8', fontWeight: 600, mb: 0.25 }}>
                  {t('preview.invoice_number')}
                </Typography>
                <Typography
                  sx={{
                    fontSize: 14,
                    fontWeight: 800,
                    color: '#0F172A',
                    fontFamily: 'monospace, sans-serif',
                  }}
                >
                  {invoice.invoiceNumber}
                </Typography>
              </Grid>

              <Grid size="auto">
                <Typography sx={{ fontSize: 11, color: '#94A3B8', fontWeight: 600, mb: 0.25 }}>
                  {t('preview.issue_date')}
                </Typography>
                <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>
                  {invoice.date}
                </Typography>
              </Grid>

              <Grid size="auto">
                <Typography sx={{ fontSize: 11, color: '#94A3B8', fontWeight: 600, mb: 0.25 }}>
                  {t('preview.transaction_date')}
                </Typography>
                <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>
                  {invoice.date}
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </Box>

        {/* Client Details Box (Right Aligned in RTL) */}
        <Box
          sx={{
            p: 2.5,
            mb: 4,
            borderRadius: 2,
            bgcolor: '#F8FAFC',
            border: '1px solid #E2E8F0',
            textAlign: 'right',
          }}
        >
          <Typography sx={{ fontSize: 12, color: '#64748B', fontWeight: 700, mb: 1 }}>
            {t('preview.client_info.title')}
          </Typography>
          <Typography sx={{ fontSize: 16, fontWeight: 800, color: '#0F172A', mb: 0.75 }}>
            {invoice.studentName}
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, color: '#64748B' }}>
            <Typography sx={{ fontSize: 12.5 }}>
              {t('preview.client_info.student_id')}: {invoice.studentId}
            </Typography>
            <Typography sx={{ fontSize: 12.5 }}>
              {t('preview.client_info.email')}: {invoice.studentEmail}
            </Typography>
            <Typography sx={{ fontSize: 12.5 }}>
              {t('preview.client_info.country')}: {invoice.studentCountry}
            </Typography>
          </Box>
        </Box>

        {/* Service Details Table */}
        <Box sx={{ mb: 4 }}>
          <Typography sx={{ fontSize: 15, fontWeight: 800, color: '#0F172A', mb: 1.5, textAlign: 'right' }}>
            {t('preview.service_details.title')}
          </Typography>

          <TableContainer
            sx={{
              borderRadius: 2,
              border: '1px solid #E2E8F0',
              overflow: 'hidden',
            }}
          >
            <Table size="small">
              <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                <TableRow>
                  <TableCell
                    sx={{
                      fontWeight: 700,
                      fontSize: 12.5,
                      color: '#475569',
                      textAlign: 'right',
                      py: 1.5,
                    }}
                  >
                    {t('preview.service_details.description')}
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 700,
                      fontSize: 12.5,
                      color: '#475569',
                      textAlign: 'center',
                      py: 1.5,
                    }}
                  >
                    {t('preview.service_details.price')}
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 700,
                      fontSize: 12.5,
                      color: '#475569',
                      textAlign: 'center',
                      py: 1.5,
                    }}
                  >
                    {t('preview.service_details.tax_rate')}
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 700,
                      fontSize: 12.5,
                      color: '#475569',
                      textAlign: 'center',
                      py: 1.5,
                    }}
                  >
                    {t('preview.service_details.tax_amount')}
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 700,
                      fontSize: 12.5,
                      color: '#475569',
                      textAlign: 'center',
                      py: 1.5,
                    }}
                  >
                    {t('preview.service_details.total')}
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                <TableRow>
                  <TableCell sx={{ fontSize: 13, fontWeight: 700, color: '#0F172A', textAlign: 'right', py: 2 }}>
                    {invoice.serviceDescription}
                  </TableCell>
                  <TableCell sx={{ fontSize: 13, fontWeight: 600, color: '#0F172A', textAlign: 'center', py: 2 }}>
                    {invoice.subtotal.toFixed(2)} {invoice.currency}
                  </TableCell>
                  <TableCell sx={{ fontSize: 13, fontWeight: 600, color: '#0F172A', textAlign: 'center', py: 2 }}>
                    {invoice.taxRatePercent}%*
                  </TableCell>
                  <TableCell sx={{ fontSize: 13, fontWeight: 600, color: '#0F172A', textAlign: 'center', py: 2 }}>
                    {invoice.tax.toFixed(2)}
                  </TableCell>
                  <TableCell sx={{ fontSize: 13, fontWeight: 800, color: '#0F172A', textAlign: 'center', py: 2 }}>
                    {invoice.total.toFixed(2)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        {/* Bottom Section: Payment Info (Right in RTL) & Summary Box (Left in RTL) */}
        <Grid container spacing={3} sx={{ mb: 5 }}>
          {/* Payment Details (Right in RTL) */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Box
              sx={{
                p: 2.5,
                borderRadius: 2,
                bgcolor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                height: '100%',
                textAlign: 'right',
              }}
            >
              <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#0F172A', mb: 2 }}>
                {t('preview.payment_info.title')}
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography sx={{ fontSize: 12.5, color: '#64748B' }}>
                    {t('preview.payment_info.status')}:
                  </Typography>
                  <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: '#0F172A' }}>
                    {invoice.paymentStatus}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography sx={{ fontSize: 12.5, color: '#64748B' }}>
                    {t('preview.payment_info.transaction_id')}:
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: 12.5,
                      fontWeight: 700,
                      color: '#0F172A',
                      fontFamily: 'monospace, sans-serif',
                    }}
                  >
                    {invoice.transactionNumber}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography sx={{ fontSize: 12.5, color: '#64748B' }}>
                    {t('preview.payment_info.approval_date')}:
                  </Typography>
                  <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: '#0F172A' }}>
                    {invoice.approvalDate}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Grid>

          {/* Spacer */}
          <Grid size={{ xs: 12, md: 2 }} sx={{ display: { xs: 'none', md: 'block' } }} />

          {/* Invoice Summary (Left in RTL) */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Box
              sx={{
                p: 2.5,
                borderRadius: 2,
                border: '1px solid #E2E8F0',
                height: '100%',
                textAlign: 'right',
              }}
            >
              <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#0F172A', mb: 2 }}>
                {t('preview.summary.title')}
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography sx={{ fontSize: 12.5, color: '#64748B' }}>
                    {t('preview.summary.subtotal')}
                  </Typography>
                  <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#0F172A' }}>
                    {invoice.subtotal.toFixed(2)} {invoice.currency}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography sx={{ fontSize: 12.5, color: '#64748B' }}>
                    {t('preview.summary.discount')}
                  </Typography>
                  <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#0F172A' }}>
                    {invoice.discount.toFixed(2)} {invoice.currency}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography sx={{ fontSize: 12.5, color: '#64748B' }}>
                    {t('preview.summary.taxable_amount')}
                  </Typography>
                  <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#0F172A' }}>
                    {invoice.subtotal.toFixed(2)} {invoice.currency}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography sx={{ fontSize: 12.5, color: '#64748B' }}>
                    {t('preview.summary.tax')}
                  </Typography>
                  <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#0F172A' }}>
                    {invoice.tax.toFixed(2)} {invoice.currency}
                  </Typography>
                </Box>

                <Divider sx={{ my: 1 }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography sx={{ fontSize: 14, fontWeight: 800, color: '#0F172A' }}>
                    {t('preview.summary.grand_total')}
                  </Typography>
                  <Typography sx={{ fontSize: 18, fontWeight: 800, color: '#0284C7' }}>
                    {invoice.total.toFixed(2)} {invoice.currency}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Grid>
        </Grid>

        {/* Invoice Footer Section */}
        <Box sx={{ textAlign: 'center', pt: 2 }}>
          <Typography sx={{ fontSize: 16, fontWeight: 800, color: '#0F172A', mb: 0.75 }}>
            {t('preview.footer.thank_you')}
          </Typography>
          <Typography sx={{ fontSize: 12, color: '#94A3B8', maxWidth: 600, mx: 'auto', mb: 3 }}>
            {t('preview.footer.notice')}
          </Typography>

          <Divider sx={{ mb: 2, borderColor: '#F1F5F9' }} />

          <Typography sx={{ fontSize: 11, color: '#CBD5E1', mb: 0.5 }}>
            {t('preview.footer.platform')}
          </Typography>
          <Typography sx={{ fontSize: 11, color: '#CBD5E1' }}>
            {t('preview.footer.tax_footnote')}
          </Typography>
        </Box>
      </Card>
    </Container>
  );
}
