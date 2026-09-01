'use client';

import { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Card,
  Chip,
  Dialog,
  DialogContent,
  FormControl,
  IconButton,
  MenuItem,
  Select,
  Typography,
} from '@mui/material';
import { useRouter } from 'src/i18n/routing';
import Iconify from 'src/components/iconify';
import { MOCK_TICKETS } from './_mock';
import { STATUS_STYLES } from './constants';
import type { SupportTicketStatus } from './types';

type SupportDetailsViewProps = {
  ticketId: string;
};

const STATUS_OPTIONS: { value: SupportTicketStatus; label: string }[] = [
  { value: 'pending', label: 'جديد' },
  { value: 'replied', label: 'تم الرد' },
];

const senderInfo = [
  { label: 'الاسم', key: 'senderName', fallback: 'على محمود' },
  { label: 'نوع المرسل', key: 'senderType', fallback: 'طالب' },
  { label: 'رقم الهاتف', key: 'senderPhone', fallback: '+96513325599' },
  { label: 'البريد الالكتروني', key: 'senderEmail', fallback: 'Ali@gmail.com' },
  { label: 'تاريخ الارسال', key: 'requestDate', fallback: '2025-06-15' },
] as const;

export default function SupportDetailsView({ ticketId }: SupportDetailsViewProps) {
  const router = useRouter();
  const ticket = useMemo(
    () => MOCK_TICKETS.find((item) => item.id === ticketId) ?? MOCK_TICKETS[0],
    [ticketId]
  );
  const [status, setStatus] = useState<SupportTicketStatus>(ticket.status);
  const [draftStatus, setDraftStatus] = useState<SupportTicketStatus>(ticket.status);
  const [openStatusDialog, setOpenStatusDialog] = useState(false);

  const statusStyle = STATUS_STYLES[status];
  const statusLabel = status === 'pending' ? 'جديد' : statusStyle.label;

  const handleOpenStatusDialog = () => {
    setDraftStatus(status);
    setOpenStatusDialog(true);
  };

  const handleUpdateStatus = () => {
    setStatus(draftStatus);
    setOpenStatusDialog(false);
  };

  return (
    <Box sx={{ direction: 'rtl', textAlign: 'right' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 4 }}>
        <IconButton
          aria-label="رجوع"
          onClick={() => router.back()}
          sx={{
            width: 42,
            height: 42,
            borderRadius: '10px',
            bgcolor: '#F8FAFC',
            border: '1px solid #E2E8F0',
            color: '#1E293B',
            '&:hover': { bgcolor: '#F1F5F9' },
          }}
        >
          <Iconify icon="solar:arrow-right-linear" width={22} />
        </IconButton>
        <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F172A' }}>
          الدعم الفني
        </Typography>
      </Box>

      <Card
        sx={{
          mb: 3,
          p: { xs: 2.5, sm: 3 },
          bgcolor: '#fff',
          border: '1px solid #E2E8F0',
          borderRadius: '16px',
          boxShadow: 'none',
        }}
      >
        <Typography sx={{ fontSize: 18, fontWeight: 800, color: '#0F172A', pb: 2 }}>
          معلومات الراسل
        </Typography>
        <Box sx={{ borderTop: '1px solid #E2E8F0', pt: 2.5 }}>
          <Box sx={{ display: 'grid', gap: 2.5 }}>
            {senderInfo.map((item) => (
              <Box key={item.key}>
                <Typography sx={{ color: '#64748B', fontSize: 14, fontWeight: 600, mb: 0.75 }}>
                  {item.label}
                </Typography>
                <Typography sx={{ color: '#0F172A', fontSize: 16, fontWeight: 700 }}>
                  {String(ticket[item.key] ?? item.fallback)}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Card>

      <Card
        sx={{
          p: { xs: 2.5, sm: 3 },
          bgcolor: '#fff',
          border: '1px solid #E2E8F0',
          borderRadius: '16px',
          boxShadow: 'none',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: { xs: 'stretch', sm: 'center' },
            justifyContent: 'space-between',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 2,
            pb: 2,
          }}
        >
          <Typography sx={{ fontSize: 18, fontWeight: 800, color: '#0F172A' }}>
            تفاصيل الشكوى
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Chip
              label={statusLabel}
              sx={{
                height: 34,
                px: 1,
                borderRadius: '20px',
                bgcolor: status === 'pending' ? '#FFF8E7' : statusStyle.bgcolor,
                color: status === 'pending' ? '#B77903' : statusStyle.color,
                fontWeight: 700,
              }}
            />
            <Button
              variant="contained"
              onClick={handleOpenStatusDialog}
              sx={{
                height: 40,
                px: 2.5,
                bgcolor: '#1E293B',
                color: '#fff',
                borderRadius: '8px',
                fontWeight: 700,
                boxShadow: 'none',
                textTransform: 'none',
                '&:hover': { bgcolor: '#0F172A', boxShadow: 'none' },
              }}
            >
              تغيير الحالة
            </Button>
          </Box>
        </Box>

        <Box sx={{ borderTop: '1px solid #E2E8F0', pt: 2.5 }}>
          <Typography sx={{ color: '#0F172A', fontSize: 16, fontWeight: 800, mb: 1.5 }}>
            محتوى الرسالة
          </Typography>
          <Typography
            sx={{
              color: '#334155',
              fontSize: 15,
              lineHeight: 1.9,
              whiteSpace: 'pre-wrap',
            }}
          >
            {ticket.description}
          </Typography>
        </Box>
      </Card>

      <Dialog
        open={openStatusDialog}
        onClose={() => setOpenStatusDialog(false)}
        maxWidth="xs"
        fullWidth
        disableScrollLock
        slotProps={{
          backdrop: {
            sx: { bgcolor: 'rgba(0, 0, 0, 0.4)' },
          },
          paper: {
            sx: {
              borderRadius: '24px',
              boxShadow: '0 24px 64px rgba(15, 23, 42, 0.18)',
            },
          },
        }}
      >
        <DialogContent sx={{ p: { xs: 3, sm: 4 }, direction: 'rtl' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Typography sx={{ fontSize: 20, fontWeight: 800, color: '#0F172A' }}>
              تغيير حالة الشكوى
            </Typography>
            <IconButton
              onClick={() => setOpenStatusDialog(false)}
              sx={{ color: '#64748B', width: 40, height: 40, borderRadius: '10px' }}
            >
              <Iconify icon="mingcute:close-line" width={22} />
            </IconButton>
          </Box>

          <FormControl fullWidth sx={{ mb: 3 }}>
            <Typography sx={{ color: '#0F172A', fontSize: 14, fontWeight: 700, mb: 1 }}>
              حالة الشكوى الجديدة
            </Typography>
            <Select
              value={draftStatus}
              onChange={(event) => setDraftStatus(event.target.value as SupportTicketStatus)}
              sx={{
                height: 48,
                bgcolor: '#F1F5F9',
                borderRadius: '10px',
                textAlign: 'right',
                '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                '& .MuiSelect-icon': { left: 12, right: 'auto' },
              }}
            >
              {STATUS_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box sx={{ display: 'flex', justifyContent: 'flex-start', gap: 1.5 }}>
            <Button
              variant="contained"
              onClick={handleUpdateStatus}
              sx={{
                height: 42,
                px: 3,
                bgcolor: '#1E293B',
                borderRadius: '8px',
                fontWeight: 700,
                boxShadow: 'none',
                textTransform: 'none',
                '&:hover': { bgcolor: '#0F172A', boxShadow: 'none' },
              }}
            >
              تحديث الحالة
            </Button>
            <Button
              variant="outlined"
              onClick={() => setOpenStatusDialog(false)}
              sx={{
                height: 42,
                px: 3,
                bgcolor: '#fff',
                borderColor: '#FF5B5B',
                color: '#FF5B5B',
                borderRadius: '8px',
                fontWeight: 700,
                textTransform: 'none',
                '&:hover': { borderColor: '#FF5B5B', bgcolor: '#FFF5F5' },
              }}
            >
              إلغاء
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
