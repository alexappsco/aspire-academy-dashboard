'use client';

import React, { useState } from 'react';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Iconify from 'src/components/iconify';
import { useToast } from 'src/components/toast';

interface Props {
  onAccept: () => void;
  onReject: () => void;
}

export default function InstructorDecisionCard({ onAccept, onReject }: Props) {
  const toast = useToast();
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const handleAcceptClick = () => {
    onAccept();
    toast.success('تم قبول الطلب مبدئياً وإحالته للإدارة الأكاديمية لتحديد التسعير المعتمد');
  };

  const handleConfirmReject = () => {
    setRejectDialogOpen(false);
    onReject();
    toast.info('تم تسجيل الاعتذار عن الطلب وإخطار الطالب');
  };

  return (
    <Card
      sx={{
        p: { xs: 2, sm: 2.5, md: 3 },
        borderRadius: 3,
        bgcolor: '#FFFFFF',
        border: '1px solid #F1F5F9',
        boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
        mt: 3,
        textAlign: 'start',
      }}
    >
      {/* Title & Subtitle */}
      <Typography sx={{ fontWeight: 800, fontSize: { xs: 16.5, sm: 18 }, color: '#0F172A', mb: 0.5 }}>
        قرار المحاضر
      </Typography>
      <Typography sx={{ fontSize: { xs: 12, sm: 13 }, color: '#64748B', fontWeight: 500, mb: 3 }}>
        إجراءك ينقل الطلب فوراً إلى منسق الشؤون الأكاديمية لمراجعة التسعير والتواصل مع الطالب.
      </Typography>

      {/* Action Buttons */}
      <Stack spacing={1.75}>
        <Button
          fullWidth
          variant="contained"
          size="large"
          startIcon={<Iconify icon="solar:like-bold" width={20} />}
          onClick={handleAcceptClick}
          sx={{
            py: 1.5,
            borderRadius: 2,
            bgcolor: '#0F172A',
            color: '#FFFFFF',
            fontWeight: 800,
            fontSize: 15,
            boxShadow: 'none',
            '&:hover': {
              bgcolor: '#1E293B',
              boxShadow: 'none',
            },
          }}
        >
          قبول الطلب المبدئي (إلى التسعير الإداري)
        </Button>

        <Button
          fullWidth
          variant="contained"
          size="large"
          startIcon={<Iconify icon="solar:close-circle-bold" width={20} />}
          onClick={() => setRejectDialogOpen(true)}
          sx={{
            py: 1.5,
            borderRadius: 2,
            bgcolor: '#EEF2FF',
            color: '#4338CA',
            fontWeight: 800,
            fontSize: 15,
            boxShadow: 'none',
            '&:hover': {
              bgcolor: '#E0E7FF',
              boxShadow: 'none',
            },
          }}
        >
          الاعتذار عن الطلب
        </Button>
      </Stack>

      {/* Reject Confirmation Dialog */}
      <Dialog
        open={rejectDialogOpen}
        onClose={() => setRejectDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3, p: 1 } } }}
      >
        <DialogTitle sx={{ fontWeight: 800, fontSize: 18, color: '#0F172A', textAlign: 'center' }}>
          الاعتذار عن قبول الطلب
        </DialogTitle>
        <DialogContent sx={{ py: 1 }}>
          <Typography sx={{ color: '#64748B', fontSize: 13.5, mb: 2, textAlign: 'center' }}>
            يرجى توضيح سبب الاعتذار للطالب (اختياري، مثلاً: عدم توفر وقت كافٍ):
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder="سبب الاعتذار..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                fontSize: 13.5,
              },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 2, gap: 1.5 }}>
          <Button
            variant="outlined"
            onClick={() => setRejectDialogOpen(false)}
            sx={{ borderRadius: 2, px: 3, fontWeight: 700 }}
          >
            إلغاء
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleConfirmReject}
            sx={{ borderRadius: 2, px: 3, fontWeight: 700 }}
          >
            تأكيد الاعتذار
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}
