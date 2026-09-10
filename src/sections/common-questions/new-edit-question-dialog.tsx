'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import Iconify from 'src/components/iconify';
import { useToast } from 'src/components/toast';
import { createFaq, updateFaq } from 'src/actions/faqs';
import type { FaqItem } from 'src/types/faq';

interface QuestionFormDialogProps {
  open: boolean;
  onClose: () => void;
  initialData?: FaqItem | null;
  onSaved?: () => void;
}

export default function QuestionFormDialog({
  open,
  onClose,
  initialData,
  onSaved,
}: QuestionFormDialogProps) {
  const t = useTranslations('CommonQuestions');
  const toast = useToast();
  const isEdit = !!initialData;

  const [questionAr, setQuestionAr] = useState(initialData?.questionAr ?? '');
  const [questionEn, setQuestionEn] = useState(initialData?.questionEn ?? '');
  const [answerAr, setAnswerAr] = useState(initialData?.answerAr ?? '');
  const [answerEn, setAnswerEn] = useState(initialData?.answerEn ?? '');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const payload = { questionAr, questionEn, answerAr, answerEn };

      const res = isEdit && initialData
        ? await updateFaq(initialData.id, payload)
        : await createFaq(payload);

      if (res.success) {
        toast.success(isEdit ? t('messages.updated') : t('messages.created'));
        onSaved?.();
        onClose();
      } else {
        toast.error(res.error || 'Failed to save');
      }
    } catch {
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      slotProps={{ paper: { sx: { borderRadius: 3, p: 1 } } }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
        <IconButton onClick={onClose} size="small">
          <Iconify icon="ic:round-close" sx={{ color: '#64748B', width: 20, height: 20 }} />
        </IconButton>
      </Box>

      <DialogContent sx={{ pt: 0, px: 3, pb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#1E293B', mb: 4, fontSize: 22 }}>
          {isEdit ? t('dialog.edit_title') : t('dialog.add_title')}
        </Typography>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, mb: 4 }}>
          <TextField
            fullWidth
            label={t('dialog.question_ar')}
            placeholder={t('dialog.question_ar_placeholder')}
            value={questionAr}
            onChange={(e) => setQuestionAr(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, height: '56px' } }}
          />

          <TextField
            fullWidth
            label={t('dialog.question_en')}
            placeholder={t('dialog.question_en_placeholder')}
            value={questionEn}
            onChange={(e) => setQuestionEn(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, height: '56px' } }}
          />

          <TextField
            fullWidth
            multiline
            rows={4}
            label={t('dialog.answer_ar')}
            placeholder={t('dialog.answer_ar_placeholder')}
            value={answerAr}
            onChange={(e) => setAnswerAr(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />

          <TextField
            fullWidth
            multiline
            rows={4}
            label={t('dialog.answer_en')}
            placeholder={t('dialog.answer_en_placeholder')}
            value={answerEn}
            onChange={(e) => setAnswerEn(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'flex-start' }}>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={saving}
            sx={{
              bgcolor: '#1E293B',
              color: '#FFFFFF',
              borderRadius: 1.5,
              px: 4,
              py: 1,
              fontWeight: 600,
              fontSize: 15,
              '&:hover': { bgcolor: '#0F172A' },
            }}
          >
            {saving ? t('dialog.saving') : t('dialog.save')}
          </Button>

          <Button
            variant="outlined"
            onClick={onClose}
            sx={{
              borderColor: '#CBD5E1',
              color: '#1E293B',
              borderRadius: 1.5,
              px: 4,
              py: 1,
              fontWeight: 600,
              fontSize: 15,
              '&:hover': { borderColor: '#94A3B8', bgcolor: '#F8FAFC' },
            }}
          >
            {t('dialog.cancel')}
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
}