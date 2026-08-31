'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormLabel from '@mui/material/FormLabel';
import IconButton from '@mui/material/IconButton';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import Iconify from 'src/components/iconify';

import { QuestionItem } from './_mock';

interface QuestionFormDialogProps {
  open: boolean;
  onClose: () => void;
  initialData?: QuestionItem | null;
  onSave: (data: Partial<QuestionItem>) => void;
}

export default function QuestionFormDialog({
  open,
  onClose,
  initialData,
  onSave,
}: QuestionFormDialogProps) {
  const t = useTranslations('CommonQuestions');
  const isEdit = !!initialData;

  const [questionAr, setQuestionAr] = useState(initialData?.question_ar ?? '');
  const [questionEn, setQuestionEn] = useState(initialData?.question_en ?? '');
  const [answerAr, setAnswerAr] = useState(initialData?.answer_ar ?? '');
  const [answerEn, setAnswerEn] = useState(initialData?.answer_en ?? '');
  const [active, setActive] = useState(initialData?.active ?? true);

  const handleSubmit = () => {
    onSave({
      question_ar: questionAr,
      question_en: questionEn,
      answer_ar: answerAr,
      answer_en: answerEn,
      active,
    });
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      slotProps={{
        paper: { sx: { borderRadius: 3, p: 1 } },
      }}
    >
      {/* Header with close button */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
        <IconButton onClick={onClose} size="small">
          <Iconify icon="ic:round-close" sx={{ color: '#64748B', width: 20, height: 20 }} />
        </IconButton>
      </Box>

      <DialogContent sx={{ pt: 0, px: 3, pb: 3 }}>
        {/* Title */}
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#1E293B', mb: 4, fontSize: 22 }}>
          {isEdit ? t('dialog.edit_title') : t('dialog.add_title')}
        </Typography>

        {/* Form Inputs Grid */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3, mb: 4 }}>
          {/* Question Arabic */}
          <TextField
            fullWidth
            label={t('dialog.question_ar')}
            placeholder={t('dialog.question_ar_placeholder')}
            value={questionAr}
            onChange={(e) => setQuestionAr(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
            sx={{
              '& .MuiOutlinedInput-root': { borderRadius: 2, height: '56px' },
            }}
          />

          {/* Question English */}
          <TextField
            fullWidth
            label={t('dialog.question_en')}
            placeholder={t('dialog.question_en_placeholder')}
            value={questionEn}
            onChange={(e) => setQuestionEn(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
            sx={{
              '& .MuiOutlinedInput-root': { borderRadius: 2, height: '56px' },
            }}
          />

          {/* Answer Arabic */}
          <TextField
            fullWidth
            multiline
            rows={4}
            label={t('dialog.answer_ar')}
            placeholder={t('dialog.answer_ar_placeholder')}
            value={answerAr}
            onChange={(e) => setAnswerAr(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
            sx={{
              '& .MuiOutlinedInput-root': { borderRadius: 2 },
            }}
          />

          {/* Answer English */}
          <TextField
            fullWidth
            multiline
            rows={4}
            label={t('dialog.answer_en')}
            placeholder={t('dialog.answer_en_placeholder')}
            value={answerEn}
            onChange={(e) => setAnswerEn(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
            sx={{
              '& .MuiOutlinedInput-root': { borderRadius: 2 },
            }}
          />
        </Box>

        {/* Radio Status Row */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mb: 4 }}>
          <FormControl component="fieldset">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <FormLabel component="legend" sx={{ fontWeight: 700, color: '#1E293B', fontSize: 15 }}>
                {t('dialog.status')}
              </FormLabel>
              <RadioGroup
                row
                value={active ? 'active' : 'inactive'}
                onChange={(e) => setActive(e.target.value === 'active')}
              >
                <FormControlLabel
                  value="active"
                  control={<Radio sx={{ color: '#94A3B8', '&.Mui-checked': { color: '#00A76F' } }} />}
                  label={t('status.active')}
                  sx={{ color: '#1E293B', fontWeight: 600 }}
                />
                <FormControlLabel
                  value="inactive"
                  control={<Radio sx={{ color: '#94A3B8', '&.Mui-checked': { color: '#00A76F' } }} />}
                  label={t('status.inactive')}
                  sx={{ color: '#1E293B', fontWeight: 600 }}
                />
              </RadioGroup>
            </Box>
          </FormControl>
        </Box>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'flex-start' }}>
          <Button
            variant="contained"
            onClick={handleSubmit}
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
            {t('dialog.save')}
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
