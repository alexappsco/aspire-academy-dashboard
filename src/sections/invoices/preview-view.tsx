'use client';

import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CircularProgress from '@mui/material/CircularProgress';
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

import { downloadInvoicePdfAction } from 'src/actions/invoices';
import Iconify from 'src/components/iconify';
import { useToast } from 'src/components/toast';
import { Link } from 'src/i18n/routing';
import { paths } from 'src/routes/paths';
import type { InvoiceItem } from 'src/types/invoice';

interface Props {
  invoice: InvoiceItem;
}

export default function InvoicePreviewView({ invoice }: Props) {
  const t = useTranslations('Invoices');
  const toast = useToast();
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const handleDownloadPdf = async () => {
    try {
      setIsDownloadingPdf(true);
      const res = await downloadInvoicePdfAction(invoice.id);
      if (res.success && res.data?.base64) {
        const byteCharacters = atob(res.data.base64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i += 1) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/pdf' });
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = res.data.fileName || `${invoice.invoiceNumber || 'invoice'}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);

        toast.success(t('preview.download_success'));
      } else {
        toast.error(res.error || t('preview.download_error'));
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('preview.download_error'));
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      if (Number.isNaN(d.getTime())) return dateStr;
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return dateStr;
    }
  };

  const subtotal = invoice.amountBeforeTax ?? 0;
  const tax = invoice.taxAmount ?? 0;
  const discount = invoice.discountAmount ?? 0;
  const total = invoice.total ?? 0;
  const currency = invoice.currencyCode || 'ج.م';
  const issueDate = formatDate(invoice.issuedAt);
  const transactionDate = formatDate(invoice.transactionDate || invoice.issuedAt);

  const customerName = invoice.customer?.name || invoice.studentName || '-';
  const studentNumber = invoice.customer?.studentNumber || invoice.studentId || invoice.userId || '-';
  const customerEmail = invoice.customer?.email || invoice.studentEmail || '-';
  const customerPhone = invoice.customer?.phoneNumber;
  const customerCountry = invoice.customer?.country || invoice.studentCountry;

  const paymentStatus = invoice.payment?.status || invoice.paymentStatus || invoice.status || '-';
  const transactionNumber = invoice.payment?.transactionNumber || invoice.transactionNumber || '-';
  const approvalDate = formatDate(invoice.payment?.approvedAt || invoice.approvalDate || invoice.issuedAt);

  const lines = invoice.lines && invoice.lines.length > 0 ? invoice.lines : null;
  const taxPercent = invoice.taxPercentage ?? invoice.taxRatePercent ?? 14;

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
            onClick={handleDownloadPdf}
            disabled={isDownloadingPdf}
            startIcon={
              isDownloadingPdf ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <Iconify icon="solar:file-download-bold" width={18} />
              )
            }
            sx={{
              borderRadius: 2,
              borderColor: '#E2E8F0',
              color: '#1C252E',
              bgcolor: '#FFFFFF',
              fontWeight: 700,
              fontSize: 13,
              px: 2,
              py: 1,
              gap: 1,
              '& .MuiButton-startIcon': {
                margin: '0 !important',
              },
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
              gap: 1,
              boxShadow: 'none',
              '& .MuiButton-startIcon': {
                margin: '0 !important',
              },
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
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 3,
            mb: 4,
          }}
        >
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
                  {issueDate}
                </Typography>
              </Grid>

              <Grid size="auto">
                <Typography sx={{ fontSize: 11, color: '#94A3B8', fontWeight: 600, mb: 0.25 }}>
                  {t('preview.transaction_date')}
                </Typography>
                <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>
                  {transactionDate}
                </Typography>
              </Grid>
            </Grid>
          </Box>

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
            {customerName}
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, color: '#64748B' }}>
            <Typography sx={{ fontSize: 12.5 }}>
              {t('preview.client_info.student_id')}: {studentNumber}
            </Typography>
            <Typography sx={{ fontSize: 12.5 }}>
              {t('preview.client_info.email')}: {customerEmail}
            </Typography>
            {customerPhone && (
              <Typography sx={{ fontSize: 12.5 }}>
                {t('preview.client_info.phone')}: {customerPhone}
              </Typography>
            )}
            {customerCountry && (
              <Typography sx={{ fontSize: 12.5 }}>
                {t('preview.client_info.country')}: {customerCountry}
              </Typography>
            )}
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
                {lines ? (
                  lines.map((line, idx) => (
                    <TableRow key={idx}>
                      <TableCell sx={{ fontSize: 13, fontWeight: 700, color: '#0F172A', textAlign: 'right', py: 2 }}>
                        {line.description}
                        {line.quantity && line.quantity > 1 ? ` (${line.quantity})` : ''}
                      </TableCell>
                      <TableCell sx={{ fontSize: 13, fontWeight: 600, color: '#0F172A', textAlign: 'center', py: 2 }}>
                        {line.unitPrice.toFixed(2)} {currency}
                      </TableCell>
                      <TableCell sx={{ fontSize: 13, fontWeight: 600, color: '#0F172A', textAlign: 'center', py: 2 }}>
                        {line.taxPercentage}%*
                      </TableCell>
                      <TableCell sx={{ fontSize: 13, fontWeight: 600, color: '#0F172A', textAlign: 'center', py: 2 }}>
                        {line.taxAmount.toFixed(2)}
                      </TableCell>
                      <TableCell sx={{ fontSize: 13, fontWeight: 800, color: '#0F172A', textAlign: 'center', py: 2 }}>
                        {line.total.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell sx={{ fontSize: 13, fontWeight: 700, color: '#0F172A', textAlign: 'right', py: 2 }}>
                      {invoice.serviceDescription || invoice.typeLabel || invoice.type}
                    </TableCell>
                    <TableCell sx={{ fontSize: 13, fontWeight: 600, color: '#0F172A', textAlign: 'center', py: 2 }}>
                      {subtotal.toFixed(2)} {currency}
                    </TableCell>
                    <TableCell sx={{ fontSize: 13, fontWeight: 600, color: '#0F172A', textAlign: 'center', py: 2 }}>
                      {taxPercent}%*
                    </TableCell>
                    <TableCell sx={{ fontSize: 13, fontWeight: 600, color: '#0F172A', textAlign: 'center', py: 2 }}>
                      {tax.toFixed(2)}
                    </TableCell>
                    <TableCell sx={{ fontSize: 13, fontWeight: 800, color: '#0F172A', textAlign: 'center', py: 2 }}>
                      {total.toFixed(2)}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        {/* Bottom Section: Summary Box (Right in RTL) & Payment Info (Left in RTL) */}
        <Grid container spacing={3} sx={{ mb: 5 }}>
          {/* Invoice Summary (Right in RTL) */}
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
                    {subtotal.toFixed(2)} {currency}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography sx={{ fontSize: 12.5, color: '#64748B' }}>
                    {t('preview.summary.discount')}
                  </Typography>
                  <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#0F172A' }}>
                    {discount.toFixed(2)} {currency}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography sx={{ fontSize: 12.5, color: '#64748B' }}>
                    {t('preview.summary.taxable_amount')}
                  </Typography>
                  <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#0F172A' }}>
                    {(subtotal - discount).toFixed(2)} {currency}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography sx={{ fontSize: 12.5, color: '#64748B' }}>
                    {t('preview.summary.tax')} ({taxPercent}%*)
                  </Typography>
                  <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#0F172A' }}>
                    {tax.toFixed(2)} {currency}
                  </Typography>
                </Box>

                <Divider sx={{ my: 1 }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography sx={{ fontSize: 14, fontWeight: 800, color: '#0F172A' }}>
                    {t('preview.summary.grand_total')}
                  </Typography>
                  <Typography sx={{ fontSize: 18, fontWeight: 800, color: '#0284C7' }}>
                    {total.toFixed(2)} {currency}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Grid>

          {/* Spacer */}
          <Grid size={{ xs: 12, md: 2 }} sx={{ display: { xs: 'none', md: 'block' } }} />

          {/* Payment Details (Left in RTL) */}
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
                    {paymentStatus}
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
                    {transactionNumber}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography sx={{ fontSize: 12.5, color: '#64748B' }}>
                    {t('preview.payment_info.approval_date')}:
                  </Typography>
                  <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: '#0F172A' }}>
                    {approvalDate}
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
